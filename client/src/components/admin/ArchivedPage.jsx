import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "../../css/ArchivePage.css";
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";
import { logActivity } from '../../utils/activityLogger';

const ArchivedPage = () => {
  const [archivedItems, setArchivedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('items');

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

  const handleRestore = async (row) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to restore this item?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!'
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem("sessionToken");
        const response = await axios.patch(
          `http://localhost:3000/items/${row.item_id}/restore`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          // Log the restore activity
          await logActivity('RESTORE_ITEM', `Restored item: ${row.name}`);

          setArchivedItems((prevItems) =>
            prevItems.filter((item) => item.item_id !== row.item_id)
          );

          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Item restored successfully'
          });

          const updatedResponse = await axios.get(
            "http://localhost:3000/items",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const archivedItems = updatedResponse.data.filter(
            (item) => item.isArchived
          );
          setArchivedItems(archivedItems);
        }
      } catch (error) {
        console.error("Error restoring item:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.status === 401 
            ? 'Unauthorized access. Please log in again.' 
            : 'Failed to restore item'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (itemId) => {
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
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem("sessionToken");
        // Get the item name before deleting
        const itemResponse = await axios.get(
          `http://localhost:3000/items/${itemId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const itemName = itemResponse.data.name;

        // Delete the item
        const response = await axios.delete(
          `http://localhost:3000/items/${itemId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          // Log the activity
          await logActivity('DELETE_ITEM', `Permanently deleted item: ${itemName}`);
          
          setArchivedItems((prevItems) =>
            prevItems.filter((item) => item.item_id !== itemId)
          );
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Item has been permanently deleted.'
          });
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.status === 401 
            ? 'Unauthorized access. Please log in again.' 
            : 'Failed to delete item'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const itemColumns = [
    {
      name: "Item Name",
      selector: (row) => row.name,
      sortable: true,
      width: "15%",
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      width: "15%",
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
      wrap: true,
      width: "25%",
    },
    {
      name: "Status",
      selector: (row) => row.status || "Archived",
      sortable: true,
      width: "15%",
    },
    {
      name: "Archive Date",
      selector: (row) => new Date(row.updatedAt).toLocaleDateString(),
      sortable: true,
      width: "15%",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div
          className="actions"
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-start",
            width: "100%",
            padding: "8px 0",
          }}
        >
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
              whiteSpace: "nowrap",
            }}
          >
            Restore
          </button>
          <button
            onClick={() => handleDelete(row.item_id)}
            className="delete-btn"
            disabled={isLoading}
            style={{
              padding: "6px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Delete
          </button>
        </div>
      ),
      width: "200px",
    },
  ];

  const fetchArchivedItems = async () => {
    setLoadingItems(true);
    try {
      const token = sessionStorage.getItem("sessionToken");
      const response = await axios.get("http://localhost:3000/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const archived = response.data.filter((item) => item.isArchived);
      setArchivedItems(archived);
      setLoadingItems(false);
    } catch (error) {
      setError("Error fetching archived items");
      if (error.response?.status === 401) {
        setError("Unauthorized access. Please log in again.");
      }
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'items') {
      fetchArchivedItems();
    }
  }, [activeTab]);

  // Add hover effects with CSS
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
      <div className="user-dashboard">
        <Sidebar />
        <section id="content">
          <AdminNavbar />
          <main>
            <div className="head-title">
              <div className="left">
                <h1>Archives</h1>
                {/* <ul className="breadcrumb">
                  <li><a href="#">Archives</a></li>
                  <li><i className='bx bx-chevron-right'></i></li>
                  <li><a className="active" href="/admin">Home</a></li>
                </ul> */}
              </div>
            </div>

            <div className="table-data">
              <div className="order">
                <div className="head">
                  <h3>Archived {activeTab}</h3>
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
                  columns={activeTab === 'items' ? itemColumns : itemColumns}
                  data={activeTab === 'items' ? archivedItems : archivedItems}
                  pagination
                  responsive
                  highlightOnHover
                  pointerOnHover
                  progressPending={activeTab === 'items' ? loadingItems : loadingItems}
                  progressComponent={<div>Loading...</div>}
                  customStyles={customStyles}
                  noDataComponent={
                    <div className="no-requests">
                      <i className={`bx ${activeTab === 'items' ? 'bx-package' : 'bx-package'}`} 
                         style={{ fontSize: "2rem", marginBottom: "10px" }}/>
                      <p>No archived {activeTab} found</p>
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

export default ArchivedPage;