import React, { useState } from "react";

function BookingOverlay({ item, onClose }) {
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const handleBooking = async () => {
    if (!bookingDate || !startTime) {
      alert("Please select date and time");
      return;
    }

    try {
      // Add your booking logic here
      const requestItem = {
        id: "req_" + Date.now(),
        title: item.title,
        image: item.image,
        date: new Date(bookingDate).toLocaleDateString(),
        time: new Date(`2000/01/01 ${startTime}`).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "Pending",
        itemStatus: item.status,
      };

      // Store in localStorage (this should be replaced with API calls)
      const requestedItems =
        JSON.parse(localStorage.getItem("requestedItems")) || [];
      requestedItems.unshift(requestItem);
      localStorage.setItem("requestedItems", JSON.stringify(requestedItems));

      alert("Booking submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Booking error:", error);
      alert("Error submitting booking. Please try again.");
    }
  };

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="overlay-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <div className="item-details">
          <img src={item.image} alt={item.title} />
          <div className="details">
            <h2>{item.title}</h2>
            <p className={`status ${item.status.toLowerCase()}`}>
              {item.status}
            </p>

            <div className="booking-details">
              <div className="date-picker">
                <h3>Select Date and Time</h3>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
                <div className="time-slots">
                  <div className="time-picker">
                    <label>Borrow Time:</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button className="borrow-btn" onClick={handleBooking}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingOverlay;
