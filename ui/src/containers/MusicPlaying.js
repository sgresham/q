import React, { useState, useEffect, useRef } from "react";
import Song from "../components/Song";

const MusicContainer = ({ stream }) => {
  const [text, setText] = useState({
    metadata: [],
    metapages: [],
    tabname: "Tab Name",
    type: "",
  });

  useEffect(() => {
    if (stream) {
      const ws = new WebSocket("ws://10.10.10.30:7081");

      ws.onopen = () => {
        console.log("Connected to server");
      };

      ws.onmessage = (event) => {
        try {
          const jsonData = JSON.parse(event.data);
          if (jsonData.length > 0) {
            const updatedMessage = JSON.parse(jsonData[0].message)
            if (updatedMessage.track) {
              console.log(updatedMessage.track.sections)
                setText(updatedMessage.track);
            }
          }
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
        <Song song={text} />
      </div>
    </div>
  );
};

export default MusicContainer;
