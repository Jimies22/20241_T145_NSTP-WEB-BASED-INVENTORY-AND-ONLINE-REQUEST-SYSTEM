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
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [dateRange, setDateRange] = useState({ start: null, end: null });

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

    const SPREADSHEET_ID = "1robOVUE6k3a3BcyCj8o25W8f6p2422VbfyvcW9NyxCE";

    const handleGoToSheets = async () => {
        try {
            const token = sessionStorage.getItem("sessionToken");
            
            // First update the sheet
            const response = await axios.post(
                "http://localhost:3000/api/update-activity-logs",
                {}, // empty body
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            );

            // Then open the sheet
            const sheetsUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=1`;
            window.open(sheetsUrl, '_blank');

            Swal.fire({
                title: 'Success!',
                text: 'Activity logs updated and opened in new tab',
                icon: 'success',
                timer: 2000
            });
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.error || 'Failed to update Google Sheet',
                icon: 'error'
            });
        }
    };

    const filteredItems = activities.filter(
        item => {
            return (
                (item.userName && item.userName.toLowerCase().includes(filterText.toLowerCase())) ||
                (item.action && item.action.toLowerCase().includes(filterText.toLowerCase())) ||
                (item.details && item.details.toLowerCase().includes(filterText.toLowerCase())) ||
                (item.userRole && item.userRole.toLowerCase().includes(filterText.toLowerCase()))
            );
        }
    );

    const subHeaderComponent = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
                type="text"
                placeholder="Search Activities..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                style={{
                    padding: '6px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#495057',
                    outline: 'none'
                }}
            />
            {filterText && (
                <button
                    onClick={() => {
                        setResetPaginationToggle(!resetPaginationToggle);
                        setFilterText('');
                    }}
                    style={{
                        padding: '6px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: '#fff'
                    }}
                >
                    Clear
                </button>
            )}
        </div>
    );

    const filteredByDate = activities.filter(item => {
        if (!dateRange.start || !dateRange.end) return true;
        const activityDate = new Date(item.timestamp);
        return activityDate >= dateRange.start && activityDate <= dateRange.end;
    });

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
                            <div className="right">
                                <button 
                                    className="export-sheets-btn" 
                                    onClick={handleGoToSheets}
                                    title="Open in Google Sheets"
                                >
                                    <i className="bx bxs-spreadsheet"></i>
                                    <span>View in Google Sheets</span>
                                </button>
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
                                data={filteredItems}
                                pagination
                                paginationResetDefaultPage={resetPaginationToggle}
                                subHeader
                                subHeaderComponent={subHeaderComponent}
                                persistTableHead
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