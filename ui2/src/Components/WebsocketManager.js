import { useState, useEffect, createContext } from "react";
import App from "../App";

const WebSocketManagerContext = createContext();

const WebSocketManager = () => {
  const [transcript, setTranscript] = useState([]);
  const [music, setMusic] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connections here
    const musicws = new WebSocket("ws://10.10.10.30:7081");
    const transcriptws = new WebSocket("ws://10.10.10.30:7080");

    musicws.onmessage = (event) => {
      setMusic((prevMusic) => ({ ...prevMusic, music: event.data }));
    };

    transcriptws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      if (Array.isArray(newData) && newData.length > 0) {
        setTranscript((prevTranscripts) => [...prevTranscripts, ...newData]);
      }
    };

    return () => {
      // Clean up WebSocket connections when component unmounts
      musicws.close();
      transcriptws.close();
    };
  }, []);

  return (
    <WebSocketManagerContext.Provider value={{ music, transcript }}>
      <App />
    </WebSocketManagerContext.Provider>
  );
};

export { WebSocketManager, WebSocketManagerContext };
