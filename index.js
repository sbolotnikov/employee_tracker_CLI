var mysql = require("mysql");
var inquirer = require("inquirer");
const { Table } = require('console-table-printer');
const chalk = require('chalk');
const log = console.log;

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

const allEmployeesList = () => {
    var employees = [];
    var roles = [];
    var condition = '';

    var query = "SELECT manager_id FROM employee GROUP BY (manager_id);";
    connection.query(query, function (err, res) {
        if (err) throw err;
        res.forEach(idItem => {
            condition += ` OR (id=${idItem.manager_id})`
        });
        condition = condition.substr(4, condition.length - 4);
        var query1 = "CREATE TABLE manager (SELECT id AS manager_id, CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, ''))  AS m_name FROM employee WHERE " + condition + ");";
        connection.query(query1, function (err, res) {
            if (err) throw err;
            var query = "INSERT INTO manager (manager_id, M_NAME) VALUE (0,'None')";
            connection.query(query, function (err, res) {
                if (err) throw err;
                var query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, departments.d_name, manager.m_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) JOIN manager USING(manager_id) ORDER BY employee.id;";
                connection.query(query, function (err, res) {
                    // console.log(err);
                    if (err) throw err;
                    //Create a table
                    const p = new Table({
                        columns: [
                            { name: 'ID', alignment: 'left' },// color: 'blue'}, //with alignment and color
                            { name: 'Name', alignment: 'right' },// color: 'white'},
                            { name: 'Position', alignment: 'right' },// color: 'yellow'},
                            { name: 'Salary', alignment: 'right' },// color: 'red'},
                            { name: 'Department', alignment: 'right' },// color: 'blue'},
                            { name: 'Manager', alignment: 'right' },// color: 'green'},
                        ],
                    });

                    //add rows with color
                    for (let i = 0; i < res.length; i++) {
                        p.addRow({
                            ID: res[i].id, Name: res[i].first_name + " " +
                                res[i].last_name, Position: res[i].title, Salary: res[i].salary, Department: res[i].d_name, Manager: res[i].m_name
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

            });
        });
    });
};
const allByManager = () => {
    var condition = '';
    var managers = [];
    var query = "SELECT manager_id FROM employee GROUP BY (manager_id);";
    connection.query(query, function (err, res) {
        if (err) throw err;
        res.forEach(idItem => {
            condition += ` OR (id=${idItem.manager_id})`;
            managers.push(idItem.manager_id);
        });
        condition = condition.substr(4, condition.length - 4);
        var query1 = "CREATE TABLE manager (SELECT id AS manager_id, CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, ''))  AS m_name FROM employee WHERE " + condition + ");";
        connection.query(query1, function (err, res) {
            if (err) throw err;
            var query = "INSERT INTO manager (manager_id, M_NAME) VALUE (0,'None')";
            connection.query(query, function (err, res) {
                if (err) throw err;
                for (let i = 0; i < managers.length; i++) {
                    var query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, departments.d_name, manager.m_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) JOIN manager USING(manager_id) WHERE employee.manager_id=" + managers[i] + ";";
                    connection.query(query, function (err, res) {
                        // console.log(err);
                        if (err) throw err;
                        //Create a table
                        const p = new Table({
                            columns: [
                                { name: 'ID', alignment: 'left' },// color: 'blue'}, //with alignment and color
                                { name: 'Name', alignment: 'right' },// color: 'white'},
                                { name: 'Position', alignment: 'right' },// color: 'yellow'},
                                { name: 'Salary', alignment: 'right' },// color: 'red'},
                                { name: 'Department', alignment: 'right' },// color: 'blue'},
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
        });
    });
};

const allByDepartment = () => {
    var condition = '';
    var managers = [];
    var query = "SELECT manager_id FROM employee GROUP BY (manager_id);";
    connection.query(query, function (err, res) {
        if (err) throw err;
        res.forEach(idItem => {
            condition += ` OR (id=${idItem.manager_id})`;
            managers.push(idItem.manager_id);
        });
        condition = condition.substr(4, condition.length - 4);
        var query1 = "CREATE TABLE salaryTotals (SELECT SUM(role.salary) totalDepSalary, departments.d_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) GROUP BY (department_id));";
        connection.query(query1, function (err, res) {
            if (err) throw err;
            var query = "SELECT * FROM departments";
            connection.query(query, function (err, res) {
                if (err) throw err;
                for (let i = 0; i < res.length; i++) {
                    var query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, departments.d_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) WHERE department_id=" + res[i].department_id + ";";
                    connection.query(query, function (err, res) {
                        // console.log(err);
                        if (err) throw err;
                        //Create a table
                        const p = new Table({
                            title: `Department:  ${res[0].d_name}`,
                            columns: [
                                { name: 'ID', alignment: 'left' },// color: 'blue'}, //with alignment and color
                                { name: 'Name', alignment: 'right' },// color: 'white'},
                                { name: 'Position', alignment: 'right' },// color: 'yellow'},
                                { name: 'Salary', alignment: 'right' },// color: 'red'},
                            ],
                        });
                        console.log('-----------------------------');
                        // console.log(`Department:  ${res[0].d_name}`);
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
                    var query = "SELECT * FROM salaryTotals WHERE d_name='" + res[i].d_name + "';";
                    connection.query(query, function (err, res) {
                        if (err) throw err;
                        log(chalk.yellow('Total salary from department    :       ') + chalk.white.bgMagenta.bold('$'+res[0].totalDepSalary));
                    })
                }
                var query = "SELECT SUM(totalDepSalary) total FROM salaryTotals;";
                connection.query(query, function (err, res) {
                    if (err) throw err;
                    console.log("---------------------------------");
                    log(chalk.yellow('Total company salary budget  :         ') + chalk.white.bgRed.bold('$'+res[0].total));
                    console.log('');
                    console.log('');
                })
                try {
                    var query1 = "DROP TABLE IF EXISTS salaryTotals;";
                    connection.query(query1, function (err, res) {
                        if (err) throw err;
                        runAppChoice();
                    });
                } catch (e) { return }
            })
        });
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
                // "Add employee",
                // "Remove employee",
                // "Update employee roles",
                // "Update employee manager",
                // "Add departments, roles, employees",
                // "View employees by manager",
                // "Update employee roles",
                // "Update employee managers",
                // "Delete departments, roles, and employees",
                {
                    name: "View All employees",
                    value: allEmployeesList
                },
                {
                    name: "View All employees by manager",
                    value: allByManager
                },
                {
                    name: "View Employees by department salary budget",
                    value: allByDepartment
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