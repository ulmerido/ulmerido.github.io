const path = require('path');
const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const userManagement = require('./Routes/userManagement');
const gameManagement = require('./Routes/gameManagement');
const chatManagement = require('./Routes/chatManagement');
const auth = require('./Routes/usersAuth');

app.get('/', (req, res, next) => {
    console.log('hello from express');
    next();
});

app.use(session({ secret: 'nancyBotwin', cookie: {maxAge:269999999999}}));
app.use(bodyParser.text());

app.use(express.static(path.resolve(__dirname, "..", "public")));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use('/users', userManagement);
app.use('/games', gameManagement);
app.use('/chat', chatManagement);

app.listen(3000, console.log("Connected to port 3000!"));

