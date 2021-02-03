const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/',function(req,res){
res.send({
message:'Default route'
});
});
app.listen(PORT,()=>{
console.log(`Listening on PORT: ${PORT}`)
});