// src/components/NotificationPage.jsx
import React, { useState, useEffect } from "react";
import UserSidebar from "../sidebar/UserSidebar";
import UserNavbar from "../Navbar/UserNavbar";
import "../../css/Navbar.css";
import "../../css/NotificationPage.css";

function UserNotificationPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchAllNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchAllNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllNotifications = async () => {
    const token = sessionStorage.getItem("sessionToken");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3000/borrow/my-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const requests = await response.json();
      
      // Transform requests into notifications
      const notificationsList = requests.map(request => ({
        id: request._id,
        itemName: request.item?.name,
        status: request.status,
        timestamp: new Date(request.updatedAt || request.requestDate).toLocaleString(),
        message: getNotificationMessage(request),
        requestDate: request.requestDate,
        borrowDate: request.borrowDate,
        returnDate: request.returnDate
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

  const getNotificationMessage = (request) => {
    const itemName = request.item?.name || 'an item';
    switch(request.status.toLowerCase()) {
      case 'approved':
        return `Your request for "${itemName}" has been approved! You can borrow it from ${
          new Date(request.borrowDate).toLocaleDateString()
        } to ${
          new Date(request.returnDate).toLocaleDateString()
        }`;
      case 'rejected':
        return `Your request for "${itemName}" has been rejected.`;
      case 'cancelled':
        return `Your request for "${itemName}" has been cancelled.`;
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
                <li><i className='bx bx-chevron-right' /></li>
                <li><a className="active" href="/user">Home</a></li>
              </ul>
            </div>
          </div>

          <div className="notifications-container">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="notification-card">
                  <div className="notification-header">
                    <span className={getStatusClass(notification.status)}>
                      {notification.status}
                    </span>
                    <span className="notification-time">
                      {notification.timestamp}
                    </span>
                  </div>
                  <div className="notification-body">
                    <p>{notification.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>No notifications found</p>
              </div>
            )}
          </div>
        </main>
      </section>
    </div>
  );
}

export default UserNotificationPage;
