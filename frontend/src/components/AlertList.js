import React, { useEffect, useState } from "react";
import axios from "axios";

const AlertList = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/alerts");
      setAlerts(response.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleCheckAlerts = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/alerts/check");
      alert("Alerts checked successfully!");
      fetchAlerts(); // Refresh the alerts list
    } catch (error) {
      console.error("Error checking alerts:", error);
      alert("Failed to check alerts.");
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Active Alerts</h5>
        <button onClick={handleCheckAlerts} className="btn btn-primary mb-3">
          Check Alerts
        </button>
        <table className="table">
          <thead>
            <tr>
              <th>Message</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.alert_id}>
                <td>{alert.message}</td>
                <td>{alert.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertList;