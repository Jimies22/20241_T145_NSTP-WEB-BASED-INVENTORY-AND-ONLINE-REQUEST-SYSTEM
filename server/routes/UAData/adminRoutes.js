import { Router } from "express";
const router = Router();

import {
  getUsers,
  getUser,
  postUser,
  putUser,
  deleteUser,
} from "../../controllers/userController.js";

// User routes
router.get("/", getUsers);
router.get("/:user_id", getUser);

router.post("/", postUser);

router.put("/:user_id", putUser);

router.delete("/:user_id", deleteUser);

export default router;
