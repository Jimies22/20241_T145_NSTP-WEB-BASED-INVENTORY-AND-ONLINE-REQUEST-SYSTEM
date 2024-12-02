import React, { useState, useEffect } from "react";
import "../../css/BorrowOverlay.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const BorrowOverlay = ({ item, onClose }) => {
  const [borrowHour, setBorrowHour] = useState("5"); // Default hour
  const [borrowMinute, setBorrowMinute] = useState("00"); // Default minute
  const [returnHour, setReturnHour] = useState("5"); // Default hour
  const [returnMinute, setReturnMinute] = useState("00"); // Default minute
  const [returnPeriod, setReturnPeriod] = useState("AM"); // AM/PM for return time
  const [borrowPeriod, setBorrowPeriod] = useState("AM"); // AM/PM for borrow time
  const [userId, setUserId] = useState(null); // State to store userId
  const token = sessionStorage.getItem("sessionToken");
  const [loading, setLoading] = useState(false); // Add loading state

  // Function to fetch userId from the token
  const fetchUserId = () => {
    try {
      if (!token) {
        console.warn("No token found in session storage");
        return;
      }

      const decodedToken = jwtDecode(token);

      if (!decodedToken || !decodedToken.userId) {
        throw new Error("Invalid token structure: userId not found");
      }

      console.log("Decoded Token:", decodedToken); // Optional: useful for debugging
      setUserId(decodedToken.userId);
    } catch (error) {
      console.error("Failed to fetch or decode token:", error.message || error);
    }
  };

  // Call fetchUserId when the component mounts
  useEffect(() => {
    fetchUserId();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestDate = new Date(); // Get current date in local time

    // Set borrow date to selected borrow hour and minute
    const borrowDate = new Date();
    borrowDate.setHours(
      borrowPeriod === "PM" ? parseInt(borrowHour) + 12 : parseInt(borrowHour),
      parseInt(borrowMinute),
      0
    );
    borrowDate.setDate(new Date().getDate()); // Ensure it's set to today

    // Set return date to selected return hour and minute
    const returnDate = new Date();
    returnDate.setHours(
      returnPeriod === "PM" ? parseInt(returnHour) + 12 : parseInt(returnHour),
      parseInt(returnMinute),
      0
    );
    returnDate.setDate(new Date().getDate()); // Ensure it's set to today

    // Get the current time for comparison
    const currentTime = new Date();

    // Log the dates for debugging
    console.log("Current Time:", currentTime);
    console.log("Borrow Date:", borrowDate);
    console.log("Return Date:", returnDate);

    // Validate that the selected time is not in the past
    if (borrowDate < currentTime) {
      alert("Borrow time cannot be in the past.");
      return;
    }

    // Validate that the selected time is within allowed hours (5 AM to 5 PM)
    if (borrowDate.getHours() < 5 || borrowDate.getHours() > 17) {
      alert("Borrow time must be between 5 AM and 5 PM.");
      return;
    }

    // Validate that return time is after borrow time
    if (returnDate <= borrowDate) {
      alert("Return time must be after borrow time.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/borrow",
        {
          userId,
          item: item._id,
          borrowDate: borrowDate.toISOString(), // Match backend field name
          returnDate: returnDate.toISOString(), // Match backend field name
          requestDate: requestDate.toISOString(), // Match backend field name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add authorization header
          },
        }
      );

      alert(
        `You have successfully borrowed ${item.name}. Item ID: ${
          item._id
        }. Borrow Date: ${borrowDate.toISOString()}. Return Date: ${returnDate.toISOString()}. User ID: ${userId}. Request Date: ${requestDate.toISOString()}`
      );
      onClose();
    } catch (error) {
      console.error("Error submitting request:", error); // Log the error for debugging
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
                  {[...Array(12).keys()].map((hour) => (
                    <option key={hour} value={hour + 1}>
                      {hour + 1}
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
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
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
                    <option key={hour} value={hour + 1}>
                      {hour + 1}
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
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <button type="submit" className="book-now-btn" disabled={loading}>
              {loading ? "Booking..." : "Book Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BorrowOverlay;
