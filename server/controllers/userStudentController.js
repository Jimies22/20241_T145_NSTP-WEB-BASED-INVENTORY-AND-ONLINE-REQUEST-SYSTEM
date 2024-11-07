import studentModel from "../models/userStudent.js";

const getStudents = async (req, res) => {
  try {
    const students = await studentModel.find();
    res.send({ data: students });
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve students" });
  }
};

const getStudent = async (req, res) => {
  const { userId } = req.params;
  try {
    const student = await studentModel.findOne({ user_id: userId });
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
};

const postStudent = async (req, res) => {
  const students = req.body; // Expecting either a single student object or an array of student objects

  try {
    // Validate that the request body is an array or a single object
    if (!Array.isArray(students)) {
      // If it's a single student object
      const newStudent = new Student(students); // Create a new student instance
      const savedStudent = await newStudent.save(); // Save the student to the database
      res
        .status(200)
        .send({ data: `Student ${savedStudent.name} created successfully` }); // Send a success response
    } else {
      // If it's an array of student objects
      const newStudents = await Promise.all(
        students.map(async (studentData) => {
          const newStudent = new Student(studentData); // Create a new student instance for each object
          return newStudent.save(); // Save each student
        })
      );

      res
        .status(200)
        .send({ data: `${newStudents.length} students created successfully` }); // Send a success response for multiple students
    }
  } catch (error) {
    console.error("Error saving students:", error); // Log the error
    res.status(500).send({ error: "Failed to create students" }); // Send an error response
  }
};

const putStudent = async (req, res) => {
  const { userId } = req.params;
  const { name, gender, email, year, course } = req.body;
  try {
    const updatedStudent = await studentModel.findOneAndUpdate(
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
};

const deleteStudent = async (req, res) => {
  const { userId } = req.params;
  try {
    const deletedStudent = await studentModel.findOneAndDelete({
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
};

export { getStudents, getStudent, postStudent, putStudent, deleteStudent };
