const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')


router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../front-end/Páginas/Homepage.html'))
})

router.get('/oficinas', (req, res) => {
  
})

router.get('/criar-oficinas', (req, res) => {
  res.send('')
})

module.exports = router