const express = require('express');
const authController = require('./../controllers/authController');
const authRouter = express.Router();

authRouter.route('/signup').post(authController.signup);
authRouter.route('/login').post(authController.login);
authRouter.route('/forgotPassword').post(authController.forgotPassword);
authRouter.route('/resetPassword/:token').patch(authController.resetPassword);

module.exports = authRouter;