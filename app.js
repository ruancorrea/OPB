// Carregando modulos
    const express = require("express");
    const app = express();
    const handlebars = require('express-handlebars')
    const hbs = handlebars.create({
        defaultLayout: 'main',
        helpers: {
            if_equals: function(a, b, opts) {
                if(a == b){
                    return opts.fn(this);
                }else{
                    return opts.inverse(this);
                }
            }
        }
    })
    const bodyParser = require('body-parser')
    const admin = require("./routes/admin")
    const path = require("path")
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require("./config/auth")(passport)
    const bcrypt = require('bcryptjs')    
    const nodemailer = require('nodemailer')

    const db = require('./config/db')

// Configurações
    // Sessão 
        app.use(session({
            secret: "livrosbackend",
            resave : true,
            saveUninitialized: true

        }))

        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())

    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg") // variavel global
            res.locals.error_msg = req.flash("error_msg") // variavel global
            res.locals.error = req.flash("error") // variavel global
            res.locals.user = req.user || null;
            next();
        })


    // Body Parser 
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

    // Handlebars

        app.engine('handlebars', hbs.engine);
        app.set('view engine', 'handlebars');
 
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI, {
            useMongoClient: true
        }).then(() => {
            console.log("MongoDB conectado!")
        }).catch((err) => {
            console.log("Houve um erro ao se conectar ao mongoDB: " + err)
        })
 
    // Public - Framework Bootstrap
        app.use(express.static(path.join(__dirname, "public")))

// Rotas

    app.get('/', (req, res) => {
        if(req.isAuthenticated()){
            res.redirect('usuarios/')
        }else res.render('index')
    })

    app.get('/menu',(req, res) => {
        res.send("Página principal!")
    })
    
    app.get('/recuperacao',(req, res) => {
        res.render('recuperacao')
    })

    app.get("/404", (req, res) => {  
        res.send("Error 404!")
    })

    app.use('/admin', admin);
    app.use('/usuarios', usuarios)

// Outros
    const PORTA = process.env.PORT || 15829

    app.listen(PORTA, function(){
        console.log("O servidor está rolando na url http://localhost:15829!")
    });

    //Usuario
     