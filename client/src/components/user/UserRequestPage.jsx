import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/UserSidebar"; // Ensure the correct path
import UserNavbar from "../Navbar/UserNavbar"; // Ensure the correct path
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import "../../css/RequestModal.css"; // Updated import statement

function RequestPage() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchUserRequests = async () => {
      const token = sessionStorage.getItem("sessionToken"); // Ensure you're using the correct key
      if (!token) {
        console.error("No token found. User might need to log in.");
        return; // Optionally redirect to login page
      } else {
        console.log("Token found:", token);
      }

      try {
        const response = await fetch(
          "http://localhost:3000/borrow/my-requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Fetch error:", errorText);
          throw new Error(`Error fetching user requests: ${errorText}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data);
        setUserRequests(data);
      } catch (error) {
        console.error("Error fetching user requests:", error);
        // Optionally handle token expiration here
        if (error.message.includes("Unauthorized")) {
          alert("Your session has expired. Please log in again.");
          // Redirect to login page or clear token
          localStorage.removeItem("token"); // Clear the expired token
          // Redirect to login page (if using React Router, for example)
          // window.location.href = "/login"; // Uncomment if needed
        }
      }
    };

    fetchUserRequests();
  }, []);

  const openOverlay = (item) => {
    setSelectedItem(item);
    setOverlayVisible(true);
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
  };

  const handleCancel = async (requestId) => {
    const token = sessionStorage.getItem("sessionToken");

    try {
      const response = await fetch(
        `http://localhost:3000/borrow/${requestId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel request");
      }

      // Update the local state to reflect the cancellation
      setUserRequests(
        userRequests.map((request) =>
          request._id === requestId
            ? { ...request, status: "Cancelled" }
            : request
        )
      );
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert("Failed to cancel request. Please try again.");
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

  return (
    <div className="user-dashboard">
      <Sidebar />
      <section id="content">
        <UserNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Pending Request</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Pending Request</a>
                </li>
                <li>
                  <i className="bx bx-chevron-right" />
                </li>
                <li>
                  <a className="active" href="Canceled.html">
                    Canceled
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>My Requests</h3>
                <i className="bx bx-filter" />
              </div>
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "50%" }}>REQUESTED ITEM</th>
                      <th style={{ width: "25%" }}>STATUS</th>
                      <th style={{ width: "25%" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRequests.map((request) => (
                      <tr key={request._id}>
                        <td>
                          <div className="item-details">
                            <strong>{request.item.name}</strong>
                            <p>{request.item.description}</p>
                            <small>Category: {request.item.category}</small>
                            <small>
                              Request Date:{" "}
                              {new Date(request.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status ${request.status.toLowerCase()}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="view-btn"
                              onClick={() => handleViewClick(request)}
                            >
                              View
                            </button>
                            {request.status.toLowerCase() === "pending" && (
                              <button className="cancel-btn">Cancel</button>
                            )}
                          </div>
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

      {/* Add Modal */}
      {isModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Request Details</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="request-info">
                <p>
                  <strong>Item Name:</strong> {selectedRequest.item.name}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`status ${selectedRequest.status.toLowerCase()}`}
                  >
                    {selectedRequest.status}
                  </span>
                </p>
                <p>
                  <strong>Category:</strong> {selectedRequest.item.category}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedRequest.item.description}
                </p>
                <p>
                  <strong>Request Date:</strong>{" "}
                  {new Date(selectedRequest.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Borrow Date:</strong>{" "}
                  {new Date(selectedRequest.borrowDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Return Date:</strong>{" "}
                  {new Date(selectedRequest.returnDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestPage;
