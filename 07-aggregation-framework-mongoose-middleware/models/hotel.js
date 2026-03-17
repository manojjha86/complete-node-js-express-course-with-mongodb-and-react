const mongoose = require('mongoose');
const fs = require('fs');
const { match } = require('assert');

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hotel name is required'],
        trim: true,
        lowercase: true,
        trim: true
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
            values: ['Hotel', 'Resort', 'Apartment', 'Villa', 'Cabin'],
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
    address: {
        type: String,
        required: [true, 'Hotel address is required']
    },
    distance: {
        type: String,
        required: [true, 'Hotel distance from airport is required'],
    },
    images: {
        type: [String]
    },
    ratings: {
        type: Number,
        min: 0,
        max: 5
    },
    rooms: {
        type: [String]
    },
    cheapestPrice: {
        type: Number,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdBy: String
}, 
{
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
})

hotelSchema.virtual('isPremium').get(function(){
    return this.cheapestPrice >= 500
})

//.save(), .create()
// Not work for - insertOne(), insertMany()
hotelSchema.pre('save', function(next){
    this.createdBy = 'Jha, Manoj';
    next();
})
hotelSchema.pre('save', function(next){
    if(this.cheapestPrice < 100){
        throw new Error('Price of a Hotel cannot be less than 100');
    }
    next();
})

hotelSchema.post('save', function(doc, next){
    const content = `${new Date()}: A new Hotel document with name '${doc.name}' is created by: '${doc.createdBy}'.\n`;

    fs.writeFileSync('./logs/log.txt', content, { flag: 'a'}, (error) => {
        console.log(error.message);
    })
    next();
});

hotelSchema.pre('find', function(next){
    this.find({ isDeleted: false});
    next();
})

hotelSchema.pre('findOneAndUpdate', function(next){
    const update = this.getUpdate();
    if(update.cheapestPrice && update.cheapestPrice < 100){
        throw new Error('Price of a Hotel cannot be less than 100');
    }
    next();
});

hotelSchema.post('findOneAndUpdate', function(doc, next){
    const content = `${new Date()}: A Hotel document with name '${doc.name}' is update by: '${doc.createdBy}'.\n`;

    fs.writeFileSync('./logs/log.txt', content, { flag: 'a'}, (error) => {
        console.log(error.message);
    })
    next();
});

hotelSchema.pre('aggregate', function(next){
    this.pipeline().unshift(
        { $match: { isDeleted: false}}
    );
    next();
})

hotelSchema.post('aggregate', function(result, next){
    console.log(result);
    next();
})

module.exports = mongoose.model('Hotel', hotelSchema);