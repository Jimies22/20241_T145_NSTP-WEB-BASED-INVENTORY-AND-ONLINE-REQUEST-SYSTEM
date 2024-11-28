import React, { useState, useEffect } from "react";
import "../../css/BorrowOverlay.css";
import axios from "axios";

const BorrowOverlay = ({ item, onClose }) => {
  const [borrowHour, setBorrowHour] = useState("12"); // Default hour
  const [borrowMinute, setBorrowMinute] = useState("00"); // Default minute
  const [returnHour, setReturnHour] = useState("12"); // Default hour
  const [returnMinute, setReturnMinute] = useState("15"); // Default minute
  const [userId, setUserId] = useState(null); // State to store userId
  const token = sessionStorage.getItem("sessionToken");

  const fetchUserId = async () => {
    // Retrieve JWT token from sessionStorage
    try {
      console.log("Token:", token); // Log the token
      const response = await axios.get("http://localhost:3000/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("User ID response:", response.data); // Log the response
      setUserId(response.data.userId);
    } catch (error) {
      console.error("Error retrieving user ID:", error);
    }
  };

  // Call fetchUserId when the component mounts
  useEffect(() => {
    fetchUserId();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const borrowDate = new Date(); // Current date
    borrowDate.setHours(borrowHour, borrowMinute); // Set hours and minutes
    const borrowTime = borrowDate.toISOString(); // Define borrowTime

    const returnDate = new Date(); // Current date
    returnDate.setHours(returnHour, returnMinute); // Set hours and minutes
    const returnTime = returnDate.toISOString(); // Define returnTime

    try {
      const response = await axios.post("http://localhost:3000/borrow", {
        userId,
        item: item._id,
        borrowTime,
        returnTime,
      });
      alert(`You have successfully borrowed ${item.name}`);
      onClose();
    } catch (error) {
      alert(
        `Failed to borrow item: ${item.name}. Error: ${
          error.message
        }. Item ID: ${
          item._id
        }. Borrow Date: ${borrowDate.toISOString()}. Return Date: ${returnDate.toISOString()}. User ID: ${userId}`
      );
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
                  {[...Array(24).keys()].map(
                    (
                      hour // Change to 24-hour format
                    ) => (
                      <option
                        key={hour}
                        value={hour.toString().padStart(2, "0")}
                      >
                        {hour.toString().padStart(2, "0")}
                      </option>
                    )
                  )}
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
              </div>
            </div>

            <div className="form-group">
              <label>Return Time:</label>
              <div className="time-input">
                <select
                  value={returnHour}
                  onChange={(e) => setReturnHour(e.target.value)}
                >
                  {[...Array(24).keys()].map(
                    (
                      hour // Change to 24-hour format
                    ) => (
                      <option
                        key={hour}
                        value={hour.toString().padStart(2, "0")}
                      >
                        {hour.toString().padStart(2, "0")}
                      </option>
                    )
                  )}
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
