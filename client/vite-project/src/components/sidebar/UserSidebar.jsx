import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../css/UserSidebar.css";

const Sidebar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const location = useLocation();

  // Function to check if a path is active
  const isActive = (path) => {
    return location.pathname === `/user${path}`;
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <section id="sidebar" className={isSidebarVisible ? "" : "hide"}>
      <Link to="/" className="brand">
        <img src="src/assets/NSTP_LOGO.png" alt="User Logo" className="brand" />
        <span className="text">User</span>
      </Link>
      <button
        onClick={toggleSidebar}
        className="toggle-button"
        style={{ zIndex: 3000 }}
      >
        <i className={`bx ${isSidebarVisible ? "bx-x" : "bx-menu"}`}></i>
      </button>
      <ul className="side-menu top">
        <li className={isActive("/user-dashboard") ? "active" : ""}>
          <Link to="/user-dashboard">
            <i className="bx bxs-dashboard"></i>
            <span className="text">Dashboard</span>
          </Link>
        </li>
        <li className={isActive("/user-request") ? "active" : ""}>
          <Link to="/user-request">
            <i className="bx bxs-shopping-bag-alt"></i>
            <span className="text">Request</span>
          </Link>
        </li>
        <li className={isActive("/user-borrowed") ? "active" : ""}>
          <Link to="/user-borrowed">
            <i className="bx bxs-book"></i>
            <span className="text">Borrowed Items</span>
          </Link>
        </li>
        <li className={isActive("/user-report") ? "active" : ""}>
          <Link to="/user-report">
            <i className="bx bxs-report"></i>
            <span className="text">Reports</span>
          </Link>
        </li>
      </ul>
      <ul className="side-menu">
        <li>
          <Link to="/login" className="logout">
            <i className="bx bxs-log-out-circle"></i>
            <span className="text">Logout</span>
          </Link>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;
