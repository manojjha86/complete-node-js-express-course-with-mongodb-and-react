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

module.exports = usersRouter;