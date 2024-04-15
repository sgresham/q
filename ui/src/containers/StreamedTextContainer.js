import React, { useState, useEffect } from "react";

// Function to format timestamp to hh:mm:ss format
function formatTimestamp(timestamp) {
  // Convert timestamp string to Date object
  const date = new Date(timestamp);

  // Extract hours, minutes, and seconds
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  // Format time in hh:mm:ss format
  return `${hours}:${minutes}:${seconds}`;
}

const StreamedTextContainer = () => {
  const [text, setText] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Connected to server");
    };

    ws.onmessage = (event) => {
      try {
        const jsonData = JSON.parse(event.data);
        setText((prevText) => [...prevText, jsonData]);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      {text.map((item, index) => (
        <p key={index} className="transcript-paragraph">
          {formatTimestamp(item.timestamp)}: {item.message}
        </p>
      ))}
    </div>
  );
};

export default StreamedTextContainer;
