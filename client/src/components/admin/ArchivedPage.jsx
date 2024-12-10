import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "../../css/ArchivePage.css";

const ArchivedPage = () => {
  const [archivedItems, setArchivedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    if (window.confirm("Are you sure you want to restore this item?")) {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem("sessionToken");

        console.log("Item to restore:", row);

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
          setArchivedItems((prevItems) =>
            prevItems.filter((item) => item.item_id !== row.item_id)
          );

          setSuccessMessage("Item restored successfully");

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
        setError("Failed to restore item");
        console.error("Error restoring item:", error);
        if (error.response?.status === 401) {
          setError("Unauthorized access. Please log in again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (itemId) => {
    if (
      window.confirm("Are you sure you want to permanently delete this item?")
    ) {
      setIsLoading(true);
      try {
        const response = await axios.delete(
          `http://localhost:3000/items/${itemId}`
        );
        if (response.status === 200) {
          setArchivedItems((prevItems) =>
            prevItems.filter((item) => item._id !== itemId)
          );
          setSuccessMessage("Item deleted successfully");
        }
      } catch (error) {
        setError("Failed to delete item");
        console.error("Error deleting item:", error);
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
            justifyContent: "center",
            minWidth: "150px", // Ensure enough space for buttons
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
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
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

    fetchArchivedItems();
  }, []);

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
                <ul className="breadcrumb">
                  <li>
                    <a href="#">Items</a>
                  </li>
                  <li>
                    <i className="bx bx-chevron-right"></i>
                  </li>
                  <li>
                    <a className="active" href="#">
                      Users
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}

            <div
              style={{
                padding: "0px",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                margin: "0px",
                height: "540px",
                overflow: "hidden",
              }}
            >
              <DataTable
                columns={itemColumns}
                data={archivedItems}
                pagination={false}
                responsive
                highlightOnHover
                pointerOnHover
                progressPending={loadingItems || isLoading}
                progressComponent={<div>Loading...</div>}
                customStyles={customStyles}
                noDataComponent={
                  <div style={{ padding: "24px" }}>No archived items found</div>
                }
                fixedHeader
                fixedHeaderScrollHeight="calc(100vh - 290px)"
                dense
              />
            </div>
          </main>
        </section>
      </div>
    </>
  );
};

export default ArchivedPage;
