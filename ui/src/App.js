import "./App.css";
import StreamedTextContainer from "./containers/StreamedTextContainer";
import LlamaInput from "./containers/LlamaInput";
import MusicContainer from "./containers/MusicPlaying";
import TextToSpeech from "./components/tts";

function App() {
  const stream = {
    subscribe: (callback) => {
      callback("Hello World");
    },
    unsubscribe: () => {
      console.log("Unsubscribed");
    },
  };
  return (
    <div className="App">
      <MusicContainer stream={stream} />
      <div>
        <div class="container">
          <section class="streaming-text">
            <StreamedTextContainer stream={stream} />
          </section>
          <section class="prompt-response">
            <LlamaInput />
          </section>{" "}
        </div>
        <TextToSpeech />
      </div>
    </div>
  );
}

export default App;
