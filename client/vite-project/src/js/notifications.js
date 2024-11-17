// Update notification count when storage changes
window.addEventListener("storage", function (e) {
  if (e.key === "notifications") {
    const notifications =
      JSON.parse(localStorage.getItem("notifications")) || [];
    const notificationCounter = document.getElementById("notification-count");
    if (notificationCounter) {
      notificationCounter.textContent = notifications.filter(
        (n) => !n.read
      ).length;
    }
  }
});

// Function to update notification count
function updateNotificationCount() {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  const notificationCounter = document.getElementById("notification-count");
  if (notificationCounter) {
    notificationCounter.textContent = notifications.filter(
      (n) => !n.read
    ).length;
  }
}
