import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../sidebar/UserSidebar";
import UserNavbar from "../Navbar/UserNavbar";
import "../../css/UserDashboard.css";
import axios from "axios";
import BorrowOverlay from "./BorrowOverlay";
import Swal from "sweetalert2";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBorrowOverlay, setShowBorrowOverlay] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [categories, setCategories] = useState([]);

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
    fetchCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchItems();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchItems = async () => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      const response = await axios.get("http://localhost:3000/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Filter out archived items
      const activeItems = response.data.filter(item => !item.isArchived);
      setItems(activeItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3000/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter 
      ? item.category === categoryFilter 
      : true;
    
    const matchesAvailability = availabilityFilter === ''
      ? true
      : availabilityFilter === 'available'
        ? item.availability === true
        : item.availability === false;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

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

  const handleBorrowItem = async (item) => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      // Check if user has pending request for this item
      const response = await axios.get(`http://localhost:3000/borrow/my-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const existingRequest = response.data.find(
        request => request.item._id === item._id && 
        (request.status === "pending" || request.status === "approved")
      );

      if (existingRequest) {
        Swal.fire({
          icon: 'error',
          title: 'Cannot Borrow',
          text: 'You already have a pending or approved request for this item.',
        });
        return;
      }

      setSelectedItem(item);
      setShowBorrowOverlay(true);
    } catch (error) {
      console.error("Error checking existing requests:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to process borrow request. Please try again.',
      });
    }
  };

  const handleCloseBorrowOverlay = () => {
    setShowBorrowOverlay(false);
    setSelectedItem(null);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-image.jpg";
    
    // Check if the image path is a Cloudinary URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // For local uploads
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
            <div className="search-filter-container">
              <div className="search-box">
                <i className='bx bx-search search-icon'></i>
                <input 
                  type="text" 
                  placeholder="Search items..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-section">
                <select 
                  className="filter-dropdown"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">Filter by Category</option>
                  <option value="TV">Television (TV)</option>
                  <option value="Projector/DLP">Projector/DLP</option>
                  <option value="Extension Wire">Extension Wire</option>
                  <option value="HDMI">HDMI Cable</option>
                </select>

                <select 
                  className="filter-dropdown"
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <option value="">Filter by Status</option>
                  <option value="available">Available Items</option>
                  <option value="unavailable">Currently Unavailable</option>
                </select>
              </div>
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
                        e.target.src = "/default-image.jpg";
                      }}
                      style={{ opacity: 1 }}
                      onLoad={(e) => {
                        e.target.style.opacity = 1;
                        e.target.parentElement.classList.add('loaded');
                      }}
                    />
                  </div>
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <p className={`availability ${!item.availability ? 'unavailable' : ''}`}>
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
                <button className="close-btn" onClick={handleCloseModal}>×</button>
                
                <div className="modal-layout">
                  {/* Left side - Image */}
                  <div className="modal-image">
                    <img
                      src={getImageUrl(selectedItem.image)}
                      alt={selectedItem.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/path/to/default/image.jpg";
                      }}
                    />
                  </div>

                  {/* Right side - Info and Button */}
                  <div className="modal-details">
                    <h2 className="modal-title">{selectedItem.name}</h2>
                    
                    <div className="item-info">
                      <p><strong>Item ID:</strong> {selectedItem.item_id}</p>
                      <p><strong>Description:</strong> {selectedItem.description}</p>
                      <p><strong>Category:</strong> {selectedItem.category}</p>
                      <p className={`availability-tag ${selectedItem.availability ? 'available' : 'unavailable'}`}>
                        {selectedItem.availability ? "AVAILABLE" : "UNAVAILABLE"}
                      </p>
                    </div>

                    <button
                      className="borrow-button"
                      onClick={() => handleBorrowItem(selectedItem)}
                      disabled={!selectedItem.availability}
                    >
                      {selectedItem.availability ? "Borrow Now" : "Not Available"}
                    </button>
                  </div>
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
