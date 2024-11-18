import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../css/AdminSidebar.css";

function Sidebar() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <section id="sidebar" className={isSidebarVisible ? "" : "hide"}>
      <a href="#" className="brand">
        <img
          src="src/assets/NSTP_LOGO.png"
          alt="Admin Logo"
          className="brand"
        />
        <span className="text">Admin</span>
      </a>
      <button
        onClick={toggleSidebar}
        className="toggle-button"
        style={{ zIndex: 3000 }}
      >
        <i className={`bx ${isSidebarVisible ? "bx-x" : "bx-menu"}`}></i>
      </button>
      <ul className="side-menu top">
        <li className={location.pathname === "/Admin" ? "active" : ""}>
          <a href="/Admin">
            <i className="bx bxs-dashboard"></i>
            <span className="text">Dashboard</span>
          </a>
        </li>
        <li className={location.pathname === "/request" ? "active" : ""}>
          <Link to="/request">
            <i className="bx bxs-shopping-bag-alt"></i>
            <span className="text">Request</span>
          </Link>
        </li>
        <li className={location.pathname === "/edit" ? "active" : ""}>
          <Link to="/edit">
            <i className="bx bxs-message-square-add"></i>
            <span className="text">Edit Items</span>
          </Link>
        </li>
        <li className={location.pathname === "/reports" ? "active" : ""}>
          <a href="/reports">
            <i className="bx bxs-report"></i>
            <span className="text">Reports</span>
          </a>
        </li>
        <li className={location.pathname === "/archive" ? "active" : ""}>
          <a href="/archive">
            <i className="bx bxs-archive"></i>
            <span className="text">Archive</span>
          </a>
        </li>
        <li className={location.pathname === "/activity" ? "active" : ""}>
          <a href="/activity">
            <i className="bx bx-history"></i>
            <span className="text">Activity</span>
          </a>
        </li>
      </ul>
      <ul className="side-menu">
        <li>
          <a href="../login/login.html" className="logout">
            <i className="bx bxs-log-out-circle"></i>
            <span className="text">Logout</span>
          </a>
        </li>
      </ul>
    </section>
  );
}

export default Sidebar;
