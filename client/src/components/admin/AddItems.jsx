// src/components/EditPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/AddItems.css";
import Swal from 'sweetalert2';
import { Cloudinary } from "@cloudinary/url-gen";
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { logActivity } from "../../utils/activityLogger";

const CATEGORIES = [
  "TV",
  "Projector/DLP",
  "Extension Wire",
  "HDMI"
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [editLocked, setEditLocked] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [lockTimer, setLockTimer] = useState(null);
  const LOCK_TIMEOUT = 120000; // 1 mins in milliseconds
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [originalFormData, setOriginalFormData] = useState({
    item_id: "",
    name: "",
    description: "",
    category: "",
    isArchived: false,
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize Cloudinary
  const cld = new Cloudinary({
    cloud: {
      cloudName: 'your-cloud-name' // Replace with your cloud name
    }
  });

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
            onClick={() => handleViewCodes(row)}
            className="codes-btn"
            title="View Codes"
          >
            <i className='bx bx-qr'></i>
          </button>
          <button
            onClick={() => handleArchive(row)}
            className="archive-btn"
            title="Archive"
          >
            <i className="bx bx-archive-in"></i>
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
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    
    setFormData(newFormData);
    
    // Check if editing and if there are changes compared to original
    if (isEditing) {
      const hasChanged = 
        newFormData.name !== originalFormData.name || 
        newFormData.description !== originalFormData.description || 
        newFormData.category !== originalFormData.category;
      
      setHasChanges(hasChanged);
    } else {
      // For new items, enable button if required fields are filled
      const requiredFieldsFilled = 
        newFormData.name.trim() !== "" && 
        newFormData.description.trim() !== "" && 
        newFormData.category.trim() !== "";
      
      setHasChanges(requiredFieldsFilled);
    }
  };

  const handleMediaLibrary = () => {
    var myWidget = cloudinary.createMediaLibrary({
      cloud_name: 'djnkkoc1k',
      api_key: '758589637182136',
      multiple: false,
      max_files: 1,
      insertion_position: 'inline',
      default_transformations: [[]],
      styles: {
        palette: {
          window: "#FFFFFF",
          windowBorder: "#90A0B3",
          tabIcon: "#0078FF",
          menuIcons: "#5A616A",
          textDark: "#000000",
          textLight: "#FFFFFF",
          link: "#0078FF",
          action: "#FF620C",
          inactiveTabIcon: "#0E2F5A",
          error: "#F44235",
          inProgress: "#0078FF",
          complete: "#20B832",
          sourceBg: "#E4EBF1"
        }
      }
    }, {
      insertHandler: function(data) {
        if (data.assets.length > 0) {
          const imageUrl = data.assets[0].secure_url;
          setSelectedImageUrl(imageUrl);
          setPreviewUrl(imageUrl);
          console.log('Selected image URL:', imageUrl);
        }
      }
    });

    myWidget.show();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("sessionToken");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      
      // If we have a Cloudinary URL, use that
      if (selectedImageUrl) {
        formDataToSend.append("imageUrl", selectedImageUrl);
      } 
      // Otherwise, use the locally uploaded file if it exists
      else if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      const response = isEditing
        ? await axios.patch(
            `http://localhost:3000/items/${formData.item_id}`,
            formDataToSend,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          )
        : await axios.post("http://localhost:3000/items/additem", formDataToSend, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });

      const savedItem = response.data.item;

      // Generate QR code automatically for new items
      if (!isEditing && savedItem) {
        // Create QR code
        const qrCodeUrl = await QRCode.toDataURL(savedItem._id, {
          width: 200,
          margin: 2
        });

        // Show success message with QR code
        Swal.fire({
          icon: 'success',
          title: 'Item added successfully!',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
              <p>Your item has been added. Here's the QR code:</p>
              <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px;"/>
              <a href="${qrCodeUrl}" download="qr-code.png" class="btn btn-primary">
                Download QR Code
              </a>
            </div>
          `,
          showConfirmButton: true,
          confirmButtonText: 'Close'
        });
      } else {
        // Show regular success message for edits
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: isEditing ? 'Item updated successfully' : 'Item added successfully'
        });
      }

      await fetchItems();
      handleCloseModal();
      if (isEditing) {
        await logActivity('update_item', `Updated item: ${formData.name}`);
      } else {
        await logActivity('add_item', `Added new item: ${formData.name}`);
      }
    } catch (error) {
      console.error("Error saving item:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Error saving item'
      });
    }
  };

  const handleDelete = async (item_id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        // Get the item details before deletion
        const token = sessionStorage.getItem("sessionToken");
        const itemResponse = await axios.get(`http://localhost:3000/items/${item_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const itemName = itemResponse.data.name;

        // Delete the item
        await axios.delete(`http://localhost:3000/items/${item_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        Swal.fire(
          'Deleted!',
          'Item has been deleted.',
          'success'
        );
        handleCloseModal();
        fetchItems();
        await logActivity('DELETE_ITEM', `Deleted item: ${itemName}`);
      } catch (error) {
        console.error("Error deleting item:", error);
        Swal.fire(
          'Error!',
          'Error deleting item',
          'error'
        );
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
        const itemData = {
          item_id: item.item_id,
          name: item.name,
          description: item.description,
          category: item.category,
          isArchived: item.isArchived,
        };
        setFormData(itemData);
        setOriginalFormData(itemData); // Store original data for comparison
        setIsEditing(true);
        setHasChanges(false); // Reset change tracking
      } else {
        const emptyData = {
          item_id: "",
          name: "",
          description: "",
          category: "",
          isArchived: false,
        };
        setFormData(emptyData);
        setOriginalFormData(emptyData);
        setIsEditing(false);
        setHasChanges(false); // Reset change tracking
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
      setOriginalFormData({
        item_id: "",
        name: "",
        description: "",
        category: "",
        isArchived: false,
      });
      setIsEditing(false);
      setHasChanges(false); // Reset change tracking
    } catch (error) {
      console.error("Error releasing lock:", error);
    }
  };

  const handleArchive = async (item) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to archive this item?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, archive it!'
    });

    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem("sessionToken");
        const response = await axios.patch(
          `http://localhost:3000/items/${item.item_id}`,
          { isArchived: true },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          Swal.fire(
            'Archived!',
            'Item has been archived successfully.',
            'success'
          );
          setItems((prevItems) =>
            prevItems.filter((i) => i.item_id !== item.item_id)
          );
        }
        await logActivity('archive_item', `Archived item: ${item.name}`);
      } catch (error) {
        console.error("Error archiving item:", error);
        Swal.fire(
          'Error!',
          'Error archiving item',
          'error'
        );
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

  const handleViewCodes = async (item) => {
    // Create canvas for barcode
    const barcodeCanvas = document.createElement('canvas');
    JsBarcode(barcodeCanvas, item._id, {
      format: "CODE128",
      width: 2,
      height: 100,
      displayValue: true
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(item._id, {
      width: 200,
      margin: 2
    });

    // Show both codes in a modal
    Swal.fire({
      title: `Codes for ${item.name}`,
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
          <div class="code-section">
            <h4>Barcode</h4>
            <img src="${barcodeCanvas.toDataURL('image/png')}" alt="barcode" />
            <button id="downloadBarcode" class="btn btn-primary">Download Barcode</button>
          </div>
          <div class="code-section">
            <h4>QR Code</h4>
            <img src="${qrCodeUrl}" alt="qr code" />
            <button id="downloadQR" class="btn btn-primary">Download QR Code</button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '600px',
      didOpen: () => {
        // Barcode download handler
        document.getElementById('downloadBarcode').addEventListener('click', () => {
          const link = document.createElement('a');
          link.download = `barcode-${item.name}.png`;
          link.href = barcodeCanvas.toDataURL('image/png');
          link.click();
        });

        // QR code download handler
        document.getElementById('downloadQR').addEventListener('click', () => {
          const link = document.createElement('a');
          link.download = `qrcode-${item.name}.png`;
          link.href = qrCodeUrl;
          link.click();
        });
      }
    });
  };

  const buttonStyles = `
    .barcode-btn {
      background-color: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      margin: 0 4px;
    }
    .barcode-btn:hover {
      background-color: #5a6268;
    }
    .codes-btn {
      background-color: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      margin: 0 4px;
    }
    .codes-btn:hover {
      background-color: #5a6268;
    }
    .code-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 15px;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      margin: 10px 0;
    }
    .code-section img {
      max-width: 100%;
      height: auto;
      margin: 10px 0;
    }
    .code-section button {
      margin-top: 10px;
    }
  `;

  return (
    <div className="dashboard">
      <Sidebar />
      <section id="content">
        <AdminNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Equipment Management</h1>
              <ul className="breadcrumb">
                <li><a href="#">Equipment</a></li>
                <li><i className='bx bx-chevron-right'></i></li>
                <li><a className="active" href="/admin">Home</a></li>
              </ul>
            </div>
          </div>

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
                      <select
                        className="form-control"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a category</option>
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Image:</label>
                      <div>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleMediaLibrary}
                        >
                          Choose from Cloudinary
                        </button>
                      </div>
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
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ 
                        backgroundColor: "#4287f5", 
                        borderColor: "#4287f5",
                        opacity: (isEditing && !hasChanges) ? 0.6 : 1 
                      }}
                      disabled={isEditing && !hasChanges}
                    >
                      {isEditing ? "Update Item" : "Add Item"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      style={{ backgroundColor: "#6c757d" }}
                    >
                      Cancel
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
