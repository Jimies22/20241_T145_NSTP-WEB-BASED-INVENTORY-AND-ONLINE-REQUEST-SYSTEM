import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/UserSidebar"; // Ensure the correct path
import UserNavbar from "../Navbar/UserNavbar"; // Ensure the correct path
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import "../../css/RequestModal.css"; // Changed from Modal.css to RequestModal.css
import DataTable from 'react-data-table-component';

function RequestPage() {
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

  // Add columns configuration
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
        <div className="action-buttons">
          <button className="view-btn" onClick={() => handleViewClick(row)}>
            View
          </button>
        </div>
      ),
      width: '200px',
      center: true
    }
  ];

  // Add DataTable styles
  const customStyles = {
    table: {
      style: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '1rem',
        minWidth: '100%',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottomWidth: '2px',
        minHeight: '50px',
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        padding: '15px',
      },
    },
    rows: {
      style: {
        minHeight: '72px',
        fontSize: '14px',
        '&:not(:last-of-type)': {
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: '#e5e5e5',
        },
      },
    },
    cells: {
      style: {
        padding: '15px',
      },
    },
    pagination: {
      style: {
        borderTop: 'none',
        marginTop: '10px',
      },
    },
  };

  return (
    <div className="user-dashboard">
      <Sidebar />
      <section id="content">
        <UserNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Approved Request</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="/user-request">Approved</a>
                </li>
                <li>
                  <i className="bx bx-chevron-right" />
                </li>
                <li>
                  <a
                    className="active"
                    href="/user-request/Pending"
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
                    href="/user-request/rejected"
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
            <div className="pending-requests">
              <div className="head">
                <h3>My Requests</h3>
                <i className="bx bx-filter" />
              </div>
              <DataTable
                columns={columns}
                data={userRequests}
                pagination
                paginationComponentOptions={{
                  rowsPerPageText: 'Rows per page:',
                  rangeSeparatorText: 'of',
                  selectAllRowsItem: true,
                  selectAllRowsItemText: 'All',
                }}
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
                customStyles={customStyles}
                noDataComponent={
                  <div style={{ padding: '24px' }}>No requests found</div>
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

export default RequestPage;
