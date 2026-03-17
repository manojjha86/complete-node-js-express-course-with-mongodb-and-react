const express = require('express');
const morgan = require('morgan');
const hotelRouter = require('./routers/hotelsRouter');
const userRouter = require('./routers/usersRouter');

//CREATING AN EXPRESS APP
const app = express();

const logger = (req, res, next) => {
    console.log(`${req.method}: ${req.url}`);
    next();
}

//USING MIDDLEWARE
app.use(express.json());
app.use(express.static('./public'));
app.use(morgan('common'));
app.use(logger);
app.use((req, res, next) => {
    req.requestedAt = new Date().toISOString();
    next();
})

//ADDING ROUTES FOR APP
app.use('/api/v1/hotels', hotelRouter);
app.use('/api/v1/users', userRouter);








module.exports = app;