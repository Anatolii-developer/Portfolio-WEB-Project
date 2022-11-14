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

function addEmployee(employeeData) {
    return new Promise(function(resolve, reject) {
        if (typeof(employeeData.isManager) == 'undefined' || employeeData.isManager == null) {
            employeeData.isManager = false;
        }
        else {
            employeeData.isManager = true
        }
        employeeData.employeeNum = employees.length + 1;
        employees.push(employeeData);
        resolve();
    })
}

function getEmployeesByStatus(status) {
    var employeesByStatus = [];
    return new Promise(function(resolve, reject) {
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].status == status) {
                employeesByStatus.push(employees[i]);
            }
        }
        if (employeesByStatus.length == 0) {
            reject("No results returned");
        }
        else {
            resolve(employeesByStatus);
        }
    })
}



function getEmployeesByManager(manager) {
    var employeesByManager = [];
    return new Promise(function(resolve, reject) {
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].employeeManagerNum == manager) {
                employeesByManager.push(employees[i]);
            }
        }
        if (employeesByManager.length == 0) {
            reject("No results returned");
        }
        else {
            resolve(employeesByManager);
        }
    })

}

function getEmployeesByDepartment(department) {
    var employeesByDepartment = [];
    return new Promise(function(resolve, reject) {
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].department == department) {
                employeesByDepartment.push(employees[i]);
            }
        }
        if (employeesByDepartment.length == 0) {
            reject("No results returned");
        }
        else {
            resolve(employeesByDepartment);
        }
    })
}
function getEmployeeByNum(num) {
    return new Promise(function(resolve, reject) {
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].employeeNum == num) {
                resolve(employees[i]);
            }
        }
        reject("No results returned");
    })
}
function updateEmployee(employeeData){
    return new Promise(function(resolve, reject){
        for(let i = 0; i < employees.length; i++){
            if(employees[i].SSN == employeeData.SSN){
                let e = employees[i].employeeNum
                employees[i] = employeeData;
                employees[i].employeeNum = e;
                resolve();
            }
        }
        reject("No results returned");
    })
}

module.exports = {initialize, getAllEmployees, getManagers, getDepartments, addEmployee, getEmployeesByStatus, getEmployeesByManager, getEmployeeByNum, getEmployeesByDepartment, updateEmployee};