import { Router } from "express";
const router = Router();

import {
  getAdmins,
  getAdmin,
  postAdmin,
  putAdmin,
  deleteAdmin,
} from "../../controllers/adminController.js";

// Admin routes
router.get("/", getAdmins);
router.get("/:admin_id", getAdmin);

router.post("/", postAdmin);

router.put("/:admin_id", putAdmin);

router.delete("/:admin_id", deleteAdmin);

export default router;
