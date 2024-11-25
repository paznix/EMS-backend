import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  leaveType: {
    type: String,
    required: true,
    enum: ["Sick Leave", "Vacation", "Personal Leave", "Other"],
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  reason: { type: String },
  appliedDate: { type: Date, default: Date.now },
  document: { type: String },
});

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
