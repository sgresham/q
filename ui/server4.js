const fs = require('fs');
const WebSocket = require('ws');

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

// Main function to periodically check the file for updates
async function watchFileAndBroadcast(filePath, wss) {
    let data = await readJsonFile(filePath);
  
    setInterval(async () => {
      try {
        // console.log('Checking for updates...');
        const newData = await readJsonFile(filePath);
  
        // Filter out entries that already exist in the current data
        const uniqueEntries = newData.filter(entry => !data.some(existingEntry => existingEntry.timestamp === entry.timestamp));
        
        // Broadcast the new data to all WebSocket clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(uniqueEntries));
          }
        });
  
        // Update the current data
        data = [...data, ...uniqueEntries];
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }, 1000); // Check every second for updates
  
    return data;
  }

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 7080 }); // Change port as needed

// WebSocket server listening event
wss.on('listening', () => {
    console.log('WebSocket server is listening on port 7080');
});

// WebSocket connection event
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Send initial data to the newly connected client
    readJsonFile(filePath)
        .then(data => {
            ws.send(JSON.stringify(data));
        })
        .catch(error => console.error('Error sending initial data to client:', error));
});


watchFileAndBroadcast(filePath, wss)
    .catch(error => console.error('Error watching file and broadcasting data:', error));
