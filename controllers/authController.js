import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import sendgridMail from "@sendgrid/mail";

dotenv.config({ path: "./.env" });
sendgridMail.setApiKey(process.env.SG_KEY);

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not FOUND!" });
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

  const mailOption = {
    to: email,
    from: process.env.SENDER_MAIL,
    subject: "OTP for Password Reset",
    text: `Your OTP is: ${otp}. The OTP is valid for next 10 minutes only. `,
  };

  try {
    await sendgridMail.send(mailOption);
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
        return res.status(400).json({success: false, message: "Email and Password required!"});
    };

    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({success: false, message: "User not found!"});
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashPassword;
        await user.save();
        console.log("password reset");
        
        return res.status(200).json({success:true, message: "Password reset successful!"});

    } catch (error) {
        return res.status(500).json({success: false, error: error.message})
    }
};

export { login, verify, sendOtp, verifyOtp, resetPassword };
