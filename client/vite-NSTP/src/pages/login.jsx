import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/login.css";
import logo from "../style/image/nstp_logo.png";
import { authConfig } from "../config/auth.config";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Initialize Google Sign-In API after script loads
        window.google.accounts.id.initialize({
          client_id:
            "941942178577-6i12rtiomnbbfgha49lna49lpbsggcbf.apps.googleusercontent.com", // Your client ID
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          {
            theme: "outline",
            size: "large",
            type: "standard",
            shape: "rectangular",
            logo_alignment: "center",
            text: "signin_with",
            width: "305",
          }
        );
      };
    };

    loadGoogleScript();

    // Load reCAPTCHA v2 on load
    const loadRecaptcha = () => {
      const recaptchaScript = document.createElement("script");
      recaptchaScript.src = "https://www.google.com/recaptcha/api.js";
      recaptchaScript.async = true;
      document.body.appendChild(recaptchaScript);
    };
    loadRecaptcha();
  }, []);

  const handleCredentialResponse = (response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    // Redirect to Dashboard page after successful login
    window.location.href = "/dashboard";
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(authConfig.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          password: formData.password,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store the token
      localStorage.setItem("adminToken", data.data.token);

      // Store admin info
      localStorage.setItem("adminInfo", JSON.stringify(data.data.admin));

      // Redirect to dashboard
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="nstp_bg"></div>
      <div className="logo">
        <img src={logo} alt="NSTP Logo" className="nstp_logo" />
        <div className="header-text">
          <h6>NSTP INVENTORY &</h6>
          <h6>ONLINE REQUEST</h6>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="d-flex align-items-center justify-content-center vh-100"
      >
        <div className="circle">
          <div className="card text-center">
            <div className="card-body">
              <h1>WELCOME</h1>
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="form-floating mb-4">
                <input
                  type="email"
                  className="form-control"
                  id="floatingInput"
                  placeholder="name@example.com"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <label htmlFor="floatingInput">
                  <i className="bi bi-envelope"></i> Email address
                </label>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="password"
                  className="form-control"
                  id="floatingPassword"
                  placeholder="Password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <label htmlFor="floatingPassword">
                  <i className="bi bi-key"></i> Password
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary mt-3"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;
