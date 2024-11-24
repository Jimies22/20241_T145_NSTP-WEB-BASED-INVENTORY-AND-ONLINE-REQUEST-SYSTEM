import React, { useState } from "react";
import "../../css/BorrowOverlay.css";
import axios from "axios";

const BorrowOverlay = ({ item, onClose }) => {
  const [borrowTime, setBorrowTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const userId = sessionStorage.getItem("userId"); // Assuming userId is stored in sessionStorage

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (returnTime <= borrowTime) {
      alert("Return time must be after borrow time.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/borrow", {
        item: item._id,
        borrowTime,
        returnTime,
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
          <h3>Select Time</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Borrow Time:</label>
              <input
                type="time"
                value={borrowTime}
                onChange={(e) => setBorrowTime(e.target.value)}
                required
                className="time-input"
              />
            </div>

            <div className="form-group">
              <label>Return Time:</label>
              <input
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                required
                className="time-input"
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
