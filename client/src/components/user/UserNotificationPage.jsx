// src/components/NotificationPage.jsx
import React, { useState, useEffect } from "react";
import UserSidebar from "../sidebar/UserSidebar";
import UserNavbar from "../Navbar/UserNavbar";
import "../../css/NotificationPage.css";
import axios from "axios";

function UserNotificationPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:3000/notifications"); // Adjust the endpoint as necessary
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <div className="user-dashboard">
      <UserSidebar />
      <section id="content">
        <UserNavbar />
        <main>
          <div className="head-title">
            <h1>Notifications</h1>
          </div>
          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>Notification Requests</h3>
              </div>
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notification) => (
                      <tr key={notification._id}>
                        <td>{notification.userId}</td>
                        <td>{notification.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default UserNotificationPage;
