// src/components/NotificationPage.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar/AdminSidebar';
import AdminNavbar from '../Navbar/AdminNavbar';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../css/NotificationPage.css';

function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
        // Set up polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        const token = sessionStorage.getItem("sessionToken");
        try {
            const response = await axios.get("http://localhost:3000/borrow/all", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Filter for pending requests only
            const pendingRequests = response.data.filter(req => req.status === "pending");
            setNotifications(pendingRequests);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setError("Failed to fetch notifications");
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    return (
        <div className="admin-dashboard">
            <Sidebar />
            <section id="content">
                <AdminNavbar />
                <main>
                    <div className="head-title">
                        <div className="left">
                            <h1>Notifications</h1>
                            <ul className="breadcrumb">
                                <li><a href="#">Notifications</a></li>
                                <li><i className="bx bx-chevron-right" /></li>
                                <li><a className="active" href="/admin">Home</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="notification-container">
                        {loading ? (
                            <div className="loading">Loading notifications...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : notifications.length === 0 ? (
                            <div className="no-notifications">No new notifications</div>
                        ) : (
                            notifications.map((notification) => (
                                <div key={notification._id} className="notification-card">
                                    <div className="notification-header">
                                        <img src="src/assets/profile.png" alt="User" className="user-avatar" />
                                        <div className="notification-info">
                                            <h3>{notification.userId.name}</h3>
                                            <span className="time-ago">{getTimeAgo(notification.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="notification-content">
                                        <p className="notification-message">
                                            Requested to borrow: <strong>{notification.item.name}</strong>
                                        </p>
                                        <div className="request-details">
                                            <p>Quantity: {notification.quantity || 1}</p>
                                            <p>Borrow Date: {formatDate(notification.borrowDate)}</p>
                                            <p>Return Date: {formatDate(notification.returnDate)}</p>
                                        </div>
                                    </div>
                                    <div className="notification-actions">
                                        <button 
                                            onClick={() => handleApprove(notification._id, notification.item._id)}
                                            className="approve-btn"
                                        >
                                            <i className="bx bx-check"></i> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleReject(notification._id)}
                                            className="reject-btn"
                                        >
                                            <i className="bx bx-x"></i> Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </section>
        </div>
    );
}

export default NotificationPage;
