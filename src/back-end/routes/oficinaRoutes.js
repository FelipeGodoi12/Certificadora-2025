// Middleware de autenticação de usuário normal
const authUser = require('../middlewares/authUser')

// Rota para inscrever usuário em uma oficina
router.post('/api/oficinas/:id/inscrever', authUser, async (req, res) => {
    try {
        const oficina = await Oficina.findById(req.params.id)
        if (!oficina) return res.status(404).json({ message: 'Oficina não encontrada.' })

        const User = require('../models/User')
        const usuario = await User.findById(req.user.id)
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' })

        // Verifica se já está inscrito
        if (oficina.inscritos.includes(usuario._id)) {
            return res.status(400).json({ message: 'Usuário já inscrito nesta oficina.' })
        }

        oficina.inscritos.push(usuario._id)
        usuario.oficinasInscritas.push(oficina._id)
        await oficina.save()
        await usuario.save()
        res.status(200).json({ message: 'Inscrição realizada com sucesso.' })
    } catch (error) {
        res.status(500).json({ message: 'Erro ao inscrever na oficina.' })
    }
})

// Rota para cancelar inscrição
router.delete('/api/oficinas/:id/cancelar', authUser, async (req, res) => {
    try {
        const oficina = await Oficina.findById(req.params.id)
        if (!oficina) return res.status(404).json({ message: 'Oficina não encontrada.' })

        const User = require('../models/User')
        const usuario = await User.findById(req.user.id)
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' })

        // Remove o usuário do array de inscritos
        oficina.inscritos = oficina.inscritos.filter(id => id.toString() !== usuario._id.toString())
        usuario.oficinasInscritas = usuario.oficinasInscritas.filter(id => id.toString() !== oficina._id.toString())
        await oficina.save()
        await usuario.save()
        res.status(200).json({ message: 'Inscrição cancelada com sucesso.' })
    } catch (error) {
        res.status(500).json({ message: 'Erro ao cancelar inscrição.' })
    }
})
const express = require('express')
const router = express.Router()
const Oficina = require('../models/Oficinas')
const authAdmin = require('../middlewares/authAdmin')

// Rota de listagem (para a página de oficinas)
// (Modificada para incluir a pesquisa)
router.get('/oficinas/list', async (req, res) => {
  try {
    const { search } = req.query;
    let filtro = {}; 
    
    if (search) {
      filtro = {
        $or: [
          { nome: { $regex: search, $options: 'i' } },
          { professor: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const oficinas = await Oficina.find(filtro);
    res.status(200).json(oficinas);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar oficinas" });
  }
});


// Rota para CRIAR oficina (MODIFICADA)
// 1. Adicionámos o middleware authAdmin
// 2. Adicionámos o req.user.id ao campo 'criador'
router.post('/criar-oficina', authAdmin, async (req, res) => {
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
            vagas: vagas,
            criador: req.user.id // Salva quem criou
        })

        await novaOficina.save()

        res.status(201).json({ message: 'Oficina criada com sucesso!', oficina: novaOficina })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Erro ao criar oficina.' })
    }
})

// --- NOVAS ROTAS PARA EDIÇÃO ---

// Rota para BUSCAR UMA oficina por ID
router.get('/api/oficinas/:id', authAdmin, async (req, res) => {
    try {
        const oficina = await Oficina.findById(req.params.id);
        if (!oficina) {
            return res.status(404).json({ message: 'Oficina não encontrada.' });
        }
        res.status(200).json(oficina);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar oficina.' });
    }
});

// Rota para ATUALIZAR UMA oficina por ID
router.put('/api/oficinas/:id', authAdmin, async (req, res) => {
    try {
        const { titulo, professor, descricao, data, horario, vagas } = req.body;
        
        const oficina = await Oficina.findById(req.params.id);
        if (!oficina) {
            return res.status(404).json({ message: 'Oficina não encontrada.' });
        }

        // REGRA DE NEGÓCIO: Só o criador pode editar
        if (oficina.criador.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado. Você não é o criador desta oficina.' });
        }

        // Atualiza os campos
        oficina.nome = titulo;
        oficina.professor = professor;
        oficina.descricao = descricao;
        oficina.data = new Date(`${data}T${horario}`);
        oficina.horario = horario;
        oficina.vagas = vagas;

        await oficina.save();

        res.status(200).json({ message: 'Oficina atualizada com sucesso!', oficina: oficina });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar oficina.' });
    }
});


module.exports = router
