const WebSocket = require('ws');
const fs = require('fs');
const readline = require('readline');

let fileSize = 0;

function extractFields(jsonString) {
    try {
        const { message, timestamp } = JSON.parse(jsonString);
        return { message, timestamp };
    } catch (error) {
        console.error('Error parsing JSON:', error);
        console.error('Invalid JSON:', jsonString);
        return null;
    }
}

function processStreamedData(line) {
    // Trim the line to remove leading and trailing whitespace
    line = line.trim();

    // Check if the line is empty after trimming
    if (!line) {
        return null;
    }

    // Define a regular expression to match JSON-like lines
    const jsonPattern = /^\{.*\}$/;

    // Check if the line matches the JSON pattern
    if (!jsonPattern.test(line)) {
        console.error('Invalid JSON:', line);
        return null;
    }

    try {
        return extractFields(line);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        console.error('Invalid JSON:', line);
        return null;
    }
}

const wss = new WebSocket.Server({ port: 8080 });
console.log('Listening on port 8080');

function sendUpdatedDataToClients() {
    const stream = fs.createReadStream('../logs/q_core.json', { start: fileSize, encoding: 'utf-8' });

    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
    });

    rl.on('line', function(line) {
        const data = processStreamedData(line);

        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });

        fileSize += Buffer.byteLength(line) + 1;
    });

    rl.on('close', function() {
        console.log('End of file reached');
        // Additional logic to handle end-of-file condition
    });

    rl.on('error', function (err) {
        console.error('Error reading file:', err);
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