import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/UserSidebar";
import UserNavbar from "../navbar/UserNavbar"; // Fixed casing in import path
import BorrowOverlay from "./BorrowOverlay"; // Import the modal
import "../../css/Navbar.css";
import "../../css/RequestPage.css";

function UserBorrowPage() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState({
    title: "",
    image: "",
    status: "",
  });

  const openOverlay = (item) => {
    setSelectedItem(item);
    setOverlayVisible(true);
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
  };

  return (
    <div className="user-dashboard">
      <Sidebar />
      <section id="content">
        <UserNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Borrowed</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Borrowed</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>Borrowed Items</h3>
                <i className="bx bx-filter" />
              </div>
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="requested-items-list">
                    {/* Dynamically render rows here */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
        {overlayVisible && (
          <BorrowOverlay
            item={selectedItem}
            onClose={closeOverlay}
            updateItem={(updatedItem) => {
              console.log("Updated Item:", updatedItem);
            }}
          />
        )}
      </section>
    </div>
  );
}

export default UserBorrowPage;
