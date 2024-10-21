const express = require('express');
const app = express();

app.use(express.json());

app.post('/user/login', (req,res) => {
    //process user to login
})

app.post('/user/logout', (req,res) => {
    //process user to logout
})

app.get('/user/id', (req,res) => {
    //get users id to signup
})