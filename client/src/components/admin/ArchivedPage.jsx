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
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('items');

  const customStyles = {
    table: {
      style: {
        backgroundColor: "white",
        borderCollapse: "collapse",
        width: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      },
    },
    rows: {
      style: {
        minHeight: "60px",
        borderBottom: "1px solid #e5e5e5",
        fontSize: "14px",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      },
    },
    headCells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        backgroundColor: "#f8f9fa",
        fontWeight: "600",
        fontSize: "14px",
        color: "#333",
        borderBottom: "2px solid #dee2e6",
        height: "56px",
        textTransform: "uppercase",
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        fontSize: "14px",
        overflow: "visible",
        position: "relative",
        zIndex: 1,
        verticalAlign: "middle",
        lineHeight: "24px",
      },
    },
    responsiveWrapper: {
      style: {
        overflow: "visible",
        padding: "0",
      },
    },
  };

  const handleRestore = async (id) => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem("sessionToken");
      let endpoint = '';
      
      if (activeTab === 'items') {
        endpoint = `http://localhost:3000/items/${id}/restore`;
      } else if (activeTab === 'users') {
        endpoint = `http://localhost:3000/users/${id}/restore`;
      }
      
      const response = await axios.patch(endpoint, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
      });

        if (response.status === 200) {
          Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${activeTab === 'items' ? 'Item' : 'User'} has been restored successfully.`,
          showConfirmButton: false,
          timer: 1500,
        });
        
        if (activeTab === 'items') {
          fetchArchivedItems();
        } else if (activeTab === 'users') {
          fetchArchivedUsers();
        }
        }
      } catch (error) {
      console.error(error);
        Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || `Failed to restore ${activeTab === 'items' ? 'item' : 'user'}.`,
        });
      } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: `This ${activeTab === 'items' ? 'item' : 'user'} will be permanently deleted!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem("sessionToken");
          let endpoint = '';
          
          if (activeTab === 'items') {
            endpoint = `http://localhost:3000/items/${id}`;
          } else if (activeTab === 'users') {
            endpoint = `http://localhost:3000/users/${id}`;
          }
          
          const response = await axios.delete(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: `${activeTab === 'items' ? 'Item' : 'User'} has been permanently deleted.`,
              showConfirmButton: false,
              timer: 1500,
            });
            
            if (activeTab === 'items') {
              fetchArchivedItems();
            } else if (activeTab === 'users') {
              fetchArchivedUsers();
            }
        }
      } catch (error) {
          console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: error.response?.data?.message || `Failed to delete ${activeTab === 'items' ? 'item' : 'user'}.`,
        });
      } finally {
        setIsLoading(false);
      }
    }
    });
  };

  const itemColumns = [
    {
      name: "Item Name",
      selector: (row) => row.name,
      sortable: true,
      width: "15%",
      left: true,
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      width: "15%",
      left: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
      wrap: true,
      width: "18%",
      left: true,
    },
    {
      name: "Status",
      selector: (row) => row.status || "Archived",
      sortable: true,
      width: "12%",
      center: true,
      cell: (row) => (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <span className="status-badge" style={{ 
            backgroundColor: '#6c757d', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {row.status || "Archived"}
          </span>
        </div>
      ),
    },
    {
      name: "Archive Date",
      selector: (row) => new Date(row.updatedAt).toLocaleDateString(),
      sortable: true,
      width: "15%",
      center: true,
      cell: (row) => (
        <div style={{ textAlign: 'center', width: '100%' }}>
          {new Date(row.updatedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="action-buttons-container">
          <button
            onClick={() => handleRestore(row.item_id)}
            className="restore-btn"
            disabled={isLoading}
          >
            Restore
          </button>
          <button
            onClick={() => handleDelete(row.item_id)}
            className="delete-btn"
            disabled={isLoading}
          >
            Delete
          </button>
        </div>
      ),
      width: "250px",
      center: true,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const userColumns = [
    {
      name: "Full Name",
      selector: (row) => `${row.firstName} ${row.lastName}`,
      sortable: true,
      width: "15%",
      left: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      width: "20%",
      left: true,
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
      width: "15%",
      left: true,
    },
    {
      name: "Status",
      selector: (row) => row.status || "Archived",
      sortable: true,
      width: "15%",
      center: true,
      cell: (row) => (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <span className="status-badge" style={{ 
            backgroundColor: '#6c757d', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {row.status || "Archived"}
          </span>
        </div>
      ),
    },
    {
      name: "Archive Date",
      selector: (row) => new Date(row.updatedAt).toLocaleDateString(),
      sortable: true,
      width: "15%",
      center: true,
      cell: (row) => (
        <div style={{ textAlign: 'center', width: '100%' }}>
          {new Date(row.updatedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="action-buttons-container">
          <button
            onClick={() => handleRestore(row.user_id)}
            className="restore-btn"
            disabled={isLoading}
          >
            Restore
          </button>
          <button
            onClick={() => handleDelete(row.user_id)}
            className="delete-btn"
            disabled={isLoading}
          >
            Delete
          </button>
        </div>
      ),
      width: "250px",
      center: true,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
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

  const fetchArchivedUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = sessionStorage.getItem("sessionToken");
      const response = await axios.get("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const archivedUsers = response.data.filter((user) => user.status === "Archived");
      setArchivedUsers(archivedUsers);
      setLoadingUsers(false);
    } catch (error) {
      setError("Error fetching archived users");
      if (error.response?.status === 401) {
        setError("Unauthorized access. Please log in again.");
      }
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'items') {
      fetchArchivedItems();
    } else if (activeTab === 'users') {
      fetchArchivedUsers();
    }
  }, [activeTab]);

  // Add useEffect to ensure action buttons are visible
  useEffect(() => {
    // Force visibility of buttons after render with multiple approaches
    const ensureButtonsVisible = () => {
      // Method 1: Direct DOM manipulation
      const buttons = document.querySelectorAll('.delete-btn, .restore-btn');
      buttons.forEach(btn => {
        btn.style.cssText = `
          visibility: visible !important; 
          opacity: 1 !important;
          display: block !important;
          position: relative !important;
          z-index: 9999 !important;
          min-width: 80px !important;
          padding: 8px 12px !important;
          color: white !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-weight: bold !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
        `;
        
        if (btn.classList.contains('delete-btn')) {
          btn.style.backgroundColor = '#dc3545 !important';
        } else {
          btn.style.backgroundColor = '#28a745 !important';
        }
      });

      // Method 2: Add class to parent elements
      const cells = document.querySelectorAll('.rdt_TableCell');
      cells.forEach(cell => {
        cell.style.overflow = 'visible';
      });
    };

    // Run immediately and after delays to ensure DOM has updated
    ensureButtonsVisible();
    const timer1 = setTimeout(ensureButtonsVisible, 100);
    const timer2 = setTimeout(ensureButtonsVisible, 500);
    const timer3 = setTimeout(ensureButtonsVisible, 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [archivedItems, archivedUsers, activeTab]);

  // Add CSS to fix button visibility issues
  const fixStyles = `
    .delete-btn, .restore-btn {
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
      position: relative !important;
      z-index: 9999 !important;
      min-width: 80px !important;
    }
    
    .delete-btn {
      background-color: #dc3545 !important;
    }
    
    .restore-btn {
      background-color: #28a745 !important;
    }
    
    .rdt_TableCell {
      overflow: visible !important;
    }
    
    .action-buttons-container {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
  `;

  // Add another useEffect to inject the script dynamically
  useEffect(() => {
    // Create and run script to fix buttons
    const fixButtonsScript = function() {
      function fixButtons() {
        const rows = document.querySelectorAll('.rdt_TableRow');
        rows.forEach((row, index) => {
          // Check if this row doesn't have a delete button
          const actionCell = row.querySelector('.rdt_TableCell:last-child');
          if (actionCell) {
            const deleteBtn = actionCell.querySelector('.delete-btn');
            if (!deleteBtn) {
              // Find the restore button
              const restoreBtn = actionCell.querySelector('.restore-btn');
              if (restoreBtn) {
                // Create a new delete button
                const newDeleteBtn = document.createElement('button');
                newDeleteBtn.className = 'delete-btn';
                newDeleteBtn.textContent = 'Delete';
                newDeleteBtn.style.cssText = 'visibility: visible !important; opacity: 1 !important; display: block !important; position: relative !important; z-index: 9999 !important; min-width: 80px !important; padding: 8px 12px !important; color: white !important; border: none !important; border-radius: 4px !important; cursor: pointer !important; font-weight: bold !important; box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important; background-color: #dc3545 !important;';
                
                // Create a container if needed
                let container = actionCell.querySelector('.action-buttons-container');
                if (!container) {
                  container = document.createElement('div');
                  container.className = 'action-buttons-container';
                  container.style.cssText = 'display: flex !important; flex-direction: row !important; justify-content: center !important; align-items: center !important; gap: 10px !important; width: 100% !important; visibility: visible !important; z-index: 999 !important;';
                  
                  // Move restore button to container
                  const parent = restoreBtn.parentNode;
                  container.appendChild(restoreBtn.cloneNode(true));
                  parent.appendChild(container);
                  if (restoreBtn.parentNode !== container) {
                    restoreBtn.remove();
                  }
                }
                
                // Add delete button to container
                container.appendChild(newDeleteBtn);
                
                // Add click event to the new delete button
                newDeleteBtn.addEventListener('click', function() {
                  // Use a global method to handle deletion
                  window.handleArchiveDelete(index);
                });
              }
            }
          }
        });
      }
      
      // Run the function now and periodically with shorter interval
      fixButtons();
      const intervalId = setInterval(fixButtons, 300); // Reduced from 500ms to 300ms
      
      // Clean up function
      return () => clearInterval(intervalId);
    };
    
    // Add a global method to handle deletion
    window.handleArchiveDelete = (index) => {
      if (activeTab === 'items') {
        const itemToDelete = archivedItems[index];
        if (itemToDelete && itemToDelete.item_id) {
          handleDelete(itemToDelete.item_id);
        }
      } else if (activeTab === 'users') {
        const userToDelete = archivedUsers[index];
        if (userToDelete && userToDelete.user_id) {
          handleDelete(userToDelete.user_id);
        }
      }
    };
    
    // Run the script
    const cleanupFn = fixButtonsScript();
    
    // Clean up
    return () => {
      cleanupFn();
      delete window.handleArchiveDelete;
    };
  }, [archivedItems, archivedUsers, activeTab, handleDelete]);

  // Add a specific useEffect for when activeTab changes to 'users'
  useEffect(() => {
    if (activeTab === 'users') {
      // Create a function to ensure buttons are visible after the tab switch
      const forceButtonsVisibleOnTabSwitch = () => {
        console.log("Forcing buttons visible for users tab");
        
        // Find all delete buttons in the users tab and ensure they're visible
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => {
          btn.style.cssText = `
            display: inline-flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            min-width: 100px !important;
            height: 38px !important;
            background-color: #dc3545 !important;
            color: white !important;
            border: none !important;
            border-radius: 6px !important;
            font-weight: 500 !important;
            padding: 8px 16px !important;
            margin: 0 5px !important;
            text-transform: uppercase !important;
            z-index: 9999 !important;
            position: relative !important;
            cursor: pointer !important;
          `;
        });
        
        // Also ensure button containers are visible
        const buttonContainers = document.querySelectorAll('.action-buttons-container');
        buttonContainers.forEach(container => {
          container.style.cssText = `
            display: flex !important;
            flex-direction: row !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 10px !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 9999 !important;
          `;
        });
      };
      
      // Run this function with delays after the tab switch to ensure it catches the rendered components
      forceButtonsVisibleOnTabSwitch();
      const timers = [
        setTimeout(forceButtonsVisibleOnTabSwitch, 100),
        setTimeout(forceButtonsVisibleOnTabSwitch, 300),
        setTimeout(forceButtonsVisibleOnTabSwitch, 500),
        setTimeout(forceButtonsVisibleOnTabSwitch, 1000),
      ];
      
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [activeTab]);

  // Force re-fetch of archived users when switching to users tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchArchivedUsers();
    }
  }, [activeTab]);

  return (
    <>
      <style>{fixStyles}</style>
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
                  columns={activeTab === 'items' ? itemColumns : userColumns}
                  data={activeTab === 'items' ? archivedItems : archivedUsers}
                  pagination
                  paginationPerPage={5}
                  paginationRowsPerPageOptions={[5, 10, 15, 20]}
                  highlightOnHover
                  pointerOnHover
                  responsive
                  customStyles={customStyles}
                  key={`archive-table-${activeTab}`}
                  noDataComponent={
                    <div className="no-data-message">
                      {activeTab === 'items' ? "No archived items found" : "No archived users found"}
                    </div>
                  }
                  onRowClicked={() => {}}
                  onRowExpandToggled={() => {}}
                />

                {/* Trigger function to inject delete buttons if they're missing */}
                {activeTab === 'users' && archivedUsers.length > 0 && (
                  <div style={{ display: 'none' }} className="button-injector" ref={(el) => {
                    if (el) {
                      // Create a function to inject missing delete buttons
                      const injectDeleteButtons = () => {
                        console.log("Injecting delete buttons");
                        document.querySelectorAll('.rdt_TableRow').forEach((row, index) => {
                          const actionCell = row.querySelector('.rdt_TableCell:last-child');
                          if (actionCell) {
                            // Check if missing delete button
                            if (!actionCell.querySelector('.delete-btn')) {
                              const restoreBtn = actionCell.querySelector('.restore-btn');
                              if (restoreBtn) {
                                // Create container if needed
                                let container = actionCell.querySelector('.action-buttons-container');
                                if (!container) {
                                  container = document.createElement('div');
                                  container.className = 'action-buttons-container';
                                  container.style.cssText = 'display: flex !important; justify-content: center !important; gap: 10px !important;';
                                  actionCell.appendChild(container);
                                  
                                  // Move restore button to container
                                  container.appendChild(restoreBtn);
                                }
                                
                                // Create delete button
                                const deleteBtn = document.createElement('button');
                                deleteBtn.textContent = 'Delete';
                                deleteBtn.className = 'delete-btn';
                                deleteBtn.style.cssText = `
                                  display: inline-flex !important;
                                  visibility: visible !important;
                                  opacity: 1 !important;
                                  min-width: 100px !important;
                                  height: 38px !important;
                                  background-color: #dc3545 !important;
                                  color: white !important;
                                  border: none !important;
                                  border-radius: 6px !important;
                                  font-weight: 500 !important;
                                  padding: 8px 16px !important;
                                  margin: 0 5px !important;
                                  text-transform: uppercase !important;
                                  z-index: 9999 !important;
                                  position: relative !important;
                                  cursor: pointer !important;
                                  align-items: center !important;
                                  justify-content: center !important;
                                `;
                                
                                // Add click handler
                                deleteBtn.addEventListener('click', function() {
                                  if (index < archivedUsers.length) {
                                    const user = archivedUsers[index];
                                    if (user && user.user_id) {
                                      handleDelete(user.user_id);
                                    }
                                  }
                                });
                                
                                container.appendChild(deleteBtn);
                              }
                            }
                          }
                        });
                      };
                      
                      // Run the injector immediately and with delays
                      injectDeleteButtons();
                      setTimeout(injectDeleteButtons, 100);
                      setTimeout(injectDeleteButtons, 300);
                      setTimeout(injectDeleteButtons, 500);
                    }
                  }}></div>
                )}

                {/* Inject additional CSS for user table buttons when needed */}
                {activeTab === 'users' && (
                  <style jsx="true">{`
                    .delete-btn, .restore-btn {
                      visibility: visible !important;
                      opacity: 1 !important;
                      display: inline-flex !important;
                      position: relative !important;
                      z-index: 9999 !important;
                    }
                    .action-buttons-container {
                      display: flex !important;
                      visibility: visible !important;
                      opacity: 1 !important;
                    }
                  `}</style>
                )}
              </div>
            </div>
          </main>
        </section>
      </div>
    </>
  );
};

export default ArchivedPage;