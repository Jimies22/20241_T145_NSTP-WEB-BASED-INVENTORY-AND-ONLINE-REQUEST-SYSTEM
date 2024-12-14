import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/Navbar.css';

function UserNavbar() {
    const navigate = useNavigate();
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        profilePicture: 'src/assets/profile.png'
    });
    const [isSigningOut, setIsSigningOut] = useState(false);

    useEffect(() => {
        // Get user info from session storage
        const sessionUser = JSON.parse(sessionStorage.getItem('userInfo'));
        if (sessionUser) {
            console.log("Loading user info:", sessionUser); // Debug log
            setUserInfo({
                name: sessionUser.name,
                email: sessionUser.email,
                profilePicture: sessionUser.picture // Use the stored Google profile picture URL
            });
        }

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

            // Only count unread notifications that are pending or rejected
            const notificationRequests = response.data.filter(req => 
                ['pending', 'rejected'].includes(req.status.toLowerCase()) 
                && !req.isRead
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

    const handleSignOut = () => {
        setIsSigningOut(true);
        
        // Create and append the loading screen
        const loadingScreen = document.createElement('div');
        loadingScreen.className = 'loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p class="loading-text">Signing Out<span class="loading-dots"></span></p>
                <p class="loading-subtext">Please wait while we log you out</p>
            </div>
        `;
        document.body.appendChild(loadingScreen);

        // Simulate a delay for the animation
        setTimeout(() => {
            // Clear all stored data
            sessionStorage.clear();
            localStorage.clear();
            
            // Navigate to login page
            navigate('/');
            
            // Remove loading screen
            loadingScreen.remove();
        }, 1500);
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
            <div className="nav-right">
                <Link to="/usernotification" className="notification">
                    <i className='bx bxs-bell'></i>
                    {notificationCount > 0 && (
                        <span className="num">{notificationCount}</span>
                    )}
                </Link>
                
                <div className="profile-container">
                    <a className="profile" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                        <img src={userInfo.profilePicture} alt="Profile" />
                    </a>
                    {showProfileDropdown && (
                        <div className="profile-dropdown">
                            <div className="profile-content">
                                <div className="profile-header">
                                    <img 
                                        src={userInfo.profilePicture || 'src/assets/profile.png'} 
                                        alt="Profile"
                                        onError={(e) => {
                                            console.error("Failed to load profile picture:", e);
                                            e.target.src = 'src/assets/profile.png';
                                        }}
                                    />
                                    <div className="profile-info">
                                        <h4>{userInfo.name}</h4>
                                        <p>{userInfo.email}</p>
                                    </div>
                                </div>
                                <div className="profile-actions">
                                    <button className="sign-out-btn" onClick={handleSignOut}>
                                        <i className='bx bx-log-out'></i>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                                <div className="profile-footer">
                                    <div className="managed-by-container">
                                        <span className="managed-by">Managed by nstp.buksu.edu.ph</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default UserNavbar; 