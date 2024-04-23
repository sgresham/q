const fs = require('fs');
const readline = require('readline');
const WebSocket = require('ws');

function streamLogFile(filePath, webSocketPort) {
  // Create a WebSocket server
  const wss = new WebSocket.Server({ port: webSocketPort });

  // Create a readline interface to read the log file line by line
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('WebSocket connected');

    // Read the log file line by line
    rl.on('line', (line) => {
      try {
        // Parse each line as JSON
        const json = JSON.parse(line);
        // Send the JSON data through the WebSocket
        ws.send(JSON.stringify(json));
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });

    // Close the WebSocket connection when the file stream ends
    fileStream.on('close', () => {
      console.log('File stream closed');
      ws.close();
    });

    // Handle WebSocket close event
    ws.on('close', () => {
      console.log('WebSocket disconnected');
    });

    // Handle errors in WebSocket connection
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Handle errors in reading the log file
  rl.on('error', (error) => {
    console.error('Error reading log file:', error);
  });
}

// Example usage:
const logFilePath = '../logs/q_core.json'; // Replace 'example.log' with the path to your log file
const webSocketPort = 8080; // Choose a port for WebSocket server
streamLogFile(logFilePath, webSocketPort);