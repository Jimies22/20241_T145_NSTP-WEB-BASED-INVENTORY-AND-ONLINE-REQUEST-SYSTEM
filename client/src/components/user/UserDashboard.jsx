import React, { useState, useEffect } from "react";
import axios from "axios";
import UserSidebar from "../sidebar/UserSidebar";
import UserNavbar from "../navbar/UserNavbar";
import ItemModal from "./ItemModal";
import BorrowOverlay from "./BorrowOverlay";
import "../../css/UserDashboard.css";

const UserDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBorrowOverlay, setShowBorrowOverlay] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);

  // Fetch items when component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:3000/items");
      setItems(response.data);
      setFilteredItems(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch items");
      setLoading(false);
    }
  };

  const handleCardClick = (item) => {
    console.log("Card clicked:", item); // Debug log
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleBorrowItem = (item) => {
    setSelectedItem(item);
    setShowModal(false);
    setShowBorrowOverlay(true);
  };

  const handleCloseBorrowOverlay = () => {
    setShowBorrowOverlay(false);
    setSelectedItem(null);
  };

  const updateItem = (updatedItem) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.item_id === updatedItem.item_id ? updatedItem : item
      )
    );
    setFilteredItems((prevItems) =>
      prevItems.map((item) =>
        item.item_id === updatedItem.item_id ? updatedItem : item
      )
    );
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
              filteredItems.map((item) => (
                <div
                  className="card"
                  key={item.item_id}
                  onClick={() => handleCardClick(item)}
                >
                  <div className="card-image">
                    <img
                      src={item.image || "/default-image.jpg"}
                      alt={item.name}
                    />
                  </div>
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <p
                      className={`status ${
                        item.availability ? "available" : "unavailable"
                      }`}
                    >
                      {item.availability ? "Available" : "Unavailable"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {showModal && selectedItem && (
            <ItemModal
              isActive={showModal}
              onClose={handleCloseModal}
              item={selectedItem}
              onBorrow={handleBorrowItem}
            />
          )}

          {showBorrowOverlay && selectedItem && (
            <BorrowOverlay
              item={selectedItem}
              onClose={handleCloseBorrowOverlay}
              updateItem={updateItem}
            />
          )}
        </main>
      </section>
    </div>
  );
};

export default UserDashboard;
