const express = require('express')
const mongoose = require('mongoose')
const usersRouter = require('./back-end/routes/users.js')
const cors = require('cors')
const routes = require('./back-end/routes/routes')
const path = require('path')
const PORT = process.env.PORT || 3000
require('dotenv').config()


console.log(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDb '))
  .catch((err) => console.error('Erro na conexão:', err))


const app = express()
app.use(cors({
  origin: 'https://certificadora-2025-14.onrender.com' //precisa alterar a cada deploy
}))
app.use(express.json())
app.use('/', routes)
app.use('/users', usersRouter)
app.use('/style', express.static(path.join(__dirname, 'front-end', 'style')))



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));