const catchAsync = require('../utilities/catchAsync');
const Room = require('./../models/room');
const Hotel = require('./../models/hotel');
const factory = require('./handlerFactory');
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

exports.uploadRoomImages = upload.single('image');

exports.resizeImage = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    if (req.file) {
        req.image = `room-${req.params.id}.jpeg`;

        await sharp(req.file.buffer)
            .resize(512, 512, { fit: 'cover'})
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/images/rooms/${req.image}`)
    }

    next();
})

exports.create = catchAsync(async (req, res, next) => {
    const hotelId = req.params.hotelId;
    const newRoom = await Room.create(req.body);

    await Hotel.findByIdAndUpdate(
        hotelId,
        { $push: { rooms: newRoom._id}}
    )

    await Room.calcCheapestPrice(hotelId);

    res.status(201).json({
        status: 'success',
        data: {
            room: newRoom
        }
    })
})

exports.delete = catchAsync(async (req, res, next) => {
    const hotelId = req.params.hotelId;

    const deletedRoom = await Room.findByIdAndDelete(req.params.id);

    await Hotel.findByIdAndUpdate(
        hotelId,
        { $pull: { rooms: req.params.id}}
    );

    await Room.calcCheapestPrice(hotelId);

    res.status(204).json({
        status: 'success',
        data: {
            room: deletedRoom
        }
    });
});

exports.getAll =catchAsync(async (req, res, next) => {
    const rooms = await Room.find();

    res.status(200).json({
        status: 'success',
        count: rooms.length,
        data: {
            rooms
        }
    })
});

exports.getById =catchAsync(async (req, res, next) => {
    const room = await Room.findById(req.params.id);

    res.status(200).json({
        status: 'success',
        data: {
            room
        }
    })
});

exports.update = factory.updateOne(Room, 'room');