const catchAsync = require('../utilities/catchAsync');
const Room = require('./../models/room');
const Hotel = require('./../models/hotel');
const factory = require('./handlerFactory');

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