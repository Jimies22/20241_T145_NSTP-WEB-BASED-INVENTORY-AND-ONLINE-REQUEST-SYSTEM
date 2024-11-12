import React, { useState, useEffect } from "react";
import Sidebar from "../../components/userComponent/sidebar";
import Navbar from "../../components/userComponent/Navbar.jsx";
import ProjectorGrid from "../../components/userComponent/ProjectorGrid";
import BookingOverlay from "../../components/userComponent/BookingOverlay";
//import "./Dashboard.css";

function UserPage() {
  return (
    <div>
      <Navbar />
      {/* <BookingOverlay /> */}
      {/* <div>UserPage</div> */}
    </div>
  );
}

export default UserPage;
