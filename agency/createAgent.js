const db = require('./database');

const agentData = {
  FirstName: 'John',
  LastName: 'Doe',
  Email: 'john.doe@example.com',
  PhoneNumber: '123-456-7890',
  Position: 'Junior Agent'
};

const sql = 'INSERT INTO Agents SET ?';

db.query(sql, agentData, (err, result) => {
  if (err) {
    console.error('Error inserting data:', err);
    return;
  }
  console.log('Data inserted:', result);
});
