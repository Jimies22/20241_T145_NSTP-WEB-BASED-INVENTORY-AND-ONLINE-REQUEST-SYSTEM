import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../sidebar/UserSidebar';
import UserNavbar from '../Navbar/UserNavbar';
import '../../css/UserDashboard.css';
import axios from 'axios';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem('sessionToken');
        if (!token) {
            navigate('/login');
        } else {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedToken.exp < currentTime) {
                sessionStorage.removeItem('sessionToken');
                navigate('/login');
            }
        }
    }, [navigate]);

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

    const updateItem = (updatedItem) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.item_id === updatedItem.item_id ? updatedItem : item
            )
        );
    };

    return (
        <div className="user-dashboard">
            <UserSidebar />
            <section id="content">
                <UserNavbar />
                <main>
                    <div className="head-title">
                        <div className="left">
                            <h1>Dashboard</h1>
                        </div>
                    </div>

                    <div className="card-container">
                        {loading ? (
                            <p>Loading items...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            items.map(item => (
                                <div className="card" key={item.item_id}>
                                    <div className="card-image">
                                        <img src={item.image || '/path/to/default/image.jpg'} alt={item.name} />
                                    </div>
                                    <div className="card-content">
                                        <h3>{item.name}</h3>
                                        <p className="availability">{item.availability ? 'AVAILABLE' : 'UNAVAILABLE'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </section>
        </div>
    );
};

export default UserDashboard;