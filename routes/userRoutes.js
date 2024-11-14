import express from 'express';
import { getDeptUserCount,getEmpUsers, getUserData, getUsers, addEmployee, deleteUser, editEmployee, approveAdminAccess, updateUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js'
import cloudinaryFileUploader from '../middleware/fileUploader.js';

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/emp', getEmpUsers);
router.get('/users/count/:department', getDeptUserCount);
router.get('/users/:id',  getUserData);
router.delete('/users/:id',  deleteUser);
router.post('/users/add', addEmployee);
router.put('/users/emp/:id', editEmployee);
router.post('/approveAdmin/:from', approveAdminAccess);

router.put('/users/:id', cloudinaryFileUploader.single('profileImage'), updateUser);

export default router;
