import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import axios from "axios";
import "../../css/Navbar.css";
import "../../css/RequestPage.css";
import Swal from "sweetalert2";
import QRScanner from "./QRScanner";
import { Html5QrcodeScanner } from 'html5-qrcode';
import 'animate.css';
import '../../css/SweetAlert.css';

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
      // Show both approved and returned requests
      const filteredRequests = response.data
        .filter(request => 
          request.status.toLowerCase() === 'approved' || 
          request.status.toLowerCase() === 'returned'
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(filteredRequests);
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
      console.log('Scanned QR Code:', decodedText);
      console.log('Current Request:', currentRequest);

      if (!currentRequest) {
        Swal.fire({
          title: 'Error!',
          text: 'No active return request selected',
          icon: 'error',
          confirmButtonColor: '#d33',
        });
        return;
      }

      // Trim any whitespace and ensure consistent case
      const scannedCode = decodedText.trim();
      const itemId = currentRequest.item._id.trim();

      if (scannedCode === itemId) {
        const token = sessionStorage.getItem("sessionToken");
        
        try {
          // Update request status to returned
          const updateResponse = await axios.put(
            `http://localhost:3000/borrow/${currentRequest._id}/return`,
            {
              returnDate: new Date(),
              status: 'RETURNED'
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log('Update response:', updateResponse.data);

          // Update item availability
          await axios.patch(
            `http://localhost:3000/items/${currentRequest.item._id}/availability`,
            { availability: true },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Show success message
          await Swal.fire({
            title: 'Return Successful!',
            html: `
              <div style="text-align: left;">
                <p><strong>Item:</strong> ${currentRequest.item.name}</p>
                <p><strong>Borrower:</strong> ${currentRequest.userId.name}</p>
                <p><strong>Status:</strong> Returned</p>
              </div>
            `,
            icon: 'success',
            confirmButtonText: 'Done',
            confirmButtonColor: '#28a745',
            timer: 5000,
            timerProgressBar: true,
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          });

          // Play success sound
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2220/2220-preview.mp3');
          await audio.play();

          // Refresh the requests list
          await fetchRequests();

          // Close the scanner
          setShowScanner(false);

        } catch (error) {
          console.error('Error updating status:', error);
          Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to update status',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        }
      } else {
        // Enhanced mismatch error message
        Swal.fire({
          title: 'QR Code Mismatch!',
          html: `
            <div style="text-align: left;">
              <p><strong>Expected Item:</strong> ${currentRequest.item.name}</p>
              <p><strong>Scanned QR Code:</strong> does not match the requested item</p>
              <p style="color: #d33; margin-top: 10px;">Please ensure you are scanning the correct item's QR code.</p>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#d33',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          showClass: {
            popup: 'animate__animated animate__shakeX'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOut'
          },
          timer: null,
          allowOutsideClick: false,
          allowEscapeKey: false,
          footer: '<i class="bx bx-info-circle"></i> Make sure the QR code belongs to the selected item',
          didOpen: (popup) => {
            popup.querySelector('.swal2-icon').classList.add('animate__animated', 'animate__pulse', 'animate__infinite')
          }
        }).then((result) => {
          if (result.isConfirmed) {
            // Restart scanning process
            handleScanClick(currentRequest);
          } else {
            // Close scanner and reset current request
            setShowScanner(false);
            setCurrentRequest(null);
            // Show confirmation of cancellation
            Swal.fire({
              title: 'Scanning Cancelled',
              text: 'The scanning process has been cancelled due to wrong QR code.',
              icon: 'info',
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false
            });
          }
        });
      }
    } catch (error) {
      console.error('Scan processing error:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to process scan',
        icon: 'error',
        confirmButtonColor: '#d33',
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
        const html5QrCode = new Html5Qrcode("reader");
        if (html5QrCode) {
          html5QrCode.stop().catch(err => {
            console.error("Error stopping scanner:", err);
          });
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
                                    className={`scan-return-btn ${request.status.toLowerCase() === 'returned' ? 'disabled' : ''}`}
                                    onClick={() => handleScanClick(request)}
                                    disabled={request.status.toLowerCase() === 'returned'}
                                    style={{
                                      opacity: request.status.toLowerCase() === 'returned' ? '0.5' : '1',
                                      cursor: request.status.toLowerCase() === 'returned' ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    <i className="bx bx-qr-scan"></i>
                                    {request.status.toLowerCase() === 'returned' ? 'Already Returned' : 'Scan to Return'}
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
