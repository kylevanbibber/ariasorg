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
    const { agent_name, contract_level } = req.body;
    const sql = 'INSERT INTO agent_table (agent_name, contract_level) VALUES ($1, $2)';
    db.query(sql, [agent_name, contract_level], (err, result) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
            return;
        }
        res.status(201).json({ message: 'New agent created.', AgentID: result.insertId });
    });
});

// Read all agents
app.get('/agents', (req, res) => {
    const sql = 'SELECT * FROM agent_table';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
            return;
        }
        res.status(200).json(results);
    });
});

// Update an agent
app.put('/agents/:agent_code', (req, res) => {
  const { agent_code } = req.params;
  const { agent_name, contract_level } = req.body;
  const sql = 'UPDATE agent_table SET agent_name = $1, contract_level = $2 WHERE agent_code = $3';
  db.query(sql, [agent_name, contract_level, agent_code], (err, result) => {
      if (err) {
          console.error(err.message);
          res.status(500).json({ error: 'Internal Server Error', details: err.message });
          return;
      }
      res.status(200).json({ message: 'Agent updated.' });
  });
});

// Delete an agent
app.delete('/agents/:agent_code', (req, res) => {
  const { agent_code } = req.params;
  const sql = 'DELETE FROM agent_table WHERE agent_code = $1';
  db.query(sql, [agent_code], (err, result) => {
      if (err) {
          console.error(err.message);
          res.status(500).json({ error: 'Internal Server Error', details: err.message });
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

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Internal Server Error', details: err.message });
});
