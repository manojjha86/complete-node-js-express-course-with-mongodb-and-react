const AppError = require("../utilities/appError");
const catchAsync = require("../utilities/catchAsync");
const User = require('./../models/user');
const signToken = require('./../utilities/signToken');
const multer = require('multer');
const sharp = require('sharp');

//Storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        const error = new AppError('Not an image. Please upload only image file', 400);
        cb(error, false);
    }
}

const upload = multer({ storage, fileFilter });

exports.resizeImage = catchAsync(async (req, res, next) => {
    if (!req.files) return next();

    if (req.files.photo) {
        req.photo = `user-${req.user._id}.jpeg`;

        await sharp(req.files.photo[0].buffer)
            .resize(512, 512)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/images/users/profile/${req.photo}`)
    }
    if (req.files.cover) {
        req.cover = `cover-${req.user._id}.jpeg`;

        await sharp(req.files.cover[0].buffer)
            .resize(2000, 1300)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/images/users/cover/${req.cover}`)
    }


    next();
})

// exports.uploadImage = upload.single('photo');

exports.uploadImage = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]);

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1. Get the detail of currently logged user
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        const error = new AppError('Cannot find the user.', 404);
        return next(error);
    }

    //2. Compare the current password of user with saved password
    const isMatch = await user.comparePassword(
        req.body.currentPassword,
        user.password
    );

    if (!isMatch) {
        const error = new AppError('The provided password is wrong.', 401);
        return next(error);
    }

    //3. Update the user password with new value
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordChangedAt = Date.now();

    await user.save();

    //4. Login the user & send JWT in response
    const token = signToken(user._id);
    
    res.cookie('access_token', token, options);

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
});

exports.updateMe = catchAsync(async (req, res, next) => {
    console.log(req.body);
    console.log(req.file);

    //1. Check if password is also provided in request body
    if (req.body.password || req.body.confirmPassword) {
        const error = new AppError('Use Update Password to change your password.', 400);
        return next(error);
    }

    //2. Update user details
    const userDetailsToUpdate = {
        firstname: req.body.firstname || req.user.firstname,
        lastname: req.body.lastname || req.user.lastname,
        bio: req.body.bio || req.user.bio,
        photo: req.photo || req.user.photo,
        coverPhoto: req.cover || req.user.coverPhoto,
        address: {
            city: req.body.address?.city || req.user.address?.city,
            country: req.body.address?.country || req.user.address?.country,
        },
        contact: {
            altEmail: req.body.contact?.altEmail || req.user.contact?.altEmail,
            code: req.body.contact?.code || req.user.contact?.code,
            phone: req.body.contact?.phone || req.user.contact?.phone,
        }

    }

    //3. Save the change data in DB
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        userDetailsToUpdate,
        { runValidators: true, new: true }
    )

    //4. Send Response
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    const deleteUser = await User.findByIdAndUpdate(
        req.user._id,
        { isActive: false }
    )

    if (!deleteUser) {
        const error = new AppError('Cannot find the user to delete.', 404);
        return next(error);
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
})

exports.getDetails = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

