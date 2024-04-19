import "./App.css";
import StreamedTextContainer from "./containers/StreamedTextContainer";
import LlamaInput from "./containers/LlamaInput";

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
      <div>
        <div class="container">
          <section class="streaming-text">
            <StreamedTextContainer stream={stream} />
          </section>
          <section class="prompt-response">
            <LlamaInput />
          </section>{" "}
        </div>
      </div>
    </div>
  );
}

export default App;
