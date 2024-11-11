import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ProjectorGrid from "../../components/ProjectorGrid";
import BookingOverlay from "../../components/BookingOverlay";
//import "./Dashboard.css";

function UserPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState(["available"]);

  const handleOpenOverlay = (item) => {
    setSelectedItem(item);
    setShowOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setSelectedItem(null);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
  };

  return (
    <>
      <Sidebar />
      <section id="content">
        <Navbar
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          selectedFilters={selectedFilters}
        />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Dashboard</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Dashboard</a>
                </li>
                <li>
                  <i className="bx bx-chevron-right"></i>
                </li>
                <li>
                  <a className="active" href="#">
                    All Items
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="order">
            <ProjectorGrid
              searchTerm={searchTerm}
              selectedFilters={selectedFilters}
              onItemClick={handleOpenOverlay}
            />
          </div>
        </main>
      </section>

      {showOverlay && (
        <BookingOverlay item={selectedItem} onClose={handleCloseOverlay} />
      )}
    </>
  );
}

export default UserPage;
