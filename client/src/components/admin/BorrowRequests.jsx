import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/BorrowRequests.css";

const BorrowRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setRequests(response.data);
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

  if (loading) return <div className="loading">Loading requests...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="borrow-requests">
      <h2>Borrow Requests</h2>
      <div className="requests-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Item</th>
              <th>Borrow Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id}>
                <td>{request.userId.name}</td>
                <td>{request.itemId.name}</td>
                <td>{new Date(request.dateBorrow).toLocaleDateString()}</td>
                <td>{new Date(request.dateReturn).toLocaleDateString()}</td>
                <td>
                  <span className={`status ${request.status.toLowerCase()}`}>
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
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() =>
                          handleStatusUpdate(request._id, "Rejected")
                        }
                      >
                        Reject
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
  );
};

export default BorrowRequests;
