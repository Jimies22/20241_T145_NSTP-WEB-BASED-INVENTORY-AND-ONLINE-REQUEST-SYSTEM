import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/UserSidebar";
import UserNavbar from "../Navbar/UserNavbar";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import "../../css/RequestModal.css";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";

function UserBorrowPage() {
  const [userRequests, setUserRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } finally {
        setLoading(false);
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

  const columns = [
    {
      name: "Item ID",
      selector: (row) => row.item?.item_id,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.item?.name,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.item?.description,
      wrap: true,
      grow: 2,
    },
    {
      name: "Category",
      selector: (row) => row.item?.category,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
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
      width: "150px",
    },
  ];

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
              <h1>Borrowed</h1>
              <ul className="breadcrumb">
                <li><a href="#">Borrowed</a></li>
                <li><i className='bx bx-chevron-right'></i></li>
                <li><a className="active" href="/user">Home</a></li>
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
                    <div>Borrowed Items</div>
                    <div className="search-wrapper1">
                      <i className="bx bx-search"></i>
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search borrowed items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                }
                columns={columns}
                data={userRequests}
                pagination
                responsive
                highlightOnHover
                pointerOnHover
                progressPending={loading}
                progressComponent={
                  <div className="loading">Loading items...</div>
                }
                customStyles={customStyles}
                noDataComponent={
                  <div className="no-data">
                    {error ? error : "No borrowed items found"}
                  </div>
                }
              />
            </div>
          </div>

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
                  <button className="close-modal-btn" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

export default UserBorrowPage;
