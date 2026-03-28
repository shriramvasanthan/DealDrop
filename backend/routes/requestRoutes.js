import express from 'express';
import { createRequest, getNearbyRequests } from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getNearbyRequests)
  .post(protect, createRequest);

export default router;
