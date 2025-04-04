//src/components/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/AdminSidebar';
import AdminNavbar from '../Navbar/AdminNavbar';
import '../../css/AdminDashboard.css';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Line, Pie } from 'react-chartjs-2';
import axios from 'axios';

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
                const requestsResponse = await axios.get("http://localhost:3000/borrow/all", {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
                    }
                });
                const requestsData = requestsResponse.data;

                // Count requests by status
                const requestStats = requestsData.reduce((acc, request) => {
                    acc[request.status] = (acc[request.status] || 0) + 1;
                    return acc;
                }, {});

                // Fetch items statistics
                const itemsResponse = await axios.get("http://localhost:3000/items", {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
                    }
                });
                const itemsData = itemsResponse.data;

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
            label: 'Request Status',
            data: [
                statistics.requests.pending,
                statistics.requests.approved,
                statistics.requests.rejected,
                statistics.requests.cancelled
            ],
            backgroundColor: [
                'rgba(60, 145, 230, 0.7)',  // Light blue (matching website theme)
                'rgba(75, 192, 192, 0.7)',  // Light teal
                'rgba(219, 80, 74, 0.7)',   // Light red
                'rgba(170, 170, 170, 0.7)'  // Light grey
            ],
            borderWidth: 0
        }]
    };

    const itemStatusPieConfig = {
        labels: ['Available', 'Borrowed', 'Archived'],
        datasets: [{
            data: [
                statistics.items.available,
                statistics.items.borrowed,
                statistics.items.archived
            ],
            backgroundColor: [
                'rgba(75, 192, 192, 0.7)',  // Light teal
                'rgba(60, 145, 230, 0.7)',  // Light blue
                'rgba(170, 170, 170, 0.7)'  // Light grey
            ],
            borderWidth: 0
        }]
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Request Statistics',
                font: {
                    family: 'Poppins',
                    size: 16
                }
            },
            datalabels: {
                color: '#342E37',
                anchor: 'end',
                align: 'top',
                formatter: (value) => Math.round(value)
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: false
                },
                ticks: {
                    stepSize: 1,
                    callback: function(value) {
                        return Math.round(value);
                    }
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        family: 'Poppins',
                        size: 12
                    },
                    padding: 20,
                    usePointStyle: true,
                    generateLabels: (chart) => {
                        const datasets = chart.data.datasets[0];
                        return chart.data.labels.map((label, index) => ({
                            text: `${label}: ${datasets.data[index]}`,
                            fillStyle: datasets.backgroundColor[index],
                            hidden: false,
                            index: index
                        }));
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const value = context.raw;
                        const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                        const percentage = ((value * 100) / total).toFixed(1);
                        return `${context.label}: ${value} (${percentage}%)`;
                    }
                }
            },
            datalabels: {
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 14
                },
                formatter: (value, ctx) => {
                    const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value * 100) / sum).toFixed(1);
                    return `${value}\n(${percentage}%)`;
                },
                anchor: 'center',
                align: 'center',
                offset: 0
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
                        <div className="chart-row">
                            <div className="chart-box">
                                <h3>Request Statistics</h3>
                                <div className="chart-wrapper">
                                    <Bar data={requestsChartConfig} options={barChartOptions} />
                                </div>
                            </div>
                            <div className="chart-box">
                                <h3>Item Status Distribution</h3>
                                <div className="chart-wrapper">
                                    <Pie data={itemStatusPieConfig} options={pieChartOptions} />
                                </div>
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
