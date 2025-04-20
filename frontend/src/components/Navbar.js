import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaHome, 
    FaShoppingCart, 
    FaBoxes, 
    FaChartLine, 
    FaBell, 
    FaUserCircle,
    FaBars,
    FaTimes,
    FaSignOutAlt,
    FaEdit,
    FaKey,
    FaUser,
    FaSun,
    FaMoon
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const profileDropdownRef = useRef(null);
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
                setIsEditingName(false);
                setIsEditingUsername(false);
                setIsChangingPassword(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleUpdateProfile = async (type) => {
        try {
            let endpoint = '';
            let data = {};

            switch (type) {
                case 'name':
                    endpoint = '/api/users/update-name';
                    data = { name: formData.name };
                    break;
                case 'username':
                    endpoint = '/api/users/update-username';
                    data = { username: formData.username };
                    break;
                case 'password':
                    if (formData.newPassword !== formData.confirmPassword) {
                        toast.error('New passwords do not match');
                        return;
                    }
                    endpoint = '/api/users/change-password';
                    data = {
                        currentPassword: formData.currentPassword,
                        newPassword: formData.newPassword
                    };
                    break;
                default:
                    return;
            }

            const response = await axios.post(`http://localhost:5000${endpoint}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
                if (type === 'username') {
                    const updatedUser = { ...user, username: formData.username };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
                setIsEditingName(false);
                setIsEditingUsername(false);
                setIsChangingPassword(false);
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || `Failed to update ${type}`);
        }
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const features = [
        { 
            name: 'Dashboard', 
            path: '/dashboard',
            icon: FaHome,
            show: isAdmin 
        },
        { 
            name: 'Shopping List', 
            path: '/shopping-list',
            icon: FaShoppingCart,
            show: !isAdmin 
        },
        { 
            name: 'Inventory', 
            path: '/inventory',
            icon: FaBoxes,
            show: !isAdmin 
        },
        { 
            name: 'Stock Management', 
            path: '/stock-management',
            icon: FaChartLine,
            show: !isAdmin 
        },
        { 
            name: 'Reminders', 
            path: '/reminders',
            icon: FaBell,
            show: !isAdmin 
        }
    ];

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'glass-nav shadow-lg' : 'bg-transparent'
            } ${isDarkMode ? 'bg-[#09090B]' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <motion.div
                            className="flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Link to="/dashboard" className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                HomeStock
                            </Link>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:space-x-6">
                            {features
                                .filter(item => item.show)
                                .map(feature => {
                                    const Icon = feature.icon;
                                    const isActive = location.pathname === feature.path;
                                    
                                    return (
                                        <motion.div
                                            key={feature.path}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Link
                                                to={feature.path}
                                                className={`
                                                    flex items-center px-4 py-2 rounded-lg
                                                    text-sm font-medium transition-all duration-300
                                                    ${isActive 
                                                        ? isDarkMode
                                                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/50'
                                                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                        : isDarkMode 
                                                            ? 'text-gray-300 hover:text-white hover:bg-white/5' 
                                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                                    }
                                                `}
                                            >
                                                <Icon className={`mr-2 h-5 w-5 ${isActive ? 'text-indigo-500' : ''}`} />
                                                {feature.name}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                        </div>

                        {/* User Menu */}
                        <div className="hidden md:flex md:items-center" ref={profileDropdownRef}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="ml-4 relative flex-shrink-0"
                            >
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg
                                             text-sm font-medium glass-card hover:bg-white/10 
                                             transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                >
                                    <FaUserCircle className="h-5 w-5" />
                                    <span>{user.username || 'User'}</span>
                                </button>

                                {/* Profile Dropdown */}
                                {isProfileOpen && (
                                    <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 
                                        ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} 
                                        ring-1 ring-black ring-opacity-5`}>
                                        {isEditingName ? (
                                            <div className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                                                    placeholder="Enter new name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                                <div className="flex mt-2 space-x-2">
                                                    <button
                                                        onClick={() => handleUpdateProfile('name')}
                                                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditingName(false)}
                                                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditingName(true)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                                            >
                                                <FaEdit className="inline-block mr-2" />
                                                Edit Name
                                            </button>
                                        )}

                                        {isEditingUsername ? (
                                            <div className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                                                    placeholder="Enter new username"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                />
                                                <div className="flex mt-2 space-x-2">
                                                    <button
                                                        onClick={() => handleUpdateProfile('username')}
                                                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditingUsername(false)}
                                                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditingUsername(true)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                                            >
                                                <FaUser className="inline-block mr-2" />
                                                Change Username
                                            </button>
                                        )}

                                        {isChangingPassword ? (
                                            <div className="px-4 py-2">
                                                <input
                                                    type="password"
                                                    className="w-full px-2 py-1 mb-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                                                    placeholder="Current password"
                                                    value={formData.currentPassword}
                                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                />
                                                <input
                                                    type="password"
                                                    className="w-full px-2 py-1 mb-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                                                    placeholder="New password"
                                                    value={formData.newPassword}
                                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                />
                                                <input
                                                    type="password"
                                                    className="w-full px-2 py-1 mb-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                                                    placeholder="Confirm new password"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                />
                                                <div className="flex mt-2 space-x-2">
                                                    <button
                                                        onClick={() => handleUpdateProfile('password')}
                                                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setIsChangingPassword(false)}
                                                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsChangingPassword(true)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                                            >
                                                <FaKey className="inline-block mr-2" />
                                                Change Password
                                            </button>
                                        )}

                                        <div className="border-t border-gray-700"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                                        >
                                            <FaSignOutAlt className="inline-block mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsOpen(!isOpen)}
                                className={`p-2 rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} hover:bg-white/10 transition-colors`}
                            >
                                {isOpen ? (
                                    <FaTimes className="h-6 w-6" />
                                ) : (
                                    <FaBars className="h-6 w-6" />
                                )}
                            </motion.button>
                        </div>

                        <div className="flex items-center">
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-full ${isDarkMode ? 'text-yellow-400' : 'text-gray-700'}`}
                                aria-label="Toggle theme"
                            >
                                {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`md:hidden glass-nav border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}
                        >
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {features
                                    .filter(item => item.show)
                                    .map(feature => {
                                        const Icon = feature.icon;
                                        const isActive = location.pathname === feature.path;
                                        
                                        return (
                                            <Link
                                                key={feature.path}
                                                to={feature.path}
                                                className={`
                                                    flex items-center px-4 py-3 rounded-lg
                                                    text-base font-medium transition-all duration-300
                                                    ${isActive 
                                                        ? isDarkMode
                                                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/50'
                                                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                        : isDarkMode 
                                                            ? 'text-gray-300 hover:text-white hover:bg-white/5' 
                                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                                    }
                                                `}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-500' : ''}`} />
                                                {feature.name}
                                            </Link>
                                        );
                                    })}

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center px-4 py-3 rounded-lg
                                             text-base font-medium
                                             ${isDarkMode 
                                                ? 'text-gray-300 hover:text-white hover:bg-white/5' 
                                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                             }
                                             transition-all duration-300`}
                                >
                                    <FaSignOutAlt className="mr-3 h-5 w-5" />
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            {/* Spacer for fixed navbar */}
            <div className="h-16"></div>
        </>
    );
};

export default Navbar; 