import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/UserSidebar"; // Ensure the correct path
import UserNavbar from "../Navbar/UserNavbar"; // Ensure the correct path
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import "../../css/RequestModal.css"; // Changed from Modal.css to RequestModal.css
import DataTable from "react-data-table-component";
import axios from "axios";
import Swal from "sweetalert2";
import { logActivity } from '../../utils/activityLogger';

function CancelledPage() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    const fetchUserRequests = async () => {
      const token = sessionStorage.getItem("sessionToken");
      if (!token) return;

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
          throw new Error(`Error fetching requests: ${await response.text()}`);
        }

        const data = await response.json();
        // Filter cancelled requests and not archived
        const cancelledRequests = data.filter(
          request => request.status.toLowerCase() === 'cancelled' && !request.isArchived
        );
        setUserRequests(cancelledRequests);
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

  const handleArchive = async (request) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to archive this cancelled request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, archive it!'
    });

    if (result.isConfirmed) {
      try {
        setIsArchiving(true);
        const token = sessionStorage.getItem("sessionToken");
        const response = await axios.patch(
          `http://localhost:3000/borrow/${request._id}/archive`,
          { isArchived: true },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );

        if (response.status === 200) {
          await logActivity('archive', `Archived cancelled request`);
          
          Swal.fire(
            'Archived!',
            'Request has been archived successfully.',
            'success'
          );

          // Update the local state to remove the archived request
          setUserRequests(userRequests.filter(r => r._id !== request._id));
        }
      } catch (error) {
        console.error("Error archiving request:", error);
        Swal.fire(
          'Error!',
          error.response?.data?.message || 'Failed to archive request',
          'error'
        );
      } finally {
        setIsArchiving(false);
      }
    }
  };

  // Update the columns configuration to match AddItems.jsx style
  const columns = [
    {
      name: 'REQUESTED ITEM',
      selector: row => row.item?.name,
      sortable: true,
      cell: row => (
        <div className="item-details">
          <strong>{row.item?.name || "N/A"}</strong>
          <p>{row.item?.description || "N/A"}</p>
          <small>Category: {row.item?.category || "N/A"}</small>
          <small>Request Date: {formatDateTime(row.requestDate)}</small>
        </div>
      ),
      grow: 2,
      wrap: true
    },
    {
      name: 'STATUS',
      selector: row => row.status,
      sortable: true,
      cell: row => (
        <span className={`status ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
      width: '150px'
    },
    {
      name: 'ACTIONS',
      cell: row => (
        <div className="actions">
          <button
            onClick={() => handleViewClick(row)}
            className="edit-btn"
            title="View details"
          >
            <i className='bx bx-show'></i>
          </button>
        </div>
      ),
      width: '150px',
      center: true
    }
  ];

  // Add the same custom styles as AddItems.jsx
  const customStyles = {
    table: {
      style: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        borderBottom: '2px solid #e0e0e0',
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '0.95rem',
        minHeight: '52px',
      },
    },
    rows: {
      style: {
        fontSize: '0.9rem',
        fontWeight: '400',
        color: '#2c3e50',
        minHeight: '52px',
        '&:hover': {
          backgroundColor: '#f8f9fa',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
      },
    },
    subHeader: {
      style: {
        padding: '16px 24px',
        backgroundColor: '#ffffff',
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #e0e0e0',
        margin: '0',
        padding: '16px',
      },
      pageButtonsStyle: {
        borderRadius: '6px',
        height: '32px',
        padding: '0 12px',
        margin: '0 4px',
      },
    },
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <section id="content">
        <UserNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Cancelled Request</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="/user-request/cancelled">Cancelled</a>
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
                    href="http://localhost:3001/user-request/Rejected"
                  >
                    Rejected
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
            <div className="order">
              <DataTable
                title={
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    padding: "0 8px",
                  }}>
                    <div>Cancelled Requests</div>
                    <div className="search-wrapper1">
                      <i className="bx bx-search"></i>
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                }
                columns={columns}
                data={userRequests}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
                customStyles={customStyles}
                noDataComponent={
                  <div style={{ padding: '24px' }}>No cancelled requests found</div>
                }
                responsive
                striped
                highlightOnHover
                pointerOnHover
                persistTableHead
                fixedHeader
              />
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CancelledPage;
