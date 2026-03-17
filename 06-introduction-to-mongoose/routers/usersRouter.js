const express = require('express');

const usersRouter = express.Router();

usersRouter.param('id', (req, res, next, value, name) => {
    console.log('Id Route Parameter Value: ' + value);
    next();
});

usersRouter.get('/', (req, res) => {
    res.send('Sending all users')
})
usersRouter.get('/:id', (req, res) => {
    res.send('Sending user with ID: ' + req.params.id);
})

module.exports = usersRouter;