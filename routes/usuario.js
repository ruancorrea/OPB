const express = require("express");
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require("passport")
const nodemailer = require('nodemailer')

const {eUsuario} = require('../helpers/eusuario')

require("../models/Livro")
const Livro = mongoose.model('livros')
require("../models/Genero")
const Genero = mongoose.model('generos')


router.get('/', eUsuario, (req, res) => {

    Livro.find({dono : req.user.id}).then((livros)=>{
        Livro.find({dono : req.user.id}, null, {limit: 3}).sort({_id : -1}).then((livro) =>{
                res.render("usuarios/index", {livros: livros.map(Livro => Livro.toJSON()),
                                                livro: livro.map(Livro => Livro.toJSON())})// salvou minha noite
        }).catch((err) => {
            req.logout()
            req.flash("error_msg", "Houve um erro ao listar os ultimos livros.")
            res.redirect("/")
        })
    }).catch((err) => {
        req.logout()
        req.flash("error_msg", "Houve um erro ao listar os livros.")
        res.redirect("/")
    }) 
})

router.get("/registro", (req, res) => {
    req.logout()
    res.render("usuarios/registro") 
})

router.post("/registro", (req, res, next) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "E-mail inválido"})
    }

    if(req.body.nome.length < 4){
        erros.push({texto: "Nome de usuário muito pequeno"})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito curta."})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida"})
    }

    if(!req.body.senha2 || typeof req.body.senha2 == undefined || req.body.senha2 == null){
        erros.push({texto: "Segunda senha inválida"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas são diferentes. Tente novamente!"})
    }


    if(erros.length > 0){
        res.render('/', {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Conta com e-mail já existente.")
                res.redirect("/")
            }else{
                const novoUsuario = new Usuario({
                    nome : req.body.nome,
                    email : req.body.email,
                    senha : req.body.senha
                })

                //criptogrando a senha

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário.")
                            res.redirect("/")
                        }else{
                            novoUsuario.senha = hash;
                            novoUsuario.save().then(() => {
                                //enviando email

                                let transporter =  nodemailer.createTransport({
                                    host: "smtp.gmail.com",
                                    port: 587,
                                    auth: {
                                        user: "org.pbook@gmail.com",
                                        pass: "bookrc20"
                                    }
                        
                                });
                        
                                transporter.sendMail({
                                    from: "OPB <org.pbook@gmail.com>",
                                    to: novoUsuario.email,
                                    subject: "Cadastro realizado com sucesso.",
                                    text: "Teste",
                                    html: "<h3>Olá, " + novoUsuario.nome + ".</h3> <p>Seja bem-vindo ao sistema de Organização de Livros Pessoais(Organization Personal Books)!</p><p>Aqui você poderia organizar seus livros, tantos os emprestados, quantos os que estão em posse, ou até mesmo os desejáveis.</p>"
                                }).then(message =>{
                                    console.log("\nE-mail enviado com sucesso")

                                }).catch(err => {
                                    console.log(err + "\nHouve um erro ao enviar o e-mail.")
                                })

                                req.flash("success_msg", "Usuário criado com sucesso")
                               /// res.redirect("/") ///
                               passport.authenticate("local", {
                                    successRedirect: "/usuarios/",
                                    failureRedirect: "/",
                                    failureFlash: true
                                })(req, res, next)

                            }).catch((err) => {
                                req.flash("err_msg", "Houve um erro no cadastro do usuário.")
                                res.redirect("/")
                            })
                        }
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

router.get("/login", (req, res) =>{ // rota para login
    req.logout()
    res.render("usuarios/login")  // renderiza o arquivo html
})

router.post("/login", (req, res, next) =>{ // rota de recebendo dos dados do formulario de login
    passport.authenticate("local", {
        successRedirect: "/usuarios/",
        failureRedirect: "/",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res) =>{
    req.logout()
    req.flash("success_msg", "Sessão finalizada.")
    res.redirect("/")
})

router.post("/edit", eUsuario, (req, res) =>{
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "E-mail inválido"})
    }

    if(req.body.nome.length < 4){
        erros.push({texto: "Nome de usuário muito pequeno"})
    }

    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros})
    }else{
        Usuario.findOne({_id: req.body.id}).then((usuario) => {
            if(usuario.email != req.body.email){
                Usuario.findOne({email: req.body.email}).then((existente) =>{
                    if(existente){
                        req.flash("error_msg", "Conta com e-mail já existente.")
                        res.redirect("/")
                    }
                })
            }
            usuario.nome = req.body.nome;
            usuario.email = req.body.email

            usuario.save().then(() => {
                req.flash("success_msg", "Usuário criado com sucesso")
                /// res.redirect("/") ///
                passport.authenticate("local", {
                    successRedirect: "/usuarios/",
                    failureRedirect: "/",
                    failureFlash: true
                })(req, res, next)

                }).catch((err) => {
                    req.flash("err_msg", "Houve um erro no cadastro do usuário.")
                    res.redirect("/")
                })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

router.post('/edit/senhaatual', eUsuario, (req, res) =>{
    Usuario.findOne({_id: req.body.id}).then((usuario) =>{
        bcrypt.compare(req.body.senha, usuario.senha, (erro, batem) =>{
            if(batem){
                res.redirect('/usuarios/alterarsenha')
            }else{
                req.flash("error_msg", "Senha incorreta")
                res.redirect("/")
            }
        })
    })
})

router.get('/alterarsenha', eUsuario, (req,res) =>{
    res.render('usuarios/alterarsenha')
})

router.post('/alterarsenha', eUsuario, (req, res) =>{
    var erros = []

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida"})
    }

    if(!req.body.senha2 || typeof req.body.senha2 == undefined || req.body.senha2 == null){
        erros.push({texto: "Segunda senha inválida"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas são diferentes. Tente novamente!"})
    }


    if(erros.length > 0){
        res.render('usuarios/', {erros: erros})
    }else {
        Usuario.findOne({_id: req.user.id}).then((usuario) =>{
            usuario.senha = req.body.senha;
            //criptogrando a senha

            bcrypt.genSalt(10, (erro, salt) => {
                bcrypt.hash(usuario.senha, salt, (erro, hash) => {
                    if(erro){
                        req.flash("error_msg", "Houve um erro durante o salvamento do usuário.")
                        res.redirect("/")
                    }else{
                        usuario.senha = hash;
                        usuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso")
                           /// res.redirect("/") ///
                           passport.authenticate("local", {
                                successRedirect: "/usuarios/",
                                failureRedirect: "/",
                                failureFlash: true
                            })(req, res, next)

                        }).catch((err) => {
                            req.flash("err_msg", "Houve um erro no cadastro do usuário.")
                            res.redirect("/")
                        })
                    }
                })
            })
        })
    }
})

router.post('/deletarlivros', eUsuario, (req , res) =>{
    Livro.remove({dono: req.user.id}).then(() => {
        req.flash("success_msg", "Livros excluidos com sucesso!");
        res.redirect("/usuarios/ajustes")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao excluir o livro!");
        res.redirect("/usuarios/ajustes")
    })
})

router.post('/deletarconta', eUsuario, (req, res) =>{
    Livro.remove({dono: req.user.id}).then(() => {
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao excluir os livros!");
        res.redirect("/usuarios/ajustes")
    })

    Usuario.remove({_id: req.user.id}).then(() =>{
        req.flash("success_msg", "Conta excluida com sucesso! ):");
        res.redirect("/")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao excluir a conta!");
        res.redirect("/usuarios/ajustes")
    })
})

/*
        LIVROS
                E  
                    RESENHAS
*/



router.get('/livros/', eUsuario, (req, res) => {
    res.redirect('/usuarios/livros/1')
})

router.get('/livros/:page', eUsuario, (req, res) => {
    if(req.params.page==null){
        req.params.page=1; 
    }
    var rota = '';
    Livro.find({dono : req.user.id}).then((tamanho) =>{
        var tam = Math.ceil(tamanho.length / 16)
        if(tam == 0){
            Livro.find({dono : req.user.id}).then((livros) => {
                res.render("usuarios/livros", {livros: livros.map(Livro => Livro.toJSON()), array : array, rota: rota})// salvou minha noite
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os livros.")
                res.redirect("/usuarios")
            })
        }
        else{
            var array = [];
            var i = 1;
            while(i<=tam){
                array.push(i)
                i++;
            }

            if(req.params.page > tam){
                res.redirect('/usuarios/livros/1')
                return;
            }
            var ignora = Math.pow(16, req.params.page-1)
                if(ignora==1){
                    ignora=0;
                }
            Genero.find().then((generos) =>{
                Livro.find({dono : req.user.id}).sort({_id: -1}).limit(16).skip(ignora).then((livros) => {
                    res.render("usuarios/livros", {livros: livros.map(Livro => Livro.toJSON()), array : array, rota: rota, generos: generos.map(Genero => Genero.toJSON())})// salvou minha noite
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os livros.")
                    res.redirect("/usuarios")
                })
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os livros.")
                res.redirect("/usuarios")
            })
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os livros.")
        res.redirect("/usuarios")
    })
})

router.get('/livros/status/:status', eUsuario, (req, res) => {
    res.redirect('/usuarios/livros/status/' + req.params.status + "/1")
})

router.get('/livros/status/:status/:page', eUsuario, (req, res) => {
    if(req.params.page==null){
        req.params.page=1; 
    }
    var ignora = Math.pow(16, req.params.page-1)
    if(ignora==1){
        ignora=0;
    }
    var rota = '/status/:' + req.params.status;
    Livro.find({dono : req.user.id}).where('status').eq(req.params.status).limit(16).sort({_id: -1}).then((livros)=>{
        var tam = Math.ceil(livros.length / 16)
        var array = [];
        var i = 1;
        while(i<=tam){
            array.push(i)
            i++;
        }
        if(req.params.page > tam){
            res.redirect('/usuarios/livros/1')
            return;
        }
        var ignora = Math.pow(16, req.params.page-1)
        if(ignora==1){
            ignora=0;
        }
        if(req.params.status == 'Em posse' || req.params.status == 'Emprestado' || req.params.status == 'Desejável')
            {var rota = '/status/:' + req.params.status;
        } else{
            res.redirect('/usuarios/livros/1')
            return;
        }
        res.render("usuarios/livros", {livros: livros.map(Livro => Livro.toJSON()), array : array, rota: rota})// salvou minha noite
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os livros.")
        res.redirect("/usuarios")
    }) 
})

router.get('/livros/func/add', eUsuario, (req, res) => {
    Genero.find().then((generos) =>{
        res.render("usuarios/addlivros", {generos: generos.map(Genero => Genero.toJSON())});
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar os gênero.")
        res.redirect("/usuarios/livros")
    })
})

router.post('/livros/func/nova', eUsuario, (req, res) => {
    // validação de formularios
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.autor || typeof req.body.autor == undefined || req.body.autor == null){
        erros.push({texto: "Autor inválido"})
    } 

    if(req.body.autor.length < 4){
        erros.push({texto: "Autor muito pequeno"})
    }

    if(!req.body.genero || typeof req.body.genero == undefined || req.body.genero == null){
        erros.push({texto: "Gênero inválido"})
    }
    var cor = null;

    if(req.body.genero == "Narrativo"){
        cor = "primary"
    }

    if(req.body.genero == "Lírico"){
        cor = "success"
    }

    if(req.body.genero == "Dramático"){
        cor = "danger"
    }

    if(!req.body.tipo || typeof req.body.tipo == undefined || req.body.tipo == null){
        erros.push({texto: "Tipo inválido"})
    }

    if(!req.body.status || typeof req.body.status == undefined || req.body.status == null){
        erros.push({texto: "Status inválido"})
    }

    if(req.body.status == 'Emprestado'){
        if(!req.body.emprestadoA || typeof req.body.emprestadoA == undefined || req.body.emprestadoA == null){
            erros.push({texto: "A quem foi emprestado está inválido"})
        }

        if(!req.body.datadeemprestimo || typeof req.body.datadeemprestimo == undefined || req.body.datadeemprestimo == null){
            erros.push({texto: "Data de empréstimo está inválida"})
        }
    }else{
        req.body.emprestadoA = null;
        req.body.datadeemprestimo = null;
    }
    
    if(erros.length > 0){
        Genero.find().then((generos) =>{
            res.render("usuarios/addlivros", {erros: erros, generos: generos.map(Genero => Genero.toJSON())});
        }).catch((err) => {
            req.flash("error_msg", "Erro ao carregar os gênero.")
            res.redirect("/usuarios/livros")
        })
    }else{
        const novoLivro = {
            dono : req.user, 
            nome : req.body.nome,
            autor : req.body.autor,
            genero : req.body.genero,
            tipo: req.body.tipo,
            cor: cor,
            status : req.body.status,
            emprestadoA : req.body.emprestadoA,
            datadeemprestimo : req.body.datadeemprestimo
            }
    
        new Livro(novoLivro).save().then(() => {
            req.flash("success_msg",'Livro adicionado com sucesso!')
            res.redirect("/usuarios/livros")
        }).catch((err) => {
            req.flash("error_msg",'Houve um erro ao adicionar o livro. Tente novamente!')
            res.redirect("/usuarios/livros")
        })
    }
})

//editando

router.get("/livros/func/edit/:id", eUsuario, (req, res) => {
    Genero.find().then((genero)=>{
        Livro.findOne({_id: req.params.id}).then((livro) => {
            res.render("usuarios/editlivros", {livro: livro.toJSON(), genero: genero.map(Genero => Genero.toJSON())})
        }).catch((err) => {
            req.flash("error_msg", "Esse livro não existe.")
            res.redirect("/usuarios/livros")
        })
    }).catch((err) => {
        req.flash("error_msg", "Esse livro não existe.")
        res.redirect("/usuarios/livros")
    })
})

router.post("/livros/func/edit", eUsuario, (req, res) => {
    // validação de formularios
    var erros = [];
    var emprestadoA = req.body.emprestadoA
    var datadeemprestimo = req.body.datadeemprestimo;

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.autor || typeof req.body.autor == undefined || req.body.autor == null){
        erros.push({texto: "Autor inválido"})
    }

    if(req.body.autor.length < 4){
        erros.push({texto: "Autor muito pequeno"})
    }

    if(!req.body.genero || typeof req.body.genero == undefined || req.body.genero == null){
        erros.push({texto: "Gênero inválido"})
    }

    var cor = null;

    if(req.body.genero == "Narrativo"){
        cor = "primary"
    }

    if(req.body.genero == "Lírico"){
        cor = "success"
    }

    if(req.body.genero == "Dramático"){
        cor = "danger"
    }

    if(!req.body.tipo || typeof req.body.tipo == undefined || req.body.tipo == null){
        erros.push({texto: "Tipo inválido"})
    }

    if(!req.body.status || typeof req.body.status == undefined || req.body.status == null){
        erros.push({texto: "Status inválido"})
    }

    if(req.body.status == 'Emprestado'){
        if(!req.body.emprestadoA || typeof req.body.emprestadoA == undefined || req.body.emprestadoA == null){
            erros.push({texto: "A quem foi emprestado está inválido"})
        }

        if(!req.body.datadeemprestimo || typeof req.body.datadeemprestimo == undefined || req.body.datadeemprestimo == null){
            erros.push({texto: "Data de empréstimo está inválida"})
        }
    }

    if(erros.length > 0){
        res.render('index', {erros: erros})
    }else{
        Livro.findOne({_id: req.body.id}).then((livro) => {

            if(req.body.status == 'Emprestado'){
                livro.emprestadoA = req.body.emprestadoA,
                livro.datadeemprestimo = req.body.datadeemprestimo
            }else{
                livro.emprestadoA = null;
                livro.datadeemprestimo = null;
            }

            livro.nome = req.body.nome,
            livro.autor = req.body.autor,
            livro.genero = req.body.genero,
            livro.status = req.body.status;
            livro.tipo = req.body.tipo,
            livro.cor = cor,

            livro.save().then(() =>{
                req.flash("success_msg", "Livro editado com sucesso!")
                res.redirect("/usuarios/livros")
            }).catch((err) =>{
                req.flash("error_msg", "Houve um erro ao salvar as alterações do livro.")
                res.redirect("/usuarios/livros")
            })

        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro ao alterar o livro.")
            res.redirect("/usuarios/livros")
        })
    }
})

router.post("/livros/func/deletar", eUsuario, (req, res) => {
    Livro.remove({_id : req.body.id}).then(() => {
        req.flash("success_msg", "Livro excluido com sucesso!");
        res.redirect("/usuarios/livros")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao excluir o livro!");
        res.redirect("/usuarios/livros")
    })
})

 router.get("/livros/func/:id", eUsuario, (req, res) =>{    
    Livro.findOne({_id : req.params.id}).then((livro) =>{
        res.render("usuarios/livro", {livro: livro.toJSON()}) 
     }).catch((err) => {
         req.flash("error_msg", "Essa resenha não existe.")
         res.redirect("/usuarios/livros")
     })
 })

 router.get("/ajustes", eUsuario, (req,res) =>{
     Usuario.findOne({_id : req.user.id}).then((usuario) => {
         Livro.find({dono: req.user.id}).then((livros) =>{
            res.render("usuarios/ajustes", {livros: livros.map(Livro => Livro.toJSON()), usuario: usuario.toJSON()})
         })
     }).catch((err) => {
        req.flash("error_msg", "Houve um problemaa ao pesquisar os dados do usuario.")
     })
 })




 /* RECUPERAÇÃO DE SENHAS */

 router.post('/recuperacao', (req, res) =>{
    Usuario.findOne({email: req.body.email}).then((usuario) =>{
        if(!usuario){
            req.flash("error_msg", "Conta não existente.")
            res.redirect("/")
        }
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        var pass = ''

        for(var i=0; i<7; i++){
            pass += chars.charAt(Math.random() * 61)
        }
        var novasenha = pass;
        usuario.senha = novasenha;

        bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(usuario.senha, salt, (erro, hash) => {
                if(erro){
                    req.flash("error_msg", "Houve um erro durante o salvamento do usuário.")
                    res.redirect("/")
                }else{
                    usuario.senha = hash;
                    usuario.save().then(() => {
                        //enviando email

                        let transporter =  nodemailer.createTransport({
                            service: 'Gmail',
                            host: "smtp.gmail.com",
                            port: 587,
                            auth: {
                                user: "org.pbook@gmail.com",
                                pass: "bookrc20"
                            }
                
                        });
                        console.log(novasenha) 
                        transporter.sendMail({
                            from: "OPB <org.pbook@gmail.com>",
                            to: usuario.email,
                            subject: "Recuperação de senha realizada.",
                            text: "Nova senha",
                            html: "<h3>Olá, " + usuario.nome + ".</h3> <p>Sua senha foi restaurada. Agora sua nova senha é: " + novasenha + "</p> <p>Pedimos que ao receber essa senha, restaure para uma que você se sinta familiarizado.</p> <p>Aqui você poderia organizar seus livros, tantos os emprestados, quantos os que estão em posse, ou até mesmo os desejáveis.</p>"
                        }).then(message =>{
                            console.log("\nE-mail enviado com sucesso")
                            console.log(novasenha)
                        }).catch(err => {
                            console.log(err + "\nHouve um erro ao enviar o e-mail. " + err)
                        })

                        req.flash("success_msg", "E-mail enviado com sucesso")
                       /// res.redirect("/") ///
                       passport.authenticate("local", {
                            successRedirect: "/",
                            failureRedirect: "/",
                            failureFlash: true
                        })(req, res, next)

                    }).catch((err) => {
                        req.flash("err_msg", "Houve um erro no cadastro do usuário.")
                        res.redirect("/")
                    })
                }
            })
        }) 
    }).catch((err) =>{
        console.log('DEU RUIM')
    })
})

module.exports = router;