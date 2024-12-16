// src/components/ReportsPage.jsx
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "../../css/ReportsPage.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Swal from "sweetalert2";

const ReportsPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const localizer = momentLocalizer(moment);

  const SPREADSHEET_ID = "1robOVUE6k3a3BcyCj8o25W8f6p2422VbfyvcW9NyxCE";

  const handleGoToSheets = async () => {
    try {
      const token = sessionStorage.getItem("sessionToken");
      
      // First update the sheet
      const response = await fetch("http://localhost:3000/api/update-sheets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update sheet');
      }

      // Then open the sheet
      const sheetsUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=0`;
      window.open(sheetsUrl, '_blank');

      Swal.fire({
        title: 'Success!',
        text: 'Sheet updated and opened in new tab',
        icon: 'success',
        timer: 2000
      });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to update Google Sheet',
        icon: 'error'
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("sessionToken");

      if (!token) {
        setError("Please login to view reports");
        return;
      }

      const response = await fetch("http://localhost:3000/borrow/all", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Fetched requests:", data);

      const calendarEvents = data.map((request) => ({
        id: request._id,
        title: `${request.item?.name || "Unknown Item"} - ${
          request.userId?.name || "Unknown User"
        }`,
        start: new Date(request.borrowDate),
        end: new Date(request.returnDate),
        status: request.status,
        borrowerName: request.userId?.name || "Unknown User",
        itemName: request.item?.name || "Unknown Item",
        purpose: request.purpose,
        condition: request.item?.condition,
        backgroundColor: getStatusColor(request.status),
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError(
        error.message || "Failed to load requests. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "pending":
        return "#FFC107";
      case "rejected":
        return "#F44336";
      case "returned":
        return "#2196F3";
      case "cancelled":
        return "#9E9E9E";
      default:
        return "#9E9E9E";
    }
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const EventDetailsModal = ({ event, onClose }) => {
    if (!event) return null;

    return (
      <div className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Request Details</h3>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="event-details">
            <p>
              <strong>Item:</strong> {event.itemName}
            </p>
            <p>
              <strong>Borrower:</strong> {event.borrowerName}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-${event.status}`}>{event.status}</span>
            </p>
            <p>
              <strong>Start Date:</strong>{" "}
              {moment(event.start).format("MMMM Do YYYY, h:mm a")}
            </p>
            <p>
              <strong>End Date:</strong>{" "}
              {moment(event.end).format("MMMM Do YYYY, h:mm a")}
            </p>
            <p>
              <strong>Purpose:</strong> {event.purpose}
            </p>
            <p>
              <strong>Condition:</strong> {event.condition}
            </p>
          </div>
          <div className="modal-footer">
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="reports-page">
      <Sidebar />
      <section id="content">
        <AdminNavbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Reports</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Reports</a>
                </li>
                <li>
                  <i className="bx bx-chevron-right" />
                </li>
                <li>
                  <a className="active" href="/admin">
                    Home
                  </a>
                </li>
              </ul>
            </div>
            <button 
              className="export-sheets-btn" 
              onClick={handleGoToSheets}
              title="Open in Google Sheets"
            >
              <i className="bx bxs-spreadsheet"></i>
              <span>View in Google Sheets</span>
            </button>
          </div>

          {error && (
            <div className="error-message">
              <div>
                <strong>Error:</strong> {error}
                {retryCount > 0 && <p>Retry attempt: {retryCount}</p>}
              </div>
              <button
                className="retry-btn"
                onClick={() => {
                  setRetryCount((prev) => prev + 1);
                  fetchRequests();
                }}
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading requests...</div>
          ) : (
            <div className="calendar-container">
              <div className="status-legend">
                <div className="legend-item">
                  <span className="status-dot approved"></span>
                  Approved
                </div>
                <div className="legend-item">
                  <span className="status-dot pending"></span>
                  Pending
                </div>
                <div className="legend-item">
                  <span className="status-dot rejected"></span>
                  Rejected
                </div>
                <div className="legend-item">
                  <span className="status-dot returned"></span>
                  Returned
                </div>
                <div className="legend-item">
                  <span className="status-dot cancelled"></span>
                  Cancelled
                </div>
              </div>

              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                eventPropGetter={eventStyleGetter}
                views={["month", "week", "day"]}
                defaultView="month"
                onSelectEvent={(event) => setSelectedEvent(event)}
                tooltipAccessor={(event) =>
                  `${event.itemName} - ${event.borrowerName}`
                }
              />
            </div>
          )}

          {selectedEvent && (
            <EventDetailsModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          )}
        </main>
      </section>
    </div>
  );
};

export default ReportsPage;
