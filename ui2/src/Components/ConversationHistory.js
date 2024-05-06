import React, { useRef, useEffect, useState } from 'react';
import RenderSegments from './RenderSegments';

const ScrollToBottomButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
      Scroll to Bottom
    </button>
  );
};

const ConversationHistory = ({ conversationHistory }) => {
  const containerRef = useRef(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => {
      // Check if scrolled to the bottom
      const isAtBottom = container.scrollTop + container.clientHeight === container.scrollHeight;
      setShowScrollToBottomButton(!isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    const container = containerRef.current;
    container.scrollTop = container.scrollHeight;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div ref={containerRef} className="overflow-y-scroll max-h-lvh">
        {/* Render previous conversations */}
        {conversationHistory.map((conversation, index) => (
          <div key={index} className="mb-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div>
                <p className="text-lg font-bold">{conversation.role}</p>
              </div>
              <RenderSegments content={conversation.content} />
            </div>
          </div>
        ))}
      </div>
      {showScrollToBottomButton && <ScrollToBottomButton onClick={scrollToBottom} />}
    </div>
  );
};

export default ConversationHistory;