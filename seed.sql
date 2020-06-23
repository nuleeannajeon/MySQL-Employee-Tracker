CREATE DATABASE CMS_DB;

USE CMS_DB;

CREATE TABLE department (
    id INTEGER PRIMARY KEY,
    name VARCHAR(30)
);

CREATE TABLE role (
    id INTEGER PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INTEGER
);

CREATE TABLE employee (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INTEGER,
    manager_id INTEGER DEFAULT(NULL)
);

SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;

INSERT INTO department VALUES(0, "Sales");
INSERT INTO department VALUES(0, "Engineering");
INSERT INTO department VALUES(0, "Finance");
INSERT INTO department VALUES(0, "Legal");

INSERT INTO role VALUES(0, "Sales Lead", 100000, 1);
INSERT INTO role VALUES(0, "Salesperson", 80000, 1);
INSERT INTO role VALUES(0, "Lead Engineer", 150000, 2);
INSERT INTO role VALUES(0, "Software Engineer", 120000, 2);
INSERT INTO role VALUES(0, "Account Manager", 200000, 3);
INSERT INTO role VALUES(0, "Accountant", 130000, 3);
INSERT INTO role VALUES(0, "Legal Team Lead", 300000, 4);
INSERT INTO role VALUES(0, "Lawyer", 195000, 4);

INSERT INTO employee VALUES(0, "Anna", "Jeon", 3, 0);

