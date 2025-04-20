import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';

const Register = ({ isDarkMode = false }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // Create API instance with consistent baseURL
            const api = axios.create({
                baseURL: 'http://localhost:5000',
                withCredentials: true
            });

            const response = await api.post('/users', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                // Role is intentionally omitted to let backend set default
            });
            
            if (response.data) {
                toast.success('Registration successful! Please login.');
                navigate('/login');
            }
        } catch (error) {
            console.error('Registration error:', {
                message: error.message,
                response: error.response?.data,
                config: error.config
            });
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-[#09090B]' : 'bg-gray-50'}`}>
            {/* Background decorative elements */}
            {isDarkMode && (
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
                </div>
            )}

            <div className="z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-8">
                        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Create Account
                        </h2>
                        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Join HomeStock today
                        </p>
                    </div>

                    <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800 bg-opacity-70 backdrop-blur-sm border border-gray-700' : 'bg-white border border-gray-200 shadow'}`}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="username" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Username
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 rounded-xl py-2 px-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${
                                            isDarkMode 
                                                ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500' 
                                                : 'border border-gray-300 text-gray-900 focus:border-indigo-500'
                                        }`}
                                        placeholder="Choose a username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Email
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 rounded-xl py-2 px-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${
                                            isDarkMode 
                                                ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500' 
                                                : 'border border-gray-300 text-gray-900 focus:border-indigo-500'
                                        }`}
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Password
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 rounded-xl py-2 px-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${
                                            isDarkMode 
                                                ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500' 
                                                : 'border border-gray-300 text-gray-900 focus:border-indigo-500'
                                        }`}
                                        placeholder="Create a password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Confirm Password
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 rounded-xl py-2 px-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${
                                            isDarkMode 
                                                ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500' 
                                                : 'border border-gray-300 text-gray-900 focus:border-indigo-500'
                                        }`}
                                        placeholder="Confirm your password"
                                    />
                                </div>
                            </div>

                            <div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent
                                              rounded-xl text-sm font-medium text-white
                                              bg-indigo-600 hover:bg-indigo-700
                                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                              ${isDarkMode ? 'focus:ring-offset-gray-800' : ''}`}
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <>
                                            <FaUserPlus className="mr-2 h-4 w-4" />
                                            Create Account
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className={`px-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    to="/login"
                                    className={`w-full flex justify-center py-2 px-4
                                             rounded-xl text-sm font-medium
                                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                             ${isDarkMode 
                                                ? 'border border-gray-700 text-white bg-gray-700 hover:bg-gray-600 focus:ring-offset-gray-800' 
                                                : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                             }`}
                                >
                                    Sign In Instead
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;