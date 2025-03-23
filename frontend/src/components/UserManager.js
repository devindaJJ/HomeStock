import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });
  const [editUser, setEditUser] = useState(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Create a new user
  const handleAddUser = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/users', newUser);
      setNewUser({ username: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Update user
  const handleUpdateUser = async (userId) => {
    try {
      await axios.put(`/users/${userId}`, editUser);
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">User Manager</h1>

      {/* Create User Form */}
      <form onSubmit={handleAddUser} className="mb-6 p-4 border border-gray-200 rounded">
        <h2 className="text-lg mb-2">Create New User</h2>
        <div className="mb-2">
          <label className="block">Username:</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Email:</label>
          <input
            type="email"
            className="border p-2 w-full"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Password:</label>
          <input
            type="password"
            className="border p-2 w-full"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Role:</label>
          <select
            className="border p-2 w-full"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add User</button>
      </form>

      {/* Users List */}
      <h2 className="text-lg mb-2">Users</h2>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td className="border p-2">{user.user_id}</td>
              <td className="border p-2">{user.username}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2">
                <button
                  className="bg-green-500 text-white p-1 rounded mr-2"
                  onClick={() => setEditUser(user)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white p-1 rounded"
                  onClick={() => handleDeleteUser(user.user_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit User Form */}
      {editUser && (
        <div className="mt-6 p-4 border border-gray-200 rounded">
          <h2 className="text-lg mb-2">Edit User</h2>
          <div className="mb-2">
            <label className="block">Username:</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={editUser.username}
              onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-2">
            <label className="block">Email:</label>
            <input
              type="email"
              className="border p-2 w-full"
              value={editUser.email}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-2">
            <label className="block">Role:</label>
            <select
              className="border p-2 w-full"
              value={editUser.role}
              onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={() => handleUpdateUser(editUser.user_id)}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManager;
