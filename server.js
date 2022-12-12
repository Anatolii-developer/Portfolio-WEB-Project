/*********************************************************************************
* WEB322 – Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students. *
* Name: Anatolii Hryhorzhevskyi Student ID: 150314201 Date: 12/11/2022 *
* Online (Heroku Cyclic) Link: ________________________________________________________ * ********************************************************************************/
var express = require('express'); // Include express.js module
const path = require("path"); // include module path to use __dirname, and function path.join()
const fs = require('fs');
const data = require("./data-service.js");
const multer = require ("multer");
var exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");
const dataServiceAuth = require("./data-service-auth");

var app = express();
app.use(express.static(__dirname));
app.use(express.static("/public"));
app.use("/images", express.static(path.join(__dirname, "/public/images")));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "assign6web322anatolii", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));

  app.use(function(req, res, next){
    res.locals.session = req.session; 
    next();
  });
  
  function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.render("login");
    } else {
      next();
    }
  }

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


app.get("/login", (req, res) => {
   res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
  });

app.post("/register", function (req, res){
    dataServiceAuth.registerUser(req.body)
    .then(() => res.render('register', { successMessage: "User created!"}))
    .catch((err) => res.render('register', { errorMessage: err, userName: req.body.userName }));
});

app.post("/login", function(req, res){
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
        userName: user.userName, 
        email: user.email,
        loginHistory: user.loginHistory 
        }
        console.log(req.session.user.userName);
        res.redirect('/employees');
       }) .catch((err) => res.render('login', {errorMessage: err}))
});

app.get("/logout", function(req, res) {
    req.session.reset();
    res.render("login");
  });
app.get("/userHistory", ensureLogin, function(req, res){
    var history = req.session.user
    res.render("userHistory", {user: history}); 
    console.log(history.username);
});

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req, res){
    res.render(path.join(__dirname, "/views/home"))
});

app.get("/about", function(req, res){
    res.render(path.join(__dirname, "/views/about"))
}); 

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {    
    let em = req.params.empNum;
    data.deleteEmployeeByNum(em).then(res.redirect("/employees")).catch((
    ) => res.status(500).send("Unable to Remove Employee"))
})

app.get('/managers', ensureLogin, function(req, res){
    data.getManagers().then(value =>
        res.json(value)).catch((err) => res.json(err));
});

app.get('/departments', ensureLogin, (req, res)=>{
    data.getDepartments().then(value => {
        if (value.length > 0) {
            res.render("departments", { value: value });
        }
        else {
            res.render("departments",{ message: "no results" });
        }
    }).catch((err)=>res.render("departments", {message: "no results"}));
});


app.get('/departments/add', ensureLogin, (req, res)=>{
    res.render('addDepartment')
});

app.post('/departments/add', ensureLogin, (req, res)=>{
    data.addDepartment(req.body).then(
    res.redirect("/departments")
);
});

app.post('/department/update', ensureLogin, (req, res)=>{
    let dupd = req.body;
    console.log(dupd);
    data.updateDepartment(dupd).then(res.redirect(("/departments")));
});
app.post("/employee/update", ensureLogin, (req, res) => { 
    let upd = req.body;
    data.updateEmployee(upd).then(res.redirect(("/employees")));
});

app.get('/employees/add', ensureLogin, function(req, res){
    res.render(path.join(__dirname, "/views/addEmployee"))
});

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage: storage });

  app.post('/images/add', ensureLogin, upload.single("imageFile"), (req,res)=>{
    res.redirect("/images");
  });

  app.get('/images/add', ensureLogin, function(req, res){
res.render(path.join(__dirname, "/views/addImage"))
  });
app.get('/images', ensureLogin, (req, res) => {
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

app.post('/employees/add', ensureLogin, (req, res) => {
    data.addEmployee(req.body).then(()=>{
    res.redirect("/employees");
})
});

app.get("/employees", ensureLogin, (req, res) => {
    let status = req.query.status;
    let department = req.query.department;
    let manager = req.query.manager;
    if (status) {
        data.getEmployeeByStatus(status).then(value => {
            if (data.length > 0) {
                res.render("employees", { value: value });
            }
            else {
                res.render("employees",{ message: "no results" });
            }
        }).catch((err)=>res.render("employees", {message: "no results"}));
    }
    else if (department) {
        data.getEmployeesByDepartment(department).then(value => {
            if (data.length > 0) {
                res.render("employees", { value: value });
            }
            else {
                res.render("employees",{ message: "no results" });
            }
        }).catch((err)=>res.render("employees", {message: "no results"}));
    }
    else if (manager) {
        data.getEmployeesByManager(manager).then(value =>{
            if (data.length > 0) {
                res.render("employees", { value: value });
            }
            else {
                res.render("employees",{ message: "no results" });
            }
        }).catch((err)=>res.render("employees", {message: "no results"}));
    }
    else {
        data.getAllEmployees().then(value => {
            if (value.length > 0) {
                res.render("employees", { value: value });
            }
            else {
                res.render("employees",{ message: "no results" });
            }
        }).catch((err)=>res.render("employees", {message: "no results"}));
    }
});


app.get("/employee/:empNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values 
    let viewData = {};
    data.getEmployeeByNum(req.params.empNum).then((data) => 
    { 
        if (data) {
    viewData.employee = data; //store employee data in the "viewData" object as "employee" 
    } else {
    viewData.employee = null; // set employee to null if none were returned 
}
    }).catch(() => {
    viewData.employee = null; // set employee to null if there was an error
    }).then(data.getDepartments) .then((data) => {
    viewData.departments = data;
    console.log(data); // store department data in the "viewData" object as "departments"
    // loop through viewData.departments and once we have found the departmentId that matches 
    // the employee's "department" value, add a "selected" property to the matching
    // viewData.departments object
    for (let i = 0; i < viewData.departments.length; i++) {
    if (viewData.departments[i].departmentId == viewData.employee.department) {
    viewData.departments[i].selected = true; }
    }
    }).catch(() => {
    viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
    if (viewData.employee == null) { // if no employee - return an error
    res.status(404).send("Employee Not Found"); } else {
    res.render("employee", { viewData: viewData }); // render the "employee" view 
}
    }); 
});
    



app.post("/employee/update", ensureLogin, (req, res) => { 
    let upd = req.body;
    console.log(upd);
    data.updateEmployee(upd).then(res.redirect(("/employees")));
});


data.initialize() .then(dataServiceAuth.initialize) .then(function(){
    app.listen(HTTP_PORT, function(){ console.log("app listening on: " + HTTP_PORT)
    }); }).catch(function(err){
    console.log("unable to start server: " + err); });
