import React, { useState } from "react";
import axios from "axios";
import "../../css/BorrowOverlay.css";

const BorrowOverlay = ({ item, onClose, updateItem }) => {
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate dates
    if (!borrowDate || !returnDate) {
      setError("Please select both dates");
      return;
    }

    if (new Date(returnDate) <= new Date(borrowDate)) {
      setError("Return date must be after borrow date");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = sessionStorage.getItem("sessionToken");

      const response = await axios.post(
        "http://localhost:3000/borrow",
        {
          //userId: sessionStorage.getItem("userId"),
          itemId: item._id,
          dateBorrow: borrowDate,
          dateReturn: returnDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.warn("Console test " + response + " " + token);
      // Update item status locally
      const updatedItem = {
        ...item,
        availability: false,
        status: "Pending",
      };
      updateItem(updatedItem);

      // Show success message and close
      alert("Borrow request submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Borrow request error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to submit borrow request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="borrow-overlay">
      <div className="borrow-modal">
        <h2>Borrow Request</h2>
        <h3>{item.name}</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="borrowDate">Borrow Date:</label>
            <input
              type="date"
              id="borrowDate"
              min={today}
              value={borrowDate}
              onChange={(e) => setBorrowDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="returnDate">Return Date:</label>
            <input
              type="date"
              id="returnDate"
              min={borrowDate || today}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BorrowOverlay;
