const express = require("express");
const router = express.Router();

// Request Management
router.put("/request/:id/accept", adminController.acceptRequest);
router.put("/request/:id/decline", adminController.declineRequest);
router.get("/requests/pending", adminController.viewPendingRequests);
router.get("/requests/borrowed", adminController.viewBorrowedItems);

module.exports = router;
