const express = require('express');
const morgan = require('morgan');
const hotelRouter = require('./routers/hotelsRouter');
const userRouter = require('./routers/usersRouter');
const authRouter = require('./routers/authRouter');
const roomsRouter = require('./routers/roomsRouter');
const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('@exortek/express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');

//CREATING AN EXPRESS APP
const app = express();


//USING MIDDLEWARE
app.use(helmet());
app.use('/api', rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'We have received too many requests from this IP. Please try again after an hour.'
}));

app.use('/api/v1/auth/login', rateLimit({
    max: 3,
    windowMs: 60 * 60 * 1000,
    skipSuccessfulRequests: true,
    message: 'Too many login attempts. Please try again after an hour.'
}));

app.use(express.json({ limit: '10kb'}));
app.use(sanitize());
app.use(xss());
app.use(hpp({
    whitelist: ['cheapestPrice']
}));

app.use(express.static('./public'));

//ADDING ROUTES FOR APP
app.use('/api/v1/hotels', hotelRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
//app.use('/api/v1/rooms', roomsRouter);

//DEFAULT ROUTE
app.all('*splat', (req, res, next) => {
    const error = new AppError(`Cannot find the resource '${req.originalUrl}'`, 404);
    next(error);
})

//GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);













module.exports = app;