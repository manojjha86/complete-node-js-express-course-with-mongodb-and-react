const express = require('express');
const morgan = require('morgan');
const hotelRouter = require('./routers/hotelsRouter');
const userRouter = require('./routers/usersRouter');
const authRouter = require('./routers/authRouter');
const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/errorController');

//CREATING AN EXPRESS APP
const app = express();

const logger = (req, res, next) => {
    console.log(`${req.method}: ${req.url}`);
    next();
}

console.log('Environment: ' + process.env.NODE_ENV);
//USING MIDDLEWARE
app.use(express.json());
app.use(express.static('./public'));
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('common'));
    app.use(logger);
}
app.use((req, res, next) => {
    req.requestedAt = new Date().toISOString();
    next();
})

//ADDING ROUTES FOR APP
app.use('/api/v1/hotels', hotelRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

//DEFAULT ROUTE
app.all('*splat', (req, res, next) => {
    const error = new AppError(`Cannot find the resource '${req.originalUrl}'`, 404);
    next(error);
})

//GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);













module.exports = app;