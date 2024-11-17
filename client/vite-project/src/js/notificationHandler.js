function initializeNotifications() {
  // Get notifications from localStorage
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Update UI
  function updateNotificationUI(newCount) {
    const countElements = document.querySelectorAll(
      "#notification-count, .badge"
    );
    countElements.forEach((element) => {
      if (element) {
        element.textContent = newCount;
        element.style.display = newCount > 0 ? "block" : "none";
      }
    });
  }

  // Update localStorage
  localStorage.setItem("unreadNotificationCount", unreadCount);

  // Initial UI update
  updateNotificationUI(unreadCount);

  // Listen for storage changes from other pages
  window.addEventListener("storage", function (e) {
    if (e.key === "notifications" || e.key === "unreadNotificationCount") {
      const newCount =
        parseInt(localStorage.getItem("unreadNotificationCount")) || 0;
      updateNotificationUI(newCount);
    }
  });

  // Listen for custom events
  window.addEventListener("notificationCountUpdated", function (e) {
    updateNotificationUI();
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeNotifications);
} else {
  initializeNotifications();
}
