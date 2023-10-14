const express = require('express');
const db = require('./database');
const { auth } = require('express-openid-connect');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = 3002;

// CORS Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

// Setting up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware to parse JSON requests
app.use(express.json());

// Auth0 Configuration and Middleware
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: 'http://localhost:3002',
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_DOMAIN
};
app.use(auth(config));
function ensureLoggedIn(req, res, next) {
    if (req.oidc.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Home Route with Agent Management Dashboard
app.get('/', ensureLoggedIn, (req, res) => {
    const sql = 'SELECT * FROM agent_table';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server Error");
            return;
        }
        const agents = results.rows || [];
        res.render('index', { agents });
    });
});

// *** This is the route for fetching agents ***
app.get('/api/agents', (req, res) => {
    const sql = 'SELECT * FROM agent_table';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.json(results.rows || []);
    });
});

app.post('/api/agents', (req, res) => {
    const { agent_name, contract_level, upline } = req.body;
    
    if (!agent_name || !contract_level) {
        return res.status(400).json({ error: "Required fields are missing." });
    }
    
    // Fetch the contract level of the upline agent
    const uplineAgentSql = 'SELECT contract_level FROM agent_table WHERE agent_code = $1';
  db.query(uplineAgentSql, [upline], (err, result) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
      return;
    }
        // Check if the upline agent exists and their contract level meets the hierarchy rules
        const uplineAgentContractLevel = result.rows[0].contract_level;

        if (!uplineContractLevel) {
            return res.status(400).json({ error: 'Upline agent does not exist.' });
        }

        if (contract_level === 'AGT' || uplineContractLevel === 'AGT' ||
            (contract_level === 'GA' && (uplineContractLevel === 'SA' || uplineContractLevel === 'AGT')) ||
            (contract_level === 'MGA' && (uplineContractLevel === 'GA' || uplineContractLevel === 'SA' || uplineContractLevel === 'AGT')) ||
            (contract_level === 'RGA' && (uplineContractLevel === 'MGA' || uplineContractLevel === 'GA' || uplineContractLevel === 'SA' || uplineContractLevel === 'AGT')) ||
            (contract_level === 'SGA' && (uplineContractLevel === 'RGA' || uplineContractLevel === 'MGA' || uplineContractLevel === 'GA' || uplineContractLevel === 'SA' || uplineContractLevel === 'AGT'))) {
            return res.status(400).json({ error: 'Invalid hierarchy: Contract level does not meet the rules.' });
        }

        // Insert the agent into the database
        const sql = 'INSERT INTO agent_table (agent_name, contract_level, upline) VALUES ($1, $2, $3)';
    db.query(sql, [agent_name, contract_level, upline], (err, result) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
        return;
      }
      res.status(201).json({ message: 'New agent created.', AgentID: result.insertId });
    });
  });
});

app.put('/api/agents/:agent_code', (req, res) => {
    const { agent_code } = req.params;
    const { agent_name, contract_level, upline } = req.body;
    const sql = 'UPDATE agent_table SET agent_name = $1, contract_level = $2, upline = $3 WHERE agent_code = $4';
    db.query(sql, [agent_name, contract_level, upline, agent_code], (err, result) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
            return;
        }
        res.status(200).json({ message: 'Agent updated.' });
    });
});

app.delete('/api/agents/:agent_code', (req, res) => {
    const { agent_code } = req.params;
    const sql = 'DELETE FROM agent_table WHERE agent_code = $1';
    db.query(sql, [agent_code], (err, result) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
            return;
        }
        res.status(200).json({ success: true, message: 'Agent deleted.' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
