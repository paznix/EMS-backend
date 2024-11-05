import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addDepartment, getDepartment, updateDepartment, getSpecificDepartment } from '../controllers/departmentController.js';

const router = express.Router();


router.post('/add', authMiddleware, addDepartment);
router.get('/', getDepartment);
router.get('/:id', getSpecificDepartment);
router.put('/:id/update', updateDepartment);

export default router;