import React, { useState } from 'react';
import UserList from './UserList';
import UserForm from './UserForm';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminPanel = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);

    const handleSave = () => {
        setSelectedUser(null);
        setShowUserForm(false);
        toast.success('User saved successfully!');
    };

    const handleDelete = async (userId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            handleSave();
            toast.success('User deleted successfully!');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        } finally {
            setLoading(false);
        }
    };

    const handleNewUser = () => {
        setSelectedUser(null);
        setShowUserForm(true);
        // Smooth scroll to the form
        setTimeout(() => {
            document.getElementById('userForm')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowUserForm(true);
        // Smooth scroll to the form
        setTimeout(() => {
            document.getElementById('userForm')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                {/* Admin Panel Header */}
                <div className="border-b border-gray-200 pb-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                User Management
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage and monitor system users
                            </p>
                        </div>
                        <button
                            onClick={handleNewUser}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New User
                        </button>
                    </div>
                </div>

                {/* User Form Section */}
                {showUserForm && (
                    <div id="userForm" className="mt-8 transition-all duration-300 ease-in-out">
                        <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <div className="px-4 sm:px-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                                                        {selectedUser ? 'Edit User' : 'Create User'}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {selectedUser 
                                                            ? `Update information for ${selectedUser.username}`
                                                            : 'Add a new user to the system'
                                                        }
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setShowUserForm(false)}
                                                    className="text-gray-400 hover:text-gray-500"
                                                >
                                                    <span className="sr-only">Close form</span>
                                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <UserForm 
                                            user={selectedUser} 
                                            onSave={handleSave}
                                            loading={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* User List Section */}
                <div className="mt-8">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        User List
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        View and manage all users in the system
                                    </p>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Refresh
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4">
                                <UserList 
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    loading={loading}
                                    selectedUser={selectedUser}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel; 