const mongoose = require('mongoose');
const fs = require('fs');
const Hotel = require('./../models/hotel');

//CONNECT TO MONGODB DATABASE
const connString = 'mongodb+srv://admin:Fldmq8n4awoE5lIl@procademy-cluster.qxn3qf6.mongodb.net/bookmystay?retryWrites=true&w=majority&appName=procademy-cluster'
mongoose.connect(connString)
.then((conn) => {
    console.log('Script: Connection to DB Successful');
}).catch((err) => {
    console.error('Script: Could not connect to MongoDB', err);
})

//READ THE DATA FROM DATA>JSON FILE
const hotels = JSON.parse(fs.readFileSync('./data/hotels.json', 'utf-8'));

//DELETE EXISTING DOCUMENTS FROM HOTELS COLLECTION
const deleteDocuments = async () => {
    try{
        await Hotel.deleteMany();
        console.log('Documents deleted successfully!');
    }catch(error){
        console.error('Error deleting documents! Error: ' + error.message);
    }
    process.exit();
}

//INSERT THE READ DOCUMENTS IN HOTELS COLLECTION
const importDocuments = async () => {
    try{
        await Hotel.create(hotels);
        console.log('Documents imported successfully!');
    }catch(error){
        console.error('Error importing documents! Error: ' + error.message);
    }
    process.exit();
}

// deleteDocuments();
// importDocuments();

//console.log(process.argv);

if(process.argv[2] === '-delete'){
    deleteDocuments();
}
if(process.argv[2] === '-import'){
    importDocuments();
}