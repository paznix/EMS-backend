import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    deptName: {type: String, required: true},
    deptCode: {type: String, required: true},
    deptRemarks: {type: String},
    deptHead: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

const Department = mongoose.model("Department", departmentSchema);
export default Department;