var mysql = require("mysql");
var inquirer = require("inquirer");
const { Table } = require('console-table-printer');
const questionsArr = require('./lib/questions')
const chalk = require('chalk');
const util = require('util');
const { indexOf } = require("./lib/questions");
const log = console.log;
var employees, roles, managers, departments = [];

// Some funky opening titles
log('\n');
log('\n');
log(chalk.whiteBright("--                                                                               `-.    "));
log(chalk.whiteBright("sy-                                                                              :ys     "));
log(chalk.whiteBright("+sso++++s:                              `yy`                                         +so++ssoooss.                        :s+"));
log(chalk.whiteBright("oy:    +/                              .ys                                          s:   sy.                             /y:   "));
log(chalk.whiteBright("oy:        ``   .`   `.`    ``   `.`   -y+     `..   `.`     .`   ..`     `..       `    sy.   ``  `.`  `..`       `.`   +y-  `.`"));
log(chalk.blueBright("oy+:::/` ./oy-:sss+`/sos/ -/os:`+sos+` :s/   :s+:+s/-/os.   +y/`+o::so` :o+:+s/         `sy` ./oy-/yss:o+::oo.  `/s/:+s- oy`-osos"));
log(chalk.blueBright("sy:.---`   +yos. syoo``ys   /y+s:  +s: /y:  +y-   /y/ `ss` :y/.ss.-/yo`/y/.:os:         `sy`   +yoo`  .+:  :y/ `oy`  `:. ss/s-.os"));
log(chalk.blueBright("sy.     `  +ys`  syo  -yo   /ys.   +y: /y: `yy`   :y+  :y/-y/ :yo--.   sy:-.`           .yy    +ys`   ./o//sy: -yo      `sys/s+. "));
log(chalk.redBright("`yy`    .s- oy:  `sy.  -y+   +y:   :y+  /y:  +y:  `os.   oss+  .ss`  `-`+y/   -.         -ss    oy/   .sy``/sy- `ss.  `-`.yy.`+s- "));
log(chalk.redBright("`oo+++oos+  +o`  `o+   `+s+- oy//+o+-   .oo+. :oo+o/`    .yo    `/ooo+-  -+soo/`         .o+    +o`    :oso:`+o+-`/oooo: `o+   :oo"));
log(chalk.redBright("sy                          +s`                          +s`"));
log(chalk.redBright("ss                        `/y.                        `/y."));
log('\n');

// setting server connections
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "asdf1234",
    database: "employees_db"
});
// Promisified query connection function
const connectionQuery = util.promisify(connection.query.bind(connection));

// function drop created table and return to main menu (runAppChoice)
function dropTable(tableName) {
    try {
        connection.query("DROP TABLE IF EXISTS ??", [tableName], function (err, res) {
            if (err) throw err;
            runAppChoice();
        });
    } catch (e) { return }
}

// function create table from managers and set new value for people without managers for using in Views
function getManagersTable() {
    var condition = '';
    managers = [];
    var query = "SELECT manager_id FROM employee GROUP BY (manager_id);";
    // using chain of promises we return a promise in order to continue the chain inmain function
    return connectionQuery(query)
        .then(res => {
            res.forEach(idItem => {
                condition += ` OR (id=${idItem.manager_id})`
                managers.push(idItem.manager_id);
            });
            condition = condition.substr(4, condition.length - 4);
            var query2 = "CREATE TABLE manager (SELECT id AS manager_id, CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, ''))  AS m_name FROM employee WHERE " + condition + ");";
            return connectionQuery(query2);
        })
        .then(res2 => {
            var query3 = "INSERT INTO manager (manager_id, M_NAME) VALUE (0,'None')";
            return connectionQuery(query3);
        });
}

// create All Employees List
const allEmployeesList = () => {
    var employees = [];
    var roles = [];
    // using above function to set magager table
    return getManagersTable().then(res => {
        // big junction table 
        var query4 = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, departments.d_name, manager.m_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) JOIN manager USING(manager_id) ORDER BY employee.id;";
        return connectionQuery(query4)
            .then(res4 => {
                // creates table from query results
                const p = new Table({
                    columns: [
                        { name: 'ID', alignment: 'left' },
                        { name: 'Name', alignment: 'right' },
                        { name: 'Position', alignment: 'right' },
                        { name: 'Salary', alignment: 'right' },
                        { name: 'Department', alignment: 'right' },
                        { name: 'Manager', alignment: 'right' },
                    ],
                });
                //add rows with color
                for (let i = 0; i < res4.length; i++) {
                    p.addRow({
                        ID: res4[i].id, Name: res4[i].first_name + " " +
                            res4[i].last_name, Position: res4[i].title, Salary: res4[i].salary, Department: res4[i].d_name, Manager: res4[i].m_name
                    }, { color: (i % 2) ? 'white' : 'blue' });
                }
                console.log('');
                p.printTable();
                dropTable("manager");
            })
            .catch(err => {
                if (err) throw err;
            });
    });
}
const allByManager = () => {
    // similar beginning
    return getManagersTable().then(res3 => {
        for (let i = 0; i < managers.length; i++) {
            //BUT  main query now set for each individual manager to pull it employees
            var query4 = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, departments.d_name, manager.m_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) JOIN manager USING(manager_id) WHERE employee.manager_id=" + managers[i] + ";";
            connection.query(query4, function (err, res) {
                if (err) throw err;
                //Create a tables for each manager
                const p = new Table({
                    columns: [
                        { name: 'ID', alignment: 'left' },
                        { name: 'Name', alignment: 'right' },
                        { name: 'Position', alignment: 'right' },
                        { name: 'Salary', alignment: 'right' },
                        { name: 'Department', alignment: 'right' },
                    ],
                });
                console.log('-----------------------------');
                console.log(`Manager :  ${res[0].m_name}`);
                //add rows with color
                for (let i = 0; i < res.length; i++) {
                    p.addRow({
                        ID: res[i].id, Name: res[i].first_name + " " +
                            res[i].last_name, Position: res[i].title, Salary: res[i].salary, Department: res[i].d_name
                    }, { color: (i % 2) ? 'white' : 'blue' });
                }
                console.log('');
                p.printTable();
            })
        }
        // finishing with drop of table and return
        dropTable("manager");
    })
        .catch(err => {
            if (err) throw err;
        });
};

// creates salary budget view table
const viewDepartmentSalaryBudget = () => {
    // creates table
    var query2 = "CREATE TABLE salaryTotals (SELECT SUM(role.salary) totalDepSalary, departments.d_name, departments.department_id FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) GROUP BY (department_id));";
    return connectionQuery(query2)
        .then(res2 => {
            // sort it by name
            var query3 = "SELECT * FROM salaryTotals ORDER BY d_name";
            return connectionQuery(query3);
        }).then(res3 => {
            // makes table
            const p1 = new Table({
                title: `Departments salary budget`,
                columns: [
                    { name: 'ID', alignment: 'left' },
                    { name: 'Department', alignment: 'right' },
                    { name: 'Salary_budget', alignment: 'right' },
                ],
            });
            for (let i = 0; i < res3.length; i++) {
                p1.addRow({
                    ID: i + 1, Department: res3[i].d_name, Salary_budget: `$${res3[i].totalDepSalary}`
                }, { color: (i % 2) ? 'white' : 'blue' });
            }
            p1.printTable();
            // calculatesgrand total
            var query4 = "SELECT SUM(totalDepSalary) total FROM salaryTotals;";
            return connectionQuery(query4);
        })
        .then(res4 => {
            console.log("---------------------------------");
            // display grand total, drop table and return to main menu
            log(chalk.yellow.bgRed('Total company salary budget:') + chalk.white.bgRed.bold('$' + res4[0].total));
            console.log('');
            console.log('');
            dropTable("salaryTotals");
        })
        .catch(err => {
            if (err) throw err;
        });
}
// creates view of employees by department
const allByDepartment = () => {
    var query3 = "SELECT * FROM departments ORDER BY d_name ASC";
    return connectionQuery(query3).then(res3 => {
        // gets id for each department
        for (let i = 0; i < res3.length; i++) {
            // gets data on all employees from the department
            var queryOut = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, departments.d_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) WHERE department_id=" + res3[i].department_id + ";";
            connection.query(queryOut, function (err, res) {
                if (err) throw err;
                //Create a table for each department
                const p = new Table({
                    title: `Department:  ${res[0].d_name}`,
                    columns: [
                        { name: 'ID', alignment: 'left' },
                        { name: 'Name', alignment: 'right' },
                        { name: 'Position', alignment: 'right' },
                        { name: 'Salary', alignment: 'right' },
                    ],
                });
                console.log('\n');
                console.log('-----------------------------');
                //add rows with color
                for (let i = 0; i < res.length; i++) {
                    p.addRow({
                        ID: res[i].id, Name: res[i].first_name + " " +
                            res[i].last_name, Position: res[i].title, Salary: `$${res[i].salary}`
                    }, { color: (i % 2) ? 'white' : 'blue' });
                }
                console.log('');
                p.printTable();
            });
        };
        // finish up and go back
        dropTable("salaryTotals");
    }).catch(err => {
        if (err) throw err;
    });
}
// adding employee function
const addEmployee = () => {
    let query = "SELECT CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, ''))  AS name, id AS value FROM employee ;";
    connectionQuery(query)
        .then(res => {
            // creates array of employees names with ID for setting up the manager
            employees = res;
            // option for no manager
            employees.push({ 'name': 'None', 'value': 0 })
            let query2 = "SELECT title AS name, role_id AS value FROM role;";
            return connectionQuery(query2)
        })
        .then(res2 => {
            // array of Roles
            roles = res2;
            // sets of questions 
            return inquirer.prompt([
                {
                    type: "input",
                    message: "Please enter employee's first name",
                    name: "nameChoice",
                    validate: nameChoice => {
                        // validation for 30 chars length and letters
                        let alphaExp = /^[A-Za-z\-]{0,29}$/;
                        if (!nameChoice.match(alphaExp)) {
                            return "Use letters and -. Max length 30";
                        } else {
                            return true;
                        }
                    },

                },
                {
                    type: "input",
                    message: "Please enter employee's last name",
                    name: "lastNameChoice",
                    validate: lastNameChoice => {
                        let alphaExp = /^[A-Za-z\-]{0,29}$/;
                        if (!lastNameChoice.match(alphaExp)) {
                            return "Use letters and -. Max length 30";
                        } else {
                            return true;
                        }
                    },
                },
                {
                    type: "list",
                    message: "Please enter employee's manager",
                    choices: employees,
                    default: 0,
                    name: "managerChoice"
                },
                {
                    type: "list",
                    message: "Please enter employee's role",
                    choices: roles,
                    default: 0,
                    name: "roleChoice"
                },

            ]).then(response => {
                // Adding employee query
                let query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${response.nameChoice}','${response.lastNameChoice}',${response.roleChoice},${response.managerChoice})`;
                return connectionQuery(query);
            })
                .then(res => {
                    console.log("Employee added successfuly");
                    runAppChoice();
                })
        })
        .catch(err => {
            if (err) throw err;
        });
}
// update for Role and Manager of employee
const updateEmployee = () => {
    let employeeUpdate = 0;
    let updateChoice = 0;
    let query = "SELECT CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, ''))  AS name, id AS value FROM employee ;";
    connectionQuery(query)
        .then(res => {
            // update array of employee
            employees = res;
            let query2 = "SELECT title AS name, role_id AS value FROM role;";
            return connectionQuery(query2)
        })
        .then(res2 => {
            // roles array
            roles = res2;
            let query3 = "SELECT d_name AS name, department_id AS value FROM departments;";
            return connectionQuery(query3)
        })
        .then(res3 => {
            departments = res3;
            return inquirer.prompt([
                {
                    type: "list",
                    message: "Please choose employee you wish to update",
                    choices: employees,
                    default: 0,
                    name: "employeeChoice"
                },
                {
                    // what kind of update needed
                    type: "list",
                    message: "Please choose what you wish to update",
                    choices: [{ 'name': 'Manager', 'value': 1 }, { 'name': 'Role', 'value': 2 }, { 'name': 'Delete', 'value': 3 }],
                    default: 0,
                    name: "updateChoice"
                },
            ]).then(res => {
                employeeUpdate = res.employeeChoice;
                updateChoice = res.updateChoice;
                // update list of potential manages by erasing the self and adding None manager option 
                managers = employees.filter(person => person.value != employeeUpdate);
                managers.push({ 'name': 'None', 'value': 0 })
                let query4 = "SELECT id,role_id, manager_id FROM employee WHERE id=" + employeeUpdate + ";";
                return connectionQuery(query4)
            })
                .then(res4 => {
                    // setting up default value before change
                    let defaultRole = res4[0].role_id;
                    let defaultmanager = res4[0].manager_id;
                    function checkManagers(managers) {
                        return defaultmanager === managers.value;
                    }
                    defaultmanager = managers.findIndex(checkManagers);
                    function checkRole(roles) {
                        return defaultRole === roles.value;
                    }
                    defaultRole = roles.findIndex(checkRole);
                    // questions for update
                    return inquirer.prompt([
                        {
                            type: "list",
                            message: "Please choose employee's role to update",
                            choices: roles,
                            default: defaultRole,
                            name: "roleChoice",
                            when: updateChoice === 2
                        },
                        {
                            type: "list",
                            message: "Please update employee's manager you wish to update",
                            choices: managers,
                            default: defaultmanager,
                            name: "managerChoice",
                            when: updateChoice === 1
                        },
                    ]).then(res => {
                        let queryUpdate = "";
                        // setting result queries to make changes
                        switch (updateChoice) {
                            case 1:
                                queryUpdate = `UPDATE employee SET manager_id=${res.managerChoice} WHERE id = ${employeeUpdate}`;
                                break;
                            case 2:
                                queryUpdate = `UPDATE employee SET role_id=${res.roleChoice} WHERE id = ${employeeUpdate}`;
                                break;
                            case 3:
                                queryUpdate = `DELETE FROM employee WHERE id = ${employeeUpdate}`;
                                break;
                        }
                        return connectionQuery(queryUpdate)
                    })
                        .then(res => {
                            console.log("Employee updated successfuly");
                            runAppChoice();
                        })

                })
        })
        .catch(err => {
            if (err) throw err;
        });
}
// update roles
const updateRoles = () => {
    let roleUpdate = 0;
    let updateChoice = 0;
    let query = "SELECT d_name AS name, department_id AS value FROM departments;";
    connectionQuery(query)
        .then(res => {
            // gets departments array
            departments = res;
            let query2 = "SELECT title AS name, role_id AS value FROM role;";
            return connectionQuery(query2)
        })
        .then(res2 => {
            // gets roles array
            roles = res2;
            // question about what update needed
            return inquirer.prompt([
                {
                    type: "list",
                    message: "Please choose what you wish to do",
                    choices: [{ 'name': 'View roles', 'value': 1 }, { 'name': 'Add Role', 'value': 2 }, { 'name': 'Update Role', 'value': 3 }, { 'name': 'Delete Role', 'value': 4 }],
                    default: 0,
                    name: "updateChoice"
                },
                {
                    type: "list",
                    message: "Please choose Role",
                    choices: roles,
                    default: 0,
                    name: "roleChoice",
                    when: function (response) { return response.updateChoice > 2 }
                },
            ]).then(res => {
                updateChoice = res.updateChoice;
                if (updateChoice > 2) {
                    roleUpdate = res.roleChoice;
                }
                let query3 = "SELECT title, salary, department_id FROM role WHERE role_id=" + roleUpdate + ";";
                return connectionQuery(query3)
            }).then(res3 => {
                let defaultDepartment = 0;
                let defaultSalary = 0;
                if (updateChoice > 2) {
                    // setup default values
                    defaultDepartment = res3[0].department_id;
                    defaultSalary = res3[0].salary;

                    function checkDep(departments) {
                        return defaultDepartment === departments.value;
                    }
                    defaultDepartment = departments.findIndex(checkDep);
                }
                // update questions
                return inquirer.prompt([
                    {
                        type: "input",
                        message: "Please enter Role Title",
                        name: "titleChoice",
                        validate: titleChoice => {
                            let alphaExp = /^[A-Za-z\ \-\_]{0,29}$/;
                            if (!titleChoice.match(alphaExp)) {
                                return "Use letters and _-. Max length 30";
                            } else {
                                return true;
                            }
                        },
                        when: updateChoice === 2
                    },
                    {
                        type: "input",
                        message: "What salary would you set for this position",
                        default: defaultSalary,
                        name: "salaryChoice",
                        validate: salaryChoice => {
                            let alphaExp = /^[0-9]{0,10}$/;
                            if (!salaryChoice.match(alphaExp)) {
                                return "Use numbers only and no more then 9 figure. You don't know how to print money";
                            } else {
                                return true;
                            }
                        },
                        when: (updateChoice === 2) || (updateChoice === 3)
                    },
                    {
                        type: "list",
                        message: "What department would you assign to this position",
                        choices: departments,
                        default: defaultDepartment,
                        name: "depChoice",
                        when: (updateChoice === 2) || (updateChoice === 3)
                    },
                ]).then(res => {
                    let queryUpdate = "";
                    // queries setting from questions
                    if (updateChoice === 2) queryUpdate = `INSERT INTO role (title, salary, department_id) VALUES ('${res.titleChoice}','${res.salaryChoice}',${res.depChoice})`
                    if (updateChoice === 3) queryUpdate = `UPDATE role SET salary=${res.salaryChoice}, department_id=${res.depChoice} WHERE role_id = ${roleUpdate}`;
                    if (updateChoice === 4) queryUpdate = `DELETE FROM role WHERE role_id = ${roleUpdate}`;
                    if (updateChoice === 1) {
                        viewAllRoles();
                    } else {
                        connection.query(queryUpdate, function (err, res) {
                            if (err) throw err;
                            console.log("Roles table was updated successfuly");
                            runAppChoice();
                        });
                    }
                })
            })

        }).catch(err => {
            if (err) throw err;
        });
}
// views all roles
const viewAllRoles = () => {
    var query = "SELECT role.role_id, role.title, role.salary, departments.d_name FROM role JOIN departments USING(department_id)"
    return connectionQuery(query)
        .then(res => {
            const p = new Table({
                columns: [
                    { name: 'ID', alignment: 'left' },
                    { name: 'Role_Title', alignment: 'right' },
                    { name: 'Salary', alignment: 'right' },
                    { name: 'Department', alignment: 'right' },
                ],
            });
            //add rows with color
            for (let i = 0; i < res.length; i++) {
                p.addRow({
                    ID: res[i].role_id, Role_Title: res[i].title, Salary: res[i].salary, Department: res[i].d_name
                }, { color: (i % 2) ? 'white' : 'blue' });
            }
            console.log('');
            p.printTable();
            runAppChoice();
        })
        .catch(err => {
            if (err) throw err;
        });

}

// update of departments
const updateDeps = () => {
    let updateChoice = 0;
    let query = "SELECT d_name AS name, department_id AS value FROM departments;";
    connectionQuery(query)
        .then(res => {
            departments = res;
// questions about update
            return inquirer.prompt([
                {
                    type: "list",
                    message: "Please choose what you wish to do",
                    choices: [{ 'name': 'View Departments', 'value': 1 }, { 'name': 'Add Department', 'value': 2 }, { 'name': 'Rename Department', 'value': 3 }, { 'name': 'Delete Department', 'value': 4 }],
                    default: 0,
                    name: "updateChoice"
                },
                {
                    type: "list",
                    message: "Please choose Department",
                    choices: departments,
                    default: 0,
                    name: "depChoice",
                    when: function (response) { return response.updateChoice > 2 }
                },
                {
                    type: "input",
                    message: "Please enter Department Title",
                    name: "titleChoice",
                    validate: titleChoice => {
                        let alphaExp = /^[A-Za-z\ \-\_]{0,29}$/;
                        if (!titleChoice.match(alphaExp)) {
                            return "Use letters and _-. Max length 30";
                        } else {
                            return true;
                        }
                    },
                    when: function (response) { return (response.updateChoice === 2) || (response.updateChoice === 3) }
                },
            ]).then(res => {
                updateChoice = res.updateChoice;
                let queryUpdate = "";
                // setting queies for update
                if (updateChoice === 2) queryUpdate = `INSERT INTO departments (d_name) VALUES ('${res.titleChoice}')`
                if (updateChoice === 3) queryUpdate = `UPDATE departments SET d_name='${res.titleChoice}' WHERE department_id = ${res.depChoice}`;
                if (updateChoice === 4) queryUpdate = `DELETE FROM departments WHERE department_id = ${res.depChoice}`;
                if (updateChoice === 1) {
                    viewAllDeps();
                } else {
                    connection.query(queryUpdate, function (err, res) {
                        if (err) throw err;
                        console.log("Roles table was updated successfuly");
                        runAppChoice();
                    });
                }
            })
        }).catch(err => {
            if (err) throw err;
        });
}
// All departments view
const viewAllDeps = () => {
    var query = "SELECT department_id, d_name FROM departments"
    return connectionQuery(query)
        .then(res => {
            const p = new Table({
                columns: [
                    { name: 'ID', alignment: 'left' },
                    { name: 'Department_Title', alignment: 'right' },
                ],
            });
            //add rows with color
            for (let i = 0; i < res.length; i++) {
                p.addRow({
                    ID: res[i].department_id, Department_Title: res[i].d_name
                }, { color: (i % 2) ? 'white' : 'blue' });
            }
            console.log('');
            p.printTable();
            runAppChoice();
        })
        .catch(err => {
            if (err) throw err;
        });

}
// function of sub-menu for Employees
const employeeChoice = () => {
    return inquirer.prompt([
        {
            message: "What would you need to do?",
            name: "query",
            type: "list",
            choices: [
                {
                    name: "View employees",
                    value: allEmployeesList
                },
                {
                    name: "Change employee Details",
                    value: updateEmployee
                },
                {
                    name: "Add employee",
                    value: addEmployee
                },
            ]
        }
    ])
        .then(response => {
            response.query();
        });
}
// function of sub-menu for Views 
const viewsChoice = () => {
    return inquirer.prompt([
        {
            message: "What would you like to view?",
            name: "query",
            type: "list",
            choices: [
                {
                    name: "View All employees",
                    value: allEmployeesList
                },
                {
                    name: "View All Roles",
                    value: viewAllRoles
                },
                {
                    name: "View All Departments",
                    value: viewAllDeps
                },
                {
                    name: "View employees by manager",
                    value: allByManager
                },
                {
                    name: "View Employees by department",
                    value: allByDepartment
                },
                {
                    name: "View Departments salary budget",
                    value: viewDepartmentSalaryBudget
                },
            ]
        }
    ])
        .then(response => {
            response.query();
        });
}

// exit App function
const exitProgram = () => {
    connection.end();
    process.exit(0);
}

// Main Menu function
const runAppChoice = () => {
    return inquirer.prompt([
        {
            message: "What would you like to do?",
            name: "query",
            type: "list",
            choices: [

                {
                    name: "Employees",
                    value: employeeChoice
                },
                {
                    name: "Roles",
                    value: updateRoles
                },
                {
                    name: "Departments",
                    value: updateDeps
                },
                {
                    name: "Views",
                    value: viewsChoice
                },
                {
                    name: "EXIT",
                    value: exitProgram
                }

            ]
        }
    ])
        .then(response => {
            response.query();
        });
}
connection.connect(err => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    runAppChoice();
});