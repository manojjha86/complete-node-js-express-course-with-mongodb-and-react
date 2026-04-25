const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
    path: './config.env'
})

//HANDLING UNHANDLED EXCEPTIONS
process.on('uncaughtException', (error) => {
    console.log(error.name + ': ' + error.message);
    console.log('Uncaught Exception Occured. Shutting down...');
    process.exit(1);
});

const app = require('./app');

const connString = process.env.CONNECTION_STRING;
mongoose.connect(connString)
.then((conn) => {
    console.log('Connection to DB Successful');
})
.catch((err) => {
    console.error('Could not connect to MongoDB', err);
})


const port = process.env.PORT | 3000;
const server = app.listen(port, () => {
    console.log('Express Server is Up & Running!');
});

//HANDLING REJECTED PROMISES
process.on('unhandledRejection', (error) => {
    console.log(error.name + ': ' + error.message);
    console.log('Unhandled Rejection Occured. Shutting down...');
    server.close(() => {
        process.exit(1);
    })
});

