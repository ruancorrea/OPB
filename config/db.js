if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://@cluster0-qgt2f.mongodb.net/test?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/opb"}
}