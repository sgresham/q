import React, { useState, useEffect } from "react";

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

const Transcription = ({ transcript }) => {
  const [text, setText] = useState([]);
  useEffect(() => {
    const cleanedTranscript = transcript.map((item) => {
      let cleanMessage = item.message.replace(/'text'/g, '"text"');
      cleanMessage = cleanMessage.replace(/'(?![a-zA-Z])/g, '"');
      const parsedData = JSON.parse(cleanMessage);
      const textValue = parsedData.text;
      return {
        timestamp: formatTimestamp(item.timestamp),
        message: JSON.stringify(textValue),
      };
    });
    setText(cleanedTranscript);
  }, [transcript]);

  return (
    <div className="streaming-text overflow-y-scroll h-svh">
      <div className="w-5/6 mx-auto">
        {text.map((item, index) => (
          <p key={index} className="transcript-paragraph font-roboto">
  <span className="text-gray-600 mr-2">{item.timestamp}:</span>
  <span className="text-blue-700">{item.message}</span>
</p>
        ))}
      </div>
    </div>
  );
};

export default Transcription;
