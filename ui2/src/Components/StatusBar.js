import React from 'react';
import NowPlaying from './NowPlaying';

const StatusBar = ({ song }) => {
  return (
    <div className="bg-blue-500 text-white p-4 h-svh">
      <div style={{ width: '33.3%', display: 'flex' }}>
        <NowPlaying song={song} />
      </div>
      <p>Status: Online</p>
    </div>
  );
};

export default StatusBar;