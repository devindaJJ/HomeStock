import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaBell, FaRegCalendarAlt, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/cards.css';

// Create API service with authentication token
const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true
});

// Add request interceptor to include token in every request
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

const Reminders = ({ isDarkMode }) => {
    const navigate = useNavigate();
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        reminder_text: '',
        due_date: '',
        priority: 'medium'
    });
    const [userData, setUserData] = useState(null);

    // Get user data on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.user_id) {
                setUserData(user);
            } else {
                toast.error('User data not found');
            }
        } else {
            toast.error('Please log in to continue');
        }
    }, []);

    // Fetch reminders from backend
    const fetchReminders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reminders');
            setReminders(response.data);
        } catch (error) {
            console.error('Error fetching reminders:', error);
            toast.error('Failed to load reminders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form data
        const submissionData = {
            ...formData,
            priority: formData.priority || 'medium', // Ensure priority has a default value
            user_id: userData?.user_id // Include user_id here
            
        };
        console.log('Submitting data:', submissionData);

        try {
            if (editingReminder) {
                await api.put(`/reminders/${editingReminder.reminder_id}`, submissionData);
                toast.success('Reminder updated successfully');
            } else {
                await api.post('/reminders', submissionData);
                toast.success('Reminder added successfully');
            }
            setShowAddModal(false);
            setEditingReminder(null);
            setFormData({
                title: '',
                reminder_text: '',
                due_date: '',
                priority: 'medium'
            });
            fetchReminders();
        } catch (error) {
            console.error('Error saving reminder:', error.response?.data || error.message);
            toast.error('Failed to save reminder');
        }
    };

    const handleDelete = async (reminder_id) => {
        if (window.confirm('Are you sure you want to delete this reminder?')) {
            try {
                await api.delete(`/reminders/${reminder_id}`);
                toast.success('Reminder deleted successfully');
                fetchReminders();
            } catch (error) {
                console.error('Error deleting reminder:', error);
                toast.error('Failed to delete reminder');
            }
        }
    };

    const handleEdit = (reminder) => {
        setEditingReminder(reminder);
        setFormData({

            title: reminder.title,
            reminder_text: reminder.reminder_text || reminder.description || '', // fallback
            due_date: reminder.due_date,
            priority: reminder.priority
        });
        setShowAddModal(true);
    };

    const getPriorityColor = (priority) => {
        const normalizedPriority = priority?.toLowerCase();
        
        switch (normalizedPriority) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-[#09090B]' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`theme-card ${isDarkMode ? 'dark' : 'light'}`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Reminders
                            </h1>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center`}
                            >
                                <FaPlus className="mr-2" />
                                Add Reminder
                            </button>
                        </div>

                        {/* Reminders Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reminders.map((reminder) => (
                                <div
                                    key={reminder.reminder_id}
                                    className={`theme-card ${isDarkMode ? 'dark' : 'light'} p-4`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {reminder.title}
                                            </h3>
                                            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {reminder.description}
                                            </p>
                                            <div className="mt-2 flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(reminder.priority)}`}>
                                                    {reminder.priority}
                                                </span>
                                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Due: {new Date(reminder.due_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(reminder)}
                                                className={`theme-button-secondary ${isDarkMode ? 'dark' : 'light'} p-2 rounded-lg`}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(reminder.reminder_id)}
                                                className="text-red-600 hover:text-red-800 p-2 rounded-lg"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className={`theme-card ${isDarkMode ? 'dark' : 'light'} max-w-md w-full p-6`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Title*
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1`}
                                    required
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Description
                                </label>
                                <textarea
                                    value={formData.reminder_text}
                                    onChange={(e) => setFormData({ ...formData, reminder_text: e.target.value })}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1`}
                                    rows="3"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Due Date*
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Priority*
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1`}
                                        required
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingReminder(null);
                                    }}
                                    className={`theme-button-secondary ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg`}
                                >
                                    {editingReminder ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reminders;
