import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../css/UserSidebar.css';
import Logo from '../../assets/NSTP_LOGO.png';

const UserSidebar = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
        const saved = localStorage.getItem('sidebarState');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('sidebarState', JSON.stringify(isSidebarVisible));
    }, [isSidebarVisible]);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <section id="sidebar" className={isSidebarVisible ? '' : 'hide'}>
            <Link to="/" className="brand">
                <img 
                    src={Logo} 
                    alt="NSTP Logo" 
                    className={`brand ${!isSidebarVisible ? 'small-logo' : ''}`} 
                />
                <span className="text">NSTP</span>
            </Link>
            <button 
                onClick={toggleSidebar} 
                className="toggle-button" 
                style={{ zIndex: 3000 }}
            >
                <i className={`bx ${isSidebarVisible ? 'bx-chevron-left' : 'bx-chevron-right'}`}></i>
            </button>
            <ul className="side-menu top">
                <li className={location.pathname === '/user-dashboard' ? 'active' : ''}>
                    <a href="/user-dashboard">
                        <i className='bx bxs-dashboard'></i>
                        <span className="text">Dashboard</span>
                    </a>
                </li>
                <li className={location.pathname === '/user-request/pending' ? 'active' : ''}>
                    <a href="/user-request/pending">
                        <i className='bx bxs-shopping-bag-alt'></i>
                        <span className="text">Request</span>
                    </a>
                </li>
                <li className={location.pathname === '/user-borrowed' ? 'active' : ''}>
                    <a href="/user-borrowed">
                        <i className='bx bxs-book'></i>
                        <span className="text">Borrowed Items</span>
                    </a>
                </li>
                {/* <li className={location.pathname === '/user-report' ? 'active' : ''}>
                    <a href="/user-report">
                        <i className='bx bxs-report'></i>
                        <span className="text">Reports</span>
                    </a>
                </li> */}
            </ul>
        </section>
    );
};

export default UserSidebar;