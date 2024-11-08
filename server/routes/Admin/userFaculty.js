import { Router } from "express";
const router = Router();

import {
  getFaculties,
  getFaculty,
  postFaculty,
  putFaculty,
  deleteFaculty,
} from "../../controllers/userFacultyController.js";

// fetch logic from userFaculty.js

// Faculty routes
router.get("/", getFaculties);
router.get("/:fac_id", getFaculty);

router.post("/", postFaculty);

router.put("/:fac_id", putFaculty);

router.delete("/:fac_id", deleteFaculty);

export default router;
