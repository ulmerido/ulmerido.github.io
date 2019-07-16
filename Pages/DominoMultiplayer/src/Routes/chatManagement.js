const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const userAuth = require('./usersAuth');

const chatContent = {};
const emptyChat = [];

const chatManagement = express.Router();

chatManagement.use(bodyParser.text());

chatManagement.post("/getChat", userAuth.userAuthentication, (req, res) => {	
        const gameName = JSON.parse(req.body).gameName;
        if(chatContent.hasOwnProperty(gameName) ) {
            res.json(chatContent[gameName]);
        }
        else {
            res.json(emptyChat);
        }
	})
	
    chatManagement.route('/postChat')
	.post(userAuth.userAuthentication, (req, res) => {		
        let arrToAdd = [];
        const gameName = JSON.parse(req.body).gameName;	
        const text = JSON.parse(req.body).text;
        if(chatContent.hasOwnProperty(gameName) ) {
            arrToAdd = chatContent[gameName];
        }
        const userInfo = userAuth.getUserInfo(req.session.id);
        arrToAdd.push({user: userInfo, text: text}); 
        chatContent[gameName] = arrToAdd;        
        res.sendStatus(200);
    });
    
module.exports = chatManagement;