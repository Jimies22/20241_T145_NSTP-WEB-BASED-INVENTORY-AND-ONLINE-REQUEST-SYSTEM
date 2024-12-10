// src/components/EditPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AddItems.css";

function AddItems({ updateItem }) {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    item_id: "",
    name: "",
    description: "",
    category: "",
    isArchived: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editLocked, setEditLocked] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [lockTimer, setLockTimer] = useState(null);
  const LOCK_TIMEOUT = 120000; // 1 mins in milliseconds

  const columns = [
    {
      name: "Item ID",
      selector: (row) => row.item_id,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      wrap: true,
      grow: 2,
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="actions">
          <button
            onClick={() => handleShowModal(row)}
            className="edit-btn"
            disabled={editLocked}
            title={editLocked ? "Item is being edited by another user" : "Edit item"}
          >
            <i className={`bx ${editLocked ? 'bx-lock' : 'bx-edit'}`}></i>
          </button>
          <button
            onClick={() => handleArchive(row)}
            className="archive-btn"
            title="Archive"
          >
            <i className="bx bx-archive-in"></i>
          </button>
          {/* <button 
                        onClick={() => handleDelete(row.item_id)}
                        className="delete-btn"
                    >
                        <i className='bx bx-trash'></i>
                    </button> */}
        </div>
      ),
      width: "150px",
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
    subHeader: {
      style: {
        padding: "16px 24px",
        backgroundColor: "#ffffff",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e0e0e0",
        margin: "0",
        padding: "16px",
      },
      pageButtonsStyle: {
        borderRadius: "6px",
        height: "32px",
        padding: "0 12px",
        margin: "0 4px",
      },
    },
  };

  useEffect(() => {
    fetchItems();
    checkLockStatus();
    return () => {
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("sessionToken");
      const response = await axios.get("http://localhost:3000/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Display all unarchived items
      const unarchivedItems = response.data.filter((item) => !item.isArchived);
      setItems(unarchivedItems);
      setError(null);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("sessionToken");

    try {
      const formDataToSend = new FormData();
      if (isEditing) {
        formDataToSend.append("item_id", formData.item_id);
      }
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("isArchived", formData.isArchived || false);
      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      if (isEditing) {
        await axios.patch(
          `http://localhost:3000/items/${formData.item_id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await axios.post("http://localhost:3000/items/additem", formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }
      setSuccessMessage(
        isEditing ? "Item updated successfully" : "Item added successfully"
      );
      await fetchItems();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving item:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        setError(
          `Error saving item: ${error.response.data.message || "Unknown error"}`
        );
      } else {
        setError("Error saving item");
      }
    }
  };

  const handleDelete = async (item_id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`http://localhost:3000/items/${item_id}`);
        setSuccessMessage("Item deleted successfully");
        handleCloseModal();
        fetchItems();
      } catch (error) {
        console.error("Error deleting item:", error);
        setError("Error deleting item");
        handleCloseModal();
      }
    }
  };

  const generateNewItemId = async () => {
    try {
      const response = await axios.get("http://localhost:3000/items/last-item-id");
      const lastId = response.data.lastItemId;
      const nextId = (parseInt(lastId) + 1).toString();
      return nextId;
    } catch (error) {
      console.error("Error generating new item ID:", error);
      return "1"; // Fallback to 1 if there's an error
    }
  };

  const handleShowModal = async (item = null) => {
    try {
      await axios.patch(
        `http://localhost:3000/locks/edit_button`,
        { isLocked: true },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("sessionToken")}`,
          },
        }
      );
      setEditLocked(true);

      const timer = setTimeout(async () => {
        await handleCloseModal();
      }, LOCK_TIMEOUT);
      setLockTimer(timer);

      if (item) {
        setFormData({
          item_id: item.item_id,
          name: item.name,
          description: item.description,
          category: item.category,
          isArchived: item.isArchived,
        });
        setIsEditing(true);
      } else {
        setFormData({
          item_id: "",
          name: "",
          description: "",
          category: "",
          isArchived: false,
        });
        setIsEditing(false);
      }
      setShowModal(true);
    } catch (error) {
      console.error("Error setting lock:", error);
    }
  };

  const handleCloseModal = async () => {
    try {
      // Clear the timer if it exists
      if (lockTimer) {
        clearTimeout(lockTimer);
        setLockTimer(null);
      }

      await axios.patch(
        `http://localhost:3000/locks/edit_button`,
        { isLocked: false },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("sessionToken")}`,
          },
        }
      );
      setEditLocked(false);

      setShowModal(false);
      setFormData({
        item_id: "",
        name: "",
        description: "",
        category: "",
        isArchived: false,
      });
      setIsEditing(false);
      setSuccessMessage("");
    } catch (error) {
      console.error("Error releasing lock:", error);
    }
  };

  const handleArchive = async (item) => {
    if (window.confirm("Are you sure you want to archive this item?")) {
      try {
        const token = sessionStorage.getItem("sessionToken");
        const response = await axios.patch(
          `http://localhost:3000/items/${item.item_id}`,
          {
            isArchived: true,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          setSuccessMessage("Item archived successfully");
          // Remove the archived item from the current items list
          setItems((prevItems) =>
            prevItems.filter((i) => i.item_id !== item.item_id)
          );
        }
      } catch (error) {
        console.error("Error archiving item:", error);
        setError("Error archiving item");
      }
    }
  };

  const filteredItems = items
    .filter((item) => !item.isArchived) // Only show unarchived items
    .filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const addNewItem = async (itemData) => {
    try {
      // First save the item
      const response = await fetch("/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("sessionToken")}`,
        },
        body: JSON.stringify(itemData),
      });
      const savedItem = await response.json();

      // Then send notifications
      await fetch("/notify/new-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("sessionToken")}`,
        },
        body: JSON.stringify({
          itemName: itemData.name,
          itemId: savedItem._id,
        }),
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const checkLockStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/locks/edit_button`);
      setEditLocked(response.data?.isLocked || false);
    } catch (error) {
      console.error("Error checking lock status:", error);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <section id="content">
        <AdminNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Items Management</h1>
              <ul className="breadcrumb">
                <li><a href="#">Items</a></li>
                <li><i className='bx bx-chevron-right'></i></li>
                <li><a className="active" href="/admin">Home</a></li>
              </ul>
            </div>
          </div>

          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          <div className="table-data">
            <div className="order">
              <DataTable
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      padding: "0 8px",
                    }}
                  >
                    <div>Items List</div>
                    <div className="search-wrapper1">
                      <i className="bx bx-search"></i>
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      className="add-new-button"
                      onClick={() => handleShowModal()}
                    >
                      <i className="bx bx-plus"></i>
                      Add New Item
                    </button>
                  </div>
                }
                columns={columns}
                data={filteredItems}
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
                    {error ? error : "No items found"}
                  </div>
                }
              />
            </div>
          </div>

          {/* Bootstrap Modal */}
          <div
            className={`modal fade ${showModal ? "show" : ""}`}
            style={{ display: showModal ? "block" : "none" }}
            tabIndex="-1"
            role="dialog"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {isEditing ? "Edit Item" : "Add New Item"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description:</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Category:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Image:</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {previewUrl && (
                        <div className="mt-2">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isEditing ? "Update Item" : "Add Item"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {showModal && <div className="modal-backdrop fade show"></div>}
        </main>
      </section>
    </div>
  );
}

export default AddItems;
