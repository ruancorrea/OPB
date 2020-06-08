const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// definindo model - livros

    const LivrosSchema = new Schema({
        dono: {
            type: Schema.Types.ObjectId,
            ref: "usuarios",
            required: true
        },
        nome: {
            //tipos : String | Number | Date | Object
            type: String,
            require: true
        },

        autor: {
            type: String,
            require: true
        },

        genero: {
            type: String,
            required: true
        },

        tipo: {
            type: Schema.Types.String,
            ref: "generos",
            required: true 
        },

        cor: {
            type: String,
            required: true
        },

        status: {
            type: String,
            require: true 
        },

        emprestadoA: {
            type: String 
        },

        datadeemprestimo: {
            type: String 
        },

        data: {
            type: Date,
            default: Date.now()
        }
    })

//Collection

    mongoose.model('livros', LivrosSchema)