import { Router } from "express";
const router = Router();
import studentModel from "../../models/userStudent.js"; // Adjust path if necessary

// Get all users
router.get("/", async (req, res) => {
  // Logic to retrieve all users
  //res.send({ data: "Here is the list of all users" });

  try {
    const students = await studentModel.find();
    res.send({ data: students });
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve students" });
  }
});

// Get a specific user by ID
router.get("/:userId", async (req, res) => {
  //const { userId } = req.params; // Get the user ID from the request parameters
  // Logic to retrieve a specific user by ID
  //res.send({ data: `Details for user with ID: ${userId}` });

  const { userId } = req.params;
  try {
    const student = await findOne({ user_id: userId });
    if (student) {
      res.send({ data: student });
    } else {
      res
        .status(404)
        .send({ error: `Student with user_id ${userId} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve student" });
  }
});

// Create a new user
// router.post("/", async (req, res) => {
//   //const { username, email } = req.body; // Assuming you send username and email in the body
//   // Logic to create a new user
//   //res.send({ data: `User ${username} created successfully` });

//   const { name, user_id, gender, email, year, course } = req.body;
//   try {
//     const newStudent = new studentModel({
//       name,
//       user_id,
//       gender,
//       email,
//       year,
//       course,
//     });
//     await newStudent.save();
//     res.send({ data: `Student ${name} created successfully` });
//   } catch (error) {
//     res.status(500).send({ error: "Failed to create student" });
//   }
// });

router.post("/", async (req, res) => {
  const { name, user_id, gender, email, year, course } = req.body;
  const students = req.body; // Expecting an array of student objects
  try {
    // Validate that the request body is an array
    if (!Array.isArray(students)) {
      const newStudent = new studentModel({
        name,
        user_id,
        gender,
        email,
        year,
        course,
      });
      await newStudent.save();
      res.send({ data: `Student ${name} created successfully` });
    }

    // Map over the array to create and save each student concurrently
    const newStudents = await Promise.all(
      students.map(async (studentData) => {
        const { name, user_id, gender, email, year, course } = studentData;
        const newStudent = new studentModel({
          name,
          user_id,
          gender,
          email,
          year,
          course,
        });
        return newStudent.save();
      })
    );

    res.send({ data: `${newStudents.length} students created successfully` });
  } catch (error) {
    console.error("Error saving students:", error);
    res.status(500).send({ error: "Failed to create students" });
  }
});

// Update an existing user
router.put("/:userId", async (req, res) => {
  // const { userId } = req.params; // Get the user ID from the request parameters
  //const { username, email } = req.body; // Assuming you send updated data in the body
  // Logic to update the user
  //res.send({ data: `User with ID ${userId} updated successfully` });

  const { userId } = req.params;
  const { name, gender, email, year, course } = req.body;
  try {
    const updatedStudent = await findOneAndUpdate(
      { user_id: userId },
      { name, gender, email, year, course },
      { new: true } // Return the updated document
    );
    if (updatedStudent) {
      res.send({
        data: `Student with user_id ${userId} updated successfully`,
        updatedStudent,
      });
    } else {
      res
        .status(404)
        .send({ error: `Student with user_id ${userId} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to update student" });
  }
});

// Delete a user
router.delete("/:userId", async (req, res) => {
  //const { userId } = req.params; // Get the user ID from the request parameters
  // Logic to delete the user
  res.send({ data: `User with ID ${userId} deleted successfully` });

  const { userId } = req.params;
  try {
    const deletedStudent = await findOneAndDelete({
      user_id: userId,
    });
    if (deletedStudent) {
      res.send({ data: `Student with user_id ${userId} deleted successfully` });
    } else {
      res
        .status(404)
        .send({ error: `Student with user_id ${userId} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to delete student" });
  }
});

export default router;
