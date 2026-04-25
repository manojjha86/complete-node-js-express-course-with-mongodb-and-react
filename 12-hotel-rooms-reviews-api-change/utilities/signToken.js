const jwt = require('jsonwebtoken');

module.exports = (userId) => {
    return jwt.sign(
        { userId: userId}, 
        process.env.SECRET_KEY,
        { 
            expiresIn: process.env.LOGIN_EXPIRES
        }
    );
}