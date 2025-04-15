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
      console.log('Sending request with:', {
        requestId,
        status: newStatus,
        url: `http://localhost:3000/borrow/${requestId}/status`
      });

      const response = await axios.patch(
        `http://localhost:3000/borrow/${requestId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.status === 200) {
        console.log('Success response:', response.data);
        await fetchRequests();
      }
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
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
              <th>Borrow Time</th>
              <th>Return Date</th>
              <th>Return Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id}>
                <td>{request.userId?.name || request.user?.name || request.userName || 'N/A'}</td>
                <td>{request.itemId?.name || request.item?.name || request.itemName || 'N/A'}</td>
                <td>{new Date(request.borrowDate).toLocaleDateString()}</td>
                <td>{new Date(request.borrowDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>{new Date(request.returnDate).toLocaleDateString()}</td>
                <td>{new Date(request.returnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                  <span className={`status ${request.status}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  {request.status === "pending" && (
                    <div className="action-buttons">
                      <button
                        className="approve-btn"
                        onClick={() => handleStatusUpdate(request._id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleStatusUpdate(request._id, "rejected")}
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
