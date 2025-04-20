import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Check if the response contains the token and user data
            if (response.data.token && response.data.user) {
                // Store token in localStorage
                localStorage.setItem('token', response.data.token);

                // Store user data (including user_id) in localStorage
                localStorage.setItem('user', JSON.stringify({
                    user_id: response.data.user.user_id,
                    username: response.data.user.username,
                    email: response.data.user.email,
                    role: response.data.user.role,
                }));

                toast.success('Login successful!');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                toast.error(error.response.data.message || 'Login failed');
            } else if (error.request) {
                toast.error('No response from server. Please try again.');
            } else {
                toast.error('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090B] animated-gradient flex items-center justify-center px-4 sm:px-6 lg:px-8">
            {/* Background decorative elements */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>

            <div className="z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-8">
                        <h2 className="gradient-text text-3xl font-bold">Welcome to HomeStock</h2>
                        <p className="mt-2 text-gray-400">Sign in to your account</p>
                    </div>

                    <div className="glass-card p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                    Email
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 glass-card ${isDarkMode ? 'text-white' : 'text-black'}
                                                 border border-white/10 focus:border-indigo-500
                                                 rounded-xl py-2 px-3
                                                 placeholder-gray-400
                                                 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                      id="password"
                                      name="password"
                                      type="password"
                                      required
                                      value={formData.password}
                                      onChange={handleChange}
                                      className={`block w-full pl-10 glass-card ${isDarkMode ? 'text-white' : 'text-black'}
                                               border border-white/10 focus:border-indigo-500
                                               rounded-xl py-2 px-3
                                               placeholder-gray-400
                                               focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                      placeholder="Enter your password"
                                    />

                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="animate-spin">⏳</span>
                                    ) : (
                                        <>
                                            <FaSignInAlt />
                                            Sign In
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-indigo-400 hover:text-indigo-300"
                                >
                                    Forgot your password?
                                </Link>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-400">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/register"
                                        className="text-indigo-400 hover:text-indigo-300"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
