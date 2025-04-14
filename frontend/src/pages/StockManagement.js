import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
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

const StockManagement = () => {
    const navigate = useNavigate();
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
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

    // Fetch stock items from backend
    const fetchStockItems = async () => {
        try {
            setLoading(true);
            const response = await api.get('/stock');
            setStockItems(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stock items:', error);
            toast.error('Failed to load stock items');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockItems();
    }, []);

    // Create modal component
    const StockModal = ({ isOpen, onClose, onSubmit, title, submitText, initialData }) => {
        const [localFormData, setLocalFormData] = useState({
            name: '',
            quantity: '',
            expiration_date: ''
        });

        useEffect(() => {
            if (initialData) {
                setLocalFormData({
                    name: initialData.name || '',
                    quantity: initialData.quantity || '',
                    expiration_date: initialData.expiration_date || ''
                });
            } else {
                setLocalFormData({
                    name: '',
                    quantity: '',
                    expiration_date: ''
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
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name*</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={localFormData.name}
                                    onChange={handleLocalInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter item name"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">Quantity*</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    id="quantity"
                                    value={localFormData.quantity}
                                    onChange={handleLocalInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter quantity"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="expiration_date" className="block text-sm font-medium text-gray-700 mb-2">Expiration Date*</label>
                                <input
                                    type="date"
                                    name="expiration_date"
                                    id="expiration_date"
                                    value={localFormData.expiration_date}
                                    onChange={handleLocalInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
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

    const handleAddItem = async (formData) => {
        try {
            const response = await api.post('/stock', formData);
            if (response.status === 201) {
                toast.success('Stock item added successfully');
                setIsAddModalOpen(false);
                fetchStockItems();
            }
        } catch (error) {
            console.error('Error adding stock item:', error);
            toast.error('Failed to add stock item');
        }
    };

    const handleUpdateItem = async (formData) => {
        try {
            const response = await api.put(`/stock/${currentItem.stock_id}`, formData);
            if (response.status === 200) {
                toast.success('Stock item updated successfully');
                setIsEditModalOpen(false);
                fetchStockItems();
            }
        } catch (error) {
            console.error('Error updating stock item:', error);
            toast.error('Failed to update stock item');
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            const response = await api.delete(`/stock/${id}`);
            if (response.status === 200) {
                toast.success('Stock item deleted successfully');
                fetchStockItems();
            }
        } catch (error) {
            console.error('Error deleting stock item:', error);
            toast.error('Failed to delete stock item');
        }
    };

    const handleEditClick = (item) => {
        setCurrentItem(item);
        setIsEditModalOpen(true);
    };

    const getStockStatus = (quantity) => {
        if (quantity <= 5) return 'low';
        if (quantity <= 10) return 'medium';
        return 'high';
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
                                    <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <FaPlus className="mr-2" />
                                    Add Stock Item
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
                                        onClick={() => setFilter('low')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            filter === 'low' 
                                                ? 'bg-red-100 text-red-700' 
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Low Stock
                                    </button>
                                    <button
                                        onClick={() => setFilter('expiring')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            filter === 'expiring' 
                                                ? 'bg-yellow-100 text-yellow-700' 
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Expiring Soon
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {stockItems
                                    .filter(item => {
                                        if (filter === 'all') return true;
                                        if (filter === 'low') return item.quantity <= 5;
                                        if (filter === 'expiring') {
                                            const today = new Date();
                                            const expDate = new Date(item.expiration_date);
                                            const diffTime = expDate - today;
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            return diffDays <= 7;
                                        }
                                        return true;
                                    })
                                    .map(item => (
                                        <div
                                            key={item.stock_id}
                                            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                                        {getStockStatus(item.quantity) === 'low' && (
                                                            <span className="ml-2 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                                                                Low Stock
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500">
                                                        <span className="mr-4">Quantity: {item.quantity}</span>
                                                        <span>Expires: {new Date(item.expiration_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(item)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <FaEdit className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.stock_id)}
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

            <StockModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddItem}
                title="Add New Stock Item"
                submitText="Add Item"
            />

            <StockModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateItem}
                title="Edit Stock Item"
                submitText="Update Item"
                initialData={currentItem}
            />
        </>
    );
};

export default StockManagement; 