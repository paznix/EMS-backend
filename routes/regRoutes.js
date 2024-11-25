import express from "express";
import { getRegistrations, activateAccount } from "../controllers/regController.js";
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router();

router.get("/", authMiddleware, getRegistrations);
router.put("/activate/:userId", authMiddleware, activateAccount)

export default router;
