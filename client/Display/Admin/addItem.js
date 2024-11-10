const API_URL = "http://localhost:3000/api";

// Test connection function
async function testConnection() {
  try {
    const response = await fetch(`${API_URL}/test`);
    const data = await response.json();
    console.log("Backend connection test:", data.message);
    return true;
  } catch (error) {
    console.error("Backend connection failed:", error);
    return false;
  }
}

// Enhanced fetchItems function with better error handling
async function fetchItems() {
  try {
    const response = await fetch(`${API_URL}/admin/inventory`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched items:", data);

    if (data.data) {
      displayItems(data.data);
    }
  } catch (error) {
    console.error("Error fetching items:", error);
    alert("Failed to load items. Please check your connection.");
  }
}

// Initialize with connection test
document.addEventListener("DOMContentLoaded", async () => {
  const isConnected = await testConnection();
  if (isConnected) {
    fetchItems();
    document.getElementById("addItemBtn").onclick = openAddModal;
  } else {
    alert("Failed to connect to the backend. Please check your connection.");
  }
});
