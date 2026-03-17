const mongoose = require("mongoose");
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'First name is a required field.'],
        validate: [validator.isAlpha, 'First name can only contain letters.']
    },
    lastname: {
        type: String,
        trim: true,
        lowercase: true,
        validate: [validator.isAlpha, 'Last name can only contain letters.']
    },
    email: {
        type: String,
        required: [true, 'Email is a required field.'],
        trim: true,
        lowercase: true,
        unique: true,
        validate: [validator.isEmail, 'Provided email is not valid.']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Password is a required field.'],
        minlength: 8
    },
    confirmPassword: {
        type: String,
        required: [true, 'Confirm Password is a required field.'],
    }
}, { timestamps: true})

module.exports = mongoose.model('User', userSchema);