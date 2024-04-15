const WebSocket = require('ws');
const fs = require('fs');

let fileSize = 0;

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
        console.error('In line:', jsonString.trim())
        return null;
    }
}

function processStreamedData(data) {
    const lines = data.split('\n');
    const extractedData = lines.map(line => {
        if (!line) {
            return null;
        }
        return extractFields(line);
    });

    return extractedData.filter(Boolean);
}

const wss = new WebSocket.Server({ port: 8080 });
console.log('Listening on port 8080');

let buffer = ''; // Initialize an empty buffer to store incomplete rows

function sendUpdatedDataToClients() {
    const stream = fs.createReadStream('../logs/q_core.json', { start: fileSize, encoding: 'UTF-8' });

    stream.on('error', function (err) {
        console.log(err);
    });

    stream.on('data', function (chunk) {
        buffer += chunk; // Append incoming chunk to buffer

        // Split buffer by newline character to separate rows
        const rows = buffer.split('\n');

        // Iterate through rows
        for (let i = 0; i < rows.length - 1; i++) {
            const row = rows[i];

            // Process each row
            const data = processStreamedData(row);
            console.log(data)

            // Send data to clients
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    data.forEach(item => {
                        client.send(JSON.stringify(item));
                    });
                }
            });

            // Update fileSize based on the length of the row
            fileSize += row.length + 1; // Add 1 to account for the newline character
        }

        // Update buffer with the remaining incomplete row
        buffer = rows[rows.length - 1];
    });
}

wss.on('connection', function connection(ws) {
    // Send data to newly connected client
    sendUpdatedDataToClients();
});

// Start watching for changes in the log file
fs.watch('../logs/q_core.json', (eventType, filename) => {
    console.log(`File ${filename} was modified`);
    sendUpdatedDataToClients();
});