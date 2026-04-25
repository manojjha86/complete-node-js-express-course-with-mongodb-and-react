const express = require('express');
const roomController = require('../controllers/roomsController');
const authController = require('./../controllers/authController');

const roomsRouter = express.Router({ mergeParams: true });

roomsRouter.route('/').post(
    authController.isAuthenticated,
    authController.isAuthorized('admin'),
    roomController.create
).get(
    roomController.getAll
)

roomsRouter.route('/:id').delete(
    authController.isAuthenticated,
    authController.isAuthorized('admin'),
    roomController.delete
).get(
    roomController.getById
).patch(
    authController.isAuthenticated,
    authController.isAuthorized('admin'),
    roomController.uploadRoomImages,
    roomController.resizeImage,
    roomController.update
)

module.exports = roomsRouter;