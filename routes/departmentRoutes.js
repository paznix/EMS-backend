import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addDepartment, getDepartment, updateDepartment, getSpecificDepartment, deleteDepartment } from '../controllers/departmentController.js';

const router = express.Router();



router.get('/', getDepartment);
router.get('/:id', getSpecificDepartment);

router.post('/add', authMiddleware, addDepartment);


router.put('/:id/update', updateDepartment);


router.delete('/:id', deleteDepartment);

export default router;