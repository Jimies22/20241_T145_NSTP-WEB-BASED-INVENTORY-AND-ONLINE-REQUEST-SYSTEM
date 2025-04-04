import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../css/AdminSidebar.css';
import NstpLogo from '../../assets/NSTP_LOGO.png';

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

    return (
        <section id="sidebar" className={isSidebarVisible ? '' : 'hide'}>
            <Link to="/Admin" className="brand">
                <img 
                    src={NstpLogo} 
                    alt="Admin Logo" 
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
                <li className={location.pathname === '/Admin' ? 'active' : ''}>
                    <a href="/Admin"><i className='bx bxs-dashboard'></i><span className="text">Dashboard</span></a>
                </li>
                <li className={location.pathname.startsWith('/request') ? 'active' : ''}>
                    <Link to="/request">
                        <i className='bx bx-envelope'></i>
                        <span className="text">Request</span>
                    </Link>
                </li>
                <li className={location.pathname === '/add' ? 'active' : ''}>
                    <Link to="/add"><i className='bx bxs-message-square-add'></i><span className="text">Equipments</span></Link>
                </li>
                <li className={location.pathname === '/users' ? 'active' : ''}>
                    <Link to="/users"><i className='bx bxs-user-account'></i><span className="text">Users</span></Link>
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
        </section>
    );
}

export default AdminSidebar;


