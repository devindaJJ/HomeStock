import React, { useEffect, useState } from "react";
import axios from "axios";

const StockList = () => {
  const [stockItems, setStockItems] = useState([]);

  useEffect(() => {
    fetchStockItems();
  }, []);

  const fetchStockItems = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/stock");
      setStockItems(response.data);
    } catch (error) {
      console.error("Error fetching stock items:", error);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Stock Items</h5>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Expiration Date</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.map((item) => (
              <tr key={item.stock_id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.expiration_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockList;