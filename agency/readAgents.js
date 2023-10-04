const db = require('./database');

const sql = 'SELECT * FROM Agents';

db.query(sql, (err, results) => {
  if (err) {
    console.error('Error fetching data:', err);
    return;
  }
  console.log('Data fetched:', results);
});
