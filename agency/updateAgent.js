const db = require('./database');

const updatedData = {
  Email: 'john.doe@updated.com'
};

const sql = 'UPDATE Agents SET ? WHERE AgentID = 1';

db.query(sql, updatedData, (err, result) => {
  if (err) {
    console.error('Error updating data:', err);
    return;
  }
  console.log('Data updated:', result);
});
