import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Sidebar from '../sidebar/AdminSidebar';
import AdminNavbar from '../Navbar/AdminNavbar';
import '../../css/ArchivePage.css';

const ArchivedPage = () => {
    const [archivedItems, setArchivedItems] = useState([]);
    const [archivedUsers, setArchivedUsers] = useState([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTermItems, setSearchTermItems] = useState('');
    const [searchTermUsers, setSearchTermUsers] = useState('');

    // Columns for archived items
    const itemColumns = [
        {
            name: 'Item ID',
            selector: row => row.item_id,
            sortable: true,
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Description',
            selector: row => row.description,
            wrap: true,
            grow: 2
        },
        {
            name: 'Category',
            selector: row => row.category,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="actions">
                    <button 
                        onClick={() => handleUnarchiveItem(row)}
                        className="unarchive-btn"
                        title="Unarchive"
                    >
                        <i className="bx bxs-archive-out"></i>
                    </button>
                    <button 
                        onClick={() => handleDeleteItem(row.item_id)}
                        className="delete-btn"
                        title="Delete"
                    >
                        <i className="bx bxs-trash"></i>
                    </button>
                </div>
            ),
            width: '120px'
        }
    ];

    // Columns for archived users
    const userColumns = [
        {
            name: 'User ID',
            selector: row => row.userID,
            sortable: true,
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
        },
        {
            name: 'Role',
            selector: row => row.role,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="actions">
                    <button 
                        onClick={() => handleUnarchiveUser(row)}
                        className="unarchive-btn"
                        title="Unarchive"
                    >
                        <i className="bx bxs-archive-out"></i>
                    </button>
                    <button 
                        onClick={() => handleDeleteUser(row.userID)}
                        className="delete-btn"
                        title="Delete"
                    >
                        <i className="bx bxs-trash"></i>
                    </button>
                </div>
            ),
            width: '120px'
        }
    ];

    useEffect(() => {
        let mounted = true;

        const fetchArchivedItems = async () => {
            try {
                setLoadingItems(true);
                const response = await axios.get('http://localhost:3000/items');
                if (mounted) {
                    const archived = response.data.filter(item => item.isArchived === true);
                    setArchivedItems(archived);
                    setError(null);
                }
            } catch (error) {
                if (mounted) {
                    console.error('Error fetching archived items:', error);
                    setError('Failed to fetch archived items');
                }
            } finally {
                if (mounted) {
                    setLoadingItems(false);
                }
            }
        };

        const fetchArchivedUsers = async () => {
            try {
                setLoadingUsers(true);
                const response = await axios.get('http://localhost:3000/users');
                if (mounted) {
                    const archived = response.data.filter(user => user.isArchived === true);
                    setArchivedUsers(archived);
                    setError(null);
                }
            } catch (error) {
                if (mounted) {
                    console.error('Error fetching archived users:', error);
                    setError('Failed to fetch archived users');
                }
            } finally {
                if (mounted) {
                    setLoadingUsers(false);
                }
            }
        };

        fetchArchivedItems();
        fetchArchivedUsers();

        return () => {
            mounted = false;
        };
    }, []);

    const handleUnarchiveItem = async (item) => {
        if (window.confirm('Are you sure you want to unarchive this item?')) {
            try {
                const response = await axios.patch(`http://localhost:3000/items/${item.item_id}`, {
                    isArchived: false
                });
                
                if (response.status === 200) {
                    setSuccessMessage('Item unarchived successfully');
                    setArchivedItems(prevItems => prevItems.filter(i => i.item_id !== item.item_id));
                }
            } catch (error) {
                console.error('Error unarchiving item:', error);
                setError('Error unarchiving item');
            }
        }
    };

    const handleDeleteItem = async (item_id) => {
        if (window.confirm('Are you sure you want to permanently delete this item?')) {
            try {
                await axios.delete(`http://localhost:3000/items/${item_id}`);
                setSuccessMessage('Item deleted successfully');
                fetchArchivedItems();
            } catch (error) {
                console.error('Error deleting item:', error);
                setError('Error deleting item');
            }
        }
    };

  const handleUnarchiveUser = async (user) => {
    if (window.confirm('Are you sure you want to unarchive this user?')) {
        try {
            const response = await axios.patch(`http://localhost:3000/users/${user.userID}/archive`, {
                isArchived: false
            });
            
            if (response.status === 200) {
                setSuccessMessage('User unarchived successfully');
                setArchivedUsers(prevUsers => prevUsers.filter(u => u.userID !== user.userID));
                
                // Optionally, you can call fetchUsers here if you have access to it
                // fetchUsers(); // Uncomment if you have a fetchUsers function to refresh the user list
            }
        } catch (error) {
            console.error('Error unarchiving user:', error);
            setError('Error unarchiving user');
        }
    }
};

    const handleDeleteUser = async (userID) => {
        if (window.confirm('Are you sure you want to permanently delete this user?')) {
            try {
                await axios.delete(`http://localhost:3000/users/${userID}`);
                setSuccessMessage('User deleted successfully');
                fetchArchivedUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                setError('Error deleting user');
            }
        }
    };

    const filteredItems = archivedItems.filter((item) =>
        Object.values(item)
            .join(" ")
            .toLowerCase()
            .includes(searchTermItems.toLowerCase())
    );

    const filteredUsers = archivedUsers.filter((user) =>
        Object.values(user)
            .join(" ")
            .toLowerCase()
            .includes(searchTermUsers.toLowerCase())
    );

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

    return (
        <div className="user-dashboard">
            <Sidebar />
            <section id="content">
                <AdminNavbar />
                <main>
                    <div className="head-title">
                        <div className="left">
                            <h1>Archived Items and Users</h1>
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
                                        <div>Archived Items</div>
                                        <div className="search-wrapper2">
                                            <i className='bx bx-search'></i>
                                            <input
                                                type="text"
                                                className="search-input"
                                                placeholder="Search archived items..."
                                                value={searchTermItems}
                                                onChange={(e) => setSearchTermItems(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                }
                                columns={itemColumns}
                                data={filteredItems}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[10, 15, 20, 25, 30]}
                                responsive
                                highlightOnHover
                                pointerOnHover
                                progressPending={loadingItems}
                                progressComponent={<div className="loading">Loading archived items...</div>}
                                customStyles={customStyles}
                                noDataComponent={
                                    <div className="no-data">
                                        {error ? error : "No archived items found"}
                                    </div>
                                }
                            />
                        </div>
                    </div>

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
                                        <div>Archived Users</div>
                                        <div className="search-wrapper2">
                                            <i className='bx bx-search'></i>
                                            <input
                                                type="text"
                                                className="search-input"
                                                placeholder="Search archived users..."
                                                value={searchTermUsers}
                                                onChange={(e) => setSearchTermUsers(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                }
                                columns={userColumns}
                                data={filteredUsers}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[10, 15, 20, 25, 30]}
                                responsive
                                highlightOnHover
                                pointerOnHover
                                progressPending={loadingUsers}
                                progressComponent={<div className="loading">Loading archived users...</div>}
                                customStyles={customStyles}
                                noDataComponent={
                                    <div className="no-data">
                                        {error ? error : "No archived users found"}
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </main>
            </section>
        </div>
    );
};

export default ArchivedPage;