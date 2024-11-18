import React from "react";
import "../../css/ItemModals.css";

const ItemModal = ({ isActive, onClose, item }) => {
  if (!item) return null;

  return (
    <div className={`modal ${isActive ? "active" : ""}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2
          style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}
        >
          Item Details
        </h2>
        <div className="modal-cards">
          <div className="card">
            <h3>Borrower Information</h3>
            <div className="image-container">
              <img
                src="/img/Screen-Shot-2024-06-11-at-11.54.30-AM-e1718634535872.webp"
                alt="Borrower"
              />
            </div>
            <p>
              <strong>Borrower Name:</strong> <span>{item.borrowerName}</span>
            </p>
            <p>
              <strong>Borrower ID:</strong> <span>{item.borrowerId}</span>
            </p>
          </div>
          <div className="card">
            <h3>Item Information</h3>
            <div className="image-container">
              <img src="/img/DLP.webp" alt="Item" />
            </div>
            <p>
              <strong>Item ID:</strong> <span>{item.itemId}</span>
            </p>
            <p>
              <strong>Item Name:</strong> <span>{item.itemName}</span>
            </p>
            <p>
              <strong>Item Description:</strong>{" "}
              <span>{item.itemDescription}</span>
            </p>
            <p>
              <strong>Date and Time Booked:</strong>{" "}
              <span>{item.itemDateTime}</span>
            </p>
            <p>
              <strong>Date and Time Request Accepted:</strong>{" "}
              <span>{item.requestAccepted}</span>
            </p>
            <p>
              <strong>Date and Time Item Returned:</strong>{" "}
              <span>{item.itemReturned}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;
