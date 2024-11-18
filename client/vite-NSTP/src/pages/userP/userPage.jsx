import React, { useState, useEffect } from "react";
import Sidebar from "../../components/userComponent/Sidebar";
import Navbar from "../../components/userComponent/Navbar";
import ProjectorGrid from "../../components/userComponent/ProjectorGrid";
import BookingOverlay from "../../components/userComponent/BookingOverlay";
import Dashboard from "../../components/Dashboard";

function UserPage() {
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

          <Dashboard />
        </main>
      </section>

      {showOverlay && (
        <BookingOverlay item={selectedItem} onClose={handleCloseOverlay} />
      )}
    </>
  );
}

export default UserPage;
