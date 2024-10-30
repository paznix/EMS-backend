import express from "express";
import { login, resetPassword, sendOtp, verify, verifyOtp } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/login', login);
router.get('/verify', authMiddleware, verify);
router.post('/forget-password/otp', sendOtp);
router.post('/forget-password/verify-otp', verifyOtp);
router.post('/reset-password/', resetPassword);


export default router;