if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://RCbook:ruwzinho00@cluster0-qgt2f.mongodb.net/test?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/opb"}
}