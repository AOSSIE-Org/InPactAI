import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import App from "./App.tsx";
import store from "./redux/store.ts";
import { ThemeProvider } from "./components/theme-provider";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider store={store}>
    <ThemeProvider defaultTheme="system" storageKey="inpact-theme">
      <App />
    </ThemeProvider>
  </Provider>
  // </StrictMode>,
);
