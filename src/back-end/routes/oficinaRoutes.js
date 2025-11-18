const express = require('express')
const router = express.Router()
const Oficina = require('../models/Oficinas')
const authAdmin = require('../middlewares/authAdmin')
const User = require('../models/User.js')


// Criar, Editar, Listar


router.post('/criar-oficina', async (req, res) => {
    try {
        const { titulo, professor, descricao, data, horario, vagas } = req.body

        if(!titulo || !professor || !descricao || !data || !horario || !vagas) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' })
        }

        const novaOficina = new Oficina({
            nome: titulo,
            professor: professor,
            descricao: descricao,
            data: new Date(`${data}T${horario}`), 
            horario: horario,
            vagas: vagas
        })

        await novaOficina.save()

        res.status(201).json({ message: 'Oficina criada com sucesso!' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Erro ao criar oficina.' })
    }
})

router.get('/oficinas/list', async (req, res) => {
  try {
    const oficinas = await Oficina.find()
    res.status(200).json(oficinas)
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar oficinas" })
  }
})

//====================================================================================//



// Inscrever, cancelar inscrição

//so pra vc lembrar amanha, ta dando pra se inscrever pelo insomnia, so precisa ver se essa inscrição existe dps

router.post('/oficinas/inscrever', async (req, res) => {
  try {
    const { email, nome } = req.body
    
    if (!email || !nome) {
      return res.status(400).json({ msg: 'Email e nome da oficina são obrigatórios.' })
    }

    // Encontrar usuário e oficina
    const user = await User.findOne({ email })
    const oficina = await Oficina.findOne({ nome: nome })

    
      
    if (!user) return res.status(404).json({ msg: 'Usuário não encontrado.' })
    if (!oficina) return res.status(404).json({ msg: 'Oficina não encontrada.' })

    // Verifica se já está inscrito
    if (user.oficinasInscritas.includes(oficina._id)) {
      return res.status(409).json({ msg: 'Usuário já inscrito nesta oficina.' })
    }

    // Verifica vagas disponíveis
    if (oficina.inscritos.length >= oficina.vagas) {
      return res.status(403).json({ msg: 'Oficina sem vagas disponíveis.' })
    }

    // Efetua a inscrição
    user.oficinasInscritas.push(oficina._id)
    oficina.inscritos.push(user._id)

    await user.save()
    await oficina.save()
    console.log("Depois de salvar")

    res.status(200).json({ msg: 'Inscrição realizada com sucesso!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Erro ao realizar inscrição' })
  }
})

// Cancelar inscrição de usuário em uma oficina
router.post('/oficinas/cancelar', async (req, res) => {
  
})



module.exports = router