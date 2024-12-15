import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "../../css/ArchivePage.css";
import Swal from 'sweetalert2';
import { logActivity } from '../../utils/activityLogger';

const ArchivedUsersPage = () => {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
    },
    {
      name: "Department",
      selector: (row) => row.department,
      sortable: true,
    },
    {
      name: "Archive Date",
      selector: (row) => new Date(row.updatedAt).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div
          className="actions"
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            minWidth: "150px",
          }}
        >
          <button
            onClick={() => handleRestore(row)}
            className="restore-btn"
            disabled={loading}
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
            onClick={() => handleDelete(row.userID)}
            className="delete-btn"
            disabled={loading}
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
    },
  ];

  useEffect(() => {
    fetchArchivedUsers();
  }, []);

  const fetchArchivedUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('sessionToken');
      const response = await axios.get("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const archived = response.data.filter((user) => user.isArchived);
      setArchivedUsers(archived);
      setError(null);
    } catch (error) {
      console.error("Error fetching archived users:", error);
      setError("Failed to fetch archived users");
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch archived users'
      });
    } finally {
      setLoading(false);
    }
  };

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
                <h1>Archived Users</h1>
                <ul className="breadcrumb">
                  <li><a href="#">Users</a></li>
                  <li><i className='bx bx-chevron-right'></i></li>
                  <li><a className="active" href="/archive">Items</a></li>
                  <li><i className='bx bx-chevron-right'></i></li>
                  <li><a className="active" href="/admin">Home</a></li>
                </ul>
              </div>
            </div>

            <div className="table-data">
              <div className="order">
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
                    <div style={{ padding: "24px" }}>
                      {error || "No archived users found"}
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