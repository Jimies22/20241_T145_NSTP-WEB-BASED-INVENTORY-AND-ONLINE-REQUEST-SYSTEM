import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import Swal from "sweetalert2";
import { Link, useLocation } from "react-router-dom";
import { logActivity } from '../../utils/activityLogger';

const RequestCancelledPage = () => {
  const [requests, setRequests] = useState([]);
  const [userIdToNameMap, setUserIdToNameMap] = useState({});
  const [itemIdToNameMap, setItemIdToNameMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    const token = sessionStorage.getItem("sessionToken");
    try {
      const response = await axios.get("http://localhost:3000/borrow/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const cancelledRequests = response.data
        .filter(request => request.status === "cancelled" && !request.isArchived)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRequests(cancelledRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.status === 401
          ? "Unauthorized access. Please log in again."
          : "Error fetching requests",
        icon: "error",
      });
    } finally {
      setLoading(false);
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
      console.log("Users:", response.data);

      const userIdToNameMap = response.data.reduce((map, user) => {
        map[user._id] = user.name;
        return map;
      }, {});
      setUserIdToNameMap(userIdToNameMap);
      console.log("User ID to Name Map:", userIdToNameMap);
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

  const handleViewClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const handleArchive = async (request) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to archive this cancelled request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, archive it!'
    });

    if (result.isConfirmed) {
      try {
        setIsArchiving(true);
        const token = sessionStorage.getItem("sessionToken");
        const response = await axios.patch(
          `http://localhost:3000/borrow/${request._id}/archive`,
          { 
            isArchived: true,
            status: "cancelled"
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );

        if (response.status === 200) {
          await logActivity('ARCHIVE_REQUEST', `Archived cancelled request for ${itemIdToNameMap[request.itemId] || 'Unknown Item'}`);
          
          Swal.fire(
            'Archived!',
            'Request has been archived successfully.',
            'success'
          );

          setRequests(prevRequests => prevRequests.filter(r => r._id !== request._id));
        }
      } catch (error) {
        console.error("Error archiving request:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to archive request. Please try again.',
          showConfirmButton: true
        });
      } finally {
        setIsArchiving(false);
      }
    }
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
                            <th>Borrow Date & Time</th>
                            <th>Return Date & Time</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.length > 0 ? (
                            requests.map((request) => (
                              <tr key={request._id}>
                                <td>
                                  {request.userId?.name || request.user?.name || request.userName || userIdToNameMap[request.userId?._id] || userIdToNameMap[request.user?._id] || "N/A"}
                                </td>
                                <td>
                                  {request.itemId?.name || request.item?.name || request.itemName || itemIdToNameMap[request.itemId?._id] || itemIdToNameMap[request.item?._id] || "N/A"}
                                </td>
                                <td>{formatDateTime(request.borrowDate)}</td>
                                <td>{formatDateTime(request.returnDate)}</td>
                                <td>
                                  <span className={`status ${request.status.toLowerCase()}`}>
                                    {request.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="actions">
                                    <button
                                      onClick={() => handleViewClick(request)}
                                      className="view-btn"
                                      disabled={isArchiving}
                                    >
                                      <i className='bx bx-show'></i>
                                      View
                                    </button>
                                    {/* <button
                                      onClick={() => handleArchive(request)}
                                      className="archive-btn"
                                      disabled={isArchiving}
                                      style={{
                                        backgroundColor: "#6c757d",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px"
                                      }}
                                    >
                                      <i className='bx bx-archive-in'></i>
                                      Archive
                                    </button> */}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="no-requests">
                                <i className="bx bx-package" style={{ fontSize: "2rem", marginBottom: "10px" }}></i>
                                <p>No cancelled requests available</p>
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
      {isModalOpen && selectedRequest && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Details</h5>
              </div>
              <div className="modal-body">
                <div className="request-details">
                  <p><strong>User:</strong> {selectedRequest.userId?.name || selectedRequest.user?.name || userIdToNameMap[selectedRequest.userId?._id] || "N/A"}</p>
                  <p><strong>Item:</strong> {selectedRequest.itemId?.name || selectedRequest.item?.name || itemIdToNameMap[selectedRequest.itemId?._id] || "N/A"}</p>
                  <p><strong>Status:</strong> <span className={`status ${selectedRequest.status.toLowerCase()}`}>{selectedRequest.status}</span></p>
                  <p><strong>Borrow Date & Time:</strong> {formatDateTime(selectedRequest.borrowDate)}</p>
                  <p><strong>Return Date & Time:</strong> {formatDateTime(selectedRequest.returnDate)}</p>
                  {selectedRequest.cancelReason && (
                    <p><strong>Cancellation Reason:</strong> {selectedRequest.cancelReason}</p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}
    </>
  );
};

export default RequestCancelledPage;
