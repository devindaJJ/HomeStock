import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaShoppingCart, FaCheck, FaUndo, FaSearch, FaSort, FaChevronDown, FaChevronUp } from 'react-icons/fa';
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

const ShoppingList = () => {
    const [shoppingList, setShoppingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('item_name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        item_name: '',
        quantity: 1,
        category: 'Grocery',
        priority: 'Medium',
        notes: ''
    });

    const navigate = useNavigate();

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

    // Fetch shopping list items from backend
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
            
            // For development - if API fails, use mock data
            if (process.env.NODE_ENV === 'development') {
                const mockItems = [
                    { id: 1, name: 'Milk', quantity: 2, unit: 'liters', category: 'dairy', priority: 'high', purchased: false, notes: 'Whole milk' },
                    { id: 2, name: 'Bread', quantity: 1, unit: 'loaf', category: 'bakery', priority: 'medium', purchased: false, notes: 'Whole wheat' },
                    { id: 3, name: 'Eggs', quantity: 12, unit: 'pcs', category: 'dairy', priority: 'low', purchased: true, notes: 'Free range' },
                    { id: 4, name: 'Chicken', quantity: 1, unit: 'kg', category: 'meat', priority: 'medium', purchased: false, notes: 'Skinless' },
                ];
                setShoppingList(mockItems);
            }
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setFormData({
            item_name: '',
            quantity: 1,
            category: 'Grocery',
            priority: 'Medium',
            notes: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleAddItem = async () => {
        if (!formData.item_name.trim()) {
            toast.error('Item name is required');
            return;
        }

        try {
            // Send data to backend
            const response = await api.post('/shopping-list', formData);
            
            // Update local state with new item from backend
            setShoppingList([...shoppingList, response.data]);
            
            // Reset form and close modal
            resetForm();
            setIsAddModalOpen(false);
            toast.success('Item added to shopping list');
        } catch (error) {
            console.error('Error adding item:', error);
            toast.error('Failed to add item to shopping list');
            
            // For development - if API fails, add locally
            if (process.env.NODE_ENV === 'development') {
                const newItem = {
                    id: shoppingList.length ? Math.max(...shoppingList.map(item => item.id)) + 1 : 1,
                    ...formData
                };
                setShoppingList([...shoppingList, newItem]);
                resetForm();
                setIsAddModalOpen(false);
                toast.success('Item added to shopping list (dev mode)');
            }
        }
    };

    const handleUpdateItem = async (item) => {
        if (!formData.item_name.trim()) {
            toast.error('Item name is required');
            return;
        }

        try {
            // Send update to backend
            const response = await api.put(`/shopping-list/${item.id}`, formData);
            
            // Update local state with updated item from backend
            setShoppingList(shoppingList.map(i => 
                i.id === item.id ? response.data : i
            ));
            
            // Reset form and close modal
            resetForm();
            setIsAddModalOpen(false);
            toast.success('Item updated successfully');
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error('Failed to update item');
            
            // For development - if API fails, update locally
            if (process.env.NODE_ENV === 'development') {
                setShoppingList(shoppingList.map(i => 
                    i.id === item.id ? { ...i, ...formData } : i
                ));
                resetForm();
                setIsAddModalOpen(false);
                toast.success('Item updated (dev mode)');
            }
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            // Send delete request to backend
            await api.delete(`/shopping-list/${id}`);
            
            // Update local state by filtering out the deleted item
            setShoppingList(shoppingList.filter(item => item.id !== id));
            toast.success('Item removed from shopping list');
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to remove item from shopping list');
            
            // For development - if API fails, delete locally
            if (process.env.NODE_ENV === 'development') {
                setShoppingList(shoppingList.filter(item => item.id !== id));
                toast.success('Item removed from shopping list (dev mode)');
            }
        }
    };

    const handleTogglePurchased = async (id) => {
        const item = shoppingList.find(i => i.id === id);
        if (!item) return;
        
        const updatedPurchasedStatus = !item.purchased;
        
        try {
            // Send toggle request to backend
            const response = await api.patch(`/shopping-list/${id}/toggle`, {
                purchased: updatedPurchasedStatus
            });
            
            // Update local state with the toggled item from backend
            setShoppingList(shoppingList.map(item => 
                item.id === id ? response.data : item
            ));
            
            toast.success(`Item marked as ${updatedPurchasedStatus ? 'purchased' : 'not purchased'}`);
        } catch (error) {
            console.error('Error toggling item purchase status:', error);
            toast.error('Failed to update item status');
            
            // For development - if API fails, toggle locally
            if (process.env.NODE_ENV === 'development') {
                setShoppingList(shoppingList.map(item => 
                    item.id === id ? { ...item, purchased: updatedPurchasedStatus } : item
                ));
                toast.success(`Item marked as ${updatedPurchasedStatus ? 'purchased' : 'not purchased'} (dev mode)`);
            }
        }
    };

    const handleEditClick = (item) => {
        setFormData({
            item_name: item.name,
            quantity: item.quantity,
            category: item.category,
            priority: item.priority,
            notes: item.notes || ''
        });
        setIsAddModalOpen(true);
    };

    // Filter and sort items
    const sortedItems = [...shoppingList].sort((a, b) => {
        // First by purchase status
        if (a.purchased !== b.purchased) {
            return a.purchased ? 1 : -1;
        }
        
        // Then by priority
        const priorityValues = { high: 0, medium: 1, low: 2 };
        return priorityValues[a.priority] - priorityValues[b.priority];
    });

    // Group items by category
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
        groceries: '🛒',
        dairy: '🥛',
        bakery: '🍞',
        meat: '🥩',
        produce: '🥦',
        household: '🧹',
        frozen: '❄️',
        canned: '🥫',
        snacks: '🍪',
        beverages: '🥤',
        other: '📦'
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
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                                <div className="flex items-center mb-4 sm:mb-0">
                                    <FaShoppingCart className="h-8 w-8 text-indigo-600 mr-3" />
                                    <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setIsAddModalOpen(true);
                                    }}
                                    className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 shadow-sm"
                                >
                                    <FaPlus className="mr-2" />
                                    Add Item
                                </button>
                            </div>
                            
                            {/* Items List */}
                            {Object.keys(groupedItems).length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">
                                        Your shopping list is empty. Start by adding items!
                                    </p>
                                    <button
                                        onClick={() => {
                                            resetForm();
                                            setIsAddModalOpen(true);
                                        }}
                                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <FaPlus className="mr-2" />
                                        Add Your First Item
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {Object.entries(groupedItems).map(([category, categoryItems]) => (
                                        <div key={category} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <span className="mr-2">{categoryIcon[category] || '📦'}</span>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </h2>
                                            
                                            <div className="space-y-3">
                                                {categoryItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className={`p-4 rounded-lg border ${
                                                            item.purchased 
                                                                ? 'border-green-200 bg-green-50' 
                                                                : item.priority === 'high' 
                                                                    ? 'border-red-200 bg-red-50' 
                                                                    : item.priority === 'medium' 
                                                                        ? 'border-yellow-200 bg-yellow-50' 
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
                                                                            item.purchased ? 'text-gray-500 line-through' : 'text-gray-900'
                                                                        }`}>
                                                                            {item.name}
                                                                        </h3>
                                                                        <p className={`text-sm ${
                                                                            item.purchased ? 'text-gray-400' : 'text-gray-600'
                                                                        }`}>
                                                                            {item.quantity} {item.unit}
                                                                            {item.notes && ` - ${item.notes}`}
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            onClick={() => handleEditClick(item)}
                                                                            className="text-indigo-600 hover:text-indigo-900"
                                                                        >
                                                                            <FaEdit className="h-4 w-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteItem(item.id)}
                                                                            className="text-red-600 hover:text-red-900"
                                                                        >
                                                                            <FaTrash className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                
                                                                {item.purchased && (
                                                                    <div className="mt-2">
                                                                        <button
                                                                            onClick={() => handleTogglePurchased(item.id)}
                                                                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
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
                </div>
                
                {/* Add/Edit Item Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            
                            <div 
                                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                {formData.item_name ? 'Edit Item' : 'Add New Item'}
                                            </h3>
                                            <div className="mt-2 space-y-4">
                                                <div>
                                                    <label htmlFor="item_name" className="block text-sm font-medium text-gray-700">Item Name*</label>
                                                    <input
                                                        type="text"
                                                        name="item_name"
                                                        id="item_name"
                                                        value={formData.item_name}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                                                        <input
                                                            type="number"
                                                            name="quantity"
                                                            id="quantity"
                                                            min="1"
                                                            value={formData.quantity}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                                                        <select
                                                            name="unit"
                                                            id="unit"
                                                            value={formData.unit}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                                        <select
                                                            name="category"
                                                            id="category"
                                                            value={formData.category}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                                                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                                                        <select
                                                            name="priority"
                                                            id="priority"
                                                            value={formData.priority}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        >
                                                            <option value="low">Low</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="high">High</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                                                    <textarea
                                                        name="notes"
                                                        id="notes"
                                                        rows="2"
                                                        value={formData.notes}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={formData.item_name ? () => handleUpdateItem(formData) : handleAddItem}
                                    >
                                        {formData.item_name ? 'Update Item' : 'Add Item'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => {
                                            setIsAddModalOpen(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ShoppingList; 