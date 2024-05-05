import React from 'react';
import LlamaInput from './LlamaInput';

function MainContent() {
  return (
<div className="flex flex-col flex-grow h-90vh">
      {/* Main content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Left section */}
        <div className="w-1/2 overflow-y-auto bg-gray-200">
          <h2 className="text-lg font-bold p-4">Section 1</h2>
          <div className="p-4">
            <LlamaInput />
          </div>
        </div>
        {/* Right section */}
        <div className="w-1/2 overflow-y-auto bg-gray-300">
          <h2 className="text-lg font-bold p-4">Section 2</h2>
          <div className="p-4">
            {/* Your long text content goes here */}
            {/* Example: */}
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. ...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainContent;