// src/components/NotificationPage.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../sidebar/AdminSidebar';
import AdminNavbar from '../Navbar/AdminNavbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/NotificationPage.css';

function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = sessionStorage.getItem("sessionToken");
            const response = await axios.get("http://localhost:3000/borrow/all", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Transform borrow requests into notifications format
            const notificationData = response.data
                .filter(req => req.status === "pending")
                .map(req => ({
                    _id: req._id,
                    user: {
                        name: req.userId?.name || 'Unknown User',
                        image: req.userId?.image || "src/assets/profile.png"
                    },
                    message: `Requested to borrow: ${req.item?.name || 'Unknown Item'}`,
                    createdAt: req.createdAt,
                    status: 'unread',
                    type: 'BORROW_REQUEST',
                    requestId: req._id,
                    item: req.item
                }));

            setNotifications(notificationData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError('Failed to fetch notifications');
            setLoading(false);
        }
    };

    const handleView = () => {
        navigate('/request');
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
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
                    <div className="table-data">
                        <div className="pending-requests">
                            <div className="head">
                                <h3>Notification Requests</h3>
                            </div>
                            <div className="order">
                                {loading ? (
                                    <div className="loading">Loading notifications...</div>
                                ) : error ? (
                                    <div className="error">{error}</div>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Description</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {notifications.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="no-notifications">
                                                        No notifications available
                                                    </td>
                                                </tr>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <tr key={notification._id}>
                                                        <td className="card">
                                                            <img src={notification.user.image} alt="User Image" />
                                                            <p>{notification.user.name}</p>
                                                        </td>
                                                        <td>{notification.message}</td>
                                                        <td>{new Date(notification.createdAt).toLocaleString()}</td>
                                                        <td>{notification.status}</td>
                                                        <td>
                                                            <button 
                                                                onClick={handleView}
                                                                className="view-btn"
                                                            >
                                                                <i className="bx bx-show"></i> View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </section>
        </div>
    );
}

export default NotificationPage;
