import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/* =========================
   FORCE DARK MODE (DEFAULT)
   ========================= */

// Apply dark mode BEFORE React mounts (prevents flash)
const rootElement = document.documentElement;

// If later you add theme toggle, this still works
if (!rootElement.classList.contains("dark")) {
  rootElement.classList.add("dark");
}

/* =========================
   APP BOOTSTRAP
   ========================= */

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
