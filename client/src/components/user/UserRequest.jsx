import React, { useState, useEffect } from "react";
import UserSidebar from "../sidebar/UserSidebar";
import Navbar from "../Navbar";
import ItemModal from "./ItemModal";
import "../../css/UserRequest.css";

const UserRequest = () => {
  const [isModalActive, setIsModalActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [userRequests, setUserRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const token = sessionStorage.getItem("sessionToken");
      try {
        const response = await fetch(
          "http://localhost:3000/borrow/my-requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log("Fetched requests:", data);
        setUserRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, []);

  const handleCancel = async (requestId) => {
    if (!requestId) {
      alert("Invalid request ID");
      return;
    }

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this request?"
    );

    if (confirmCancel) {
      try {
        const token = sessionStorage.getItem("sessionToken");

        const response = await fetch(
          `http://localhost:3000/borrow/${requestId}/cancel`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          // Revert UI if request fails
          setUserRequests((prevRequests) =>
            prevRequests.map((request) =>
              request._id === requestId
                ? { ...request, status: "pending" }
                : request
            )
          );
          throw new Error("Failed to cancel request");
        }

        alert("Request cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling request:", error);
        alert("Failed to cancel request. Please try again.");
      }
    }
  };

  return (
    <>
      <UserSidebar />
      <section id="content">
        <Navbar notificationCount={notificationCount} />
        <main>
          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>My Request History ({userRequests.length} requests)</h3>
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
                  <tbody>
                    {userRequests.map((request) => (
                      <tr key={request._id}>
                        <td>
                          <img src="/img/people.png" alt="User" />
                          <p>{request.item.name}</p>
                        </td>
                        <td>
                          <span
                            className={`status ${request.status.toLowerCase()}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="view-button"
                              onClick={() => {
                                setSelectedItem(request);
                                setIsModalActive(true);
                              }}
                            >
                              View
                            </button>
                            {request.status.toLowerCase() === "pending" && (
                              <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => handleCancel(request._id)}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </section>
      <ItemModal
        isActive={isModalActive}
        onClose={() => setIsModalActive(false)}
        item={selectedItem}
      />
    </>
  );
};

export default UserRequest;
