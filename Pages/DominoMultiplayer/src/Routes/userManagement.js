const express = require('express');
const router = express.Router();
const usersAuth = require('./usersAuth');

const userManagement = express.Router();

//POST ROUTES
userManagement.post('/addUser', usersAuth.addUserToAuthList, (req, res) => {
	res.sendStatus(200);
});

//GET ROUTES
userManagement.get('/', usersAuth.userAuthentication, (req, res) => {
    const userName = usersAuth.getUserInfo(req.session.id).name;
    res.json({name:userName});
});

userManagement.get('/allUsers', usersAuth.userAuthentication, (req, res) => {
    res.json(usersAuth.getAllUsers());
});

userManagement.get('/name', (req, res) => {
    res.json(usersAuth.getUserInfo(req.session.id));
});


userManagement.get('/logout', [
	(req, res, next) => {	
		const userinfo = usersAuth.getUserInfo(req.session.id);
		next();
	}, 
	usersAuth.removeUserFromAuthList,
	(req, res) => {
		res.sendStatus(200);		
	}]
);

module.exports = userManagement;