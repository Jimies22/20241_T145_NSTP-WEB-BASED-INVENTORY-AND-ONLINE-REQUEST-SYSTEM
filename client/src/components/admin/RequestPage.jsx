import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";

function RequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [filterStatus, setFilterStatus] = useState("all"); // for filtering requests

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      const response = await axios.get("http://localhost:3000/borrow/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Sort requests by date (most recent first)
      const sortedRequests = response.data.sort(
        (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
      );

      setRequests(sortedRequests);

      // Calculate stats
      const newStats = sortedRequests.reduce(
        (acc, request) => {
          acc[request.status.toLowerCase()]++;
          return acc;
        },
        { pending: 0, approved: 0, rejected: 0 }
      );

      setStats(newStats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError("Failed to fetch requests");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      await axios.patch(
        `http://localhost:3000/borrow/${requestId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the requests list
      fetchRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request status");
    }
  };

  const getFilteredRequests = () => {
    if (filterStatus === "all") return requests;
    return requests.filter(
      (request) => request.status.toLowerCase() === filterStatus.toLowerCase()
    );
  };

  if (loading) return <div className="loading">Loading requests...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-dashboard">
      <Sidebar />
      <section id="content">
        <AdminNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Request Management</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Dashboard</a>
                </li>
                <li>
                  <i className="bx bx-chevron-right" />
                </li>
                <li>
                  <a className="active" href="#">
                    Requests
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <ul className="box-info">
            <li>
              <i className="bx bxs-calendar-check"></i>
              <span className="text">
                <h3>{stats.pending}</h3>
                <p>Pending Requests</p>
              </span>
            </li>
            <li>
              <i className="bx bxs-check-circle"></i>
              <span className="text">
                <h3>{stats.approved}</h3>
                <p>Approved Requests</p>
              </span>
            </li>
            <li>
              <i className="bx bxs-x-circle"></i>
              <span className="text">
                <h3>{stats.rejected}</h3>
                <p>Rejected Requests</p>
              </span>
            </li>
          </ul>

          <div className="table-data">
            <div className="request-list">
              <div className="head">
                <h3>Borrow Requests</h3>
                <div className="filter-controls">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="status-filter"
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Request Date</th>
                    <th>User</th>
                    <th>Department</th>
                    <th>Item</th>
                    <th>Borrow Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredRequests().map((request) => (
                    <tr key={request._id}>
                      <td>
                        {new Date(request.dateCreated).toLocaleDateString()}
                      </td>
                      <td>{request.userId.name}</td>
                      <td>{request.itemId.name}</td>
                      <td>{request.itemId.department}</td>
                      <td>
                        {new Date(request.dateBorrow).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(request.dateReturn).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`status ${request.status.toLowerCase()}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td>
                        {request.status === "Pending" && (
                          <div className="action-buttons">
                            <button
                              className="approve-btn"
                              onClick={() =>
                                handleStatusUpdate(request._id, "Approved")
                              }
                              title="Approve Request"
                            >
                              <i className="bx bx-check"></i>
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() =>
                                handleStatusUpdate(request._id, "Rejected")
                              }
                              title="Reject Request"
                            >
                              <i className="bx bx-x"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default RequestPage;
