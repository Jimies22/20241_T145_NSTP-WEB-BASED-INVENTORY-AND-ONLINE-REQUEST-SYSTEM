import mongoose, { mongo } from "mongoose";
const { Schema } = mongoose;

const userStudentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },

  year: {
    type: String,
    required: true,
  },
  course: {
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
const studentModel = mongoose.model("student", userStudentSchema);
export default studentModel;
