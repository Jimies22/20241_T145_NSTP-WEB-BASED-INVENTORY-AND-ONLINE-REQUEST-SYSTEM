import React, { useState, useEffect } from "react";
import "../../css/ItemModals.css";

const ItemModal = ({
  isActive,
  onClose,
  item,
  onSave,
  onDelete,
  onArchive,
}) => {
  const [formData, setFormData] = useState({
    item_id: "",
    name: "",
    description: "",
    category: "",
    availability: true,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        item_id: item.item_id,
        name: item.name,
        description: item.description,
        category: item.category,
        availability: item.availability,
      });
    }
  }, [item]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    onSave(formData); // Call the save function passed as a prop
  };

  return (
    <div className={`modal ${isActive ? "active" : ""}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>

        <h2>{item ? "Edit Item" : "Add Item"}</h2>

        <div className="modal-body">
          <div className="form-group">
            <label>Item ID:</label>
            <input
              type="text"
              name="item_id"
              value={formData.item_id}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>
              Availability:
              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave}>
            {item ? "Update Item" : "Add Item"}
          </button>
          {item && (
            <>
              <button
                className="btn btn-warning"
                onClick={() => onArchive(item.item_id)}
              >
                Archive Item
              </button>
              <button
                className="btn btn-danger"
                onClick={() => onDelete(item.item_id)}
              >
                Delete Item
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;
