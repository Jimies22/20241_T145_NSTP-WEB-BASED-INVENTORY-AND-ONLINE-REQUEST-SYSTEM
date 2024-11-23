import React from "react";
import "../../css/ItemModals.css";

const ItemModal = ({ isActive, onClose, item, onBorrow }) => {
  if (!item) return null;

  return (
    <div className={`modal ${isActive ? "active" : ""}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>

        <h2>Item Details</h2>

        <div className="modal-body">
          <div className="item-image">
            <img src={item.image || "/default-image.jpg"} alt={item.name} />
          </div>

          <div className="item-details">
            <h3>{item.name}</h3>
            <p>
              <strong>Description:</strong> {item.description}
            </p>
            <p>
              <strong>Status:</strong>
              <span
                className={`status ${
                  item.availability ? "available" : "unavailable"
                }`}
              >
                {item.availability ? "Available" : "Unavailable"}
              </span>
            </p>

            <div className="button-group">
              <button
                className="borrow-button"
                onClick={() => onBorrow(item)}
                disabled={!item.availability}
              >
                {item.availability
                  ? "Borrow This Item"
                  : "Currently Unavailable"}
              </button>
              <button className="cancel-button" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;
