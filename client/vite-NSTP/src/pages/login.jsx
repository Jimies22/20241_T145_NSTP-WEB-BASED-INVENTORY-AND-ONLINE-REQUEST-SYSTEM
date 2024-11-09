import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/login.css";
//import background from "../style/image/nstp_cover.png";
import logo from "../style/image/nstp_logo.png";

function Login() {
  useEffect(() => {
    // Initialize Google Sign-In API
    window.google?.accounts.id.initialize({
      client_id:
        "941942178577-6i12rtiomnbbfgha49lna53lpbsggcbf.apps.googleusercontent.com", // Replace with your actual Client ID
      callback: handleCredentialResponse,
    });

    window.google?.accounts.id.renderButton(
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

  const onSubmit = (event) => {
    event.preventDefault();
    const recaptchaResponse = window.grecaptcha.getResponse();
    if (!recaptchaResponse) {
      alert("Please complete the reCAPTCHA.");
      return;
    }
    console.log("Form submitted with reCAPTCHA response:", recaptchaResponse);
    // Redirect or proceed with authentication
  };

  return (
    <div className="nstp_bg">
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
                    <i className="bi bi-person"></i> Email address
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
                    <i className="bi bi-key"></i> Password
                  </label>
                </div>
                <input type="checkbox" id="checkbox" />
                <label htmlFor="checkbox" className="checkbox">
                  Keep me logged in
                </label>

                <button type="submit" className="btn btn-primary mt-3">
                  Login
                </button>
                <p className="line">
                  ______________________________________________________________
                </p>

                {/* Google Sign-In Button Placeholder */}
                <div
                  id="google-signin-btn"
                  className="d-flex justify-content-center mt-3 mb-5"
                  style={{
                    width: "80%",
                    margin: "0 auto",
                    transform: "scale(1.2)",
                  }}
                ></div>

                {/* Google reCAPTCHA v2 Checkbox */}
                <div
                  className="g-recaptcha mt-3"
                  data-sitekey="YOUR_RECAPTCHA_SITE_KEY"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;
