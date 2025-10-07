
const mysql = require('mysql2')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123A!',
  database: 'task5'
  })


module.exports = connection;