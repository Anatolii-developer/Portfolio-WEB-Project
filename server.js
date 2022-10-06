/************************************************************************** 
* WEB322– Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students. *
* Name: Anatolii Hryhorzhevskyi Student ID: 150314201 Date:  *
* Your app’s URL (from Cyclic) : https://tame-pink-colt-yoke.cyclic.app
**************************************************************************/
const data = require("./data-service.js");
var express = require("express"); // Include express.js module
var app = express();

var path = require("path"); // include moduel path to use __dirname, and function path.join()
const { response } = require("express");
const { callbackify } = require("util");

var HTTP_PORT = process.env.PORT || 8080;  // || : or

// call this function after the http server starts listening for requests
function onHttpStart(){
    console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static('public'));
// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "/views/home.html"))
});

app.get("/about", function(req, res){
    res.sendFile(path.join(__dirname, "/views/about.html"))
});


app.get('/managers', function(req, res){
    data.getManagers().then(value =>
        res.json(value)).catch((err) => res.json(err));
});

app.get("/employees", function(req, res){
    data.getAllEmployees().then(value => 
        res.json(value)).catch((err)=>res.json(err));
});

app.get('/departments', (req, res)=>{
     data.getDepartments().then(value =>
        res.json(value)).catch((err) => res.json(err));
})



app.use((req, res, next)=>{
    res.status(404).send('Page Not Found!');
})


data.initialize().then(app.listen(HTTP_PORT, onHttpStart)).catch(()=>{console.log("Nope")});


