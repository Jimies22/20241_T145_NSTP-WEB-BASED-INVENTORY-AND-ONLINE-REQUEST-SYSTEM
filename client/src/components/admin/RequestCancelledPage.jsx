import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import Swal from "sweetalert2";

const RequestCancelledPage = () => {
  const [requests, setRequests] = useState([]);
  const [userIdToNameMap, setUserIdToNameMap] = useState({});
  const [itemIdToNameMap, setItemIdToNameMap] = useState({});

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
      // Filter for cancelled requests only
      const cancelledRequests = response.data
        .filter(request => request.status.toLowerCase() === 'cancelled')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(cancelledRequests);
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
      console.log("Users:", response.data); // debug output

      const userIdToNameMap = response.data.reduce((map, user) => {
        map[user._id] = user.name;
        return map;
      }, {});
      setUserIdToNameMap(userIdToNameMap);
      console.log("User ID to Name Map:", userIdToNameMap); // debug output
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
                <ul className="breadcrumb">
                  <li><a href="#">Cancelled</a></li>
                  <li><i className="bx bx-chevron-right"></i></li>
                  <li><a className="active" href="/request"> Pending </a></li>
                  <li><i className="bx bx-chevron-right"></i></li>
                  <li><a className="active" href="/request/rejected"> Rejected </a></li>
                  <li><i className="bx bx-chevron-right"></i></li>
                  <li><a className="active" href="/request/return"> Return </a></li>
                  <li><i className="bx bx-chevron-right"></i></li>
                  <li><a className="active" href="/admin"> Home </a></li>
                </ul>
              </div>
            </div>
            <div className="table-data">
              <div className="pending-requests">
                <div className="head">
                  
                </div>
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
                          <th style={{ textAlign: 'center' }}>Actions</th> {/* Center the Actions header */}
                        </tr>
                      </thead>
                      <tbody>
                        {requests.length > 0 ? (
                          requests.map((request) => (
                            <tr key={request._id}>
                              <td>{request.userId.name || "Unknown User"}</td>
                              <td>
                                {itemIdToNameMap[request.item?._id] ||
                                  "Unknown Item"}
                              </td>{" "}
                              {/* Added optional chaining */}
                              <td>
                                {new Date(
                                  request.borrowDate
                                ).toLocaleDateString()}
                              </td>
                              <td>
                                {new Date(
                                  request.returnDate
                                ).toLocaleDateString()}
                              </td>
                              <td>
                                <span
                                  className={`status ${request.status.toLowerCase()}`}
                                >
                                  {request.status}
                                </span>
                              </td>
                              <td>
                                <div className="actions">
                                  <span className="status-text">Cancelled by user</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="no-requests">
                              <i
                                className="bx bx-package"
                                style={{
                                  fontSize: "2rem",
                                  marginBottom: "10px",
                                }}
                              ></i>
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
          </main>
        </section>
      </div>
    </>
  );
};

export default RequestCancelledPage;
