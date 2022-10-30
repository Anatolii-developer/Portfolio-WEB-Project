/*************************************************************************
* WEB322- Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this assignment has been copied manually or electronically from any other source. * (including 3rd party web sites) or distributed to other students.
*
* Name: Anatolii Hryhorzhevskyi Student ID: 150314201 Date: 10/30/2022
*
* Your app’s URL (from Cyclic Heroku) that I can click to see your application:
* 
*
*************************************************************************/
const data = require("./data-service.js");
var express = require('express'); // Include express.js module
const multer = require ("multer");
var app = express();
const fs = require('fs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

var path = require("path"); // include moduel path to use __dirname, and function path.join()
const { response } = require("express");
const { callbackify, isBuffer } = require("util");

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
});

app.get('/employees/add', function(req, res){
    res.sendFile(path.join(__dirname, "/views/addEmployee.html"))
});

app.get('/images/add', function(req, res){
    res.sendFile(path.join(__dirname, "/views/addImage.html"))
});

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage: storage });

  app.post('/images/add', upload.single("imageFile"), (req,res)=>{
    res.redirect("/images");
  });

app.get('/images', function(req, res) {
    fs.readdir("./public/images/uploaded", (err, items) => {
        if (err) 
            console.log("Error uploading the file");
         else {
            res.json(items);
         }
    })
});

app.post('/employees/add', (req, res)=>{
    data.addEmployee(req.body);
    res.redirect("/employees");
});


app.get("employees", (req,res) =>{
    let status = req.query.status;
    let department = req.query.department;
    let manager = req.query.manager
    if(status){
        mod.getEmployeesByStatus(status).then(value => 
            res.json(value)).catch((err) => res.json(err));
    }else if (department){
        mod.getEmployeesByDepartment(department).then(value =>
            res.json(value)).catch((err) => res.json(err));
    }
    else if (manager){
        mod.getEmployeesByManager(manager).then(value =>
            res.json(value)).catch((err) => res.json(err));
    }
    else{
        mod.getAllEmployees().then(value =>
            res.json(value)).catch((err) => res.json(err));
    }
})

app.get("/employee/:num", (req, res) => {
    let num = req.params.num;
    mod.getEmployeeByNum(num).then(value =>
        res.json(value)).catch((err)=>res.json(err));
});

app.use((req, res, next)=>{
    res.status(404).send('Page Not Found!');
});

data.initialize().then(app.listen(HTTP_PORT, onHttpStart)).catch(()=>{console.log("Nope")});


