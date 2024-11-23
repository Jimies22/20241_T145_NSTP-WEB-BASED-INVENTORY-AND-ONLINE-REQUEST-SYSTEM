import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Sidebar from '../sidebar/AdminSidebar';
import AdminNavbar from '../Navbar/AdminNavbar';
import '../../css/ArchivePage.css';

const ArchivedPage = () => {
    const [archivedItems, setArchivedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const columns = [
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
                        onClick={() => handleUnarchive(row)}
                        className="unarchive-btn"
                        title="Unarchive"
                    >
                        <i className="bx bxs-archive-out" style={{fontSize: 24, color: '#36f465'}} />
                    </button>
                    <button 
                        onClick={() => handleDelete(row.item_id)}
                        className="delete-btn"
                        title="Delete"
                    >
                        <i className="bx bxs-trash" style={{fontSize: 24, color: '#f44336'}} />
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
                setLoading(true);
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
                    setLoading(false);
                }
            }
        };

        fetchArchivedItems();

        return () => {
            mounted = false;
        };
    }, []);

    const handleUnarchive = async (item) => {
        if (window.confirm('Are you sure you want to unarchive this item?')) {
            try {
                const response = await axios.patch(`http://localhost:3000/items/${item.item_id}`, {
                    isArchived: false
                });
                
                if (response.status === 200) {
                    setSuccessMessage('Item unarchived successfully');
                    // Remove the unarchived item from the current list
                    setArchivedItems(prevItems => prevItems.filter(i => i.item_id !== item.item_id));
                }
            } catch (error) {
                console.error('Error unarchiving item:', error);
                setError('Error unarchiving item');
            }
        }
    };

    const handleDelete = async (item_id) => {
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

    const filteredItems = archivedItems.filter((item) =>
        Object.values(item)
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const customStyles = {
        table: {
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }
        },
        headRow: {
            style: {
                backgroundColor: '#f8f9fa',
            }
        },
        rows: {
            style: {
                minHeight: '60px',
                '&:hover': {
                    backgroundColor: '#f5f5f5',
                }
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
                            <h1>Archive</h1>
                        </div>
                        <div className="search-container">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search archived items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {successMessage && (
                        <div className="alert alert-success">{successMessage}</div>
                    )}

                    <div className="table-data">
                        <DataTable
                            title="Archived Items"
                            columns={columns}
                            data={filteredItems}
                            pagination
                            responsive
                            highlightOnHover
                            pointerOnHover
                            progressPending={loading}
                            progressComponent={<div>Loading archived items...</div>}
                            customStyles={customStyles}
                            noDataComponent={
                                <div className="no-data">
                                    {error ? error : "No archived items found"}
                                </div>
                            }
                        />
                    </div>
                </main>
            </section>
        </div>
    );
};

export default ArchivedPage;