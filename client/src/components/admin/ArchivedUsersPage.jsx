import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "../../css/ArchivePage.css";
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";
import { logActivity } from '../../utils/activityLogger';

const ArchivedUsersPage = () => {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const customStyles = {
    table: {
      style: {
        backgroundColor: "white",
        borderCollapse: "collapse",
        width: "100%",
      },
    },
    rows: {
      style: {
        minHeight: "52px",
        borderBottom: "1px solid #e5e5e5",
        fontSize: "14px",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      },
    },
    headCells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
        backgroundColor: "#f8f9fa",
        fontWeight: "bold",
        fontSize: "14px",
        color: "#333",
        borderBottom: "2px solid #dee2e6",
        minHeight: "52px",
      },
    },
    cells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
        fontSize: "14px",
      },
    },
  };

  const columns = [
    {
      name: "Name",
      selector: row => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
    },
    {
      name: "Role",
      selector: row => row.role,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="actions" style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleRestore(row)}
            className="restore-btn"
            disabled={isLoading}
            style={{
              padding: "6px 12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Restore
          </button>
          <button
            onClick={() => {
              console.log("Delete clicked for user:", row); // Debug log
              handleDelete(row.userID);
            }}
            className="delete-btn"
            disabled={isLoading}
            style={{
              padding: "6px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ),
      width: "200px",
    },
  ];

  const fetchArchivedUsers = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("sessionToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const archived = response.data.filter((user) => user.isArchived === true);
        setArchivedUsers(archived);
      }
    } catch (error) {
      console.error("Error fetching archived users:", error);
      let errorMessage = 'Failed to fetch archived users';
      if (error.response?.status === 401) {
        errorMessage = "Unauthorized access. Please log in again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMessage,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedUsers();
  }, []);

  const handleRestore = async (user) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to restore this user?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!'
    });

    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem('sessionToken');
        const response = await axios.patch(
          `http://localhost:3000/users/${user.userID}/unarchive`,
          { isArchived: false },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          await logActivity(
            'RESTORE_USER',
            `Restored user: ${user.name} (${user.email})`
          );
          
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'User restored successfully'
          });
          
          await fetchArchivedUsers();
        }
      } catch (error) {
        console.error("Error restoring user:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to restore user'
        });
      }
    }
  };

  const handleDelete = async (userID) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!'
    });

    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem('sessionToken');
        await axios.delete(
          `http://localhost:3000/users/${userID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        await logActivity(
          'DELETE_USER',
          `Permanently deleted user ID: ${userID}`
        );

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User has been permanently deleted.'
        });
        
        await fetchArchivedUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete user'
        });
      }
    }
  };

  const buttonHoverStyles = `
    .restore-btn:hover {
      background-color: #218838 !important;
    }
    .delete-btn:hover {
      background-color: #c82333 !important;
    }
  `;

  return (
    <>
      <style>{buttonHoverStyles}</style>
      <div className="dashboard">
        <Sidebar />
        <section id="content">
          <AdminNavbar />
          <main>
            <div className="head-title">
              <div className="left">
                <h1>Archives</h1>
              </div>
            </div>

            <div className="table-data">
              <div className="order">
                <div className="head">
                  <h3>Archived Users</h3>
                  <div className="tabs">
                    <Link 
                      to="/archive"
                      className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
                      onClick={() => setActiveTab('items')}
                    >
                      Items
                    </Link>
                    <Link 
                      to="/admin/archived-users"
                      className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                      onClick={() => setActiveTab('users')}
                    >
                      Users
                    </Link>
                  </div>
                </div>
                <DataTable
                  columns={columns}
                  data={archivedUsers}
                  pagination
                  responsive
                  highlightOnHover
                  pointerOnHover
                  progressPending={loading}
                  progressComponent={<div>Loading...</div>}
                  customStyles={customStyles}
                  noDataComponent={
                    <div className="no-requests">
                      <i className="bx bx-user" style={{ fontSize: "2rem", marginBottom: "10px" }}></i>
                      <p>No archived users found</p>
                    </div>
                  }
                />
              </div>
            </div>
          </main>
        </section>
      </div>
    </>
  );
};

export default ArchivedUsersPage;