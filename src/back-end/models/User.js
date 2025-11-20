const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nome: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: false, default: false },
    createdAt: { type: Date, default: Date.now },
    oficinasInscritas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Oficina' }] 
}, {
    versionKey: false
})

module.exports = mongoose.model('User', userSchema)