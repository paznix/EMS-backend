import mongoose from "mongoose";
import User from "./userModel.js";

const leaveRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Sick", "Vacation", "Casual", "Other"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    reason: {
      type: String,
      required: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    leaveDuration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

leaveRequestSchema.virtual("userDetails", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

leaveRequestSchema.methods.calculateLeaveDuration = function () {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const duration = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
  this.leaveDuration = duration;
  return duration;
};

leaveRequestSchema.pre("save", function (next) {
  if (this.isModified("startDate") || this.isModified("endDate")) {
    this.calculateLeaveDuration();
  }
  next();
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

export default LeaveRequest;
