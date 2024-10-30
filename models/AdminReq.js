import mongoose from "mongoose";

const adminReqSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    status: { type: String, required: true, enum: ["Pending", "Approved", "Rejected"]},
});

const AdminReq = mongoose.model("AdminReq", adminReqSchema);

export default AdminReq;