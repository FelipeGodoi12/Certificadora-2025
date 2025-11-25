const express = require('express')
const mongoose = require('mongoose')
const helmet = require('helmet')
const usersRouter = require('./back-end/routes/users.js')
const oficinaRoutes = require('./back-end/routes/oficinaRoutes.js')
const cors = require('cors')
const routes = require('./back-end/routes/routes')
const path = require('path')
const PORT = process.env.PORT || 3000
require('dotenv').config()


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDb '))
  .catch((err) => console.error('Erro na conexão:', err))

const app = express()

app.get('/env.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(`window.BASE_URL = "${process.env.BASE_URL}";`);
});

app.use(helmet({
  contentSecurityPolicy: false,
}))

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://certificadora-2025-13.onrender.com'],
  credentials: true
}))

app.use(express.json())
app.use('/', routes)
app.use('/users', usersRouter)
app.use('/', oficinaRoutes)
app.use('/style', express.static(path.join(__dirname, 'front-end', 'style')))
app.use('/scripts', express.static(path.join(__dirname, 'front-end', 'scripts')))
app.use('/imgs', express.static(path.join(__dirname, 'front-end', 'imgs')))
app.use(express.static(path.join(process.cwd(), "src", "front-end", "paginas")));
app.use(express.static(path.join(process.cwd(), "src", "front-end")));


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
