import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addLeave, getLeaves, getSpecificLeave, getLeaveRequests, approveLeave, rejectLeave } from '../controllers/leaveController.js';

const router = express.Router();

router.post('/add', authMiddleware, addLeave);
router.get('/:id', authMiddleware, getLeaves);
router.get('/view/:id', authMiddleware, getSpecificLeave);
router.get('/department/:department', authMiddleware, getLeaveRequests);
router.put('/:id/approve', approveLeave);
router.put('/:id/reject', rejectLeave);

export default router;