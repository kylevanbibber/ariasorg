const db = require('./database');

const sql = 'DELETE FROM Agents WHERE AgentID = 1';

db.query(sql, (err, result) => {
  if (err) {
    console.error('Error deleting data:', err);
    return;
  }
  console.log('Data deleted:', result);
});
