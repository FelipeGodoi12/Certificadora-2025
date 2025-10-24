const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    login: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now() }
},{
    versionKey: false
})

module.exports = mongoose.model('User', userSchema)