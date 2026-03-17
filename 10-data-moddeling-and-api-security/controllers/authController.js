const catchAsync = require("../utilities/catchAsync");
const User = require('./../models/user');
const jwt = require('jsonwebtoken');
const AppError = require('./../utilities/appError');
const sendEmail = require('./../utilities/email');
const crypto = require('crypto');
const signToken = require('./../utilities/signToken');



exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    //Generate a token
    const token = signToken(newUser._id);

    //Add token to HTTPOnly Cookie
    const options = {
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days in ms
        httpOnly: true
    }
    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }
    res.cookie('access_token', token, options);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
});

exports.login = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    //Check if email / password exist in request
    if(!email || email === ''){
        const error = new AppError('Email is not provided', 400);
        return next(error);
    }
    if(!password || password === ''){
        const error = new AppError('Password is not provided', 400);
        return next(error);
    }

    //Check if user with given email exist
    const user = await User.findOne({ email: email}).select('+password');

    if(!user){
        const error = new AppError('User with given email is not found.', 400);
        return next(error);
    }

    //If the password matches the saved password
    const isMatch = await user.comparePassword(password, user.password)

    if(!isMatch){
        const error = new AppError('Password is not correct.', 401);
        return next(error);
    }

    //Create a token & send it in response
    const token = signToken(user._id);

    //Add token to HTTPOnly Cookie
    const options = {
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days in ms
        httpOnly: true
    }
    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }
    res.cookie('access_token', token, options);


    res.status(200).json({
        status: 'success',
        token: token,
    })
});

//Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1. Find the user based on provided email
    const user = await User.findOne({ email: req.body.email});

    if(!user){
        const error = new AppError('Cannot find the user with provided email.', 404);
        return next(error);
    }

    //2. Generate a token
    const plainResetToken = user.generateResetToken();
    await user.save( {validateBeforeSave: false} );

    //3. Sned an email to user with password reset link
    const resetTokenLink = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${plainResetToken}`;
    const body = `We have receivd a password reset request. Please use below link to reset your password\n\n${resetTokenLink}\n\nThis password reset link is valid for 10 minutes.`;
    
    try{
        await sendEmail({
            email: user.email,
            subject: 'Password Change Request Received',
            message: body
        })

        res.status(200).json({
            status: 'success',
            message: 'A password reset link has been sent to user email.'
        });
    }catch(error){
        user.resetToken = undefined;
        user.resetTokenExpiresAt = undefined;
        await user.save({validateBeforeSave: false});

        const err = new AppError('There was an error sending password reset email. Please try again later.', 500);
        return next(err);
    }
    
})

//Reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
    //Find a user with the token
    const hashedToken = crypto.createHash('sha256')
                               .update(req.params.token)
                               .digest('hex');
    const user = await User.findOne({ 
        resetToken: hashedToken,
        resetTokenExpiresAt: { $gt: Date.now()}
    });

    if(!user){
        const error = new AppError('Reset token is not valid or it has expired.', 400);
        return next(error);
    }

    //Update the fields
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    //Create a token & send it in response
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token: token,
    })
})

exports.isAuthenticated = catchAsync(async (req, res, next) => {
    //1. Read access token from the request header
    const testToken = req.headers.authorization;
    let token = null;

    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1];//Bearer access-token-string
    }
    if(!token){
        const error = new AppError('You are not logged-in.', 401);
        return next(error);
    }

    //2. check if token is valid - not expired / not manipulated
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decodedToken);
    
    //3. If token is valid, check if the user exist
    const user = await User.findById(decodedToken.userId);

    if(!user){
        const error = new AppError('User does not exist. Access denied.', 401);
        return next(error);
    }

    //4. Check if the user has changed password after token was issued
    const passwordWasChanged = await user.isPasswordChanged(decodedToken.iat);

    if(passwordWasChanged){
        const error = new AppError('Password was changed. Please login again.', 401);
        return next(error);
    }

    //5. Every check is success - allow access to protected route
    req.user = user;
    next();
});

exports.isAuthorized = (...role) => {
    return (req, res, next) => {
        if(!role.includes(req.user.role)){
            const error = new AppError('You do not have permission to perform this action', 403);
            return next(error);
        }
        next();
    }
}