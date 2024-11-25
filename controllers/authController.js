import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Notification from "../models/notifcationModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { sendEmail } from "./mailer.js";
import Registration from "../models/registrationsModel.js";

dotenv.config({ path: "./.env" });

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not FOUND!" });
    }

    if (!user.active) {
      return res
        .status(400)
        .json({ success: false, error: "Your account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Wrong Password!" });
    }
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: { _id: user._id, firstName: user.firstName, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const verify = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

const sendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    console.log("User not Found!");
    return res.status(404).json({ success: false, error: "User not FOUND!" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP EXPIRES IN 10 MINS

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  try {
    await sendEmail({
      from: `Leave MS`,
      to: email,
      subject: `OTP for Password Reset`,
      html: `<h3>Your OTP is: ${otp}.</h3>
              <p>The OTP is valid for next 10 minutes only.</p>
      `,
    });
    console.log(otp);
    return res
      .status(200)
      .json({ sucess: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, error: "User not FOUND!" });
  }
  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid or Expired OTP!" });
  }
  return res.status(200).json({ success: true, message: "OTP Verified!" });
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  console.log(newPassword);

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Email and Password required!" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashPassword;
    await user.save();
    console.log("password reset");

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful!" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
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
  } catch (error) {
    console.error("Error sending dashboard notification:", error);
  }
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, empID, email, password } = req.body;
    const userExistsByEmail = await User.findOne({ email });
    const userExistsByEmpID = await User.findOne({ empID });

    if (userExistsByEmail || userExistsByEmpID) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      empID,
      email,
      password: hashedPassword,
      role: "emp",
      active: false, // Set the account to inactive by default
    });
    await user.save();

    const regReguest = new Registration({
      user: user._id,
      interacted: false
    });

    console.log(user._id);
    

    await regReguest.save();

    const superAdmin = await User.findOne({ role: "superAdmin" });
    if (superAdmin) {
      await sendDashboardNotification({
        from: user._id,
        to: superAdmin._id,
        message: `Account Registration.`,
        notificationType: "registration",
      });
      await sendEmail({
        from: "Leave MS",
        to: superAdmin.email,
        subject: "New Account Registration Request",
        html: `<h3>New Account Registration</h3>
             <p>A new user has registered and is awaiting approval.</p>
             <p>Details:</p>
             <ul>
               <li>Name: ${firstName} ${lastName}</li>
               <li>Employee ID: ${empID}</li>
               <li>Email: ${email}</li>
             </ul>
             <p>Please review and approve the account in the admin dashboard.</p>`,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully! Awaiting approval from superadmin.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await sendEmail({
      from: `Leave MS`,
      to: user.email,
      subject: `Password Changed Successfully`,
      html: `<h3>Hello ${user.firstName},</h3> 
      <p>Your password has been successfully changed.</p> 
      <p>Best regards,</p> <p>Leave MS Team</p>`,
    });

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export {
  login,
  verify,
  sendOtp,
  verifyOtp,
  resetPassword,
  register,
  changePassword,
};
