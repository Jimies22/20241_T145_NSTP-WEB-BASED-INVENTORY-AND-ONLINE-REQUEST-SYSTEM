// // const express = require("express");
// // const router = express.Router();
// // const adminController = require("../../controllers/adminController");

// // // Authentication
// // router.post("/login", adminController.login);
// // router.post("/signup", adminController.signup);
// // router.post("/login/google", adminController.googleLogin);
// // router.post("/logout", adminController.logout);
// // router.get("/session", adminController.checkSession);
// // router.post("/verify-email", adminController.verifyEmail);
// // router.put("/update-profile", adminController.updateProfile);
// // router.post("/refresh-token", adminController.refreshToken);

// // // Request Management
// // router.put("/request/:id/accept", adminController.acceptRequest);
// // router.put("/request/:id/decline", adminController.declineRequest);
// // router.get("/requests/pending", adminController.viewPendingRequests);
// // router.get("/requests/borrowed", adminController.viewBorrowedItems);

// // // Inventory Management
// // router.get("/items/search", adminController.searchItems);
// // router.get("/items/filter", adminController.filterItems);
// // router.post("/items", adminController.addItem);
// // router.put("/items/:id", adminController.updateItem);
// // router.put("/items/:id/archive", adminController.archiveItem);
// // router.get("/items/archived", adminController.viewArchivedItems);
// // router.post("/items/scanReturn", adminController.scanItemReturn);

// // // Notifications
// // router.get("/notifications", adminController.viewNotifications);

// // // Reporting
// // router.get("/reports", adminController.viewReports);

// // module.exports = router;

// const express = require("express");
// const router = express.Router();
// const userController = require("../../controllers/userController");

// // Authentication
// router.post("/login", userController.login);
// router.post("/signup", userController.signup);
// router.post("/login/google", userController.googleLogin);
// router.post("/logout", userController.logout);
// router.get("/session", userController.checkSession);
// router.post("/verify-email", userController.verifyEmail);
// router.put("/update-profile", userController.updateProfile);
// router.post("/refresh-token", userController.refreshToken);

// // Dashboard and Profile
// router.get("/dashboard", userController.getDashboard);
// router.get("/profile", userController.getProfile);

// // Inventory
// router.get("/inventory/search", userController.searchInventory);
// router.get("/inventory/view", userController.viewInventory);
// router.get("/inventory/sort", userController.sortInventory);

// // Bookings and Requests
// router.post("/bookings", userController.placeBooking);
// router.delete("/bookings/cancel", userController.cancelBooking);
// router.get("/requests", userController.viewRequests);
// router.get("/bookings/pending", userController.viewPendingBookings);
// router.get("/bookings/accepted", userController.viewAcceptedBookings);
// router.get("/bookings/return", userController.viewItemsToReturn);
// router.post("/items/scanReturn", userController.scanItemReturn);

// // Notifications and Reports
// router.get("/notifications", userController.viewNotifications);
// router.get("/reports/returned", userController.viewReturnedReports);

// module.exports = router;