const express = require('express');
const User = require('../models/user');
const router = express.Router();
const auth = require('../middleware/authenticate');
const loggedin = require('../middleware/loggedin');

router.get('/', [auth, loggedin], async (req, res) => {
    try {
        const students = await User.getStudents()
        res.send(JSON.stringify(students))
    }
    catch (err) {
        res.status(418).send(JSON.stringify(err))
    }
})

module.exports = router;