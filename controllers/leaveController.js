import Leave from "../models/leaveModel.js";
import User from "../models/userModel.js";
import dotenv from "dotenv";
import sendgridMail from "@sendgrid/mail";

dotenv.config({ path: "./.env" });
sendgridMail.setApiKey(process.env.SG_KEY);

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
    const employee = await User.findOne({ userId: id });

    const leaves = await Leave.find({ userId: employee._id });
    return res.status(200).json({ success: true, leaves });
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ success: false, error: "Server error while fetching" });
  }
};

const sendLeaveMail = async (leave) => {
  const admins = await User.find({ role: { $in: ["admin", "superAdmin"] } });

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

export { addLeave, getLeaves };
