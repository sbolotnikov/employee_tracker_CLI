var mysql = require("mysql");
var inquirer = require("inquirer");

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

connection.connect(function (err) {
    if (err) throw err;
    runAppChoice();
});

function runAppChoice() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
                "View All employees",
                "View All employees by department",
                // "View employees by manager",
                // "Add employee",
                // "Remove employee",
                // "Update employee roles",
                // "Update employee manager",
                // "Add departments, roles, employees",
                // "View employees by manager",
                // "Update employee roles",
                // "Update employee managers",
                // "Delete departments, roles, and employees",
                // "Find artists with a top song and top album in the same year"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View All employees":
                    allEmployeesList();
                    break;

                case "Find all artists who appear more than once":
                    multiSearch();
                    break;

                case "Find data within a specific range":
                    rangeSearch();
                    break;

                case "Search for a specific song":
                    songSearch();
                    break;

                case "Find artists with a top song and top album in the same year":
                    songAndAlbumSearch();
                    break;
            }
        });
}

function allEmployeesList() {
    var employees = [];
    var roles = [];
    var condition = '';

//    try {
//     var query1 = "DROP TABLE IF EXISTS manager;";
//     connection.query(query1, function (err, res) {
//         console.log(err)
//     });
//    }catch(e){

//    }



    // SELECT manager_id, CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, '')) AS m_name FROM employee WHERE (manager_id!='NULL') GROUP BY (manager_id);
    var query = "SELECT manager_id FROM employee GROUP BY (manager_id);";
    connection.query(query, function (err, res) {
        console.log(err);
        res.forEach(idItem => {
            condition += ` OR (id=${idItem.manager_id})`
        });

        condition = condition.substr(4, condition.length - 4);
        // var query1 = "CREATE TABLE manager(SELECT id, CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, '')) FROM employee WHERE " + condition + ";)";
        var query1 = "CREATE TABLE manager (SELECT id AS manager_id, CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, ''))  AS m_name FROM employee WHERE " + condition + ");";
        console.log(query1)
        connection.query(query1, function (err, res) {
            console.log(res);
            console.log(err);
        });
    });
    // var query = "INSERRT INTO manager SET m_name SELECT CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, '')) FROM employee WHERE id=manager_id;";
    // // CONCAT(COALESCE(first_name, ''),' ', COALESCE(last_name, '')) AS m_name
    // connection.query(query, function (err, res) {
    //     console.log(err);
    // });
    var query = "INSERT INTO manager (manager_id, M_NAME) VALUE (0,'None')";
    connection.query(query, function (err, res) {
        console.log(err);
    });
    var query2 = "SELECT * FROM manager";
    connection.query(query2, function (err, res) {
        console.log(res)
    });


    var query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, departments.d_name, manager.m_name FROM employee JOIN role USING(role_id) JOIN departments USING(department_id) JOIN manager USING(manager_id) ORDER BY employee.id;";
    connection.query(query, function (err, res) {
        console.log(err);
        // console.log(res)

        for (let i = 0; i < res.length; i++) {
            console.table([res[i].id , res[i].first_name + " " +
                res[i].last_name , res[i].title, res[i].salary, res[i].d_name, res[i].m_name]);
        }
    });
   

   try {
    var query1 = "DROP TABLE IF EXISTS manager;";
    connection.query(query1, function (err, res) {
        console.log(err)
    });
   }catch(e){

   }





    // var query2 = "SELECT role_id, title, salary, department_id FROM role";
    // connection.query(query2, function (err, res) {
    //     roles = res;
    //     console.log(res)
    // });
    // console.log("Second one");
    // console.log(employees);
    // console.log(employees[0].last_name + " || " + employees[0].first_name+" "+ employees[0].id)

    runAppChoice();
};


// + roles[employees[i].role_id].title+" || " +
//         res1[employees[i].role_id].salary+" || " + employees[employees[i].manager_id].first_name
//         +" "+employees[employees[i].manager_id].last_name+" || "