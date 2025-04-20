import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaShoppingCart, FaCheck, FaUndo, FaSearch, FaSort, FaChevronDown, FaChevronUp } from 'react-icons/fa';
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
    
    const [formData, setFormData] = useState({
        name: '',
        quantity: 1,
        unit: 'pcs',
        category: 'groceries',
        priority: 'medium',
        notes: ''
    });

    const navigate = useNavigate();

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

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await api.get('/shopping-list');
            setShoppingList(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching shopping list:', error);
            toast.error('Failed to load shopping list');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            quantity: 1,
            unit: 'pcs',
            category: 'groceries',
            priority: 'medium',
            notes: ''
        });
        setEditingItem(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddItem = async () => {
        if (!formData.name.trim()) {
            toast.error('Item name is required');
            return;
        }

        try {
            const response = await api.post('/shopping-list', {
                ...formData,
                user_id: userData.user_id
            });
            
            setShoppingList([...shoppingList, response.data]);
            resetForm();
            setIsModalOpen(false);
            toast.success('Item added to shopping list');
        } catch (error) {
            console.error('Error adding item:', error);
            toast.error(error.response?.data?.message || 'Failed to add item');
        }
    };

    const handleUpdateItem = async () => {
        if (!editingItem) return;
        if (!formData.name.trim()) {
            toast.error('Item name is required');
            return;
        }

        try {
            const response = await api.put(`/shopping-list/${editingItem.id}`, formData);
            
            setShoppingList(shoppingList.map(item => 
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

    const handleDeleteItem = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/shopping-list/${id}`);
                setShoppingList(shoppingList.filter(item => item.id !== id));
                toast.success('Item removed from shopping list');
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.error('Failed to remove item');
            }
        }
    };

    const handleTogglePurchased = async (id) => {
        const item = shoppingList.find(i => i.id === id);
        if (!item) return;
        
        try {
            const response = await api.patch(`/shopping-list/${id}/toggle`, {
                purchased: !item.purchased
            });
            
            setShoppingList(shoppingList.map(item => 
                item.id === id ? response.data : item
            ));
            
            toast.success(`Item marked as ${!item.purchased ? 'purchased' : 'not purchased'}`);
        } catch (error) {
            console.error('Error toggling purchase status:', error);
            toast.error('Failed to update item status');
        }
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

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

    const sortedItems = [...shoppingList].sort((a, b) => {
        if (a.purchased !== b.purchased) {
            return a.purchased ? 1 : -1;
        }
        
        const priorityValues = { high: 0, medium: 1, low: 2 };
        return priorityValues[a.priority] - priorityValues[b.priority];
    });

    const getItemsByCategory = () => {
        const categories = {};
        
        sortedItems.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });
        
        return categories;
    };

    const groupedItems = getItemsByCategory();

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
                    <div className="flex justify-between items-center mb-6">
                        <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Shopping List
                        </h1>
                        <button
                            onClick={openAddModal}
                            className={`px-4 py-2 rounded-lg flex items-center ${isDarkMode ? 'bg-indigo-700 hover:bg-indigo-800 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                        >
                            <FaPlus className="mr-2" />
                            Add Item
                        </button>
                    </div>
                    
                    {Object.keys(groupedItems).length === 0 ? (
                        <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-500'}`}>
                            <p>
                                Your shopping list is empty. Start by adding items!
                            </p>
                            <button
                                onClick={openAddModal}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                                        <span className="mr-2">{categoryIcon[category] || '📦'}</span>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </h2>
                                    
                                    <div className="space-y-3">
                                        {categoryItems.map(item => (
                                            <div
                                                key={item.id}
                                                className={`p-4 rounded-lg border ${
                                                    item.purchased 
                                                        ? isDarkMode 
                                                            ? 'border-green-800 bg-green-900' 
                                                            : 'border-green-200 bg-green-50'
                                                        : item.priority === 'high' 
                                                            ? isDarkMode 
                                                                ? 'border-red-800 bg-red-900' 
                                                                : 'border-red-200 bg-red-50'
                                                            : item.priority === 'medium' 
                                                                ? isDarkMode 
                                                                    ? 'border-yellow-800 bg-yellow-900' 
                                                                    : 'border-yellow-200 bg-yellow-50'
                                                                : isDarkMode 
                                                                    ? 'border-blue-800 bg-blue-900' 
                                                                    : 'border-blue-200 bg-blue-50'
                                                }`}
                                            >
                                                <div className="flex items-start">
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
                                                        >
                                                            {item.purchased && (
                                                                <FaCheck className="h-3 w-3 text-white" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    
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
                                                                    {item.notes && ` - ${item.notes}`}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => openEditModal(item)}
                                                                    className={`p-2 rounded-lg ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                                                                >
                                                                    <FaEdit className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                    className="p-2 rounded-lg text-red-600 hover:text-red-800"
                                                                >
                                                                    <FaTrash className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
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
                                            </div>
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
                    <div className={`rounded-lg shadow-xl w-full max-w-lg p-6 ${isDarkMode ? 'bg-[#18181B] text-gray-100' : 'bg-white text-gray-900'}`}>
                        <h3 className="text-lg font-medium mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                        <form onSubmit={e => {
                            e.preventDefault();
                            editingItem ? handleUpdateItem() : handleAddItem();
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
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                    required
                                />
                            </div>
                            
                            {/* Quantity & Unit */}
                            <div className="mb-4 flex gap-4">
                                <div className="w-1/2">
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Unit
                                    </label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                            <div className="mb-4 flex gap-4">
                                <div className="w-1/2">
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                                <div className="w-1/2">
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Priority
                                    </label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                                    rows="2"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${isDarkMode ? 'bg-[#27272A] text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                />
                            </div>
                            
                            {/* Actions */}
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                    className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 rounded ${isDarkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'} text-white transition`}
                                >
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShoppingList;