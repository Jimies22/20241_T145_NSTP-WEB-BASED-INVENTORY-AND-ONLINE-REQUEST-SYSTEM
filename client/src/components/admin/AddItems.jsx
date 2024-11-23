// src/components/EditPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AddItems.css";
import ItemModal from "../user/ItemModal"; // Adjust the import path as necessary

function AddItems({ updateItem }) {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    item_id: "",
    name: "",
    description: "",
    category: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
          <button onClick={() => handleShowModal(row)} className="edit-btn">
            <i className="bx bx-edit"></i>
          </button>
          <button
            onClick={() => handleArchive(row)}
            className="archive-btn"
            title="Archive"
          >
            <i className="bx bx-archive-in"></i>
          </button>
          <button
            onClick={() => handleDelete(row.item_id)}
            className="delete-btn"
          >
            <i className="bx bx-trash"></i>
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#f8f9fa",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
      },
    },
    rows: {
      style: {
        minHeight: "60px",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      },
    },
    pagination: {
      style: {
        borderTop: "none",
        marginTop: "10px",
      },
    },
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/items");
      const activeItems = response.data.filter((item) => !item.isArchived);
      setItems(activeItems);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.patch(
          `http://localhost:3000/items/${formData.item_id}`,
          formData
        );
        setSuccessMessage("Item updated successfully");
      } else {
        const response = await axios.post(
          "http://localhost:3000/items/additem",
          formData
        );
        setItems([...items, response.data]);
        setSuccessMessage("Item added successfully");
      }
      await fetchItems();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving item:", error);
      setError("Error saving item");
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

  const handleShowModal = (item = null) => {
    if (item) {
      setFormData({
        item_id: item.item_id,
        name: item.name,
        description: item.description,
        category: item.category,
      });
      setIsEditing(true);
    } else {
      setFormData({
        item_id: "",
        name: "",
        description: "",
        category: "",
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      item_id: "",
      name: "",
      description: "",
      category: "",
    });
    setIsEditing(false);
    setSuccessMessage("");
  };

  const handleArchive = async (item) => {
    if (window.confirm("Are you sure you want to archive this item?")) {
      try {
        const response = await axios.patch(
          `http://localhost:3000/items/${item.item_id}`,
          {
            isArchived: true,
          }
        );

        if (response.status === 200) {
          setSuccessMessage("Item archived successfully");
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

  const filteredItems = items.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSaveItem = async (itemData) => {
    if (itemData.item_id) {
      // Update existing item
      await axios.patch(
        `http://localhost:3000/items/${itemData.item_id}`,
        itemData
      );
    } else {
      // Add new item
      await axios.post("http://localhost:3000/items/additem", itemData);
    }
    fetchItems(); // Refresh the item list
  };

  const handleDeleteItem = async (item_id) => {
    await axios.delete(`http://localhost:3000/items/${item_id}`);
    fetchItems(); // Refresh the item list
  };

  const handleArchiveItem = async (item_id) => {
    // Implement your archiving logic here
    // This could be a PATCH request to update the item's status
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
            </div>
            <div className="search-container" style={{ marginRight: "10px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "250px" }}
              />
            </div>
            <button
              className="btn btn-primary add-button"
              onClick={() => handleShowModal()}
            >
              <i className="bx bx-plus"></i>
              Add New Item
            </button>
          </div>

          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          <div className="table-data">
            <div className="order">
              <DataTable
                title="Items List"
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
          <ItemModal
            isActive={showModal}
            onClose={handleCloseModal}
            item={isEditing ? formData : null}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
            onArchive={handleArchiveItem}
          />
          {showModal && <div className="modal-backdrop fade show"></div>}
        </main>
      </section>
    </div>
  );
}

export default AddItems;
