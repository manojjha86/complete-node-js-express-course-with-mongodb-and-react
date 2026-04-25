const mongoose = require('mongoose');
const Hotel = require('./hotel');

const roomSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    maxPerson: {
        type: Number,
        required: true
    },
    roomNumbers: {
        type: [Number],
        required: true
    },
    image: {
        type: String
    }
})

roomSchema.statics.calcCheapestPrice = async function(hotelId){
    const hotel = await Hotel.findById(
        hotelId
    ).select('rooms').lean();

    console.log(hotel);

    if(!hotel) return;

    if(!hotel.rooms || hotel.rooms.length === 0){
        await Hotel.findByIdAndUpdate(hotelId, { cheapestPrice: 120 });
        return;
    }

    const stats = await this.aggregate([
        {$match: { _id: { $in: hotel.rooms }}},
        { $group: { 
            _id: null,
            minPrice: { $min: '$price' }
        }}
    ])

    console.log(stats);

    await Hotel.findByIdAndUpdate(
        hotelId,
        { cheapestPrice: stats[0].minPrice }
    )
}

module.exports = mongoose.model('Room', roomSchema);