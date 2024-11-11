import express from 'express';
import { getDeptUserCount,getEmpUsers, getUserData, getUsers, addEmployee, deleteUser, editEmployee, approveAdminAccess } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/emp', getEmpUsers);
router.get('/users/count/:department', getDeptUserCount);
router.get('/users/:id',  getUserData);
router.delete('/users/:id',  deleteUser);
router.post('/users/add', addEmployee);
router.put('/users/:id', editEmployee);
router.post('/approveAdmin/:from', approveAdminAccess);

export default router;
