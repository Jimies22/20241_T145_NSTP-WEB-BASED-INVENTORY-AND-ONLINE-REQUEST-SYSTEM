import React from 'react';
import Navbar from '../Navbar';
import Sidebar from '../sidebar/AdminSidebar';
import '../../css/ActivityPage.css';

const ActivityPage = () => {
    return (
        <div className="user-dashboard">
            <Sidebar />
            <section id="content">
                <Navbar />
                <main>
                    <div className="head-title">
                        <div className="left">
                            <h1>Activity Log</h1>
                            <ul className="breadcrumb">
                                <li>
                                    <a href="#">Dashboard</a>
                                </li>
                                <li><i className="bx bx-chevron-right" /></li>
                                <li>
                                    <a className="active" href="#">Activity Log</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="activity-log-container">
                        <div className="table-data">
                            <div className="order">
                                <div className="head">
                                    <h3>Activity Logs</h3>
                                    <div className="filter-container">
                                        <select id="userFilter">
                                            <option value="all">All Users</option>
                                            <option value="admin">Admin Only</option>
                                            <option value="user">Users Only</option>
                                        </select>
                                        <select id="actionFilter">
                                            <option value="all">All Actions</option>
                                            <option value="login">Login/Logout</option>
                                            <option value="inventory">Inventory</option>
                                            <option value="requests">Requests</option>
                                        </select>
                                    </div>
                                </div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Action</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>2024-03-20 09:30:15</td>
                                            <td>Jim Joshua Boquil</td>
                                            <td><span className="status admin">Admin</span></td>
                                            <td>Added Item</td>
                                            <td>Added new projector: Model XYZ123</td>
                                        </tr>
                                        <tr>
                                            <td>2024-03-20 09:45:22</td>
                                            <td>Jan Steven Butaya</td>
                                            <td><span className="status user">User</span></td>
                                            <td>Borrowed Item</td>
                                            <td>Borrowed projector XYZ123</td>
                                        </tr>
                                        <tr>
                                            <td>2024-03-20 11:00:00</td>
                                            <td>Jim Joshua Boquil</td>
                                            <td><span className="status admin">Admin</span></td>
                                            <td>Archived Item</td>
                                            <td>Archived old projector GHI789</td>
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
};

export default ActivityPage;