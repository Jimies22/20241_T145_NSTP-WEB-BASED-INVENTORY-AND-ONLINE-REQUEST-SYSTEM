import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../sidebar/UserSidebar";
import Navbar from "../Navbar";
import "../../css/UserDashboard.css";
// Import or define these components
import ProjectorGrid from "./ProjectorGrid";
import BorrowOverlay from "./BorrowOverlay";

function UserDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState(["available"]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("sessionToken");
    if (!token) {
      navigate("/login");
    } else {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        sessionStorage.removeItem("sessionToken");
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("sessionToken");
    navigate("/login");
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
  };

  const openOverlay = (item) => {
    setSelectedItem(item);
    setOverlayVisible(true);
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
    setSelectedItem(null);
  };

  return (
    <div className="admin-dashboard">
      <header>
        <link
          href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css"
          rel="stylesheet"
        />
        <title>User Dashboard</title>
      </header>

      <UserSidebar />

      <section id="content">
        <Navbar onSearch={handleSearch} />
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
                <li>
                  <div className="filter-dropdown">
                    <i
                      className="bx bx-filter"
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                    />
                    {showFilterMenu && (
                      <div id="filterMenu" className="filter-menu">
                        <label>
                          <input
                            type="checkbox"
                            value="available"
                            checked={selectedFilters.includes("available")}
                            onChange={(e) => {
                              const newFilters = e.target.checked
                                ? [...selectedFilters, "available"]
                                : selectedFilters.filter(
                                    (f) => f !== "available"
                                  );
                              handleFilterChange(newFilters);
                            }}
                          />{" "}
                          Available
                        </label>
                        {/* Add more filter options */}
                      </div>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="table-data">
            <div className="order">
              <ProjectorGrid
                searchTerm={searchTerm}
                selectedFilters={selectedFilters}
                onItemClick={openOverlay}
              />
            </div>
          </div>
        </main>
      </section>

      {overlayVisible && (
        <BorrowOverlay item={selectedItem} onClose={closeOverlay} />
      )}
    </div>
  );
}

export default UserDashboard;
