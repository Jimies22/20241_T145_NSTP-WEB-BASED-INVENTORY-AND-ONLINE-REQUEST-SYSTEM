import React from "react";
import { Link } from "react-router-dom";
import nstpLogo from "../assets/nstp_logo.png";

function Sidebar() {
  return (
    <section id="sidebar">
      <Link to="/" className="brand">
        <img src={nstpLogo} alt="Admin Logo" className="brand" />
        <span className="text">User</span>
      </Link>
      <ul className="side-menu top">
        <li>
          <Link to="#">
            <i className="bx bxs-dashboard"></i>
            <span className="text">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/request">
            <i className="bx bxs-shopping-bag-alt"></i>
            <span className="text">Request</span>
          </Link>
        </li>
        <li>
          <Link to="/borrowed">
            <i className="bx bxs-book"></i>
            <span className="text">Borrowed Items</span>
          </Link>
        </li>
        <li>
          <Link to="/reports">
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
}

export default Sidebar;
