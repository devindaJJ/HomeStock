import React, { useState } from "react";
import axios from "axios";

const AddStockItem = () => {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    expiration_date: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:5000/stock", formData);
      alert("Stock item added successfully!");
      setFormData({ name: "", quantity: "", expiration_date: "" });
    } catch (error) {
      console.error("Error adding stock item:", error);
      alert("Failed to add stock item.");
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Add Stock Item</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Expiration Date</label>
            <input
              type="date"
              name="expiration_date"
              value={formData.expiration_date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add Stock Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStockItem;