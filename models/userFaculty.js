import mongoose, { mongo } from "mongoose";
const { Schema } = mongoose;

const userFacultySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  fac_id: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  //   hobby: {
  //     type: String,
  //   },
  //   section: {
  //     type: String,
  //     required: true,
  //   },
});
const facultyModel = mongoose.model("faculty", userFacultySchema);
export default facultyModel;
