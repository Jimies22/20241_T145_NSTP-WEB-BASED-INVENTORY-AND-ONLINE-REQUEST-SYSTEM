// src/components/ReportsPage.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import Navbar from "../Navbar";
import "../../css/ReportsPage.css";

function ReportsPage() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState({
    title: "",
    image: "",
    status: "",
  });
  const [borrowTime, setBorrowTime] = useState("");
  const [isBookButtonActive, setIsBookButtonActive] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
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
    setBorrowTime("");
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
  };

  return (
    <div className="reports-page">
      <Sidebar />
      <section id="content">
        <Navbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Reports</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Reports</a>
                </li>
                <li>
                  <i className="bx bx-chevron-right" />
                </li>
                <li>
                  <a className="active" href="#">
                    Current Reports
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>Generated Reports</h3>
                <i className="bx bx-filter" />
              </div>
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Example row */}
                    <tr>
                      <td>
                        <img src="img/people.png" alt="User Image" />
                        <p>Epson 705HD Powerlite Home Cinema LCD Projector</p>
                      </td>
                      <td>
                        <span className="status R1">Returned</span>
                      </td>
                    </tr>
                    {/* Add more rows as needed */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </section>

      {overlayVisible && (
        <div className="overlay" id="borrowOverlay">
          <div className="overlay-content">
            <span className="close-btn" onClick={closeOverlay}>
              &times;
            </span>
            <h2>{selectedItem.title}</h2>
            <img
              id="selectedItemImage"
              src={selectedItem.image}
              alt={selectedItem.title}
            />
            <p id="selectedItemName">{selectedItem.title}</p>
            <input
              type="time"
              id="borrowTime"
              value={borrowTime}
              onChange={(e) => setBorrowTime(e.target.value)}
            />
            <button
              id="bookButton"
              disabled={!isBookButtonActive}
              className={isBookButtonActive ? "active" : ""}
            >
              Book
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
