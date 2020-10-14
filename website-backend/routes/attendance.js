const express = require('express');
const User = require('../models/user');
const router = express.Router();
const auth = require('../middleware/authenticate');
const loggedin = require('../middleware/loggedin');

router.get('/:id', async (req, res) => {
    const paramsTestObject = {
        userID: req.params.id
    }
    const { error } = User.validate(paramsTestObject)

    if (error) {
        res.status(400).send(JSON.stringify(error))
    } else {
        try {
            const attendance = await User.readAttendance(req.params.id)
            res.send(JSON.stringify(attendance))
        }
        catch (err) {
            res.status(418).send(JSON.stringify(err))
        }
    }
})

router.post('/:id', async (req, res) => {
    const paramsTestObject = {
        classId: req.params.id
    }
    ///////////const arrayTestObj = User.validate(record)
     const { error } = User.validate(paramsTestObject)
 
    // let arr = req.body
    // let record = []
    // arr.forEach((student) => {
    //     const studentData = {
    //         studentId: student.id,
    //         studentPresent: student.present,
    //         classId: req.params.id
    //     }
    //     record.push(studentData)
    // })

    const students = req.body.map((student) => ({
        studentId: student.id,
        studentPresent: student.present,
        classId: req.params.id
    }))

    if (error) {

        res.status(400).send(JSON.stringify(error))
    } else {
        try {
            const response = await User.createAttendance(req.params.id, students)
            res.send(JSON.stringify(response))
        }
        catch (err) {
            console.log(err)
            res.status(418).send(JSON.stringify(err))
        }
    }
})

module.exports = router;