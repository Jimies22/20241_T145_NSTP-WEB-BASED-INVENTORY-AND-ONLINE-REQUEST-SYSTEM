import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../css/UserRequest.css';  // Updated path

// Import components
import UserSidebar from '../sidebar/UserSidebar';  // Updated import
import Navbar from '../Navbar';
import ItemModal from './ItemModal';

const UserRequest = () => {  // Renamed component
  const [isModalActive, setIsModalActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // ... existing useEffect code ...

  const handleViewClick = (item) => {
    setSelectedItem({
      itemId: '12345',
      itemName: 'Epson 705HD Powerlite Home Cinema LCD Projector',
      borrowerName: 'John Doe',
      borrowerId: '67890',
      itemDescription: 'High-quality projector for home cinema',
      itemDateTime: '2024-06-11 11:54:30',
      requestAccepted: '2024-06-10 10:00:00',
      itemReturned: '2024-06-12 15:00:00'
    });
    setIsModalActive(true);
  };

  return (
    <>
     <UserSidebar />  {/* Updated to UserSidebar */}
      <section id="content">
      
        <Navbar notificationCount={notificationCount} />
        
        <main>
          <div className="head-title">
            <div className="left">
              <h1>My Requests</h1>  {/* Updated title */}
              <ul className="breadcrumb">
                <li><Link to="#">Requests</Link></li>
                <li><i className='bx bx-chevron-right'></i></li>
                <li><Link to="/dashboard" className="active">Home</Link></li>
              </ul>
            </div>
          </div>

          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>My Request History</h3>  {/* Updated heading */}
                <i className='bx bx-filter'></i>
              </div>
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <img src="/img/people.png" alt="User" />
                        <p>Epson 705HD Powerlite Home Cinema LCD Projector</p>
                      </td>
                      <td><span className="status R1">Pending</span></td>  {/* Updated status */}
                      <td>
                        <a href="#" className="view-button" onClick={(e) => {
                          e.preventDefault();
                          handleViewClick();
                        }}>
                          <span className="status R2">view</span>
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

      <ItemModal 
        isActive={isModalActive}
        onClose={() => setIsModalActive(false)}
        item={selectedItem}
      />
    </>
  );
};

export default UserRequest;  // Updated export name 