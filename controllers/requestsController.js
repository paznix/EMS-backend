import AdminRequest from "../models/adminReqModel.js";
import LeaveRequest from "../models/leaveReqModel.js";

// Controller to get all pending admin requests
const getPendingAdminRequests = async (req, res) => {
  try {
    const adminRequests = await AdminRequest.find({ status: 'pending' }).populate('user');
    res.status(200).json({ success: true, adminRequests });
  } catch (error) {
    console.error("Error fetching admin requests:", error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Controller to get all pending leave requests
const getPendingLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ status: 'pending' }).populate('user');
    res.status(200).json({ success: true, leaveRequests });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export { getPendingAdminRequests, getPendingLeaveRequests };


