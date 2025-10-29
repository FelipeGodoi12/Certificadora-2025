const express = require('express')
const mongoose = require('mongoose')
const usersRouter = require('./routes/users.js')
const cors = require('cors')
//const jwt = require('jsonwebtoken'

mongoose.connect('mongodb://localhost:27017/certificadora')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/users', usersRouter)


app.listen(3000, () => console.log('Server running on port 3000'))