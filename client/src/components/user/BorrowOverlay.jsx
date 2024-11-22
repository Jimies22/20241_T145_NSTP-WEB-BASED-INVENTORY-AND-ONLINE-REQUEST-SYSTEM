import React, { useState } from 'react';
import '../../css/BorrowOverlay.css';
import axios from 'axios';

const BorrowOverlay = ({ item, onClose }) => {
    const [borrowDate, setBorrowDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState(null); // State for error handling

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/items/borrow', {
                itemId: item.item_id,
                borrowDate,
                startTime,
                endTime
            });
            alert(`You have successfully borrowed ${item.name}`);
            onClose(); // Close the overlay after successful borrowing
        } catch (error) {
            console.error('Error borrowing item:', error);
            setError('Failed to borrow item'); // Set error message
        }
    };

    return (
        <div className="borrow-overlay" onClick={onClose}>
            <div className="borrow-content" onClick={e => e.stopPropagation()}>
                <div className="header-area">
                    <button className="close-btn" onClick={onClose}>×</button>
                    <h2 className="item-title">{item.name}</h2>
                </div>

                {error && <p className="error-message">{error}</p>} {/* Display error message */}

                <div className="booking-layout">
                    <h3>Select Date and Time</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Borrow Date:</label>
                            <input
                                type="date"
                                value={borrowDate}
                                onChange={(e) => setBorrowDate(e.target.value)}
                                required
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
    );
};

export default BorrowOverlay;