const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'acadify_db',
  multipleStatements: true
});

// Read the schema file
const schemaPath = path.join(__dirname, 'config', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  
  console.log('Connected to the database');
  
  // Execute the schema
  connection.query(schema, (err, results) => {
    if (err) {
      console.error('Error executing schema:', err);
      connection.end();
      return;
    }
    
    console.log('Database schema executed successfully');
    
    // Read and execute sample data
    const sampleDataPath = path.join(__dirname, 'config', 'sample-data.sql');
    const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
    
    connection.query(sampleData, (err, results) => {
      if (err) {
        console.error('Error executing sample data:', err);
        connection.end();
        return;
      }
      
      console.log('Sample data executed successfully');
      connection.end();
    });
  });
});