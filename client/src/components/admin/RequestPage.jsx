import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";

const RequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [userIdToNameMap, setUserIdToNameMap] = useState({});
  const [itemIdToNameMap, setItemIdToNameMap] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (requests.length > 0) {
      fetchUsers();
      fetchItems();
    }
  }, [requests]);

  const fetchRequests = async () => {
    const token = sessionStorage.getItem("sessionToken");
    try {
      const response = await axios.get("http://localhost:3000/borrow/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchUsers = async () => {
    const token = sessionStorage.getItem("sessionToken");
    try {
      const response = await axios.get("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      console.log("Users:", response.data); // debug output

      // Map user IDs in requests to user names
      const userIdToNameMap = response.data.reduce((map, user) => {
        map[user._id] = user.name;
        return map;
      }, {});
      setUserIdToNameMap(userIdToNameMap);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchItems = async () => {
    const token = sessionStorage.getItem("sessionToken");
    try {
      const response = await axios.get("http://localhost:3000/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItems(response.data);

      // Map item IDs to item names
      const itemIdToNameMap = response.data.reduce((map, item) => {
        map[item._id] = item.name;
        return map;
      }, {});
      setItemIdToNameMap(itemIdToNameMap);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(`http://localhost:3000/requests/${requestId}`, {
        status: "approved",
      });
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.patch(`http://localhost:3000/requests/${requestId}`, {
        status: "rejected",
      });
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <section id="content">
        <AdminNavbar />
        <main>
          <div className="head-title">
            <h1>Requests</h1>
          </div>
          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>Pending Requests</h3>
              </div>
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Item Name</th>
                      <th>Borrow Date</th>
                      <th>Return Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length > 0 ? (
                      requests.map((request) => (
                        <tr key={request._id}>
                          <td>
                            {userIdToNameMap[request.userId] || "Unknown User"}
                          </td>
                          <td>
                            {itemIdToNameMap[request.item._id] ||
                              "Unknown Item"}
                          </td>
                          <td>{request.borrowDate}</td>
                          <td>{request.returnDate}</td>
                          <td>{request.status}</td>
                          <td>
                            <button onClick={() => handleApprove(request._id)}>
                              Approve
                            </button>
                            <button onClick={() => handleReject(request._id)}>
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6">No requests available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
};

export default RequestPage;
