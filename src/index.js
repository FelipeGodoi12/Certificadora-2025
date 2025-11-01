const express = require('express')
const mongoose = require('mongoose')
const usersRouter = require('./back-end/routes/users.js')
const cors = require('cors')
const routes = require('./back-end/routes/routes');
require('dotenv').config()


console.log(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDb '))
  .catch((err) => console.error('Erro na conexão:', err))


const app = express()
app.use(cors())
app.use(express.json())
app.use('/', routes)
app.use('/users', usersRouter)



app.listen(3000, () => console.log('Server running on port 3000'))