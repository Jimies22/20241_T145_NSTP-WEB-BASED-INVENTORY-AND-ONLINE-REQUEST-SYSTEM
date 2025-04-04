import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import Swal from "sweetalert2";
import { Link, useLocation } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";

const RequestReturnPage = () => {
  const [requests, setRequests] = useState([]);
  const [userIdToNameMap, setUserIdToNameMap] = useState({});
  const [itemIdToNameMap, setItemIdToNameMap] = useState({});
  const location = useLocation();
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (requests.length > 0) {
      fetchUsers();
      fetchItems();
    }
  }, [requests]);

  const fetchRequests = async () => {
    const token = sessionStorage.getItem("sessionToken");
    try {
      const response = await axios.get("http://localhost:3000/borrow/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const returnRequests = response.data
        .filter(request => request.status === "approved")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRequests(returnRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Swal.fire({
        title: "Error!",
        text:
          error.response?.status === 401
            ? "Unauthorized access. Please log in again."
            : "Error fetching request",
        icon: "error",
      });
    }
  };

  const fetchUsers = async () => {
    const token = sessionStorage.getItem("sessionToken");
    try {
      const response = await axios.get("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userIdToNameMap = response.data.reduce((map, user) => {
        map[user._id] = user.name;
        return map;
      }, {});
      setUserIdToNameMap(userIdToNameMap);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchItems = async () => {
    const token = sessionStorage.getItem("sessionToken");
    try {
      const response = await axios.get("http://localhost:3000/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const itemIdToNameMap = response.data.reduce((map, item) => {
        map[item._id] = item.name;
        return map;
      }, {});
      setItemIdToNameMap(itemIdToNameMap);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleScanQR = (requestId) => {
    Swal.fire({
      title: 'Scan QR Code',
      html: '<div id="reader"></div>',
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: 'Cancel',
      customClass: {
        container: 'scanner-modal',
        popup: 'scanner-popup',
        title: 'scanner-title',
      },
      didOpen: () => {
        const html5QrcodeScanner = new Html5QrcodeScanner(
          "reader", 
          { fps: 10, qrbox: 250 }, 
          false
        );
        
        html5QrcodeScanner.render((decodedText) => {
          // Check if the scanned QR code matches the request ID
          if (decodedText === requestId) {
            html5QrcodeScanner.clear();
            Swal.close();
            handleReturn(requestId);
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'QR code does not match the request',
              icon: 'error',
            });
          }
        }, (error) => {
          console.warn(`QR Code scanning failed: ${error}`);
        });
        
        setScanner(html5QrcodeScanner);
      },
      willClose: () => {
        if (scanner) {
          scanner.clear();
        }
      }
    });
  };

  const handleReturn = async (requestId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to mark this item as returned?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, mark as returned!",
    });

    if (result.isConfirmed) {
      const token = sessionStorage.getItem("sessionToken");
      try {
        const response = await axios.patch(
          `http://localhost:3000/borrow/${requestId}/status`,
          { status: "returned" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Swal.fire({
          title: "Success!",
          text: "Item marked as returned successfully",
          icon: "success",
        });

        fetchRequests(); // Refresh the requests list
      } catch (error) {
        console.error("Error marking as returned:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to mark as returned",
          icon: "error",
        });
      }
    }
  };

  // Add button styles
  const buttonStyles = `
    .scan-qr-btn:hover {
      background-color: #0056b3 !important;
    }
  `;

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
                <Link to="/request" className={`chrome-tab ${location.pathname === '/request' ? 'active' : ''}`}>
                  <i className='bx bx-time-five'></i> Pending
                </Link>
                <Link to="/request/cancelled" className={`chrome-tab ${location.pathname === '/request/cancelled' ? 'active' : ''}`}>
                  <i className='bx bx-x-circle'></i> Cancelled
                </Link>
                <Link to="/request/rejected" className={`chrome-tab ${location.pathname === '/request/rejected' ? 'active' : ''}`}>
                  <i className='bx bx-block'></i> Rejected
                </Link>
                <Link to="/request/return" className={`chrome-tab ${location.pathname === '/request/return' ? 'active' : ''}`}>
                  <i className='bx bx-undo'></i> Return Item
                </Link>
                <Link to="/admin" className={`chrome-tab ${location.pathname === '/admin' ? 'active' : ''}`}>
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
                                <td>{userIdToNameMap[request.user] || "Unknown User"}</td>
                                <td>{itemIdToNameMap[request.item] || "Unknown Item"}</td>
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
