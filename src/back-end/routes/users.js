const express = require('express')
const router = express.Router()
const User = require('../models/User.js')

// CREATE
router.post('/', async (req, res) => {
    try {
        const user = await User.create(req.body)
        res.status(201).json(user)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// READ
router.get('/', async (req, res) => {
    const users = await User.find()
    res.json(users)
})

// UPDATE
// router.put('/:id', async (req, res) => {
//     const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
//     res.json(user)
// })

// DELETE
router.delete('/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

module.exports = router
