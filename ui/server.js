const WebSocket = require('ws');
const fs = require('fs');

let fileSize = 0;
const fileName = '../logs/q_core.json'
let fileData = []

// function to read file and store as a variable
function readJsonFile(file) {
    return new Promise((resolve, reject) => {
        fs.readFileSync(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.trim().split('\n').map(entry => JSON.parse(entry)));
            }
        });
    });
}
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

// Main function to periodically check the file for updates
async function watchFile(filePath) {
    let data = await readJsonFile(filePath);

    setInterval(async () => {
        try {
            const newData = await readJsonFile(filePath);
            data = [...data, ...newData.filter(entry => !data.some(existingEntry => existingEntry.timestamp === entry.timestamp))];
        } catch (error) {
            console.error('Error reading file:', error);
        }
    }, 1000); // Check every second for updates

    return data;
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

// Function to read the JSON file and filter entries based on timestamp range
function filterLogsByTimestampRange(filePath, startTime, endTime) {
    // Read the JSON file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const logs = fileData.trim().split('\n').map(entry => JSON.parse(entry));

    // Filter entries based on timestamp range
    const filteredLogs = logs.filter(entry => {
        const timestamp = new Date(entry.timestamp);
        return timestamp >= startTime && timestamp <= endTime;
    });

    // Extract the "message" field from filtered entries
    const messages = filteredLogs.map(entry => entry.message);

    return messages;
}

const wss = new WebSocket.Server({ port: 8080 });
console.log('Listening on port 8080');

let buffer = ''; // Initialize an empty buffer to store incomplete rows

function sendUpdatedDataToClients() {
    const stream = fs.createReadStream(fileName, { start: fileSize, encoding: 'UTF-8' });

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
fs.watch(fileName, (eventType, filename) => {
    console.log(`File ${filename} was modified`);
    sendUpdatedDataToClients();
});


// Example usage

// Calculate the start time as current time minus one hour
const oneHourAgo = new Date(Date.now() - (1 * 60 * 60 * 1000));

const startTime = new Date(); // User-specified start time
const endTime = new Date(oneHourAgo); // User-specified end time
const filePath = fileName; // Path to the JSON file

const messagesInTimeRange = filterLogsByTimestampRange(filePath, startTime, endTime);
console.log(messagesInTimeRange);