import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import Swal from "sweetalert2";
import { Link, useLocation } from "react-router-dom";
import QRScanner from './QRScanner';
import ReactDOM from 'react-dom';

const RequestReturnPage = () => {
  const [requests, setRequests] = useState([]);
  const [userIdToNameMap, setUserIdToNameMap] = useState({});
  const [itemIdToNameMap, setItemIdToNameMap] = useState({});
  const location = useLocation();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = sessionStorage.getItem("sessionToken");
    try {
      const response = await axios.get("http://localhost:3000/borrow/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Filter for approved requests and ensure item data is populated
      const returnRequests = response.data
        .filter(request => request.status === "approved")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log('Fetched requests:', returnRequests); // Debug log to check data structure
      setRequests(returnRequests);

      // Create user and item maps directly from the populated data
      const userMap = {};
      const itemMap = {};
      
      returnRequests.forEach(request => {
        // Check both possible property names for user data
        if (request.userId && typeof request.userId === 'object') {
          userMap[request.userId._id] = request.userId.name;
        } else if (request.user && typeof request.user === 'object') {
          userMap[request.user._id] = request.user.name;
        }

        // Check both possible property names for item data
        if (request.itemId && typeof request.itemId === 'object') {
          itemMap[request.itemId._id] = request.itemId.name;
        } else if (request.item && typeof request.item === 'object') {
          itemMap[request.item._id] = request.item.name;
        }
      });

      setUserIdToNameMap(userMap);
      setItemIdToNameMap(itemMap);

      // Add this right after the axios call
      console.log('Raw response data:', response.data);
      console.log('Request object example:', response.data[0]);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.status === 401
          ? "Unauthorized access. Please log in again."
          : "Error fetching requests",
        icon: "error",
      });
    }
  };

  const handleScanQR = (requestId) => {
    let scannerInstance = null;
    
    Swal.fire({
      title: 'Scan QR Code',
      html: '<div id="reader"></div>',
      showCancelButton: true,
      showConfirmButton: false,
      width: '500px',
      didOpen: () => {
        // Render QRScanner component with callbacks
        const scannerElement = document.getElementById('reader');
        if (scannerElement) {
          try {
          ReactDOM.render(
            <QRScanner 
                onScanSuccess={(decodedText) => {
                  // Stop scanner before handling result
                  if (scannerInstance) {
                    try {
                      scannerInstance.clear();
                      scannerInstance = null;
                    } catch (e) {
                      console.warn("Error clearing scanner:", e);
                    }
                  }
                  
                  // Close the modal before proceeding
                  Swal.close();
                  
                  // Handle result after modal is closed
                  setTimeout(() => {
                    handleQRResult(decodedText, requestId);
                  }, 100);
                }}
              onScanError={(error) => console.warn('QR Scan error:', error)}
                onScannerMounted={(instance) => {
                  scannerInstance = instance;
                }}
            />,
            scannerElement
          );
          } catch (error) {
            console.error("Error rendering QR scanner:", error);
          }
        }
      },
      willClose: () => {
        // Cleanup scanner instance first
        if (scannerInstance) {
          try {
            scannerInstance.clear();
            scannerInstance = null;
          } catch (e) {
            console.warn("Error clearing scanner in willClose:", e);
          }
        }
        
        // Then unmount the React component
        try {
        const scannerElement = document.getElementById('reader');
        if (scannerElement) {
          ReactDOM.unmountComponentAtNode(scannerElement);
        }
        } catch (error) {
          console.error("Error unmounting QR scanner:", error);
        }
        
        // Final cleanup of any remaining elements
        const elementsToRemove = document.querySelectorAll('.html5-qrcode-element');
        elementsToRemove.forEach(el => {
          try {
            el.remove();
          } catch (e) {
            console.warn("Failed to remove element:", e);
          }
        });
      }
    });
  };

  const handleQRResult = async (decodedText, requestId) => {
    try {
      const request = requests.find(r => r._id === requestId);
      
      if (!request) {
        throw new Error('Request not found');
      }

      // Get the item ID from the request object
      const itemId = request.itemId?._id || request.item?._id;
      
      console.log('QR Code:', decodedText); // Debug log
      console.log('Item ID from request:', itemId); // Debug log

      // Check if the scanned QR code matches the item ID
      if (!itemId || decodedText !== itemId) {
        // Simply show error message for mismatched QR code
        await Swal.fire({
          title: 'Wrong QR Code',
          text: 'QR code did not match',
          icon: 'error',
          confirmButtonText: 'Try Again',
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            // If user clicks "Try Again", reopen the scanner
            handleScanQR(requestId);
          }
        });
        return;
      }

      // Process the return
      const token = sessionStorage.getItem("sessionToken");
      try {
        const response = await axios.put(
          `http://localhost:3000/borrow/${requestId}/return`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('Return response:', response); // Debug log

        // Show success message
        await Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Success!',
          text: 'Item has been returned successfully',
          showConfirmButton: true,
          timer: 2000
        });

        // Refresh the requests list
        await fetchRequests();
      } catch (error) {
        console.error('Return request error:', error);
        
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to process return. Please try again.',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('QR processing error:', error);
      
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to process QR code',
        icon: 'error'
      });
    }
  };

  // Add button styles
  const buttonStyles = `
    .scan-qr-btn:hover {
      background-color: #0056b3 !important;
    }
  `;

  // Add this function
  const handleNavigation = (e) => {
    // Ensure any lingering QR scanner elements are removed before navigation
    try {
      const elementsToRemove = document.querySelectorAll('.html5-qrcode-element');
      if (elementsToRemove.length > 0) {
        console.log('Cleaning up lingering scanner elements during navigation');
        elementsToRemove.forEach(el => el.remove());
      }
    } catch (error) {
      console.warn('Error cleaning up during navigation:', error);
    }
  };

  return (
    <>
      <style>{buttonStyles}</style>
      <div className="admin-dashboard">
        <Sidebar />
        <section id="content">
          <AdminNavbar />
          <main>
            <div className="head-title">
              <div className="left">
                <h1>Requests</h1>
              </div>
            </div>
            
            <div className="chrome-tabs-container">
              <div className="chrome-tabs">
                <Link 
                  to="/request" 
                  className={`chrome-tab ${location.pathname === '/request' ? 'active' : ''}`}
                  onClick={handleNavigation}
                >
                  <i className='bx bx-time-five'></i> Pending
                </Link>
                <Link 
                  to="/request/cancelled" 
                  className={`chrome-tab ${location.pathname === '/request/cancelled' ? 'active' : ''}`}
                  onClick={handleNavigation}
                >
                  <i className='bx bx-x-circle'></i> Cancelled
                </Link>
                <Link 
                  to="/request/rejected" 
                  className={`chrome-tab ${location.pathname === '/request/rejected' ? 'active' : ''}`}
                  onClick={handleNavigation}
                >
                  <i className='bx bx-block'></i> Rejected
                </Link>
                <Link 
                  to="/request/return" 
                  className={`chrome-tab ${location.pathname === '/request/return' ? 'active' : ''}`}
                  onClick={handleNavigation}
                >
                  <i className='bx bx-undo'></i> Return Item
                </Link>
                <Link 
                  to="/admin" 
                  className={`chrome-tab ${location.pathname === '/admin' ? 'active' : ''}`}
                  onClick={handleNavigation}
                >
                  <i className='bx bx-home'></i> Home
                </Link>
              </div>
              
              <div className="chrome-tabs-content">
                <div className="pending-requests">
                  <div className="order">
                    <div className="table-container" style={{ overflowY: 'auto', maxHeight: '490px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                          <tr>
                            <th>User Name</th>
                            <th>Item Name</th>
                            <th>Borrow Date</th>
                            <th>Return Date</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.length > 0 ? (
                            requests.map((request) => (
                              <tr key={request._id}>
                                <td>
                                  {(request.userId?.name || request.user?.name || userIdToNameMap[request.userId] || userIdToNameMap[request.user] || "Unknown User")}
                                </td>
                                <td>
                                  {(request.itemId?.name || request.item?.name || itemIdToNameMap[request.itemId] || itemIdToNameMap[request.item] || "Unknown Item")}
                                </td>
                                <td>{new Date(request.borrowDate).toLocaleDateString()}</td>
                                <td>{new Date(request.returnDate).toLocaleDateString()}</td>
                                <td>
                                  <span className={`status ${request.status.toLowerCase()}`}>
                                    {request.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="actions">
                                    <button 
                                      onClick={() => handleScanQR(request._id)}
                                      className="scan-qr-btn"
                                    >
                                      <i className="bx bx-qr-scan"></i>
                                      Scan QR
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="no-requests">
                                <i className="bx bx-package" style={{ fontSize: "2rem", marginBottom: "10px" }}></i>
                                <p>No approved requests available for return</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </section>
      </div>
    </>
  );
};

export default RequestReturnPage;
