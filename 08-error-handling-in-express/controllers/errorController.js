const AppError = require("../utilities/appError")

const devErrors = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stackTrace,
        error: error
    })
}

const prodErrors = (res, error) => {
    if(error.isOperational){
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        })
    }else{
        res.status(error.statusCode).json({
            status: 'error',
            message: 'Something went wrong. Please try again later!',
        })
    }    
}

const handleCastError = (error) => {
    const errorMessage = `Invalid value '${error.value}' for property '${error.path}'.`;
    const err = new AppError(errorMessage, 400);
    return err;
}

const duplicateKeyHandler = (error) => {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];

    const errorMessage = `A document with field '${field}' and value '${value}' already exist.`;
    return new AppError(errorMessage, 400);
}

const handleValidationError = (error) => {
    const errors = Object.values(error.errors).map(val => val.message);
    const message = errors.join('. ');
    const errorMessage = `Invalid input data: ${message}.`;
    return new AppError(errorMessage, 400);
}

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        devErrors(res, error);
    }else{
        let appError = { ...error };
        if(error.name === 'CastError'){
            appError = handleCastError(error);
        }
        if(error.code === 11000){
            appError = duplicateKeyHandler(error);
        }
        if(error.name === 'ValidationError'){
            appError = handleValidationError(error);
        }
        prodErrors(res, appError);
    }    
}