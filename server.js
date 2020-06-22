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
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    insecureAuth : true
  });

let response
async function mainApp(){
    response = await inquirer.prompt([
        {   
            type: "list",
            name: "action",
            message: "What would you like do?", 
            choices:[   { name: "Add", value: "add" },
                        { name: "View", value: "view" },
                        { name: "Update", value: "update" },
                        { name: "Delete", value: "delete" },
                        { name: "Return to main menu", value: "return" }
                    ]
        }
    ])

    if (response.action == "add"){
        let addResponse = await inquirer.prompt([
            {
                type: "list",
                name: "addAction",
                message: "Which table do you want to add into?",
                choices:[   { name: "Departments", value: "departments" },
                            { name: "Roles", value: "roles" },
                            { name: "Employees", value: "employees" }    
                        ]
            }
        ])
    }

    else if (response.action == "view"){
        let viewResponse = await inquirer.prompt([
            {
                type: "list",
                name: "viewAction",
                message: "What would you like to view?",
                choices:[   { name: "Departments", value: "departments" },
                            { name: "Roles", value: "roles" },
                            { name: "Employees", value: "employees" },
                            { name: "Employees by Manager", value: "employeesByMan" },
                            { name: "Total utilized budget of a department", value: "budget" }  
                        ]
            }
        ])
    }

    else if (response.action == "update"){
        let updateResponse = await inquirer.prompt([
            {
                type: "list",
                name: "updateAction",
                message: "What would you like to update?",
                choices:[   { name: "Employee Roles", value: "employeeRole" },
                            { name: "Employee Managers", value: "employeeManager" } 
                        ]
            }
        ])
    }

    else if (response.action == "delete"){
        let deleteResponse = await inquirer.prompt([
            {
                type: "list",
                name: "deleteAction",
                message: "What would you like to update?",
                choices:[   { name: "Departments", value: "departments" },
                            { name: "Roles", value: "roles" },
                            { name: "Employees", value: "employees" } 
                        ]
            }
        ])
    }


    // Add departments, roles, employees

    // View departments, roles, employees // View employees by manager
    // View the total utilized budget of a department --
    // ie the combined salaries of all employees in that department

    // Update employee roles // Update employee managers

    // Delete departments, roles, and employees

    
}
mainApp()
  