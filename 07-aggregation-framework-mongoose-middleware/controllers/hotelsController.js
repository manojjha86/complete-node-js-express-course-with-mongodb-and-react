const ApiFeatures = require('./../utilities/features');

const Hotel = require('./../models/hotel.js');


exports.getAll = async (req, res) => {
    const features = new ApiFeatures(Hotel.find(), req.query);

    try{
        const query = features.filter().sort().limitFields().paginate().queryObj;
        
        const hotels = await query;

        res.status(200).json({
            status: 'success',
            count: hotels.length,
            data: {
                hotels
            }
        })
    }catch(error){
        res.status(500).json({
            status: 'fail',
            message: 'Something went wrong. Please try again later. Error: ' + error.message
        })
    }
}

exports.create = async (req, res) => {
    try{
        // const hotel = new Hotel(req.body);
        // const newHotel = await hotel.save();
        const hotel = await Hotel.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                hotel
            }
        })
    }catch(error){
        res.status(500).json({
            status: 'fail',
            message: 'Something went wrong. Please try again later.' + error.message
        })
    }
}

exports.getById = async (req, res) => {
    try{
        const id = req.params.id;

        const hotel = await Hotel.findById(id);

        res.status(200).json({
            status: 'success',
            data: {
                hotel
            }
        })
    }catch(error){
        res.status(500).json({
            status: 'fail',
            message: 'Something went wrong. Please try again later.'
        })
    }
}

exports.update = async (req, res) => {
    try{
        const body = req.body;
        const id = req.params.id;

        const updatedHotel = await Hotel.findOneAndUpdate(
            { _id: id}, 
            body, 
            { new: true, runValidators: true}
        );

        res.status(200).json({
            status: 'success',
            data: {
                hotel: updatedHotel
            }
        })
    }catch(error){
        res.status(500).json({
            status: 'fail',
            message: 'Something went wrong. Please try again later. Error: ' + error.message
        })
    }
}

exports.delete = async (req, res) => {
    try{
        await Hotel.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success'
        })
    }catch(error){
        res.status(500).json({
            status: 'fail',
            message: 'Something went wrong. Please try again later.'
        })
    }
}


// Get all the featured hotels
exports.getFeaturedHotels = async (req, res) => {
    try{
        const featuredHotels = await Hotel.aggregate([
            { $match: { featured: true}},
            { $sort: { ratings: -1 }},
            { $limit: 4}
        ])

        res.status(200).json({
            status: 'success',
            data: {
                featured: featuredHotels
            }
        })
    }catch(error){
        res.status(500).json({
            status: 'fail',
            message: 'Something went wrong. Please try again later. Error: ' + error.message
        })
    }
}

// Get the hotels by city
exports.getHotelsByCity = async (req, res) => {
    try{
        const hotelsByCity = await Hotel.aggregate([
            { $group: { 
                _id: '$city',
                count: { $sum: 1 },
                cheapestPrice: { $min: '$cheapestPrice' }
            }},
            { $addFields: { city: '$_id'} },
            { $project: {_id: 0} },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                hotels: hotelsByCity
            }
        })
    }catch(error){
        res.status(500).json({
            status: 'fail',
            message: 'Something went wrong. Please try again later. Error: ' + error.message
        })
    }
}

// Get hotels by type
exports.getHotelsByType = async (req, res) => {
    try{
        const hotelsByType = await Hotel.aggregate([
            { $group: { 
                _id: '$type',
                count: { $sum: 1 },
            }},
            { $addFields: { type: '$_id'} },
            { $project: {_id: 0} },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                hotels: hotelsByType
            }
        })
    }catch(error){
        res.status(500).json({
            status: 'fail',
            message: 'Something went wrong. Please try again later. Error: ' + error.message
        })
    }
}