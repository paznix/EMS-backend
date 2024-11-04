import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addDepartment, getDepartment } from '../controllers/departmentController.js';

const router = express.Router();


router.post('/add', authMiddleware, addDepartment);
router.get('/', authMiddleware, getDepartment);

export default router;