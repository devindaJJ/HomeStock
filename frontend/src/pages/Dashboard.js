import React, { useState, useEffect } from 'react';
import { FaUserEdit, FaTrash, FaPlus, FaUsers, FaFileExport, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = ({ isDarkMode }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
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
    const [searchTerm, setSearchTerm] = useState('');

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

    // Filter users based on search term
    const filterUsers = () => {
        if (!searchTerm) {
            setFilteredUsers(users);
            return;
        }

        const lowerCaseTerm = searchTerm.toLowerCase();
        const filtered = users.filter(user => {
            return (
                (user.username && user.username.toLowerCase().includes(lowerCaseTerm)) ||
                (user.email && user.email.toLowerCase().includes(lowerCaseTerm)) ||
                (user.role && user.role.toLowerCase().includes(lowerCaseTerm)) ||
                (user.created_at && new Date(user.created_at).toLocaleString().toLowerCase().includes(lowerCaseTerm))
            );
        });

        setFilteredUsers(filtered);
    };

    // Function to export users to CSV
    const exportToCSV = () => {
        const dataToExport = searchTerm ? filteredUsers : users;
        
        if (dataToExport.length === 0) {
            toast.warning('No users to export');
            return;
        }

        // CSV headers
        const headers = ['ID', 'Username', 'Email', 'Role', 'Created At'];
        
        // Convert users data to CSV format
        const csvRows = [
            headers.join(','), // Header row
            ...dataToExport.map(user => [
                `"${user.user_id}"`,
                `"${(user.username || '').replace(/"/g, '""')}"`,
                `"${(user.email || '').replace(/"/g, '""')}"`,
                `"${user.role}"`,
                `"${new Date(user.created_at).toLocaleString()}"`
            ].join(','))
        ];

        // Create CSV file
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Users exported successfully');
    };

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
            setFilteredUsers(response.data);
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

    // Update filtered users when search term changes
    useEffect(() => {
        filterUsers();
    }, [searchTerm, users]);

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

    // Get role color for styling
    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800';
            case 'user': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
                <div className="flex space-x-2">
                    <button
                        onClick={exportToCSV}
                        className={`theme-button-secondary ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center`}
                        title="Export to CSV"
                    >
                        <FaFileExport className="mr-2" />
                        Export
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className={`theme-button ${isDarkMode ? 'dark' : 'light'} px-4 py-2 rounded-lg flex items-center`}
                    >
                        <FaPlus className="mr-2" />
                        Add User
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
                        placeholder="Search users by name, email, or role..."
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
                        Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'}
                    </p>
                )}
            </div>

            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm ? (
                        <p>No users found matching your search.</p>
                    ) : (
                        <p>No users found. Add your first user!</p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => (
                        <div 
                            key={user.user_id}
                            className={`rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
                                isDarkMode ? 'bg-gray-800' : 'bg-white'
                            }`}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {user.username}
                                        </h3>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {user.email}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </div>
                           
                                <div className="mt-6 flex justify-end space-x-2">
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                                        title="Edit user"
                                    >
                                        <FaUserEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.user_id)}
                                        className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                                        title="Delete user"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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