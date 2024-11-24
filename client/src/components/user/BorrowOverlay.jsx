import React, { useState } from "react";
import "../../css/BorrowOverlay.css";
import axios from "axios";

const BorrowOverlay = ({ item, onClose }) => {
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const userId = sessionStorage.getItem("userId"); // Assuming userId is stored in sessionStorage

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(returnDate) <= new Date(borrowDate)) {
      alert("Return date must be after borrow date.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/items/borrow", {
        userId,
        itemId: item.item_id,
        borrowDate,
        returnDate,
      });
      alert(`You have successfully borrowed ${item.name}`);
      onClose(); // Close the overlay after successful borrowing
    } catch (error) {
      console.error("Error borrowing item:", error);
      alert("Failed to borrow item");
    }
  };

  return (
    <div className="borrow-overlay" onClick={onClose}>
      <div className="borrow-content" onClick={(e) => e.stopPropagation()}>
        <div className="header-area">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          <h2 className="item-title">{item.name}</h2>
        </div>

        <div className="booking-layout">
          <h3>Select Date</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Borrow Date:</label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                required
                className="date-input"
              />
            </div>

            <div className="form-group">
              <label>Return Date:</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
                className="date-input"
              />
            </div>

            <button type="submit" className="book-now-btn">
              Book Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BorrowOverlay;
