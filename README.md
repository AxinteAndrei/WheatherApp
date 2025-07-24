# WeatherApp

WeatherApp is a modern, responsive web application built with React that allows users to view real-time weather information and 7-day forecasts for any city in the world. It features geolocation-based weather, search history, favorites, and a dark/light theme toggle.

## Features

- **Real-Time Weather:** Get current weather conditions for any city using OpenWeatherMap and OpenMeteo APIs.
- **7-Day Forecast:** View a detailed 7-day weather forecast for your selected location.
- **Geolocation Support:** Detects your current location (with user permission) and displays local weather.
- **Search & History:** Search for any city and quickly access your recent searches.
- **Favorites:** Mark cities as favorites for quick access.
- **Popular Destinations:** Quick links to popular world cities.
- **Dark/Light Mode:** Toggle between dark and light themes for comfortable viewing.
- **Responsive Design:** Fully responsive and mobile-friendly UI.

## Screenshots

_(Add your own screenshots here for best results!)_

## How It Works

- **Home Page:**
  - Shows a hero section, your current location’s weather (if permitted), search bar, search history, favorites, and popular destinations.
  - Allows you to search for a city, use your current location, or pick from history/favorites/popular cities.
- **Weather Page:**
  - Displays detailed current weather and a 7-day forecast for the selected city.
  - Lets you add/remove the city from your favorites.
  - Shows weather details like temperature, humidity, wind, and pressure.

## Technologies Used

- **React** (with hooks and context API)
- **React Router** for navigation
- **OpenWeatherMap API** for current weather and geocoding
- **OpenMeteo API** for 7-day forecasts
- **CSS** (custom, with CSS variables for theming)
- **LocalStorage** for persisting search history and favorites

## Project Structure

```
src/
  api/                # (for future API utilities)
  components/
    Header.jsx        # App header with theme toggle
  pages/
    Home.jsx          # Main landing/search page
    Weather.jsx       # Weather details and forecast
  store/
    Theme/            # Theme context and reducer
    Weather/          # Weather context and reducer
  style.css           # Main styles and theming
  App.jsx             # Main app component
  index.js            # Entry point
public/
  index.html
```

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd WheatherApp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

## Environment Variables

The API keys for OpenWeatherMap and OpenMeteo are currently hardcoded for demo purposes. For production, you should move them to environment variables.

## Customization

- **Theming:** Easily switch between dark and light mode using the toggle in the header.
- **Styling:** Modify `src/style.css` for custom styles or to adjust the color palette.

## License

MIT
