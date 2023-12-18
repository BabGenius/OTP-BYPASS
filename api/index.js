// index.js

const { config, startApplication } = require('./config');

// Access configuration properties
console.log("Server URL:", config.serverurl);

// Start the application
startApplication();
