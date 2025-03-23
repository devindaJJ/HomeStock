import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StockManager = () => {
  const [stockItems, setStockItems] = useState([]);
  const [newStockItem, setNewStockItem] = useState({ name: '', quantity: '', expiration_date: '' });
  const [alerts, setAlerts] = useState([]);

  // Fetch all stock items
  const fetchStockItems = async () => {
    try {
      const response = await axios.get('/stock');
      setStockItems(response.data);
    } catch (error) {
      console.error("Error fetching stock items:", error);
    }
  };

  // Fetch active alerts
  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  // Add new stock item
  const handleAddStockItem = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/stock', newStockItem);
      setNewStockItem({ name: '', quantity: '', expiration_date: '' });
      fetchStockItems();
    } catch (error) {
      console.error("Error adding stock item:", error);
    }
  };

  // Check for alerts
  const handleCheckAlerts = async () => {
    try {
      await axios.post('/alerts/check');
      fetchAlerts();
    } catch (error) {
      console.error("Error checking alerts:", error);
    }
  };

  useEffect(() => {
    fetchStockItems();
    fetchAlerts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Stock Manager</h1>

      {/* Add Stock Item Form */}
      <form onSubmit={handleAddStockItem} className="mb-6 p-4 border border-gray-200 rounded">
        <h2 className="text-lg mb-2">Add New Stock Item</h2>
        <div className="mb-2">
          <label className="block">Name:</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={newStockItem.name}
            onChange={(e) => setNewStockItem({ ...newStockItem, name: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Quantity:</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={newStockItem.quantity}
            onChange={(e) => setNewStockItem({ ...newStockItem, quantity: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Expiration Date:</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={newStockItem.expiration_date}
            onChange={(e) => setNewStockItem({ ...newStockItem, expiration_date: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Stock Item</button>
      </form>

      {/* Stock Items List */}
      <h2 className="text-lg mb-2">Stock Items</h2>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Expiration Date</th>
          </tr>
        </thead>
        <tbody>
          {stockItems.map((item) => (
            <tr key={item.stock_id}>
              <td className="border p-2">{item.stock_id}</td>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.quantity}</td>
              <td className="border p-2">{item.expiration_date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Alerts Section */}
      <h2 className="text-lg mb-2 mt-6">Active Alerts</h2>
      <button
        onClick={handleCheckAlerts}
        className="bg-yellow-500 text-white p-2 rounded mb-4"
      >
        Check for Alerts
      </button>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Alert ID</th>
            <th className="border p-2">Message</th>
            <th className="border p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.alert_id}>
              <td className="border p-2">{alert.alert_id}</td>
              <td className="border p-2">{alert.message}</td>
              <td className="border p-2">{alert.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockManager;
