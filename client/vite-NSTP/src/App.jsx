import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Login from "./pages/login.jsx";

function App() {
  console.log("App is rendering");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
