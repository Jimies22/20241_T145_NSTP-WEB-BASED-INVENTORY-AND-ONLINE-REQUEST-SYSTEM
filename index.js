const express = require('express');
const app = express();

app.use(express.json());

app.post('/user/calendar', (req,res) => {
    //Google Calendar
})

app.post('/user/Authentication', (req,res) => {
    //Google Authentication
})

// app.get('/user/:id', (req,res) => {
//     //get users id to signup
// })