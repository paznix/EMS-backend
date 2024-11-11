import Leave from "../models/leaveModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notifcationModel.js";
import dotenv from "dotenv";
import sendgridMail from "@sendgrid/mail";

dotenv.config({ path: "./.env" });
sendgridMail.setApiKey(process.env.SG_KEY);

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

    const leaves = await Leave.find({ userId: { $in: userIds } }).sort({ appliedDate: -1 });
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

const sendDashboardNotification = async ({ from, to, message }) => {
  try {
    const notification = new Notification({
      from,
      to,
      message,
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

  const mailOption = {
    from: process.env.SENDER_MAIL,
    subject: "New Request for Leave has been submitted!",
    text: ` A New request for leave has been submitted: \n\n
    Leave Type: ${leave.leaveType} \n
    Start Date: ${leave.startDate} \n
    End Date: ${leave.endDate} \n
    Description: ${leave.description} \n\n`,
  };

  for (const admin of admins) {
    mailOption.to = admin.email;
    try {
      await sendgridMail.send(mailOption);
      console.log("Email sent to: ", admin.email);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
};

const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, email } = req.body;

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status: "Approved" },
      { new: true }
    );

    const mailOption = {
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "Your Leave request is Approved!",
      text: `
      Dear ${user}, \n\n
      Your request for leave is approved by one of the Admins. Check details by visiting the dashboard.`,
    };

    await sendgridMail.send(mailOption);
    console.log("Email sent successfully!");

    if (!leave) {
      return res.status(404).json({ success: false, error: "Leave not found" });
    }
    res.status(200).json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, email } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      id,
      { status: "Rejected" },
      { new: true }
    );

    const mailOption = {
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "Your Leave request is Rejected!",
      text: `
      Dear ${user}, \n\n
      Your request for leave is rejected by one of the Admins. Check details by visiting the dashboard.`,
    };

    await sendgridMail.send(mailOption);
    console.log("Email sent successfully!");

    if (!leave) {
      return res.status(404).json({ success: false, error: "Leave not found" });
    }
    res.status(200).json({ success: true, leave });
  } catch (error) {
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
