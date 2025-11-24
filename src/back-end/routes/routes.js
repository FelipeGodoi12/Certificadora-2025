const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/paginas/homepage.html'))
})

router.get('/login', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/paginas/login.html'))
})

router.get('/cadastro', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/paginas/cadastro.html'))
})

router.get('/oficinas', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/paginas/oficinas.html'))
})

router.get('/oficina', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/paginas/oficina.html'))
})

router.get('/criar-oficinas', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/paginas/criar-oficinas.html'))
})

router.get('/gerenciar-oficinas', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/paginas/gerenciar-oficinas.html'))
})

router.get('/perfil', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../front-end/paginas/perfil.html'))
})


module.exports = router