require('dotenv').config();

const mysql = require("mysql");
const inquirer = require("inquirer");
const mySQL_PORT = process.env.MYSQL_PORT || 3306;

class Database {
  constructor( config ) {
      this.connection = mysql.createConnection( config );
  }
  query( sql, args ) {
      return new Promise( ( resolve, reject ) => {
          this.connection.query( sql, args, ( err, rows ) => {
              if ( err )
                  return reject( err );
              resolve( rows );
          } );
      } );
  }
  close() {
      return new Promise( ( resolve, reject ) => {
          this.connection.end( err => {
              if ( err )
                  return reject( err );
              resolve();
          } );
      } );
  }
}

const db = new Database({
    host: process.env.DB_HOST,
    port: mySQL_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    insecureAuth : true
});

let response

async function mainApp(){
    response = await inquirer.prompt([
        {
            type: "list",
            name: "manage",
            message: "What would you like to manage today?",
            choices:[
                        { name: "Manage Departments", value: "department" },
                        { name: "Manage Roles", value: "role" },
                        { name: "Manage Employees", value: "employee" }
                    ]
        }
    ])

    if( response.manage == "department" ){
        const viewDepartment = await db.query( "SELECT * FROM department" )
        response = await inquirer.prompt([
            {   
                type: "list",
                name: "action",
                message: "What would you like do?", 
                choices:[   
                            { name: "View departments", value: "view" },
                            { name: "Add new department", value: "add" },
                            { name: "Delete existing department", value: "delete" },
                            { name: "View total utilized budget of a department ", value: "budget" },
                            { name: "Return to main menu", value: "return" }
                        ]
            }
        ])
        if( response.action == "view"){
            console.table( viewDepartment );
        }
        else if( response.action == "add"){
            response = await inquirer.prompt([
                {
                    type: "input",
                    name: "addDepartment",
                    message: "Write a department you want to add."
                }
            ])
            const addDepartment = await db.query( "INSERT INTO department VALUES(?, ?)", [0, response.addDepartment]);
            console.log(`ADDED new department ${response.addDepartment}`)
            console.log( addDepartment );
            // INSERT INTO department VALUES(0, "Legal");
        }
        else if( response.action == "delete" ){
            const viewDepartment = await db.query( "SELECT * FROM department")
            department = []
            viewDepartment.forEach( function( item ){
                department.push( { name: item.name, value: item.id } )
            })
            console.log( `department: `, department )

            response = await inquirer.prompt([
                {
                    type: "list",
                    name: "deleteDepartment",
                    message: "Which department do you want to remove?",
                    choices: department
                }
            ])
            const deleteDepartment = await db.query( "DELETE FROM department WHERE ?", {id: response.deleteDepartment} )
            console.log( deleteDepartment );
        }
        else if( response.action == "budget"){
            console.log( 'budget' );
        }
        else { //return to main menu
            mainApp();
        }
    }
    if( response.manage == "role" ){
        const viewRole = await db.query( "SELECT * FROM role" )
        response = await inquirer.prompt([
            {   
                type: "list",
                name: "action",
                message: "What would you like do?", 
                choices:[   
                            { name: "View roles", value: "view" },
                            { name: "Add new roles", value: "add" },
                            { name: "Update existing roles", value: "update" },
                            { name: "Delete roles", value: "delete" },
                            { name: "Return to main menu", value: "return" }
                        ]
            }
        ])
        if( response.action == "view"){
            console.table( viewRole );
        }
        else if( response.action == "add"){
            response = await inquirer.prompt([
                {
                    type: "input",
                    name: "addRole",
                    message: "Write a title of roles you want to add."
                },
                {
                    type: "input",
                    name: "addSalary",
                    message: "What is a salary of the role?"
                }
            ])
            const addRole = await db.query( "INSERT INTO role VALUES(?,?,?,?)", [0, response.addRole, response.addSalary, 0] );
            console.log(`ADDED new role ${response.addRole}`)
            console.log( addRole );
        }
    }
    // // View the total utilized budget of a department --
    // response = await inquirer.prompt([
    //     {   
    //         type: "list",
    //         name: "action",
    //         message: "What would you like do?", 
    //         choices:[   { name: "Add", value: "add" },
    //                     { name: "View", value: "view" },
    //                     { name: "Update", value: "update" },
    //                     { name: "Delete", value: "delete" },
    //                     { name: "Return to main menu", value: "return" }
    //                 ]
    //     }
    // ])

    // if (response.action == "add"){
    //     let addResponse = await inquirer.prompt([
    //         {
    //             type: "list",
    //             name: "addAction",
    //             message: "Which table do you want to add into?",
    //             choices:[   { name: "Departments", value: "departments" },
    //                         { name: "Roles", value: "roles" },
    //                         { name: "Employees", value: "employees" }    
    //                     ]
    //         }
    //     ])
    //     if (addResponse.addAction == "departments"){
    //         addResponse = await inquirer.prompt([
    //             {
    //                 type: "input",
    //                 name: "addDepartment",
    //                 message: "Type a department you want to add."
    //             }
    //         ])
    //         addResponse.addDepartment = await db.query 
    //     }
    //     else if (addResponse.addAction == "roles")
    // }

    // else if (response.action == "view"){
    //     let viewResponse = await inquirer.prompt([
    //         {
    //             type: "list",
    //             name: "viewAction",
    //             message: "What would you like to view?",
    //             choices:[   { name: "Departments", value: "departments" },
    //                         { name: "Roles", value: "roles" },
    //                         { name: "Employees", value: "employees" },
    //                         { name: "Employees by Manager", value: "employeesByMan" },
    //                         { name: "Total utilized budget of a department", value: "budget" }  
    //                     ]
    //         }
    //     ])
    // }

    // else if (response.action == "update"){
    //     let updateResponse = await inquirer.prompt([
    //         {
    //             type: "list",
    //             name: "updateAction",
    //             message: "What would you like to update?",
    //             choices:[   { name: "Employee Roles", value: "employeeRole" },
    //                         { name: "Employee Managers", value: "employeeManager" } 
    //                     ]
    //         }
    //     ])
    // }

    // else if (response.action == "delete"){
    //     let deleteResponse = await inquirer.prompt([
    //         {
    //             type: "list",
    //             name: "deleteAction",
    //             message: "What would you like to update?",
    //             choices:[   { name: "Departments", value: "departments" },
    //                         { name: "Roles", value: "roles" },
    //                         { name: "Employees", value: "employees" } 
    //                     ]
    //         }
    //     ])
    // }


    // // Add departments, roles, employees

    // // View departments, roles, employees // View employees by manager
    // // View the total utilized budget of a department --
    // // ie the combined salaries of all employees in that department

    // // Update employee roles // Update employee managers

    // // Delete departments, roles, and employees

    
}
mainApp();