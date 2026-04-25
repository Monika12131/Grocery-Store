import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WatchlistProvider } from './context/WatchlistContext'
import { ToastProvider } from './context/ToastContext'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

