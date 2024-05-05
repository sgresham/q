import React from 'react';
import MainContent from './Containers/MainComponent';
import StatusBar from './Components/StatusBar';

function App() {
  return (
    <div className="flex flex-col h-screen">
      <StatusBar />
      <MainContent />
    </div>
  );
}

export default App;