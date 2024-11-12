import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import FilterMenu from "./FilterMenu";
import NotificationBadge from "./NotificationBadge";
import ThemeToggle from "./ThemeToggle";

function Navbar({ onSearch, onFilterChange, selectedFilters }) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  // };

  return (
    // <nav>
    //   <i className="bx bx-menu"></i>
    //   <a href="#" className="nav-link">
    //     Categories
    //   </a>

    //   <form onSubmit={handleSubmit}>
    //     <div className="form-input">
    //       <input
    //         type="search"
    //         placeholder="Search..."
    //         onChange={(e) => onSearch(e.target.value)}
    //       />
    //       <button type="submit" className="search-btn">
    //         <i className="bx bx-search"></i>
    //       </button>
    //     </div>
    //   </form>

    //   <ThemeToggle />
    //   <NotificationBadge />

    //   <Link to="/profile" className="profile">
    //     <img src="/img/profile.webp" alt="Profile" />
    //   </Link>

    //   <FilterMenu
    //     show={showFilterMenu}
    //     onToggle={() => setShowFilterMenu(!showFilterMenu)}
    //     selectedFilters={selectedFilters}
    //     onFilterChange={onFilterChange}
    //   />
    // </nav>

    <nav className="navbar">
      <i class="bx bx-menu"></i>
      <a href="#" class="nav-link">
        Categories
      </a>
      <form action="#">
        <div class="form-input">
          <input type="search" placeholder="Search..." />
          <button type="submit" class="search-btn">
            <i class="bx bx-search"></i>
          </button>
        </div>
      </form>
      <input type="checkbox" id="switch-mode" hidden />
      <label for="switch-mode" class="switch-mode"></label>
      <a href="Notification.html" class="notification">
        <i class="bx bxs-bell"></i>
        <span class="num">8</span>
      </a>
      <a href="AdminProfile.html" class="profile">
        <img src="img/Screen-Shot-2024-06-11-at-11.54.30-AM-e1718634535872.webp" />
      </a>
    </nav>
  );
}

export default Navbar;
