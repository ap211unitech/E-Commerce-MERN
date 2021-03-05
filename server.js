require('dotenv').config();

const express = require("express");
const bodypasrser = require("body-parser");
const expresslayouts = require("express-ejs-layouts");
const path = require("path");

//Initialize app
const app = express();

//For Setting up EJS
app.use(expresslayouts);

//Set template engine
app.set('view engine', 'ejs');

// JSON Data
app.use(bodypasrser.json());
app.use(bodypasrser.urlencoded({ extended: true }));

//Setting views directory
app.set("views", path.join(__dirname, '/views'));

//Static Folder
app.use(express.static(path.join(__dirname, '/public')));

//End Points



app.listen(process.env.PORT || 8000, () => {
    console.log("Server started at port 8000");
})