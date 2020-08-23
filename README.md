# Employee Tracker CLI ![employeetrackerCLI](https://img.shields.io/github/license/sbolotnikov/employee_tracker_CLI)
## Description 

As a business owner
I want to be able to view and manage the departments, roles, and employees in my company
So that I can organize and plan my business.

 Challenge is to architect and build a solution for managing a company's employees using node, inquirer, and MySQL. (**C**ontent **M**anagement **S**ystems)
Design the following database schema containing three tables:

* **department**:

  * **id** - INT PRIMARY KEY
  * **name** - VARCHAR(30) to hold department name

* **role**:

  * **id** - INT PRIMARY KEY
  * **title** -  VARCHAR(30) to hold role title
  * **salary** -  DECIMAL to hold role salary
  * **department_id** -  INT to hold reference to department role belongs to

* **employee**:

  * **id** - INT PRIMARY KEY
  * **first_name** - VARCHAR(30) to hold employee first name
  * **last_name** - VARCHAR(30) to hold employee last name
  * **role_id** - INT to hold reference to role employee has
  * **manager_id** - INT to hold reference to another employee that manager of the current employee. This field may be null if the employee has no manager


## Table of Contents
* [Installation](#installation)
* [Usage](#usage)
* [License](#license)
* [Questions](#questions)
* [Review](#review)
## Installation 
1. Clone my repository. Install dependencies. The dependencies are, jest for running the provided tests, and inquirer for collecting input from the user.

```
git clone git@github.com:sbolotnikov/employee_tracker_CLI.git
yarn install
```

2. Start MySQL Workbench 
3. Run schema.sql and seed.sql
4. Start node:

```
node index.js
```

## Usage 

Look at video for further instructions:
[YouTube](https://youtu.be/T3FLJTATWkg )

User has a menu of things that could be done:

Employee- Add, Update Role or Manager, Delete, View All

Role Add, Update, Delete, View All

Departments Add, Update, Delete, View

Views store All views named above and Employees by Manager, by Department, and Departments Salary budget

Employee add,edit,view and delete example:
![employeetrackerCLI](./images/img.gif) 

Role add,edit,view and delete example:
![employeetrackerCLI](./images/img1.gif) 

Department add,update,view and delete example:
![employeetrackerCLI](./images/img2.gif) 
Views example:
![employeetrackerCLI](./images/img3.gif) 

## Contributing 
 None 
## License 
 Licensed under MIT License. 
## Tests 
 None
## Questions 
 You can see more of my Projects on my [GitHub profile](https://github.com/sbolotnikov) 

 Contact [sbolotnikov](mailto:sbolotnikov@gmail.com) 
## Review 
  * Here is this repo link: https://github.com/sbolotnikov/employeetrackerCLI
 
  * Link: application is not deployed