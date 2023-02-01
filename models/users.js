const mongoose = require('mongoose')

const usersSchema = new mongoose.Schema({
    number: String,
    password: String
})

module.exports = mongoose.model('users',usersSchema)