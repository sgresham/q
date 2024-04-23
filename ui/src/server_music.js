const fs = require('fs');
const ws = require('ws'); // Import the WebSocket module

const filePath = '../logs/q_transcript.json'; // Path to the JSON file

// Function to read file and store as a variable
function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                const entries = data.trim().split('\n').map(entry => JSON.parse(entry));
                resolve(entries);
            }
        });
    });
}

// Function to extract fields from JSON string
function extractFields(jsonString) {
    try {
        // Check if jsonString is not empty
        if (!jsonString.trim()) {
            return null;
        }
        const { message, timestamp } = JSON.parse(jsonString);
        return { message, timestamp };
    } catch (error) {
        console.error('Error parsing JSON:', error);
        console.error('In line:', jsonString.trim());
        return null;
    }
}

// Function to watch the file for updates and broadcast new data to all clients
function watchFileAndBroadcast(filePath, wss) {
    let data = []; // Store the current data in an array
  
    setInterval(() => {
        readJsonFile(filePath)
            .then((newData) => {
                const uniqueEntries = newData.filter(entry => !data.some(existingEntry => existingEntry.timestamp === entry.timestamp)); // Filter out entries that already exist in the current data
                
                wss.clients.forEach((client) => {
                    if (client.readyState === ws.OPEN) {
                        client.send(JSON.stringify(uniqueEntries)); // Broadcast the new data to all WebSocket clients
                    }
                });
  
                data = [...data, ...uniqueEntries]; // Update the current data
            })
            .catch((error) => console.error('Error reading file:', error));
    }, 1000); // Check every second for updates
}

// Create a WebSocket server and listen on port 7080 (change as needed)
const wss = new ws.Server({ port: 7081 });

// Listen for connections and send initial data to the newly connected client
wss.on('connection', (ws) => {
    readJsonFile(filePath)
        .then((data) => {
            ws.send(JSON.stringify(data)); // Send initial data to the newly connected client
        })
        .catch((error) => console.error('Error sending initial data to client:', error));
});

// Watch the file for updates and broadcast new data to all clients
watchFileAndBroadcast(filePath, wss);
