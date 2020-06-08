const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// definindo model - livros

    const GeneroSchema = new Schema({
        
        nome: {
            //tipos : String | Number | Date | Object
            type: String,
            require: true
        },

        slug: {
            type: String,
            require: true
        },

        tipo: {
            type: String,
            require: true 
        },

        data: {
            type: Date,
            default: Date.now()
        }
    })

//Collection

    mongoose.model('generos', GeneroSchema)