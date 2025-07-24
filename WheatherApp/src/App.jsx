import React, { useReducer, useEffect } from "react";
import "./style.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import { Weather } from "./pages/Weather.jsx";
import { Header } from "./components/Header.jsx";
import {
  initialState as weatherInitialState,
  weatherReducer,
} from "./store/Weather/reducer.js";
import { WeatherContext } from "./store/Weather/context.js";
import {
  initialState as themeInitialState,
  themeReducer,
} from "./store/Theme/reducer.js";
import { ThemeContext } from "./store/Theme/context.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <Home />
      </>
    ),
  },
  {
    path: "/weather/:city",
    element: (
      <>
        <Header />
        <Weather />
      </>
    ),
  },
]);

export default function App() {
  const [weatherState, weatherDispatch] = useReducer(
    weatherReducer,
    weatherInitialState
  );
  const [themeState, themeDispatch] = useReducer(
    themeReducer,
    themeInitialState
  );

  // Aplică tema la document
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      themeState.darkMode ? "dark" : "light"
    );
  }, [themeState.darkMode]);

  return (
    <WeatherContext.Provider value={{ weatherState, weatherDispatch }}>
      <ThemeContext.Provider value={{ themeState, themeDispatch }}>
        <div className="App">
          <RouterProvider router={router} />
        </div>
      </ThemeContext.Provider>
    </WeatherContext.Provider>
  );
}
