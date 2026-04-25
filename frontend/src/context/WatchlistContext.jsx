import { createContext, useContext, useEffect, useReducer } from 'react';

const WatchlistContext = createContext();

const loadWatchlist = () => {
  try {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('Error loading watchlist from localStorage', err);
    return [];
  }
};

const watchlistReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE': {
      const exists = state.some((item) => item._id === action.payload._id);
      if (exists) {
        return state.filter((item) => item._id !== action.payload._id);
      }
      return [...state, action.payload];
    }
    case 'REMOVE':
      return state.filter((item) => item._id !== action.payload);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
};

export const WatchlistProvider = ({ children }) => {
  const [watchlist, dispatch] = useReducer(watchlistReducer, [], loadWatchlist);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (product) => dispatch({ type: 'TOGGLE', payload: product });
  const removeFromWatchlist = (_id) => dispatch({ type: 'REMOVE', payload: _id });
  const clearWatchlist = () => dispatch({ type: 'CLEAR' });
  const isInWatchlist = (_id) => watchlist.some((item) => item._id === _id);

  return (
    <WatchlistContext.Provider value={{ watchlist, toggleWatchlist, removeFromWatchlist, clearWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);
