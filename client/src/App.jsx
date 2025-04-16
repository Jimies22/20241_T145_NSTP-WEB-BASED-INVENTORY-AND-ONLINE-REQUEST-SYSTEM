//src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/user/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import RequestPage from './components/admin/RequestPage';
import AddItems from './components/admin/AddItems';
import ReportsPage from './components/admin/ReportsPage';
import ArchivedPage from './components/admin/ArchivedPage';
import AdminActivityPage from './components/admin/AdminActivityPage';
import AdminNotificationPage from './components/admin/AdminNotificationPage';
import AddUser from './components/admin/AddUser';
import ArchivedUsersPage from './components/admin/ArchivedUsersPage';
import RequestReturnPage from './components/admin/RequestReturnPage';
import RequestRejectedPage from './components/admin/RequestRejectedPage';
import RequestCancelledPage from './components/admin/RequestCancelledPage';
import ArchivedRequestsPage from './components/admin/ArchivedRequestsPage';
import UserNotificationPage from './components/user/UserNotificationPage';
import UserRequestPage from './components/user/UserRequestPage';
import UserRequestPending from './components/user/UserRequestPending';
import UserRequestCancelled from './components/user/UserRequestCancelled';
import UserRequestRejected from './components/user/UserRequestRejected';
import UserBorrowPage from './components/user/UserBorrowPage';
import UserReportPage from './components/user/UserReportPage';

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
                {/* Admin Routes */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/add" element={<ProtectedRoute role="admin"><AddItems fetchItems={fetchItems} /></ProtectedRoute>} />
                <Route path="/request" element={<ProtectedRoute role="admin"><RequestPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute role="admin"><ReportsPage /></ProtectedRoute>} />
                <Route path="/archive" element={<ProtectedRoute role="admin"><ArchivedPage /></ProtectedRoute>} />
                <Route path="/admin/archived-users" element={<ProtectedRoute role="admin"><ArchivedUsersPage /></ProtectedRoute>} />
                <Route path="/activity" element={<ProtectedRoute role="admin"><AdminActivityPage /></ProtectedRoute>} />
                <Route path="/notification" element={<ProtectedRoute role="admin"><AdminNotificationPage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute role="admin"><AddUser /></ProtectedRoute>} />
                <Route path="/request/return" element={<ProtectedRoute role="admin"><RequestReturnPage /></ProtectedRoute>} />
                <Route path="/request/rejected" element={<ProtectedRoute role="admin"><RequestRejectedPage /></ProtectedRoute>} />
                <Route path="/request/cancelled" element={<ProtectedRoute role="admin"><RequestCancelledPage /></ProtectedRoute>} />
                <Route path="/admin/activities" element={<ProtectedRoute role="admin"><AdminActivityPage /></ProtectedRoute>} />
                <Route path="/admin/archived-requests" element={<ProtectedRoute role="admin"><ArchivedRequestsPage /></ProtectedRoute>} />
                <Route path="/admin/requests/rejected" element={<ProtectedRoute role="admin"><RequestRejectedPage /></ProtectedRoute>} />
                <Route path="/admin/requests/cancelled" element={<ProtectedRoute role="admin"><RequestCancelledPage /></ProtectedRoute>} />

                {/* User Routes */}
                <Route path="/user" element={<ProtectedRoute role="user"><UserDashboard items={items} fetchItems={fetchItems} loading={loading} error={error} /></ProtectedRoute>} />
                <Route path="/user-request" element={<ProtectedRoute role="user"><UserRequestPage /></ProtectedRoute>} />
                <Route path="/user-request/pending" element={<ProtectedRoute role="user"><UserRequestPending /></ProtectedRoute>} />
                <Route path="/user-request/cancelled" element={<ProtectedRoute role="user"><UserRequestCancelled /></ProtectedRoute>} />
                <Route path="/user-request/rejected" element={<ProtectedRoute role="user"><UserRequestRejected /></ProtectedRoute>} />
                <Route path="/user-dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
                <Route path="/user-borrowed" element={<ProtectedRoute role="user"><UserBorrowPage /></ProtectedRoute>} />
                <Route path="/user-report" element={<ProtectedRoute role="user"><UserReportPage /></ProtectedRoute>} />
                <Route path="/usernotification" element={<UserNotificationPage />} />
            </Routes>
        </>
    );
}

export default App;
