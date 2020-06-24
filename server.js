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
                        { name: "View Full Table with Employees", value: "full" },        
                        { name: "Manage Departments", value: "department" },
                        { name: "Manage Roles", value: "role" },
                        { name: "Manage Employees", value: "employee" },
                        { name: "Exit", value: "exit" }
                    ]
        }
    ])
    if ( response.manage == "full" ){
        let viewAll = await db.query(   "SELECT employee.id, employee.first_name, employee.last_name, " +
                                        "role.title, role.salary, department.name, " +
                                        "CONCAT(manager.first_name,' ', manager.last_name) AS manager_name " +
                                        "FROM employee LEFT JOIN role ON role.id=employee.role_id " +
                                        "LEFT JOIN department ON department.id=role.department_id " +
                                        "LEFT JOIN employee AS manager ON employee.manager_id=manager.id;"  )
        console.table(viewAll);
        mainApp();
    }
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
                            { name: "View total utilized budget of a department ", value: "budget" }
                        ]
            }
        ])
        if( response.action == "view"){
            console.table( viewDepartment );
        }
        if( response.action == "add"){
            response = await inquirer.prompt([
                {
                    type: "input",
                    name: "addDepartment",
                    message: "Write a department you want to add."
                }
            ])
            const addDepartment = await db.query( "INSERT INTO department VALUES(?, ?)", [0, response.addDepartment]);
            console.log(`-----------------ADDED new department [${response.addDepartment}]-----------------`)
        }
        if( response.action == "delete" ){
            const viewDepartment = await db.query( "SELECT * FROM department")
            department = []
            viewDepartment.forEach( function( item ){
                department.push( { name: item.name, value: item.id } )
            })

            response = await inquirer.prompt([
                {
                    type: "list",
                    name: "deleteDepartment",
                    message: "Which department do you want to remove?",
                    choices: department
                }
            ])
            const deleteDepartment = await db.query( "DELETE FROM department WHERE ?", {id: response.deleteDepartment} )
            console.log(`-----------------DELETED selected department successfully-----------------`);
        }
        if( response.action == "budget"){
            const totalBudget = await db.query( "SELECT SUM(role.salary) AS 'Total Budget' " +
                                                "FROM employee LEFT JOIN role ON employee.role_id=role.id "+
                                                "LEFT JOIN department ON role.department_id=department.id " )
            console.table(totalBudget)

            const viewDepartment = await db.query( "SELECT * FROM department")
            department = []
            viewDepartment.forEach( function( item ){
                department.push( { name: item.name, value: item.id } )
            })

            response = await inquirer.prompt([
                {
                    type: "list",
                    name: "departmentId",
                    message: "Which department would you like to view the budget of?",
                    choices: department
                }
            ])
            const budgetByDep = await db.query( "SELECT department.name, SUM(role.salary) AS 'Total Budget' " +
                                                "FROM employee LEFT JOIN role ON employee.role_id=role.id "+
                                                "LEFT JOIN department ON role.department_id=department.id "+
                                                "WHERE department.id = ?", response.departmentId )
            console.table( budgetByDep );
        }
        mainApp();
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
                            { name: "Delete roles", value: "delete" }
                        ]
            }
        ])
        if( response.action == "view"){
            console.table( viewRole );
        }
        if( response.action == "add"){
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
            console.log(`-------------ADDED new role [${response.addRole}] successfully!-------------`);

        }
        if( response.action == "update" ){
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
                console.log( `-------------Successfully changed a title to ${response.updateTitle}-------------` );
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
                console.log( `-------------Successfully changed a salary to $${response.updateSalary}-------------` );
            }

        }
        if( response.action == "delete" ){
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
            console.log(`-------------Successfully DELETED selected role-------------`)
        }
        mainApp();
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
                            { name: "Update employee managers", value: "updateEmpManager" }
                        ]
            }
        ])
        if( response.action == "view" ){
            const viewEmployee = await db.query("SELECT * FROM employee")
            console.table( viewEmployee )
        }
        if( response.action == "add" ){
            const viewRole = await db.query( "SELECT * FROM role")
            role = []
            viewRole.forEach( function( item ){
                role.push( { name: item.title, value: item.id } )
            })

            const viewManagerId = await db.query("SELECT employee.id, CONCAT(employee.first_name,' ', employee.last_name) " +
                                                "AS manager_name FROM employee WHERE employee.manager_id IS NULL;" )
            managerId = []
            viewManagerId.forEach( function(item){
                managerId.push({ name: item.manager_name, value: item.id} )
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
                    message: "Who is the manager of an employee?",
                    choices: managerId
                }
            ])
            const addEmployee = await db.query("INSERT INTO employee VALUES(?,?,?,?,?)", [0, response.first_name, response.last_name, response.employeeRole, response.employeeManager] )
            console.log(`----------Successfully ADDED employee ${response.first_name} ${response.last_name}!----------`);
        }
        if( response.action == "update" ){
            const viewEmployee = await db.query("SELECT * FROM employee")
            employee = []
            viewEmployee.forEach( function( item ){
                employee.push( { name: item.first_name +' '+ item.last_name, value: item.id } )
            })
            response = await inquirer.prompt([
                {
                    type: "list",
                    name: "updateEmployee",
                    message: "What would you like to change in the employee table?",
                    choices:[
                                { name: "Name of an existing employee", value: "name" },
                                { name: "Role of an existing employee", value: "role" }
                            ]
                }
            ])
            if( response.updateEmployee == 'name' ){
                response = await inquirer.prompt([
                    {
                        type: "list",
                        name: "selectedEmployee",
                        message: "Which employee's name do you want to update?",
                        choices: employee
                    },
                    {
                        type: "input",
                        name: "newFirstName",
                        message: "Write their new first name."
                    },
                    {
                        type: "input",
                        name: "newLastName",
                        message: "Write their new last name."
                    }
                ])
                const newName = await db.query('UPDATE employee SET first_name= ?, last_name= ? WHERE id= ?', [response.newFirstName, response.newLastName, response.selectedEmployee])
                console.log( `-------Successfully Updated employee's name to ${response.newFirstName} ${response.newLastName}-------`);
            }
            if( response.updateEmployee == "role" ){
                const viewRole = await db.query( "SELECT * FROM role")
                role = []
                viewRole.forEach( function( item ){
                    role.push( { name: item.title, value: item.id } )
                })
                response = await inquirer.prompt([
                    {
                        type: "list",
                        name: "selectedEmployee",
                        message: "Which employee's name do you want to update?",
                        choices: employee
                    },
                    {
                        type: "list",
                        name: "newRole",
                        message: "What is their new role?",
                        choices: role
                    }
                ])
                const newRole = await db.query('UPDATE employee SET role_id= ? WHERE id= ?', [response.newRole, response.selectedEmployee]);
                console.log(`---------------Successfully Updated employee's role!---------------`);
            }
        }
        if( response.action == "delete" ){
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
            console.log(`-------------Successfully DELETED selected employee!-------------`)
        }
        if( response.action == "viewByManager"){
            let empByManager = await db.query("SELECT employee.id, " +
                                            "CONCAT(employee.first_name,' ', employee.last_name) AS Employee_Name, " +
                                            "CONCAT(manager.first_name,' ', manager.last_name) AS Manager_Name " +
                                            "FROM employee LEFT JOIN role ON role.id=employee.role_id " +
                                            "LEFT JOIN employee AS manager ON employee.manager_id=manager.id;")
            console.table( empByManager );
        }
        if( response.action == "updateEmpManager"){
            const viewEmployee = await db.query("SELECT * FROM employee")
            employee = []
            viewEmployee.forEach( function( item ){
                employee.push( { name: item.first_name +' '+ item.last_name, value: item.id } )
            })

            const viewManagerId = await db.query("SELECT employee.id, CONCAT(employee.first_name,' ', employee.last_name) " +
                                                "AS manager_name FROM employee WHERE employee.manager_id IS NULL;" )
            managerId = [{name:"No Manager", value: null}]
            viewManagerId.forEach( function(item){
                managerId.push({ name: item.manager_name, value: item.id} )
            })

            response = await inquirer.prompt([
                {
                    type: "list",
                    name: "selectedEmployee",
                    message: "Which employee's name do you want to update?",
                    choices: employee
                },
                {
                    type: "list",
                    name: "newManager",
                    message: "Who is the new manager?",
                    choices: managerId
                }
            ])
                const newManager = await db.query('UPDATE employee SET manager_id= ? WHERE id= ?', [response.newManager, response.selectedEmployee]);
                console.log(`-------------Succesfully Updated employee's manager!-------------`)
        }
        mainApp();
    }
    if( response.manage == "exit" ){
        db.close();
    }
}
mainApp();