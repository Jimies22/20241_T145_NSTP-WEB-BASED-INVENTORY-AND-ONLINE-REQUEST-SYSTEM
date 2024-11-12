// Import necessary libraries
import React from 'react';
import '../components/styles/Dashboard.css'; // Import the CSS file
import '../components/styles/Dashboard.css';
// Main component
const Dashboard = () => {
  return (
    <div>
      <section id="sidebar">
        <a href="#" className="brand">Brand</a>
        <ul className="side-menu">
          <li className="active">
            <a href="#">Dashboard</a>
          </li>
          {/* Add more menu items as needed */}
        </ul>
      </section>
      <section id="content">
        <nav>
          {/* Add navbar content here */}
        </nav>
        <main>
          <div className="card-container">
            <div className="card">
              <img src="img/DLP.webp" alt="Epson Projector" />
              <p className="product-name">Epson 703HD Powerlite Home Cinema LCD Projector</p>
              <p className="availability">AVAILABLE</p>
            </div>
            {/* Add more cards as needed */}
          </div>
        </main>
      </section>
    </div>
  );
};

export default Dashboard;
