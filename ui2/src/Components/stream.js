import React, { useState, useEffect, useRef } from 'react';

function TextToSpeech() {
  const [textToTTS, setTextToTTS] = useState('');
  const audioRef = useRef(new Audio());

  const SERVER_URL = "http://10.10.10.30:7095/tts";

  const handleTextChange = (event) => {
    setTextToTTS(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${SERVER_URL}?text=${textToTTS}`);
        audioRef.current.src = URL.createObjectURL(await response.blob());
        audioRef.current.play();
      } catch (error) {
        console.error('Error fetching TTS:', error);
      }
    };

    if (textToTTS) {
      fetchData();
    }
  }, [textToTTS]);

  return (
    <div>
      <input type="text" value={textToTTS} onChange={handleTextChange} />
    </div>
  );
}

export default TextToSpeech;