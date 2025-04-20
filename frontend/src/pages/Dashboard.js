import React, { useState, useEffect } from 'react';
import { FaUserEdit, FaTrash, FaPlus, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = ({ isDarkMode }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
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

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Add new user
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/users', formData);
            setUsers([...users, response.data.user]);
            setShowAddModal(false);
            setFormData({ username: '', email: '', password: '', role: 'user' });
            toast.success('User added successfully');
        } catch (error) {
            console.error('Error adding user:', error);
            toast.error(error.response?.data?.message || 'Failed to add user');
        }
    };

    // Update user
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${selectedUser.user_id}`, formData);
            setUsers(users.map(user => 
                user.user_id === selectedUser.user_id ? { ...user, ...formData } : user
            ));
            setShowEditModal(false);
            setSelectedUser(null);
            toast.success('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    // Delete user
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${userId}`);
                setUsers(users.filter(user => user.user_id !== userId));
                toast.success('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    // Open edit modal with user data
    const handleEditClick = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            role: user.role,
            password: '' // Clear password field for security
        });
        setShowEditModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className={`theme-card ${isDarkMode ? 'dark' : 'light'} p-6`}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <FaUsers className={`h-8 w-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} mr-3`} />
                    <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        User Management
                    </h1>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center`}
                >
                    <FaPlus className="mr-2" />
                    Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Username
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Email
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Role
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-200 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                        {users.map((user) => (
                            <tr key={user.user_id}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    {user.username}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    {user.email}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    {user.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                        >
                                            <FaUserEdit className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.user_id)}
                                            className="p-2 rounded-lg hover:bg-red-100"
                                        >
                                            <FaTrash className="text-red-600" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className={`theme-card ${isDarkMode ? 'dark' : 'light'} max-w-md w-full p-6 rounded-lg`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Add New User
                        </h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                                    Username*
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                                    Email*
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                                    Password*
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full`}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setFormData({ username: '', email: '', password: '', role: 'user' });
                                    }}
                                    className={`theme-button-secondary ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg`}
                                >
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className={`theme-card ${isDarkMode ? 'dark' : 'light'} max-w-md w-full p-6 rounded-lg`}>
                        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Edit User
                        </h2>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                                    Username*
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                                    Email*
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full`}
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className={`theme-input ${isDarkMode ? 'dark' : 'light'} w-full`}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedUser(null);
                                        setFormData({ username: '', email: '', password: '', role: 'user' });
                                    }}
                                    className={`theme-button-secondary ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg`}
                                >
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard; 