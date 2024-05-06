import React from 'react';
import { useContext, useEffect } from 'react';
import { WebSocketManagerContext } from './Components/WebsocketManager';
import MainContent from './Containers/MainComponent';
import StatusBar from './Components/StatusBar';

function App() {
  const { music, transcript } = useContext(WebSocketManagerContext);

  const songData = () => {
    if (music?.music) {
      const parsedSocketData = JSON.parse(music.music);
      const lastRecord = parsedSocketData.slice(-1)[0];
      const extractedData = JSON.parse(lastRecord.message)
      const track = extractedData.track;

      return track
    } else {
      return [];
    }
  };

  
  const transcriptData = () => {
    if (transcript?.transcript) {
      const parsedSocketData = JSON.parse(transcript.transcript);
      const lastRecord = parsedSocketData.slice(-1)[0];
      const extractedData = JSON.parse(lastRecord.message)
      const track = extractedData.track;

      return track
    } else {
      return [];
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <StatusBar song={songData()} />
        <MainContent/>
    </div>
  );
}

export default App;