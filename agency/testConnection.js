const db = require('./database');

db.query('SELECT 1 + 1 AS solution', (err, results) => {
  if (err) {
    console.error('Database query error:', err);
    return;
  }
  console.log('Database query results:', results);
});