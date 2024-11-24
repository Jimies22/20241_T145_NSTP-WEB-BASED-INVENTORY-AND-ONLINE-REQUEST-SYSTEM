import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import "../../css/AddUser.css";
import AdminSidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "bootstrap/dist/css/bootstrap.min.css";

function AddUser() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    name: "",
    department: "",
    userID: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
      name: "Actions",
      cell: (row) => (
        <div className="actions">
          <button onClick={() => handleShowModal(row)} className="edit-btn">
            <i className="bx bx-edit addButton"></i>
          </button>
          {/* <button
            onClick={() => handleDelete(row.userID)}
            className="delete-btn"
          >
            <i className="bx bx-trash addButton"></i>
          </button> */}
          <button
            onClick={() => handleArchive(row.userID)}
            className="archive-btn"
            title="Archive"
          >
            <i className="bx bx-archive-in addButton"></i>
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0',
      }
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
      }
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
        }
      }
    },
    subHeader: {
      style: {
        padding: '16px 24px',
        backgroundColor: '#ffffff',
      }
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
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/users");
      console.log("Fetched users:", response.data);
      if (Array.isArray(response.data)) {
        const activeUsers = response.data.filter(user => !user.isArchived);
        setUsers(activeUsers);
        setError(null);
      } else {
        setError("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        department: formData.department.trim(),
      };

      if (isEditing) {
        await axios.patch(
          `http://localhost:3000/users/${formData.userID}`,
          userData
        );
        setSuccessMessage("User updated successfully");
      } else {
        if (
          !userData.email.includes("@") &&
          userData.role === "user"
        ) {
          setError("Faculty email must have @");
          return;
        }

        await axios.post("http://localhost:3000/users/register", userData);
        setSuccessMessage("User added successfully");
      }

      handleCloseModal();
      await fetchUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "Failed to save user");
    }
  };

  const handleDelete = async (userID) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:3000/users/${userID}`);
        setSuccessMessage("User deleted successfully");
        await fetchUsers();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error deleting user:", error);
        setError(error.response?.data?.message || "Error deleting user");
      }
    }
  };

  const handleArchive = async (userID) => {
    if (window.confirm("Are you sure you want to archive this user?")) {
      try {
        await axios.patch(`http://localhost:3000/users/${userID}/archive`, {
          isArchived: true
        });
        setSuccessMessage("User archived successfully");
        await fetchUsers(); // Refresh the user list
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error archiving user:", error);
        setError("Error archiving user");
      }
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setFormData({
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || "",
      });
      setIsEditing(true);
    } else {
      setFormData({
        name: "",
        email: "",
        role: "",
        department: "",
      });
      setIsEditing(false);
    }
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      email: "",
      role: "",
      name: "",
      department: "",
      userID: "",
    });
    setIsEditing(false);
    setError(null);
    document.body.style.overflow = "unset";
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const NoDataComponent = () => (
    <div style={{ padding: "24px" }}>
      {error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div>No users found</div>
      )}
    </div>
  );

  const LoadingComponent = () => (
    <div style={{ padding: "24px" }}>Loading users...</div>
  );

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/users");
      const activeUsers = response.data.filter(user => !user.isArchived);
      setUsers(activeUsers);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <AdminSidebar />
      <section id="content">
        <AdminNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Users Management</h1>
            </div>
          </div>

          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="table-data">
            <div className="order">
              <DataTable
                title={
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    width: '100%',
                    padding: '0 8px'
                  }}>
                    <div>Users List</div>
                    <div className="search-wrapper">
                      <i className='bx bx-search'></i>
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button 
                      className="add-new-button" 
                      onClick={() => handleShowModal()}
                    >
                      <i className='bx bx-plus'></i>
                      Add New User
                    </button>
                  </div>
                }
                columns={columns}
                data={filteredUsers}
                pagination
                responsive
                highlightOnHover
                pointerOnHover
                progressPending={loading}
                progressComponent={<div className="loading">Loading users...</div>}
                customStyles={customStyles}
                noDataComponent={
                  <div className="no-data">
                    {error ? error : "No users found"}
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
                    {isEditing ? "Edit User" : "Add New User"}
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
                      <label className="form-label">Email:</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Role:</label>
                      <select
                        className="form-control"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Department:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                      />
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
                      {isEditing ? "Update User" : "Add User"}
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

export default AddUser;
