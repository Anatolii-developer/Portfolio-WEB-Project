/*************************************************************************
* WEB322- Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this assignment has been copied manually or electronically from any other source. * (including 3rd party web sites) or distributed to other students.
*
* Name: Anatolii Hryhorzhevskyi Student ID: 150314201 Date: 10/30/2022
*
* Your app’s URL (from Cyclic Heroku) that I can click to see your application:
* 
*
*************************************************************************/
var express = require('express'); // Include express.js module
const path = require("path"); // include module path to use __dirname, and function path.join()
const fs = require('fs');
const data = require("./data-service.js");
const multer = require ("multer");
var exphbs = require("express-handlebars");

var app = express();
app.use(express.static(__dirname));
app.use(express.static("/public"));
app.use("/images", express.static(path.join(__dirname, "/public/images")));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

 

var HTTP_PORT = process.env.PORT || 8080;  // || : or

// call this function after the http server starts listening for requests
function onHttpStart(){
    console.log("Express http server listening on: " + HTTP_PORT);
}


app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, ""); next();
    });


    app.engine(".hbs", exphbs.engine({
        extname:".hbs" ,
        defaultLayout: "main",
        helpers: { 
            navLink: function(url, options){
                return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
               }, 
               equal: function (lvalue, rvalue, options) {
                if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
                if (lvalue != rvalue) {
                return options.inverse(this);
                } else {
                return options.fn(this);
                }
               }
        }
    }));

    app.set("view engine", ".hbs");
// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req, res){
    res.render(path.join(__dirname, "/views/home"))
});

app.get("/about", function(req, res){
    res.render(path.join(__dirname, "/views/about"))
}); 


app.get('/managers', function(req, res){
    data.getManagers().then(value =>
        res.json(value)).catch((err) => res.json(err));
});

app.get('/departments', (req, res)=>{
     data.getDepartments().then(value =>
        res.render("departments", {departments: value})).catch((err) => res.render({message: "no results"}));
});

app.get('/employees/add', function(req, res){
    res.render(path.join(__dirname, "/views/addEmployee"))
});

app.get('/images/add', function(req, res){
    res.render(path.join(__dirname, "/views/addImage"))
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

app.get('/images', (req, res) => {
    fs.readdir("./public/images/uploaded", (err, items) => {
        if (items.length == 0){ 
            res.send('<html><div class="col-md-12 text-center"><strong>No Images Available</strong></div></html>');
        }
         else {
            imageList = [];
           for(let i = 0; i < items.length; i++){
            imageList.push({src: "/public/images/uploaded/"+items[i], name: items[i]});
           }
           res.render("images", { imageList: imageList })
         }
    });
});

app.post('/employees/add', (req, res) => {
    data.addEmployee(req.body);
    res.redirect("/employees");
});


app.get('/employees', (req,res) => {
    let status = req.query.status;
    let department = req.query.department;
    let manager = req.query.manager
    if(status){
        data.getEmployeesByStatus(status).then(value => 
            res.render("employees", {employees: value})).catch((err) => res.render({message: "no results"}));
    }else if (department){
        data.getEmployeesByDepartment(department).then(value =>
            res.render("employees", {employees: value})).catch((err) => res.render({message: "no results"}));
    }
    else if (manager){
        data.getEmployeesByManager(manager).then(value =>
            res.render("employees", {employees: value})).catch((err) => res.render({message: "no results"}));
    }
    else{
        data.getAllEmployees().then(value =>
            res.render("employees", {employees: value})).catch((err) => res.render({message: "no results"}));
    }
})

app.get("/employee/:num", (req, res) => {
    let num = req.params.num;
    data.getEmployeeByNum(num).then(value =>
        res.render("employee", { employee: value })).catch((err)=>res.render("employee", {message: "no results"}));
});



app.post("/employee/update", (req, res) => { 
    let upd = req.body;
    console.log(upd);
    data.updateEmployee(upd).then(res.redirect(("/employees")));
});


data.initialize().then(app.listen(HTTP_PORT, onHttpStart)).catch(()=>{console.log("Nope")});


