import express from "express";
import { changePassword, login, register, resetPassword, sendOtp, verify, verifyOtp } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/login', login);
router.get('/verify', authMiddleware, verify);
router.post('/forget-password/otp', sendOtp);
router.post('/forget-password/verify-otp', verifyOtp);
router.post('/reset-password/', resetPassword);
router.post('/register/', register);

router.put('/change-password', authMiddleware, changePassword)


export default router;