const express = require('express')
const router = express.Router()
const User = require('../models/User.js')

require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authUser = require('../middlewares/authUser')
const SECRET = process.env.JWT_SECRET || process.env.SECRET

// Cadastro 
router.post('/cadastro', async (req, res) => {
    try {
        const { nome, email, password } = req.body
         if (!password || password.length < 6 || password.length > 12) {
            return res.status(400).send({ erro: 'A senha deve ter entre 6 e 12 caracteres.' });
        }
        const existente = await User.findOne({ email });
        if (existente) {
            return res.status(400).send({ erro: 'Este email já foi cadastrado' });
        }
        
        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const novoUsuario = new User({ nome, email, password: hashedPassword })
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
    
    // Compare hashed password
    const senhaConfere = await bcrypt.compare(password, usuario.password)
    if (!senhaConfere) {
      return res.status(401).json({ erro: 'Senha incorreta.' })
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, admin: usuario.admin }, SECRET, { expiresIn: '24h' }
    )
    
    return res.json({ token, admin: usuario.admin,
      mensagem: 'Login realizado com sucesso!'
    })

  } catch (erro) {
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

router.get('/minhas-oficinas', authUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('oficinasInscritas')
            .populate({
                path: 'oficinasInscritas.oficina',
                model: 'oficina',
            })

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' })
        }

        const ativas = []
        const concluidas = []

        user.oficinasInscritas.forEach((entry) => {
            if (!entry.oficina) return

            const o = entry.oficina

            const item = {
                id: o._id,
                nome: o.nome,
                descricao: o.descricao,
                professor: o.professor,
                data: o.data,
                horario: o.horario,
                statusInscricao: entry.status,
                dataInscricao: entry.dataInscricao,
                statusOficina: o.status,
                vagasRestantes: o.vagas - o.inscritos.length,
            }

            const oficinaConcluida =
                entry.status === 'concluido' ||
                o.status === 'finalizada' ||
                o.status === 'Concluída'

            if (oficinaConcluida) {
                concluidas.push(item)
            } else {
                ativas.push(item)
            }
        })

        return res.json({ ativas, concluidas })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Erro ao carregar oficinas do usuário.' })
    }
})

// Perfil do usuário logado
router.get('/profile', authUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' })
        }

        res.json({
            id: user._id,
            nome: user.nome,
            email: user.email,
            admin: user.admin,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Erro ao carregar perfil.' })
    }
})


module.exports = router