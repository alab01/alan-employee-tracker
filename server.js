const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');


// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'sqlpassword',
    database: 'tracker_db'
  },
  console.log(`Connected to the employee tracker.`)
);

db.connect((error) => {
  if (error) throw error;
  questionOne();
})

//Initial Prompt For User
const questionOne = function () {
  inquirer.prompt([
    {
      name: "choices",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "Add Depertment",
        "Add Role",
        "Add Employee",
        "Update Employee Role",
        "Quit"
      ]
    }
  ])
  .then ((answers) => {
    const {choices} = answers;

    if (choices === "View All Departments") {
      viewAllDepartments();
    } else if (choices === "View All Roles") {
      viewAllRoles();
    } else if (choices === "View All Employees") {
      viewAllEmployees();
    } else if (choices === "Add Depertment") {
      addDepartment();
    } else if (choices === "Add Role") {
      addRole();
    } else if (choices === "Add Employee") {
      addEmployee();
    } else if (choices === "Update Employee Role") {
      updateEmployeeRole();
    } else (choices === "Quit") 
      return;
  });
};


//View Departments
const viewAllDepartments = function () {
  console.log("view all departments")

  const sql = `SELECT * FROM departments`;
  db.query(sql, (error, response) => {
    if (error) throw error;
    console.table(response);
    questionOne();
  })
}

//View All Roles
const viewAllRoles = function () {
  const sql = `SELECT * FROM roles`;
  db.query(sql, (error, response) => {
    if (error) throw error;
    console.table(response);
    questionOne();
  })
}

//View All Employees
const viewAllEmployees = function () {
  const sql = `SELECT * FROM employees`;
  db.query(sql, (error, response) => {
    if (error) throw error;
    console.table(response);
    questionOne();
  })
}

//Add a Department
const addDepartment= function () {
  inquirer.prompt([
    {
      name: "newDepartment",
      type: "input",
      message: "What is the name of the new department?"
    }
  ])
  .then (function(answer) {
    let sql = `INSERT INTO departments (name) VALUES (?)`;
    db.query(sql, answer.newDepartment, (error, response) => {
      if (error) throw error;
      viewAllDepartments();
  });
});
}

//Add Role
const addRole = function () {
  const sql = "SELECT * FROM departments"
  db.query(sql, (error, departments) => {
    if (error) throw error;
    let departmentNamesArray = [];
    departments.forEach((department) => {departmentNamesArray.push(department.name)})
    departmentNamesArray.push("Create Department")

    inquirer
        .prompt([
          {
            name: 'departmentName',
            type: 'list',
            message: 'Which department is this new role in?',
            choices: departmentNamesArray
          }
        ])
        .then(function(answer) {
          if (answer.departmentName === 'Create Department') {
            addDepartment();
          } else {
            continueAddingRole(answer);
          }
        });

    const continueAddingRole = function (departmentData) {
      inquirer
          .prompt([
            {
              name: 'newRole',
              type: 'input',
              message: 'What is the name of your new role?',
            },
            {
              name: 'salary',
              type: 'input',
              message: 'What is the salary of this new role?',
            }
          ])
          .then(function (answer) {
            let role = answer.newRole;
            let departmentID;

            departments.forEach((department) => {
              if (departmentData.departmentName === department.name) {departmentID = department.id;}
            });

            let sql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`;

            db.query(sql, [role, answer.salary, departmentID], (error, response) => {
              if (error) throw error;
              viewAllRoles();
            })
          })
    }
  })

  const addDepartment = () => {
    inquirer
      .prompt([
        {
          name: 'newDepartment',
          type: 'input',
          message: 'What is the name of your new Department?',
        }
      ])
      .then(function (answer) {
        let sql = `INSERT INTO departments (name) VALUES (?)`;
        db.query(sql, answer.newDepartment, (error, response) => {
          if (error) throw error;
          viewAllDepartments();
        });
      });
};
}




