import React, { useEffect } from "react";
import { useContext } from "react";
import { WebSocketManagerContext } from "./Components/WebsocketManager";
import MainContent from "./Components/MainContent";
import StatusBar from "./Components/StatusBar";

function App() {
  const { music, transcript } = useContext(WebSocketManagerContext);

  const songData = () => {
    if (music?.music) {
      const parsedSocketData = JSON.parse(music.music);
      const lastRecord = parsedSocketData.slice(-1)[0];
      const extractedData = JSON.parse(lastRecord.message);
      const track = extractedData.track;

      return track;
    } else {
      return [];
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <StatusBar song={songData()} />
      <MainContent transcript={transcript} />
    </div>
  );
}

export default App;
