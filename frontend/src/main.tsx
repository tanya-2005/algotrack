import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { MemoryProvider } from "./context/MemoryContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <MemoryProvider>
          <App />
        </MemoryProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
