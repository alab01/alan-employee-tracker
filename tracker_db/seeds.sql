INSERT INTO departments (name)
VALUES ("Sales"),
       ("Engineering"),
       ("Finance"),
       ("Legal"),

INSERT INTO roles (title, salary, department_id)
VALUES ("Salesperson", 80000, 1),
       ("Software Engineer", 100000, 2),
       ("Accountant", 150000, 3),
       ("Lawyer", 200000, 4),
       ("Legal Team Lead", 250000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Vito", "Corleone", 1, NULL),
       ("Peter", "Clemenza", 2, NULL),
       ("Moe", "Greene", 3, 1),
       ("Johnny", "Ola", 2, 2),
       ("Tom", "Hagen", 4, 2);
       ("Frank", "Pentangeli", 2, 1)