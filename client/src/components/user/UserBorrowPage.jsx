import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/UserSidebar";
import UserNavbar from "../Navbar/UserNavbar";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import "../../css/RequestModal.css";

function UserBorrowPage() {
  const [userRequests, setUserRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchApprovedRequests = async () => {
      const token = sessionStorage.getItem("sessionToken");
      if (!token) return;

      try {
        const response = await fetch(
          "http://localhost:3000/borrow/my-requests?status=approved",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error fetching approved requests: ${errorText}`);
        }

        const data = await response.json();
        const approvedRequests = data.filter(request => 
          request.status.toLowerCase() === 'approved'
        );
        setUserRequests(approvedRequests);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchApprovedRequests();
  }, []);

  const handleViewClick = (request) => {
    console.log("View clicked for request:", request);
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleDownloadPDF = async (request) => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      console.log("Requesting PDF for:", request._id);
      
      const response = await fetch(`http://localhost:3000/pdf/generate-pdf/${request._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to generate PDF: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `borrowed-item-${request._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Detailed error:', error);
      alert(`Error downloading PDF: ${error.message}`);
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
              <h1>Borrowed</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Borrowed</a>
                </li>
                <li><i className="bx bx-chevron-right" /></li>
                <li><a className="active" href="/user">Home</a></li>
              </ul>
            </div>
          </div>
          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>Borrowed Items</h3>
                <i className="bx bx-filter" />
              </div>
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="requested-items-list">
                    {userRequests && userRequests.length > 0 ? (
                      userRequests.map((request) => (
                        <tr key={request._id}>
                          <td>
                            <div className="item-details">
                              {/* <strong>{request.item?.name || "N/A"}</strong>
                              <p>{request.item?.description || "N/A"}</p> */}
                              <small>Category: {request.item?.category || "N/A"}</small>
                              <small>
                                Request Date: {formatDateTime(request.requestDate)}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span className={`status ${request.status.toLowerCase()}`}>
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
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">No borrowed items found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {isModalOpen && selectedRequest && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Borrowed Item Details</h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
              <div className="modal-body">
                <div className="request-info">
                  <div className="details-section">
                    <p>
                      <strong>Item Name:</strong>{" "}
                      {selectedRequest.item?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedRequest.item?.description || "N/A"}
                    </p>
                    <p>
                      <strong>Category:</strong>{" "}
                      {selectedRequest.item?.category || "N/A"}
                    </p>
                  </div>
                  <div className="status-section">
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`status ${selectedRequest.status.toLowerCase()}`}>
                        {selectedRequest.status}
                      </span>
                    </p>
                  </div>
                  <div className="dates-section">
                    <p>
                      <strong>Request Date:</strong>{" "}
                      {formatDateTime(selectedRequest.requestDate)}
                    </p>
                    <p>
                      <strong>Borrow Date:</strong>{" "}
                      {formatDateTime(selectedRequest.borrowDate)}
                    </p>
                    <p>
                      <strong>Return Date:</strong>{" "}
                      {formatDateTime(selectedRequest.returnDate)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="download-pdf-btn" 
                  onClick={() => handleDownloadPDF(selectedRequest)}
                >
                  Download PDF
                </button>
                <button className="close-modal-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default UserBorrowPage;
