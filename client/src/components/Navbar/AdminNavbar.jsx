import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../css/Navbar.css';

function AdminNavbar() {
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        // Set up polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);

        // Also listen for localStorage changes
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleStorageChange = (e) => {
        if (e.key === 'notificationCount') {
            setNotificationCount(parseInt(e.newValue) || 0);
        }
    };

    const fetchNotifications = async () => {
        const token = sessionStorage.getItem("sessionToken");
        try {
            const response = await axios.get("http://localhost:3000/borrow/all", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Only show pending requests for admin
            const pendingRequests = response.data.filter(req => req.status === "pending");
            setNotificationCount(pendingRequests.length);
            
            localStorage.setItem('notifications', JSON.stringify(pendingRequests));
            localStorage.setItem('notificationCount', pendingRequests.length.toString());
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    return (
        <nav>
            <a href="#" className="nav-link"></a>
            <form action="#">
                {/* Search form if needed */}
            </form>
            <Link to="/notification" className="notification">
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

export default AdminNavbar; 