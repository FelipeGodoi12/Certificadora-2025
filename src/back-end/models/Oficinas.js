const mongoose = require('mongoose');

const oficinaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    professor: { type: String, required: true }, 
    descricao: { type: String, required: true },
    data: { type: Date, required: true },
    horario: { type: String, required: true },    
    vagas: { type: Number, required: true },      
    status: { type: Boolean, default: true},
    createdAt: { type: Date, default: Date.now } 
}, {
    versionKey: false
})

module.exports = mongoose.model('oficina', oficinaSchema)