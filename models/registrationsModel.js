import mongoose from "mongoose";
const regSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interacted: {
    type: Boolean,
    default: false,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Registration = mongoose.model('Registration', regSchema);
export default Registration;