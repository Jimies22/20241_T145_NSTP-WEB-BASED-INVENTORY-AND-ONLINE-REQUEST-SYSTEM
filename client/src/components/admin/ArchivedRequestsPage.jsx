import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "../../css/ArchivePage.css";
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";
import { logActivity } from '../../utils/activityLogger';

const ArchivedRequestsPage = () => {
  const [archivedRequests, setArchivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userIdToNameMap, setUserIdToNameMap] = useState({});
  const [itemIdToNameMap, setItemIdToNameMap] = useState({});

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
      name: "User",
      selector: row => userIdToNameMap[row.userId] || "N/A",
      sortable: true,
    },
    {
      name: "Item",
      selector: row => itemIdToNameMap[row.itemId] || "N/A",
      sortable: true,
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      cell: row => (
        <span className={`status ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Borrow Date",
      selector: row => new Date(row.borrowDate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Return Date",
      selector: row => new Date(row.returnDate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Archive Date",
      selector: row => new Date(row.updatedAt).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: row => (
        <div className="actions">
          <button
            className="restore-btn"
            onClick={() => handleRestore(row)}
          >
            <i className="bx bx-refresh"></i>
            Restore
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchArchivedRequests();
  }, []);

  useEffect(() => {
    if (archivedRequests.length > 0) {
      fetchUserNames();
      fetchItemNames();
    }
  }, [archivedRequests]);

  const fetchArchivedRequests = async () => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      const response = await axios.get("http://localhost:3000/borrow/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const archived = response.data.filter(request => request.isArchived);
      setArchivedRequests(archived);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching archived requests:", error);
      setError("Failed to fetch archived requests");
      setLoading(false);
    }
  };

  const fetchUserNames = async () => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      const response = await axios.get("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userMap = {};
      response.data.forEach(user => {
        userMap[user._id] = user.name;
      });
      setUserIdToNameMap(userMap);
    } catch (error) {
      console.error("Error fetching user names:", error);
    }
  };

  const fetchItemNames = async () => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      const response = await axios.get("http://localhost:3000/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const itemMap = {};
      response.data.forEach(item => {
        itemMap[item._id] = item.name;
      });
      setItemIdToNameMap(itemMap);
    } catch (error) {
      console.error("Error fetching item names:", error);
    }
  };

  const handleRestore = async (request) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to restore this request?",
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
          `http://localhost:3000/borrow/${request._id}/unarchive`,
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
            'RESTORE_REQUEST',
            `Restored request for item: ${itemIdToNameMap[request.itemId] || 'Unknown Item'}`
          );
          
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Request restored successfully'
          });
          
          await fetchArchivedRequests();
        }
      } catch (error) {
        console.error("Error restoring request:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to restore request'
        });
      }
    }
  };

  return (
    <>
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
                  <h3>Archived Requests</h3>
                  <div className="tabs">
                    <Link 
                      to="/archive"
                      className="tab-btn"
                    >
                      Items
                    </Link>
                    <Link 
                      to="/admin/archived-users"
                      className="tab-btn"
                    >
                      Users
                    </Link>
                    <Link 
                      to="/admin/archived-requests"
                      className="tab-btn active"
                    >
                      Requests
                    </Link>
                  </div>
                </div>
                <DataTable
                  columns={columns}
                  data={archivedRequests}
                  pagination
                  responsive
                  highlightOnHover
                  pointerOnHover
                  progressPending={loading}
                  progressComponent={<div>Loading...</div>}
                  customStyles={customStyles}
                  noDataComponent={
                    <div className="no-requests">
                      <i className="bx bx-list-ul" style={{ fontSize: "2rem", marginBottom: "10px" }}></i>
                      <p>No archived requests found</p>
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

export default ArchivedRequestsPage; 