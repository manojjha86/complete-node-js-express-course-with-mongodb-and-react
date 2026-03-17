const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
    path: './config.env'
})

const app = require('./app')

const connString = process.env.CONNECTION_STRING;
mongoose.connect(connString)
.then((conn) => {
    console.log('Connection to DB Successful');
}).catch((err) => {
    console.error('Could not connect to MongoDB', err);
})

// const db = mongoose.connection;

// db.on('disconnected', () => {
//     console.log('MongoDB Coonection is disconnected');
// })

const port = process.env.PORT | 3000;
app.listen(port, () => {
    console.log('Express Server is Up & Running!');
});