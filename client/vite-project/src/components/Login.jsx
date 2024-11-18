// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/Login.css"; // Ensure this path is correct
import nstpLogo from "../assets/NSTP_LOGO.png";
import { apiRequest } from "../js/api.js";

const clientId =
  "96467309918-sjb49jofskdnaffpravkqgu1o6p0a8eh.apps.googleusercontent.com";
const recaptchaKey = "6Lfty3MqAAAAACp-CJm8DFxDW1GfjdR1aXqHbqpg";

function Login() {
  const navigate = useNavigate();
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [isRecaptchaValid, setIsRecaptchaValid] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Test backend connection on component mount
    const testConnection = async () => {
      try {
        await apiRequest("/health");
        console.log("Backend connection successful");
      } catch (error) {
        console.error("Backend connection failed:", error);
        setError("Unable to connect to server");
      }
    };

    testConnection();
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!recaptchaValue) {
        setError("Please complete the ReCAPTCHA verification");
        return;
      }

      setIsLoading(true);
      // First verify ReCAPTCHA
      const recaptchaResponse = await apiRequest("/auth/verify-recaptcha", {
        method: "POST",
        body: JSON.stringify({ recaptchaToken: recaptchaValue }),
      });

      if (!recaptchaResponse.success) {
        setError("ReCAPTCHA verification failed");
        return;
      }

      // Then proceed with Google login
      const response = await apiRequest("/auth/google", {
        method: "POST",
        body: JSON.stringify({
          token: credentialResponse.credential,
          recaptchaToken: recaptchaValue,
        }),
      });

      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate(response.user.role === "admin" ? "/admin" : "/user");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error) {
      setError(error.message || "An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = () => {
    console.log("Login Failed");
    alert("Login failed. Please try again.");
  };

  const onRecaptchaChange = (value) => {
    setRecaptchaValue(value);
    setIsRecaptchaValid(!!value);
  };

  const onRecaptchaExpired = () => {
    setRecaptchaValue(null);
    setIsRecaptchaValid(false);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="logo">
        <img src={nstpLogo} alt="Logo" className="nstp_logo" />
        <div className="header-text">
          <h6>NSTP INVENTORY &amp;</h6>
          <h6>ONLINE REQUEST</h6>
        </div>
      </div>
      <form className="d-flex align-items-center justify-content-center vh-100">
        <div className="circle">
          <div className="card text-center">
            <div className="card-body">
              <h1>WELCOME</h1>
              <div>
                <div className="form-floating mb-4">
                  <input
                    type="email"
                    className="form-control"
                    id="floatingInput"
                    placeholder="name@example.com"
                    required
                  />
                  <label htmlFor="floatingInput">
                    <i className="bi bi-person" />
                    Email address
                  </label>
                </div>
                <div className="form-floating mb-4">
                  <input
                    type="password"
                    className="form-control"
                    id="floatingPassword"
                    placeholder="Password"
                    required
                  />
                  <label htmlFor="floatingPassword">
                    <i className="bi bi-key" />
                    Password
                  </label>
                </div>
                <input type="checkbox" name="checkbox" id="checkbox" />
                <label className="checkbox" htmlFor="checkbox">
                  Keep me logged in
                </label>
                <button type="submit" className="btn btn-primary mt-3">
                  Login
                </button>
                <p className="line">
                  _____________________________________________________________
                </p>
                <div className="recaptcha-container mt-3 mb-3">
                  <ReCAPTCHA
                    sitekey={recaptchaKey}
                    onChange={onRecaptchaChange}
                    onExpired={onRecaptchaExpired}
                    className="g-recaptcha"
                  />
                </div>
                <div className="google-login-container">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={onError}
                    width={305}
                    disabled={!isRecaptchaValid || isLoading}
                  />
                </div>
              </div>
            </div>
            <div className="nstp_bg" />
          </div>
        </div>
      </form>
    </GoogleOAuthProvider>
  );
}

export default Login;
