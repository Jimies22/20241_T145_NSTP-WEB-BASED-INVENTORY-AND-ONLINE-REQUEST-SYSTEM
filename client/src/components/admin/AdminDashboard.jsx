//src/components/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/AdminSidebar';
import AdminNavbar from '../Navbar/AdminNavbar';
import '../../css/AdminDashboard.css';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

function AdminDashboard() {
    const navigate = useNavigate();
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState({ title: '', image: '', status: '' });
    const [borrowTime, setBorrowTime] = useState('');
    const [isBookButtonActive, setIsBookButtonActive] = useState(false);
    const [statistics, setStatistics] = useState({
        requests: {
            pending: 0,
            approved: 0,
            rejected: 0,
            cancelled: 0
        },
        items: {
            available: 0,
            borrowed: 0,
            archived: 0
        }
    });

    useEffect(() => {
        const token = sessionStorage.getItem('sessionToken');
        if (!token) {
            navigate('/login');
        } else {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedToken.exp < currentTime) {
                sessionStorage.removeItem('sessionToken');
                navigate('/login');
            }
        }
    }, [navigate]);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://apis.google.com/js/api.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        setIsBookButtonActive(!!borrowTime);
    }, [borrowTime]);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                // Fetch requests statistics
                const requestsResponse = await fetch('/api/borrow/all', {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
                    }
                });
                const requestsData = await requestsResponse.json();

                // Count requests by status
                const requestStats = requestsData.reduce((acc, request) => {
                    acc[request.status] = (acc[request.status] || 0) + 1;
                    return acc;
                }, {});

                // Fetch items statistics
                const itemsResponse = await fetch('/api/items', {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
                    }
                });
                const itemsData = await itemsResponse.json();

                // Count items by status
                const itemStats = itemsData.reduce((acc, item) => {
                    if (item.isArchived) {
                        acc.archived++;
                    } else if (!item.availability) {
                        acc.borrowed++;
                    } else {
                        acc.available++;
                    }
                    return acc;
                }, { available: 0, borrowed: 0, archived: 0 });

                setStatistics({
                    requests: {
                        pending: requestStats.pending || 0,
                        approved: requestStats.approved || 0,
                        rejected: requestStats.rejected || 0,
                        cancelled: requestStats.cancelled || 0
                    },
                    items: itemStats
                });
            } catch (error) {
                console.error('Error fetching statistics:', error);
            }
        };

        fetchStatistics();
    }, []);

    // Chart configurations
    const requestsChartConfig = {
        labels: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        datasets: [{
            label: 'Request Statistics',
            data: [
                statistics.requests.pending,
                statistics.requests.approved,
                statistics.requests.rejected,
                statistics.requests.cancelled
            ],
            backgroundColor: [
                'rgba(255, 206, 86, 0.5)',  // yellow for pending
                'rgba(75, 192, 192, 0.5)',   // green for approved
                'rgba(255, 99, 132, 0.5)',   // red for rejected
                'rgba(153, 102, 255, 0.5)'   // purple for cancelled
            ],
            borderColor: [
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    };

    const itemsChartConfig = {
        labels: ['Available', 'Borrowed', 'Archived'],
        datasets: [{
            label: 'Item Statistics',
            data: [
                statistics.items.available,
                statistics.items.borrowed,
                statistics.items.archived
            ],
            backgroundColor: [
                'rgba(75, 192, 192, 0.5)',   // green for available
                'rgba(255, 206, 86, 0.5)',   // yellow for borrowed
                'rgba(255, 99, 132, 0.5)'    // red for archived
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        }]
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Statistics Overview'
            }
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('sessionToken');
        navigate('/login');
    };

    const openOverlay = (item) => {
        console.log("Opening overlay for:", item);
        setSelectedItem(item);
        setOverlayVisible(true);
        setBorrowTime('');
    };

    const closeOverlay = () => {
        console.log("Closing overlay");
        setOverlayVisible(false);
    };

    return (
        <div className="admin-dashboard">
            <header>
                <link href='https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css' rel='stylesheet' />
                <title>Admin Dashboard</title>
            </header>
            <Sidebar />
            <section id="content">
                {/* Navbar Section */}
                <AdminNavbar className="navbar" />
                {/* Main Content */}
                <main>
                    <div className="head-title">
                        <div className="left">
                            <h1>Dashboard</h1>
                            <ul className="breadcrumb">
                                <li><a href="#">Dashboard</a></li>
                                <li><i className='bx bx-chevron-right'></i></li>
                                <li><a className="active" href="#">Home</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="box-info">
                        <div className="box">
                            <i className='bx bxs-calendar-check'></i>
                            <span className="text">
                                <h3>{statistics.requests.pending}</h3>
                                <p>Pending Requests</p>
                            </span>
                        </div>
                        <div className="box">
                            <i className='bx bxs-group'></i>
                            <span className="text">
                                <h3>{statistics.items.available}</h3>
                                <p>Available Items</p>
                            </span>
                        </div>
                        <div className="box">
                            <i className='bx bxs-dollar-circle'></i>
                            <span className="text">
                                <h3>{statistics.items.borrowed}</h3>
                                <p>Borrowed Items</p>
                            </span>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="charts-container">
                        <div className="chart-box">
                            <h3>Request Statistics</h3>
                            <div style={{ height: '300px' }}>
                                <Bar data={requestsChartConfig} options={chartOptions} />
                            </div>
                        </div>
                        <div className="chart-box">
                            <h3>Item Statistics</h3>
                            <div style={{ height: '300px' }}>
                                <Bar data={itemsChartConfig} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </main>
            </section>

            {overlayVisible && (
                <div className="overlay" id="borrowOverlay">
                    <div className="overlay-content">
                        <span className="close-btn" onClick={closeOverlay}>&times;</span>
                        <h2>{selectedItem.title}</h2>
                        <img id="selectedItemImage" src={selectedItem.image} alt={selectedItem.title} />
                        <p id="selectedItemName">{selectedItem.title}</p>
                        <input
                            type="time"
                            id="borrowTime"
                            value={borrowTime}
                            onChange={(e) => setBorrowTime(e.target.value)}
                        />
                        <button
                            id="bookButton"
                            disabled={!isBookButtonActive}
                            className={isBookButtonActive ? 'active' : ''}
                        >
                            Book
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
