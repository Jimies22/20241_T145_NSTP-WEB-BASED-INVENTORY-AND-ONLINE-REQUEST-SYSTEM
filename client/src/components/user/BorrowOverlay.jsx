import React, { useState, useEffect } from "react";
import "../../css/BorrowOverlay.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const BorrowOverlay = ({ item, onClose }) => {
  const [borrowHour, setBorrowHour] = useState("5"); // Default hour
  const [borrowMinute, setBorrowMinute] = useState("00"); // Default minute
  const [returnHour, setReturnHour] = useState("6"); // Default return hour (1 hour after borrow)
  const [returnMinute, setReturnMinute] = useState("00"); // Default return minute
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

  useEffect(() => {
    const currentTime = new Date();
    const adjustedBorrowDate = new Date(currentTime.getTime() + 60 * 60 * 1000); // Add 1 hour

    setBorrowHour(adjustedBorrowDate.getHours() % 12 || 12); // Convert to 12-hour format
    setBorrowMinute(
      adjustedBorrowDate.getMinutes().toString().padStart(2, "0")
    ); // Format minutes
    setBorrowPeriod(adjustedBorrowDate.getHours() >= 12 ? "PM" : "AM");

    // Set return time to 1 hour after borrow time
    const adjustedReturnDate = new Date(
      adjustedBorrowDate.getTime() + 60 * 60 * 1000
    ); // Add 1 hour
    setReturnHour(adjustedReturnDate.getHours() % 12 || 12); // Convert to 12-hour format
    setReturnMinute(
      adjustedReturnDate.getMinutes().toString().padStart(2, "0")
    ); // Format minutes
    setReturnPeriod(adjustedReturnDate.getHours() >= 12 ? "PM" : "AM");
  }, []);

  const handleBorrowTimeChange = (hour, minute, period) => {
    setBorrowHour(hour);
    setBorrowMinute(minute);
    setBorrowPeriod(period);

    // Update return time to be 1 hour after the new borrow time
    const borrowDate = createDate(hour, minute, period);
    const newReturnDate = new Date(borrowDate.getTime() + 60 * 60 * 1000); // Add 1 hour
    setReturnHour(newReturnDate.getHours() % 12 || 12); // Convert to 12-hour format
    setReturnMinute(newReturnDate.getMinutes().toString().padStart(2, "0")); // Format minutes
    setReturnPeriod(newReturnDate.getHours() >= 12 ? "PM" : "AM");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestDate = new Date(); // Get current date in local time

    // Helper function to create a date object
    const createDate = (hour, minute, period) => {
      const date = new Date(); // Get the current date
      console.log("Date:", date.toString());
      // Set hours correctly for AM/PM
      if (period === "PM" && hour < 12) {
        hour += 12; // Convert PM hour to 24-hour format
      } else if (period === "AM" && hour === 12) {
        hour = 0; // Convert 12 AM to 0 hours
      }
      date.setHours(hour, minute, 0); // Set the hours and minutes
      console.log("Date:", date.toString());
      return date;
    };

    const borrowDate = createDate(borrowHour, borrowMinute, borrowPeriod);
    const returnDate = createDate(returnHour, returnMinute, returnPeriod);

    // Log the dates for debugging
    console.log("Borrow Date:", borrowDate.toString());
    console.log("Return Date:", returnDate.toString());

    // Validate that the selected time is not in the past
    if (borrowDate < new Date()) {
      alert("Borrow time cannot be in the past.");
      return;
    }

    // // Validate that borrow time is between 5 AM and 5 PM
    // if (borrowDate.getHours() < 5 || borrowDate.getHours() > 17) {
    //   alert("Borrow time must be between 5 AM and 5 PM.");
    //   return;
    // }

    // Validate that return time is after borrow time
    if (returnDate <= borrowDate) {
      alert("Return time must be after borrow time.");
      return;
    }

    // Validate that return time is also within the allowed hours (5 AM to 5 PM)
    if (returnDate.getHours() < 5 || returnDate.getHours() > 17) {
      alert("Return time must be between 5 AM and 5 PM.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/borrow",
        {
          userId,
          item: item._id,
          borrowDate: borrowDate.toISOString(),
          returnDate: returnDate.toISOString(),
          requestDate: requestDate.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`You have successfully borrowed ${item.name}.`);
      onClose();
    } catch (error) {
      console.error("Error submitting request:", error);
      alert(`Failed to borrow item: ${item.name}. Error: ${error.message}`);
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
                  onChange={(e) =>
                    handleBorrowTimeChange(
                      e.target.value,
                      borrowMinute,
                      borrowPeriod
                    )
                  }
                >
                  {[...Array(12).keys()].map((hour) => (
                    <option key={hour} value={hour + 1}>
                      {hour + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={borrowMinute}
                  onChange={(e) =>
                    handleBorrowTimeChange(
                      borrowHour,
                      e.target.value,
                      borrowPeriod
                    )
                  }
                >
                  {["00", "15", "30", "45"].map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
                <select
                  value={borrowPeriod}
                  onChange={(e) =>
                    handleBorrowTimeChange(
                      borrowHour,
                      borrowMinute,
                      e.target.value
                    )
                  }
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
