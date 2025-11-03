const mongoose = require('mongoose');

const oficinaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    data: { type: Date, required: true },
    duracao: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
}, {
    versionKey: false
})

module.exports = mongoose.model('Oficina', oficinaSchema)