import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../sidebar/UserSidebar";
import UserNavbar from "../Navbar/UserNavbar";
import "../../css/UserDashboard.css";
import axios from "axios";
import BorrowOverlay from "./BorrowOverlay";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBorrowOverlay, setShowBorrowOverlay] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("sessionToken");
    if (!token) {
      navigate("/login");
    } else {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        sessionStorage.removeItem("sessionToken");
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:3000/items");
      setItems(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (updatedItem) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.item_id === updatedItem.item_id ? updatedItem : item
      )
    );
  };

  const handleCardClick = async (item) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/items/${item.item_id}`
      );
      setSelectedItem(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching item details:", error);
      setError("Failed to fetch item details");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleBorrowItem = (item) => {
    setSelectedItem(item);
    setShowBorrowOverlay(true);
  };

  const handleCloseBorrowOverlay = () => {
    setShowBorrowOverlay(false);
    setSelectedItem(null);
  };

  const filteredItems = items.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/path/to/default/image.jpg";
    return `http://localhost:3000${imagePath}`;
  };

  return (
    <div className="user-dashboard">
      <UserSidebar />
      <section id="content">
        <UserNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Dashboard</h1>
              <ul className="breadcrumb">
                                <li><a href="#">Dashboard</a></li>
                                <li><i className='bx bx-chevron-right'></i></li>
                                <li><a className="active" href="/user-dashboard">Home</a></li>
                            </ul>
            </div>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="card-container">
            {loading ? (
              <p>Loading items...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              filteredItems.map((item) => (
                <div
                  className="card"
                  key={item.item_id}
                  onClick={() => handleCardClick(item)}
                >
                  <div className="card-image">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/path/to/default/image.jpg";
                      }}
                    />
                  </div>
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <p className="availability">
                      {item.availability ? "AVAILABLE" : "UNAVAILABLE"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {showModal && selectedItem && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="item-info-card">
                  <h1>{selectedItem.name}</h1>
                  <img
                    src={getImageUrl(selectedItem.image)}
                    alt={selectedItem.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/path/to/default/image.jpg";
                    }}
                  />
                  <p>
                    <strong>Item ID:</strong> {selectedItem.item_id}
                  </p>
                  <p>
                    <strong>Description:</strong> {selectedItem.description}
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedItem.category}
                  </p>
                  <p>
                    <strong>Availability:</strong>{" "}
                    {selectedItem.availability ? "AVAILABLE" : "UNAVAILABLE"}
                  </p>
                  <button onClick={handleCloseModal}>Close</button>
                </div>
                <div className="borrow-card">
                  <button
                    onClick={() => handleBorrowItem(selectedItem)}
                    disabled={!selectedItem.availability}
                  >
                    Borrow
                  </button>
                </div>
              </div>
            </div>
          )}
          {showBorrowOverlay && (
            <BorrowOverlay
              item={selectedItem}
              onClose={handleCloseBorrowOverlay}
            />
          )}
        </main>
      </section>
    </div>
  );
};

export default UserDashboard;
