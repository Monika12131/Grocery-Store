import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { user: action.payload.user, token: action.payload.token };
    case 'LOGOUT':
      return { user: null, token: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null, token: null });

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (token && user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      }
    } catch (err) {
      console.error('Error loading auth from localStorage', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const login = (authData) => {
    const { token, ...user } = authData;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
  };

  const updateUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: state.token } });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
