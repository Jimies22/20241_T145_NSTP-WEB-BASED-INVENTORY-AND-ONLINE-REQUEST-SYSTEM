import React, { useState } from "react";
import "../../css/BorrowOverlay.css";

const BorrowOverlay = ({ item, onClose }) => {
  const [borrowDate, setBorrowDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      itemId: item.id,
      borrowDate,
      startTime,
      endTime,
    });
    onClose();
  };

  return (
    <div className="borrow-overlay" onClick={onClose}>
      <div className="borrow-content" onClick={(e) => e.stopPropagation()}>
        <div className="header-area">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          <h2 className="item-title">{item.name}</h2>
          <div className="status-label">AVAILABLE</div>
        </div>

        <div className="booking-layout">
          <div className="item-image">
            <img src={item.image} alt={item.name} />
          </div>

          <div className="booking-form">
            <h3>Select Date and Time</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Borrow Date:</label>
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  required
                  placeholder="mm/dd/yyyy"
                  className="date-input"
                />
              </div>

              <div className="form-group">
                <label>Start Time:</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="time-input"
                />
              </div>

              <div className="form-group">
                <label>End Time:</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
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
    </div>
  );
};

export default BorrowOverlay;
