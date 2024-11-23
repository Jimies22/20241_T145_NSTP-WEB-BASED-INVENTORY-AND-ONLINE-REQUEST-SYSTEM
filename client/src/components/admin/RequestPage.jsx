import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";

function RequestPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get("http://localhost:3000/requests"); // Adjust the endpoint as necessary
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(`http://localhost:3000/requests/${requestId}`, {
        status: "approved",
      });
      fetchRequests(); // Refresh the requests
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.patch(`http://localhost:3000/requests/${requestId}`, {
        status: "rejected",
      });
      fetchRequests(); // Refresh the requests
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
                      <th>User ID</th>
                      <th>Item ID</th>
                      <th>Borrow Date</th>
                      <th>Return Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request._id}>
                        <td>{request.userId}</td>
                        <td>{request.item}</td>
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
                    ))}
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
