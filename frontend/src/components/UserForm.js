import React, { useState } from 'react';
import axios from 'axios';

//This component handles creating and updating users.

const UserForm = ({ user, onSave }) => {
    const [username, setUsername] = useState(user ? user.username : '');
    const [email, setEmail] = useState(user ? user.email : '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(user ? user.role : 'user');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userData = { username, email, password, role };

        try {
            if (user) {
                await axios.put(`http://localhost:5000/users/${user.user_id}`, userData);
            } else {
                await axios.post('http://localhost:5000/users', userData);
            }
            onSave();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
            <button type="submit">Save</button>
        </form>
    );
};

export default UserForm;