import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { WeatherContext } from "../store/Weather/context.js";

const POPULAR_DESTINATIONS = [
  { city: "Paris", country: "Franța" },
  { city: "Londra", country: "Marea Britanie" },
  { city: "Roma", country: "Italia" },
  { city: "New York", country: "SUA" },
  { city: "Tokyo", country: "Japonia" },
  { city: "Barcelona", country: "Spania" },
  { city: "Dubai", country: "Emiratele Arabe" },
];

export function Home() {
  const [city, setCity] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentLocationWeather, setCurrentLocationWeather] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const navigate = useNavigate();
  const { weatherDispatch, weatherState } = useContext(WeatherContext);

  useEffect(() => {
    const savedHistory = localStorage.getItem("weatherSearchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const fetchWeatherByCoords = useCallback(
    async (lat, lon, isAuto = false, accuracy = null) => {
      const API_KEY = "ea3e3338d6a2f4fe6d246649169f3479";
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ro`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isAuto) {
          setCurrentLocationWeather({ ...data, accuracy });
        } else {
          navigate(`/weather/${encodeURIComponent(data.name)}`);
        }
      } catch (error) {
        console.error("Eroare la obținerea vremii:", error);
        setLocationError("Eroare la obținerea vremii: " + error.message);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const lastLocation = localStorage.getItem("lastKnownLocation");
    if (lastLocation) {
      try {
        const location = JSON.parse(lastLocation);
        fetchWeatherByCoords(
          location.lat,
          location.lon,
          true,
          location.accuracy
        );
      } catch (error) {
        console.error("Eroare la parsarea locației salvate:", error);
        setShowLocationPrompt(true);
      }
    } else {
      setShowLocationPrompt(true);
    }
  }, [fetchWeatherByCoords]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      setLocationError("");

      // Opțiuni mai stricte pentru precizie maximă
      const options = {
        enableHighAccuracy: true, // Forțează GPS-ul
        timeout: 30000, // 30 secunde timeout
        maximumAge: 0, // Nu folosi cache, obține locația curentă
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log("Locație detectată:", { latitude, longitude, accuracy });
          setLocationAccuracy(accuracy);
          weatherDispatch({
            type: "SET_CURRENT_LOCATION",
            payload: { lat: latitude, lon: longitude, accuracy },
          });
          localStorage.setItem(
            "lastKnownLocation",
            JSON.stringify({ lat: latitude, lon: longitude, accuracy })
          );
          fetchWeatherByCoords(latitude, longitude, false, accuracy);
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          setShowLocationPrompt(false);
          let errorMessage = "Nu s-a putut detecta locația.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Accesul la locație a fost refuzat. Verifică setările browserului și permite accesul la locație.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Informațiile despre locație nu sunt disponibile. Verifică dacă GPS-ul este activat.";
              break;
            case error.TIMEOUT:
              errorMessage =
                "Timeout la detectarea locației. Încearcă din nou sau verifică conexiunea la internet.";
              break;
            default:
              errorMessage = "Eroare necunoscută la detectarea locației.";
          }
          setLocationError(errorMessage);
        },
        options
      );
    } else {
      setLocationError("Geolocația nu este suportată de acest browser.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      const trimmedCity = city.trim();
      const newHistory = [
        trimmedCity,
        ...searchHistory.filter((item) => item !== trimmedCity),
      ].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem("weatherSearchHistory", JSON.stringify(newHistory));
      navigate(`/weather/${encodeURIComponent(trimmedCity)}`);
    }
  };

  const handleHistoryClick = (cityName) => {
    navigate(`/weather/${encodeURIComponent(cityName)}`);
  };

  const handleFavoriteClick = (fav) => {
    navigate(`/weather/${encodeURIComponent(fav.city)}`);
  };

  const handleAddFavorite = (city) => {
    weatherDispatch({ type: "ADD_FAVORITE", payload: { city } });
  };

  const handleRemoveFavorite = (city) => {
    weatherDispatch({ type: "REMOVE_FAVORITE", payload: { city } });
  };

  const handleCurrentLocationClick = () => {
    if (currentLocationWeather && currentLocationWeather.name) {
      navigate(`/weather/${encodeURIComponent(currentLocationWeather.name)}`);
    } else {
      getCurrentLocation();
    }
  };

  const getAccuracyText = (accuracy) => {
    if (accuracy <= 5) return "Foarte precisă (±5m)";
    if (accuracy <= 10) return "Precisă (±10m)";
    if (accuracy <= 50) return "Bună (±50m)";
    if (accuracy <= 100) return "Aproximativă (±100m)";
    if (accuracy <= 500) return "În aproximare (±500m)";
    return "În aproximare (±" + Math.round(accuracy) + "m)";
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Prognoza Meteo</h1>
        <p>Descoperă vremea în timp real și prognoza pe 7 zile</p>
      </div>
      {currentLocationWeather && currentLocationWeather.main && (
        <div className="current-location-section">
          <h3>Locația ta</h3>
          <div
            className="current-location-card"
            onClick={handleCurrentLocationClick}
          >
            <div className="location-info">
              <h4>{currentLocationWeather.name}</h4>
              <p>{Math.round(currentLocationWeather.main.temp)}°C</p>
              {currentLocationWeather.accuracy && (
                <small className="accuracy-info">
                  {getAccuracyText(currentLocationWeather.accuracy)}
                </small>
              )}
            </div>
            <div className="location-weather">
              <img
                src={`https://openweathermap.org/img/wn/${currentLocationWeather.weather[0].icon}@2x.png`}
                alt={currentLocationWeather.weather[0].description}
              />
              <span>{currentLocationWeather.weather[0].description}</span>
            </div>
          </div>
        </div>
      )}
      {showLocationPrompt && !currentLocationWeather && (
        <div className="location-prompt">
          <p>Vrei să vezi vremea pentru locația ta?</p>
          <p className="location-info-text">
            <i className="fas fa-info-circle"></i>
            Vom folosi GPS-ul pentru a detecta locația ta cu precizie maximă
          </p>
          <button
            onClick={getCurrentLocation}
            className="location-button"
            disabled={isLocating}
          >
            {isLocating ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Se detectează locația...
              </>
            ) : (
              <>
                <i className="fas fa-location-arrow"></i>
                Detectează locația
              </>
            )}
          </button>
          <button
            onClick={() => setShowLocationPrompt(false)}
            className="skip-button"
          >
            Sari peste
          </button>
        </div>
      )}
      <div className="search-section">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Caută un oraș..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="search-input"
              required
            />
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i>
              Caută
            </button>
          </div>
        </form>
        <button
          onClick={handleCurrentLocationClick}
          className="location-button"
          disabled={isLocating}
        >
          {isLocating ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Se detectează...
            </>
          ) : (
            <>
              <i className="fas fa-location-arrow"></i>
              Locația mea
            </>
          )}
        </button>
        {locationError && <div className="location-error">{locationError}</div>}
        {locationAccuracy && (
          <div className="accuracy-display">
            <small>
              Acuratețe detectată: {getAccuracyText(locationAccuracy)}
            </small>
          </div>
        )}
      </div>
      {weatherState.favorites && weatherState.favorites.length > 0 && (
        <div className="favorites-section">
          <h3>Favorite</h3>
          <div className="history-list">
            {weatherState.favorites.map((fav, idx) => (
              <button
                key={idx}
                onClick={() => handleFavoriteClick(fav)}
                className="history-item"
              >
                <i className="fas fa-star"></i>
                {fav.city}
                <span
                  style={{
                    marginLeft: 8,
                    color: "var(--error-color)",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(fav.city);
                  }}
                  title="Șterge din favorite"
                >
                  <i className="fas fa-times"></i>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {searchHistory.length > 0 && (
        <div className="history-section">
          <h3>Ultimele căutări</h3>
          <div className="history-list">
            {searchHistory.map((city, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(city)}
                className="history-item"
              >
                <i className="fas fa-history"></i>
                {city}
                <span
                  style={{
                    marginLeft: 8,
                    color: "var(--accent-color)",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddFavorite(city);
                  }}
                  title="Adaugă la favorite"
                >
                  <i className="fas fa-star"></i>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="features-section">
        <div className="feature-card">
          <i className="fas fa-thermometer-half"></i>
          <h3>Temperatură Reală</h3>
          <p>Informații precise despre temperatura actuală</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-calendar-week"></i>
          <h3>Prognoză 7 Zile</h3>
          <p>Prognoza meteo detaliată pentru o săptămână</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-map-marker-alt"></i>
          <h3>Locație GPS</h3>
          <p>Detectare automată a locației tale cu precizie</p>
        </div>
      </div>
      <div className="popular-section" style={{ marginTop: "3rem" }}>
        <h3>Destinații populare</h3>
        <div className="history-list">
          {POPULAR_DESTINATIONS.map((dest, idx) => (
            <button
              key={idx}
              onClick={() =>
                navigate(`/weather/${encodeURIComponent(dest.city)}`)
              }
              className="history-item"
            >
              <i className="fas fa-plane"></i>
              {dest.city}, {dest.country}
              <span
                style={{
                  marginLeft: 8,
                  color: "var(--accent-color)",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFavorite(dest.city);
                }}
                title="Adaugă la favorite"
              >
                <i className="fas fa-star"></i>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
