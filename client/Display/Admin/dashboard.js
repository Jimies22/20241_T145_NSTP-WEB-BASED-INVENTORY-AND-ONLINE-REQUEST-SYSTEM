async function handleLogout(event) {
  event.preventDefault();

  try {
    // Clear all stored data
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("userInfo");

    // Optional: Call backend to invalidate session
    const API_URL = "http://localhost:3000/api";
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    // Redirect to login page
    window.location.href = "../login/login.html";
  } catch (error) {
    console.error("Logout error:", error);
    // Still redirect even if backend call fails
    window.location.href = "../login/login.html";
  }
}

// Protect the dashboard from unauthorized access
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  const adminInfo = localStorage.getItem("adminInfo");

  if (!token || !adminInfo) {
    window.location.href = "../login/login.html";
  }
});
