const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'agency-hierarchy.cevmndecheqa.us-east-2.rds.amazonaws.com',
  user: 'vvllc2023',
  password: 'Atlas2023!',
  database: 'agency-hierarchy',
  port: 3306,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

module.exports = connection;