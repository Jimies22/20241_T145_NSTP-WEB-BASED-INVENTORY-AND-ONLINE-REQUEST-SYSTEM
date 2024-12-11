import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../css/AdminSidebar.css';

function AdminSidebar() {
    const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
        const saved = localStorage.getItem('adminSidebarState');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('adminSidebarState', JSON.stringify(isSidebarVisible));
    }, [isSidebarVisible]);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        const sidebarElement = document.getElementById('sidebar');
        sidebarElement.classList.add('logout-animation');
        
        // Wait for animation to complete before navigating
        setTimeout(() => {
            navigate('/login');
        }, 500); // Match this with animation duration
    };

    return (
        <section id="sidebar" className={isSidebarVisible ? '' : 'hide'}>
            <Link to="/Admin" className="brand">
                <img 
                    src="src/assets/NSTP_LOGO.png" 
                    alt="Admin Logo" 
                    className={`brand ${!isSidebarVisible ? 'small-logo' : ''}`} 
                />
                <span className="text">Admin</span>
            </Link>
            <button 
                onClick={toggleSidebar} 
                className="toggle-button" 
                style={{ zIndex: 3000 }}
            >
                <i className={`bx ${isSidebarVisible ? 'bx-x' : 'bx-menu'}`}></i>
            </button>
            <ul className="side-menu top">
                <li className={location.pathname === '/Admin' ? 'active' : ''}>
                    <a href="/Admin"><i className='bx bxs-dashboard'></i><span className="text">Dashboard</span></a>
                </li>
                <li className={location.pathname === '/request' ? 'active' : ''}>
                    <Link to="/request"><i className='bx bxs-shopping-bag-alt'></i><span className="text">Request</span></Link>
                </li>
                <li className={location.pathname === '/add' ? 'active' : ''}>
                    <Link to="/add"><i className='bx bxs-message-square-add'></i><span className="text">Add Items</span></Link>
                </li>
                <li className={location.pathname === '/users' ? 'active' : ''}>
                    <Link to="/users"><i className='bx bxs-user-account'></i><span className="text">Add Users</span></Link>
                </li>
                <li className={location.pathname === '/reports' ? 'active' : ''}>
                    <a href="/reports"><i className='bx bxs-report'></i><span className="text">Reports</span></a>
                </li>
                <li className={location.pathname === '/archive' ? 'active' : ''}>
                    <a href="/archive"><i className='bx bxs-archive'></i><span className="text">Archive</span></a>
                </li>
                <li className={location.pathname === '/activity' ? 'active' : ''}>
                    <a href="/activity"><i className='bx bx-history'></i><span className="text">Activity</span></a>
                </li>
            </ul>
            <ul className="side-menu">
                <li>
                    <a href="/login" className="logout" onClick={handleLogout}>
                        <i className='bx bxs-log-out-circle'></i>
                        <span className="text">Logout</span>
                    </a>
                </li>
            </ul>
        </section>
    );
}

export default AdminSidebar;


