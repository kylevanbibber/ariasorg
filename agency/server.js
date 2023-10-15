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
        const agents = organizeAgents(results.rows || []);
        res.render('index', { agents });
    });
});

// Helper function to organize agents in a hierarchical structure
function organizeAgents(agents) {
    const agentMap = new Map();

    agents.forEach(agent => {
        agent.children = [];
        agentMap.set(agent.agent_code, agent);
    });

    agents.forEach(agent => {
        if (agent.upline !== null) {
            const parent = agentMap.get(agent.upline);
            if (parent) {
                parent.children.push(agent);
            }
        }
    });

    return agents.filter(agent => agent.upline === null);
}

// *** This is the route for fetching agents ***
app.get('/api/agents', (req, res) => {
    const sql = 'SELECT * FROM agent_table';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server Error");
            return;
        }
        const agents = organizeAgents(results.rows || []);
        res.json(agents);
    });
});

app.post('/api/agents', (req, res) => {
    const { agent_name, contract_level, upline } = req.body;

    const uplineAgentSql = 'SELECT contract_level FROM agent_table WHERE agent_code = $1';
    db.query(uplineAgentSql, [upline], (err, result) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
            return;
        }

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Upline agent not found.' });
            return;
        }

        const uplineAgentContractLevel = result.rows[0].contract_level;

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
