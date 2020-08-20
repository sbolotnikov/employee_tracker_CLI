var mysql = require("mysql");
var inquirer = require("inquirer");
const { Table } = require('console-table-printer');
const questionsArr = require('./lib/questions')
const chalk = require('chalk');
const util = require('util');
const log = console.log;
var employees = [];


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

const allEmployeesList = () => {
    var employees = [];
    var roles = [];
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
            var query4 = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, departments.d_name, manager.m_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) JOIN manager USING(manager_id) ORDER BY employee.id;";
            // if (err) throw err;
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
                    var query = "SELECT * FROM salaryTotals WHERE d_name='" + res[i].d_name + "';";
                    connection.query(query, function (err, res) {
                        if (err) throw err;
                        log(chalk.yellow.bgMagenta('Total salary from department    :       ') + chalk.white.bgMagenta.bold('$' + res[0].totalDepSalary));
                    })
                }
                var query = "SELECT SUM(totalDepSalary) total FROM salaryTotals;";
                connection.query(query, function (err, res) {
                    if (err) throw err;
                    console.log("---------------------------------");
                    log(chalk.yellow.bgRed('Total company salary budget  :         ') + chalk.white.bgRed.bold('$' + res[0].total));
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
async function getEmployeesList() {
    let staff = [];
    var query = "SELECT id, CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, '')) name FROM employee ;";
    connectionQuery(query)
        .then(res => {
        res.forEach(idItem => {
            staff.push({ "name": idItem.name, "value": idItem.id });
        });
        employees = staff;

    })
};

const changeFunction = () => {

    
    // try {
    //   getEmployeesList();
    //   setTimeout("", 2000);
    // } catch (e) {
    inquirer.prompt([
        {
            type: "list",
            message: "What kind of change would you like?",
            // choices: ["Add", "Update", "Delete"],
            choices: employees,
            default: 0,
            name: "changeChoice"
        },
        {
            type: "list",
            message: "What would you like to change?",
            choices: ["Employee", "Role", "Department"],
            default: 0,
            name: "whatChoice"
        }]).then(response => {
            console.log(response)

        });
    // }










}
const exitProgram = () => {
    connection.end();
    process.exit(0);
}
const runAppChoice = () => {
    getEmployeesList();
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
                    name: "Change",
                    value: changeFunction
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