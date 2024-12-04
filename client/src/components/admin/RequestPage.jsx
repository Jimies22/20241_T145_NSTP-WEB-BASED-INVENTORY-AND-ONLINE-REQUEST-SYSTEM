import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";

function RequestPage() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchUsers();
    fetchItems();
  }, []);

  const fetchRequests = async () => {
    const token = sessionStorage.getItem("sessionToken");
    try {
      const response = await axios.get("http://localhost:3000/borrow/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchUsers = async () => {
    const userID = requests.length > 0 ? requests[0].userId._id : null;
    const token = sessionStorage.getItem("sessionToken");
    if (!userID) {
      console.error("No user ID found in requests.");
      return; // Exit early if no user ID is found
    }
    try {
      const response = await axios.get(
        `http://localhost:3000/users/${userID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchItems = async () => {
    const itemId = requests.length > 0 ? requests[0].item._id : null;
    const token = sessionStorage.getItem("sessionToken");

    if (!itemId) {
      console.error("No item ID found in requests.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3000/items/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(`http://localhost:3000/requests/${requestId}`, {
        status: "approved",
      });
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.patch(`http://localhost:3000/requests/${requestId}`, {
        status: "rejected",
      });
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <section id="content">
        <AdminNavbar />
        <main>
          <div className="head-title">
            <h1>Requests</h1>
          </div>
          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>Pending Requests</h3>
              </div>
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Item Name</th>
                      <th>Borrow Date</th>
                      <th>Return Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length > 0 ? (
                      requests.map((request) => (
                        <tr key={request._id}>
                          <td>
                            {request.userId
                              ? request.userId._id
                              : "Unknown User"}
                          </td>
                          <td>
                            {request.item ? request.item._id : "Unknown Item"}
                          </td>
                          <td>{request.borrowDate}</td>
                          <td>{request.returnDate}</td>
                          <td>{request.status}</td>
                          <td>
                            <button onClick={() => handleApprove(request._id)}>
                              Approve
                            </button>
                            <button onClick={() => handleReject(request._id)}>
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6">No requests available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default RequestPage;
