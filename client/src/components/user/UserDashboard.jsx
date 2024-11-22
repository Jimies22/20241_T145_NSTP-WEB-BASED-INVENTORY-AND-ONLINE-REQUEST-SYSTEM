<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../sidebar/UserSidebar';
import UserNavbar from '../Navbar/UserNavbar';
import '../../css/UserDashboard.css';
import axios from 'axios';
import BorrowOverlay from './BorrowOverlay';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showBorrowOverlay, setShowBorrowOverlay] = useState(false);
=======
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../sidebar/UserSidebar";
import UserNavbar from "../Navbar/UserNavbar";
import "../../css/UserDashboard.css";
import axios from "axios";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
>>>>>>> 2e3e526e2e4830c7cc40b523ab92eaef709cc5f7

  useEffect(() => {
    const token = sessionStorage.getItem("sessionToken");
    if (!token) {
      navigate("/login");
    } else {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        sessionStorage.removeItem("sessionToken");
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:3000/items");
      setItems(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
    const updateItem = (updatedItem) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.item_id === updatedItem.item_id ? updatedItem : item
            )
        );
    };

    const handleCardClick = async (item) => {
        try {
            const response = await axios.get(`http://localhost:3000/items/${item.item_id}`);
            setSelectedItem(response.data);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching item details:', error);
            setError('Failed to fetch item details');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    const handleBorrowItem = (item) => {
        setSelectedItem(item);
        setShowBorrowOverlay(true);
    };

    const handleCloseBorrowOverlay = () => {
        setShowBorrowOverlay(false);
        setSelectedItem(null);
    };

    return (
        <div className="user-dashboard">
            <UserSidebar />
            <section id="content">
                <UserNavbar />
                <main>
                    <div className="head-title">
                        <div className="left">
                            <h1>Dashboard</h1>
                        </div>
                    </div>

                    <div className="card-container">
                        {loading ? (
                            <p>Loading items...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            items.map(item => (
                                <div className="card" key={item.item_id} onClick={() => handleCardClick(item)}>
                                    <div className="card-image">
                                        <img src={item.image || '/path/to/default/image.jpg'} alt={item.name} />
                                    </div>
                                    <div className="card-content">
                                        <h3>{item.name}</h3>
                                        <p className="availability">{item.availability ? 'AVAILABLE' : 'UNAVAILABLE'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {showModal && selectedItem && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <div className="item-info-card">
                                    <h1>{selectedItem.name}</h1>
                                    <img src={selectedItem.image || '/path/to/default/image.jpg'} alt={selectedItem.name} />
                                    <p><strong>Item ID:</strong> {selectedItem.item_id}</p>
                                    <p><strong>Description:</strong> {selectedItem.description}</p>
                                    <p><strong>Category:</strong> {selectedItem.category}</p>
                                    <p><strong>Availability:</strong> {selectedItem.availability ? 'AVAILABLE' : 'UNAVAILABLE'}</p>
                                    <button onClick={handleCloseModal}>Close</button>
                                </div>
                                <div className="borrow-card">
                                    <button onClick={() => handleBorrowItem(selectedItem)} disabled={!selectedItem.availability}>
                                        Borrow
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showBorrowOverlay && (
                        <BorrowOverlay item={selectedItem} onClose={handleCloseBorrowOverlay} />
                    )}
                </main>
            </section>
        </div>
=======
  const updateItem = (updatedItem) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.item_id === updatedItem.item_id ? updatedItem : item
      )
>>>>>>> 2e3e526e2e4830c7cc40b523ab92eaef709cc5f7
    );
  };

  const handleCardClick = async (item) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/items/${item.item_id}`
      );
      setSelectedItem(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching item details:", error);
      setError("Failed to fetch item details");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleBorrow = () => {};

  return (
    <div className="user-dashboard">
      <UserSidebar />
      <section id="content">
        <UserNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Dashboard</h1>
            </div>
          </div>

          <div className="card-container">
            {loading ? (
              <p>Loading items...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              items.map((item) => (
                <div
                  className="card"
                  key={item.item_id}
                  onClick={() => handleCardClick(item)}
                >
                  <div className="card-image">
                    <img
                      src={item.image || "/path/to/default/image.jpg"}
                      alt={item.name}
                    />
                  </div>
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <p className="availability">
                      {item.availability ? "AVAILABLE" : "UNAVAILABLE"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {showModal && selectedItem && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h1>{selectedItem.name}</h1>
                <img
                  src={selectedItem.image || "/path/to/default/image.jpg"}
                  alt={selectedItem.name}
                />
                <p>
                  <strong>Item ID:</strong> {selectedItem.item_id}
                </p>
                <p>
                  <strong>Description:</strong> {selectedItem.description}
                </p>
                <p>
                  <strong>Category:</strong> {selectedItem.category}
                </p>
                <p>
                  <strong>Availability:</strong>{" "}
                  {selectedItem.availability ? "AVAILABLE" : "UNAVAILABLE"}
                </p>
                <div>
                  <button onClick={handleBorrow}>Borrow</button>
                  <button onClick={handleCloseModal}>Close</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </section>
    </div>
  );
};

export default UserDashboard;
