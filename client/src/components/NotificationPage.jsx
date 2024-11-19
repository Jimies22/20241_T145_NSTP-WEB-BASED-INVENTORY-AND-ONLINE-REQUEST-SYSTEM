// src/components/NotificationPage.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar/AdminSidebar';
import Navbar from './Navbar';
import '../css/NotificationPage.css';

function NotificationPage() {
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState({ title: '', image: '', status: '' });
    const [borrowTime, setBorrowTime] = useState('');
    const [isBookButtonActive, setIsBookButtonActive] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://apis.google.com/js/api.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        setIsBookButtonActive(!!borrowTime);
    }, [borrowTime]);

    const openOverlay = (item) => {
        setSelectedItem(item);
        setOverlayVisible(true);
        setBorrowTime('');
    };

    const closeOverlay = () => {
        setOverlayVisible(false);
    };

    return (
        <div className="admin-dashboard">
            <Sidebar />
            <section id="content">
                <Navbar className="navbar" />
                <main>
                    <div className="head-title">
                        <div className="left">
                            <h1>Notifications</h1>
                            <ul className="breadcrumb">
                                <li><a href="Notification.html">Notifications</a></li>
                                <li><i className="bx bx-chevron-right" /></li>
                                <li><a className="active" href="Mainpage.html">Home</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="table-data">
                        <div className="pending-requests">
                            <div className="head">
                                <h3>Notification Requests</h3>
                                <i className="bx bx-filter" />
                            </div>
                            <div className="order">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>User ID</th>
                                            <th>Description </th>
                                            <th>View</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="card">
                                                <img src="img/people.png" alt="User Image" />
                                                <p>220011</p>
                                            </td>
                                            <td>Would like to book an Item</td>
                                            <td>
                                                <a href>
                                                    <i className="bx bx-check" style={{fontSize: 24, color: '#36f465'}} />
                                                </a>
                                                <a href>
                                                    <i className="bx bxs-x-circle" style={{fontSize: 24, color: '#f44336'}} />
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="card">
                                                <img src="img/people.png" alt="User Image" />
                                                <p>220011</p>
                                            </td>
                                            <td>Would like to book an Item</td>
                                            <td>
                                                <a href>
                                                    <i className="bx bx-check" style={{fontSize: 24, color: '#36f465'}} />
                                                </a>
                                                <a href>
                                                    <i className="bx bxs-x-circle" style={{fontSize: 24, color: '#f44336'}} />
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="card">
                                                <img src="img/people.png" alt="User Image" />
                                                <p>220011</p>
                                            </td>
                                            <td>Would like to book an Item</td>
                                            <td>
                                                <a href>
                                                    <i className="bx bx-check" style={{fontSize: 24, color: '#36f465'}} />
                                                </a>
                                                <a href>
                                                    <i className="bx bxs-x-circle" style={{fontSize: 24, color: '#f44336'}} />
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="card">
                                                <img src="img/people.png" alt="User Image" />
                                                <p>220011</p>
                                            </td>
                                            <td>Would like to return an Item</td>
                                            <td>
                                                <a href>
                                                    <i className="bx bx-check" style={{fontSize: 24, color: '#36f465'}} />
                                                </a>
                                                <a href>
                                                    <i className="bx bxs-x-circle" style={{fontSize: 24, color: '#f44336'}} />
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="card">
                                                <img src="img/people.png" alt="User Image" />
                                                <p>220011</p>
                                            </td>
                                            <td>Would like to return an Item</td>
                                            <td>
                                                <a href>
                                                    <i className="bx bx-check" style={{fontSize: 24, color: '#36f465'}} />
                                                </a>
                                                <a href>
                                                    <i className="bx bxs-x-circle" style={{fontSize: 24, color: '#f44336'}} />
                                                </a>
                                            </td>
                                        </tr>
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

export default NotificationPage;
