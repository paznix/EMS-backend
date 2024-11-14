import express from "express";
import {
  getAllAdminRequests,
  getSpecificRequest,
  approveAdminRequest,
  rejectAdminRequest,
} from "../controllers/adminReqController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", getAllAdminRequests);
router.get("/admin/:id", getSpecificRequest);

router.put("/admin/:id/approve", authMiddleware, approveAdminRequest);
router.put("/admin/:id/reject", authMiddleware, rejectAdminRequest);

export default router;
