import express from 'express';
import { getPendingAdminRequests } from '../controllers/requestsController.js';
import { getPendingLeaveRequests } from '../controllers/requestsController.js';

const router = express.Router();

router.get('/admin-requests', getPendingAdminRequests);
router.get('/leave-requests', getPendingLeaveRequests);

export default router;
