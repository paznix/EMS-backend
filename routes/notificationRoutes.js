// notificationRoutes.js
import express from 'express';
import { getNotifications, deleteNotification } from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
