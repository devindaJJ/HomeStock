import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaShoppingCart, FaCheck, FaUndo, FaSearch, FaFileExport } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    error => {
        return Promise.reject(error);
    }
);

const ShoppingList = ({ isDarkMode = false }) => {
    const [shoppingList, setShoppingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [userData, setUserData] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    
    const [formData, setFormData] = useState({
        name: '',
        quantity: 1,
        unit: 'pcs',
        category: 'groceries',
        priority: 'medium',
        notes: ''
    });

    const navigate = useNavigate();

    // Validate form function
    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Item name is required';
        } else if (formData.name.length > 100) {
            errors.name = 'Item name must be less than 100 characters';
        }
        
        if (formData.quantity <= 0) {
            errors.quantity = 'Quantity must be greater than 0';
        } else if (formData.quantity > 999) {
            errors.quantity = 'Quantity must be less than 1000';
        }
        
        if (formData.notes.length > 500) {
            errors.notes = 'Notes must be less than 500 characters';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Fetch user data on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please log in to continue');
            navigate('/login');
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.user_id) {
                setUserData(user);
            } else {
                toast.error('User data not found');
                navigate('/login');
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            toast.error('Invalid user data');
            navigate('/login');
        }
    }, [navigate]);

    // Fetch shopping list items
    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/shopping-list');
            setShoppingList(response.data);
        } catch (error) {
            console.error('Error fetching shopping list:', error);
            toast.error(error.response?.data?.message || 'Failed to load shopping list');
            setShoppingList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userData) {
            fetchItems();
        }
    }, [userData, fetchItems]);

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            name: '',
            quantity: 1,
            unit: 'pcs',
            category: 'groceries',
            priority: 'medium',
            notes: ''
        });
        setFormErrors({});
        setEditingItem(null);
    };

    // Handle input changes with validation
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;
        
        // Validate quantity as number
        if (name === 'quantity') {
            processedValue = Math.max(1, Math.min(999, Number(value) || 1));
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
        
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Add new item to shopping list
    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await api.post('/shopping-list', {
                ...formData,
                user_id: userData.user_id
            });
            
            setShoppingList(prev => [...prev, response.data]);
            resetForm();
            setIsModalOpen(false);
            toast.success('Item added to shopping list');
        } catch (error) {
            console.error('Error adding item:', error);
            toast.error(error.response?.data?.message || 'Failed to add item');
        }
    };

    // Update existing item
    const handleUpdateItem = async (e) => {
        e.preventDefault();
        if (!editingItem || !validateForm()) return;

        try {
            const response = await api.put(`/shopping-list/${editingItem.id}`, formData);
            
            setShoppingList(prev => prev.map(item => 
                item.id === editingItem.id ? response.data : item
            ));
            
            resetForm();
            setIsModalOpen(false);
            toast.success('Item updated successfully');
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error(error.response?.data?.message || 'Failed to update item');
        }
    };

    // Delete item from shopping list
    const handleDeleteItem = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/shopping-list/${id}`);
                setShoppingList(prev => prev.filter(item => item.id !== id));
                toast.success('Item removed from shopping list');
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.error(error.response?.data?.message || 'Failed to remove item');
            }
        }
    };

    // Toggle purchased status
    const handleTogglePurchased = async (id) => {
        const item = shoppingList.find(i => i.id === id);
        if (!item) return;
        
        try {
            const response = await api.patch(`/shopping-list/${id}/toggle`, {
                purchased: !item.purchased
            });
            
            setShoppingList(prev => prev.map(item => 
                item.id === id ? response.data : item
            ));
            
            toast.success(`Item marked as ${!item.purchased ? 'purchased' : 'not purchased'}`);
        } catch (error) {
            console.error('Error toggling purchase status:', error);
            toast.error(error.response?.data?.message || 'Failed to update item status');
        }
    };

    // Open modal for adding new item
    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    // Open modal for editing existing item
    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit || 'pcs',
            category: item.category || 'groceries',
            priority: item.priority || 'medium',
            notes: item.notes || ''
        });
        setIsModalOpen(true);
    };

    // Export shopping list to CSV
    const exportToCSV = () => {
        if (shoppingList.length === 0) {
            toast.warning('No items to export');
            return;
        }

        const headers = ['Name', 'Quantity', 'Unit', 'Category', 'Priority', 'Notes', 'Purchased'];
        
        const csvRows = [
            headers.join(','),
            ...shoppingList.map(item => [
                `"${(item.name || '').replace(/"/g, '""')}"`,
                item.quantity,
                `"${item.unit}"`,
                `"${item.category}"`,
                `"${item.priority}"`,
                `"${(item.notes || '').replace(/"/g, '""')}"`,
                item.purchased ? 'Yes' : 'No'
            ].join(','))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `shopping_list_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Shopping list exported successfully');
    };

    // Filter items based on search term
    const filteredItems = shoppingList.filter(item => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            item.name.toLowerCase().includes(searchLower) ||
            (item.notes && item.notes.toLowerCase().includes(searchLower)) ||
            item.category.toLowerCase().includes(searchLower) ||
            item.priority.toLowerCase().includes(searchLower)
        );
    });

    // Sort items by purchased status and priority
    const sortedItems = [...filteredItems].sort((a, b) => {
        if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
        const priorityValues = { high: 0, medium: 1, low: 2 };
        return priorityValues[a.priority] - priorityValues[b.priority];
    });

    // Group items by category
    const groupedItems = sortedItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    // Category icons mapping
    const categoryIcon = {
        groceries: '',
        dairy: '',
        bakery: '',
        meat: '',
        produce: '',
        household: '',
        frozen: '',
        canned: '',
        snacks: '',
        beverages: '',
        other: ''
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
        <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-[#09090B] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Shopping List
                        </h1>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {/* Search Bar */}
                            <div className={`relative ${isDarkMode ? 'text-gray-200' : 'text-gray-600'} w-full sm:w-64`}>
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaSearch className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    className={`w-full pl-10 pr-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white border border-gray-300'}`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={exportToCSV}
                                    className={`px-3 py-2 rounded-lg flex items-center ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} whitespace-nowrap`}
                                    title="Export to CSV"
                                >
                                    <FaFileExport className="mr-2" />
                                    Export
                                </button>
                                <button
                                    onClick={openAddModal}
                                    className={`px-4 py-2 rounded-lg flex items-center ${isDarkMode ? 'bg-indigo-700 hover:bg-indigo-800 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} whitespace-nowrap`}
                                >
                                    <FaPlus className="mr-2" />
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Empty State */}
                    {Object.keys(groupedItems).length === 0 ? (
                        <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-500'}`}>
                            <p className="mb-4">
                                {searchTerm ? 'No items match your search.' : 'Your shopping list is empty.'}
                            </p>
                            <button
                                onClick={openAddModal}
                                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'} text-white inline-flex items-center`}
                            >
                                <FaPlus className="mr-2" />
                                Add Your First Item
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedItems).map(([category, categoryItems]) => (
                                <div key={category} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-6 last:border-0 last:pb-0`}>
                                    <h2 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        <span className="mr-2">{categoryIcon[category] || ''}</span>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </h2>
                                    
                                    <div className="space-y-3">
                                        {categoryItems.map(item => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className={`p-4 rounded-lg border ${
                                                    item.purchased 
                                                        ? isDarkMode 
                                                            ? 'border-green-800 bg-green-900/30' 
                                                            : 'border-green-200 bg-green-50'
                                                        : item.priority === 'high' 
                                                            ? isDarkMode 
                                                                ? 'border-red-800 bg-red-900/30' 
                                                                : 'border-red-200 bg-red-50'
                                                            : item.priority === 'medium' 
                                                                ? isDarkMode 
                                                                    ? 'border-yellow-800 bg-yellow-900/30' 
                                                                    : 'border-yellow-200 bg-yellow-50'
                                                                : isDarkMode 
                                                                    ? 'border-blue-800 bg-blue-900/30' 
                                                                    : 'border-blue-200 bg-blue-50'
                                                }`}
                                            >
                                                <div className="flex items-start">
                                                    {/* Checkbox */}
                                                    <div className="flex-shrink-0 pt-0.5">
                                                        <button
                                                            onClick={() => handleTogglePurchased(item.id)}
                                                            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                                                                item.purchased 
                                                                    ? 'border-green-600 bg-green-600' 
                                                                    : item.priority === 'high' 
                                                                        ? 'border-red-500' 
                                                                        : item.priority === 'medium' 
                                                                            ? 'border-yellow-500' 
                                                                            : 'border-blue-500'
                                                            }`}
                                                            aria-label={item.purchased ? 'Mark as not purchased' : 'Mark as purchased'}
                                                        >
                                                            {item.purchased && (
                                                                <FaCheck className="h-3 w-3 text-white" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Item Details */}
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className={`text-lg font-semibold ${
                                                                    item.purchased 
                                                                        ? isDarkMode 
                                                                            ? 'text-gray-400 line-through' 
                                                                            : 'text-gray-500 line-through'
                                                                        : isDarkMode 
                                                                            ? 'text-white' 
                                                                            : 'text-gray-900'
                                                                }`}>
                                                                    {item.name}
                                                                </h3>
                                                                <p className={`text-sm ${
                                                                    item.purchased 
                                                                        ? isDarkMode 
                                                                            ? 'text-gray-500' 
                                                                            : 'text-gray-400'
                                                                        : isDarkMode 
                                                                            ? 'text-gray-300' 
                                                                            : 'text-gray-600'
                                                                }`}>
                                                                    {item.quantity} {item.unit}
                                                                    {item.notes && ` • ${item.notes}`}
                                                                </p>
                                                            </div>
                                                            
                                                            {/* Action Buttons */}
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => openEditModal(item)}
                                                                    className={`p-2 rounded-lg ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                                                                    aria-label="Edit item"
                                                                >
                                                                    <FaEdit className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                    className="p-2 rounded-lg text-red-600 hover:text-red-800"
                                                                    aria-label="Delete item"
                                                                >
                                                                    <FaTrash className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Undo Button for Purchased Items */}
                                                        {item.purchased && (
                                                            <div className="mt-2">
                                                                <button
                                                                    onClick={() => handleTogglePurchased(item.id)}
                                                                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${isDarkMode ? 'text-gray-300 bg-gray-600 hover:bg-gray-500' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                                                                >
                                                                    <FaUndo className="mr-1 h-3 w-3" />
                                                                    Mark as needed
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Add/Edit Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-lg shadow-xl w-full max-w-lg mx-4 ${isDarkMode ? 'bg-[#18181B] text-gray-100' : 'bg-white text-gray-900'}`}
                    >
                        <div className="p-6">
                            <h3 className="text-lg font-medium mb-4">
                                {editingItem ? 'Edit Item' : 'Add New Item'}
                            </h3>
                            
                            <form onSubmit={e => {
                                e.preventDefault();
                                editingItem ? handleUpdateItem(e) : handleAddItem(e);
                            }}>
                                {/* Item Name */}
                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Item Name*
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border ${formErrors.name ? 'border-red-500' : ''} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        required
                                    />
                                    {formErrors.name && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                                    )}
                                </div>
                                
                                {/* Quantity & Unit */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Quantity*
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            min="1"
                                            max="999"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border ${formErrors.quantity ? 'border-red-500' : ''} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        />
                                        {formErrors.quantity && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Unit*
                                        </label>
                                        <select
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        >
                                            <option value="pcs">pcs</option>
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="l">liter</option>
                                            <option value="ml">ml</option>
                                            <option value="box">box</option>
                                            <option value="pack">pack</option>
                                            <option value="bottle">bottle</option>
                                            <option value="can">can</option>
                                            <option value="jar">jar</option>
                                            <option value="loaf">loaf</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Category & Priority */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Category*
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        >
                                            <option value="groceries">Groceries</option>
                                            <option value="dairy">Dairy</option>
                                            <option value="bakery">Bakery</option>
                                            <option value="meat">Meat</option>
                                            <option value="produce">Produce</option>
                                            <option value="household">Household</option>
                                            <option value="frozen">Frozen</option>
                                            <option value="canned">Canned</option>
                                            <option value="snacks">Snacks</option>
                                            <option value="beverages">Beverages</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Priority*
                                        </label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Notes */}
                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        rows="3"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border ${formErrors.notes ? 'border-red-500' : ''} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    />
                                    {formErrors.notes && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.notes}</p>
                                    )}
                                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formData.notes.length}/500 characters
                                    </p>
                                </div>
                                
                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            resetForm();
                                        }}
                                        className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'} text-white transition-colors flex items-center justify-center`}
                                    >
                                        {editingItem ? (
                                            <>
                                                <FaEdit className="mr-2" />
                                                Update Item
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus className="mr-2" />
                                                Add Item
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ShoppingList;