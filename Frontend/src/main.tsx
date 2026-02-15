import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import store from "./redux/store";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root container missing in index.html");
}

createRoot(root).render(
  <Provider store={store}>
    <App />
  </Provider>
);