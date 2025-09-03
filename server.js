const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001; // Different port from main project

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Bitcoin Spending Calculator running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});
