const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.route('/').post(
    authController.isAuthenticated,
    authController.isAuthorized('user'),
    reviewController.create
).get(
    reviewController.getAll
)

reviewRouter.route('/:id').delete(
    authController.isAuthenticated,
    authController.isAuthorized('user'),
    reviewController.delete
).patch(
    authController.isAuthenticated,
    authController.isAuthorized('user'),
    reviewController.update
)

module.exports = reviewRouter;