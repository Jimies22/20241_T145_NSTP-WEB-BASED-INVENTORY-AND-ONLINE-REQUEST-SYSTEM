import userModel from "../models/userModel.js";

const getUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.send({ data: users });
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve users" });
  }
};

const getUser = async (req, res) => {
  const { user_id } = req.params; // Assuming user_id is in the route parameters
  try {
    const user = await userModel.findOne({ user_id }); // Querying with user_id
    if (user) {
      res.send({ data: user });
    } else {
      res.status(404).send({ error: `User with user_id ${user_id} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve user" });
  }
};

const postUser = async (req, res) => {
  const users = req.body; // Expecting either a single user object or an array of user objects

  try {
    // Validate that the request body is an array or a single object
    if (!Array.isArray(users)) {
      // If it's a single user object
      const newUser = new userModel(users); // Create a new user instance
      const savedUser = await newUser.save(); // Save the user to the database
      res
        .status(200)
        .send({ data: `User ${savedUser.name} created successfully` }); // Send a success response
    } else {
      // If it's an array of user objects
      const newUsers = await Promise.all(
        users.map(async (userData) => {
          const newUser = new userModel(userData); // Create a new user instance for each object
          return newUser.save(); // Save each user
        })
      );

      res.status(200).send({
        data: `${newUsers.length} users created successfully`,
      }); // Send a success response for multiple users
    }
  } catch (error) {
    console.error("Error saving users:", error); // Log the error
    res.status(500).send({ error: "Failed to create users" }); // Send an error response
  }
};

const putUser = async (req, res) => {
  const { userId } = req.params;
  const { name, gender, email, department, position } = req.body;
  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { user_id: userId },
      { name, gender, email, department, position },
      { new: true } // Return the updated document
    );
    if (updatedUser) {
      res.send({
        data: `User with user_id ${userId} updated successfully`,
        updatedUser,
      });
    } else {
      res.status(404).send({ error: `User with user_id ${userId} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to update user" });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const deletedUser = await userModel.findOneAndDelete({
      user_id: userId,
    });
    if (deletedUser) {
      res.send({ data: `User with user_id ${userId} deleted successfully` });
    } else {
      res.status(404).send({ error: `User with user_id ${userId} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to delete user" });
  }
};

export { getUsers, getUser, postUser, putUser, deleteUser };
