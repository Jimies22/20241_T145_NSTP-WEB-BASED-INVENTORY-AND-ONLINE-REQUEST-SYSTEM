import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import Swal from "sweetalert2";
import QRScanner from "./QRScanner";
import { Html5QrcodeScanner } from 'html5-qrcode';

const RequestReturnPage = () => {
  const [requests, setRequests] = useState([]);
  const [userIdToNameMap, setUserIdToNameMap] = useState({});
  const [itemIdToNameMap, setItemIdToNameMap] = useState({});
  const [sidebarState, setSidebarState] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);

  const toggleSidebar = () => {
    setSidebarState(sidebarState === "" ? "hide" : "");
  };

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
      // Filter for approved requests only
      const approvedRequests = response.data
        .filter(request => request.status.toLowerCase() === 'approved')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(approvedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.status === 401
          ? "Unauthorized access. Please log in again."
          : "Error fetching request",
        icon: "error",
      });
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
      console.log("Users:", response.data); // debug output

      const userIdToNameMap = response.data.reduce((map, user) => {
        map[user._id] = user.name;
        return map;
      }, {});
      setUserIdToNameMap(userIdToNameMap);
      console.log("User ID to Name Map:", userIdToNameMap); // debug output
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
      const itemIdToNameMap = response.data.reduce((map, item) => {
        map[item._id] = item.name;
        return map;
      }, {});
      setItemIdToNameMap(itemIdToNameMap);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      
      // Verify the QR code matches the item being returned
      if (decodedText !== currentRequest.item._id) {
        throw new Error("QR code doesn't match the item being returned");
      }

      // Update the request status to 'returned'
      await axios.put(
        `http://localhost:3000/borrow/${currentRequest._id}/return`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowScanner(false);
      Swal.fire({
        title: 'Success!',
        text: 'Item has been successfully returned',
        icon: 'success',
      });
      
      // Refresh the requests list
      fetchRequests();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to process return',
        icon: 'error',
      });
    }
  };

  const handleScanError = (error) => {
    console.error(error);
  };

  const handleScanClick = (request) => {
    setCurrentRequest(request);
    Swal.fire({
      title: 'Scan QR Code',
      html: '<div id="reader"></div>',
      showCancelButton: true,
      showConfirmButton: false,
      didOpen: () => {
        const scanner = new Html5QrcodeScanner('reader', {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 5,
        });

        scanner.render(
          (decodedText) => {
            handleScanSuccess(decodedText);
            scanner.clear();
            Swal.close();
          },
          (error) => {
            handleScanError(error);
          }
        );
      },
      willClose: () => {
        const scanner = document.getElementById('reader');
        if (scanner) {
          while (scanner.firstChild) {
            scanner.removeChild(scanner.firstChild);
          }
        }
      }
    });
  };

  const buttonStyles = `
    .scan-return-btn {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .scan-return-btn:hover {
      background-color: #0056b3;
    }
  `;

  return (
    <>
      <style>{buttonStyles}</style>
      <div className={`admin-dashboard ${sidebarState}`}>
        <Sidebar sidebarState={sidebarState} />
        <section id="content">
          <AdminNavbar toggleSidebar={toggleSidebar} />
          <main>
            <div className="head-title">
              <div className="left">
                <h1>Requests</h1>
                <ul className="breadcrumb">
                  <li><a href="#">Return</a></li>
                  <li><i className="bx bx-chevron-right"></i></li>
                  <li><a className="active" href="/request/cancelled"> Cancelled </a></li>
                  <li><i className="bx bx-chevron-right"></i></li>
                  <li><a className="active" href="/request/rejected"> Rejected </a></li>
                  <li><i className="bx bx-chevron-right"></i></li>
                  <li><a className="active" href="/request"> Pending </a></li>
                  <li><i className="bx bx-chevron-right"></i></li>
                  <li><a className="active" href="/admin"> Home </a></li>
                </ul>
              </div>
            </div>
            <div className="table-data">
              <div className="pending-requests">
                <div className="head">
                  
                </div>
                <div className="order">
                  <div className="table-container" style={{ overflowY: 'auto', maxHeight: '490px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                        <tr>
                          <th>User Name</th>
                          <th>Item Name</th>
                          <th>Borrow Date</th>
                          <th>Return Date</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'center' }}>Actions</th> {/* Center the Actions header */}
                        </tr>
                      </thead>
                      <tbody>
                        {requests.length > 0 ? (
                          requests.map((request) => (
                            <tr key={request._id}>
                              <td>{request.userId.name || "Unknown User"}</td>
                              <td>
                                {itemIdToNameMap[request.item?._id] ||
                                  "Unknown Item"}
                              </td>{" "}
                              {/* Added optional chaining */}
                              <td>
                                {new Date(
                                  request.borrowDate
                                ).toLocaleDateString()}
                              </td>
                              <td>
                                {new Date(
                                  request.returnDate
                                ).toLocaleDateString()}
                              </td>
                              <td>
                                <span
                                  className={`status ${request.status.toLowerCase()}`}
                                >
                                  {request.status}
                                </span>
                              </td>
                              <td>
                                <div className="actions">
                                  <button
                                    className="scan-return-btn"
                                    onClick={() => handleScanClick(request)}
                                  >
                                    <i className="bx bx-qr-scan"></i>
                                    Scan to Return
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="no-requests">
                              <i
                                className="bx bx-package"
                                style={{
                                  fontSize: "2rem",
                                  marginBottom: "10px",
                                }}
                              ></i>
                              <p>No pending requests available</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </section>
      </div>
    </>
  );
};

export default RequestReturnPage;
