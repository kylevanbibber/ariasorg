// Fetch all agents and populate the table
function fetchAndDisplayAgents() {
    fetch('/api/agents')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(agents => {
            populateAgentTable(agents);
        })
        .catch(error => console.error('Error fetching agents:', error));
}

function populateAgentTable(agents) {
    const tableBody = document.getElementById('agentTableBody');
    tableBody.innerHTML = ''; // Clear the existing rows

    agents.forEach(agent => {
        const row = tableBody.insertRow();
        
        const agentCodeCell = row.insertCell(0);
        agentCodeCell.textContent = agent.agent_code;

        const agentNameCell = row.insertCell(1);
        agentNameCell.textContent = agent.agent_name;

        const contractLevelCell = row.insertCell(2);
        contractLevelCell.textContent = agent.contract_level;

        const actionsCell = row.insertCell(3);
        // We can insert buttons or links for Edit and Delete operations here
        actionsCell.textContent = 'Edit | Delete';  // Placeholder, replace with actual controls
    });
}

document.getElementById('addAgentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const agentName = event.target.agent_name.value;
    const contractLevel = event.target.contract_level.value;

    fetch('/api/agents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            agent_name: agentName,
            contract_level: contractLevel,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Clear the form
        event.target.reset();

        // Refresh the agent list
        fetchAndDisplayAgents();
    })
    .catch(error => console.error('Error adding agent:', error));
});


// Initial fetch to populate the table when the page loads
fetchAndDisplayAgents();
