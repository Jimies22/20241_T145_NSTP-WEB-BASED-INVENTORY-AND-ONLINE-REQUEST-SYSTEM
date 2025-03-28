// src/components/Login.jsx
import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/Login.css"; // Ensure this path is correct
import nstpLogo from "../assets/NSTP_LOGO.png";
import Swal from "sweetalert2";
import { logActivity } from '../utils/activityLogger';

const clientId =
  "549675419873-ft3kc0fpc3nm9d3tibrpt13b3gu78hd4.apps.googleusercontent.com";
const recaptchaKey = "6Lfty3MqAAAAACp-CJm8DFxDW1GfjdR1aXqHbqpg";

function Login() {
  const navigate = useNavigate();
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [isRecaptchaValid, setIsRecaptchaValid] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSuccess = (credentialResponse) => {
    if (!isRecaptchaValid) {
      Swal.fire({
        title: "Verification Required",
        text: "Please complete the reCAPTCHA verification",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setIsLoading(true);
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
        
        const userInfo = {
            name: data.user.name,
            email: data.user.email,
            picture: data.user.picture,
            role: data.user.role
        };
        console.log("Storing user info:", userInfo);
        sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
        
        Swal.fire({
          title: "Success!",
          text: "Login successful",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          if (data.user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/user");
          }
        });

        logActivity('login', `User logged in: ${data.user.email}`);
      })
      .catch((error) => {
        console.error("Login error:", error);
        Swal.fire({
          title: "Login Failed",
          text: error.message || "Invalid credentials. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        title: "Missing Information",
        text: "Please enter both email and password",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!isRecaptchaValid) {
      Swal.fire({
        title: "Verification Required",
        text: "Please complete the reCAPTCHA verification",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setIsLoading(true);
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

      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.message || 'Invalid credentials');
      }

      sessionStorage.setItem("sessionToken", data.token);
      
      const userInfo = {
        email: data.user.email,
        role: data.user.role
      };
      
      sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
      
      await Swal.fire({
        title: "Success!",
        text: "Login successful",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }

      logActivity('login', `User logged in: ${data.user.email}`);
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        title: "Login Failed",
        text: error.message || "Invalid credentials. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onError = () => {
    console.log("Login Failed");
    Swal.fire({
      title: "Google Login Failed",
      text: "Unable to login with Google. Please try again.",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  };

  const onRecaptchaChange = (value) => {
    setRecaptchaValue(value);
    setIsRecaptchaValid(true);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-content">
            <div className="spinner"></div>
            <p className="loading-text">Logging In<span className="loading-dots"></span></p>
            <p className="loading-subtext">Please wait while we verify your credentials</p>
          </div>
        </div>
      )}
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
                <div className="form-floating mb-4 password-container">
                  <input
                    type={showPassword ? "text" : "password"}
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
                  <button
                    type="button"
                    className={`password-toggle-btn ${showPassword ? 'visible' : ''}`}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
                <div className="checkbox-container">
                    <input type="checkbox" name="checkbox" id="checkbox" />
                    <label className="checkbox" htmlFor="checkbox">
                        Keep me logged in
                    </label>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary mt-3" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
                <hr className="line"></hr>
                <div
                  id="google-signin-btn"
                  className="d-flex justify-content-center mt-3 mb-5"
                  style={{
                    width: "70%",
                    margin: "0 auto",
                    transform: "scale(1.2)",
                  }}
                >
                  <GoogleLogin
                    onSuccess={onSuccess}
                    onError={onError}
                    width={290}
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
