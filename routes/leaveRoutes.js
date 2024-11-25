import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addLeave,
  getLeaves,
  getSpecificLeave,
  getLeaveRequests,
  approveLeave,
  rejectLeave,
  getAllLeaves,
} from "../controllers/leaveController.js";
import cloudinaryFileUploader from "../middleware/fileUploader.js";

const router = express.Router();

router.post("/add", authMiddleware, cloudinaryFileUploader.single('document'), addLeave);
router.get("/:id", authMiddleware, getLeaves);
router.get("/view/:id", authMiddleware, getSpecificLeave);
router.get("/department/:department", authMiddleware, getLeaveRequests);
router.put("/:id/approve", authMiddleware, approveLeave);
router.put("/:id/reject", authMiddleware, rejectLeave);
router.get("/", authMiddleware, getAllLeaves);

export default router;
