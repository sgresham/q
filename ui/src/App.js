import logo from "./logo.svg";
import "./App.css";
import StreamedTextContainer from "./containers/StreamedTextContainer";

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
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div>
        <h1>Streamed Text</h1>
        <StreamedTextContainer stream={stream} />
      </div>
      </header>

    </div>
  );
}

export default App;
