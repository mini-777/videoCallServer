const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
var http = require('http');
var crypto = require('crypto');
var request = require('request');
const bodyParser = require('body-parser');
var admin = require("firebase-admin");

//create signature2
var CryptoJS = require('crypto-js');
var SHA256 = require('crypto-js/sha256');
var Base64 = require('crypto-js/enc-base64');

//file module
var multer = require('multer');

const app = express();

const PORT = 3001;
var serviceAccount = require("./react-cam-test-firebase-adminsdk-wkx3d-91298b79bf.json");
const { token } = require('morgan');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://react-cam-test-default-rtdb.firebaseio.com"
});

const connection =   mysql.createPool({
    user:'admin',
    password:'05750575',
    database: 'videocall',
    host:'videocalldb.cip9531xqh6o.ap-northeast-2.rds.amazonaws.com',
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/',function(req,res){
    res.send({
        message:'Default route'
    });
});
app.post('/login', function (req, res){
    console.log(req.body.email);
    connection.query(`SELECT EXISTS (SELECT * FROM member WHERE email = '${req.body.email}' and password = '${req.body.password}') AS result;`, (error, results, fields) => {
        console.log(results[0].result)
        if (error) {
            console.log(error);
        }else if (results[0].result) {
            connection.query(`select vendor from member where email = '${req.body.email}' and password = '${req.body.password}';`, (error, results, fields) => {
                console.log(results[0].vendor)
                if (error) {
                console.log(error)
                }else if (results[0].vendor){
                    res.send({vendor: true, auth: true});
                }else{
                    res.send({vendor:false, auth:true})
                }
            }
            )

        }else{
            res.send({vendor: false, auth: false});
        }


})});
app.post('/signup', function (req, res) {
    console.log('new user approach !');
    connection.query(`insert into member (name, token, email, password, phonenum, vendor) values ('${req.body.name}', '${req.body.token}', '${req.body.email}', '${req.body.password}', '${req.body.phoneNum}', false);`, (error, results, fields) => {

        if (error) {
            console.log(error);
        }else{
            res.send({result: 'success'});
        }
    })});
app.post('/sendsms', function(req, res) {
    var user_phone_number = req.body.phoneNum;
    var user_auth_number = req.body.authNum;
    var resultCode = 404;
    console.log(user_phone_number, user_auth_number);
    const date = Date.now().toString();
    const uri = 'ncp:sms:kr:261726177309:videocall_auth';
    const secretKey = 'juigbGn1wCaFx37mRn8WoA0kOgfbNXsvBwxrkvQ1';
    const accessKey = 'XCqQ5Uk1ovlbAs7FjFbS';
    const method = 'POST';
    const space = " ";
    const newLine = "\n";
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
    const url2 = `/sms/v2/services/${uri}/messages`;

    const  hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

    hmac.update(method);
    hmac.update(space);
    hmac.update(url2);
    hmac.update(newLine);
    hmac.update(date);
    hmac.update(newLine);
    hmac.update(accessKey);

    const hash = hmac.finalize();
    const signature = hash.toString(CryptoJS.enc.Base64);
    request({
        method : method,
        json : true,
        uri : url,
        headers : {
            'Contenc-type': 'application/json; charset=utf-8',
            'x-ncp-iam-access-key': accessKey,
            'x-ncp-apigw-timestamp': date,
            'x-ncp-apigw-signature-v2': signature
        },
        body : {
            'type' : 'SMS',
            'countryCode' : '82',
            'from' : '01028290575',
            'content' : `MUZIN 인증번호 [${user_auth_number}] 입니다.`,
            'messages' : [
                {
                    'to' : `${user_phone_number}`
                }
            ]
        }
    }, function(err, res, html) {
        if(err) console.log(err);
        else {
            resultCode = 200;
            console.log(html);
        }
    });

    res.json({

        'code' : resultCode
    });
    res.end()
});


app.post('/send', function(req, res) {
    console.log(req.body.token)
    admin.messaging().sendToDevice(
        [req.body.token], // device fcm tokens...
        {
            notification: {
                title: req.body.title,
                body: req.body.subject,
            },
        },
        {
            // Required for background/quit data-only messages on iOS
            contentAvailable: true,
            // Required for background/quit data-only messages on Android
            priority: 'high',
        },
    );
});

app.listen(PORT,()=>{
    console.log(`Listening on PORT: ${PORT}`)
});