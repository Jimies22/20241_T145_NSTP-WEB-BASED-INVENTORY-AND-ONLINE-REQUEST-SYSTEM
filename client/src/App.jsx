//src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/user/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/admin/AdminDashboard';
// import Sidebar from './components/Sidebar';
// import AdminDashboard from './components/UserDashboard';
// import RequestPage from './components/RequestPage';
// import EditPage from './components/EditPage';
// import NotificationPage from './components/NotificationPage';
// import ReportsPage from './components/ReportsPage';
// import RequestPage from './components/RequestPage';
import RequestPage from './components/admin/RequestPage';
import AddItems from './components/admin/AddItems';
import ReportsPage from './components/admin/ReportsPage';
import ArchivedPage from './components/admin/ArchivedPage';
import AdminActivityPage from './components/admin/AdminActivityPage';
import UserNotificationPage from './components/user/UserNotificationPage';
import AdminNotificationPage from './components/admin/AdminNotificationPage';
import UserRequestPage from './components/user/UserRequestPage';
import UserBorrowPage from './components/user/UserBorrowPage';
import UserReportPage from './components/user/UserReportPage';
import AddUser from './components/admin/AddUser';

function App() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get('http://localhost:3000/items');
            setItems(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching items:', error);
            setError('Failed to fetch items');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/user" element={<ProtectedRoute role="user"><UserDashboard items={items} fetchItems={fetchItems} loading={loading} error={error} /></ProtectedRoute>} />
                <Route path="/add" element={<AddItems fetchItems={fetchItems} />} />
                <Route path="/request" element={<RequestPage />} />
                <Route path="/user-request" element={<UserRequestPage />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/user-borrowed" element={<UserBorrowPage />} />
                <Route path="/user-report" element={<UserReportPage />} />
                <Route path="/reports" element={<ReportsPage/>} />
                <Route path="/archive" element={<ArchivedPage/>} />
                <Route path="/activity" element={<AdminActivityPage/>} />
                <Route path="/notification" element={<AdminNotificationPage/>} />
                <Route path="/usernotification" element={<UserNotificationPage/>} />
                <Route path="/users" element={<AddUser />} />
                {/* <Route path="/user" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} /> */}
                {/* <Route path="/request" element={<ProtectedRoute role="user"><Sidebar /></ProtectedRoute>} /> */}
            </Routes>
        </>
    );
}

export default App;