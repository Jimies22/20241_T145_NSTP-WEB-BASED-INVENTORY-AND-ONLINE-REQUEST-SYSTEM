import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// import "";

function FilterMenu({ show, onToggle, selectedFilters, onFilterChange }) {
  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      onFilterChange([...selectedFilters, value]);
    } else {
      onFilterChange(selectedFilters.filter((filter) => filter !== value));
    }
  };

  return (
    <div className="filter-dropdown">
      <i className="bx bx-filter" onClick={onToggle}></i>
      <div className={`filter-menu ${show ? "active" : ""}`}>
        <label>
          <input
            type="checkbox"
            value="available"
            checked={selectedFilters.includes("available")}
            onChange={handleFilterChange}
          />{" "}
          Available
        </label>
        <label>
          <input
            type="checkbox"
            value="borrowed"
            checked={selectedFilters.includes("borrowed")}
            onChange={handleFilterChange}
          />{" "}
          Borrowed
        </label>
        <label>
          <input
            type="checkbox"
            value="maintenance"
            checked={selectedFilters.includes("maintenance")}
            onChange={handleFilterChange}
          />{" "}
          Maintenance
        </label>
      </div>
    </div>
  );
}

export default FilterMenu;
