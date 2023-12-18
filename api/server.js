// server.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Your API information
const apiPassword = 'nopassword';
const serverUrl = 'http://localhost:3000';

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello, this is your Node.js API!');
});

// Endpoint to retrieve API information
app.get('/api/info', (req, res) => {
  res.json({
    apipassword: apiPassword,
    serverurl: serverUrl,
  });
});

// Add more routes as needed
module.exports = {
    app,     // Exporting the Express app
    port     // Exporting the port number
  };

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
