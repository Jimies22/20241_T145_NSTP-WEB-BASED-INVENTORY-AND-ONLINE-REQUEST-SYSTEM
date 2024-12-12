import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../css/Navbar.css';

function UserNavbar() {
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Initial fetch
        fetchNotifications();
        
        // Set up polling
        const interval = setInterval(fetchNotifications, 30000);
        
        // Listen for notification updates
        const handleNotificationUpdate = () => {
            fetchNotifications();
        };
        
        window.addEventListener('notificationUpdate', handleNotificationUpdate);
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('notificationUpdate', handleNotificationUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleStorageChange = (e) => {
        if (e.key === 'userNotificationCount') {
            setNotificationCount(parseInt(e.newValue) || 0);
        } else if (e.key === 'userNotifications') {
            const updatedNotifications = JSON.parse(e.newValue || '[]');
            setNotifications(updatedNotifications);
        }
    };

    const fetchNotifications = async () => {
        const token = sessionStorage.getItem("sessionToken");
        try {
            const response = await axios.get("http://localhost:3000/borrow/my-requests", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Include pending requests in notifications
            const notificationRequests = response.data.filter(req => 
                ['pending', 'approved', 'rejected', 'cancelled'].includes(req.status.toLowerCase())
            );

            setNotifications(notificationRequests);
            setNotificationCount(notificationRequests.length);
            
            // Update localStorage
            localStorage.setItem('userNotifications', JSON.stringify(notificationRequests));
            localStorage.setItem('userNotificationCount', notificationRequests.length.toString());
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const getNotificationMessage = (status, itemName) => {
        switch(status.toLowerCase()) {
            case 'approved':
                return `Your request for ${itemName} has been approved!`;
            case 'rejected':
                return `Your request for ${itemName} has been rejected.`;
            case 'cancelled':
                return `Your request for ${itemName} has been cancelled.`;
            default:
                return `Status update for ${itemName}: ${status}`;
        }
    };

    return (
        <nav>
            <a href="#" className="nav-link"></a>
            <form action="#">
                {/* <div className="form-input">
                    <input type="search" placeholder="Search..." />
                    <button type="submit" className="search-btn">
                        <i className='bx bx-search'></i>
                    </button>
                </div> */}
            </form>
            <Link to="/usernotification" className="notification">
                <i className='bx bxs-bell'></i>
                {notificationCount > 0 && (
                    <span className="num">{notificationCount}</span>
                )}
            </Link>
            <a className="profile">
                <img src="src/assets/profile.png" alt="Profile" />
            </a>
        </nav>
    );
}

export default UserNavbar; 