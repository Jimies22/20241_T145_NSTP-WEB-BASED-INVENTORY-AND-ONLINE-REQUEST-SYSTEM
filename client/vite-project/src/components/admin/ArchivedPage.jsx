import React from "react";
import Sidebar from "../sidebar/AdminSidebar";
import Navbar from "../Navbar";
import "../../css/ArchivePage.css";

const ArchivePage = () => {
  return (
    <div className="user-dashboard">
      <Sidebar />
      <section id="content">
        <Navbar />
        <main>
          <div className="head-title">
            <div className="left">
              <h1>Archive</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Archive</a>
                </li>
                <li>
                  <i className="bx bx-chevron-right" />
                </li>
                <li>
                  <a className="active" href="Mainpage.html">
                    Home
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="table-data">
            <div className="pending-requests">
              <div className="head">
                <h3>Archived Items</h3>
                <i className="bx bx-filter" />
              </div>
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th>Item ID</th>
                      <th>Item Description</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <img src="img/people.png" alt="User Image" />
                        <p>22011</p>
                      </td>
                      <td>Epson 705HD Powerlite Home Cinema LCD Projector</td>
                      <td>
                        <a href>
                          <i
                            className="bx bxs-archive-out"
                            style={{ fontSize: 24, color: "#36f465" }}
                          />
                        </a>
                        <a href>
                          <i
                            className="bx bxs-trash"
                            style={{ fontSize: 24, color: "#f44336" }}
                          />
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <img src="img/people.png" alt="User Image" />
                        <p>22022</p>
                      </td>
                      <td>Epson 705HD Powerlite Home Cinema LCD Projector</td>
                      <td>
                        <a href>
                          <i
                            className="bx bxs-archive-out"
                            style={{ fontSize: 24, color: "#36f465" }}
                          />
                        </a>
                        <a href>
                          <i
                            className="bx bxs-trash"
                            style={{ fontSize: 24, color: "#f44336" }}
                          />
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <img src="img/people.png" alt="User Image" />
                        <p>E22033</p>
                      </td>
                      <td>Epson 705HD Powerlite Home Cinema LCD Projector</td>
                      <td>
                        <a href>
                          <i
                            className="bx bxs-archive-out"
                            style={{ fontSize: 24, color: "#36f465" }}
                          />
                        </a>
                        <a href>
                          <i
                            className="bx bxs-trash"
                            style={{ fontSize: 24, color: "#f44336" }}
                          />
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <img src="img/people.png" alt="User Image" />
                        <p>22044</p>
                      </td>
                      <td>Epson 705HD Powerlite Home Cinema LCD Projector</td>
                      <td>
                        <a href>
                          <i
                            className="bx bxs-archive-out"
                            style={{ fontSize: 24, color: "#36f465" }}
                          />
                        </a>
                        <a href>
                          <i
                            className="bx bxs-trash"
                            style={{ fontSize: 24, color: "#f44336" }}
                          />
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <img src="img/people.png" alt="User Image" />
                        <p>22055</p>
                      </td>
                      <td>Epson 705HD Powerlite Home Cinema LCD Projector</td>
                      <td>
                        <a href>
                          <i
                            className="bx bxs-archive-out"
                            style={{ fontSize: 24, color: "#36f465" }}
                          />
                        </a>
                        <a href>
                          <i
                            className="bx bxs-trash"
                            style={{ fontSize: 24, color: "#f44336" }}
                          />
                        </a>
                      </td>
                    </tr>
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

export default ArchivePage;
