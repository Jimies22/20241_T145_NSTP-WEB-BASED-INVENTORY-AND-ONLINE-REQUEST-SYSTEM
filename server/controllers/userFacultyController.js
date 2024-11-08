import facultyModel from "../models/userFaculty.js";

const getFaculties = async (req, res) => {
  try {
    const faculties = await facultyModel.find();
    res.send({ data: faculties });
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve faculties" });
  }
};

// const getFaculty = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const faculty = await facultyModel.findOne({ user_id: userId });
//     if (faculty) {
//       res.send({ data: faculty });
//     } else {
//       res
//         .status(404)
//         .send({ error: `Faculty with user_id ${userId} not found` });
//     }
//   } catch (error) {
//     res.status(500).send({ error: "Failed to retrieve faculty" });
//   }
// };

const getFaculty = async (req, res) => {
  const { fac_id } = req.params; // Assuming fac_id is in the route parameters
  try {
    const faculty = await facultyModel.findOne({ fac_id }); // Querying with fac_id
    if (faculty) {
      res.send({ data: faculty });
    } else {
      res
        .status(404)
        .send({ error: `Faculty with fac_id ${fac_id} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve faculty" });
  }
};

const postFaculty = async (req, res) => {
  const faculties = req.body; // Expecting either a single faculty object or an array of faculty objects

  try {
    // Validate that the request body is an array or a single object
    if (!Array.isArray(faculties)) {
      // If it's a single faculty object
      const newFaculty = new facultyModel(faculties); // Create a new faculty instance
      const savedFaculty = await newFaculty.save(); // Save the faculty to the database
      res
        .status(200)
        .send({ data: `Faculty ${savedFaculty.name} created successfully` }); // Send a success response
    } else {
      // If it's an array of faculty objects
      const newFaculties = await Promise.all(
        faculties.map(async (facultyData) => {
          const newFaculty = new facultyModel(facultyData); // Create a new faculty instance for each object
          return newFaculty.save(); // Save each faculty
        })
      );

      res.status(200).send({
        data: `${newFaculties.length} faculties created successfully`,
      }); // Send a success response for multiple faculties
    }
  } catch (error) {
    console.error("Error saving faculties:", error); // Log the error
    res.status(500).send({ error: "Failed to create faculties" }); // Send an error response
  }
};

const putFaculty = async (req, res) => {
  const { userId } = req.params;
  const { name, gender, email, department, position } = req.body;
  try {
    const updatedFaculty = await facultyModel.findOneAndUpdate(
      { user_id: userId },
      { name, gender, email, department, position },
      { new: true } // Return the updated document
    );
    if (updatedFaculty) {
      res.send({
        data: `Faculty with user_id ${userId} updated successfully`,
        updatedFaculty,
      });
    } else {
      res
        .status(404)
        .send({ error: `Faculty with user_id ${userId} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to update faculty" });
  }
};

const deleteFaculty = async (req, res) => {
  const { userId } = req.params;
  try {
    const deletedFaculty = await facultyModel.findOneAndDelete({
      user_id: userId,
    });
    if (deletedFaculty) {
      res.send({ data: `Faculty with user_id ${userId} deleted successfully` });
    } else {
      res
        .status(404)
        .send({ error: `Faculty with user_id ${userId} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to delete faculty" });
  }
};

export { getFaculties, getFaculty, postFaculty, putFaculty, deleteFaculty };
