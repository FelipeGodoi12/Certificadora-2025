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

module.exports = router