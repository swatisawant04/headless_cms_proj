import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [entity, setEntity] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeType, setNewAttributeType] = useState('');
  const [records, setRecords] = useState([]);
  const [successMessage, setSuccessMessage] = useState(''); 

  const addAttribute = () => {
    if (!newAttributeName || !newAttributeType) {
      console.error('Attribute name and type are required.');
      return;
    }

    setAttributes([...attributes, { name: newAttributeName, type: newAttributeType }]);
    setNewAttributeName('');
    setNewAttributeType('');
  };

  const handleNewAttributeNameChange = (e) => {
    setNewAttributeName(e.target.value);
  };

  const handleNewAttributeTypeChange = (e) => {
    setNewAttributeType(e.target.value);
  };

  const createEntity = async () => {
    try {
      const response = await axios.post('http://localhost:3001/createEntity', {
        name: entity,
        attributes: attributes.map((attr) => ({ name: attr.name, type: attr.type })),
      });
      console.log(response.data);
      setSuccessMessage('Entity created successfully');
      setTimeout(() => setSuccessMessage(''), 3000); 

    } catch (error) {
      console.error('Error creating entity:', error);
    }
  };

  const addRecord = async () => {
    try {
      const recordData = {};
      for (const attr of attributes) {
        let value;
        if (attr.type === 'Date') {
          value = prompt(`Enter value for ${attr.name} (Format: 1-Jan-1990):`);
          if (value === null) {
            console.log('Add record cancelled.');
            return;
          }
          const parts = value.split('-');
          if (parts.length === 3) {
            const day = parts[0].trim();
            const month = parts[1].trim();
            const year = parts[2].trim();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthIndex = monthNames.findIndex(name => name.toLowerCase() === month.toLowerCase());
            if (monthIndex !== -1) {
              const monthNumber = monthIndex + 1;
              const monthString = monthNumber < 10 ? `0${monthNumber}` : monthNumber.toString();
              const formattedDate = `${year}-${monthString}-${day}`;
              value = formattedDate;
            } else {
              console.error('Invalid month name entered.');
              return;
            }
          } else {
            console.error('Invalid date format entered.');
            return;
          }
        } else {
          value = prompt(`Enter value for ${attr.name}:`);
          if (value === null) {
            console.log('Add record cancelled.');
            return;
          }
        }
        recordData[attr.name] = value;
      }

      const response = await axios.post('http://localhost:3001/addRecord', {
        entity: entity,
        data: recordData,
      });
      console.log(response.data);
      getRecords(); // Refresh records after adding
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const deleteRecord = async (id) => {
    try {
      const response = await axios.post('http://localhost:3001/deleteRecord', {
        entity: entity,
        id: id,
      });
      console.log(response.data);
      getRecords(); // Refresh records after deleting
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const updateRecord = async (id) => {
    try {
      const attributeName = prompt('Enter the name of the attribute to update:');
      if (attributeName === null) {
        console.log('Update cancelled.');
        return;
      }

      const newValue = prompt(`Enter the new value for ${attributeName}:`);
      if (newValue === null) {
        console.log('Update cancelled.');
        return;
      }

      const response = await axios.post('http://localhost:3001/updateRecord', {
        entity: entity,
        id: id,
        data: { [attributeName]: newValue },
      });
      console.log(response.data);
      getRecords(); // Refresh records after updating
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const getRecords = async () => {
    try {
      if (!entity) {
        console.error('Entity name is required.');
        return;
      }

      const response = await axios.get('http://localhost:3001/getRecords', {
        params: { entity: entity },
      });
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    if (entity) {
      getRecords(); // Fetch records when entity is set
    }
  }, [entity]); // Fetch records when entity changes

  return (
    <div className="App">
      <h2>Create Entity</h2>
      <input
        type="text"
        placeholder="Entity name"
        value={entity}
        onChange={(e) => setEntity(e.target.value)}
      />

      <h2>Add Attributes</h2>
      <div>
        <input
          type="text"
          placeholder="Attribute name"
          value={newAttributeName}
          onChange={handleNewAttributeNameChange}
        />
        <select value={newAttributeType} onChange={handleNewAttributeTypeChange}>
          <option value="">Select type</option>
          <option value="String">String</option>
          <option value="Number">Number</option>
          <option value="Date">Date</option>
        </select>
        <button onClick={addAttribute}>Add Attribute</button>
      </div>

      <h2>Attributes</h2>
      <ul>
        {attributes.map((attr, index) => (
          <li key={index}>
            {attr.name} - {attr.type}
          </li>
        ))}
      </ul>

      <button onClick={createEntity}>Create Entity</button>
      {successMessage && <p className="success-message">{successMessage}</p>} 

      <h2>Add Record</h2>
      <button onClick={addRecord}>Add Record</button>

      <h2>Fetch Records</h2>
      <button onClick={getRecords}>Fetch Records</button>

      <h2>Records</h2>
      <ul>
        {records.map((record) => (
          <li key={record.id}>
            {Object.keys(record).map((key) => (
              <span key={key}>
                {key}: {key.toLowerCase() === 'date' ? formatDate(record[key]) : record[key]}
              </span>
            ))}
            <button onClick={() => deleteRecord(record.id)}>Delete</button>
            <button onClick={() => updateRecord(record.id)}>Update</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
