const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const path = require('path')

//Página inicial
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../front-end/Páginas/Homepage.html'))
})

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'Login.html'));
});

router.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'cadastro.html'));
});

router.get('/oficinas', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'Oficinas.html'));
});

router.get('/criar-oficinas', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'CriarOficinas.html'));
});

module.exports = router