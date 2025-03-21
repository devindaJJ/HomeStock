import React, { useState } from 'react';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import axios from 'axios';

const App = () => {
    const [selectedUser, setSelectedUser] = useState(null);

    const handleSave = () => {
        setSelectedUser(null); // Reset form after save
    };

    const handleDelete = async (userId) => {
        try {
            await axios.delete(`http://localhost:5000/users/${userId}`);
            handleSave(); // Refresh the user list
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div>
            <h1>User Management</h1>
            <UserForm user={selectedUser} onSave={handleSave} />
            <UserList onEdit={setSelectedUser} onDelete={handleDelete} />
        </div>
    );
};

export default App;