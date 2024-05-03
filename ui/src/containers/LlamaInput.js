import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Ollama } from "ollama/browser";
import TextToSpeech from "../components/stream";
import TextToSpeechStream from "../components/streamFunction";
import SyntaxHighlighter from "react-syntax-highlighter";

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

  const promptHelpers = [
    {
      name: "nohelper",
      prompt: "Answer truthfully and to the best of your ability",
    },
    {
      name: "storywriter",
      prompt: `Write a captivating short story (approx. 250-500 words) about [insert theme or genre, e.g., 'a mysterious forest', 'space exploration', 'high school drama', etc.]. The story should have the following elements:

              1. **A protagonist**: Introduce a relatable main character with their own motivations, goals, and backstory.
              2. **Conflict**: Create an internal or external conflict that drives the plot forward and tests the protagonist's resolve.
              3. **Twist or surprise**: Include a surprising turn of events, revelation, or unexpected consequence that adds depth to the story.
              4. **Emotional resonance**: Make the reader feel something - joy, sadness, excitement, or empathy - by exploring themes like friendship, love, loss, or self-discovery.
              
              **Additional guidelines:**
              
              * Use descriptive language to paint a vivid picture of the setting and characters.
              * Vary sentence structure and length to create a sense of rhythm and flow.
              * Incorporate sensory details to bring the story to life.
              * Avoid clichés and overused tropes; instead, add unique twists or fresh perspectives.
              
              **Starting point:** Begin by introducing your protagonist in their everyday world. Then, as the story unfolds, take the reader on a journey through [insert theme or genre] that challenges the protagonist's assumptions and forces them to grow.`,
    },
    {
      name: "javascriptcoder",
      prompt: `Write a JavaScript function that takes two arrays of integers, 'arr1' and 'arr2', as input. The function should return an array containing only the elements that are present in both 'arr1' and 'arr2'. If there are duplicate elements, include each one only once in the output array.

      Example inputs:

      arr1 = [1, 2, 3, 4];
      arr2 = [3, 4, 5, 6];

      
      Expected output: [3, 4]
      
      **Constraints:**
      * wrap all code within a code fence (triple backticks)
      * Use only built-in JavaScript functions and data structures (no external libraries or frameworks).
      * Your function should be able to handle arrays of any length.
      * If an element is present in both 'arr1' and 'arr2', include it only once in the output array.
      
      **Additional hint:** You can use the 'Set' data structure to help with the intersection operation. Think about how you could convert the input arrays to sets, find the intersection, and then convert back to an array.
      
      **Evaluation criteria:**
      
      * Correctness: Does your function produce the expected output for the given example inputs?
      * Efficiency: How well does your function perform in terms of time complexity and memory usage?
      
      Go ahead and give it a try! 🚀`,
    },
    {
      name: "psychologist",
      prompt:
        "Analyze and provide insights on human behavior, emotions, and relationships. Respond to hypothetical scenarios, case studies, or open-ended questions about individuals' thoughts, feelings, and motivations. Use your understanding of cognitive biases, emotional intelligence, and psychological theories to offer empathetic and informed advice.",
    },
    {
      name: "deadpool",
      prompt: `
          Wanted: A Heroic Helper System (a.k.a. 'Deadpool's Dope Assistant')
          Hey, buddy! I'm Deadpool, and I'm here to help you with your most pressing problems... or at least make fun of them while pretending to help. Just don't expect me to actually do any real work, because, let's be honest, that's so not my style.
    
          **Request Format:**
          To get the most out of our heroic helper system, please format your request like this:
          
          * Start with a brief description of the problem or question you're facing (e.g., "I'm stuck on a math homework" or "What's the best way to cook a chicken?").
          * Add any relevant details or context (e.g., "I have a test tomorrow" or "I hate cooking, but my wife is making me do it").
          * End with a dash (-) followed by your preferred tone for my response:
            + -Sassy: Give me the snarky, sarcastic treatment.
            + -Helpful: Provide actual advice and guidance (but don't expect me to be too serious).
            + -Random: Just give me something weird and unexpected.
          
          **Example Request:** "I'm trying to write a novel, but I keep getting stuck on chapter 3. -Sassy"
          
          So, what's your problem? Let's get this heroics started!
          `,
    },
    {
      name: "template_builder",
      prompt: `
          using the below field definition example, and the list of available render_components and data_types produce the requested template by identifying approprate fields to complete the request.
          *Field Definition Example*
          {
            "name" : "last_name",
            "label" : "Last Name",
            "validation" : "",
            "display" : true,
            "render_component" : "",
            "data_type" : "string",
			    }
          
          *Render Components*
          text
          json
          checkbox
          checklist
          multiselect
          datetime
          select
          script
          email
          password
          textarea
          currency
          duration
          combobox
          annotation

          *Data Types*
          string
          email
          datetime
          integer
          float
          password
          boolean
          array
          object

          output in the following format as per the below example
          
              {
                form:{
                  "name": "incident_form",
                  "label": "ITSM Incident Form"
                },
                fields: [
                  {
                    name: "summary",
                    label: "Summary",
                    validation: "",
                    display: true,
                    render_component: "textarea",
                    data_type: "string"
                  },
                  {
                    name: "description",
                    label: "Description",
                    validation: "",
                    display: true,
                    render_component: "textarea",
                    data_type: "string"
                  },
                  {
                        name: "category",
                      label: "Category",
                      validation: "",
                      display: true,
                      render_component: "select",
                      data_type: "string",
                      options: ["Hardware", "Software", "Network"]
                  }
                ]
                `,
    },
    {
      name: "content_summarizer",
      prompt: `I want you to act as a text summarizer to help me create a concise summary of the text I provide. The summary can be as long as is needed to capture the key points and concepts written in the original text without adding your interpretations. 
      If you are provided with date/time information consider breaking down the summary into sections based on time.
      My first request is to summarize this text – [insert text here]`,
    },
  ];

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

  const extractTextAndCodeBlocks = (response) => {
    const delimiter = "```";
    let inCodeBlock = false;
    console.log("response: ", JSON.stringify(response));
    const parts = response.split(delimiter);
    if (parts[0] == "") inCodeBlock = true;
    const result = [];

    for (let i = 0; i < parts.length; i++) {
      if (inCodeBlock) {
        // Inside code block, push as code
        result.push({ type: "code", content: parts[i] });
        inCodeBlock = false; // Toggle back to text after this code block
      } else {
        // Split the part on newline character
        const lines = parts[i].split("\n");
        if (lines.length > 1) {
          // Code block detected
          result.push({ type: "text", content: lines.shift() }); // Push text before code block
          result.push({ type: "code", content: lines.join("\n") }); // Push code block
        } else {
          // No newline character, push as text
          result.push({ type: "text", content: parts[i] });
        }
        inCodeBlock = true; // Toggle to indicate entering code block
      }
      // Don't treat the last delimiter as code block
      if (i < parts.length - 1) {
        inCodeBlock = !inCodeBlock;
      }
    }
    console.log("[result of extraction]", result);
    return result;
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
    console.log('[segments]',segments);
    return segments;
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    setResponse("");
    let inputText = "";
    try {
      const fullContext = conversationHistory
        .map((conversation) => {
          const responses = conversation.response.map((item) => item.content);
          const combinedResponses = responses.join("\n");
          return `In our previous conversation we discussed the following: \n user: ${conversation.prompt} \n assistant: ${combinedResponses}`;
        })
        .join("\n");

      // console.log("[fullContext]", fullContext);
      if (fullContext)
        inputText = ` ------------ {Previous Information} ------------ ${fullContext} \n ------------ {Current Request} ------------ \n \n ${prompt}`;
      else inputText = prompt;
      // console.log("[inputtext]", inputText);
      const streamResponse = await ollama.chat({
        model: model,
        request_timeout: 300,
        messages: [
          { role: "user", content: inputText },
          { role: "assistant", content: promptHelper },
          { role: "system", content: "Just do your best" },
        ],
        stream: stream,
        options: {
          num_predict: -1,
          temperature: 0.8,
          num_ctx: 8192,
          repeat_penalty: 1.1,
        },
      });

      const processed_data = extractSegmentsFromResponse(
        streamResponse.message.content
      );
      console.log("[processed data]", processed_data);
      // Add the current conversation to history
      setConversationHistory([
        ...conversationHistory,
        { prompt, response: processed_data },
      ]);
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
    <div style={{ width: "600px" }}>
      {" "}
      {/* Adjust the width as per your requirement */}
      <Box p={2}>
        {/* Render previous conversations */}
        {conversationHistory.map((conversation, index) => (
          <Card key={index} style={{ marginBottom: "10px" }}>
            <CardContent>
              <div>
                <Typography variant="caption">You</Typography>
              </div>
              <div>
                <Typography variant="title">{conversation.prompt}</Typography>
              </div>

              <div>
                <Typography variant="caption">Alacrity</Typography>
              </div>
              {conversation.response.map((chunk, index) => (
                <>
                  {chunk.type === "code" ? (
                    <CodeBlock
                      wrapLines
                      language={chunk.content.split("\n")[0].trim()}
                    >
                      {chunk.content}
                    </CodeBlock>
                  ) : (
                    <Typography
                      style={{
                        whiteSpace: "pre-wrap",
                        overflowWrap: "break-word",
                      }}
                      variant="body1"
                      component="div"
                    >
                      {chunk.content}
                    </Typography>
                  )}
                </>
              ))}
            </CardContent>
          </Card>
        ))}
        {/* Clear conversations button */}
        {conversationHistory.length > 0 && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleClearHistory}
            style={{ marginBottom: "10px" }}
          >
            Clear Conversations
          </Button>
        )}
        {/* Current prompt input */}
        <FormControl>
          <InputLabel id="model-label">Model</InputLabel>
          <Select
            labelId="model-label"
            id="model-label"
            value={model}
            label="Model"
            onChange={handleModelChange}
            style={{ marginBottom: "10px" }}
          >
            <MenuItem value="llama2">Llama2</MenuItem>
            <MenuItem value="gemma:7b">Gemma7B</MenuItem>
            <MenuItem value="stablelm2">StableLM2</MenuItem>
            <MenuItem value="codellama:13b">CodeLlama13B</MenuItem>
            <MenuItem value="llama3">Llama3 8bq4</MenuItem>
            <MenuItem value="llama3:8b-instruct-q8_0">Llama3 8bq8</MenuItem>
            <MenuItem value="phi3">PHI 3</MenuItem>
            <MenuItem value="yarn-mistral:7b-128k">
              yarn-mistral:7b-128k
            </MenuItem>

            {/* <MenuItem value="llama3:70b">Llama3 70b</MenuItem>*/}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="promptHelper-label">Assistant</InputLabel>
          <Select
            labelId="promptHelper-label"
            id="promptHelper-label"
            value={promptHelper}
            label="PromptHelper"
            onChange={handlePromptHelperChange}
            style={{ marginBottom: "10px" }}
          >
            <MenuItem value={promptHelpers[0].prompt}>No Helper</MenuItem>
            <MenuItem value={promptHelpers[1].prompt}>Story Writer</MenuItem>
            <MenuItem value={promptHelpers[2].prompt}>
              JavaScript Coder
            </MenuItem>
            <MenuItem value={promptHelpers[3].prompt}>Psychologist</MenuItem>
            <MenuItem value={promptHelpers[4].prompt}>DeadPool</MenuItem>
            <MenuItem value={promptHelpers[5].prompt}>
              Template Builder
            </MenuItem>
            <MenuItem value={promptHelpers[6].prompt}>
              Content Summarizer
            </MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Enter prompt..."
          variant="outlined"
          value={prompt}
          onChange={handleInputChange}
          multiline
          rows={4}
          fullWidth
          inputProps={{ style: { fontSize: "12px" } }}
        />
        <Button
          onClick={handleSubmit}
          variant="contained"
          style={{ marginTop: "10px" }}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Submit"}
        </Button>
        {/*response && (
        <Card>
          <CardContent>
            <Typography style={{ whiteSpace: 'pre-wrap' }} class="llama-response" variant="body1" component="div">{response}</Typography>
          </CardContent>
        </Card>
      )*/}
      </Box>
    </div>
  );
};

export default LlamaInput;
