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
        
        // Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', function() {
            editAgent(agent.agent_code, agent.agent_name, agent.contract_level);
        });
        actionsCell.appendChild(editButton);

        // Space between buttons
        actionsCell.appendChild(document.createTextNode(' | '));

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
            deleteAgent(agent.agent_code);
        });
        actionsCell.appendChild(deleteButton);
    });
}

function editAgent(agentCode, agentName, contractLevel) {
    // Fill the form or a modal with agent details for editing
    // You can use the provided agentCode, agentName, and contractLevel values
    // You might also need to set the form action to use the PUT method or handle the form submission using JavaScript
}

function deleteAgent(agentCode) {
    const confirmation = confirm('Are you sure you want to delete this agent?');
    if (confirmation) {
        fetch(`/api/agents/${agentCode}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchAndDisplayAgents();
            } else {
                alert('Error deleting agent.');
            }
        });
    }
}

document.getElementById('addAgentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const agentName = event.target.agent_name.value;
    const contractLevel = event.target.contract_level.value;

    fetch('http://localhost:3002/api/agents', {
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
