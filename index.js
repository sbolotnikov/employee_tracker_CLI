var mysql = require("mysql");
var inquirer = require("inquirer");
const { Table } = require('console-table-printer');
const questionsArr = require('./lib/questions')
const chalk = require('chalk');
const util = require('util');
const { indexOf } = require("./lib/questions");
const log = console.log;
var employees, roles, managers, departments = [];



// Combine styled and normal strings
log(chalk.blue('Hello') + ' World' + chalk.red('!'));

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

const connectionQuery = util.promisify(connection.query.bind(connection));

function getManagersTable() {
    var condition = '';
    var query = "SELECT manager_id FROM employee GROUP BY (manager_id);";
    connectionQuery(query)
        .then(res => {
            res.forEach(idItem => {
                condition += ` OR (id=${idItem.manager_id})`
            });
            condition = condition.substr(4, condition.length - 4);
            var query2 = "CREATE TABLE manager (SELECT id AS manager_id, CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, ''))  AS m_name FROM employee WHERE " + condition + ");";
            return connectionQuery(query2);
        })
        .then(res2 => {
            var query3 = "INSERT INTO manager (manager_id, M_NAME) VALUE (0,'None')";
            return connectionQuery(query3);
        })
        .then(res3 => {
            log("got throu")
            return true;
        })
    // .catch(err => {
    //     if (err) throw err;
    // });
}
const getManagersTableProm = util.promisify(getManagersTable);



const allEmployeesList = () => {
    var employees = [];
    var roles = [];
    getManagersTableProm()



        // var condition = '';
        // var query = "SELECT manager_id FROM employee GROUP BY (manager_id);";
        // connectionQuery(query)
        //     .then(res => {
        //         res.forEach(idItem => {
        //             condition += ` OR (id=${idItem.manager_id})`
        //         });
        //         condition = condition.substr(4, condition.length - 4);
        //         var query2 = "CREATE TABLE manager (SELECT id AS manager_id, CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, ''))  AS m_name FROM employee WHERE " + condition + ");";
        //         return connectionQuery(query2);
        //     })
        //     .then(res2 => {
        //         var query3 = "INSERT INTO manager (manager_id, M_NAME) VALUE (0,'None')";
        //         return connectionQuery(query3);
        //     })
        .then(res => {
            var query4 = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, departments.d_name, manager.m_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) JOIN manager USING(manager_id) ORDER BY employee.id;";
            console.log("mainbody");
            return connectionQuery(query4);
        })


        .then(res4 => {
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
            try {
                var query1 = "DROP TABLE IF EXISTS manager;";
                connection.query(query1, function (err, res) {
                    if (err) throw err;
                    runAppChoice();
                });
            } catch (e) { return }
        })
        .catch(err => {
            if (err) throw err;
        });

};
const allByManager = () => {
    var condition = '';
    var managers = [];
    var query = "SELECT manager_id FROM employee GROUP BY (manager_id);";

    connectionQuery(query)
        .then(res => {

            res.forEach(idItem => {
                condition += ` OR (id=${idItem.manager_id})`;
                managers.push(idItem.manager_id);
            });
            condition = condition.substr(4, condition.length - 4);
            var query2 = "CREATE TABLE manager (SELECT id AS manager_id, CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, ''))  AS m_name FROM employee WHERE " + condition + ");";
            return connectionQuery(query2);
        })
        .then(res2 => {
            var query3 = "INSERT INTO manager (manager_id, M_NAME) VALUE (0,'None')";
            return connectionQuery(query3);
        })
        .then(res3 => {
            for (let i = 0; i < managers.length; i++) {
                var query4 = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, departments.d_name, manager.m_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) JOIN manager USING(manager_id) WHERE employee.manager_id=" + managers[i] + ";";
                connection.query(query4, function (err, res) {
                    if (err) throw err;
                    //Create a table
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

            try {
                var query1 = "DROP TABLE IF EXISTS manager;";
                connection.query(query1, function (err, res) {
                    if (err) throw err;
                    runAppChoice();
                });
            } catch (e) { return }
        })
        .catch(err => {
            if (err) throw err;
        });
};














const allByDepartment = () => {
    var condition = '';
    var managers = [];
    var query = "SELECT manager_id FROM employee GROUP BY (manager_id);";
    connectionQuery(query)
        .then(res => {
            res.forEach(idItem => {
                condition += ` OR (id=${idItem.manager_id})`;
                managers.push(idItem.manager_id);
            });
            condition = condition.substr(4, condition.length - 4);
            var query2 = "CREATE TABLE salaryTotals (SELECT SUM(role.salary) totalDepSalary, departments.d_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) GROUP BY (department_id));";
            return connectionQuery(query2);
        })
        .then(res2 => {
            var query3 = "SELECT * FROM departments";
            return connectionQuery(query3);
        })
        .then(res3 => {
            for (let i = 0; i < res3.length; i++) {
                var queryOut = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, departments.d_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) WHERE department_id=" + res3[i].department_id + ";";
                //         connectionQuery(queryOut)
                // .then(res => {
                connection.query(queryOut, function (err, res) {
                    // console.log(err);
                    if (err) throw err;
                    //Create a table
                    const p = new Table({
                        title: `Department:  ${res[0].d_name}`,
                        columns: [
                            { name: 'ID', alignment: 'left' },
                            { name: 'Name', alignment: 'right' },
                            { name: 'Position', alignment: 'right' },
                            { name: 'Salary', alignment: 'right' },
                        ],
                    });
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
                })
                var queryOut2 = "SELECT * FROM salaryTotals WHERE d_name='" + res3[i].d_name + "';";
                connection.query(queryOut2, function (err, res) {
                    if (err) throw err;
                    log(chalk.yellow.bgMagenta('Total salary from department ' + res[0].d_name + ': ') + chalk.white.bgMagenta.bold('$' + res[0].totalDepSalary));
                })
            }
            var query4 = "SELECT SUM(totalDepSalary) total FROM salaryTotals;";
            return connectionQuery(query4);
        })
        .then(res4 => {

            console.log("---------------------------------");
            log(chalk.yellow.bgRed('Total company salary budget  :         ') + chalk.white.bgRed.bold('$' + res4[0].total));
            console.log('');
            console.log('');

            try {
                var query1 = "DROP TABLE IF EXISTS salaryTotals;";
                connection.query(query1, function (err, res) {
                    if (err) throw err;
                    runAppChoice();
                });
            } catch (e) { return }
        })
        .catch(err => {
            if (err) throw err;
        });
}

















const addEmployee = () => {
    let query = "SELECT CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, ''))  AS name, id AS value FROM employee ;";
    connectionQuery(query)
        .then(res => {
            employees = res;
            employees.push({ 'name': 'None', 'value': 0 })
            let query2 = "SELECT title AS name, role_id AS value FROM role;";
            return connectionQuery(query2)
        })
        .then(res2 => {
            roles = res2;
            return inquirer.prompt([
                {
                    type: "input",
                    message: "Please enter employee's first name",
                    name: "nameChoice",
                    validate: nameChoice => {
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
                let query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${response.nameChoice}','${response.lastNameChoice}',${response.roleChoice},${response.managerChoice})`;
                return connectionQuery(query);
            })
                .then(res => {
                    console.log(res)
                    console.log("Employee added successfuly");
                    runAppChoice();
                })
        })
        .catch(err => {
            if (err) throw err;
        });
}
const updateEmployee = () => {
    let employeeUpdate = 0;
    let updateChoice = 0;
    let query = "SELECT CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, ''))  AS name, id AS value FROM employee ;";
    connectionQuery(query)
        .then(res => {
            employees = res;
            let query2 = "SELECT title AS name, role_id AS value FROM role;";
            return connectionQuery(query2)
        })
        .then(res2 => {
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
                    type: "list",
                    message: "Please choose what you wish to update",
                    choices: [{ 'name': 'Manager', 'value': 1 }, { 'name': 'Role', 'value': 2 }, { 'name': 'Delete', 'value': 3 }],
                    default: 0,
                    name: "updateChoice"
                },
            ]).then(res => {
                employeeUpdate = res.employeeChoice;
                updateChoice = res.updateChoice;
                console.log(employeeUpdate)
                managers = employees.filter(person => person.value != employeeUpdate);
                managers.push({ 'name': 'None', 'value': 0 })
                let query4 = "SELECT id,role_id, manager_id FROM employee WHERE id=" + employeeUpdate + ";";
                return connectionQuery(query4)
            })
                .then(res4 => {
                    let defaultRole = res4[0].role_id;
                    let defaultmanager = res4[0].manager_id;
                    console.log(defaultmanager, defaultRole);
                    function checkManagers(managers) {
                        return defaultmanager === managers.value;
                    }
                    defaultmanager = managers.findIndex(checkManagers);
                    function checkRole(roles) {
                        return defaultRole === roles.value;
                    }
                    defaultRole = roles.findIndex(checkRole);
                    console.log(defaultmanager, defaultRole);
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
                            console.log(res)
                            console.log("Employee updated successfuly");
                            runAppChoice();
                        })

                })
        })
        .catch(err => {
            if (err) throw err;
        });
}
const updateRoles = () => {
    let roleUpdate = 0;
    let updateChoice = 0;
    let query = "SELECT d_name AS name, department_id AS value FROM departments;";
    connectionQuery(query)
        .then(res => {
            departments = res;
            let query2 = "SELECT title AS name, role_id AS value FROM role;";
            return connectionQuery(query2)
        })
        .then(res2 => {
            roles = res2;
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
                console.log(roleUpdate)
                let query3 = "SELECT title, salary, department_id FROM role WHERE role_id=" + roleUpdate + ";";
                return connectionQuery(query3)
            }).then(res3 => {
                let defaultDepartment = 0;
                let defaultSalary = 0;
                if (updateChoice > 2) {
                    defaultDepartment = res3[0].department_id;
                    defaultSalary = res3[0].salary;

                    function checkDep(departments) {
                        return defaultDepartment === departments.value;
                    }
                    defaultDepartment = departments.findIndex(checkDep);
                    console.log(defaultDepartment);
                }
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
                            let alphaExp = /^[0-9]{0,7}$/;
                            if (!salaryChoice.match(alphaExp)) {
                                return "Use numbers only and no more then 6 figure. You don't know how to print money";
                            } else {
                                if (salaryChoice < 10000) {
                                    return "who do you think will work for such money"
                                } else {
                                    return true;
                                }
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
                    if (updateChoice === 2) queryUpdate = `INSERT INTO role (title, salary, department_id) VALUES ('${res.titleChoice}','${res.salaryChoice}',${res.depChoice})`
                    if (updateChoice === 3) queryUpdate = `UPDATE role SET salary=${res.salaryChoice}, department_id=${res.depChoice} WHERE role_id = ${roleUpdate}`;
                    if (updateChoice === 4) queryUpdate = `DELETE FROM role WHERE role_id = ${roleUpdate}`;
                    if (updateChoice === 1) {
                        console.log("view");
                        viewAllRoles();
                    } else {
                        connection.query(queryUpdate, function (err, res) {
                            // console.log(err);
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
const updateDeps = () => {
    let updateChoice = 0;
    let query = "SELECT d_name AS name, department_id AS value FROM departments;";
    connectionQuery(query)
        .then(res => {
            departments = res;
            
            return inquirer.prompt([
                {
                    type: "list",
                    message: "Please choose what you wish to do",
                    choices: [{ 'name': 'View Departments', 'value': 1 }, { 'name': 'Add Department', 'value': 2 },{ 'name': 'Rename Department', 'value': 3 }, { 'name': 'Delete Department', 'value': 4 }],
                    default: 0,
                    name: "updateChoice"
                },
                {
                    type: "list",
                    message: "Please choose Department",
                    choices: departments,
                    default: 0,
                    name: "depChoice",
                    when: function (response) { return response.updateChoice>2 }
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
                    when: function (response) { return (response.updateChoice === 2)||(response.updateChoice === 3) }
                },
                ]).then(res => {
                    updateChoice=res.updateChoice;
                    let queryUpdate = "";
                    if (updateChoice === 2) queryUpdate = `INSERT INTO departments (d_name) VALUES ('${res.titleChoice}')`
                    if (updateChoice === 3) queryUpdate = `UPDATE departments SET d_name='${res.titleChoice}' WHERE department_id = ${res.depChoice}`;
                    if (updateChoice === 4) queryUpdate = `DELETE FROM departments WHERE department_id = ${res.depChoice}`;
                    if (updateChoice === 1) {
                        viewAllDeps();
                    } else {
                        connection.query(queryUpdate, function (err, res) {
                            // console.log(err);
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

const employeeChoice = () => {
    return inquirer.prompt([
        {
            message: "What would you need to do?",
            name: "query",
            type: "list",
            choices: [
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
                    name: "View Employees by department salary budget",
                    value: allByDepartment
                },
            ]
        }
    ])
        .then(response => {
            response.query();
        });
}


const exitProgram = () => {
    connection.end();
    process.exit(0);
}
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