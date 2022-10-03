const e = require('express');
const fs = require('fs');
const { resolve } = require('path');

var employees = [];
var departments = [];

function initialize(){
    return new Promise(function(resolve, reject){
        fs.readFile('./data/employees.json', (err,data) =>{
            if (err) reject("Failure to read file employees.json!");
            employees = JSON.parse(data);
        });
        fs.readFile('./data/departments.json', (err,data) => {
            if(err) reject("Failure to read file employees.json!");
            departments =  JSON.parse(data);
        });
        resolve();
    })
}

function getAllEmployees(){
    return new Promise(function(resolve, reject){
        if(employees.length == 0) reject("No results returned");
        resolve(employees);
    })

}

function getManagers(){
    var manager = [];
    return new Promise(function(resolve, reject){
        if(employees.length == 0) reject ("No results returned");
        for(let i = 0; i < employees.length; i++){
            if(employees[i].isManager == true){
                manager.push(employees[i]);
            }
        }
        resolve(manager);
    })
}

function getDepartments(){
    return new Promise(function(resolve, reject){
        if(employees.length == 0) reject ("No results returned");
        resolve(departments);
    })
}


module.exports = {initialize, getAllEmployees, getManagers, getDepartments};