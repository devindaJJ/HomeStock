import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ShoppingList from './pages/ShoppingList';
import StockManagement from './pages/StockManagement';
import Reminders from './pages/Reminders';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/glassy.css';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  // If route requires admin access
  if (requireAdmin) {
    // Only allow admin users to access admin routes
    return user.role === 'admin' ? children : <Navigate to="/" />;
  }

  // For non-admin routes (user routes)
  // Redirect admin users to dashboard
  if (user.role === 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // Allow regular users to access user routes
  return user.role === 'user' ? children : <Navigate to="/" />;
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    // Update document class
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#09090B]' : 'bg-gray-100'}`}>
      <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'glassy-bg dark' : 'glassy-bg light'}`}>
        <Routes>
          <Route path="/" element={<HomePage isDarkMode={isDarkMode} />} />
          <Route path="/login" element={<Login isDarkMode={isDarkMode} />} />
          <Route path="/register" element={<Register isDarkMode={isDarkMode} />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute requireAdmin>
                <Dashboard isDarkMode={isDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <PrivateRoute>
                <Inventory isDarkMode={isDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <PrivateRoute>
                <ShoppingList isDarkMode={isDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
            path="/stock-management"
            element={
              <PrivateRoute>
                <StockManagement isDarkMode={isDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <PrivateRoute>
                <Reminders isDarkMode={isDarkMode} />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
      <ToastContainer 
        position="bottom-right" 
        theme={isDarkMode ? "dark" : "light"}
      />
    </div>
  );
}

export default App;
