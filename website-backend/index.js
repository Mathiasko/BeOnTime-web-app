const env = require('dotenv').config();

const express = require('express');
const cors = require('cors');

const login = require('./routes/login');
const users = require('./routes/users');
const attendance = require('./routes/attendance');
const students = require('./routes/students');

const classes = require('./routes/class')
const setJSON = require('./middleware/setHeader');

const app = express();
const myPort = 8600;

app.use(cors());
app.use(setJSON);
app.use(express.json()); // --> req.body



app.use('/api/class', classes);
app.use('/api/login', login);
app.use('/api/users', users);
app.use('/api/students', students);
app.use('/api/attendance', attendance);

app.listen(myPort, () => console.log(`Listening on port ${myPort}...`));