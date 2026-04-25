const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const usersRouter = express.Router();

usersRouter.route('/updatePassword').patch(
    authController.isAuthenticated,
    userController.updatePassword
)
usersRouter.route('/updateMe').patch(
    authController.isAuthenticated,
    userController.uploadImage,
    userController.resizeImage,
    userController.updateMe
)

usersRouter.route('/deleteMe').delete(
    authController.isAuthenticated,
    userController.deleteMe
)

usersRouter.route('/me').get(
    authController.isAuthenticated,
    userController.getDetails
)

usersRouter.route('/me/reviews').get(
    authController.isAuthenticated,
    userController.getMyReviews
)

usersRouter.route('/reviews/:id').delete(
    authController.isAuthenticated,
    authController.isAuthorized('user', 'admin'),
    userController.deleteReview
).patch(
    authController.isAuthenticated,
    authController.isAuthorized('user', 'admin'),
    userController.updateReview
)

module.exports = usersRouter;