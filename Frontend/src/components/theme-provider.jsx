import React from "react"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
})

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme", ...props }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) || defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

// "use client";
// import React, { useState, useEffect, useContext } from "react";

// export default function ThemeProvider({ children }) {
//   const [theme, setTheme] = useState("light");

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", theme === "dark");
//   }, [theme]);

//   return (
//     <div className="bg-background text-foreground">
//       <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
//         Toggle Dark Mode
//       </button>
//       {children}
//     </div>
//   );
// }

// export const useTheme = () => {
//   const context = useContext(ThemeProviderContext)

//   if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

//   return context
// }
