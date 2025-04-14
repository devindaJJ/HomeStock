import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaSort, FaBox, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UserProfileCorner from '../components/UserProfileCorner';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('item_name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [categories] = useState(['Pantry', 'Refrigerator', 'Freezer', 'Household', 'Other']);
    const [locations] = useState(['Kitchen Pantry', 'Upper Cabinet', 'Lower Cabinet', 'Refrigerator', 'Freezer', 'Basement Storage', 'Garage Storage', 'Bathroom', 'Laundry Room', 'Other']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [userData, setUserData] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        item_name: '',
        quantity: 1,
        category: 'Pantry',
        location: 'Kitchen Pantry',
        expiry_date: '',
        purchase_date: '',
    });
    const [editingItem, setEditingItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    // Create axios instance with base URL and auth token
    const api = axios.create({
        baseURL: 'http://localhost:5000',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Add request interceptor to include token
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Add response interceptor to handle token errors
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
            return Promise.reject(error);
        }
    );

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

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/items');
            setInventory(response.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddItem = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData.user_id) {
                toast.error('User data not found');
                return;
            }

            // Validate required fields
            if (!formData.item_name || !formData.category || !formData.quantity || !formData.location) {
                toast.error('Please fill in all required fields');
                return;
            }

            // Format dates
            const formattedData = {
                ...formData,
                user_id: userData.user_id,
                quantity: parseInt(formData.quantity),
                purchase_date: formData.purchase_date ? new Date(formData.purchase_date).toISOString().split('T')[0] : null,
                expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString().split('T')[0] : null
            };

            await api.post('/api/items', formattedData);
            toast.success('Item added successfully');
            setIsAddModalOpen(false);
            setFormData({
                item_name: '',
                quantity: 1,
                category: 'Pantry',
                location: 'Kitchen Pantry',
                expiry_date: '',
                purchase_date: '',
            });
            fetchInventory();
        } catch (error) {
            console.error('Error adding item:', error);
            toast.error(error.response?.data?.error || 'Failed to add item');
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            await api.delete(`/api/items/${itemId}`);
            toast.success('Item deleted successfully');
            fetchInventory();
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error(error.response?.data?.error || 'Failed to delete item');
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchInventory();
            return;
        }

        try {
            setLoading(true);
            const response = await api.get(`/api/items/search?name=${searchTerm}`);
            setInventory(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error searching items:', error);
            toast.error('Failed to search items');
            setLoading(false);
        }
    };

    const handleUpdateItem = async () => {
        try {
            if (!editingItem) return;

            // Validate required fields
            if (!formData.item_name || !formData.category || !formData.quantity || !formData.location) {
                toast.error('Please fill in all required fields');
                return;
            }

            // Format dates
            const formattedData = {
                item_name: formData.item_name,
                category: formData.category,
                quantity: parseInt(formData.quantity),
                location: formData.location,
                purchase_date: formData.purchase_date ? new Date(formData.purchase_date).toISOString().split('T')[0] : null,
                expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString().split('T')[0] : null
            };

            await api.patch(`/api/items/${editingItem.item_id}`, formattedData);
            toast.success('Item updated successfully');
            setIsModalOpen(false);
            setEditingItem(null);
            fetchInventory();
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error(error.response?.data?.error || 'Failed to update item');
        }
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            item_name: item.item_name,
            category: item.category,
            quantity: item.quantity.toString(),
            location: item.location,
            purchase_date: item.purchase_date || '',
            expiry_date: item.expiry_date || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            item_name: '',
            quantity: 1,
            category: 'Pantry',
            location: 'Kitchen Pantry',
            expiry_date: '',
            purchase_date: '',
        });
    };

    // Filter and sort the inventory
    const filteredInventory = inventory
        .filter(item => {
            const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            let comparison = 0;
            if (a[sortField] < b[sortField]) {
                comparison = -1;
            } else if (a[sortField] > b[sortField]) {
                comparison = 1;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

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
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                                <div className="flex items-center mb-4 sm:mb-0">
                                    <FaBox className="h-8 w-8 text-indigo-600 mr-3" />
                                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                                </div>
                                
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <FaPlus className="mr-2" />
                                    Add Item
                                </button>
                            </div>
                            
                            {/* Filters */}
                            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search items..."
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="All">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Inventory Table */}
                            {filteredInventory.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">No items found matching your criteria.</p>
                                    {inventory.length > 0 && (
                                        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                                    )}
                                    {inventory.length === 0 && (
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <FaPlus className="mr-2" />
                                            Add Your First Item
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button 
                                                        className="group flex items-center space-x-1 focus:outline-none"
                                                        onClick={() => handleSort('item_name')}
                                                    >
                                                        <span>Item</span>
                                                        <span className="text-gray-400 group-hover:text-gray-500">
                                                            {sortField === 'item_name' && (
                                                                sortDirection === 'asc' ? <FaChevronUp className="h-3 w-3" /> : <FaChevronDown className="h-3 w-3" />
                                                            )}
                                                            {sortField !== 'item_name' && <FaSort className="h-3 w-3" />}
                                                        </span>
                                                    </button>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button 
                                                        className="group flex items-center space-x-1 focus:outline-none"
                                                        onClick={() => handleSort('quantity')}
                                                    >
                                                        <span>Quantity</span>
                                                        <span className="text-gray-400 group-hover:text-gray-500">
                                                            {sortField === 'quantity' && (
                                                                sortDirection === 'asc' ? <FaChevronUp className="h-3 w-3" /> : <FaChevronDown className="h-3 w-3" />
                                                            )}
                                                            {sortField !== 'quantity' && <FaSort className="h-3 w-3" />}
                                                        </span>
                                                    </button>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button 
                                                        className="group flex items-center space-x-1 focus:outline-none"
                                                        onClick={() => handleSort('category')}
                                                    >
                                                        <span>Category</span>
                                                        <span className="text-gray-400 group-hover:text-gray-500">
                                                            {sortField === 'category' && (
                                                                sortDirection === 'asc' ? <FaChevronUp className="h-3 w-3" /> : <FaChevronDown className="h-3 w-3" />
                                                            )}
                                                            {sortField !== 'category' && <FaSort className="h-3 w-3" />}
                                                        </span>
                                                    </button>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button 
                                                        className="group flex items-center space-x-1 focus:outline-none"
                                                        onClick={() => handleSort('expiry_date')}
                                                    >
                                                        <span>Expiry Date</span>
                                                        <span className="text-gray-400 group-hover:text-gray-500">
                                                            {sortField === 'expiry_date' && (
                                                                sortDirection === 'asc' ? <FaChevronUp className="h-3 w-3" /> : <FaChevronDown className="h-3 w-3" />
                                                            )}
                                                            {sortField !== 'expiry_date' && <FaSort className="h-3 w-3" />}
                                                        </span>
                                                    </button>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredInventory.map(item => (
                                                <tr key={item.item_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{item.quantity}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.expiry_date ? 
                                                            new Date(item.expiry_date).toLocaleDateString() : 
                                                            <span className="text-gray-400">N/A</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end items-center space-x-2">
                                                            <button
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                                onClick={() => openEditModal(item)}
                                                            >
                                                                <FaEdit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem(item.item_id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <FaTrash className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Item</h3>
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
                                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity*</label>
                                                    <input
                                                        type="number"
                                                        name="quantity"
                                                        id="quantity"
                                                        min="0"
                                                        value={formData.quantity}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category*</label>
                                                    <select
                                                        name="category"
                                                        id="category"
                                                        value={formData.category}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        required
                                                    >
                                                        {categories.map(category => (
                                                            <option key={category} value={category}>{category}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location*</label>
                                                <select
                                                    name="location"
                                                    id="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                >
                                                    {locations.map(location => (
                                                        <option key={location} value={location}>{location}</option>
                                                    ))}
                                                </select>
                                                <p className="mt-1 text-xs text-gray-500">Select where this item is stored</p>
                                            </div>

                                            <div>
                                                <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">Purchase Date</label>
                                                <input
                                                    type="date"
                                                    name="purchase_date"
                                                    id="purchase_date"
                                                    value={formData.purchase_date}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">When did you purchase this item?</p>
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                                <input
                                                    type="date"
                                                    name="expiry_date"
                                                    id="expiry_date"
                                                    value={formData.expiry_date}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">When will this item expire?</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleAddItem}
                                >
                                    Add Item
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Edit Item
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Item Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="item_name"
                                        value={formData.item_name}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Location *
                                    </label>
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    >
                                        {locations.map(location => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        name="purchase_date"
                                        value={formData.purchase_date}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        name="expiry_date"
                                        value={formData.expiry_date}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={handleUpdateItem}
                                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="ml-4 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Inventory; 