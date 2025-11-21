const express = require('express')
const router = express.Router()
const Oficina = require('../models/Oficinas')
const authAdmin = require('../middlewares/authAdmin')
const User = require('../models/User.js')

// Funções de gerenciamento de data 

async function atualizarStatusOficinas() {
    const agora = new Date()
    await Oficina.updateMany(
        { status: 'Aberta', data: { $lte: agora } },
        { $set: { status: 'finalizada' } }
    )
}

router.get('/', async (req, res) => {
    try {
        await atualizarStatusOficinas() // Chama antes de buscar
        const oficinas = await Oficina.find({})
        res.json(oficinas)
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar oficinas' })
    }
})

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
  await atualizarStatusOficinas()
  try {
    const oficinas = await Oficina.find()
    res.status(200).json(oficinas)
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar oficinas" })
  }
})

// BUSCAR UMA oficina por ID
router.get('/api/oficinas/:id', authAdmin, async (req, res) => {
    try {
        const oficina = await Oficina.findById(req.params.id)
        if (!oficina) {
            return res.status(404).json({ message: 'Oficina não encontrada.' })
        }
        res.status(200).json(oficina)
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar oficina.' })
    }
})

// ATUALIZAR UMA oficina por ID
router.put('/api/oficinas/:id', authAdmin, async (req, res) => {
    try {
        const { titulo, professor, descricao, data, horario, vagas } = req.body
        
        const oficina = await Oficina.findById(req.params.id)
        if (!oficina) {
            return res.status(404).json({ message: 'Oficina não encontrada.' })
        }

        // REGRA DE NEGÓCIO: Só o criador pode editar
        if (oficina.criador.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado. Você não é o criador desta oficina.' })
        }

        // Atualiza os campos
        oficina.nome = titulo
        oficina.professor = professor
        oficina.descricao = descricao
        oficina.data = new Date(`${data}T${horario}`)
        oficina.horario = horario
        oficina.vagas = vagas

        await oficina.save()

        res.status(200).json({ message: 'Oficina atualizada com sucesso!', oficina: oficina })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Erro ao atualizar oficina.' })
    }
})

//====================================================================================//

// Inscrever, cancelar inscrição

router.post('/oficinas/inscrever', async (req, res) => {
    await atualizarStatusOficinas()
    try {
    const { email, nome } = req.body
    
    if (!email || !nome) {
      return res.status(400).json({ msg: 'Email e nome da oficina são obrigatórios.' })
    }

    // Encontrar usuário e oficina
    const user = await User.findOne({ email })
    const oficina = await Oficina.findOne({ nome: nome })

    /*Verifica se a oficina já foi encerrada ou ainda está aberta*/
    if (oficina.status !== 'Aberta') {
      return res.status(400).json({ msg: 'Oficina encerrada para inscrições' })
    }
    
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

    res.status(200).json({ msg: 'Inscrição realizada com sucesso!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Erro ao realizar inscrição' })
  }
})

// Cancelar inscrição de usuário em uma oficina
router.post('/oficinas/cancelar', async (req, res) => {
    await atualizarStatusOficinas()
    const { email, nome } = req.body

    if (!email || !nome) {
        return res.status(400).json({ erro: "Email e nome da oficina são obrigatórios" })
    }

    try {
        // Busca o usuário pelo email
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ erro: "Usuário não encontrado" })
        }

        // Busca a oficina pelo nome
        const oficina = await Oficina.findOne({ nome })
        if (!oficina) {
            return res.status(404).json({ erro: "Oficina não encontrada" })
        }

        if (oficina.status !== 'Aberta') {
            return res.status(400).json({ msg: 'Erro ao cancelar: oficina encerrada' })
        }

        // Remover o ObjectId do usuário do array 'inscritos'
        const beforeCount = oficina.inscritos.length
        oficina.inscritos = oficina.inscritos.filter(
            inscritoId => inscritoId.toString() !== user._id.toString()
        )
        const afterCount = oficina.inscritos.length

        user.oficinasInscritas = (user.oficinasInscritas || []).filter(
          oficinaId => oficinaId.toString() !== oficina._id.toString()
        )
        await user.save()

        if (beforeCount === afterCount) {
            return res.status(400).json({ erro: "Usuário não está inscrito nesta oficina" })
        }

        await oficina.save()

        res.json({ msg: "Inscrição cancelada com sucesso" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ erro: "Erro ao cancelar inscrição" })
    }
})



module.exports = router
