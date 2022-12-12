var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
    "userName":  {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
      "dateTime": Date,
      "userAgent": String
    }],
  });

  var User = mongoose.model("tbd", userSchema);


  function initialize(){
    return new Promise(function(resolve, reject)
     {
        mongoose.connect("mongodb+srv://ahryhorzhevskyi:Freddy3364@web.nqufcpk.mongodb.net/?retryWrites=true&w=majority")
        .then(resolve()).catch(() =>reject("unable to sync the database"));
    });
}

function registerUser(UserData){
    return new Promise(function (resolve, reject) { 
        if(UserData.password == null || UserData.password[0] == ' ' || UserData.password2 == null || UserData.password2[0] == ' ')
        {
            reject("Error: user name cannot be empty or only white spaces! ");
        }else if (UserData.password != UserData.password2)
        {
            reject ("Error: Passwords do not match");
        }
            let newUser = new User(UserData); 
            bcrypt.hash(UserData.password, 10).then((res)=>{
            newUser.password = res;
            }).catch(() => reject("There was an error encrypting the password"));
            newUser.save(function(err) {
                if (err){
                    if(err.code = 11000){
                        reject("User Name already taken");
                    }
                    else{
                        reject("There was an error creating the user:" + err);
                    }
                }
                else{
                    resolve();
                }
            })
        
    });
}

function checkUser(userData){
    return new Promise(function(resolve, reject) {
        User.findOne({ userName: userData.userName})
        .exec()
        .then((foundUser) => {
            if(!foundUser) {
                reject("Unable to find user:" + userData.userName);
            } 
            else if(!bcrypt.compare(userData.password, foundUser.password)){
                reject("Incorrect Password for user:" + userData.userName);
            }
            else{
                foundUser.loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                User.updateOne(
                  {userName: foundUser.userName},
                  { $set: { loginHistory:  foundUser.loginHistory} }
                ).then(resolve(foundUser)).catch((err) => reject("There was an error verifying the user: " + err))
            }
        }).catch("Unable to find the user: " + userData.userName);
    })
}
module.exports = {initialize, registerUser, checkUser};
