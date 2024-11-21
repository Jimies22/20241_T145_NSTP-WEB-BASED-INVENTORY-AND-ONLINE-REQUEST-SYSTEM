import React, { useState } from 'react';
import '../../css/ItemModals.css';

const ItemModal = ({ isActive, onClose, item }) => {
  const [bookingDate, setBookingDate] = useState('');

  if (!item) return null;

  const handleBooking = () => {
    // Implement booking logic here
    alert(`Item booked for ${bookingDate}`);
    onClose(); // Close the modal after booking
  };

  return (
    <div className={`modal ${isActive ? 'active' : ''}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Booking Item</h2>
        <div className="modal-cards">
          <div className="card">
            <h3>Item Information</h3>
            <div className="image-container">
              <img src={item.image || '/path/to/default/image.jpg'} alt={item.name} />
            </div>
            <p><strong>Item Name:</strong> <span>{item.name}</span></p>
            <p><strong>Item ID:</strong> <span>{item.item_id}</span></p>
            <p><strong>Description:</strong> <span>{item.description}</span></p>
            <p><strong>Availability:</strong> <span>{item.availability ? 'Available' : 'Unavailable'}</span></p>
            <label htmlFor="bookingDate">Select Booking Date:</label>
            <input 
              type="date" 
              id="bookingDate" 
              value={bookingDate} 
              onChange={(e) => setBookingDate(e.target.value)} 
            />
            <button onClick={handleBooking} disabled={!bookingDate}>Book Now</button>
          </div>
          <div className="card">
            <h3>Borrower Information</h3>
            <p><strong>Borrower Name:</strong> <span>{item.borrowerName}</span></p>
            <p><strong>Borrower ID:</strong> <span>{item.borrowerId}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;