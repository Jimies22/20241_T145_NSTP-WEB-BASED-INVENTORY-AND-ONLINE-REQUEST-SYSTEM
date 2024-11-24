import React, { useState } from "react";
import "../../css/BorrowOverlay.css";
import axios from "axios";

const BorrowOverlay = ({ item, onClose }) => {
  const [borrowHour, setBorrowHour] = useState("12"); // Default hour
  const [borrowMinute, setBorrowMinute] = useState("00"); // Default minute
  const [borrowPeriod, setBorrowPeriod] = useState("AM"); // Default period
  const [returnHour, setReturnHour] = useState("12"); // Default hour
  const [returnMinute, setReturnMinute] = useState("15"); // Default minute
  const [returnPeriod, setReturnPeriod] = useState("AM"); // Default period
  const userId = sessionStorage.getItem("userId"); // Assuming userId is stored in sessionStorage

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate that return time is after borrow time
    const borrowTime = `${borrowHour}:${borrowMinute} ${borrowPeriod}`;
    const returnTime = `${returnHour}:${returnMinute} ${returnPeriod}`;

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
              <div className="time-input">
                <select
                  value={borrowHour}
                  onChange={(e) => setBorrowHour(e.target.value)}
                >
                  {[...Array(12).keys()].map((hour) => (
                    <option
                      key={hour}
                      value={(hour + 1).toString().padStart(2, "0")}
                    >
                      {(hour + 1).toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select
                  value={borrowMinute}
                  onChange={(e) => setBorrowMinute(e.target.value)}
                >
                  {["00", "15", "30", "45"].map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
                <select
                  value={borrowPeriod}
                  onChange={(e) => setBorrowPeriod(e.target.value)}
                >
                  {["AM", "PM"].map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Return Time:</label>
              <div className="time-input">
                <select
                  value={returnHour}
                  onChange={(e) => setReturnHour(e.target.value)}
                >
                  {[...Array(12).keys()].map((hour) => (
                    <option
                      key={hour}
                      value={(hour + 1).toString().padStart(2, "0")}
                    >
                      {(hour + 1).toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select
                  value={returnMinute}
                  onChange={(e) => setReturnMinute(e.target.value)}
                >
                  {["00", "15", "30", "45"].map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
                <select
                  value={returnPeriod}
                  onChange={(e) => setReturnPeriod(e.target.value)}
                >
                  {["AM", "PM"].map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
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
