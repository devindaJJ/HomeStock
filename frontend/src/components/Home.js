import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaClipboardList, FaBox, FaBell } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Home = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time for better UX
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleVideoLoad = () => {
        console.log("Video data loaded");
    };

    const features = [
        {
            icon: <FaShoppingCart className="w-8 h-8" />,
            title: 'Shopping List',
            description: 'Create and manage your shopping lists with ease',
            path: '/shopping-list'
        },
        {
            icon: <FaBox className="w-8 h-8" />,
            title: 'Inventory',
            description: 'Track your household inventory efficiently',
            path: '/inventory'
        },
        {
            icon: <FaClipboardList className="w-8 h-8" />,
            title: 'Stock Management',
            description: 'Monitor and manage your stock levels',
            path: '/stock-management'
        },
        {
            icon: <FaBell className="w-8 h-8" />,
            title: 'Reminders',
            description: 'Set reminders for important tasks and events',
            path: '/reminders'
        }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-screen overflow-hidden">
                {/* Video Container - Basic absolute positioning */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        // Use direct styles for positioning and sizing, removing className
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onLoadedData={handleVideoLoad}
                    >
                        <source src="/videos/heroVideo.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    {/* Overlay - slightly above video */}
                    {/* Keep Tailwind here for simplicity */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 z-5" /> 
                </div>

                {/* Text Content - on top */}
                {/* Keep Tailwind here */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center mb-6">
                        Welcome to HomeStock
                    </h1>
                    <p className="text-xl text-white text-center max-w-2xl mb-8">
                        Your all-in-one solution for managing your household inventory, shopping lists, and reminders.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:bg-indigo-700 transition-colors"
                        onClick={() => navigate('/dashboard')}
                    >
                        Get Started
                    </motion.button>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Features</h2>
                        <p className="text-xl text-gray-600">Everything you need to manage your home efficiently</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -10 }}
                                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="text-indigo-600 mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 mb-4">{feature.description}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                                    onClick={() => navigate(feature.path)}
                                >
                                    Learn More →
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-indigo-600 py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
                        <p className="text-xl text-indigo-100 mb-8">
                            Join thousands of users who are already managing their homes efficiently with HomeStock.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:bg-indigo-50 transition-colors"
                            onClick={() => navigate('/register')}
                        >
                            Sign Up Now
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Home; 