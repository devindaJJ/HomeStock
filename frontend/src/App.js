import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./components/Home";
import ShoppingList from "./pages/ShoppingList";
import Inventory from "./pages/Inventory";
import StockManagement from "./pages/StockManagement";
import Reminders from "./pages/Reminders";

const App = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <main>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/" element={<Home />} />
                    <Route 
                        path="/shopping-list" 
                        element={
                            <PrivateRoute>
                                <ShoppingList />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/inventory" 
                        element={
                            <PrivateRoute>
                                <Inventory />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/stock-management" 
                        element={
                            <PrivateRoute>
                                <StockManagement />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/reminders" 
                        element={
                            <PrivateRoute>
                                <Reminders />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/dashboard" 
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/admin" 
                        element={
                            <PrivateRoute adminOnly={true}>
                                <AdminPanel />
                            </PrivateRoute>
                        } 
                    />
                </Routes>
            </main>
        </div>
    );
};

export default App;
