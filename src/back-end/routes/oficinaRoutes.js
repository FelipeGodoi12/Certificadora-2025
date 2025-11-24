const express = require('express')
const router = express.Router()
const Oficina = require('../models/Oficinas')
const authAdmin = require('../middlewares/authAdmin')
const User = require('../models/User.js')

// =========================
// Funções de gerenciamento de data
// =========================

async function atualizarStatusOficinas() {
    const agora = new Date()
    await Oficina.updateMany(
        { status: 'Aberta', data: { $lte: agora } },
        { $set: { status: 'finalizada' } }
    )
}

// =========================
// LISTAGEM GERAL (usado em algumas telas)
// =========================

router.get('/', async (req, res) => {
    try {
        await atualizarStatusOficinas()
        const oficinas = await Oficina.find({}).populate('inscritos', 'email')
        res.json(oficinas)
    } catch (err) {
        console.error(err)
        res.status(500).json({ erro: 'Erro ao buscar oficinas' })
    }
})

// =========================
// CRIAR OFICINA (ADMIN)
// =========================

router.post('/criar-oficina', authAdmin, async (req, res) => {
    try {
        // Aceita tanto os nomes antigos quanto possíveis nomes novos do front
        const titulo = req.body.titulo || req.body.nome
        const professor = req.body.professor
        const descricao = req.body.descricao || req.body.description
        const data = req.body.data || req.body.dataOficina
        const horario = req.body.horario || req.body.horarioOficina
        const vagas = req.body.vagas || req.body.vagasOficina

        if (!titulo || !professor || !descricao || !data || !horario || !vagas) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' })
        }

        const novaOficina = new Oficina({
            nome: titulo,
            professor,
            descricao,
            data: new Date(`${data}T${horario}`),
            horario,
            vagas,
            criador: req.user.id
        })

        await novaOficina.save()

        res.status(201).json({ message: 'Oficina criada com sucesso!' })
    } catch (error) {
        console.error('Erro ao criar oficina:', error)
        res.status(500).json({ message: 'Erro ao criar oficina.' })
    }
})

// =========================
// LISTAR OFICINAS (PÚBLICO / FRONT DE LISTA)
// =========================

router.get('/oficinas/list', async (req, res) => {
    await atualizarStatusOficinas()
    try {
        const oficinas = await Oficina.find()
        res.status(200).json(oficinas)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Erro ao buscar oficinas' })
    }
})

router.get('/api/oficinas', async (req, res) => {
    await atualizarStatusOficinas()
    try {
        const oficinas = await Oficina.find({}).populate('inscritos', 'email')
        res.status(200).json(oficinas)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Erro ao buscar oficinas' })
    }
})

// =========================
// BUSCAR UMA OFICINA POR ID
// =========================

router.get('/api/oficinas/:id', async (req, res) => {
    try {
        const oficina = await Oficina.findById(req.params.id)
        if (!oficina) {
            return res.status(404).json({ message: 'Oficina não encontrada.' })
        }
        res.status(200).json(oficina)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Erro ao buscar oficina.' })
    }
})

// =========================
// ATUALIZAR OFICINA (ADMIN)
// =========================

router.put('/api/oficinas/editar', authAdmin, async (req, res) => {
    try {
        // Recebemos 'nomeAtual' para achar a oficina e os dados novos
        const { nomeAtual, titulo, professor, descricao, data, horario, vagas } = req.body

        if (!nomeAtual) {
            return res.status(400).json({ message: 'O nome atual da oficina é obrigatório para a edição.' })
        }

        // 1. Busca pelo nome em vez do ID
        const oficina = await Oficina.findOne({ nome: nomeAtual })
        
        if (!oficina) {
            return res.status(404).json({ message: 'Oficina não encontrada.' })
        }

        // 2. Verificação de permissão (Só o criador pode editar)
        // Se o admin não tiver o campo criador (oficinas antigas), essa verificação pode falhar ou precisa ser tratada
        if (oficina.criador && oficina.criador.toString() !== req.user.id) {
        	return res.status(403).json({ message: 'Acesso negado. Apenas o criador desta oficina pode alterá-la.' })
        }

        // Atualiza os campos (note que 'titulo' no front vira 'nome' no banco)
        if (titulo) oficina.nome = titulo
        if (professor) oficina.professor = professor
        if (descricao) oficina.descricao = descricao
        if (data && horario) {
            oficina.data = new Date(`${data}T${horario}`)
            oficina.horario = horario
        }
        if (vagas) oficina.vagas = vagas

        await oficina.save()

        res.status(200).json({ message: 'Oficina atualizada com sucesso!', oficina })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Erro ao atualizar oficina.' })
    }
})

// =========================
// ALTERAR STATUS (ADMIN)  << NOVO
// =========================

router.patch('/api/oficinas/:id/status', authAdmin, async (req, res) => {
    try {
        const { novoStatus } = req.body // opcional: 'Aberta', 'finalizada', etc.

        const oficina = await Oficina.findById(req.params.id)
        if (!oficina) {
            return res.status(404).json({ message: 'Oficina não encontrada.' })
        }

        // Se front enviar explicitamente:
        if (novoStatus) {
            oficina.status = novoStatus
        } else {
            // fallback: alterna Aberta/finalizada
            oficina.status = oficina.status === 'Aberta' ? 'finalizada' : 'Aberta'
        }

        await oficina.save()
        return res.status(200).json({
            message: 'Status atualizado com sucesso!',
            status: oficina.status
        })
    } catch (error) {
        console.error('Erro ao alterar status da oficina:', error)
        res.status(500).json({ message: 'Erro ao alterar status da oficina.' })
    }
})

// =========================
// INSCRIÇÃO / CANCELAMENTO
// =========================

router.post('/api/oficinas/:id/inscrever', async (req, res) => {
    await atualizarStatusOficinas()
    try {
        const { email } = req.body
        const oficinasId = req.params.id

        if (!email || !oficinasId) {
            return res.status(400).json({ msg: 'Email e ID da oficina são obrigatórios.' })
        }

        const user = await User.findOne({ email })
        const oficina = await Oficina.findById(oficinasId)

        if (!user) return res.status(404).json({ msg: 'Usuário não encontrado.' })
        if (!oficina) return res.status(404).json({ msg: 'Oficina não encontrada.' })

        if (oficina.status !== 'Aberta') {
            return res.status(400).json({ msg: 'Oficina encerrada para inscrições' })
        }


        const jaInscrito = (user.oficinasInscritas || []).some(
            (o) => o.oficina.toString() === oficina._id.toString()
        )
        if (jaInscrito) {
            return res.status(409).json({ msg: 'Usuário já inscrito nesta oficina.' })
        }

        // Verifica vagas disponíveis
        if (oficina.inscritos.length >= oficina.vagas) {
            return res.status(403).json({ msg: 'Oficina sem vagas disponíveis.' })
        }

        // Efetua a inscrição
        user.oficinasInscritas.push({
            oficina: oficina._id,
            status: 'inscrito',
            dataInscricao: new Date()
        })
        oficina.inscritos.push(user._id)

        await user.save()
        await oficina.save()

        res.status(200).json({ msg: 'Inscrição realizada com sucesso!' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: 'Erro ao realizar inscrição' })
    }
})

// Cancelar
router.delete('/api/oficinas/:id/cancelar', async (req, res) => {
    await atualizarStatusOficinas()
    const { email } = req.body
    const oficinasId = req.params.id

    if (!email || !oficinasId) {
        return res.status(400).json({ erro: 'Email e ID da oficina são obrigatórios' })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ erro: 'Usuário não encontrado' })
        }

        const oficina = await Oficina.findById(oficinasId)
        if (!oficina) {
            return res.status(404).json({ erro: 'Oficina não encontrada' })
        }

        if (oficina.status !== 'Aberta') {
            return res.status(400).json({ msg: 'Erro ao cancelar: oficina encerrada' })
        }

        const beforeCount = oficina.inscritos.length
        oficina.inscritos = oficina.inscritos.filter(
            (inscritoId) => inscritoId.toString() !== user._id.toString()
        )
        const afterCount = oficina.inscritos.length

        user.oficinasInscritas = (user.oficinasInscritas || []).filter(
            (o) => o.oficina.toString() !== oficina._id.toString()
        )
        await user.save()

        if (beforeCount === afterCount) {
            return res.status(400).json({ erro: 'Usuário não está inscrito nesta oficina' })
        }

        await oficina.save()

        res.json({ msg: 'Inscrição cancelada com sucesso' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ erro: 'Erro ao cancelar inscrição' })
    }
})


module.exports = router

