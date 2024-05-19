const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Swati@12',
  database: 'cms',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to the database');
});


// Modified createEntity function to handle attributes
const createEntity = (req, res) => {
    let { name, attributes } = req.body;
  
    // Construct the initial part of the query
    let query = `CREATE TABLE \`${name}\` (id INT AUTO_INCREMENT PRIMARY KEY,`;
  
    // Loop through attributes and add them to the query
    attributes.forEach((attr) => {
      // Determine MySQL data type based on attribute type
      let dataType;
      switch (attr.type) {
        case 'String':
          dataType = 'VARCHAR(255)';
          break;
        case 'Number':
          dataType = 'VARCHAR(255)';
          break;
        case 'Date':
          dataType = 'DATE';
          break;
        // Add more cases as needed
        default:
          dataType = 'VARCHAR(255)'; // Default to VARCHAR(255) if type is not recognized
      }
  
      query += ` \`${attr.name}\` ${dataType},`;
    });
  
    query = query.slice(0, -1); // Remove the trailing comma
    query += ')';
  
    console.log('Create Entity Query:', query); // Log the query
  
    // Execute the query
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error creating table:', err);
        return res.status(500).send('Error creating table');
      }
      res.send(result);
    });
  };
  


const addRecord = (req, res) => {
  let { entity, data } = req.body;
  let query = `INSERT INTO \`${entity}\` SET ?`;

  db.query(query, data, (err, result) => {
    if (err) {
      console.error('Error adding record:', err);
      return res.status(500).send('Error adding record');
    }
    res.send(result);
  });
};

const getRecords = (req, res) => {
  let { entity } = req.query;
  let query = `SELECT * FROM \`${entity}\``;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching records:', err);
      return res.status(500).send('Error fetching records');
    }
    res.send(results);
  });
};

const updateRecord = (req, res) => {
  let { entity, id, data } = req.body;
  let query = `UPDATE \`${entity}\` SET ? WHERE id = ${id}`;

  db.query(query, data, (err, result) => {
    if (err) {
      console.error('Error updating record:', err);
      return res.status(500).send('Error updating record');
    }
    res.send(result);
  });
};

const deleteRecord = (req, res) => {
  let { entity, id } = req.body;
  let query = `DELETE FROM \`${entity}\` WHERE id = ${id}`;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error deleting record:', err);
      return res.status(500).send('Error deleting record');
    }
    res.send(result);
  });
};

// Route definitions
app.post('/createEntity', createEntity);
app.post('/addRecord', addRecord);
app.get('/getRecords', getRecords);
app.post('/updateRecord', updateRecord);
app.post('/deleteRecord', deleteRecord);

// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
