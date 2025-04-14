import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import heroVideo from "..public/videos/heroVideo.mp4";

// Import images
import feature1 from "../assets/feature1.jpg";
import feature2 from "../assets/feature2.jpg";
import feature3 from "../assets/feature3.jpg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <video autoPlay muted loop className="heroVideo">
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-content">
          <h1>Welcome to Homestock Management</h1>
          <p>Efficiently manage your stock items and alerts.</p>
          <div className="hero-buttons">
            <button
              className="btn btn-primary me-3"
              onClick={() => navigate("/view-stock")}
            >
              View Stock
            </button>
            <button
              className="btn btn-warning"
              onClick={() => navigate("/view-alerts")}
            >
              View Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Choose Homestock?</h2>
        <div className="features-container">
          <div className="feature">
            <img src={feature1} alt="Real-Time Analytics" className="feature-image" />
            <h3>Real-Time Analytics</h3>
            <p>Track your stock levels and get insights in real-time.</p>
          </div>
          <div className="feature">
            <img src={feature2} alt="Smart Alerts" className="feature-image" />
            <h3>Smart Alerts</h3>
            <p>Get notified about low stock and expiration dates.</p>
          </div>
          <div className="feature">
            <img src={feature3} alt="Easy Management" className="feature-image" />
            <h3>Easy Management</h3>
            <p>Add, update, and delete stock items with ease.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;