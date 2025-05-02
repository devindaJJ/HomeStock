import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaDownload, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/cards.css';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true
});

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

const Reminders = ({ isDarkMode }) => {
    const [reminders, setReminders] = useState([]);
    const [filteredReminders, setFilteredReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        reminder_text: '',
        due_date: '',
        priority: 'medium'
    });
    const [formErrors, setFormErrors] = useState({
        title: '',
        reminder_text: '',
        due_date: '',
        priority: ''
    });
    const [userData, setUserData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const today = new Date().toISOString().split('T')[0];

    // Function to filter reminders based on search term
    const filterReminders = useCallback((term, remindersList) => {
        if (!term) {
            return remindersList;
        }

        const lowerCaseTerm = term.toLowerCase();
        return remindersList.filter(reminder => {
            const title = reminder.title || '';
            const description = reminder.reminder_text || reminder.description || '';
            const priority = reminder.priority || '';
            const dueDate = reminder.due_date || '';

            return (
                title.toLowerCase().includes(lowerCaseTerm) ||
                description.toLowerCase().includes(lowerCaseTerm) ||
                priority.toLowerCase().includes(lowerCaseTerm) ||
                dueDate.includes(term) ||
                new Date(dueDate).toLocaleDateString().includes(term)
            );
        });
    }, []);

    // Update filtered reminders when search term or reminders change
    useEffect(() => {
        setFilteredReminders(filterReminders(searchTerm, reminders));
    }, [searchTerm, reminders, filterReminders]);

    // Function to download reminders as CSV
    const downloadCSV = useCallback(() => {
        const dataToExport = searchTerm ? filteredReminders : reminders;
        
        if (dataToExport.length === 0) {
            toast.warning('No reminders to download');
            return;
        }

        const headers = ['Title', 'Description', 'Due Date', 'Priority'];
        
        const csvRows = [
            headers.join(','),
            ...dataToExport.map(reminder => [
                `"${(reminder.title || '').replace(/"/g, '""')}"`,
                `"${((reminder.reminder_text || reminder.description || '')).replace(/"/g, '""')}"`,
                `"${reminder.due_date || ''}"`,
                `"${reminder.priority || ''}"`
            ].join(','))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reminders_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Reminders downloaded as CSV');
    }, [searchTerm, filteredReminders, reminders]);

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

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (!formData.title.trim()) {
            errors.title = 'Title is required';
            isValid = false;
        } else if (formData.title.length > 100) {
            errors.title = 'Title cannot exceed 100 characters';
            isValid = false;
        }

        if (formData.reminder_text.length > 500) {
            errors.reminder_text = 'Description cannot exceed 500 characters';
            isValid = false;
        }

        if (!formData.due_date) {
            errors.due_date = 'Due date is required';
            isValid = false;
        } else if (new Date(formData.due_date) < new Date(today)) {
            errors.due_date = 'Due date cannot be in the past';
            isValid = false;
        } else if (new Date(formData.due_date) > new Date('2100-12-31')) {
            errors.due_date = 'Due date cannot be too far in the future';
            isValid = false;
        }

        if (!['low', 'medium', 'high'].includes(formData.priority)) {
            errors.priority = 'Invalid priority level';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        const submissionData = {
            ...formData,
            priority: formData.priority || 'medium',
            user_id: userData?.user_id
        };

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
            setFormErrors({
                title: '',
                reminder_text: '',
                due_date: '',
                priority: ''
            });
            fetchReminders();
        } catch (error) {
            console.error('Error saving reminder:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Failed to save reminder';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (reminder_id) => {
        if (window.confirm('Are you sure you want to delete this reminder? This action cannot be undone.')) {
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
            reminder_text: reminder.reminder_text || reminder.description || '',
            due_date: reminder.due_date,
            priority: reminder.priority
        });
        setFormErrors({
            title: '',
            reminder_text: '',
            due_date: '',
            priority: ''
        });
        setShowAddModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
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
        <div className={`min-h-screen py-8 px-4 ${isDarkMode ? 'bg-[#09090B]' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`theme-card ${isDarkMode ? 'dark' : 'light'} p-6`}>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Reminders
                        </h1>
                        <div className="flex space-x-2">
                            <button
                                onClick={downloadCSV}
                                className={`theme-button-secondary ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center`}
                                title="Download as CSV"
                            >
                                <FaDownload className="mr-2" />
                                Export
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddModal(true);
                                    setFormErrors({
                                        title: '',
                                        reminder_text: '',
                                        due_date: '',
                                        priority: ''
                                    });
                                }}
                                className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center`}
                            >
                                <FaPlus className="mr-2" />
                                Add Reminder
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className={`relative ${isDarkMode ? 'text-gray-200' : 'text-gray-600'} focus-within:text-gray-400`}>
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                                <FaSearch className="h-5 w-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search reminders by title, description, priority, or date..."
                                className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full py-2 pl-10 pr-4 rounded-lg`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        {searchTerm && (
                            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Showing {filteredReminders.length} {filteredReminders.length === 1 ? 'result' : 'results'}
                            </p>
                        )}
                    </div>

                    {filteredReminders.length === 0 ? (
                        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {searchTerm ? (
                                <p>No reminders found matching your search.</p>
                            ) : (
                                <p>No reminders found. Add your first reminder!</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredReminders.map((reminder) => (
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
                                                aria-label="Edit reminder"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(reminder.reminder_id)}
                                                className="text-red-600 hover:text-red-800 p-2 rounded-lg"
                                                aria-label="Delete reminder"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1 ${formErrors.title ? 'border-red-500' : ''}`}
                                    required
                                    maxLength={100}
                                />
                                {formErrors.title && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Description
                                </label>
                                <textarea
                                    name="reminder_text"
                                    value={formData.reminder_text}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1 ${formErrors.reminder_text ? 'border-red-500' : ''}`}
                                    rows="3"
                                    maxLength={500}
                                />
                                {formErrors.reminder_text && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.reminder_text}</p>
                                )}
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {formData.reminder_text.length}/500 characters
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Due Date*
                                    </label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        value={formData.due_date}
                                        min={today}
                                        onChange={handleInputChange}
                                        className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1 ${formErrors.due_date ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {formErrors.due_date && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.due_date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Priority*
                                    </label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1 ${formErrors.priority ? 'border-red-500' : ''}`}
                                        required
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    {formErrors.priority && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.priority}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingReminder(null);
                                        setFormErrors({
                                            title: '',
                                            reminder_text: '',
                                            due_date: '',
                                            priority: ''
                                        });
                                    }}
                                    className={`theme-button-secondary ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg`}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center justify-center`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : null}
                                    {editingReminder ? (isSubmitting ? 'Updating...' : 'Update') : (isSubmitting ? 'Adding...' : 'Add')}
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