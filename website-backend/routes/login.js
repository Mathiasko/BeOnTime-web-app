const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypt = require('../config/encrypt');

const router = express.Router();

router.post('/', async (req, res) => {

    try {
        const { error } = User.validateLoginInfo(req.body);
        if (error) throw { statusCode: 400, message: error };
        const loggedInUser = await User.matchUserEmailAndPassword(req.body);
        const token = await jwt.sign(JSON.stringify(loggedInUser), crypt.jwtPrivateKey);
        loggedInUser.token = token;
        console.log(loggedInUser)
        res.send(JSON.stringify(loggedInUser));
    }
    catch (err) {
        let errorMessage;
        if (!err.statusCode) {
            errorMessage = {
                statusCode: 500,
                message: err
            }
        } else {
            errorMessage = err;
        }
        res.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }
});

module.exports = router;