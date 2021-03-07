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

//Static Folder
app.use(express.static(path.join(__dirname, '/upload')));

//End Points
app.use('/signup', require('./routes/api/user')); // Signup Route
app.use('/user', require('./routes/api/auth')); // Login Route
app.use('/products', require('./routes/api/product')); // Product Routes
app.use('/orders', require('./routes/api/order')); // Order Routes

app.listen(process.env.PORT || 8000, () => {
    console.log("Server started at port 8000");
})