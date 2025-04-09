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
import Home from "./pages/Home";
import AddStock from "./pages/AddStock";
import ViewStock from "./pages/ViewStock";
import ViewAlerts from "./pages/ViewAlerts";

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
                    <Route path="/add-stock" element={<AddStock />} />
                    <Route path="/view-stock" element={<ViewStock />} />
                    <Route path="/view-alerts" element={<ViewAlerts />} />
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
                    <Route path="/" element={<Login />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;
