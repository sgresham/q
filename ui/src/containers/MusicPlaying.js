import React, { useState, useEffect, useRef } from "react";
import Song from "../components/Song"

const MusicContainer = ({ stream }) => {
  const [text, setText] = useState({});

  useEffect(() => {
    if (stream) {
      const ws = new WebSocket("ws://10.10.10.30:7081");

      ws.onopen = () => {
        console.log("Connected to server");
      };

      ws.onmessage = (event) => {
        try {
          const jsonData = JSON.parse(event.data);
          console.log(jsonData);
          setText(jsonData);
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
  return (
    <div className="streaming-text">
      <div className="transcript-container">
        <Song song={text}/>
      </div>
    </div>
  );
};

export default MusicContainer;
