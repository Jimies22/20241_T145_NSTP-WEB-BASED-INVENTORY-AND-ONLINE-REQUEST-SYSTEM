import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/UserSidebar"; // Ensure the correct path
import Navbar from "../Navbar"; // Ensure the correct path
import "../../css/Navbar.css";
import "../../css/RequestPage.css";

function UserBorrowPage() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState({
    title: "",
    image: "",
    status: "",
  });
  const [borrowTime, setBorrowTime] = useState("");
  const [isBookButtonActive, setIsBookButtonActive] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    setIsBookButtonActive(!!borrowTime);
  }, [borrowTime]);

  const openOverlay = (item) => {
    setSelectedItem(item);
    setOverlayVisible(true);
    setBorrowTime("");
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
  };

  return (
    <div className="user-dashboard">
      <Sidebar />
      <section id="content">
        <Navbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Reports</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Reports</a>
                </li>
                {/* <li><i className="bx bx-chevron-right" /></li> */}
                {/* <li>
              <a className="active" href="Canceled.html"></a>
            </li> */}
              </ul>
            </div>
            {/* <a href="#" class="btn-download">
						<i class='bx bxs-cloud-download' ></i>
						<span class="text">Download PDF</span>
					</a> */}
          </div>
          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>Generated Reports</h3>
                <i className="bx bx-filter" />
              </div>
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="requested-items-list">
                    {/* Items will be inserted here dynamically */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default UserBorrowPage;
