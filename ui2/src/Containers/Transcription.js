import React, { useState, useEffect, useRef } from "react";

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

const Transcription = ({ stream }) => {
  const [text, setText] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (stream) {
      const ws = new WebSocket("ws://10.10.10.30:7080");

      ws.onopen = () => {
        console.log("Connected to server");
      };

      ws.onmessage = (event) => {
        try {
          const jsonData = JSON.parse(event.data);
          if (Array.isArray(jsonData)) {
            setText((prevText) => [...prevText, ...jsonData]);
          } else {
            setText((prevText) => [...prevText, jsonData]);
          }
          // scrollToBottom();
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
    }
  }, [stream]);

  // const scrollToBottom = () => {
  //   messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  // };

  return (
    <div className="streaming-text">
      <div className="transcript-container">
        {text.map((item, index) => (
          <p key={index} className="transcript-paragraph">
            {formatTimestamp(item.timestamp)}: {item.message}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default StreamedTextContainer;
