import express from 'express';
import { getDeptUserCount, getUserData, getUsers } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/count/:department', getDeptUserCount);
router.get('/users/:id',  getUserData);

export default router;
