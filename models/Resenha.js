const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// definindo model - livros

    const ResenhasSchema = new Schema({
        livro: {
            type: Schema.Types.String,
            ref: "livros",
            required: true
        },

        dono: {
            type: Schema.Types.ObjectId,
            ref: "usuarios",
            required: true
        },

        tipo: {
            type: Schema.Types.String,
            ref: "usuarios",
            required: true
        },

        cor: {
            type: Schema.Types.String,
            ref: "livros",
            required: true
        },

        titulo: {
            //tipos : String | Number | Date | Object
            type: String,
            require: true
        }, 
        autor: {
            type: Schema.Types.String,
            ref: "usuarios",
            required: true
        },

        texto: {
            //tipos : String | Number | Date | Object
            type: String,
            require: true
        },

        curtida:{   
            type: Number,
            default: 0  
        },

        data: {
            type: Date,
            default: Date.now()
        }
    })

//Collection

    mongoose.model('resenhas', ResenhasSchema)
    