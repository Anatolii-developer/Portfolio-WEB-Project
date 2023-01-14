const Sequelize = require('sequelize');
const a = require('express');
const fs = require('fs');

var sequelize = new Sequelize('axrfemfs', 'axrfemfs', 'u4zzPWtYV6Vfe5R6IGh8dV9W_WVqIlJW', 
{ host: 'peanut.db.elephantsql.com',
dialect: 'postgres', port: 5432, dialectOptions: {
ssl: true },
query:{raw: true}, // update here, you. Need this
});

sequelize.authenticate().then(()=> console.log('Connection success.')).catch((err)=>console.log("Unable to connect to DB.", err));


var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    departmentName: Sequelize.STRING
});

function initialize(){
    return new Promise(function(resolve, reject)
     {
        sequelize.sync().then(resolve()).catch(() =>reject("unable to sync the database"));
    });
}


function getAllEmployees() {
    return new Promise(function(resolve, reject) {
        Employee.findAll().then((data) => resolve(data)).catch(() => reject("no results returned"));
    })
};



function getManagers(){
    return new Promise(function (resolve, reject) { reject();
    });
}

function getDepartments(){
   return new Promise(function(resolve, reject){
    Department.findAll().then(data => resolve(data)).catch(() => reject("no results returned"));
   })
}

function addEmployee(employeeData) {
    return new Promise(function(resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (var i in employeeData) {
        if (i == "") {
            i = null;
        }
        }   
        Employee.create(employeeData).then(resolve()).catch(() => reject("unable to create employee"));
    })
}

function getEmployeeByStatus(status){
    return new Promise((resolve,reject) => {
        Employee.findAll({
            where:{
                status: status
            }
        })
        .then(data => resolve(data))
        .catch(reject("no results returned"))
    })
};

function getEmployeesByDepartment(department){
    return new Promise((resolve, reject) =>{
        Employee.findAll({
            where:{
                department : department
            }
        })
        .then(data => resolve(data))
        .catch(reject("no results returned"))
    })
}

function getEmployeesByManager(manager){
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where:{
                employeeManagerNum: manager
            }
        })
        .then(data => resolve(data))
        .catch(reject('no results returned'))
        })
}

function getEmployeeByNum(num){
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where:{
                employeeNum: num
            }
        })
        .then(data => resolve(data[0]))
        .catch(reject('no results returned'))
        })
}
function updateEmployee(employeeData){
    return new Promise(function(resolve, reject){
     employeeData.isManager = (employeeData.isManager) ? true : false;
     for(var a in employeeData){
         if(a = ""){
             a = null;
         }
     }
     Employee.update(employeeData, {where: {employeeNum: employeeData.employeeNum}}).then(resolve()).catch(() => reject("unable to update employee"))
    })
 }

 function addDepartment(departmentData){
    return new Promise(function(resolve, reject){
        for(var a in departmentData){
            if(a = ""){
                a = null;
            }
        }
        Department.create(departmentData).then(resolve()).catch(() => reject("unable to create department"))
       })
 }

 function updateDepartment(departmentData){
    return new Promise(function(resolve, reject){
        for(var a in departmentData){
            if(a = ""){
                a = null;
            }
        }
        Department.update(departmentData, {where: {departmentId: departmentData.departmentId}}).then(resolve()).catch(() => reject("unable to update department"))
       })
 }

 function getDepartmentById(id){
    return new Promise(function(resolve, reject){
        Department.findAll({
            where:{
                departmentId : id
            }
        })
        .then(data => resolve(data[0]))
        .catch(reject('no results returned'))
       })
 }

 function deleteEmployeeByNum(empNum) {
    return new Promise(function(resolve, reject) {
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
        }).then(() => resolve())
            .catch(() => reject("no results"))
    })
}

module.exports = {initialize, getAllEmployees, getManagers, getDepartments, addEmployee, getEmployeeByStatus, getEmployeesByManager, getEmployeeByNum, getEmployeesByDepartment, updateEmployee, addDepartment, updateDepartment, getDepartmentById, deleteEmployeeByNum};
