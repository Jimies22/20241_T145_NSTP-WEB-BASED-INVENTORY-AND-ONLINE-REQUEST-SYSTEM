import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "../../css/UserDashboard.css";
import axios from "axios";
import BorrowOverlay from "../user/BorrowOverlay";
import Swal from "sweetalert2";

const clientId = "549675419873-ft3kc0fpc3nm9d3tibrpt13b3gu78hd4.apps.googleusercontent.com";

const OfficeDisplay = () => {
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
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);

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
      const response = await axios.get("http://localhost:3000/items");
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:3000/login/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ token: credentialResponse.credential })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      sessionStorage.setItem("sessionToken", data.token);
      sessionStorage.setItem("userInfo", JSON.stringify(data.user));

      // After successful login, proceed with borrow request
      if (selectedItem) {
        setShowBorrowOverlay(true);
      }

      Swal.fire({
        title: "Login Successful",
        text: "You can now proceed with borrowing the item.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Google login error:", error);
      Swal.fire({
        title: "Login Failed",
        text: error.message || "Failed to login with Google. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleGoogleError = () => {
    Swal.fire({
      title: "Google Login Failed",
      text: "Unable to login with Google. Please try again.",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  };

  const handleBorrowItem = async (item) => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      if (!token) {
        setSelectedItem(item);
        setShowGoogleLogin(true);
        return;
      }

      // Check if user has pending request for this item
      const response = await axios.get(`http://localhost:3000/borrow/my-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const existingRequest = response.data.find(request => {
        if (!request || !request.item) {
          console.log("Invalid request found:", request);
          return false;
        }
        
        return request.item._id === item._id && 
               (request.status === "pending" || request.status === "approved");
      });

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
    <GoogleOAuthProvider clientId={clientId}>
      <div className="equipment-display">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-left">
              <Link to="/" className="navbar-home-link">Home</Link>
            </div>
            <div className="navbar-brand">
              {/* <img src={nstpLogo} alt="System Logo" className="navbar-logo" /> */}
              <span className="system-name">NSTP Inventory System</span>
            </div>
          </div>
        </nav>
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Available Equipment</h1>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBorrowItem(selectedItem);
                      }}
                      disabled={!selectedItem.availability}
                    >
                      {selectedItem.availability ? "Borrow Now" : "Not Available"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showGoogleLogin && (
            <div className="modal-overlay">
              <div className="modal-content google-login-modal">
                <button className="close-btn" onClick={() => setShowGoogleLogin(false)}>×</button>
                <div className="google-login-content">
                  <h2>Login Required</h2>
                  <p>Please login with your Google account to borrow this item.</p>
                  <div className="google-login-button">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      width={300}
                    />
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
      </div>
    </GoogleOAuthProvider>
  );
};

export default OfficeDisplay; 