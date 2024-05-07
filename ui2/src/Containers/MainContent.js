import React from "react";
import { useEffect } from "react";
import LlamaInput from "./LlamaInput";
import Transcription from "./Transcription";

const MainContent = ({transcript}) => {

  return (
    <div className="flex flex-col flex-grow h-9/10">
      {/* Main content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Left section */}
        <div className="w-1/2 overflow-y-auto bg-gray-200">
          <h2 className="text-lg font-bold p-4">Your friendly LLM</h2>
          <div className="p-4">
            <LlamaInput />
          </div>
        </div>
        {/* Right section */}
        <div className="w-1/2 overflow-y-auto bg-gray-300">
          <h2 className="text-lg font-bold p-4">Transcript Central</h2>
          <Transcription transcript={transcript}/>
        </div>
      </div>
    </div>
  );
}

export default MainContent;
