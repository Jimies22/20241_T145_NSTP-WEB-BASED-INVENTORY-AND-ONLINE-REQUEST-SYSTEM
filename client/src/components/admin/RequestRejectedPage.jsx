import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import Swal from "sweetalert2";
import { Link, useLocation } from "react-router-dom";

const RequestRejectedPage = () => {
  const [requests, setRequests] = useState([]);
  const [userIdToNameMap, setUserIdToNameMap] = useState({});
  const [itemIdToNameMap, setItemIdToNameMap] = useState({});
  const location = useLocation();

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
      const rejectedRequests = response.data
        .filter(request => request.status === "rejected")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRequests(rejectedRequests);
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

  const isActionable = (status) => {
    return status === "pending";
  };

  // Add button hover styles
  const buttonHoverStyles = `
    .approve-btn:hover {
      background-color: #218838 !important;
    }
    .reject-btn:hover {
      background-color: #c82333 !important;
    }
  `;

  return (
    <>
      <style>{buttonHoverStyles}</style>
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
                                    <button className="view-btn">
                                      <i className="bx bx-show"></i>
                                      View
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="no-requests">
                                <i className="bx bx-package" style={{ fontSize: "2rem", marginBottom: "10px" }}></i>
                                <p>No rejected requests available</p>
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

export default RequestRejectedPage;
