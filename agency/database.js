const { Pool } = require('pg');

const pool = new Pool({
  host: 'ec2-107-21-67-46.compute-1.amazonaws.com',
  user: 'aklrdxqgeciqyw',
  password: 'a8914d0696f40c7e49d1b2606b34759a79a33c1d97a83fe22ce806d142ba92f7',
  database: 'd2c8h9gginll7q',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

module.exports = pool;
