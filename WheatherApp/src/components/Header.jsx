import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../store/Theme/context.js";

export function Header() {
  const navigate = useNavigate();
  const { themeState, themeDispatch } = useContext(ThemeContext);

  const toggleTheme = () => {
    themeDispatch({ type: "TOGGLE_THEME" });
  };

  return (
    <header className={`header ${themeState.darkMode ? "dark" : ""}`}>
      <div className="header-content">
        <div className="logo" onClick={() => navigate("/")}>
          <i className="fas fa-cloud-sun"></i>
          <h1>Prognoza Meteo</h1>
        </div>
        <div className="header-actions">
          <button onClick={toggleTheme} className="theme-toggle">
            <i className={`fas fa-${themeState.darkMode ? "sun" : "moon"}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
}
