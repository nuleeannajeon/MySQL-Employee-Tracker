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
                        { name: "Manage Employees", value: "employee" },
                        { name: "View all employees tracker table", value: "viewAll"},
                        { name: "Exit", value: "exit" }
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
            const viewDepartment = await db.query( "SELECT * FROM department")
            department = []
            viewDepartment.forEach( function( item ){
                department.push( { name: item.name, value: item.id } )
            })
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
                },
                {
                    type: "list",
                    name: "roleDepartment",
                    message: "What department does the role fall into?",
                    choices: department
                }
            ])
            const addRole = await db.query( "INSERT INTO role VALUES(?,?,?,?)", [0, response.addRole, response.addSalary, response.roleDepartment] );
            // console.log(response.roleDepartment);
            console.log(`ADDED new role [${response.addRole}] successfully!`);
            // console.log( addRole );
        }
        else if( response.action == "update" ){
            const viewRole = await db.query( "SELECT * FROM role")
            role = []
            viewRole.forEach( function( item ){
                role.push( { name: item.title, value: item.id } )
            })
            response = await inquirer.prompt([
                {
                    type: "list",
                    name: "titleOrSalary",
                    message: "Do you want to update a title or a salary of the role?",
                    choices:[ { name: "title", value: "title" }, { name: "salary", value: "salary" } ]
                }
            ])
            if( response.titleOrSalary == "title" ){
                response = await inquirer.prompt([
                    {
                        type: "list",
                        name: "updateRole",
                        message: "What is a role that you want to update?",
                        choices: role
                    },
                    {
                        type: "input",
                        name: "updateTitle",
                        message: "Please write a title of the role selected."
                    }
                ])
                const updateTitle = await db.query('UPDATE role SET title= ? WHERE id= ?', [response.updateTitle, response.updateRole]);
                // console.log(response.updateRole);
                console.log( `Successfully changed a title to ${response.updateTitle}` );
            }
            if( response.titleOrSalary == "salary" ){
                response = await inquirer.prompt([
                    {
                        type: "list",
                        name: "updateRole",
                        message: "What is a role that you want to update?",
                        choices: role
                    },
                    {
                        type: "input",
                        name: "updateSalary",
                        message: "Please write a salary of the role selected."
                    }
                ])
                const updateSalary = await db.query('UPDATE role SET salary= ? WHERE id= ?', [response.updateSalary, response.updateRole]);
                // console.log(response.updateRole);
                console.log( `Successfully changed a title to ${response.updateSalary}` );
            }

        }
        else if( response.action == "delete" ){
            const viewRole = await db.query( "SELECT * FROM role")
            role = []
            viewRole.forEach( function( item ){
                role.push( { name: item.title, value: item.id } )
            })
            response = await inquirer.prompt([
                {
                    type: "list",
                    name: "deleteRole",
                    message: "Select a role that you want to delete.",
                    choices: role
                }
            ])
            const deleteRole = await db.query("DELETE FROM role WHERE id=?", response.deleteRole);
            console.log(`Successfully DELETED [${response.deleteRole}]`)
            //ASK how do i get name instead of value!!!!!
        }
        else {
            mainApp();
        }
    }
    if( response.manage == "employee" ){
        response = await inquirer.prompt([
            {
                type: "list",
                name: "action",
                message: "What would you like to do?",
                choices:[
                            { name: "View all employees", value: "view" },
                            { name: "Add an employee", value: "add" },
                            { name: "Update existing employees", value: "update" },
                            { name: "Delete an employee", value: "delete" },
                            { name: "View employees by manager", value: "viewByManager" },
                            { name: "Update employee managers", value: "updateEmpManager" },
                            { name: "Return to main menu", value: "return" }
                        ]
            }
        ])
        if( response.action == "view" ){
            const viewEmployee = await db.query("SELECT * FROM employee")
        }
        else if( response.action == "add" ){
            const viewRole = await db.query( "SELECT * FROM role")
            role = []
            viewRole.forEach( function( item ){
                role.push( { name: item.title, value: item.id } )
            })
            response = await inquirer.prompt([
                {
                    type: "input",
                    name: "first_name",
                    message: "What is the first name of an employee you want to add?"
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "What is the last name of an employee?"
                },
                {
                    type: "list",
                    name: "employeeRole",
                    message: "What is the role of an employee you want to add?",
                    choices: role
                },
                {
                    type: "list",
                    name: "employeeManager",
                    message: "What is the role of an employee you want to add?",
                    choices: ['null']
                }
            ])
            const addEmployee = await db.query("INSERT INTO employee VALUES(?,?,?,?,?)", [0, response.first_name, response.last_name, response.employeeRole, 0] )
            console.log(`Successfully ADDED employee ${response.first_name} ${response.last_name}!`);
        }
        else if( response.action == "update" ){
            const viewEmployee = await db.query( "SELECT * FROM employee")
            employee = []
            viewEmployee.forEach( function( item ){
                role.push( { name: item.first_name + last_name, value: item.id } )
            })
            response = await inquirer.prompt([
                {
                    type: "list",
                    name: "updateEmployee",
                    message: "Which employee do you want to update?",
                    choices: employee
                },
                {
                    type: "list",
                    name: "updateEmployee",
                    message: "Which employee do you want to update?",
                    choices: employee
                },
            ])
            // const updateTitle = await db.query('UPDATE role SET title= ? WHERE id= ?', [response.updateTitle, response.updateRole]);
        }
        else if( response.action == "delete" ){
            const viewEmployee = await db.query( "SELECT * FROM employee")
            employee = []
            viewEmployee.forEach( function( item ){
                employee.push( { name: item.first_name+' '+item.last_name, value: item.id } )
            })
            response = await inquirer.prompt([
                {
                    type: "list",
                    name: "deleteEmployee",
                    message: "Select an employee that you want to delete.",
                    choices: employee
                }
            ])
            const deleteEmployee = await db.query("DELETE FROM employee WHERE id=?", response.deleteEmployee);
            console.log(`Successfully DELETED [${response.deleteEmployee}]`)
        }
        else if( response.action == "viewByManager"){
            console.log(` NEED TO DO THIS PART`)
        }
        else if( response.action == "updateEmpManager"){
            console.log(`NEED TO DO THIS PART`)
        }
        else {
            mainApp();
        }
    }
    if( response.manage == "viewAll" ){
        let viewAll = await db.query( "SELECT employee.id, employee.first_name, employee.last_name, " +
                                        "role.title, role.salary, department.name, employee.manager_id "+
                                        "FROM employee LEFT JOIN role ON role.id=employee.role_id "+
                                        "LEFT JOIN department ON department.id=role.department_id;" );
        console.table(viewAll);
        
    }
    if( response.manage == "exit" ){
        db.close();
    }
}
mainApp();