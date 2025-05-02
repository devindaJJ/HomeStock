import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaSort, FaBox, FaChevronDown, FaChevronUp, FaFileCsv, FaFileExport } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UserProfileCorner from '../components/UserProfileCorner';
import '../styles/cards.css';

const Inventory = ({ isDarkMode }) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('item_name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [categories] = useState(['Pantry', 'Refrigerator', 'Freezer', 'Household', 'Other']);
    const [locations] = useState(['Kitchen Pantry', 'Upper Cabinet', 'Lower Cabinet', 'Refrigerator', 'Freezer', 'Basement Storage', 'Garage Storage', 'Bathroom', 'Laundry Room', 'Other']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [userData, setUserData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchField, setSearchField] = useState('item_name'); // New state for search field selection
    const [showExportOptions, setShowExportOptions] = useState(false); // New state for export options
    
    // Form states
    const [formData, setFormData] = useState({
        item_name: '',
        quantity: 1,
        category: 'Pantry',
        location: 'Kitchen Pantry',
        expiry_date: '',
        purchase_date: '',
    });

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
            closeModal();
            fetchInventory();
        } catch (error) {
            console.error('Error adding item:', error);
            toast.error(error.response?.data?.error || 'Failed to add item');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/api/items/${itemId}`);
                toast.success('Item deleted successfully');
                fetchInventory();
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.error(error.response?.data?.error || 'Failed to delete item');
            }
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchInventory();
            return;
        }

        try {
            setLoading(true);
            let response;
            if (searchField === 'item_name') {
                response = await api.get(`/api/items/search?name=${searchTerm}`);
            } else if (searchField === 'category') {
                response = await api.get(`/api/items/search?category=${searchTerm}`);
            } else if (searchField === 'location') {
                response = await api.get(`/api/items/search?location=${searchTerm}`);
            }
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

            await api.put(`/api/items/${editingItem.item_id}`, formattedData);
            toast.success('Item updated successfully');
            closeModal();
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

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({
            item_name: '',
            quantity: 1,
            category: 'Pantry',
            location: 'Kitchen Pantry',
            expiry_date: '',
            purchase_date: '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    // Export to CSV function
    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add headers
        const headers = ["Item Name", "Quantity", "Category", "Location", "Purchase Date", "Expiry Date"];
        csvContent += headers.join(",") + "\r\n";
        
        // Add data rows
        filteredInventory.forEach(item => {
            const row = [
                `"${item.item_name}"`,
                item.quantity,
                `"${item.category}"`,
                `"${item.location}"`,
                item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : 'N/A',
                item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'
            ];
            csvContent += row.join(",") + "\r\n";
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter and sort the inventory
    const filteredInventory = inventory
        .filter(item => {
            const matchesSearch = searchTerm ? 
                item[searchField].toLowerCase().includes(searchTerm.toLowerCase()) : true;
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
        <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-[#09090B]' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`theme-card ${isDarkMode ? 'dark' : 'light'}`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Inventory Management
                            </h1>
                            <div className="flex space-x-2">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowExportOptions(!showExportOptions)}
                                        className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center`}
                                    >
                                        <FaFileExport className="mr-2" />
                                        Export
                                    </button>
                                    {showExportOptions && (
                                        <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-10`}>
                                            <button
                                                onClick={() => {
                                                    exportToCSV();
                                                    setShowExportOptions(false);
                                                }}
                                                className={`block px-4 py-2 text-sm w-full text-left ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                <FaFileCsv className="inline mr-2" />
                                                Export to CSV
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={openAddModal}
                                    className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center`}
                                >
                                    <FaPlus className="mr-2" />
                                    Add Item
                                </button>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 flex">
                                <input
                                    type="text"
                                    placeholder={`Search by ${searchField === 'item_name' ? 'item name' : searchField}...`}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full px-4 py-2 rounded-l-lg`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <select
                                    value={searchField}
                                    onChange={(e) => setSearchField(e.target.value)}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} rounded-r-lg border-l-0`}
                                >
                                    <option value="item_name">Name</option>
                                    <option value="category">Category</option>
                                    <option value="location">Location</option>
                                </select>
                            </div>
                            <div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full`}
                                >
                                    <option value="All">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Inventory Table */}
                        <div className="overflow-x-auto">
                            <table className={`theme-table ${isDarkMode ? 'dark' : 'light'} min-w-full divide-y divide-gray-200`}>
                                <thead className={`theme-table-header ${isDarkMode ? 'dark' : 'light'}`}>
                                    <tr>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort('item_name')}
                                        >
                                            <div className="flex items-center">
                                                Item
                                                {sortField === 'item_name' && (
                                                    sortDirection === 'asc' ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort('quantity')}
                                        >
                                            <div className="flex items-center">
                                                Quantity
                                                {sortField === 'quantity' && (
                                                    sortDirection === 'asc' ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort('category')}
                                        >
                                            <div className="flex items-center">
                                                Category
                                                {sortField === 'category' && (
                                                    sortDirection === 'asc' ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort('purchase_date')}
                                        >
                                            <div className="flex items-center">
                                                Purchase Date
                                                {sortField === 'purchase_date' && (
                                                    sortDirection === 'asc' ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort('expiry_date')}
                                        >
                                            <div className="flex items-center">
                                                Expiry Date
                                                {sortField === 'expiry_date' && (
                                                    sortDirection === 'asc' ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredInventory.length > 0 ? (
                                        filteredInventory.map((item) => (
                                            <tr key={item.item_id} className={`theme-table-row ${isDarkMode ? 'dark' : 'light'}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.item_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`theme-badge ${isDarkMode ? 'dark' : 'light'} px-2 py-1 rounded-full text-sm`}>
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className={`theme-button-secondary ${isDarkMode ? 'dark' : 'light'} p-2 rounded-lg`}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.item_id)}
                                                        className="text-red-600 hover:text-red-800 p-2 rounded-lg"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center">
                                                No items found matching your criteria
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className={`theme-card ${isDarkMode ? 'dark' : 'light'} max-w-md w-full p-6`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {editingItem ? 'Edit Item' : 'Add New Item'}
                        </h2>
                        <div className="mt-2 space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Item Name*
                                </label>
                                <input
                                    type="text"
                                    name="item_name"
                                    value={formData.item_name}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1`}
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Quantity*
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="0"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Category*
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1`}
                                        required
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Location*
                                </label>
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1`}
                                    required
                                >
                                    {locations.map(location => (
                                        <option key={location} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Purchase Date
                                </label>
                                <input
                                    type="date"
                                    name="purchase_date"
                                    value={formData.purchase_date}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1`}
                                />
                            </div>
                            
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Expiry Date
                                </label>
                                <input
                                    type="date"
                                    name="expiry_date"
                                    value={formData.expiry_date}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1`}
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                type="button"
                                className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-md`}
                                onClick={editingItem ? handleUpdateItem : handleAddItem}
                            >
                                {editingItem ? 'Update' : 'Add Item'}
                            </button>
                            <button
                                type="button"
                                className={`theme-button-secondary ${isDarkMode ? 'dark' : 'light'} ml-2 px-4 py-2 rounded-md`}
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;