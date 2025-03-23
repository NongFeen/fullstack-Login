CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

CREATE TABLE IF NOT EXISTS users (
  id INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  role ENUM('user','admin','manager') NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO users (id, username, password, role) VALUES
(1, 'User1', '$2b$10$abcd1234567890', 'user'),
(2, 'Admin', '$2b$10$efghijklmno.qwerty', 'admin'),
(3, 'Manager', '$2b$10$lmnopqrstuvwxyzzzzzzz', 'manager');

GRANT ALL PRIVILEGES ON auth_db.* TO 'root'@'%';
FLUSH PRIVILEGES;

Select * from users;