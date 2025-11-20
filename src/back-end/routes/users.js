const express = require('express')
const router = express.Router()
const User = require('../models/User.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const SECRET = process.env.SECRET

// Cadastro 
router.post('/cadastro', async (req, res) => {
    console.log(req.body) 
    try {
        const { nome, email, password } = req.body
         if (!password || password.length < 6 || password.length > 12) {
            return res.status(400).send({ erro: 'A senha deve ter entre 6 e 12 caracteres.' });
        }
        const existente = await User.findOne({ email });
        if (existente) {
            return res.status(400).send({ erro: 'Este email já foi cadastrado' });
        }
        const novoUsuario = new User({ nome, email, password })
        await novoUsuario.save()
        res.status(201).send({ message: 'Usuário cadastrado com sucesso.' })
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
    
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  
  try {
    const usuario = await User.findOne({ email })
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado.' })
    }
    const senhaConfere = password === usuario.password 
    if (!senhaConfere) {
      return res.status(401).json({ erro: 'Senha incorreta.' })
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email }, SECRET, { expiresIn: '24h' }
    )
    
    return res.json({ token, admin: usuario.admin,
      mensagem: 'Login realizado com sucesso!'
    })

  } catch (erro) {
    console.log(erro)
    return res.status(500).json({ erro: 'Erro interno no servidor.' })
  }
})

// Ver oficinas em que o usuário está inscrito
router.get('/minhas-inscricoes', async (req, res) => {
  const { email } = req.query

  if (!email) {
    return res.status(400).json({ msg: 'Email é obrigatório' })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' })
    }

    res.json({ inscricoes: user.oficinasInscritas || [] })
  } catch (err) {
    res.status(500).json({ msg: 'Erro no servidor' })
  }
})




module.exports = router