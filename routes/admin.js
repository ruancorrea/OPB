const express = require("express");
const router = express.Router()
const mongoose = require('mongoose')
const {eAdmin} = require('../helpers/eadmin')
const {eUsuario} = require('../helpers/eusuario')


require("../models/Livro")
const Livro = mongoose.model('livros')
require("../models/Resenha")
const Resenha = mongoose.model('resenhas')
require("../models/Genero")
const Genero = mongoose.model('generos')
require("../models/Usuario")
const Usuario = mongoose.model('usuarios')

router.get('/', eUsuario, eAdmin, (req, res) => {
    Genero.find().then((generos) =>{
        Livro.find().then((livros) =>{
            Resenha.find().then((resenhas) =>{
                Usuario.find().then((usuarios) => {
                    res.render("admin/index", {generos: generos.map(Genero => Genero.toJSON()), livros: livros.map(Livro => Livro.toJSON()),
                                               resenhas: resenhas.map(Resenha => Resenha.toJSON()), usuarios: usuarios.map(Usuario => Usuario.toJSON())})
                }).catch((err) => {
                    req.flash("error_msg", "Problema ao carregar os usuarios.")
                    res.redirect("/usuarios/")
                })
            }).catch((err) => {
                req.flash("error_msg", "Problema ao carregar as resenhas.")
                res.redirect("/usuarios/")
            })
        }).catch((err) => {
            req.flash("error_msg", "Problema ao carregar os livros.")
            res.redirect("/usuarios/")
        })
    }).catch((err) => {
        req.flash("error_msg", "Problema ao carregar os gêneros.")
        res.redirect("/usuarios/")
    })
})

router.get('/posts', eUsuario, eAdmin, (req, res) => {
    res.send("Página de posts!")
})

router.get('/generos', eUsuario, eAdmin, (req, res) =>{
    Genero.find().then((generos)=>{
        res.render("admin/generos", {generos: generos.map(Genero => Genero.toJSON())});
    }).catch((err) => {
        req.flash("error_msg", "Problema ao carregar os gêneros.")
        res.redirect("/admin/index")
    })
})

router.post('/generos/nova', eUsuario, eAdmin, (req, res) => {
    // validação de formularios
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    } 

    if(req.body.slug.length < 3){
        erros.push({texto: "Slug muito pequeno"})
    }

    if(!req.body.genero || typeof req.body.genero == undefined || req.body.genero == null){
        erros.push({texto: "Gênero inválido"})
    }

    if(erros.length > 0){
        res.render('admin/addgenero', {erros: erros})
    }else{
        const novogenero = { 
            nome : req.body.nome,
            slug : req.body.slug,
            tipo : req.body.genero
            }
    
        new Genero(novogenero).save().then(() => {
            req.flash("success_msg",'Gênero adicionado com sucesso!')
            res.redirect("/admin/generos")
        }).catch((err) => {
            req.flash("error_msg",'Houve um erro ao adicionar o livro. Tente novamente!')
            res.redirect("/admin")
        })
    }
})

router.get("/generos/edit/:id", eUsuario, eAdmin, (req, res) => {

    Genero.findOne({_id: req.params.id}).then((genero) => {
        res.render("admin/editgenero", {genero : genero.toJSON()})
    }).catch((err) => {
        req.flash("error_msg", "Esse gênero não existe.")
        res.redirect("/admin/genero")
    })
})

router.post("/generos/edit", eUsuario, eAdmin, (req, res) => {
    // validação de formularios
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(!req.body.genero || typeof req.body.genero == undefined || req.body.genero == null){
       erros.push({texto: "Tipo inválido"})
   }

    if(erros.length > 0){
        res.render('index', {erros: erros})
    }else{
        Genero.findOne({_id: req.body.id}).then((genero) => {
            genero.nome = req.body.nome,
            genero.slug = req.body.slug,
            genero.tipo = req.body.genero,

            genero.save().then(() =>{
                req.flash("success_msg", "Gênero editado com sucesso!")
                res.redirect("/admin/generos")
            }).catch((err) =>{
                req.flash("error_msg", "Houve um erro ao salvar as alterações do gênero.")
                res.redirect("/admin/generos")
            })

        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro ao alterar o gênero.")
            res.redirect("/admin/generos")
        })
    }
})


router.post("/generos/deletar", eUsuario, eAdmin, (req, res) => {
    Genero.remove({_id : req.body.id}).then(() => {
        req.flash("success_msg", "Gênero excluido com sucesso!");
        res.redirect("/admin/generos")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao excluir o gênero!");
        res.redirect("/usuarios/resenhas")
    })
})

module.exports = router;