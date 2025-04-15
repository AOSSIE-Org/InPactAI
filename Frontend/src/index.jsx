import React from "react"
import ReactDOM from "react-dom/client"
import "./styles/globals.css"
import App from "./App"
import { ThemeProvider } from "./components/theme-provider"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
 <ThemeProvider>
    <App />
    </ThemeProvider>,
)

