const express = require('express');
const hotelController = require('../controllers/hotelsController');
const authController = require('./../controllers/authController');

const hotelRouter = express.Router();

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