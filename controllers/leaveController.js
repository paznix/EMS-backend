import Leave from "../models/leaveModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notifcationModel.js";
import dotenv from "dotenv";
import { sendEmail } from "./mailer.js";

dotenv.config({ path: "./.env" });

const getLeaveRequests = async (req, res) => {
  try {
    const { department } = req.params;
    const usersInDept = await User.find({ deptName: department });

    const userIds = usersInDept.map((user) => user._id);

    if (userIds.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No users found for this department" });
    }

    const leaves = await Leave.find({ userId: { $in: userIds } }).sort({
      appliedDate: -1,
    });
    return res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error while fetching",
    });
  }
};

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
    console.log(" sent To : ", from);
  } catch (error) {
    console.error("Error sending dashboard notification:", error);
  }
};

const addLeave = async (req, res) => {
  try {
    const { userId, leaveType, startDate, endDate, description } = req.body;

    const newLeave = new Leave({
      userId,
      leaveType,
      startDate,
      endDate,
      description,
    });
    await sendLeaveMail(newLeave);
    await newLeave.save();

    const admins = await User.find({
      $or: [
        { role: "admin", deptName: userId.deptName },
        { role: "superAdmin" },
      ],
    });

    const notificationMessage = "Requested for Leave.";

    for (const admin of admins) {
      await sendDashboardNotification({
        from: userId,
        to: admin._id,
        message: notificationMessage,
        notificationType: "leaveReq",
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ success: false, error: "Leave application server error" });
  }
};

const getLeaves = async (req, res) => {
  try {
    const { id } = req.params;

    const leaves = await Leave.find({ userId: id }).sort({ appliedDate: -1 });
    return res.status(200).json({ success: true, leaves });
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ success: false, error: "Server error while fetching" });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ appliedDate: -1 });
    res.status(200).json({ success: true, leaves });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const getSpecificLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id);
    return res.status(200).json({ success: true, leave });
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ success: false, error: "Server error while fetching" });
  }
};

const sendLeaveMail = async (leave) => {
  const requester = await User.findById(leave.userId);
  const getReqDepartment = requester.deptName;

  const admins = await User.find({
    $or: [
      { role: "admin", deptName: getReqDepartment },
      { role: "superAdmin" },
    ],
  });

  for (const admin of admins) {
    try {
      await sendEmail({
        from: `${requester.firstName} ${requester.lastName}`,
        to: admin.email,
        subject: "New Request for Leave has been submitted!",
        html: `<h3> A New request for leave has been submitted: </h3>
        <p>Leave Type: ${leave.leaveType} </p>
        <p>Start Date: ${leave.startDate} </p>
        <p>End Date: ${leave.endDate} </p>
        <p>Description: ${leave.description} </p>`,
      });
      console.log("Email sent to: ", admin.email);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
};

const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, email, fromUser } = req.body;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, error: "Leave not found" });
    }

    const toUser = await User.findById(leave.userId);
    const sender = await User.findById(fromUser);

    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { status: "Pending" },
      { new: true }
    );

    const notificationMessage = `Your leave is approved.`;

    await sendEmail({
      from: `${sender.firstName} ${sender.lastName}`,
      to: email,
      subject: `Leave Approval`,
      html: `<h3>Your Leave is Approved by ${sender.firstName} ${sender.lastName}.</h3>
              <p>Visit Dashbord for more details.</p>
      `,
    });

    await sendDashboardNotification({
      from: fromUser,
      to: toUser,
      message: notificationMessage,
      notificationType: "leaveRes",
    });

    res.status(200).json({ success: true, leave: updatedLeave });
  } catch (error) {
    console.error("Error approving leave:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const { id, user, email, fromUser } = req.body;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, error: "Leave not found" });
    }

    const toUser = await User.findById(leave.userId);

    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { status: "Rejected" },
      { new: true }
    );

    const notificationMessage = `Your leave is Rejected.`;

    await sendEmail({
      from: `${sender.firstName} ${sender.lastName}`,
      to: email,
      subject: `Leave Rejected`,
      html: `<p>Your Leave is Rejected by ${sender.firstName} ${sender.lastName}.</p>
              <p>Visit Dashbord for more details.</p>
      `,
    });

    await sendDashboardNotification({
      from: fromUser,
      to: toUser,
      message: notificationMessage,
      notificationType: "leaveRes",
    });

    res.status(200).json({ success: true, leave: updatedLeave });
  } catch (error) {
    console.error("Error approving leave:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export {
  addLeave,
  getLeaves,
  getSpecificLeave,
  getAllLeaves,
  getLeaveRequests,
  approveLeave,
  rejectLeave,
};
