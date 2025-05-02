import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaFileCsv } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/cards.css';

const StockManagement = ({ isDarkMode }) => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('name'); // 'name' or 'status'
    const [formData, setFormData] = useState({
        name: '',
        quantity: 0,
        expiration_date: ''
    });
    const [formErrors, setFormErrors] = useState({
        name: '',
        quantity: '',
        expiration_date: ''
    });

    // Create API instance with auth token
    const api = axios.create({
        baseURL: 'http://localhost:5000',
        withCredentials: true
    });

    // Add request interceptor to include token
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

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/stock');
            setStocks(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stocks:', error);
            toast.error('Failed to load stock data');
            setLoading(false);
        }
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            name: '',
            quantity: '',
            expiration_date: ''
        };

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Item name is required';
            valid = false;
        } else if (formData.name.length > 100) {
            newErrors.name = 'Item name must be less than 100 characters';
            valid = false;
        }

        // Quantity validation
        if (formData.quantity === '' || isNaN(formData.quantity)) {
            newErrors.quantity = 'Quantity is required';
            valid = false;
        } else if (formData.quantity < 0) {
            newErrors.quantity = 'Quantity cannot be negative';
            valid = false;
        } else if (formData.quantity > 1000000) {
            newErrors.quantity = 'Quantity is too large';
            valid = false;
        }

        // Expiration date validation (if provided)
        if (formData.expiration_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expDate = new Date(formData.expiration_date);
            if (expDate < today) {
                newErrors.expiration_date = 'Expiration date cannot be in the past';
                valid = false;
            }
        }

        setFormErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const submissionData = {
                name: formData.name.trim(),
                quantity: Number(formData.quantity),
                expiration_date: formData.expiration_date || null
            };

            if (editingStock) {
                await api.put(`/stock/${editingStock.stock_id}`, submissionData);
                toast.success('Stock updated successfully');
            } else {
                await api.post('/stock', submissionData);
                toast.success('Stock added successfully');
            }
            
            setShowAddModal(false);
            setEditingStock(null);
            setFormData({
                name: '',
                quantity: 0,
                expiration_date: ''
            });
            fetchStocks();
        } catch (error) {
            console.error('Error saving stock:', error);
            toast.error(error.response?.data?.error || 'Failed to save stock');
        }
    };

    const handleDelete = async (stock_id) => {
        if (window.confirm('Are you sure you want to delete this stock item?')) {
            try {
                await api.delete(`/stock/${stock_id}`);
                toast.success('Stock deleted successfully');
                fetchStocks();
            } catch (error) {
                console.error('Error deleting stock:', error);
                toast.error('Failed to delete stock');
            }
        }
    };

    const handleEdit = (stock) => {
        setEditingStock(stock);
        setFormData({
            name: stock.name,
            quantity: stock.quantity,
            expiration_date: stock.expiration_date || ''
        });
        setShowAddModal(true);
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            fetchStocks();
            return;
        }

        const filtered = stocks.filter(stock => {
            if (searchField === 'name') {
                return stock.name.toLowerCase().includes(searchTerm.toLowerCase());
            } else if (searchField === 'status') {
                const status = stock.quantity <= 0 ? 'out of stock' : 'in stock';
                return status.includes(searchTerm.toLowerCase());
            }
            return true;
        });

        setStocks(filtered);
    };

    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add headers
        const headers = ["Item Name", "Quantity", "Status", "Expiration Date"];
        csvContent += headers.join(",") + "\r\n";
        
        // Add data rows
        stocks.forEach(stock => {
            const status = stock.quantity <= 0 ? 'Out of Stock' : 'In Stock';
            const row = [
                `"${stock.name}"`,
                stock.quantity,
                `"${status}"`,
                stock.expiration_date ? new Date(stock.expiration_date).toLocaleDateString() : 'N/A'
            ];
            csvContent += row.join(",") + "\r\n";
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `stock_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredStocks = stocks.filter(stock => {
        if (!searchTerm) return true;
        
        if (searchField === 'name') {
            return stock.name.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (searchField === 'status') {
            const status = stock.quantity <= 0 ? 'out of stock' : 'in stock';
            return status.includes(searchTerm.toLowerCase());
        }
        return true;
    });

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
                                Stock Management
                            </h1>
                            <div className="flex space-x-2">
                                <button
                                    onClick={exportToCSV}
                                    className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center`}
                                >
                                    <FaFileCsv className="mr-2" />
                                    Export to CSV
                                </button>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center`}
                                >
                                    <FaPlus className="mr-2" />
                                    Add Stock Item
                                </button>
                            </div>
                        </div>

                        {/* Search Section */}
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 flex">
                                <input
                                    type="text"
                                    placeholder={`Search by ${searchField === 'name' ? 'item name' : 'status'}...`}
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
                                    <option value="name">Name</option>
                                    <option value="status">Status</option>
                                </select>
                            </div>
                            <button
                                onClick={handleSearch}
                                className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center justify-center`}
                            >
                                <FaSearch className="mr-2" />
                                Search
                            </button>
                        </div>

                        {/* Stock Management Table */}
                        <div className="overflow-x-auto">
                            <table className={`theme-table ${isDarkMode ? 'dark' : 'light'} min-w-full divide-y divide-gray-200`}>
                                <thead className={`theme-table-header ${isDarkMode ? 'dark' : 'light'}`}>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Item</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Expiration Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStocks.length > 0 ? (
                                        filteredStocks.map((stock) => (
                                            <tr key={stock.stock_id} className={`theme-table-row ${isDarkMode ? 'dark' : 'light'}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">{stock.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{stock.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {stock.expiration_date ? new Date(stock.expiration_date).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                                        stock.quantity <= 0
                                                            ? `${isDarkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`
                                                            : `${isDarkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'}`
                                                    }`}>
                                                        {stock.quantity <= 0 ? 'Out of Stock' : 'In Stock'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(stock)}
                                                        className={`theme-button-secondary ${isDarkMode ? 'dark' : 'light'} p-2 rounded-lg`}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(stock.stock_id)}
                                                        className="text-red-600 hover:text-red-800 p-2 rounded-lg"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center">
                                                No stock items found matching your criteria
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
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className={`theme-card ${isDarkMode ? 'dark' : 'light'} max-w-md w-full p-6`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {editingStock ? 'Edit Stock Item' : 'Add New Stock Item'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Item Name*
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1 ${formErrors.name ? 'border-red-500' : ''}`}
                                    required
                                />
                                {formErrors.name && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Quantity*
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1 ${formErrors.quantity ? 'border-red-500' : ''}`}
                                    required
                                />
                                {formErrors.quantity && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>
                                )}
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Expiration Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.expiration_date}
                                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full mt-1 ${formErrors.expiration_date ? 'border-red-500' : ''}`}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                {formErrors.expiration_date && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.expiration_date}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingStock(null);
                                        setFormErrors({
                                            name: '',
                                            quantity: '',
                                            expiration_date: ''
                                        });
                                    }}
                                    className={`theme-button-secondary ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg`}
                                >
                                    {editingStock ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockManagement;