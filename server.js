require('dotenv').config(); //Taking Environment Variables

const express = require("express");
const bodypasrser = require("body-parser");
const path = require("path");
const DBConnect = require("./config/connect");

//Connecting Database
DBConnect();

//Initialize app
const app = express();

// JSON Data
app.use(bodypasrser.json());
app.use(bodypasrser.urlencoded({ extended: true }));

//Setting views directory
app.set("views", path.join(__dirname, '/views'));

//Static Folder
app.use(express.static(path.join(__dirname, '/public')));

//End Points
app.use('/signup', require('./routes/api/user')); 
app.use('/user', require('./routes/api/auth'));


app.listen(process.env.PORT || 8000, () => {
    console.log("Server started at port 8000");
})