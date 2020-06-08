const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// definindo model - usuarios

const Usuario = new Schema({
    nome: {
        //tipos : String | Number | Date | Object
        type: String,
        require: true
    },

    email: {
        type: String,
        require: true
    },

    eAdmin: {
        type: Number,
        default: 0
    },

    senha: {
        type: String,
        require: true 
    }
})


mongoose.model('usuarios', Usuario)