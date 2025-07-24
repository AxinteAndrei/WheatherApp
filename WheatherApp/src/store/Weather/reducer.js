export const initialState = {
  currentWeather: null,
  forecast: null,
  loading: false,
  error: null,
  favorites: [],
  lastSearched: "",
};

export function weatherReducer(state, action) {
  switch (action.type) {
    case "FETCH_WEATHER_START":
      return { ...state, loading: true, error: null };
    case "FETCH_WEATHER_SUCCESS":
      return {
        ...state,
        loading: false,
        currentWeather: action.payload.current,
        forecast: action.payload.forecast,
        error: null,
      };
    case "FETCH_WEATHER_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "ADD_FAVORITE":
      return {
        ...state,
        favorites: [...state.favorites, { city: action.payload.city }],
      };
    case "REMOVE_FAVORITE":
      return {
        ...state,
        favorites: state.favorites.filter(
          (fav) => fav.city !== action.payload.city
        ),
      };
    case "SET_LAST_SEARCHED_LOCATION":
      return { ...state, lastSearched: action.payload };
    default:
      return state;
  }
}
