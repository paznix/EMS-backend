import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addLeave, getLeaves, getSpecificLeave } from '../controllers/leaveController.js';

const router = express.Router();

router.post('/add', authMiddleware, addLeave);
router.get('/:id', authMiddleware, getLeaves);
router.get('/view/:id', authMiddleware, getSpecificLeave);

export default router;