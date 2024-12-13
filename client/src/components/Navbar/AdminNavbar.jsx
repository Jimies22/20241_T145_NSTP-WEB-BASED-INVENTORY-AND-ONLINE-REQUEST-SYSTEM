import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/Navbar.css';

function AdminNavbar() {
    const navigate = useNavigate();
    const [notificationCount, setNotificationCount] = useState(0);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        profilePicture: null
    });
    const [isSigningOut, setIsSigningOut] = useState(false);

    useEffect(() => {
        const sessionUser = JSON.parse(sessionStorage.getItem('userInfo'));
        if (sessionUser) {
            if (!sessionUser.picture) {
                const name = "Admin";
                const email = sessionUser.email;
                const initial = name.charAt(0).toUpperCase();
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 200;
                canvas.height = 200;

                context.fillStyle = '#3C91E6';
                context.beginPath();
                context.arc(100, 100, 100, 0, Math.PI * 2);
                context.fill();

                context.fillStyle = '#FFFFFF';
                context.font = 'bold 100px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(initial, 100, 100);

                const profilePicture = canvas.toDataURL('image/png');

                setUserInfo({
                    name: name,
                    email: email,
                    profilePicture: profilePicture
                });
            } else {
                setUserInfo({
                    name: sessionUser.name,
                    email: sessionUser.email,
                    profilePicture: sessionUser.picture
                });
            }
        }

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        
        window.addEventListener('storage', handleStorageChange);
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
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
            const pendingRequests = response.data.filter(req => req.status === "pending");
            setNotificationCount(pendingRequests.length);
            
            localStorage.setItem('notifications', JSON.stringify(pendingRequests));
            localStorage.setItem('notificationCount', pendingRequests.length.toString());
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleSignOut = () => {
        setIsSigningOut(true);
        
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

        setTimeout(() => {
            sessionStorage.clear();
            localStorage.clear();
            
            navigate('/');
            
            loadingScreen.remove();
        }, 1500);
    };

    return (
        <nav>
            <a href="#" className="nav-link"></a>
            <form action="#">
                {/* Search form if needed */}
            </form>
            
            <div className="nav-right">
                <Link to="/notification" className="notification">
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

export default AdminNavbar; 