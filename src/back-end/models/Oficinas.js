const mongoose = require('mongoose');

const oficinaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    professor: { type: String, required: true }, 
    descricao: { type: String, required: true },
    data: { type: Date, required: true },
    horario: { type: String, required: true },    
    vagas: { type: Number, required: true },      
    status: { type: String, default: "Aberta"},
    inscritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now } 
}, {
    versionKey: false
})

module.exports = mongoose.model('oficina', oficinaSchema)