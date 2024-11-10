//import Admin from "../models/admin.js";

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    console.log(error);
  }
};

const getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    res.status(200).json(admin);
  } catch (error) {
    console.log(error);
  }
};

// POST
const postAdmin = async (req, res) => {
  try {
    const newAdmin = new Admin(req.body);
    const saveAdmin = await newAdmin.save();
    res.status(200).send(saveAdmin);
  } catch (error) {
    console.log(error);
  }
};

export { getAdmins, getAdmin, postAdmin };
