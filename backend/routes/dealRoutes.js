import express from 'express';
import { getDeals, getRetailerDeals, createDeal } from '../controllers/dealController.js';
import { protect, retailerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getDeals).post(protect, retailerOnly, createDeal);
router.route('/retailer').get(protect, retailerOnly, getRetailerDeals);

export default router;
