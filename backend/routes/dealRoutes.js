import express from 'express';
import { getDeals, getRetailerDeals, createDeal } from '../controllers/dealController.js';
import { protect, retailerOnly } from '../middleware/authMiddleware.js';
import { recommendPrice } from '../utils/priceEngine.js';

const router = express.Router();

router.route('/').get(getDeals).post(protect, retailerOnly, createDeal);
router.route('/retailer').get(protect, retailerOnly, getRetailerDeals);

// Smart discount recommendation endpoint
router.post('/recommend-price', protect, retailerOnly, (req, res) => {
  const { originalPrice, quantity, expiryHours, demand, minimumPrice } = req.body;
  if (!originalPrice || !quantity || !expiryHours) {
    return res.status(400).json({ message: 'originalPrice, quantity and expiryHours are required' });
  }
  const result = recommendPrice({ originalPrice: +originalPrice, quantity: +quantity, expiryHours: +expiryHours, demand, minimumPrice: minimumPrice ? +minimumPrice : undefined });
  res.json(result);
});

export default router;
