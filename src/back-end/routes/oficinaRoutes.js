const express = require('express')
const router = express.Router()
const Oficina = require('../models/Oficinas')
const authAdmin = require('../middlewares/authAdmin')


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

router.get('/api/oficinas', async (req, res) => {
    try {
        // Busca oficinas onde o status é true (ativas)
        const oficinas = await Oficina.find({ status: true }).sort({ data: 1 }) // Ordena pela data
        res.status(200).json(oficinas)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Erro ao buscar oficinas.' })
    }
})


module.exports = router
