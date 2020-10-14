const express = require('express');
const User = require('../models/user');
const router = express.Router();
const { user } = require('../config/connection');



router.get('/:id', async (req, res) => {

    const paramsTestObject = {
        userID: req.params.id
    }
    const { error } = User.validate(paramsTestObject)

    if (error) {
        res.status(400).send(JSON.stringify(error))
    } else {
        try {
            const classes = await User.readClasses(req.params.id)
            console.log(classes)
            res.send(JSON.stringify(classes))
        }
        catch (err) {
            res.status(418).send(JSON.stringify(err))
        }
    }
})
module.exports = router;