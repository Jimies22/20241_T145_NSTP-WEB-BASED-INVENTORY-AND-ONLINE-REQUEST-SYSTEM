import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import QrScanner from "react-qr-barcode-scanner";
import "../../css/UserDashboard.css";
import axios from "axios";
import BorrowOverlay from "../user/BorrowOverlay";
import Swal from "sweetalert2";
import nstpLogo from "../../assets/NSTP_LOGO.png";

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
  const [cart, setCart] = useState([]);
  const [showCartBorrow, setShowCartBorrow] = useState(false);

  // Borrow flow states
  const [borrowStep, setBorrowStep] = useState(null); // null | 'date' | 'scan'
  const [borrowReturnDate, setBorrowReturnDate] = useState("");
  const [scannedCode, setScannedCode] = useState("");
  const [borrowLoading, setBorrowLoading] = useState(false);

  // Cart Borrow Flow
  const [cartBorrowStep, setCartBorrowStep] = useState(null); // null | 'date' | 'scan'
  const [cartBorrowReturnDate, setCartBorrowReturnDate] = useState("");
  const [cartScannedCodes, setCartScannedCodes] = useState([]); // [{item, code, valid}]
  const [cartBorrowLoading, setCartBorrowLoading] = useState(false);

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
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingRequest = response.data.find(request => {
        if (!request || !request.item) return false;
        return request.item._id === item._id && (request.status === "pending" || request.status === "approved");
      });
      if (existingRequest) {
        Swal.fire({ icon: 'error', title: 'Cannot Borrow', text: 'You already have a pending or approved request for this item.' });
        return;
      }
      setSelectedItem(item);
      setBorrowStep('date'); // Start borrow flow at date selection
    } catch (error) {
      console.error("Error checking existing requests:", error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to process borrow request. Please try again.' });
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

  // Cart handlers
  const handleSelectItem = (item) => {
    if (cart.some((i) => i.item_id === item.item_id)) {
      setCart(cart.filter((i) => i.item_id !== item.item_id));
    } else {
      setCart([...cart, item]);
    }
  };

  const handleSelectAll = () => {
    if (cart.length === filteredItems.length) {
      setCart([]);
    } else {
      setCart(filteredItems);
    }
  };

  const handleCartBorrow = () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No items selected',
        text: 'Please select items to borrow.',
      });
      return;
    }
    // If not logged in, show Google login modal
    const token = sessionStorage.getItem("sessionToken");
    if (!token) {
      setShowGoogleLogin(true);
      return;
    }
    setShowCartBorrow(true);
  };

  // Borrow step: handle return date selection
  const handleReturnDateSubmit = (e) => {
    e.preventDefault();
    if (!borrowReturnDate) {
      Swal.fire({ icon: 'warning', title: 'Select a return date' });
      return;
    }
    // Validate date is within 5 days
    const now = new Date();
    const maxDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const selected = new Date(borrowReturnDate);
    if (selected < now || selected > maxDate) {
      Swal.fire({ icon: 'error', title: 'Invalid Date', text: 'Return date must be within 5 days from today.' });
      return;
    }
    setBorrowStep('scan');
  };

  // Borrow step: handle QR/barcode scan
  const handleScan = (err, result) => {
    if (result) {
      setScannedCode(result.text);
    }
  };

  useEffect(() => {
    // When scannedCode is set, validate and complete borrow
    if (borrowStep === 'scan' && scannedCode && selectedItem) {
      // Assume item QR/barcode is item._id or item.item_id
      const validCodes = [selectedItem._id, selectedItem.item_id, selectedItem.qrCode, selectedItem.barcode];
      if (validCodes.includes(scannedCode)) {
        // Complete borrow
        completeBorrow(selectedItem, borrowReturnDate);
      } else {
        Swal.fire({ icon: 'error', title: 'Invalid Code', text: 'Scanned code does not match this item. Please try again.' });
        setScannedCode("");
      }
    }
    // eslint-disable-next-line
  }, [scannedCode]);

  const completeBorrow = async (item, returnDate) => {
    setBorrowLoading(true);
    try {
      const token = sessionStorage.getItem("sessionToken");
      const userId = JSON.parse(atob(token.split(".")[1])).userId;
      const borrowDate = new Date();
      const returnDateObj = new Date(returnDate);
      await axios.post(
        "http://localhost:3000/borrow",
        {
          userId,
          item: item._id,
          borrowDate: borrowDate.toISOString(),
          returnDate: returnDateObj.toISOString(),
          requestDate: borrowDate.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBorrowStep(null);
      setBorrowReturnDate("");
      setScannedCode("");
      setSelectedItem(null);
      Swal.fire({ icon: 'success', title: 'Success!', text: 'Borrow request submitted.' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to submit borrow request.' });
    } finally {
      setBorrowLoading(false);
    }
  };

  // Cart Borrow Flow
  useEffect(() => {
    if (showCartBorrow) {
      setCartBorrowStep('date');
      setCartBorrowReturnDate("");
      setCartScannedCodes(cart.map(item => ({ item, code: "", valid: false })));
    }
  }, [showCartBorrow]);

  const handleCartReturnDateSubmit = (e) => {
    e.preventDefault();
    if (!cartBorrowReturnDate) {
      Swal.fire({ icon: 'warning', title: 'Select a return date' });
      return;
    }
    // Validate date is within 5 days
    const now = new Date();
    const maxDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const selected = new Date(cartBorrowReturnDate);
    if (selected < now || selected > maxDate) {
      Swal.fire({ icon: 'error', title: 'Invalid Date', text: 'Return date must be within 5 days from today.' });
      return;
    }
    setCartBorrowStep('scan');
  };

  const handleCartScan = (err, result) => {
    if (result) {
      // Find the first unscanned item
      const nextIdx = cartScannedCodes.findIndex(x => !x.valid);
      if (nextIdx === -1) return; // All done
      const item = cartScannedCodes[nextIdx].item;
      const validCodes = [item._id, item.item_id, item.qrCode, item.barcode];
      const isValid = validCodes.includes(result.text);
      setCartScannedCodes(prev => prev.map((x, i) =>
        i === nextIdx ? { ...x, code: result.text, valid: isValid } : x
      ));
      if (!isValid) {
        Swal.fire({ icon: 'error', title: 'Invalid Code', text: `Scanned code does not match: ${item.name}` });
      }
    }
  };

  const allCartScanned = cartScannedCodes.length > 0 && cartScannedCodes.every(x => x.valid);

  const handleCartBorrowSubmit = async () => {
    setCartBorrowLoading(true);
    try {
      const token = sessionStorage.getItem("sessionToken");
      const userId = JSON.parse(atob(token.split(".")[1])).userId;
      const borrowDate = new Date();
      const returnDateObj = new Date(cartBorrowReturnDate);
      let success = [], fail = [];
      for (const x of cartScannedCodes) {
        try {
          await axios.post(
            "http://localhost:3000/borrow",
            {
              userId,
              item: x.item._id,
              borrowDate: borrowDate.toISOString(),
              returnDate: returnDateObj.toISOString(),
              requestDate: borrowDate.toISOString(),
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          success.push(x.item.name);
        } catch (error) {
          fail.push(x.item.name);
        }
      }
      setCartBorrowStep(null);
      setCartBorrowReturnDate("");
      setCartScannedCodes([]);
      setShowCartBorrow(false);
      setCart([]);
      Swal.fire({
        icon: 'info',
        title: 'Batch Borrow Results',
        html: `<div style='text-align:left;'>${success.length ? `<b>Success:</b><ul>${success.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}${fail.length ? `<b>Failed:</b><ul>${fail.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}</div>`,
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setCartBorrowLoading(false);
    }
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
              <img src={nstpLogo} alt="System Logo" className="navbar-logo" />
              <span className="system-name">NSTP Inventory System</span>
            </div>
            <div className="navbar-cart">
              <button className="cart-btn" onClick={handleCartBorrow} title="Borrow Selected">
                <span className="cart-icon">🛒</span>
                {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
              </button>
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

          <div className="select-all-container">
            <label>
              <input
                type="checkbox"
                checked={cart.length === filteredItems.length && filteredItems.length > 0}
                onChange={handleSelectAll}
              />
              Select All
            </label>
          </div>
          <div className="card-container">
            {loading ? (
              <p>Loading items...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              filteredItems.map((item) => (
                <div
                  className={`card${cart.some((i) => i.item_id === item.item_id) ? ' selected' : ''}`}
                  key={item.item_id}
                  onClick={() => handleCardClick(item)}
                >
                  <div className="card-checkbox" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={cart.some((i) => i.item_id === item.item_id)}
                      onChange={() => handleSelectItem(item)}
                    />
                  </div>
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

          {showCartBorrow && (
            <BorrowOverlay
              items={cart}
              onClose={() => setShowCartBorrow(false)}
              isBatch={true}
            />
          )}

          {/* Borrow Step Modals */}
          {borrowStep === 'date' && selectedItem && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="close-btn" onClick={() => { setBorrowStep(null); setSelectedItem(null); }}>×</button>
                <h2>Select Return Date</h2>
                <form onSubmit={handleReturnDateSubmit} style={{ marginTop: 20 }}>
                  <input
                    type="date"
                    value={borrowReturnDate}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    onChange={e => setBorrowReturnDate(e.target.value)}
                    required
                    style={{ fontSize: 18, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                  <button type="submit" className="borrow-button" style={{ marginLeft: 16 }}>Next</button>
                </form>
              </div>
            </div>
          )}
          {borrowStep === 'scan' && selectedItem && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="close-btn" onClick={() => { setBorrowStep(null); setSelectedItem(null); setScannedCode(""); }}>×</button>
                <h2>Scan Item QR/Barcode</h2>
                <p>Use your camera or scanner to scan the item's code.</p>
                <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
                  <QrScanner
                    onUpdate={handleScan}
                    facingMode="environment"
                    style={{ width: '100%' }}
                  />
                </div>
                {borrowLoading && <p>Processing...</p>}
              </div>
            </div>
          )}

          {/* Cart Borrow Step Modals */}
          {showCartBorrow && cartBorrowStep === 'date' && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="close-btn" onClick={() => { setShowCartBorrow(false); setCartBorrowStep(null); }}>×</button>
                <h2>Select Return Date for All Items</h2>
                <form onSubmit={handleCartReturnDateSubmit} style={{ marginTop: 20 }}>
                  <input
                    type="date"
                    value={cartBorrowReturnDate}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    onChange={e => setCartBorrowReturnDate(e.target.value)}
                    required
                    style={{ fontSize: 18, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                  <button type="submit" className="borrow-button" style={{ marginLeft: 16 }}>Next</button>
                </form>
              </div>
            </div>
          )}
          {showCartBorrow && cartBorrowStep === 'scan' && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="close-btn" onClick={() => { setShowCartBorrow(false); setCartBorrowStep(null); setCartScannedCodes([]); }}>×</button>
                <h2>Scan Each Item's QR/Barcode</h2>
                <ul style={{ marginBottom: 16 }}>
                  {cartScannedCodes.map((x, i) => (
                    <li key={x.item._id || x.item.item_id} style={{ color: x.valid ? 'green' : 'red' }}>
                      {x.item.name} {x.valid ? '✓' : ''}
                    </li>
                  ))}
                </ul>
                <p>Scan the next unscanned item using your camera or scanner.</p>
                <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
                  <QrScanner
                    onUpdate={handleCartScan}
                    facingMode="environment"
                    style={{ width: '100%' }}
                  />
                </div>
                <button
                  className="borrow-button"
                  style={{ marginTop: 24 }}
                  onClick={handleCartBorrowSubmit}
                  disabled={!allCartScanned || cartBorrowLoading}
                >
                  {cartBorrowLoading ? 'Processing...' : 'Submit Borrow Requests'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </GoogleOAuthProvider>
  );
};

export default OfficeDisplay; 