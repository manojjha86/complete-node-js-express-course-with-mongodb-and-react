const ApiFeatures = require('./../utilities/features');
const Hotel = require('./../models/hotel.js');
const AppError = require('./../utilities/appError');
const catchAsync = require('../utilities/catchAsync');
const factory = require('./handlerFactory.js');
const multer = require('multer');
const sharp = require('sharp');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        const error = new AppError('Not an image. Please upload only image file', 400);
        cb(error, false);
    }
}

const upload = multer({ storage, fileFilter });

exports.uploadHotelImages = upload.array('images', 5);

exports.resizeHotelImage = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    req.body.images = [];

    await Promise.all(
        req.files.map(async (file, i) => {
            const filename = `hotel-${req.params.id}-${i + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/images/hotels/${filename}`)

            req.body.images.push(filename);
        })
    )

    next();
})


exports.getAll = catchAsync(async (req, res, next) => {
    const features = new ApiFeatures(Hotel.find(), req.query);

    const total = await Hotel.countDocuments();

    const query = features.filter().sort().limitFields().paginate().queryObj;

    const hotels = await query;

    res.status(200).json({
        status: 'success',
        count: total,
        data: {
            hotels
        }
    })
})

exports.create = catchAsync(async (req, res, next) => {
    const hotel = await Hotel.create({
        ...req.body,
        createdBy: req.user.email
    });

    res.status(201).json({
        status: 'success',
        data: {
            hotel
        }
    })
})

exports.getById = catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const hotel = await Hotel.findById(id).populate(
        {
            path: 'rooms',
            select: '-__v'
        }
    ).populate('reviews');

    if (!hotel) {
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

exports.update = factory.updateOne(Hotel, 'hotel');

exports.delete = factory.deleteOne(Hotel, 'hotel');


// Get all the featured hotels
exports.getFeaturedHotels = catchAsync(async (req, res, next) => {
    const featuredHotels = await Hotel.aggregate([
        { $match: { featured: true } },
        { $sort: { ratings: -1 } },
        { $limit: 5 }
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
        {
            $group: {
                _id: '$city',
                count: { $sum: 1 },
                cheapestPrice: { $min: '$cheapestPrice' }
            }
        },
        {
            $addFields: {
                city: '$_id',
                image: { $concat: ['/images/city/', { $toLower: '$_id' }, '.jpg'] }
            }
        },
        { $project: { _id: 0 } },
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
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
            }
        },
        {
            $addFields: {
                type: '$_id',
                image: { $concat: ['/images/type/', { $toLower: '$_id' }, '.jpg'] }
            }
        },
        { $project: { _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 4 }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            hotels: hotelsByType
        }
    })
})