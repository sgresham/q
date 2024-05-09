import React from 'react';
import SyntaxHighlighter from "react-syntax-highlighter";

const CodeBlock = ({ language, children }) => {
  return (
    <SyntaxHighlighter language={language}>{children}</SyntaxHighlighter>
  );
};

const RenderSegments = ({ content }) => {
  const extractSegmentsFromResponse = (response) => {
    const segments = [];
    const codeRegex = /```(?:\w+)?\n([\s\S]*?)\n```/g; // Regular expression to match code blocks globally
    let lastIndex = 0;

    response.replace(codeRegex, (match, codeContent, codeMatchIndex) => {
      // Extract text segment before code block
      const textSegment = response.substring(lastIndex, codeMatchIndex);
      if (textSegment.trim() !== "") {
        segments.push({ type: "text", content: textSegment });
      }

      // Extract code block content
      const codeSegment = codeContent;
      segments.push({ type: "code", content: codeSegment });

      lastIndex = codeMatchIndex + match.length; // Update lastIndex

      return match; // Return matched code block for replacement
    });

    // Extract text segment after last code block
    const lastTextSegment = response.substring(lastIndex);
    if (lastTextSegment.trim() !== "") {
      segments.push({ type: "text", content: lastTextSegment });
    }
    return segments;
  };

  const renderSegments = (segments) => {
    return segments.map((segment, index) => {
      if (segment.type === "text") {
        return <p key={index} dangerouslySetInnerHTML={{__html: segment.content.replace(/\n/g, '<br>')}} />;
      } else if (segment.type === "code") {
        return <CodeBlock key={index} language="language">{segment.content}</CodeBlock>;
      }
      return null;
    });
  };

  const segments = extractSegmentsFromResponse(content);
  const renderedOutput = renderSegments(segments);

  return (
    <div>
      {renderedOutput}
    </div>
  );
};

export default RenderSegments;