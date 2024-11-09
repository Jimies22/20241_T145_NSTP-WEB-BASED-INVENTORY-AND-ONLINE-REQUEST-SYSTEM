// Notification System
function updateNotificationCount() {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const unreadCount = notifications.filter(notif => !notif.read).length;
    const numElement = document.querySelector('.notification .num');
    if (unreadCount > 0) {
        numElement.style.display = 'block';
        numElement.textContent = unreadCount;
    } else {
        numElement.style.display = 'none';
    }
}

function addNotification(type, title, message) {
    const notification = {
        id: 'notif_' + Date.now(),
        type: type,
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };

    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationCount();
}

function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
}

function getIconClass(type) {
    switch(type) {
        case 'booking': return 'bx bx-calendar';
        case 'accepted': return 'bx bx-check-circle';
        case 'canceled': return 'bx bx-x-circle';
        case 'returned': return 'bx bx-rotate-left';
        default: return 'bx bx-bell';
    }
}

// Add function to mark notification as read
function markNotificationAsRead(notificationId) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification && !notification.read) {
        notification.read = true;
        localStorage.setItem('notifications', JSON.stringify(notifications));
        updateNotificationCount();
    }
}

// Add function to mark all notifications as read
function markAllNotificationsAsRead() {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications = notifications.map(notif => ({...notif, read: true}));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationCount();
}

// Initialize notifications when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateNotificationCount();
}); 