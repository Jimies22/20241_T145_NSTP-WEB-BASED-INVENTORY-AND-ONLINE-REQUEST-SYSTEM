import React, { useState, useEffect } from 'react';
import AdminNavbar from '../Navbar/AdminNavbar';
import Sidebar from '../sidebar/AdminSidebar';
import axios from 'axios';
import '../../css/ActivityPage.css';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';

const ActivityPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const columns = [
        {
            name: "Timestamp",
            selector: row => new Date(row.timestamp).toLocaleString(),
            sortable: true,
            width: "20%",
        },
        {
            name: "User",
            selector: row => row.userName,
            sortable: true,
            width: "15%",
        },
        {
            name: "Role",
            selector: row => row.userRole,
            sortable: true,
            width: "15%",
        },
        {
            name: "Action",
            selector: row => row.action,
            sortable: true,
            width: "15%",
        },
        {
            name: "Details",
            selector: row => row.details,
            sortable: true,
            wrap: true,
            width: "35%",
        },
    ];

    const fetchActivities = async () => {
        try {
            const token = sessionStorage.getItem('sessionToken');
            const response = await axios.get('http://localhost:3000/activity', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setActivities(response.data.activities);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching activities:', error);
            setError('Failed to load activities');
            setLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load activities'
            });
        }
    };

    useEffect(() => {
        fetchActivities();

        const intervalId = setInterval(() => {
            fetchActivities();
        }, 30000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handleNewActivity = () => {
            fetchActivities();
        };

        window.addEventListener('newActivity', handleNewActivity);

        return () => {
            window.removeEventListener('newActivity', handleNewActivity);
        };
    }, []);

    return (
        <>
            <div className="user-dashboard">
                <Sidebar />
                <section id="content">
                    <AdminNavbar />
                    <main>
                        <div className="head-title">
                            <div className="left">
                                <h1>Activity Log</h1>
                                <ul className="breadcrumb">
                                    <li>
                                        <a href="#">Dashboard</a>
                                    </li>
                                    <li>
                                        <i className="bx bx-chevron-right"></i>
                                    </li>
                                    <li>
                                        <a className="active" href="#">Activity Log</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div style={{
                            padding: "0px",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            margin: "0px",
                            height: "540px",
                            overflow: "hidden",
                        }}>
                            <DataTable
                                columns={columns}
                                data={activities}
                                pagination
                                responsive
                                highlightOnHover
                                pointerOnHover
                                progressPending={loading}
                                progressComponent={<div>Loading...</div>}
                                customStyles={customStyles}
                                noDataComponent={
                                    <div style={{ padding: "24px" }}>No activities found</div>
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

export default ActivityPage;