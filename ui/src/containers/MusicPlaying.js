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
          // console.log("got data")
          // console.log('[jsondata]', jsonData)
          if (jsonData.length > 0) {
            // console.log("real data?", jsonData)
            const updatedMessage = JSON.parse(jsonData[0].message)
            // console.log("this data", Object.keys(updatedMessage))
            if (updatedMessage.track) {
                // console.log('[updatedMessage]',updatedMessage)

                setText(updatedMessage.track.sections);
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
