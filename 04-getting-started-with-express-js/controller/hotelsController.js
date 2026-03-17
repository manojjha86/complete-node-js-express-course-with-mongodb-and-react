const fs = require('fs');

let hotels = JSON.parse(fs.readFileSync('./data/hotels.json'));

exports.checkHotelExist = (req, res, next, value) => {
    const hotel = hotels.find(hotel => hotel.id === +value);

    if(!hotel){
        return res.status(404).json({
            status: 'fail',
            message: 'Hotel with ID ' + value + ' cannot be found.'
        });
    }
    next();
}

exports.validatePostBody = (req, res, next) => {
    const body = req.body;
    if(!body){
        return res.status(400).json({
            status: 'fail',
            message: 'Request does not contain a body.'
        })
    }
    if(!body.name || !body.city || !body.price){
        return res.status(400).json({
            status: 'fail',
            message: 'Request body does not contain a valid hotel object.'
        })
    }
    next();
}

exports.getAll = (req, res) => {
    res.status(200).json({
        status: 'success',
        count: hotels.length,
        data: {
            hotels
        }
    })
}

exports.create = (req, res) => {
    const newId = hotels[hotels.length - 1].id + 1;
    const newHotel = Object.assign({ id: newId}, req.body);
    hotels.push(newHotel);

    fs.writeFile('./data/hotels.json', JSON.stringify(hotels), () => {
        res.status(201).json({
            status: 'success',
            data: {
                hotel: newHotel
            }
        })
    })
}

exports.getById = (req, res) => {
    //Read ID Route Parameter value & convert it to number type
    const id = req.params.id * 1;

    const hotel = hotels.find(hotel => hotel.id === id);

    res.status(200).json({
        status: 'success',
        requestTime: req.requestedAt,
        data: {
            hotel
        }
    })
}

exports.update = (req, res) => {
    const id = +req.params.id;
    const hotelToUpdate = hotels.find(hotel => hotel.id === id);

    const body = req.body;
    const index = hotels.indexOf(hotelToUpdate);

    const updatedHotel = Object.assign(hotelToUpdate, body);

    hotels[index] = updatedHotel;

    fs.writeFile('./data/hotels.json', JSON.stringify(hotels), () => {
        res.status(200).json({
            status: 'success',
            data: {
                hotel: updatedHotel
            }
        })
    })
}

exports.delete = (req, res) => {
    const id = +req.params.id;
    const hotelToDelete = hotels.find(hotel => hotel.id === id);

    const index = hotels.indexOf(hotelToDelete);
    hotels.splice(index, 1);

    fs.writeFile('./data/hotels.json', JSON.stringify(hotels), () => {
        res.status(204).json({
            status: 'success',
            data: {
                hotel: hotelToDelete
            }
        })
    })
}

/*
    {
        "id": 2,
        "name": "Seaside Resort & Spa",
        "type": "Resort",
        "ratings": 4.5,
        "city": "Goa",
        "country": "India",
        "price": 8500
    }

    {
      "price": 10000,
      "name": "Seaside Resort"
    }
*/