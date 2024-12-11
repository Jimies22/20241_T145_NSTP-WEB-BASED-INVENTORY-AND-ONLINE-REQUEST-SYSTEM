import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/UserSidebar"; // Ensure the correct path
import UserNavbar from "../Navbar/UserNavbar"; // Ensure the correct path
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import "../../css/RequestModal.css"; // Changed from Modal.css to RequestModal.css

function RejectedPage() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchUserRequests = async () => {
      const token = sessionStorage.getItem("sessionToken");
      if (!token) return;

      try {
        const response = await fetch(
          "http://localhost:3000/borrow/my-requests?status=rejected",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error fetching rejected requests: ${errorText}`);
        }

        const data = await response.json();
        const rejectedRequests = data.filter(request => 
          request.status.toLowerCase() === 'rejected'
        );
        setUserRequests(rejectedRequests);
      } catch (error) {
        console.error("Error:", error);
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
        `http://localhost:3000/borrow/my-requests/${requestId}/status/cancel`,
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
    console.log("View button clicked with request:", request);
    setSelectedRequest({
      item: {
        name: request.item.name,
        description: request.item.description,
        category: request.item.category,
      },
      status: request.status,
      requestDate: request.requestDate,
      borrowDate: request.borrowDate,
      returnDate: request.returnDate,
      _id: request._id,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    // Format date as "Month DD, YYYY at HH:MM AM/PM"
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleCancelFromModal = async () => {
    const token = sessionStorage.getItem("sessionToken");

    try {
      console.log("Attempting to cancel request:", selectedRequest._id);

      const response = await fetch(
        `http://localhost:3000/borrow/cancel/${selectedRequest._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Cancel request failed:", errorData);
        throw new Error(errorData || "Failed to cancel request");
      }

      const updatedRequest = await response.json();
      console.log("Cancel request successful:", updatedRequest);

      // Update the requests list
      setUserRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === selectedRequest._id
            ? { ...request, status: "cancelled" } // Changed to lowercase to match schema
            : request
        )
      );

      // Update the modal view
      setSelectedRequest((prev) => ({
        ...prev,
        status: "cancelled", // Changed to lowercase to match schema
      }));

      alert("Request cancelled successfully");
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert(error.message || "Failed to cancel request. Please try again.");
    }
  };

  return (
    <div className="user-dashboard">
      <Sidebar />
      <section id="content">
        <UserNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Rejected Request</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Rejected</a>
                </li>
                <li>
                  <i className="bx bx-chevron-right" />
                </li>
                <li>
                  <a
                    className="active"
                    href="/user-request/pending"
                  >
                    Pending
                  </a>
                </li>
                <li>
                  <i className="bx bx-chevron-right" />
                </li>
                <li>
                  <a
                    className="active"
                    href="/user-request/cancelled"
                  >
                    Cancelled
                  </a>
                </li>
                <li>
                  <i className="bx bx-chevron-right" />
                </li>
                <li>
                  <a
                    className="active"
                    href="/user"
                  >
                    Home
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
                    {userRequests && userRequests.length > 0 ? (
                      userRequests.map((request) => (
                        <tr key={request._id}>
                          <td>
                            <div className="item-details">
                              <strong>{request.item?.name || "N/A"}</strong>
                              <p>{request.item?.description || "N/A"}</p>
                              <small>Category: {request.item?.category || "N/A"}</small>
                              <small>
                                {/* Request Date:{" "}
                                {new Date(request.createdAt).toLocaleDateString()} */}
                                {request.requestDate}
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
                                onClick={() => {
                                  console.log("View button clicked");
                                  handleViewClick(request);
                                }}
                              >
                                View
                              </button>
                              {request.status.toLowerCase() === "pending" && (
                                <button
                                  className="cancel-btn"
                                  onClick={() => handleCancel(request._id)}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">No requests found</td>
                      </tr>
                    )}
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
                {console.log("Selected Request in Modal:", selectedRequest)}
                {/* Item Details */}
                <div className="details-section">
                  <p>
                    <strong>Item Name:</strong>{" "}
                    {selectedRequest?.item?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {selectedRequest?.item?.description || "N/A"}
                  </p>
                  <p>
                    <strong>Category:</strong>{" "}
                    {selectedRequest?.item?.category || "N/A"}
                  </p>
                </div>
                {/* Request Status */}
                <div className="status-section">
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`status ${selectedRequest?.status?.toLowerCase()}`}
                    >
                      {selectedRequest?.status || "N/A"}
                    </span>
                  </p>
                </div>
                {/* Dates Section */}
                <div className="dates-section">
                  <p>
                    <strong>Request Date:</strong>{" "}
                    {selectedRequest?.requestDate
                      ? formatDateTime(selectedRequest.requestDate)
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Borrow Date:</strong>{" "}
                    {selectedRequest?.borrowDate
                      ? formatDateTime(selectedRequest.borrowDate)
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Return Date:</strong>{" "}
                    {selectedRequest?.returnDate
                      ? formatDateTime(selectedRequest.returnDate)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedRequest?.status?.toLowerCase() === "pending" && (
                <button
                  className="cancel-modal-btn"
                  onClick={handleCancelFromModal}
                >
                  Cancel Request
                </button>
              )}
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

export default RejectedPage;
