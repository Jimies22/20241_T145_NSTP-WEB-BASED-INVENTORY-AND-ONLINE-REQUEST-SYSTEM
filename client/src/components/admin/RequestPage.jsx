import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import DataTable from "react-data-table-component";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import Swal from 'sweetalert2';

const RequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = sessionStorage.getItem("sessionToken");
    try {
      const response = await axios.get("http://localhost:3000/borrow/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sortedRequests = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRequests(sortedRequests);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.status === 401 
          ? "Unauthorized access. Please log in again." 
          : "Error fetching requests",
        icon: "error"
      });
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, itemId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to approve this request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!'
    });

    if (result.isConfirmed) {
      const token = sessionStorage.getItem("sessionToken");
      try {
        await axios.patch(
          `http://localhost:3000/borrow/${requestId}/status`,
          { status: "approved", itemId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        Swal.fire({
          title: "Success!",
          text: "Request approved successfully",
          icon: "success"
        });
        
        fetchRequests();
      } catch (error) {
        console.error("Error approving request:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to approve request",
          icon: "error"
        });
      }
    }
  };

  const handleReject = async (requestId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to reject this request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject it!'
    });

    if (result.isConfirmed) {
      const token = sessionStorage.getItem("sessionToken");
      try {
        await axios.patch(
          `http://localhost:3000/borrow/${requestId}/status`,
          { status: "rejected" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        Swal.fire({
          title: "Success!",
          text: "Request rejected successfully",
          icon: "success"
        });
        
        fetchRequests();
      } catch (error) {
        console.error("Error rejecting request:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to reject request",
          icon: "error"
        });
      }
    }
  };

  const isActionable = (status) => {
    return status === "pending";
  };

  const columns = [
    {
      name: "User Name",
      selector: (row) => row.userId.name || "Unknown User",
      sortable: true,
    },
    {
      name: "Item Name",
      selector: (row) => row.item.name || "Unknown Item",
      sortable: true,
    },
    {
      name: "Borrow Date",
      selector: (row) => new Date(row.borrowDate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Return Date",
      selector: (row) => new Date(row.returnDate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span className={`status ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="actions">
          <button
            onClick={() => handleApprove(row._id, row.item._id)}
            className={`approve-btn ${!isActionable(row.status) ? 'disabled' : ''}`}
            disabled={!isActionable(row.status)}
          >
            <i className='bx bx-check'></i>
            Approve
          </button>
          <button
            onClick={() => handleReject(row._id)}
            className={`reject-btn ${!isActionable(row.status) ? 'disabled' : ''}`}
            disabled={!isActionable(row.status)}
          >
            <i className='bx bx-x'></i>
            Reject
          </button>
        </div>
      ),
      width: "200px",
    },
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e0e0e0",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#f8f9fa",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        borderBottom: "2px solid #e0e0e0",
        fontWeight: "600",
        color: "#2c3e50",
        fontSize: "0.95rem",
        minHeight: "52px",
      },
    },
    rows: {
      style: {
        fontSize: "0.9rem",
        fontWeight: "400",
        color: "#2c3e50",
        minHeight: "52px",
        "&:hover": {
          backgroundColor: "#f8f9fa",
          cursor: "pointer",
          transition: "all 0.2s ease",
        },
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e0e0e0",
        margin: "0",
        padding: "16px",
      },
    },
  };

  const filteredRequests = requests.filter(request => {
    const searchStr = searchTerm.toLowerCase();
    return (
      request.userId.name?.toLowerCase().includes(searchStr) ||
      request.item.name?.toLowerCase().includes(searchStr) ||
      request.status.toLowerCase().includes(searchStr)
    );
  });

  return (
    <>
      <style>{buttonHoverStyles}</style>
      <div className="admin-dashboard">
        <Sidebar />
        <section id="content">
          <AdminNavbar />
          <main>
            <div className="head-title">
              <div className="left">
                <h1>Requests</h1>
                <ul className="breadcrumb">
                  <li><a href="#">Requests</a></li>
                  <li><i className='bx bx-chevron-right'></i></li>
                  <li><a className="active" href="/admin">Home</a></li>
                </ul>
              </div>
            </div>
            <div className="table-data">
              <div className="pending-requests">
                <div className="head">
                  <h3>Pending Requests</h3>
                </div>
                <div className="order">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>User Name</th>
                          <th>Item Name</th>
                          <th>Borrow Date</th>
                          <th>Return Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
  {requests.length > 0 ? (
    requests.map((request) => (
      <tr key={request._id}>
        <td>{userIdToNameMap[request.userId] || "Unknown User"}</td>
        <td>{itemIdToNameMap[request.item?._id] || "Unknown Item"}</td> {/* Added optional chaining */}
        <td>{new Date(request.borrowDate).toLocaleDateString()}</td>
        <td>{new Date(request.returnDate).toLocaleDateString()}</td>
        <td>
          <span className={`status ${request.status.toLowerCase()}`}>
            {request.status}
          </span>
        </td>
        <td>
          <div className="actions">
            <button
              onClick={() => handleApprove(request._id, request.item?._id)} // Added optional chaining
              className={`approve-btn ${!isActionable(request.status) ? 'disabled' : ''}`}
              disabled={!isActionable(request.status)}
            >
              <i className='bx bx-check'></i>
              Approve
            </button>
            <button
              onClick={() => handleReject(request._id)}
              className={`reject-btn ${!isActionable(request.status) ? 'disabled' : ''}`}
              disabled={!isActionable(request.status)}
            >
              <i className='bx bx-x'></i>
              Reject
            </button>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="no-requests">
        <i className='bx bx-package' style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
        <p>No pending requests available</p>
      </td>
    </tr>
  )}
</tbody>
                    </table>
                  </div>
                }
                columns={columns}
                data={filteredRequests}
                pagination
                responsive
                highlightOnHover
                pointerOnHover
                progressPending={loading}
                progressComponent={<div className="loading">Loading requests...</div>}
                customStyles={customStyles}
                noDataComponent={
                  <div className="no-data">
                    No requests available
                  </div>
                }
              />
            </div>
          </div>
        </main>
      </section>
    </div>
  );
};

export default RequestPage;
