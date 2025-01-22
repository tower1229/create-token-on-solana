// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initCrypto } from "@/utils";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  initCrypto().then(() => {
    root.render(
      // <React.StrictMode>
      <App />
      // </React.StrictMode>,
    );
  });
}
