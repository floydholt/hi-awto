import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import logo from '../assets/logo.png'; // Place your logo in /src/assets/

function Homepage() {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const zip = e.target.zip.value;
    navigate(`/listings?zip=${zip}`);
  };

  return (
    <div className="homepage">
      <header className="header">
        <img src={logo} alt="HI AWTO Logo" className="logo" />
        <nav>
          <a href="/">Home</a>
          <a href="/listings">Listings</a>
          <a href="/buyer">Buyer Portal</a>
          <a href="/seller">Seller Portal</a>
          <a href="/about">About</a>
        </nav>
      </header>

      <section className="hero">
        <h1>Here Is Another Way To Own</h1>
        <p>Lease-to-own made simple, secure, and accessible.</p>
        <form onSubmit={handleSearch}>
          <input type="text" name="zip" placeholder="Enter your zip code" required />
          <button type="submit">Search Homes</button>
        </form>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="columns">
          <div>
            <h3>Sellers</h3>
            <p>Upload listings, set terms, receive payments.</p>
          </div>
          <div>
            <h3>Buyers</h3>
            <p>Apply, build equity, become mortgage-ready.</p>
          </div>
          <div>
            <h3>Platform</h3>
            <p>Handles contracts, escrow, and coaching.</p>
          </div>
        </div>
      </section>

      <footer>
        <p>&copy; 2025 HI AWTO</p>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Use</a>
      </footer>
    </div>
  );
}

export default Homepage;
