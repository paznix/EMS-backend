import AdminRequest from "../models/adminReqModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notifcationModel.js";

const sendDashboardNotification = async ({
  from,
  to,
  message,
  notificationType,
}) => {
  try {
    const notification = new Notification({
      from,
      to,
      message,
      notificationType,
    });
    await notification.save();
  } catch (error) {
    console.error("Error sending dashboard notification:", error);
  }
};

// Get all admin requests (only for super admins)
const getAllAdminRequests = async (req, res) => {
  try {
    const adminRequests = await AdminRequest.find()
      .populate("user", "firstName lastName email deptName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, adminRequests });
  } catch (error) {
    console.error("Error fetching admin requests:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Server error while fetching admin requests",
      });
  }
};

const getSpecificRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await AdminRequest.findById(id);
    return res.status(200).json({ success: true, admin });
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ success: false, error: "Server error while fetching" });
  }
};

// Approve an admin request
const approveAdminRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, email, fromUser } = req.body;
    const adminRequest = await AdminRequest.findById(id);

    if (!adminRequest) {
      return res
        .status(404)
        .json({ success: false, error: "Admin request not found" });
    }

    adminRequest.status = "Approved";
    await adminRequest.save();

    const notificationMessage = "You've been granted ADMIN access.";

    // Optionally, grant admin rights to the user
    await User.findByIdAndUpdate(adminRequest.user, { role: "admin" });
    await sendDashboardNotification({
      from: fromUser,
      to: user,
      message: notificationMessage,
      notificationType: "leaveRes",
    });
    res.status(200).json({ success: true, message: "Admin request approved" });
  } catch (error) {
    console.error("Error approving admin request:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Server error while approving admin request",
      });
  }
};

// Reject an admin request
const rejectAdminRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, email, fromUser } = req.body;
    const adminRequest = await AdminRequest.findById(id);

    if (!adminRequest) {
      return res
        .status(404)
        .json({ success: false, error: "Admin request not found" });
    }

    const notificationMessage = "You've been rejected for ADMIN access.";

    adminRequest.status = "Rejected";
    await adminRequest.save();

    await sendDashboardNotification({
      from: fromUser,
      to: user,
      message: notificationMessage,
      notificationType: "leaveRes",
    });

    res.status(200).json({ success: true, message: "Admin request rejected" });
  } catch (error) {
    console.error("Error rejecting admin request:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Server error while rejecting admin request",
      });
  }
};

export {
  getAllAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  getSpecificRequest,
};
