import React from 'react';
import './App.css'; // Assuming you have an App.css for styles. If not, you can remove this line.

function App() {
  return (
    <div className="App">
      {/* Add Agent Form */}
      <form id="addAgentForm" method="POST" action="/api/agents">
          <input type="text" name="agent_name" placeholder="Agent Name" required />
          <input type="text" name="contract_level" placeholder="Contract Level" required />
          <button type="submit">Add Agent</button>
      </form>

      {/* Agents Table */}
      <table>
          <thead>
              <tr>
                  <th>Agent Code</th>
                  <th>Agent Name</th>
                  <th>Contract Level</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody id="agentTableBody">
              {/* Rows will be populated by the JavaScript */}
          </tbody>
      </table>
    </div>
  );
}

export default App;
