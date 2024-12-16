import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Sidebar from "../sidebar/UserSidebar";
import UserNavbar from "../Navbar/UserNavbar";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import "../../css/RequestModal.css";
import "../../css/AddItems.css";
import Swal from 'sweetalert2';

function UserBorrowPage() {
  const [userRequests, setUserRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovedRequests = async () => {
      setLoading(true);
      const token = sessionStorage.getItem("sessionToken");
      if (!token) {
        setError("No authentication token found");
        return;
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
          throw new Error(`Error fetching requests: ${errorText}`);
        }

        const data = await response.json();
        const filteredRequests = data.filter(request => 
          ['approved', 'returned'].includes(request.status.toLowerCase())
        );
        setUserRequests(filteredRequests);
        setError(null);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
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

  const handleDownloadPDF = async (request) => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Download PDF',
        text: "Do you want to download the PDF for this borrowed item?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, download it!'
      });

      // Only proceed if user confirmed
      if (!result.isConfirmed) {
        return;
      }

      // Show loading state
      Swal.fire({
        title: 'Generating PDF...',
        text: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

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

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'PDF has been downloaded successfully.',
        confirmButtonColor: '#3085d6'
      });

    } catch (error) {
      console.error('Detailed error:', error);
      alert(`Error downloading PDF: ${error.message}`);
    }
  };

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

  const filteredItems = userRequests.filter(request => {
    const searchString = searchTerm.toLowerCase();
    return (
      request.item?.name?.toLowerCase().includes(searchString) ||
      request.item?.description?.toLowerCase().includes(searchString) ||
      request.item?.category?.toLowerCase().includes(searchString) ||
      request.status?.toLowerCase().includes(searchString)
    );
  });

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
                    <div>Borrowed Items List</div>
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
                columns={[
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
                        <button
                          onClick={() => handleDownloadPDF(row)}
                          className="download-btn"
                          title="Download PDF"
                        >
                          <i className='bx bx-download'></i>
                        </button>
                      </div>
                    ),
                    width: '150px',
                    center: true
                  }
                ]}
                data={filteredItems}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
                customStyles={customStyles}
                noDataComponent={
                  <div style={{ padding: '24px' }}>No borrowed items found</div>
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
                    <p><strong>Item Name:</strong> {selectedRequest.item?.name || "N/A"}</p>
                    <p><strong>Description:</strong> {selectedRequest.item?.description || "N/A"}</p>
                    <p><strong>Category:</strong> {selectedRequest.item?.category || "N/A"}</p>
                  </div>
                  <div className="status-section">
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`status ${selectedRequest.status.toLowerCase()}`}>
                        {selectedRequest.status}
                      </span>
                    </p>
                    {selectedRequest.status.toLowerCase() === 'returned' && (
                      <p>
                        <strong>Return Notes:</strong>{" "}
                        {selectedRequest.returnNotes || "No notes provided"}
                      </p>
                    )}
                  </div>
                  <div className="dates-section">
                    <p><strong>Request Date:</strong> {formatDateTime(selectedRequest.requestDate)}</p>
                    <p><strong>Borrow Date:</strong> {formatDateTime(selectedRequest.borrowDate)}</p>
                    <p>
                      <strong>Return Date:</strong>{" "}
                      {selectedRequest.status.toLowerCase() === 'returned' 
                        ? formatDateTime(selectedRequest.returnDate)
                        : 'Not returned yet'}
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
