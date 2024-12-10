// src/components/NotificationPage.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../sidebar/AdminSidebar';
import AdminNavbar from '../Navbar/AdminNavbar';
import axios from 'axios';
import '../../css/NotificationPage.css';
import Swal from 'sweetalert2';

function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = sessionStorage.getItem("sessionToken");
            const response = await axios.get('http://localhost:3000/notifications', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNotifications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError('Failed to fetch notifications');
            setLoading(false);
        }
    };

    const handleApprove = async (notificationId, type, requestId) => {
        try {
            const token = sessionStorage.getItem("sessionToken");
            
            // Handle different types of notifications
            if (type === 'BORROW_REQUEST') {
                await axios.patch(
                    `http://localhost:3000/borrow/${requestId}/status`,
                    { status: 'approved' },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }
            
            // Mark notification as read
            await axios.patch(
                `http://localhost:3000/notifications/${notificationId}`,
                { status: 'read' },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire({
                title: 'Success!',
                text: 'Request approved successfully',
                icon: 'success'
            });

            fetchNotifications();
        } catch (error) {
            console.error('Error approving request:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to approve request',
                icon: 'error'
            });
        }
    };

    const handleReject = async (notificationId, type, requestId) => {
        try {
            const token = sessionStorage.getItem("sessionToken");
            
            if (type === 'BORROW_REQUEST') {
                await axios.patch(
                    `http://localhost:3000/borrow/${requestId}/status`,
                    { status: 'rejected' },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }
            
            await axios.patch(
                `http://localhost:3000/notifications/${notificationId}`,
                { status: 'read' },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire({
                title: 'Success!',
                text: 'Request rejected successfully',
                icon: 'success'
            });

            fetchNotifications();
        } catch (error) {
            console.error('Error rejecting request:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to reject request',
                icon: 'error'
            });
        }
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar/>
            <section id="content">
                <AdminNavbar className="navbar" notificationCount={notifications.filter(n => n.status === 'unread').length} />
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
                                <i className="bx bx-filter" />
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
                                                    <tr key={notification._id} 
                                                        className={notification.status === 'unread' ? 'unread' : ''}>
                                                        <td className="card">
                                                            <img src={notification.user?.image || "img/people.png"} 
                                                                 alt="User Image" />
                                                            <p>{notification.user?.name || notification.userId}</p>
                                                        </td>
                                                        <td>{notification.message}</td>
                                                        <td>{new Date(notification.createdAt).toLocaleDateString()}</td>
                                                        <td>{notification.status}</td>
                                                        <td>
                                                            {notification.status === 'unread' && (
                                                                <>
                                                                    <button onClick={() => handleApprove(notification._id, notification.type, notification.requestId)}
                                                                            className="approve-btn">
                                                                        <i className="bx bx-check" />
                                                                    </button>
                                                                    <button onClick={() => handleReject(notification._id, notification.type, notification.requestId)}
                                                                            className="reject-btn">
                                                                        <i className="bx bxs-x-circle" />
                                                                    </button>
                                                                </>
                                                            )}
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
