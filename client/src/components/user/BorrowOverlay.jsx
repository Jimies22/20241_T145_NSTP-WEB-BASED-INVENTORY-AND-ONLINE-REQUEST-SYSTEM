import React, { useState, useEffect } from "react";
import "../../css/BorrowOverlay.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';

// Accepts: item (single), items (array), isBatch (bool), onClose
const BorrowOverlay = ({ item, items, isBatch, onClose }) => {
  const [borrowHour, setBorrowHour] = useState("5");
  const [borrowMinute, setBorrowMinute] = useState("00");
  const [returnHour, setReturnHour] = useState("6");
  const [returnMinute, setReturnMinute] = useState("00");
  const [returnPeriod, setReturnPeriod] = useState("AM");
  const [borrowPeriod, setBorrowPeriod] = useState("AM");
  const [userId, setUserId] = useState(null);
  const token = sessionStorage.getItem("sessionToken");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // For batch summary

  useEffect(() => {
    try {
      if (!token) return;
      const decodedToken = jwtDecode(token);
      if (decodedToken && decodedToken.userId) setUserId(decodedToken.userId);
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }, []);

  useEffect(() => {
    const currentTime = new Date();
    const adjustedBorrowDate = new Date(currentTime.getTime() + 60 * 60 * 1000);
    setBorrowHour(adjustedBorrowDate.getHours() % 12 || 12);
    setBorrowMinute(adjustedBorrowDate.getMinutes().toString().padStart(2, "0"));
    setBorrowPeriod(adjustedBorrowDate.getHours() >= 12 ? "PM" : "AM");
    const adjustedReturnDate = new Date(adjustedBorrowDate.getTime() + 60 * 60 * 1000);
    setReturnHour(adjustedReturnDate.getHours() % 12 || 12);
    setReturnMinute(adjustedReturnDate.getMinutes().toString().padStart(2, "0"));
    setReturnPeriod(adjustedReturnDate.getHours() >= 12 ? "PM" : "AM");
  }, []);

  const handleBorrowTimeChange = (hour, minute, period) => {
    setBorrowHour(hour);
    setBorrowMinute(minute);
    setBorrowPeriod(period);
    const borrowDate = createDate(hour, minute, period);
    const newReturnDate = new Date(borrowDate.getTime() + 60 * 60 * 1000);
    setReturnHour(newReturnDate.getHours() % 12 || 12);
    setReturnMinute(newReturnDate.getMinutes().toString().padStart(2, "0"));
    setReturnPeriod(newReturnDate.getHours() >= 12 ? "PM" : "AM");
  };

  const createDate = (hour, minute, period) => {
    const date = new Date();
    if (period === "PM" && hour < 12) hour = parseInt(hour) + 12;
    else if (period === "AM" && parseInt(hour) === 12) hour = 0;
    date.setHours(hour, minute, 0);
    return date;
  };

  // Batch or single submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    const requestDate = new Date();
    const borrowDate = createDate(borrowHour, borrowMinute, borrowPeriod);
    const returnDate = createDate(returnHour, returnMinute, returnPeriod);
    if (isBatch && Array.isArray(items)) {
      // Batch mode
      let success = [], fail = [];
      for (const it of items) {
        try {
          const response = await axios.post(
            "http://localhost:3000/borrow",
            {
              userId,
              item: it._id,
              borrowDate: borrowDate.toISOString(),
              returnDate: returnDate.toISOString(),
              requestDate: requestDate.toISOString(),
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          success.push(it.name);
        } catch (error) {
          fail.push(it.name);
        }
      }
      setResults({ success, fail });
      setLoading(false);
      Swal.fire({
        icon: 'info',
        title: 'Batch Borrow Results',
        html: `<div style='text-align:left;'>${success.length ? `<b>Success:</b><ul>${success.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}${fail.length ? `<b>Failed:</b><ul>${fail.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}</div>`,
        confirmButtonColor: '#3085d6'
      }).then(() => onClose());
      return;
    } else {
      // Single mode
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
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `You have successfully requested to borrow ${item.name}.`,
          confirmButtonColor: '#3085d6'
        }).then(() => onClose());
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to borrow item: ${item.name}. ${error.message}`,
          confirmButtonColor: '#3085d6'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Render list of items in batch mode
  const renderBatchList = () => (
    <div className="batch-list">
      <h4>Selected Items:</h4>
      <ul>
        {items.map((it) => (
          <li key={it._id || it.item_id}>{it.name}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="borrow-overlay" onClick={onClose}>
      <div className="borrow-content" onClick={(e) => e.stopPropagation()}>
        <div className="header-area">
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="booking-layout">
          <h3>{isBatch ? 'Select Time for All Items' : 'Select Time'}</h3>
          {isBatch && Array.isArray(items) && renderBatchList()}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Borrow Time:</label>
              <div className="time-input">
                <select value={borrowHour} onChange={e => handleBorrowTimeChange(e.target.value, borrowMinute, borrowPeriod)}>
                  {[...Array(12).keys()].map((hour) => (
                    <option key={hour} value={hour + 1}>{hour + 1}</option>
                  ))}
                </select>
                <select value={borrowMinute} onChange={e => handleBorrowTimeChange(borrowHour, e.target.value, borrowPeriod)}>
                  {["00", "15", "30", "45"].map((minute) => (
                    <option key={minute} value={minute}>{minute}</option>
                  ))}
                </select>
                <select value={borrowPeriod} onChange={e => handleBorrowTimeChange(borrowHour, borrowMinute, e.target.value)}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Return Time:</label>
              <div className="time-input">
                <select value={returnHour} onChange={e => setReturnHour(e.target.value)}>
                  {[...Array(12).keys()].map((hour) => (
                    <option key={hour} value={hour + 1}>{hour + 1}</option>
                  ))}
                </select>
                <select value={returnMinute} onChange={e => setReturnMinute(e.target.value)}>
                  {["00", "15", "30", "45"].map((minute) => (
                    <option key={minute} value={minute}>{minute}</option>
                  ))}
                </select>
                <select value={returnPeriod} onChange={e => setReturnPeriod(e.target.value)}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <button type="submit" className="book-now-btn" disabled={loading}>
              {loading ? (isBatch ? "Booking All..." : "Booking...") : (isBatch ? "Book All" : "Book Now")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BorrowOverlay;
