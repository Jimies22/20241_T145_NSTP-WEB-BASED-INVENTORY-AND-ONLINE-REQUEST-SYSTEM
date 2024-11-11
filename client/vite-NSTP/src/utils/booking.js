export const createBooking = async (bookingData) => {
  try {
    // Add request to localStorage
    const requestItem = {
      id: "req_" + Date.now(),
      ...bookingData,
      status: "Pending",
      requestedAt: new Date().toISOString(),
    };

    // Store request
    const requestedItems =
      JSON.parse(localStorage.getItem("requestedItems")) || [];
    requestedItems.unshift(requestItem);
    localStorage.setItem("requestedItems", JSON.stringify(requestedItems));

    // Create notification
    const notification = {
      type: "booking",
      title: bookingData.title,
      message: `You have requested to borrow ${bookingData.title} for ${bookingData.date} at ${bookingData.time}`,
      status: "Pending",
    };

    // Add notification
    const notifications =
      JSON.parse(localStorage.getItem("notifications")) || [];
    notifications.unshift({
      id: "notif_" + Date.now(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    });
    localStorage.setItem("notifications", JSON.stringify(notifications));

    return { success: true, data: requestItem };
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error("Failed to create booking");
  }
};

export const updateBookingStatus = (bookingId, newStatus) => {
  try {
    const requestedItems =
      JSON.parse(localStorage.getItem("requestedItems")) || [];
    const updatedItems = requestedItems.map((item) => {
      if (item.id === bookingId) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    localStorage.setItem("requestedItems", JSON.stringify(updatedItems));

    // Add status change notification
    const item = updatedItems.find((item) => item.id === bookingId);
    if (item) {
      const notification = {
        type: newStatus.toLowerCase(),
        title: item.title,
        message: `Your request for ${item.title} has been ${newStatus}`,
        timestamp: new Date().toISOString(),
        read: false,
      };

      const notifications =
        JSON.parse(localStorage.getItem("notifications")) || [];
      notifications.unshift({
        id: "notif_" + Date.now(),
        ...notification,
      });
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status");
  }
};
