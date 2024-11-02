import UserFaculty from "../models/userFaculty";
import userStudent from "../models/userStudent";
const express = require("express");
//const router = express.Router();

// Mock database for demonstration purposes
let facultyMembers = [];
let students = [];

// Controller for Faculty
class UserFacultyController {
  static getAllFaculty(req, res) {
    res.json(facultyMembers);
  }

  static createFaculty(req, res) {
    const newFaculty = req.body; // Assuming body contains faculty data
    facultyMembers.push(newFaculty);
    res.status(201).json(newFaculty);
  }

  static getFacultyById(req, res) {
    const facultyId = req.params.id;
    const faculty = facultyMembers.find((f) => f.id === facultyId);
    if (faculty) {
      res.json(faculty);
    } else {
      res.status(404).json({ message: "Faculty not found" });
    }
  }

  static updateFaculty(req, res) {
    const facultyId = req.params.id;
    const index = facultyMembers.findIndex((f) => f.id === facultyId);
    if (index !== -1) {
      facultyMembers[index] = { ...facultyMembers[index], ...req.body };
      res.json(facultyMembers[index]);
    } else {
      res.status(404).json({ message: "Faculty not found" });
    }
  }

  static deleteFaculty(req, res) {
    const facultyId = req.params.id;
    const index = facultyMembers.findIndex((f) => f.id === facultyId);
    if (index !== -1) {
      facultyMembers.splice(index, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Faculty not found" });
    }
  }
}

// // Routes for Faculty
// router.get("/faculty", UserFacultyController.getAllFaculty);
// router.post("/faculty", UserFacultyController.createFaculty);
// router.get("/faculty/:id", UserFacultyController.getFacultyById);
// router.put("/faculty/:id", UserFacultyController.updateFaculty);
// router.delete("/faculty/:id", UserFacultyController.deleteFaculty);

// module.exports = router;