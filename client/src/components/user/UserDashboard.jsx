import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../sidebar/UserSidebar";
import UserNavbar from "../Navbar/UserNavbar";
import "../../css/UserDashboard.css";
import axios from "axios";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleItem = () => {};

  return (
    <div className="user-dashboard">
      <UserSidebar />
      <section id="content">
        <UserNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Dashboard</h1>
            </div>
          </div>

          <div
            className="card-container"
            style={{ display: "flex", flexWrap: "wrap" }}
          >
            {loading ? (
              <p>Loading items...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              items.map((item) => (
                <div
                  className="card"
                  key={item.item_id}
                  onClick={() => handleCardClick(item)}
                  style={{ flex: "1 0 21%", margin: "10px" }}
                >
                  <div className="card-image">
                    <img
                      src={item.image || "/path/to/default/image.jpg"}
                      alt={item.name}
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
                <h1>{selectedItem.name}</h1>
                <img
                  src={selectedItem.image || "/path/to/default/image.jpg"}
                  alt={selectedItem.name}
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
                <div className="">
                  <button onClick={handleItem}>Borrow</button>

                  <button onClick={handleCloseModal}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </section>
    </div>
  );
};

export default UserDashboard;
