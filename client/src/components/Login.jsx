// src/components/Login.jsx
import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/Login.css"; // Ensure this path is correct
import nstpLogo from "../assets/NSTP_LOGO.png";

const clientId =
  "549675419873-ft3kc0fpc3nm9d3tibrpt13b3gu78hd4.apps.googleusercontent.com";
const recaptchaKey = "6Lfty3MqAAAAACp-CJm8DFxDW1GfjdR1aXqHbqpg";

function Login() {
  const navigate = useNavigate();
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [isRecaptchaValid, setIsRecaptchaValid] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSuccess = (credentialResponse) => {
    if (!isRecaptchaValid) {
      alert("Please complete the reCAPTCHA");
      return;
    }

    console.log("Google Login Attempt:", credentialResponse);
    const { credential } = credentialResponse;

    fetch("http://localhost:3000/login/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ token: credential })
    })
      .then(async (response) => {
        const data = await response.json();
        console.log("Server response:", data);

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        return data;
      })
      .then((data) => {
        console.log("Login successful:", data);
        sessionStorage.setItem("sessionToken", data.token);
        
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        alert(error.message || "Login failed. Please try again.");
      });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    if (!isRecaptchaValid) {
      alert("Please complete the reCAPTCHA");
      return;
    }

    try {
      console.log("Admin Login Attempt:", email);
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      sessionStorage.setItem("sessionToken", data.token);
      console.log("Login successful:", data);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Login failed. Please try again.");
    }
  };

  const onError = () => {
    console.log("Login Failed");
    alert("Login failed. Please try again.");
  };

  const onRecaptchaChange = (value) => {
    setRecaptchaValue(value);
    setIsRecaptchaValid(true);
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
      <form
        onSubmit={handleLogin}
        className="d-flex align-items-center justify-content-center vh-100"
      >
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <hr className="line"></hr>
                <div
                  id="google-signin-btn"
                  className="d-flex justify-content-center mt-3 mb-5"
                  style={{
                    width: "80%",
                    margin: "0 auto",
                    transform: "scale(1.2)",
                  }}
                >
                  <GoogleLogin
                    onSuccess={onSuccess}
                    onError={onError}
                    width={305}
                    disabled={!isRecaptchaValid}
                  />
                </div>
                <ReCAPTCHA
                  sitekey={recaptchaKey}
                  onChange={onRecaptchaChange}
                  className="g-recaptcha mt-3"
                />
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
