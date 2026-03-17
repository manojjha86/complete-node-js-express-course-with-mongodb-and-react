const ApiFeatures = require('./../utilities/features');

const Hotel = require('./../models/hotel.js');
const AppError = require('./../utilities/appError');
const catchAsync = require('../utilities/catchAsync')


exports.getAll = catchAsync(async (req, res,next) => {
    const features = new ApiFeatures(Hotel.find(), req.query);

    const query = features.filter().sort().limitFields().paginate().queryObj;
    
    const hotels = await query;

    res.status(200).json({
        status: 'success',
        count: hotels.length,
        data: {
            hotels
        }
    })
})

exports.create = catchAsync(async (req, res, next) => {
    const hotel = await Hotel.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            hotel
        }
    })
})

exports.getById = catchAsync(async (req, res, next) => {
        const id = req.params.id;

        const hotel = await Hotel.findById(id);

        if(!hotel){
            const error = new AppError('The hotel with given ID is not found.', 404);
            return next(error);
        }

        res.status(200).json({
            status: 'success',
            data: {
                hotel
            }
        })
})

exports.update = catchAsync(async (req, res, next) => {
        const body = req.body;
        const id = req.params.id;

        const updatedHotel = await Hotel.findOneAndUpdate(
            { _id: id}, 
            body, 
            { new: true, runValidators: true}
        );

        if(!updatedHotel){
            const error = new AppError('The hotel with given ID is not found.', 404);
            return next(error);
        }

        res.status(200).json({
            status: 'success',
            data: {
                hotel: updatedHotel
            }
        })
})

exports.delete = catchAsync(async (req, res, next) => {
    const hotelToDelete = await Hotel.findByIdAndDelete(req.params.id);

    if(!hotelToDelete){
        const error = new AppError('The hotel with given ID is not found.', 404);
        return next(error);
    }

    res.status(204).json({
        status: 'success'
    })
})


// Get all the featured hotels
exports.getFeaturedHotels = catchAsync(async (req, res, next) => {
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
})

// Get the hotels by city
exports.getHotelsByCity = catchAsync(async (req, res, next) => {
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
})

// Get hotels by type
exports.getHotelsByType = catchAsync(async (req, res, next) => {
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
})