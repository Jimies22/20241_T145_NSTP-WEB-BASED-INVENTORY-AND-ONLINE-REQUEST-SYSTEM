import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import "../../css/AddUser.css";
import AdminSidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';
import { logActivity } from "../../utils/activityLogger";

function AddUser() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    name: "",
    department: "",
    userID: "",
    password: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editLocked, setEditLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(null);
  const LOCK_TIMEOUT = 120000; // 10 mins in milliseconds
  const [originalFormData, setOriginalFormData] = useState({
    email: "",
    role: "",
    name: "",
    department: "",
    userID: "",
    password: "",
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <div className="actions" style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
          <div>
              <button
                onClick={() => handleShowModal(row)}
                className={`edit-btn ${editLocked ? 'disabled' : ''}`}
                disabled={editLocked}
                title={editLocked ? "User is being edited by another user" : "Edit user"}
                style={{ margin: '0 1px', padding: '4px' }}
              >
                <i className={`bx ${editLocked ? 'bx-lock' : 'bx-edit'}`}></i>
              </button>
          </div>
          <div>
              <button
                onClick={() => handleDelete(row.userID)}
                className="delete-btn"
                title="Delete user"
                style={{ backgroundColor: 'transparent', background: 'none', margin: '0 1px', padding: '4px' }}
              >
                <i className="bx bx-trash"></i>
              </button>
          </div>
          <div>
              <button
                onClick={() => handleArchive(row.userID)}
                className="archive-btn"
                title="Archive"
                style={{ margin: '0 1px', padding: '4px' }}
              >
                <i className="bx bx-archive-in"></i>
              </button>
          </div>
          
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
    fetchUsers();
    checkLockStatus();
    return () => {
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('sessionToken');
      const response = await axios.get("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (Array.isArray(response.data)) {
        const activeUsers = response.data.filter((user) => !user.isArchived);
        setUsers(activeUsers);
        setError(null);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || "Failed to fetch users");
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || "Failed to fetch users"
      });
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
    
    if (isEditing) {
      const hasChanged = 
        newFormData.name !== originalFormData.name || 
        newFormData.email !== originalFormData.email || 
        newFormData.role !== originalFormData.role || 
        newFormData.department !== originalFormData.department || 
        (newFormData.password.trim() !== "" && newFormData.password !== originalFormData.password);
      
      setHasChanges(hasChanged);
    } else {
      const requiredFieldsFilled = 
        newFormData.name.trim() !== "" && 
        newFormData.email.trim() !== "" && 
        newFormData.role.trim() !== "" && 
        newFormData.password.trim() !== "";
      
      setHasChanges(requiredFieldsFilled);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const token = sessionStorage.getItem('sessionToken');
      
      // Validate email format
      const isStudentEmail = formData.email.trim().endsWith('@student.buksu.edu.ph');
      const isValidGeneralEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim());
      
      if (!isStudentEmail && !isValidGeneralEmail) {
        throw new Error('Invalid email format. Must be a student email (@student.buksu.edu.ph) or a valid general email.');
      }

      // Validate password
      if (!formData.password || formData.password.trim().length === 0) {
        throw new Error('Password is required.');
      }

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        department: formData.department.trim(),
        password: formData.password,
      };

      console.log('Sending user data:', userData); // Debug log

      if (!isEditing) {
        const response = await axios.post(
          "http://localhost:3000/users/register", 
          userData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.status === 201 || response.status === 200) {
          await logActivity(
            'CREATE_USER',
            `Created new user: ${userData.name} (${userData.email}) - Role: ${userData.role}`
          );
          
          Swal.fire({
            icon: 'success',
            title: 'User Added Successfully!',
            html: `
              <div class="text-center">
                <p>User account has been created for ${userData.name}.</p>
                <p>A welcome email has been sent to:</p>
                <p><strong>${userData.email}</strong></p>
              </div>
            `,
            confirmButtonColor: '#3f85f7'
          });
          
          handleCloseModal();
          await fetchUsers();
        }
      } else {
        const response = await axios.patch(
          `http://localhost:3000/users/${formData.userID}`,
          userData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.status === 200) {
          await logActivity(
            'UPDATE_USER',
            `Updated user: ${userData.name} (${userData.email})`
          );
          
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'User updated successfully'
          });
          
          handleCloseModal();
          await fetchUsers();
        }
      }
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data,
        validationErrors: error.response?.data?.errors // Log validation errors if any
      });
      
      let errorMessage = 'Failed to save user';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid user data';
        if (error.response.data.errors) {
          errorMessage += ': ' + Object.values(error.response.data.errors).join(', ');
        }
      } else if (error.response?.status === 409) {
        errorMessage = 'Email already exists';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMessage,
        footer: process.env.NODE_ENV === 'development' ? `Technical details: ${error.message}` : null
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userID) => {
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
        const response = await axios.delete(`http://localhost:3000/users/${userID}`);
        if (response.status === 200) {
          await logActivity(
            'DELETE_USER',
            `Deleted user ID: ${userID}`
          );
          
          Swal.fire(
            'Deleted!',
            'User has been deleted.',
            'success'
          );
          await fetchUsers();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire(
          'Error!',
          'Error deleting user',
          'error'
        );
      }
    }
  };

  const handleArchive = async (userID) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to archive this user?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, archive it!'
    });

    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem('sessionToken');
        const response = await axios.patch(
          `http://localhost:3000/users/${userID}/archive`,
          { isArchived: true },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          await logActivity(
            'ARCHIVE_USER',
            `Archived user ID: ${userID}`
          );
          
          Swal.fire(
            'Archived!',
            'User has been archived successfully.',
            'success'
          );
          await fetchUsers();
        }
      } catch (error) {
        console.error("Error archiving user:", error);
        Swal.fire(
          'Error!',
          error.response?.data?.message || 'Error archiving user',
          'error'
        );
      }
    }
  };

  const handleShowModal = async (user = null) => {
    try {
      await axios.patch(
        `http://localhost:3000/locks/edit_user`,
        { isLocked: true },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("sessionToken")}`,
          },
        }
      );
      setEditLocked(true);

      // Set timer to automatically unlock after timeout
      const timer = setTimeout(async () => {
        await handleCloseModal();
      }, LOCK_TIMEOUT);
      setLockTimer(timer);

      if (user) {
        const userData = {
          userID: user.userID,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department || "",
          password: "",  // Clear password field when editing
        };
        setFormData(userData);
        setOriginalFormData(userData); // Store original data for comparison
        setIsEditing(true);
        setHasChanges(false); // Reset change tracking for editing
      } else {
        const emptyData = {
          name: "",
          email: "",
          role: "",
          department: "",
          password: "",
        };
        setFormData(emptyData);
        setOriginalFormData(emptyData);
        setIsEditing(false);
        setHasChanges(false);
      }
      setShowModal(true);
      document.body.style.overflow = "hidden";
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
        `http://localhost:3000/locks/edit_user`,
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
        email: "",
        role: "",
        name: "",
        department: "",
        userID: "",
        password: "",
      });
      setOriginalFormData({
        email: "",
        role: "",
        name: "",
        department: "",
        userID: "",
        password: "",
      });
      setIsEditing(false);
      setHasChanges(false);
      setIsSubmitting(false);
      document.body.style.overflow = "unset";
    } catch (error) {
      console.error("Error releasing lock:", error);
    }
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
      const activeUsers = response.data.filter((user) => !user.isArchived);
      setUsers(activeUsers);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const checkLockStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/locks/edit_user`);
      setEditLocked(response.data?.isLocked || false);
    } catch (error) {
      console.error("Error checking lock status:", error);
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
              <ul className="breadcrumb">
                <li><a href="#">Users</a></li>
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
                    <div>Users List</div>
                    <div className="search-wrapper1">
                      <i className="bx bx-search"></i>
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
                      <i className="bx bx-plus"></i>
                      Add New User
                    </button>
                  </div>
                }
                columns={columns}
                data={filteredUsers}
                responsive
                highlightOnHover
                pointerOnHover
                progressPending={loading}
                progressComponent={<LoadingComponent />}
                noDataComponent={<NoDataComponent />}
                customStyles={customStyles}
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
                    <div className="mb-3">
                      <label className="form-label">Password:</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ 
                        backgroundColor: "#4287f5", 
                        borderColor: "#4287f5",
                        opacity: (isEditing && !hasChanges) || isSubmitting ? 0.6 : 1 
                      }}
                      disabled={(isEditing && !hasChanges) || isSubmitting}
                    >
                      {isSubmitting ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {isEditing ? "Updating..." : "Adding..."}
                        </span>
                      ) : (
                        isEditing ? "Update User" : "Add User"
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      style={{ backgroundColor: "#6c757d" }}
                      disabled={isSubmitting}
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

export default AddUser;
