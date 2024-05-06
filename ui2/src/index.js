import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { WebSocketManager } from "./Components/WebsocketManager";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <WebSocketManager>
      <App />
    </WebSocketManager>
  </React.StrictMode>
);
