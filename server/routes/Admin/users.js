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
router.get("/", getStudents);
router.get("/:id", getStudent);

router.post("/", postStudent);

router.put("/:id", putStudent);

router.delete("/:id", deleteStudent);

export default router;
