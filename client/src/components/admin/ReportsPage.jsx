// src/components/ReportsPage.jsx
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Sidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "../../css/ReportsPage.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

console.log("API Key: ", import.meta.env.VITE_GOOGLE_API_KEY);
console.log("Client ID: ", import.meta.env.VITE_GOOGLE_CLIENT_ID);

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weeklyData, setWeeklyData] = useState({});
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [borrowData, setBorrowData] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [view, setView] = useState("week"); // Add state for calendar view

  // useEffect(() => {
  //   // First, check if we already have a token in sessionStorage
  //   const hasToken = sessionStorage.getItem("googleCalendarToken");
  //   if (hasToken) {
  //     // If we have a token, initialize directly without showing popup
  //     initializeGoogleAPI(hasToken);
  //     return;
  //   }

  //   // Load Google Identity Services only if we don't have a token
  //   const loadGoogleIdentity = () => {
  //     const script = document.createElement("script");
  //     script.src = "https://accounts.google.com/gsi/client";
  //     script.async = true;
  //     script.defer = true;
  //     script.onload = initializeGoogleAPI;
  //     document.body.appendChild(script);
  //   };

  //   const initializeGoogleAPI = async (existingToken) => {
  //     try {
  //       if (!existingToken) {
  //         // Initialize Google Identity Services only if we don't have a token
  //         const client = google.accounts.oauth2.initTokenClient({
  //           client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  //           scope: "https://www.googleapis.com/auth/calendar.readonly",
  //           callback: async (response) => {
  //             if (response.access_token) {
  //               // Save token to sessionStorage
  //               sessionStorage.setItem(
  //                 "googleCalendarToken",
  //                 response.access_token
  //               );

  //               await loadGapiClient(response.access_token);
  //               console.log("Access token:", response.access_token);
  //             }
  //           },
  //         });

  //         // Prompt for consent only if we don't have a token
  //         client.requestAccessToken();
  //       } else {
  //         // Use existing token
  //         await loadGapiClient(existingToken);
  //       }
  //     } catch (error) {
  //       console.error("Error initializing Google API:", error);
  //       setError("Failed to initialize Google Calendar");
  //     }
  //   };

  //   const loadGapiClient = async (accessToken) => {
  //     try {
  //       await new Promise((resolve) => {
  //         const script = document.createElement("script");
  //         script.src = "https://apis.google.com/js/api.js";
  //         script.onload = resolve;
  //         document.body.appendChild(script);
  //       });

  //       await new Promise((resolve) => window.gapi.load("client", resolve));

  //       await window.gapi.client.init({
  //         apiKey: apiKey,
  //         discoveryDocs: [
  //           "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  //         ],
  //       });

  //       window.gapi.client.setToken({
  //         access_token: accessToken,
  //       });

  //       setIsGapiLoaded(true);
  //       await loadCalendarEvents();
  //     } catch (error) {
  //       console.error("Error loading GAPI client:", error);
  //       setError("Failed to load Google Calendar");
  //     }
  //   };

  //   loadGoogleIdentity();

  //   // Cleanup
  //   return () => {
  //     const scripts = document.querySelectorAll(
  //       'script[src="https://accounts.google.com/gsi/client"], script[src="https://apis.google.com/js/api.js"]'
  //     );
  //     scripts.forEach((script) => script.remove());
  //   };
  // }, []);

  // const loadCalendarEvents = async () => {
  //   // const token = sessionStorage.getItem("sessionToken");
  //   // console.log("Token:", token);
  //   try {
  //     setLoading(true);
  //     const startOfYear = moment().startOf("year");
  //     const endOfYear = moment().endOf("year");

  //     const response = await window.gapi.client.calendar.events.list({
  //       calendarId: "primary",
  //       timeMin: startOfYear.toISOString(),
  //       timeMax: endOfYear.toISOString(),
  //       showDeleted: false,
  //       singleEvents: true,
  //       orderBy: "startTime",
  //     });

  //     if (response.status === 401) {
  //       console.error("Unauthorized access to Google Calendar API");
  //       setError("Unauthorized access to Google Calendar API");
  //       // Refresh token
  //       const client = google.accounts.oauth2.initTokenClient({
  //         client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  //         scope: "https://www.googleapis.com/auth/calendar.readonly",
  //         callback: async (response) => {
  //           if (response.access_token) {
  //             // Save token to sessionStorage
  //             sessionStorage.setItem(
  //               "googleCalendarToken",
  //               response.access_token
  //             );
  //             await loadCalendarEvents();
  //           }
  //         },
  //       });
  //       client.requestAccessToken();
  //       return;
  //     }

  //     const events = response.result.items.map((event) => {
  //       const extendedProps = event.extendedProperties?.private || {};
  //       const status = extendedProps.status || "pending";
  //       let backgroundColor;

  //       switch (status) {
  //         case "rejected":
  //           backgroundColor = "red";
  //           break;
  //         case "cancelled":
  //           backgroundColor = "grey";
  //           break;
  //         case "approved":
  //           backgroundColor = "green";
  //           break;
  //         case "pending":
  //         default:
  //           backgroundColor = "yellow";
  //           break;
  //       }

  //       return {
  //         id: event.id,
  //         title: extendedProps.itemName || event.summary,
  //         start: new Date(event.start.dateTime || event.start.date),
  //         end: new Date(event.end.dateTime || event.end.date),
  //         borrower: extendedProps.borrower || "Unknown",
  //         itemDetails: {
  //           name: extendedProps.itemName,
  //           category: extendedProps.category,
  //           condition: extendedProps.condition,
  //         },
  //         status,
  //         backgroundColor,
  //       };
  //     });

  //     setEvents(events);
  //     await generateReport(new Date());
  //   } catch (error) {
  //     console.error("Error loading calendar events:", error);
  //     setError("Failed to load calendar events");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    const loadGoogleIdentity = () => {
      window.gapi.load("client:auth2", async () => {
        await window.gapi.client.init({
          apiKey: "AIzaSyDJzZz35k1CALaPzMp3aWfr2x3DyN8wtCs",
          clientId:
            "549675419873-ft3kc0fpc3nm9d3tibrpt13b3gu78hd4.apps.googleusercontent.com",
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
          ],
          scope: "https://www.googleapis.com/auth/calendar.readonly",
        });

        const authInstance = window.gapi.auth2.getAuthInstance();
        if (!authInstance.isSignedIn.get()) {
          await authInstance.signIn();
        }
      });
    };

    loadGoogleIdentity();

    // Cleanup
    return () => {
      const scripts = document.querySelectorAll(
        'script[src="https://accounts.google.com/gsi/client"], script[src="https://apis.google.com/js/api.js"]'
      );
      scripts.forEach((script) => script.remove());
    };
  }, []);

  const loadCalendarEvents = async () => {
    const authInstance = window.gapi.auth2.getAuthInstance();
    const token = authInstance.currentUser.get().getAuthResponse().access_token;
    console.log("Token:", token);
    try {
      setLoading(true);
      const startOfYear = moment().startOf("year");
      const endOfYear = moment().endOf("year");

      const response = await window.gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: startOfYear.toISOString(),
        timeMax: endOfYear.toISOString(),
        showDeleted: false,
        access_token: token,
      });

      console.log("Events:", response.result.items);
      // Handle the response
    } catch (error) {
      console.error("Error loading calendar events:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (date) => {
    try {
      setLoading(true);
      const reportData = await fetchReportData(date);
      setWeeklyData(reportData);
    } catch (error) {
      console.error("Error generating report:", error);
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    if (newView === "day") {
      generateDailyReport(new Date());
    } else {
      generateWeeklyReport(new Date());
    }
  };

  const generateDailyReport = async (date) => {
    try {
      setLoading(true);
      const dailyData = await fetchDailyData(date);
      setWeeklyData(dailyData); // Reuse weeklyData state for simplicity
    } catch (error) {
      console.error("Error generating daily report:", error);
      setError("Failed to generate daily report");
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyData = async (selectedDate) => {
    if (!isGapiLoaded) {
      console.log("Google API not yet loaded");
      return;
    }

    try {
      setLoading(true);
      const startDate = moment(selectedDate).startOf("day");
      const endDate = moment(selectedDate).endOf("day");

      const processedData = await processCalendarData(
        startDate.toDate(),
        endDate.toDate()
      );

      const chartData = {
        labels: Object.keys(processedData.byDay).map((date) =>
          moment(date).format("ddd, MMM D")
        ),
        datasets: [
          {
            label: "Items Borrowed",
            data: Object.values(processedData.byDay).map(
              (day) => day.totalItems
            ),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      };

      setWeeklyData(processedData);
      setChartData(chartData);
    } catch (error) {
      setError("Failed to fetch daily data");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async (selectedDate) => {
    if (!isGapiLoaded) {
      console.log("Google API not yet loaded");
      return;
    }

    try {
      setLoading(true);
      const startDate = moment().startOf("year");
      const endDate = moment().endOf("year");

      const processedData = await processCalendarData(
        startDate.toDate(),
        endDate.toDate()
      );

      const chartData = {
        labels: Object.keys(processedData.byDay).map((date) =>
          moment(date).format("ddd, MMM D")
        ),
        datasets: [
          {
            label: "Items Borrowed",
            data: Object.values(processedData.byDay).map(
              (day) => day.totalItems
            ),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      };

      setWeeklyData(processedData);
      setChartData(chartData);
    } catch (error) {
      setError("Failed to fetch report data");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Remove duplicate useEffect for generateWeeklyReport
  // Instead, modify the existing useEffect that checks for GAPI
  useEffect(() => {
    if (window.gapi?.client) {
      setIsGapiLoaded(true);
      generateWeeklyReport(new Date());
    }
  }, []);

  const handleDateClick = async (date) => {
    try {
      setLoading(true);
      const weeklyData = await fetchWeeklyCalendarData(date);
      setSelectedDate(date);
      setIsModalOpen(true);

      // Group events by category
      const categoryGroups = weeklyData.allEvents
        .filter((event) => moment(event.date).isSame(moment(date), "day"))
        .reduce((acc, event) => {
          const category = event.category || "Uncategorized";
          if (!acc[category]) {
            acc[category] = {
              count: 0,
              items: {},
            };
          }
          acc[category].count++;
          acc[category].items[event.itemName] =
            (acc[category].items[event.itemName] || 0) + 1;
          return acc;
        }, {});

      const chartData = {
        labels: Object.keys(categoryGroups),
        datasets: [
          {
            label: "Items Borrowed by Category",
            data: Object.values(categoryGroups).map((group) => group.count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.5)",
              "rgba(54, 162, 235, 0.5)",
              "rgba(255, 206, 86, 0.5)",
              "rgba(75, 192, 192, 0.5)",
              "rgba(153, 102, 255, 0.5)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1,
            hoverOffset: 4,
          },
        ],
      };

      setBorrowData({
        chartData,
        dayEvents: weeklyData.allEvents.filter((event) =>
          moment(event.date).isSame(moment(date), "day")
        ),
        categoryGroups,
        totalBorrowed: weeklyData.allEvents.filter((event) =>
          moment(event.date).isSame(moment(date), "day")
        ).length,
      });
    } catch (error) {
      console.error("Error loading date details:", error);
      setError("Failed to load date details");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Add missing chartOptions
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Borrowing Statistics",
      },
    },
  };

  const processCalendarData = async (startDate, endDate) => {
    const response = await window.gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.result.items;
    const byDay = {};

    // Initialize the days of the week
    for (
      let d = moment(startDate);
      d.isSameOrBefore(endDate);
      d.add(1, "day")
    ) {
      byDay[d.format("YYYY-MM-DD")] = {
        totalItems: 0,
        events: [],
      };
    }

    // Process each event
    events.forEach((event) => {
      const eventDate = moment(event.start.dateTime || event.start.date).format(
        "YYYY-MM-DD"
      );
      const extendedProps = event.extendedProperties?.private || {};

      if (byDay[eventDate]) {
        byDay[eventDate].totalItems++;
        byDay[eventDate].events.push({
          itemName: extendedProps.itemName || event.summary,
          category: extendedProps.category,
          borrower: extendedProps.borrower,
          condition: extendedProps.condition,
          startTime: event.start.dateTime || event.start.date,
        });
      }
    });

    return {
      byDay,
      allEvents: events.map((event) => {
        const extendedProps = event.extendedProperties?.private || {};
        return {
          itemName: extendedProps.itemName || event.summary,
          category: extendedProps.category,
          borrower: extendedProps.borrower,
          condition: extendedProps.condition,
          startTime: event.start.dateTime || event.start.date,
          date: moment(event.start.dateTime || event.start.date).toDate(),
        };
      }),
    };
  };

  const generateWeeklyReport = async (date) => {
    try {
      setLoading(true);
      const weeklyData = await fetchWeeklyData(date);
      setWeeklyData(weeklyData);
    } catch (error) {
      console.error("Error generating weekly report:", error);
      setError("Failed to generate weekly report");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyData = async (selectedDate) => {
    if (!isGapiLoaded) {
      console.log("Google API not yet loaded");
      return;
    }

    try {
      setLoading(true);
      const startDate = moment(selectedDate).startOf("week");
      const endDate = moment(selectedDate).endOf("week");

      const processedData = await processCalendarData(
        startDate.toDate(),
        endDate.toDate()
      );

      const chartData = {
        labels: Object.keys(processedData.byDay).map((date) =>
          moment(date).format("ddd, MMM D")
        ),
        datasets: [
          {
            label: "Items Borrowed",
            data: Object.values(processedData.byDay).map(
              (day) => day.totalItems
            ),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      };

      setWeeklyData(processedData);
      setChartData(chartData);
    } catch (error) {
      setError("Failed to fetch weekly data");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
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
          </div>

          <div className="reports-container">
            <div className="calendar-section">
              <Calendar
                localizer={momentLocalizer(moment)}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                views={["week", "day"]} // Remove month view
                defaultView={view} // Use state for default view
                eventPropGetter={(event) => ({
                  style: { backgroundColor: event.backgroundColor },
                })}
                onSelectEvent={(event) => handleDateClick(event.start)}
                selectable
              />
            </div>

            {showChart && borrowData && (
              <div className="report-details">
                <div className="chart-container">
                  <Bar data={borrowData.chartData} options={chartOptions} />
                </div>
                <div className="borrowers-list">
                  <h3>
                    Borrower Details -{" "}
                    {moment(selectedDate).format("MMMM D, YYYY")}
                  </h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Borrower</th>
                        <th>Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowData.borrowers.map((borrow, index) => (
                        <tr key={index}>
                          <td>{borrow.time}</td>
                          <td>{borrow.item}</td>
                          <td>{borrow.category}</td>
                          <td>{borrow.borrower}</td>
                          <td>{borrow.condition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </section>

      {isModalOpen && borrowData && (
        <div className="modal-overlay">
          <div className="modal-content print-content">
            <div className="modal-header">
              <h2>
                Borrowing Report - {moment(selectedDate).format("MMMM D, YYYY")}
              </h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="summary-stats">
                <div className="stat-item">
                  <h3>Total Items Borrowed</h3>
                  <p>{borrowData.totalBorrowed}</p>
                </div>
              </div>

              <div className="chart-section">
                <h3>Distribution by Category</h3>
                <div className="chart-container">
                  <Bar data={borrowData.chartData} options={chartOptions} />
                </div>
              </div>

              <div className="details-section">
                <h3>Detailed Borrowing List</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Borrower</th>
                      <th>Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowData.dayEvents.map((event, index) => (
                      <tr key={index}>
                        <td>{moment(event.startTime).format("HH:mm")}</td>
                        <td>{event.itemName}</td>
                        <td>{event.category}</td>
                        <td>{event.borrower}</td>
                        <td>{event.condition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="print-btn" onClick={handlePrintReport}>
                <i className="bx bx-printer"></i> Print Weekly Report
              </button>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
