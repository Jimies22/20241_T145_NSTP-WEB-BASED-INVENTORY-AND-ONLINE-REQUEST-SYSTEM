import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar/UserSidebar';
import UserNavbar from '../Navbar/UserNavbar';
import axios from 'axios';
import '../../css/Navbar.css';
import '../../css/RequestPage.css';

function UserReportPage() {
  const [returnedItems, setReturnedItems] = useState([]);

  useEffect(() => {
    console.log('Component mounted');
    fetchReturnedItems();
  }, []);

  useEffect(() => {
    console.log('Returned items updated:', returnedItems);
  }, [returnedItems]);

  const fetchReturnedItems = async () => {
    const token = sessionStorage.getItem('sessionToken');
    const userId = sessionStorage.getItem('userId');
    
    if (!token || !userId) {
      console.error('Missing token or userId');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/borrow/user/${userId}/returned`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReturnedItems(response.data);
    } catch (error) {
      console.error('Error fetching returned items:', error);
    }
  };

  return (
    <div className="user-dashboard">
      <Sidebar />
      <section id="content">
        <UserNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Reports</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Reports</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>Returned Items History</h3>
                <i className="bx bx-filter" />
              </div>
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Borrow Date</th>
                      <th>Return Date</th>
                      <th>Status</th>
                      <th>Return Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnedItems.length > 0 ? (
                      returnedItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.item?.name}</td>
                          <td>{new Date(item.borrowDate).toLocaleDateString()}</td>
                          <td>{new Date(item.returnDate).toLocaleDateString()}</td>
                          <td>{item.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-requests">
                          <i className="bx bx-package" style={{ fontSize: "2rem", marginBottom: "10px" }}></i>
                          <p>No returned items history</p>
                        </td>
                      </tr>
                    )}
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

export default UserReportPage;