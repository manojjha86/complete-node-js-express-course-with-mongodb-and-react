const mongoose = require('mongoose');
const fs = require('fs');
const { match } = require('assert');

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hotel name is required'],
        trim: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Hotel description is required'],
        trim: true,
    },
    type: { //'Hotel', 'Resort', 'Apartment', 'Villa', 'Cabin'
        type: String,
        required: [true, 'Hotel type is required'],
        enum: {
            values: ['hotel', 'resort', 'apartment', 'villa', 'cabin'],
            message: 'The provided hotel type is not valid'
        }
    },
    category: {
        type: [String],
        required: true
    },
    city: {
        type: String,
        required: [true, 'Hotel city is required']
    },
    country: {
        type: String,
        required: [true, 'Hotel country is required']
    },
    address: {
        addressLine1: {
            type: String,
            required: [true, 'Address Line 1 is a required field.'],
            maxLength: 100
        },
        addressLine2: {
            type: String,
            maxLength: 100
        },
        landmark: String,
        zipCode: { type: String, required: [true, 'ZIP Code is a required field.'] },
        location: {
            type: { type: String, default: 'Point', enum: ['Point'] },
            coordinates: [Number]
        }
    },
    distance: {
        type: String,
        required: [true, 'Hotel distance from airport is required'],
    },
    images: {
        type: [String]
    },
    avgRating: {
        type: Number,
        min: [0, 'Ratings cannot be less than 0'],
        max: [5, 'Ratings cannot be more than 5'],
        default: 3
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    rooms: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Room'
        }
    ],
    cheapestPrice: {
        type: Number,
        required: true,
        default: 120
    },
    featured: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdBy: String,
    ammenities: {
        swimmingPool: {
            type: Boolean,
            default: false
        },
        gym: {
            type: Boolean,
            default: false
        },
        powerBackup: {
            type: Boolean,
            default: false
        },
        freeWifi: {
            type: Boolean,
            default: false
        },
        miniBar: {
            type: Boolean,
            default: false
        },
        roomService: {
            type: Boolean,
            default: false
        },
        elevator: {
            type: Boolean,
            default: false
        },
        kidsPlayArea: {
            type: Boolean,
            default: false
        },
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })

// hotelSchema.virtual('isPremium').get(function () {
//     return this.cheapestPrice >= 500
// })

hotelSchema.index({ cheapestPrice: 1, avgRating: -1});

hotelSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'hotel',
    localField: '_id'
})

hotelSchema.pre('save', function (next) {
    if (this.cheapestPrice < 1) {
        throw new Error('Price of a Hotel cannot be less than 100');
    }
    next();
})

hotelSchema.post('save', function (doc, next) {
    const content = `${new Date()}: A new Hotel document with name '${doc.name}' is created by: '${doc.createdBy}'.\n`;

    fs.writeFileSync('./logs/log.txt', content, { flag: 'a' }, (error) => {
        console.log(error.message);
    })
    next();
});

hotelSchema.pre('find', function (next) {
    this.find({ isDeleted: false });
    next();
})

hotelSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.cheapestPrice && update.cheapestPrice < 1) {
        throw new Error('Price of a Hotel cannot be zeo or negative value');
    }
    next();
});

hotelSchema.post('findOneAndUpdate', function (doc, next) {
    const content = `${new Date()}: A Hotel document with name '${doc?.name}' is update by: '${doc?.createdBy}'.\n`;

    fs.writeFileSync('./logs/log.txt', content, { flag: 'a' }, (error) => {
        console.log(error.message);
    })
    next();
});

hotelSchema.pre('aggregate', function (next) {
    this.pipeline().unshift(
        { $match: { isDeleted: false } }
    );
    next();
})

hotelSchema.post('aggregate', function (result, next) {
    console.log(result);
    next();
})

module.exports = mongoose.model('Hotel', hotelSchema);