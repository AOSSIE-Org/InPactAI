import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import App from "./App.tsx";
import store from "./redux/store.ts";
import { Toaster } from 'sonner'

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider store={store}>
    <Toaster richColors />
    <App />
  </Provider>
  // </StrictMode>,
);
