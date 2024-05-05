import React, { useState } from "react";
import { Ollama } from "ollama/browser";
import TextToSpeechStream from "../Components/streamFunction";
import SyntaxHighlighter from "react-syntax-highlighter";

import models from "../Components/llm/modelList"
import promptHelpers from "../Components/llm/modelHelpers";

const ollama = new Ollama({ host: "http://10.10.10.30:11434" });

const LlamaInput = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("llama3");
  const [stream, setStream] = useState(false);
  const [audio, setAudio] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [promptHelper, setPromptHelper] = useState(
    "Answer truthfully and to the best of your ability"
  );



  const handleInputChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleModelChange = (event) => {
    setModel(event.target.value);
  };

  const handlePromptHelperChange = (event) => {
    setPromptHelper(event.target.value);
  };

  const handleClearHistory = () => {
    setConversationHistory([]);
    setResponse("");
    setPrompt("");
  };

  function extractSegmentsFromResponse(response) {
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
    console.log('[segments]', segments);
    return segments;
  }

  const handleSubmit = async () => {
    let messages = []
    setIsLoading(true);
    setResponse("");
    if (conversationHistory.length === 0)
      messages = [
        { role: "system", content: promptHelper },
        { role: "user", content: prompt },
      ];
    else messages = [...conversationHistory, {role:"user", content: prompt}]

    console.log('[MESSAGES]', messages)
    try {
      const streamResponse = await ollama.chat({
        model: model,
        request_timeout: 300,
        messages: messages,
        stream: stream,
        options: {
          num_predict: -1,
          temperature: 0.8,
          num_ctx: 8192,
          repeat_penalty: 1.1,
        },
      });

      const interaction = [
        {
          role: 'user',
          content: prompt
        },
        {
          role: 'assistant',
          content: streamResponse.message.content
        }
      ]

      const processed_data = extractSegmentsFromResponse(
        streamResponse.message.content
      );
      // Add the current conversation to history
      setConversationHistory([
        ...conversationHistory,
        ...interaction
      ]);
      console.log('[interaction]', interaction)
      if (audio)
        TextToSpeechStream(streamResponse.message.content).then((audio) => {
          console.log("data received");
          if (audio.readyState >= 2) {
            // 2 means audio data is available and ready to play
            console.log("data ready");
            audio.play();
          } else {
            audio.addEventListener("loadeddata", () => {
              console.log("data loaded");
              audio.play();
            });
          }
        });
    } catch (error) {
      console.error("Error fetching response from llama2:", error);
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  const CodeBlock = ({ language, children }) => {
    return (
      <SyntaxHighlighter language={language}>{children}</SyntaxHighlighter>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Render previous conversations */}
      {conversationHistory.map((conversation, index) => (
        <div key={index} className="mb-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div>
              <p className="text-lg font-bold">{conversation.role}</p>
            </div>
              <div>
                <p className="text-lg font-bold">{conversation.content}</p>
              </div>
          </div>
        </div>
      ))}
      {/* Clear conversations button */}
      {conversationHistory.length > 0 && (
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={handleClearHistory}
        >
          Clear Conversations
        </button>
      )}
      {/* Current prompt input */}
      <div className="mb-4">
        <label htmlFor="model" className="block mb-1">Model</label>
        <select
          id="model"
          className="border border-gray-300 rounded-lg p-2"
          value={model}
          onChange={handleModelChange}
        >
          {models.map((model, index) => (
            <option key={index} value={model.value}>{model.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="promptHelper" className="block mb-1">Assistant</label>
        <select
          id="promptHelper"
          className="border border-gray-300 rounded-lg p-2"
          value={promptHelper}
          onChange={handlePromptHelperChange}
        >
          {promptHelpers.map((helper, index) => (
            <option key={index} value={helper.prompt}>{helper.name}</option>
          ))}
        </select>
      </div>
      <textarea
        className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
        id="prompt"
        value={prompt}
        onChange={handleInputChange}
        placeholder="Enter prompt..."
        rows={4}
      ></textarea>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Submit"}
      </button>
    </div>
  );
};

export default LlamaInput;
