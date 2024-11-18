import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Optional: Call backend logout endpoint
    fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error);
        navigate("/login");
      });
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default Logout;
