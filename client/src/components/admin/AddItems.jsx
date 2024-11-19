// src/components/EditPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Sidebar from '../sidebar/AdminSidebar';
import Navbar from '../Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/EditPage.css';

function AddItems() {
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        item_id: '',
        name: '',
        description: '',
        category: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

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
                        onClick={() => handleShowModal(row)}
                        className="edit-btn"
                    >
                        <i className='bx bx-edit'></i>
                    </button>
                    <button 
                        onClick={() => handleDelete(row.item_id)}
                        className="delete-btn"
                    >
                        <i className='bx bx-trash'></i>
                    </button>
                </div>
            ),
            width: '120px'
        }
    ];

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
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
            }
        },
        rows: {
            style: {
                minHeight: '60px',
                '&:hover': {
                    backgroundColor: '#f5f5f5',
                }
            }
        },
        pagination: {
            style: {
                borderTop: 'none',
                marginTop: '10px',
            }
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/items');
            setItems(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching items:', error);
            setError('Failed to fetch items');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.patch(`http://localhost:3000/items/${formData.item_id}`, formData);
            } else {
                await axios.post('http://localhost:3000/items/additem', formData);
            }
            handleCloseModal();
            fetchItems();
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    const handleDelete = async (item_id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`http://localhost:3000/items/${item_id}`);
                fetchItems();
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    const handleShowModal = (item = null) => {
        if (item) {
            setFormData(item);
            setIsEditing(true);
        } else {
            setFormData({
                item_id: '',
                name: '',
                description: '',
                category: ''
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            item_id: '',
            name: '',
            description: '',
            category: ''
        });
        setIsEditing(false);
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <section id="content">
                <Navbar />
                <main>
                    <div className="head-title">
                        <div className="left">
                            <h1>Items Management</h1>
                        </div>
                        <button 
                            className="btn btn-primary add-button" 
                            onClick={() => handleShowModal()}
                        >
                            <i className='bx bx-plus'></i>
                            Add New Item
                        </button>
                    </div>

                    <div className="table-data">
                        <div className="order">
                            <DataTable
                                title="Items List"
                                columns={columns}
                                data={items}
                                pagination
                                responsive
                                highlightOnHover
                                pointerOnHover
                                progressPending={loading}
                                progressComponent={<div className="loading">Loading items...</div>}
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
                    <div className={`modal fade ${showModal ? 'show' : ''}`} 
                         style={{ display: showModal ? 'block' : 'none' }}
                         tabIndex="-1"
                         role="dialog"
                         aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {isEditing ? 'Edit Item' : 'Add New Item'}
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
                                            <label className="form-label">Item ID:</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="item_id"
                                                value={formData.item_id}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
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
                                    </div>
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary" 
                                            onClick={handleCloseModal}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                        >
                                            {isEditing ? 'Update Item' : 'Add Item'}
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
