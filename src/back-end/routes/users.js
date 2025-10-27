const express = require('express')
const router = express.Router()
const User = require('../models/User.js')
const bcrypt = require('bcrypt');

// Página inicial
router.get('/', async (req, res) => {
    res.send("Teste")
})

// Cadastro 
router.post('/cadastro', async (req, res) => {
    console.log(req.body); 
    try {
        const { nome, email, password } = req.body;
        const novoUsuario = new User({ nome, email, password });
        await novoUsuario.save();
        res.status(201).send({ message: 'Usuário cadastrado com sucesso.' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
    
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // usa o mesmo nome do cadastro
    console.log(req.body)
  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado.' });
    }
    const senhaConfere = password === usuario.password; 
    if (!senhaConfere) {
      return res.status(401).json({ erro: 'Senha incorreta.' });
    }
    return res.status(200).json({ mensagem: 'Login realizado com sucesso!' });
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});
module.exports = router