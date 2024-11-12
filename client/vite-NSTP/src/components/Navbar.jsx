import React, { useState } from "react";
import { Link } from "react-router-dom";
import FilterMenu from "./FilterMenu";
import NotificationBadge from "./NotificationBadge";
import ThemeToggle from "./ThemeToggle";

function Navbar({ onSearch, onFilterChange, selectedFilters }) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <nav>
      <i className="bx bx-menu"></i>
      <a href="#" className="nav-link">
        Categories
      </a>

      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <input
            type="search"
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <i className="bx bx-search"></i>
          </button>
        </div>
      </form>

      <ThemeToggle />
      <NotificationBadge />

      <Link to="/profile" className="profile">
        <img src="/img/profile.webp" alt="Profile" />
      </Link>

      <FilterMenu
        show={showFilterMenu}
        onToggle={() => setShowFilterMenu(!showFilterMenu)}
        selectedFilters={selectedFilters}
        onFilterChange={onFilterChange}
      />
    </nav>
  );
}

export default Navbar;
