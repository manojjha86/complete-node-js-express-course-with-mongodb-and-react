const express = require('express');
const hotelController = require('../controllers/hotelsController');

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
    .post(hotelController.create);
hotelRouter.route('/:id')
    .get(hotelController.getById)
    .patch(hotelController.update)
    .delete(hotelController.delete);

module.exports = hotelRouter;