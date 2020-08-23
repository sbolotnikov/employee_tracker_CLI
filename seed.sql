  
INSERT INTO departments (d_name) 
VALUES 
("HR"), -- id 1
("Accounting"), -- id 2 
("Engineering"), -- id 3
("Administrative"); -- id 4


INSERT INTO role (title, salary, department_id)
VALUES 
("CEO", 1.00, 3), -- id 1
("CFO", 250000.00, 2), -- id 2
("Director of HR", 200000.00, 1), -- id 3
("Assistant HR", 100000.00, 1), -- id 4
("Accountant", 90000, 2), -- id 5
("Receptionist", 50000, 4), -- id 6
("Administrator", 60000, 4), -- id 7
("Project Manager", 150000, 3), -- id 8
("Senior Engineer", 125000, 3), -- id 9
("Engineer", 100000, 3); -- id 10

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("President", "Shinra", 1, 0), -- 1
("Rufus", "Shinra", 2, 0), -- 2
("Reeve", "Tuesti", 3, 0), -- 3
("Elena", "Tseng", 4, 3), -- 4
("Reno", "Rude", 5, 2), -- 5
("Tifa", "Lockhart", 6, 3), -- 6
("Aerith", "Gainsborough", 7, 3), -- 7
("Sephiroth", "Jenova", 8, 1), -- 8
("Genesis", "Rhapsodos", 9, 8), -- 9
("Angeal", "Hewley", 9, 8), -- 10
("Zack", "Fair", 10, 8), -- 11
("Cloud", "Strife", 10, 8); -- 11
