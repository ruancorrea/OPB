module.exports = {
    eUsuario: function(req, res, next) {

        if(req.isAuthenticated()){
            return next();
        }

        req.flash("error_msg", "Você precisa estar logado.");
        res.redirect('/');


    }
}