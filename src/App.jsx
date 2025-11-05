// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import ListingsPage from './pages/ListingsPage';
import BuyerPortal from './pages/BuyerPortal';
import SellerPortal from './pages/SellerPortal';
import BuyerDashboard from './pages/BuyerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route
          path="/buyer"
          element={
            <ProtectedRoute>
              <BuyerPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/seller" element={<SellerPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
