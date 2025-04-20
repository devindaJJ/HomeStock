import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage = () => {
    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
            >
                <source src="/videos/heroVideo.mp4" type="video/mp4" />
            </video>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl"
                >
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
                        Welcome to HomeStock
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-200">
                        Your all-in-one solution for managing household inventory, shopping lists, and more.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-lg font-semibold transition-colors"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-lg font-semibold transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HomePage; 