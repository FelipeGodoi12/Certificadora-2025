const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const path = require('path')

//Página inicial
router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/Páginas/homepage.html'))
})

router.get('/login', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/Páginas/login.html'))
})

router.get('/cadastro', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/Páginas/cadastro.html'))
});

router.get('/oficinas', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/Páginas/oficinas.html'))
});

router.get('/criar-oficinas', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/Páginas/criar-oficinas.html'))
});

module.exports = router