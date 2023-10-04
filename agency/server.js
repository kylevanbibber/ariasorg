const express = require('express');
const db = require('./database');
const { auth } = require('express-openid-connect');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = 3002;

// Middleware to parse JSON requests
app.use(express.json());

console.log(process.env.AUTH0_SECRET);
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: 'http://localhost:3002',
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_DOMAIN
};

// Add Auth0 as middleware
app.use(auth(config));

function ensureLoggedIn(req, res, next) {
    if (req.oidc.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }

// Test endpoint
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// Create a new agent
app.post('/agents', (req, res) => {
  const { FirstName, LastName, Email, PhoneNumber, Position } = req.body;
  const sql = 'INSERT INTO Agents SET ?';
  const agentData = { FirstName, LastName, Email, PhoneNumber, Position };

  db.query(sql, agentData, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.status(201).json({ message: 'New agent created.', AgentID: result.insertId });
  });
});

// Read all agents
app.get('/agents', (req, res) => {
  const sql = 'SELECT * FROM Agents';

  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.status(200).json(results);
  });
});

// Update an agent
app.put('/agents/:id', (req, res) => {
  const { id } = req.params;
  const { FirstName, LastName, Email, PhoneNumber, Position } = req.body;
  const sql = 'UPDATE Agents SET ? WHERE AgentID = ?';
  const agentData = { FirstName, LastName, Email, PhoneNumber, Position };

  db.query(sql, [agentData, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.status(200).json({ message: 'Agent updated.' });
  });
});

// Delete an agent
app.delete('/agents/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Agents WHERE AgentID = ?';

  db.query(sql, id, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.status(200).json({ message: 'Agent deleted.' });
  });
});

// Profile page, only accessible for logged-in users
app.get('/profile', ensureLoggedIn, (req, res) => {
  res.json({
    user: req.oidc.user,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
