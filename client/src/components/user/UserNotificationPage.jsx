// src/components/NotificationPage.jsx
import React, { useState, useEffect } from "react";
import UserSidebar from "../sidebar/UserSidebar";
import UserNavbar from "../Navbar/UserNavbar";
import "../../css/Navbar.css";
import "../../css/NotificationPage.css";
import { useNavigate } from 'react-router-dom';

function UserNotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllNotifications = async () => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/borrow/my-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const requests = await response.json();
      
      // Transform requests into notifications (only pending and rejected)
      const notificationsList = requests
        .filter(request => ['pending', 'rejected'].includes(request.status.toLowerCase()))
        .map(request => ({
          id: request._id,
          itemName: request.item?.name || 'Unknown Item',
          status: request.status,
          timestamp: new Date(request.updatedAt || request.requestDate).toLocaleString(),
          message: getNotificationMessage(request),
          isRead: request.isRead || false
        }));

      // Sort notifications by timestamp (newest first)
      const sortedNotifications = notificationsList.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Helper function to determine which page to navigate to based on status
  const getPageForStatus = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return '/user-request/pending';
      case 'approved':
        return '/user-request';
      case 'rejected':
        return '/user-request/rejected';
      case 'cancelled':
        return '/user-request/cancelled';
      default:
        return '/user-request';
    }
  };

  const handleView = async (notification) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }
      
      // Navigate to appropriate page based on status
      const targetPage = getPageForStatus(notification.status);
      navigate(targetPage);
    } catch (error) {
      console.error('Error handling view:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    const token = sessionStorage.getItem("sessionToken");
    try {
      const response = await fetch(`http://localhost:3000/borrow/mark-read/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );

      // Get current unread count from notifications state
      const unreadCount = notifications.filter(notif => !notif.isRead).length;
      const newCount = Math.max(0, unreadCount - 1); // Ensure count doesn't go below 0
      
      // Update localStorage
      localStorage.setItem('userNotificationCount', newCount.toString());
      
      // Dispatch custom event to update notification bell
      window.dispatchEvent(new CustomEvent('notificationCountUpdate', {
        detail: { count: newCount }
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationMessage = (request) => {
    const itemName = request.item?.name || 'an item';
    switch(request.status.toLowerCase()) {
      case 'rejected':
        return `Your request for "${itemName}" has been rejected.`;
      case 'pending':
        return `Your request for "${itemName}" is pending approval.`;
      default:
        return `Status update for "${itemName}": ${request.status}`;
    }
  };

  const getStatusClass = (status) => {
    return `status ${status.toLowerCase()}`;
  };

  return (
    <div className="user-dashboard">
      <UserSidebar />
      <section id="content">
        <UserNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Notifications</h1>
              <ul className="breadcrumb">
                <li><a href="#">Notifications</a></li>
                <li><i className="bx bx-chevron-right" /></li>
                <li><a className="active" href="/user">Home</a></li>
              </ul>
            </div>
          </div>

          <div className="notification-container">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications available</div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} 
                     className={`notification-card ${!notification.isRead ? 'unread' : ''}`}>
                  <div className="notification-content">
                    <h3>{notification.itemName}</h3>
                    <p>{notification.message}</p>
                    <span className="timestamp">{notification.timestamp}</span>
                  </div>
                  <div className="notification-actions">
                    <button 
                      onClick={() => handleView(notification)}
                      className="view-btn"
                    >
                      <i className="bx bx-show"></i> View Request
                    </button>
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="mark-read-btn"
                      >
                        <i className="bx bx-check"></i> Mark as Read
                      </button>
                    )}
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

export default UserNotificationPage;
