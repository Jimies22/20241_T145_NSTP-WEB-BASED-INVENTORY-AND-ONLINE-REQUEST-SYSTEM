export const addNotification = (notification) => {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  notifications.unshift({
    id: "notif_" + Date.now(),
    timestamp: new Date().toISOString(),
    read: false,
    ...notification,
  });
  localStorage.setItem("notifications", JSON.stringify(notifications));
  updateNotificationCount();
};

export const markNotificationAsRead = (notificationId) => {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  const updatedNotifications = notifications.map((notification) => {
    if (notification.id === notificationId) {
      return { ...notification, read: true };
    }
    return notification;
  });
  localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  updateNotificationCount();
};

export const updateNotificationCount = () => {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  const unreadCount = notifications.filter((n) => !n.read).length;
  return unreadCount;
};
