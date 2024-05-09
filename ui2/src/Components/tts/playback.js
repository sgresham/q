import React, { useState } from 'react';

function TextToSpeech() {
  const [textToTTS, setTextToTTS] = useState('');

  const SERVER_URL = "http://10.10.10.30:7095/tts";

  const handleTextChange = (event) => {
    setTextToTTS(event.target.value);
  };

  const playAudio = (audioData) => {
    if (audioData.length === 0) {
      console.error('Received empty audio data');
      return;
    }
  
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = audioContext.createBuffer(1, audioData.length, audioContext.sampleRate);
    const nowBuffering = audioBuffer.getChannelData(0);
    nowBuffering.set(audioData);
  
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  };

  const requestTTS = async () => {
    try {
      const response = await fetch(`${SERVER_URL}?text=${textToTTS}`);
      const reader = response.body.getReader();
      let concatenatedAudioData = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        concatenatedAudioData = concatenatedAudioData.concat(Array.from(value));
      }
      const audioBlob = new Blob([new Uint8Array(concatenatedAudioData)], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error fetching TTS:', error);
    }
  };

  return (
    <div>
      <input type="text" value={textToTTS} onChange={handleTextChange} />
      <button onClick={requestTTS}>Convert to Speech</button>
    </div>
  );
}

export default TextToSpeech;