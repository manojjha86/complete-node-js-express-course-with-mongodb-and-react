const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
        unique: [true, 'A user with same email already exist.'],
        validate: [validator.isEmail, 'Provided email is not valid.']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Password is a required field.'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Confirm Password is a required field.'],
        validate: {
            validator: function (value) {
                return value === this.password
            },
            message: 'Password & Confirm Password do not match.'
        }
    },
    passwordChangedAt: Date,
    role: {
        type: String,
        enum: ['user', 'admin', 'super'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true,
        select: false
    },
    bio: {
        type: String,
        maxLength: 1000
    },
    address: {
        city: String,
        country: String
    },
    contact: {
        altEmail: {
            type: String,
            trim: true,
            lowercase: true,
            validate: [validator.isEmail, 'Provided email is not valid.']
        },
        code:{
            type: String,
            default: '+91'
        },
        phone:{
            type: String,
            validate: [validator.isMobilePhone, 'Provided phone is not valid.']
        }
    },
    resetToken: String,
    resetTokenExpiresAt: Date
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    //Skip hashing if password is not modified
    if (!this.isModified('password')) return next();

    //Hash the passowrd
    this.password = await bcrypt.hash(this.password, 10);

    //Remove confirm password field from saved document.
    this.confirmPassword = undefined;
    next();
});

userSchema.pre(/^find/, async function (next) {
    this.find({ isActive: true });
    next();
});

userSchema.methods.comparePassword = async (password, savedPassword) => {
    return bcrypt.compare(password, savedPassword);
}

userSchema.methods.isPasswordChanged = async function (tokenIssuedAt) {
    if (this.passwordChangedAt) {
        const passwordChangeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return tokenIssuedAt < passwordChangeTimestamp;
    }
    return false;
}

userSchema.methods.generateResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetTokenExpiresAt = Date.now() + (10 * 60 * 1000);

    console.log(resetToken, this.resetToken);

    return resetToken;
}

module.exports = mongoose.model('User', userSchema);