import React, { useEffect, useState } from 'react';

function App() {
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({
    agentName: '',
    contractLevel: 'AGT',
    upline: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  

  useEffect(() => {
    fetchAndDisplayAgents();
  }, []);

  const fetchAndDisplayAgents = () => {
    fetch('/api/agents')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setAgents(data);
      })
      .catch((error) => console.error('Error fetching agents:', error));
  };

  const handleDeleteAgent = (agentCode) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this agent?');

    if (isConfirmed) {
      deleteAgent(agentCode);
    }
  };

  const deleteAgent = (agentCode) => {
    fetch(`/api/agents/${agentCode}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          fetchAndDisplayAgents();
        } else {
          alert('Error deleting agent.');
        }
      });
  };

  const isUplineValid = (uplineContractLevel, agentContractLevel) => {
    const contractLevelOrder = ['SGA', 'RGA', 'MGA', 'GA', 'SA', 'AGT'];
    const uplineIndex = contractLevelOrder.indexOf(uplineContractLevel);
    const agentIndex = contractLevelOrder.indexOf(agentContractLevel);
    return uplineIndex < agentIndex;
  };
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditAgent(null);
    setFormData({
      agentName: '',
      contractLevel: 'AGT',
      upline: '',
    });
  };
  const handleSubmit = (event) => {
    event.preventDefault();

    const { agentName, contractLevel, upline } = formData;

    if (contractLevel === 'SGA' && upline !== '0') {
      alert('An SGA can only have an upline of 0.');
      return;
    }

    if (!agentName || !contractLevel) {
      alert('Agent Name and Contract Level are required fields.');
      return;
    }

    // Check if the contract level is not MGA and upline is an RGA
    if (contractLevel !== 'MGA' && upline === 'RGA') {
      alert('Only MGA can have an RGA as its direct upline.');
      return;
    }

    // Only perform upline validation for non-SGA agents
    if (contractLevel !== 'SGA') {
      const uplineAgent = agents.find((agent) => agent.agent_code.toString() === upline);

      if (uplineAgent && uplineAgent.contract_level === 'RGA') {
        if (contractLevel !== 'MGA') {
          alert('Invalid Upline');
          return;
        }
      } else {
        if (!uplineAgent || !isUplineValid(uplineAgent.contract_level, contractLevel)) {
          alert('Invalid Upline');
          return;
        }
      }
    }

    // If in edit mode, update the agent
    if (isEditMode) {
      updateAgent(editAgent.agent_code);
    } else {
      // Otherwise, add a new agent
      addAgent();
    }
  };

  const addAgent = () => {
    fetch('/api/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_name: formData.agentName,
        contract_level: formData.contractLevel,
        upline: formData.upline,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(() => {
        setFormData({
          agentName: '',
          contractLevel: 'AGT',
          upline: '',
        });
        fetchAndDisplayAgents();
      })
      .catch((error) => console.error('Error adding agent:', error));
  };

  const updateAgent = (agentCode) => {
    const updatedAgentName = formData.agentName;
    const updatedContractLevel = formData.contractLevel;
    const updatedUpline = formData.upline;
  
    if (updatedContractLevel === 'SGA' && updatedUpline !== '0') {
      alert('An SGA can only have an upline of 0.');
      return;
    }

    if (!updatedAgentName || !updatedContractLevel) {
      alert('Agent Name and Contract Level are required fields.');
      return;
    }

    if (updatedContractLevel !== 'MGA' && updatedUpline === 'RGA') {
      alert('Only MGA can have an RGA as its direct upline.');
      return;
    }

    if (updatedContractLevel !== 'SGA') {
      const uplineAgent = agents.find((agent) => agent.agent_code.toString() === updatedUpline);

      if (uplineAgent && uplineAgent.contract_level === 'RGA') {
        if (updatedContractLevel !== 'MGA') {
          alert('Invalid Upline');
          return;
        }
      } else {
        if (!uplineAgent || !isUplineValid(uplineAgent.contract_level, updatedContractLevel)) {
          alert('Invalid Upline');
          return;
        }
      }
    }

    fetch(`/api/agents/${agentCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_name: updatedAgentName,
        contract_level: updatedContractLevel,
        upline: updatedUpline,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setIsEditMode(false);
        setEditAgent(null);
        setFormData({
          agentName: '',
          contractLevel: 'AGT',
          upline: '',
        });
        fetchAndDisplayAgents();
      })
      .catch((error) => console.error('Error updating agent:', error));
  };

  const handleEditAgent = (agent) => {
    setIsEditMode(true);
    setEditAgent(agent);
    setFormData({
      agentName: agent.agent_name,
      contractLevel: agent.contract_level,
      upline: agent.upline,
    });
  };

  return (
    <div>
      <form id="addAgentForm" onSubmit={handleSubmit}>
        <label htmlFor="agentName">Agent Name:</label>
        <input
          type="text"
          id="agentName"
          name="agentName"
          placeholder="Agent Name"
          required
          value={formData.agentName}
          onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
        />

        <label htmlFor="contractLevel">Contract Level:</label>
        <select
          id="contractLevel"
          name="contractLevel"
          required
          value={formData.contractLevel}
          onChange={(e) => setFormData({ ...formData, contractLevel: e.target.value })}
        >
          <option value="AGT">AGT</option>
          <option value="SA">SA</option>
          <option value="GA">GA</option>
          <option value="MGA">MGA</option>
          <option value="RGA">RGA</option>
          <option value="SGA">SGA</option>
        </select>

        <label htmlFor="upline">Upline ID:</label>
        <input
          type="text"
          id="upline"
          name="upline"
          placeholder="Upline ID"
          required
          value={formData.upline}
          onChange={(e) => setFormData({ ...formData, upline: e.target.value })}
        />

        <button type="submit">{isEditMode ? 'Save Agent' : 'Add Agent'}</button>
      </form>

      {/* Render agents data here */}
      <table>
        <thead>
          <tr>
            <th>Agent Code</th>
            <th>Agent Name</th>
            <th>Contract Level</th>
            <th>Upline</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {agents.map((agent) => (
  <tr key={agent.agent_code}>
    <td>{agent.agent_code}</td>
    <td>
      {isEditMode && editAgent && editAgent.agent_code === agent.agent_code ? (
        <input
          type="text"
          value={formData.agentName}
          onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
        />
      ) : (
        agent.agent_name
      )}
    </td>
    <td>
      {isEditMode && editAgent && editAgent.agent_code === agent.agent_code ? (
        <select
          value={formData.contractLevel}
          onChange={(e) => setFormData({ ...formData, contractLevel: e.target.value })}
        >
          <option value="AGT">AGT</option>
          <option value="SA">SA</option>
          <option value="GA">GA</option>
          <option value="MGA">MGA</option>
          <option value="RGA">RGA</option>
          <option value="SGA">SGA</option>
        </select>
      ) : (
        agent.contract_level
      )}
    </td>
    <td>
      {isEditMode && editAgent && editAgent.agent_code === agent.agent_code ? (
        <input
          type="text"
          value={formData.upline}
          onChange={(e) => setFormData({ ...formData, upline: e.target.value })}
        />
      ) : (
        agent.upline
      )}
    </td>
    <td>
      {isEditMode && editAgent && editAgent.agent_code === agent.agent_code ? (
        <>
          <button onClick={() => updateAgent(agent.agent_code)}>Save</button>
          <button onClick={() => handleCancelEdit()}>Cancel</button>
        </>
      ) : (
        <>
          <button onClick={() => handleEditAgent(agent)}>Edit</button>
          <button onClick={() => handleDeleteAgent(agent.agent_code)}>Delete</button>
        </>
      )}
    </td>
  </tr>
))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
