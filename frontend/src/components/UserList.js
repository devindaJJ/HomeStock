import React, { useEffect, useState } from 'react';
import axios from 'axios';

//This component fetches and displays the list of users.

const UserList = ({ onEdit, onDelete }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    return (
        <div>
            <h2>User List</h2>
            <ul>
                {users.map(user => (
                    <li key={user.user_id}>
                        {user.username} - {user.email} ({user.role})
                        <button onClick={() => onEdit(user)}>Edit</button>
                        <button onClick={() => onDelete(user.user_id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;