import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./style/login.css";
import logo from "../assets/nstp_logo.png";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function Login() {
  console.log("Login component rendering");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:3000/api";

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id:
            "941942178577-6i12rtiomnbbfgha49lna53lpbsggcbf.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_select: false,
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

        window.google.accounts.id.cancel();
      };
    };

    // Load reCAPTCHA script
    const loadRecaptcha = () => {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };

    loadGoogleScript();
    loadRecaptcha();
    checkAuth();
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const decodedToken = jwtDecode(response.credential);

      const userData = {
        credential: response.credential,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        given_name: decodedToken.given_name,
        family_name: decodedToken.family_name,
        googleId: decodedToken.sub,
      };

      const result = await axios.post(`${API_URL}/auth/google-login`, userData);

      if (result.data.success) {
        localStorage.setItem("authToken", result.data.data.token);
        localStorage.setItem("userInfo", JSON.stringify(result.data.data.user));
        window.location.href = "../User/Dashboard.html";
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Google login failed. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const recaptchaResponse = window.grecaptcha.getResponse();
    if (!recaptchaResponse) {
      setError("Please complete the reCAPTCHA.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/admin/login`, {
        email: formData.email,
        password: formData.password,
        recaptchaResponse: recaptchaResponse,
      });

      if (response.data.success) {
        if (formData.rememberMe) {
          localStorage.setItem("authToken", response.data.data.token);
        } else {
          sessionStorage.setItem("authToken", response.data.data.token);
        }

        localStorage.setItem(
          "adminInfo",
          JSON.stringify(response.data.data.admin)
        );
        window.location.href = "../User/Dashboard.html";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
      window.grecaptcha.reset();
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = () => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (token) {
      window.location.href = "../User/Dashboard.html";
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

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
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
