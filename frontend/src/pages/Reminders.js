import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaBell, FaRegCalendarAlt, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UserProfileCorner from '../components/UserProfileCorner';

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

const Reminders = () => {
    const navigate = useNavigate();
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentReminder, setCurrentReminder] = useState(null);
    const [filter, setFilter] = useState('all');
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
            const mappedReminders = response.data.map(reminder => ({
                id: reminder.reminder_id,
                title: reminder.title,
                description: reminder.reminder_text,
                date: reminder.due_date,
                time: reminder.reminder_time,
                priority: reminder.priority,
                completed: reminder.is_completed
            }));
            setReminders(mappedReminders);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reminders:', error);
            toast.error('Failed to load reminders');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    // Create modal component
    const ReminderModal = ({ isOpen, onClose, onSubmit, title, submitText, initialData }) => {
        const [localFormData, setLocalFormData] = useState({
            title: '',
            description: '',
            date: '',
            time: '',
            completed: false
        });

        useEffect(() => {
            if (initialData) {
                setLocalFormData({
                    title: initialData.title || '',
                    description: initialData.description || '',
                    date: initialData.date || '',
                    time: initialData.time || '',
                    completed: initialData.completed || false
                });
            } else {
                setLocalFormData({
                    title: '',
                    description: '',
                    date: '',
                    time: '',
                    completed: false
                });
            }
        }, [initialData]);

        const handleLocalInputChange = (e) => {
            const { name, value } = e.target;
            setLocalFormData(prev => ({
                ...prev,
                [name]: value
            }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            onSubmit(localFormData);
        };

        if (!isOpen) return null;
        
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title*</label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    value={localFormData.title}
                                    onChange={handleLocalInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter reminder title"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    id="description"
                                    rows="4"
                                    value={localFormData.description}
                                    onChange={handleLocalInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter reminder description (optional)"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date*</label>
                                    <input
                                        type="date"
                                        name="date"
                                        id="date"
                                        value={localFormData.date}
                                        onChange={handleLocalInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        id="time"
                                        value={localFormData.time}
                                        onChange={handleLocalInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                                >
                                    {submitText}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    const handleAddReminder = async (formData) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.user_id) {
                toast.error('User not authenticated');
                return;
            }

            const reminderData = {
                title: formData.title,
                reminder_text: formData.description,
                due_date: formData.date,
                reminder_time: formData.time,
                user_id: user.user_id
            };

            const response = await api.post('/reminders', reminderData);
            if (response.status === 201) {
                toast.success('Reminder added successfully');
                setIsAddModalOpen(false);
                fetchReminders();
            }
        } catch (error) {
            console.error('Error adding reminder:', error);
            toast.error('Failed to add reminder');
        }
    };

    const handleUpdateReminder = async (formData) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.user_id) {
                toast.error('User not authenticated');
                return;
            }

            const reminderData = {
                title: formData.title,
                reminder_text: formData.description,
                due_date: formData.date,
                reminder_time: formData.time,
                user_id: user.user_id
            };

            const response = await api.put(`/reminders/${currentReminder.id}`, reminderData);
            if (response.status === 200) {
                toast.success('Reminder updated successfully');
                setIsEditModalOpen(false);
                fetchReminders();
            }
        } catch (error) {
            console.error('Error updating reminder:', error);
            toast.error('Failed to update reminder');
        }
    };

    const handleDeleteReminder = async (id) => {
        if (!id) {
            toast.error('Invalid reminder ID');
            return;
        }

        try {
            const response = await api.delete(`/reminders/${id}`);
            if (response.status === 200) {
                toast.success('Reminder deleted successfully');
                fetchReminders();
            }
        } catch (error) {
            console.error('Error deleting reminder:', error);
            toast.error('Failed to delete reminder');
        }
    };

    const handleToggleComplete = async (id) => {
        if (!id) {
            toast.error('Invalid reminder ID');
            return;
        }

        try {
            const reminder = reminders.find(r => r.id === id);
            if (!reminder) {
                toast.error('Reminder not found');
                return;
            }

            const response = await api.put(`/reminders/${id}`, {
                is_completed: !reminder.completed
            });

            if (response.status === 200) {
                toast.success('Reminder status updated');
                fetchReminders();
            }
        } catch (error) {
            console.error('Error updating reminder status:', error);
            toast.error('Failed to update reminder status');
        }
    };

    const handleEditClick = (reminder) => {
        setCurrentReminder(reminder);
        setIsEditModalOpen(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDateStatus = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'overdue';
        if (diffDays <= 3) return 'due-soon';
        return 'upcoming';
    };

    if (loading) {
        return (
            <>
                <Navbar userData={userData} />
                <UserProfileCorner userData={userData} />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar userData={userData} />
            <UserProfileCorner userData={userData} />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                                <div className="flex items-center mb-4 sm:mb-0">
                                    <FaBell className="h-8 w-8 text-indigo-600 mr-3" />
                                    <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <FaPlus className="mr-2" />
                                    Add Reminder
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            filter === 'all' 
                                                ? 'bg-indigo-100 text-indigo-700' 
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilter('active')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            filter === 'active' 
                                                ? 'bg-indigo-100 text-indigo-700' 
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => setFilter('completed')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            filter === 'completed' 
                                                ? 'bg-indigo-100 text-indigo-700' 
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Completed
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {reminders
                                    .filter(reminder => {
                                        if (filter === 'all') return true;
                                        if (filter === 'active') return !reminder.completed;
                                        if (filter === 'completed') return reminder.completed;
                                        return true;
                                    })
                                    .map(reminder => (
                                        <div
                                            key={reminder.id}
                                            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => handleToggleComplete(reminder.id)}
                                                            className={`mr-3 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                                reminder.completed
                                                                    ? 'border-green-500 bg-green-500'
                                                                    : 'border-gray-300'
                                                            }`}
                                                        >
                                                            {reminder.completed && <FaCheck className="w-3 h-3 text-white" />}
                                                        </button>
                                                        <h3 className={`text-lg font-medium ${
                                                            reminder.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                                                        }`}>
                                                            {reminder.title}
                                                        </h3>
                                                    </div>
                                                    {reminder.description && (
                                                        <p className="mt-2 text-gray-600">{reminder.description}</p>
                                                    )}
                                                    <div className="mt-3 flex items-center text-sm text-gray-500">
                                                        <FaRegCalendarAlt className="mr-2" />
                                                        <span>{formatDate(reminder.date)}</span>
                                                        {reminder.time && (
                                                            <span className="ml-2">{reminder.time}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(reminder)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <FaEdit className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReminder(reminder.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <FaTrash className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReminderModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddReminder}
                title="Add New Reminder"
                submitText="Add Reminder"
            />

            <ReminderModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateReminder}
                title="Edit Reminder"
                submitText="Update Reminder"
                initialData={currentReminder}
            />
        </>
    );
};

export default Reminders; 