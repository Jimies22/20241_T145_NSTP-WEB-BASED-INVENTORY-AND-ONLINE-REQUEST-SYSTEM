import { Router } from "express";
const router = Router();
import {
  getStudents,
  getStudent,
  postStudent,
  putStudent,
  deleteStudent,
} from "../../controllers/userStudentController.js";

// fetch logic from userStudentController.js

// Student routes
router.get("/", getStudents);
router.get("/:userId", getStudent);

router.post("/", postStudent);

router.put("/:userId", putStudent);

router.delete("/:userId", deleteStudent);

export default router;
