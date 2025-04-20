import React from 'react';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className={`min-h-screen ${isHomePage ? 'relative' : 'bg-[#09090B] animated-gradient'}`}>
            {/* Background decorative elements - only show on non-home pages */}
            {!isHomePage && (
                <div className="fixed inset-0 z-0 overflow-hidden">
                    {/* Gradient orbs */}
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
                </div>
            )}

            {/* Main content */}
            <div className="relative z-10">
                <main className={`${isHomePage ? '' : 'container mx-auto px-4 py-8'}`}>
                    {isHomePage ? (
                        children
                    ) : (
                        <div className="glass-card min-h-[calc(100vh-8rem)] p-6">
                            {children}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Layout; 