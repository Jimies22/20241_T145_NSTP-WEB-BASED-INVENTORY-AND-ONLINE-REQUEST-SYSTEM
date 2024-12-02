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

  const RequestDetails = ({ request }) => {
    const formatDateTime = (dateString) => {
      return dateString
        ? new Date(dateString).toLocaleString()
        : "Invalid Date"; // Format date and time
    };

    const formattedRequestDate = formatDateTime(request.requestDate); // Format request date
    const formattedBorrowDate = formatDateTime(request.borrowDate); // Format borrow date
    const formattedReturnDate = formatDateTime(request.returnDate); // Format return date

    return (
      <div>
        <h2>Request Details</h2>
        <p>Item Name: {request.itemName}</p>
        <p>Status: {request.status}</p>
        <p>Category: {request.category}</p>
        <p>Description: {request.description}</p>
        <p>Request Date: {formattedRequestDate}</p>
        <p>Borrow Date: {formattedBorrowDate}</p>
        <p>Return Date: {formattedReturnDate}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };

  // const handleCreateRequest = async () => {
  //   const requestData = {
  //     item: selectedItem._id,
  //     borrowDate: borrowDate, // Ensure this is set
  //     returnDate: returnDate, // Ensure this is set
  //     requestDate: new Date().toISOString(), // Set current date and time in ISO format
  //   };

  //   try {
  //     const response = await fetch("http://localhost:3000/borrow/create", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(requestData),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to create request");
  //     }

  //     const data = await response.json();
  //     console.log("Request created:", data);
  //     console.log("Request Date from Request:", requestDate);
  //     // Handle success (e.g., update state)
  //   } catch (error) {
  //     console.error("Error creating request:", error);
  //   }
  // };

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
