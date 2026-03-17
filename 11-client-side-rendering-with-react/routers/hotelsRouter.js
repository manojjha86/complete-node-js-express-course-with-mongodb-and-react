const express = require('express');
const hotelController = require('../controllers/hotelsController');
const authController = require('./../controllers/authController');
const roomsRouter = require('./../routers/roomsRouter');
const reviewRouter = require('./../routers/reviewRouter');

const hotelRouter = express.Router();

hotelRouter.use('/:hotelId/rooms', roomsRouter);
hotelRouter.use('/:hotelId/reviews', reviewRouter);

//Get featured hotels
hotelRouter.route('/get-featured')
    .get(hotelController.getFeaturedHotels);
hotelRouter.route('/get-hotels-by-city')
    .get(hotelController.getHotelsByCity);
hotelRouter.route('/get-hotels-by-type')
    .get(hotelController.getHotelsByType);
    
hotelRouter.route('/')
    .get(hotelController.getAll)
    .post(authController.isAuthenticated, authController.isAuthorized('admin', 'super'), hotelController.create);
hotelRouter.route('/:id')
    .get(hotelController.getById)
    .patch(authController.isAuthenticated, authController.isAuthorized('admin'), hotelController.update)
    .delete(authController.isAuthenticated, authController.isAuthorized('admin', 'super'), hotelController.delete);

module.exports = hotelRouter;