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
  const sql = `SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS 'department', roles.salary
  FROM employees, roles, departments WHERE departments.id = roles.id AND roles.id = employees.id ORDER BY employees.id ASC`;


  // const sql = `SELECT * FROM employees`;
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
            name: "departmentName",
            type: "list",
            message: "Which department is the new role?",
            choices: departmentNamesArray
          }
        ])
        .then(function(answer) {
          if (answer.departmentName === "Create Department") {
            addDepartment();
          } else {
            continueAddingRole(answer);
          }
        });

    const continueAddingRole = function (departmentData) {
      inquirer
          .prompt([
            {
              name: "newRole",
              type: "input",
              message: "What is the name of the new role?",
            },
            {
              name: "salary",
              type: "input",
              message: "What is the salary of the new role?",
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

// Add Department
  const addDepartment = function () {
    inquirer
      .prompt([
        {
          name: "newDepartment",
          type: "input",
          message: "What is the name of your new Department?",
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

// Add an Employee
const addEmployee = function () {
  inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "What is the employee's first name?"
    },
    {
      type: "input",
      name: "lastName",
      message: "What is the employee's last name?"
    }
  ])
  .then(function (answer) {
    let newEmployeeName = [answer.firstName, answer.lastName]
    let sql = `SELECT roles.id, roles.title FROM roles`;
    db.query(sql, (error, data) => {
      if (error) throw error;
      let roles = data.map (({id, title}) => ({name: title, value: id}));
      inquirer.prompt([
        {
          type: "list",
          name: "role",
          message: "What is the employee's role?",
          choices: roles
        }
      ])
        .then(function (answer) {
          let newEmployeeRole = answer.role;
          newEmployeeName.push(newEmployeeRole);
          let sql = `SELECT * FROM employees`;
          db.query(sql, (error, data) => {
            if (error) throw error;
            let managers = data.map(({id, first_name, last_name}) => ({name: first_name + " " + last_name, value:id}));
            inquirer.prompt([
              {
                type: "list",
                name: "manager",
                message: "Who is the employees manager?",
                choices: managers
              }
            ])
              .then(function (answer) {
                let manager = answer.manager;
                newEmployeeName.push(manager);              
                const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                db.query(sql, newEmployeeName, (error) => {
                  if (error) throw error;
                  console.log("New employee was added")
                  viewAllEmployees();
                });
              });
          });
        });
    });
  });
};

// Update Employee Role
const updateEmployeeRole = function () {
  const sql = `SELECT employees.id AS "employee_id", employees.first_name, employees.last_name, roles.id AS "role_id" FROM employees, roles, departments WHERE departments.id = roles.department_id AND roles.id = employees.role_id`;
  db.query(sql, (error, employeeData) => {
    if (error) throw error;
    const employeeNamesArray = [];
    employeeData.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);
    });

    console.log(employeeData);

    const sql = `SELECT roles.id, roles.title FROM roles`;
    db.query(sql, (error, rolesData) => {
      if (error) throw error;
        const rolesArray = [];
        rolesData.forEach((role) => {rolesArray.push(role.title);
        });

        console.log(rolesData);

        inquirer
          .prompt([
            {
              name: 'chosenEmployee',
              type: 'list',
              message: 'Which employee has a new role?',
              choices: employeeNamesArray
            },
            {
              name: 'chosenRole',
              type: 'list',
              message: 'What is their new role?',
              choices: rolesArray
            }
          ])
          .then((answer) => {
            let newTitleId, employeeId;

            rolesData.forEach((role) => {
              if (answer.chosenRole === role.title) {
                newTitleId = role.id;
              }
            });

            employeeData.forEach((employee) => {
              if (
                answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`
              ) {
                employeeId = employee.id;
              }
            });

            console.log(rolesData);
            console.log(employeeData);
            const updatesql = `UPDATE employees SET employees.role_id = ? WHERE employees.id = ?`;
            db.query(updatesql, [newTitleId, employeeId], (error) => {
              if (error) throw error;
              viewAllEmployees();
            })
    });

  });
});
};