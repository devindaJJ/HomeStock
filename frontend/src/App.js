import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/Home";
import AddStock from "./pages/AddStock";
import ViewStock from "./pages/ViewStock";
import ViewAlerts from "./pages/ViewAlerts";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-stock" element={<AddStock />} />
        <Route path="/view-stock" element={<ViewStock />} />
        <Route path="/view-alerts" element={<ViewAlerts />} />
      </Routes>
    </Router>
  );
}

export default App;