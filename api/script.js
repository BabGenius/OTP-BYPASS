// script.js (or any other file in your project)
fetch('http://localhost:3000/api/info')
  .then(response => response.json())
  .then(data => {
    // Use the retrieved API information
    const { apipassword, serverurl } = data;
    console.log(`API Password: ${apipassword}`);
    console.log(`Server URL: ${serverurl}`);

    // Now you can use these values in your project as needed
    // For example, update your existing variables or configuration
  })
  .catch(error => console.error('Error fetching API information:', error));
