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

const ollama = new Ollama({ host: "http://10.10.10.30:11434" });

const LlamaInput = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("llama3");
  const [stream, setStream] = useState(false);

  const handleInputChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleModelChange = (event) => {
    setModel(event.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setResponse("");
    try {
      const streamResponse = await ollama.chat({
        model: model,
        messages: [{ role: "user", content: prompt }],
        stream: stream,
        options: {
          num_predict: 8192,
          temperature: 0,
          num_ctx: 8192,
          repeat_penalty: 1.1,
        },
      });
      if (stream) {
        for await (const stream of streamResponse) {
          setResponse((prevResponse) => prevResponse + stream.message.content);
          TextToSpeechStream(stream.message.content).then((audio) => audio.play())
        }
      } else {
        setResponse(
          (prevResponse) => prevResponse + streamResponse.message.content
        );
        TextToSpeechStream(streamResponse.message.content).then((audio) => {
          console.log("data received")
          if (audio.readyState >= 2) { // 2 means audio data is available and ready to play
            console.log("data ready")
              audio.play();
          } else {
              audio.addEventListener('loadeddata', () => {
                console.log("data loaded")
                  audio.play();
              });
          }
      });
      }
    } catch (error) {
      console.error("Error fetching response from llama2:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={2}>
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
          <MenuItem value="llama3">Llama3</MenuItem>
        </Select>
      </FormControl>
                  <TextToSpeech text={response} />
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
      {response && (
        <Card>
          <CardContent>
            <Typography class="llama-response" variant="body1" component="div">
              {response.trim()}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default LlamaInput;
