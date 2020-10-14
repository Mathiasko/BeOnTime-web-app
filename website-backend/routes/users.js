const express = require('express');
const User = require('../models/user');
const router = express.Router();
const _ = require('lodash');
const { user } = require('../config/connection');
const auth = require('../middleware/authenticate');
const loggedin = require('../middleware/loggedin');

router.post('/', async (req, res) => {
    
    const userWannabe = _.omit(req.body, 'password');
    const passwordWannabe = _.pick(req.body, 'password');

    try {
        const validateUser = User.validate(userWannabe);
        if (validateUser.error) throw { statusCode: 400, message: validateUser.error };

        const validatePassword = User.validateLoginInfo(passwordWannabe);
        if (validatePassword.error) throw { statusCode: 400, message: validatePassword.error };

        // here we check with User.readByEmail(userWannabe.userEmail)
        const existingUser = await User.readByEmail(userWannabe.email);
        throw { statusCode: 403, message: 'Cannot save User in DB.' }
    }
    catch (userCheckError) {
        try {
            if (userCheckError.statusCode != 404) throw userCheckError;
            const newUser = await new User(userWannabe).create(passwordWannabe);
            console.log(newUser);
            res.send(JSON.stringify(newUser));
        }
        catch (err) {
            let errorMessage;
            if (!err.statusCode) {
                errorMessage = {
                    statusCode: 500,
                    message: `ze jako ${err}`
                }
            } else {
                errorMessage = err;
            }
            res.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
        }
    }
});

router.get('/:id',  async (req, res) => {
    const paramsTestObject = {
        userID: req.params.id
    }
    const { error } = User.validate(paramsTestObject)

    if (error) {
        res.status(400).send(JSON.stringify(error))
    } else {
        try {
            const user = await User.readById(req.params.id)
            res.send(JSON.stringify(user))
        }
        catch (err) {
            res.status(418).send(JSON.stringify(err))
        }
    }
})

router.patch('/:id', [auth, loggedin], async (req, res) => {
    const paramsTestObject = {
        userID: req.params.id,
        phoneNumber: req.body.phoneNumber
    }
    const { error } = User.validate(paramsTestObject)

    if (error) {
        res.status(400).send(JSON.stringify(error))
    } else {
        try {
            const user = await User.updatePhoneNumber(req.params.id, req.body.phoneNumber)
            console.log(user)
            res.send(JSON.stringify(user))
        }
        catch (err) {
            res.status(418).send(JSON.stringify(err))
        }
    }
})

module.exports = router;