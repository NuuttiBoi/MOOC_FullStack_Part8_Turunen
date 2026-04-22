const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
    },
    favoriteGenre: {
        type: String,
        required: true,
        default: 'unknown'
    },
})

module.exports = mongoose.model('User', userSchema)