/* (1) you can rename your heroku app inside the application using the command from terminal:
 * heroku apps:rename newname
 * if rename from outside the app:
 * heroku apps:rename newname --app oldname
 * 
 * (2) When you try to install Heroku CLI on MacOS, using the following command
 * brew tap heroku/brew && brew install heroku
 * you may encounter the error showing 
 * bash: brew: command not found
 * 
 * That may be because you don't have brew yet.
 *  Make sure you've already installed brew on your system.
 *  if not try read this :
    https://brew.sh/
    run the following on terminal to install brew, 
 * /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
 * then try the above command: brew tap heroku/brew && brew install heroku
 */
// http://localhost:8080
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


