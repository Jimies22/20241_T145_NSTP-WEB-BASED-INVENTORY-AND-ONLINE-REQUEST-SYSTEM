import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import Swal from "sweetalert2";

const RequestPage = () => {
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
      const pendingRequests = response.data
        .filter(request => request.status === "pending")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRequests(pendingRequests);
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

  const handleApprove = async (requestId, itemId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to approve this request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
    });

    if (result.isConfirmed) {
      const token = sessionStorage.getItem("sessionToken");
      try {
        const response = await axios.patch(
          `http://localhost:3000/borrow/${requestId}/status`,
          { status: "approved", itemId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Swal.fire({
          title: "Success!",
          text: "Request approved successfully",
          icon: "success",
        });

        fetchRequests(); // Refresh the requests list
      } catch (error) {
        console.error("Error approving request:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to approve request",
          icon: "error",
        });
      }
    }
  };

  const handleReject = async (requestId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to reject this request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, reject it!",
    });

    if (result.isConfirmed) {
      const token = sessionStorage.getItem("sessionToken");
      try {
        const response = await axios.patch(
          `http://localhost:3000/borrow/${requestId}/status`,
          { status: "rejected" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Swal.fire({
          title: "Success!",
          text: "Request rejected successfully",
          icon: "success",
        });

        fetchRequests(); // Refresh the requests list
      } catch (error) {
        console.error("Error rejecting request:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to reject request",
          icon: "error",
        });
      }
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
                <ul className="breadcrumb">
                  <li><a href="#">Pending</a></li>
                  <li><i className="bx bx-chevron-right"></i></li>
                  <li><a className="active" href="/request/cancelled"> Cancelled </a></li>
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
                                  <button
                                    onClick={() =>
                                      handleApprove(
                                        request._id,
                                        request.item?._id
                                      )
                                    } // Added optional chaining
                                    className={`approve-btn ${
                                      !isActionable(request.status)
                                        ? "disabled"
                                        : ""
                                    }`}
                                    disabled={!isActionable(request.status)}
                                  >
                                    <i className="bx bx-check"></i>
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(request._id)}
                                    className={`reject-btn ${
                                      !isActionable(request.status)
                                        ? "disabled"
                                        : ""
                                    }`}
                                    disabled={!isActionable(request.status)}
                                  >
                                    <i className="bx bx-x"></i>
                                    Reject
                                  </button>
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
                              <p>No pending requests available</p>
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

export default RequestPage;
