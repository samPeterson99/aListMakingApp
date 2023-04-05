const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    id: {
        type: mongoose.Schema.Types.ObjectId,
    },

})

module.exports = mongoose.model('User', UserSchema)