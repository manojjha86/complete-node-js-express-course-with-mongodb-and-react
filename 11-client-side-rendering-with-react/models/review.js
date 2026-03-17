const mongoose = require('mongoose');
const Hotel = require('./../models/hotel');

const reviewSchema = new mongoose.Schema({
    ratings: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'Hotel',
        required: true
    }
}, { timestamps: true });

reviewSchema.index({ hotel: 1, user: 1}, { unique: true});

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'firstname lastname photo'
    })
    next()
});

reviewSchema.statics.calcAverageRatings = async function (hotelId) {
    const reviewStats = await this.aggregate([
        { $match: { hotel: hotelId } },
        {
            $group: {
                _id: '$hotel',
                count: { $sum: 1 },
                avgRating: { $avg: '$ratings' }
            }
        }
    ])

    console.log(reviewStats);

    if (reviewStats.length > 0) {
        await Hotel.findByIdAndUpdate(
            hotelId,
            {
                avgRating: reviewStats[0].avgRating,
                reviewCount: reviewStats[0].count
            }
        )
    }else {
        await Hotel.findByIdAndUpdate(
            hotelId,
            {
                avgRating: 3,
                reviewCount: 0
            }
        )
    }
}

reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.hotel);
})

reviewSchema.post(/^findOneAnd/, async function (doc, next) {
    if(!doc) return next(); //If no document was found for update / delete

    await doc.constructor.calcAverageRatings(doc.hotel)
    next();
})

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;