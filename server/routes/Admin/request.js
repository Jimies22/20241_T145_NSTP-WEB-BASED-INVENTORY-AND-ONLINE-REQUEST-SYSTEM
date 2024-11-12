// // request
// import { Router } from "express";
// const router = Router();

// // Accept a request by ID
// router.put("/accept/:id", (req, res) => {
//   const { id } = req.params; // Get request ID from the request parameters
//   res.send({ message: `Request with ID ${id} accepted successfully` });
// });

// // Decline a request by ID
// router.put("/decline/:id", (req, res) => {
//   const { id } = req.params; // Get request ID from the request parameters
//   res.send({ message: `Request with ID ${id} declined successfully` });
// });

// // Get a list of pending requests
// router.get("/pending", (req, res) => {
//   res.send({ message: "List of pending requests" });
// });

// // Get a list of borrowed items
// router.get("/borrowed", (req, res) => {
//   res.send({ message: "List of borrowed items" });
// });

// export default router;
