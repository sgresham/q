import React, { useState } from "react";
import { Ollama } from "ollama/browser";
import TextToSpeechStream from "../Components/streamFunction";
import SyntaxHighlighter from "react-syntax-highlighter";

import models from "../Components/llm/modelList"
import promptHelpers from "../Components/llm/modelHelpers";
import RenderSegments from "../Components/RenderSegments";
import ConversationHistory from "../Components/ConversationHistory";

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

  const handleSubmit = async () => {
    let messages = []
    setIsLoading(true);
    setResponse("");
    if (conversationHistory.length === 0)
      messages = [
        { role: "system", content: promptHelper },
        { role: "user", content: prompt },
      ];
    else messages = [...conversationHistory, { role: "user", content: prompt }]
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

      // Add the current conversation to history
      setConversationHistory([
        ...conversationHistory,
        ...interaction
      ]);
      if (audio)
        TextToSpeechStream(streamResponse.message.content).then((audio) => {
          ;
          if (audio.readyState >= 2) {
            audio.play();
          } else {
            audio.addEventListener("loadeddata", () => {
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

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Render previous conversations */}
      <ConversationHistory conversationHistory={conversationHistory} />
      <div className="flex flex-wrap mb-4">
        {/* Model select */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-2">
          <label htmlFor="model" className="block mb-1">Model</label>
          <select id="model" className="border border-gray-300 rounded-lg p-2 w-full" value={model} onChange={handleModelChange}>
            {models.map((model, index) => (<option key={index} value={model.value}>{model.name}</option>))}
          </select>
        </div>

        {/* Assistant select */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mx-2">
          <label htmlFor="promptHelper" className="block mb-1">Assistant</label>
          <select id="promptHelper" className="border border-gray-300 rounded-lg p-2 w-full" value={promptHelper} onChange={handlePromptHelperChange}>
            {promptHelpers.map((helper, index) => (<option key={index} value={helper.prompt}>{helper.name}</option>))}
          </select>
        </div>

        {/* Clear conversations button */}
        <div className="w-full md:w-1/3">
          {conversationHistory.length > 0 && (
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg w-full" onClick={handleClearHistory}>
              Clear Conversations
            </button>
          )}
        </div>
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
