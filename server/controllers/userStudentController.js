import UserFaculty from "../models/userFaculty";
import userStudent from "../models/userStudent";
const express = require("express");
//const router = express.Router();

// Mock database for demonstration purposes

let students = [];

// Controller for Students
class UserStudentController {
  static getAllStudents(req, res) {
    res.json(students);
  }

  static createStudent(req, res) {
    const newStudent = req.body; // Assuming body contains student data
    students.push(newStudent);
    res.status(201).json(newStudent);
  }

  static getStudentById(req, res) {
    const studentId = req.params.id;
    const student = students.find((s) => s.id === studentId);
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  }

  static updateStudent(req, res) {
    const studentId = req.params.id;
    const index = students.findIndex((s) => s.id === studentId);
    if (index !== -1) {
      students[index] = { ...students[index], ...req.body };
      res.json(students[index]);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  }

  static deleteStudent(req, res) {
    const studentId = req.params.id;
    const index = students.findIndex((s) => s.id === studentId);
    if (index !== -1) {
      students.splice(index, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  }
}

// // Routes for Students
// router.get("/students", UserStudentController.getAllStudents);
// router.post("/students", UserStudentController.createStudent);
// router.get("/students/:id", UserStudentController.getStudentById);
// router.put("/students/:id", UserStudentController.updateStudent);
// router.delete("/students/:id", UserStudentController.deleteStudent);

// module.exports = router;
