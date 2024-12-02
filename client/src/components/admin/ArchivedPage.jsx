import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "../../css/ArchivePage.css";

const ArchivedPage = () => {
  const [archivedItems, setArchivedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchArchivedItems = async () => {
      try {
        const response = await axios.get("http://localhost:3000/items");
        const archived = response.data.filter((item) => item.isArchived);
        setArchivedItems(archived);
      } catch (error) {
        setError("Error fetching archived items");
      }
    };

    fetchArchivedItems();
  }, []);

  return (
    <div className="user-dashboard">
      <Sidebar />
      <section id="content">
        <AdminNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Archived Items</h1>
            </div>
          </div>

          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="table-data">
            <DataTable
              columns={itemColumns}
              data={archivedItems}
              // pagination
              responsive
              highlightOnHover
              pointerOnHover
              progressPending={loadingItems}
              progressComponent={<div>Loading archived items...</div>}
              customStyles={customStyles}
              noDataComponent={
                <div className="no-data">No archived items found</div>
              }
            />
          </div>
        </main>
      </section>
    </div>
  );
};

export default ArchivedPage;
