const express = require("express");
const router = express.Router();

// Request Management
router
  .route("/request/:id")
  .put("/accept", adminController.acceptRequest)
  .put("/decline", adminController.declineRequest);

router
  .route("/requests")
  .get("/pending", adminController.viewPendingRequests)
  .get("/borrowed", adminController.viewBorrowedItems);

module.exports = router;
