import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ItemManager = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    description: '',
    category: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all items
  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items');
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Add new item
  const handleAddItem = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/api/items', newItem);
      setNewItem({
        name: '',
        quantity: '',
        description: '',
        category: '',
      });
      fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Update item
  const handleUpdateItem = async (id, updatedItem) => {
    try {
      await axios.patch(`/api/items/${id}`, updatedItem);
      fetchItems();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Search items by name
  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchQuery) return;
    try {
      const response = await axios.get(`/api/items/search?name=${searchQuery}`);
      setItems(response.data);
    } catch (error) {
      console.error("Error searching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Item Manager</h1>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="mb-6 p-4 border border-gray-200 rounded">
        <h2 className="text-lg mb-2">Add New Item</h2>
        <div className="mb-2">
          <label className="block">Name:</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Quantity:</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Description:</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Category:</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Item</button>
      </form>

      {/* Search Item */}
      <form onSubmit={handleSearch} className="mb-6 p-4 border border-gray-200 rounded">
        <h2 className="text-lg mb-2">Search Item by Name</h2>
        <div className="mb-2">
          <input
            type="text"
            className="border p-2 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter item name"
          />
        </div>
        <button type="submit" className="bg-green-500 text-white p-2 rounded">Search</button>
      </form>

      {/* Items List */}
      <h2 className="text-lg mb-2">Items</h2>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.id}</td>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.quantity}</td>
              <td className="border p-2">{item.description}</td>
              <td className="border p-2">{item.category}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-red-500 text-white p-1 rounded mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleUpdateItem(item.id, { ...item, quantity: item.quantity + 1 })}
                  className="bg-yellow-500 text-white p-1 rounded"
                >
                  Update Quantity
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemManager;
