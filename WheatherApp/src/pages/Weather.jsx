import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WeatherContext } from "../store/Weather/context.js";

export function Weather() {
  const { city } = useParams();
  const navigate = useNavigate();
  const { weatherState, weatherDispatch } = useContext(WeatherContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!city) return;
    const fetchWeatherData = async () => {
      weatherDispatch({ type: "FETCH_WEATHER_START" });
      try {
        // First, get coordinates for the city using OpenWeatherMap Geocoding API
        const geocodeRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
            city
          )}&limit=1&appid=ea3e3338d6a2f4fe6d246649169f3479`
        );
        if (!geocodeRes.ok)
          throw new Error("Nu s-au găsit coordonatele pentru acest oraș.");
        const geocodeData = await geocodeRes.json();
        if (geocodeData.length === 0) {
          throw new Error("Nu s-au găsit date pentru acest oraș.");
        }
        const { lat, lon } = geocodeData[0];

        // Fetch current weather using OpenWeatherMap (for current conditions)
        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=ea3e3338d6a2f4fe6d246649169f3479&units=metric&lang=ro`
        );
        if (!currentRes.ok)
          throw new Error("Nu s-au putut obține datele meteo curente.");
        const currentData = await currentRes.json();

        // Fetch 7-day forecast using OpenMeteo (more accurate)
        const forecastRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=7`
        );
        if (!forecastRes.ok)
          throw new Error("Nu s-au putut obține datele de prognoză.");
        const forecastData = await forecastRes.json();

        weatherDispatch({
          type: "FETCH_WEATHER_SUCCESS",
          payload: {
            current: currentData,
            forecast: forecastData,
          },
        });
        weatherDispatch({
          type: "SET_LAST_SEARCHED_LOCATION",
          payload: city,
        });
      } catch (err) {
        weatherDispatch({ type: "FETCH_WEATHER_ERROR", payload: err.message });
      }
    };
    fetchWeatherData();
  }, [city, weatherDispatch]);

  const { currentWeather, forecast, loading, error, favorites } = weatherState;

  const getWeatherIcon = (weatherCode) => {
    // OpenMeteo weather codes to icon mapping
    const iconMap = {
      0: "01d", // Clear sky
      1: "02d", // Partly cloudy
      2: "03d", // Cloudy
      3: "04d", // Overcast
      45: "50d", // Foggy
      48: "50d", // Depositing rime fog
      51: "09d", // Light drizzle
      53: "09d", // Moderate drizzle
      55: "09d", // Dense drizzle
      56: "13d", // Light freezing drizzle
      57: "13d", // Dense freezing drizzle
      61: "10d", // Slight rain
      63: "10d", // Moderate rain
      65: "10d", // Heavy rain
      66: "13d", // Light freezing rain
      67: "13d", // Heavy freezing rain
      71: "13d", // Slight snow
      73: "13d", // Moderate snow
      75: "13d", // Heavy snow
      77: "13d", // Snow grains
      80: "09d", // Slight rain showers
      81: "09d", // Moderate rain showers
      82: "09d", // Violent rain showers
      85: "13d", // Slight snow showers
      86: "13d", // Heavy snow showers
      95: "11d", // Thunderstorm
      96: "11d", // Thunderstorm with slight hail
      99: "11d", // Thunderstorm with heavy hail
    };
    const iconCode = iconMap[weatherCode] || "01d";
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getWeatherDescription = (weatherCode) => {
    const descriptions = {
      0: "Cer senin",
      1: "Parțial înnorat",
      2: "Înnorat",
      3: "Cer acoperit",
      45: "Ceață",
      48: "Ceață cu gheață",
      51: "Burniță ușoară",
      53: "Burniță moderată",
      55: "Burniță intensă",
      56: "Burniță înghețată ușoară",
      57: "Burniță înghețată intensă",
      61: "Ploaie ușoară",
      63: "Ploaie moderată",
      65: "Ploaie intensă",
      66: "Ploaie înghețată ușoară",
      67: "Ploaie înghețată intensă",
      71: "Zăpadă ușoară",
      73: "Zăpadă moderată",
      75: "Zăpadă intensă",
      77: "Grăunțe de zăpadă",
      80: "Averse ușoare",
      81: "Averse moderate",
      82: "Averse violente",
      85: "Averse de zăpadă ușoare",
      86: "Averse de zăpadă intense",
      95: "Furtună",
      96: "Furtună cu grindină ușoară",
      99: "Furtună cu grindină intensă",
    };
    return descriptions[weatherCode] || "Necunoscut";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const isFavorite = () => {
    return favorites && favorites.some((fav) => fav.city === city);
  };

  const toggleFavorite = () => {
    if (isFavorite()) {
      weatherDispatch({ type: "REMOVE_FAVORITE", payload: { city } });
    } else {
      weatherDispatch({ type: "ADD_FAVORITE", payload: { city } });
    }
  };

  if (loading) {
    return (
      <div className="weather-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Se încarcă datele meteo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Eroare</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/")} className="back-button">
            <i className="fas fa-arrow-left"></i>
            Înapoi la căutare
          </button>
        </div>
      </div>
    );
  }

  if (!currentWeather) return null;

  return (
    <div className="weather-container">
      <div className="weather-header">
        <button onClick={() => navigate("/")} className="back-button">
          <i className="fas fa-arrow-left"></i>
          Înapoi
        </button>
        <div className="location-info">
          <h1>{currentWeather.name}</h1>
          <p className="current-time">
            {currentTime.toLocaleTimeString("ro-RO")}
          </p>
        </div>
        <button onClick={toggleFavorite} className="favorite-button">
          <i className={`fas fa-star ${isFavorite() ? "filled" : ""}`}></i>
        </button>
      </div>
      <div className="current-weather">
        <div className="weather-main">
          <div className="temperature-section">
            <h2>{Math.round(currentWeather.main.temp)}°C</h2>
            <p className="feels-like">
              Se simte ca {Math.round(currentWeather.main.feels_like)}°C
            </p>
          </div>
          <div className="weather-icon">
            <img
              src={getWeatherIcon(currentWeather.weather[0].id)}
              alt={currentWeather.weather[0].description}
            />
            <p>{currentWeather.weather[0].description}</p>
          </div>
        </div>
        <div className="weather-details">
          <div className="detail-item">
            <i className="fas fa-thermometer-half"></i>
            <div>
              <span className="label">Temperatură</span>
              <span className="value">
                {Math.round(currentWeather.main.temp)}°C
              </span>
            </div>
          </div>
          <div className="detail-item">
            <i className="fas fa-tint"></i>
            <div>
              <span className="label">Umiditate</span>
              <span className="value">{currentWeather.main.humidity}%</span>
            </div>
          </div>
          <div className="detail-item">
            <i className="fas fa-wind"></i>
            <div>
              <span className="label">Vânt</span>
              <span className="value">{currentWeather.wind.speed} m/s</span>
            </div>
          </div>
          <div className="detail-item">
            <i className="fas fa-compress-alt"></i>
            <div>
              <span className="label">Presiune</span>
              <span className="value">{currentWeather.main.pressure} hPa</span>
            </div>
          </div>
        </div>
      </div>
      {forecast && forecast.daily && (
        <div className="forecast-section">
          <h3>Prognoză pe 7 zile</h3>
          <div className="forecast-grid">
            {forecast.daily.time.map((date, index) => (
              <div key={index} className="forecast-day">
                <h4>{formatDate(date)}</h4>
                <img
                  src={getWeatherIcon(forecast.daily.weather_code[index])}
                  alt={getWeatherDescription(
                    forecast.daily.weather_code[index]
                  )}
                  className="forecast-icon"
                />
                <p className="forecast-temp">
                  {Math.round(forecast.daily.temperature_2m_max[index])}°C
                </p>
                <p className="forecast-desc">
                  {getWeatherDescription(forecast.daily.weather_code[index])}
                </p>
                <div className="forecast-details">
                  <span>
                    <i className="fas fa-cloud-rain"></i>{" "}
                    {forecast.daily.precipitation_probability_max[index]}%
                  </span>
                  <span>
                    <i className="fas fa-wind"></i>{" "}
                    {Math.round(forecast.daily.wind_speed_10m_max[index])} km/h
                  </span>
                </div>
                <div className="temp-range">
                  <span className="temp-min">
                    {Math.round(forecast.daily.temperature_2m_min[index])}°
                  </span>
                  <span className="temp-max">
                    {Math.round(forecast.daily.temperature_2m_max[index])}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
