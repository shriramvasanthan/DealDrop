import asyncHandler from 'express-async-handler';
import Deal from '../models/Deal.js';

// @desc    Get all deals (near user)
// @route   GET /api/deals
// @access  Public
export const getDeals = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 50000 } = req.query; // default 50km for testing

  let query = { expiryTime: { $gt: new Date() }, quantity: { $gt: 0 } };

  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius)
      }
    };
  }

  const deals = await Deal.find(query).populate('retailerId', 'name');
  res.json(deals);
});

// @desc    Get generic retailer deals
// @route   GET /api/deals/retailer
// @access  Private (Retailer)
export const getRetailerDeals = asyncHandler(async (req, res) => {
  const deals = await Deal.find({ retailerId: req.user._id });
  res.json(deals);
});

// @desc    Create new deal
// @route   POST /api/deals
// @access  Private (Retailer)
export const createDeal = asyncHandler(async (req, res) => {
  const { title, description, originalPrice, discountPrice, category, expiryTime, quantity, latitude, longitude, image } = req.body;

  const deal = new Deal({
    title, description, originalPrice, discountPrice, category, 
    expiryTime, quantity, image,
    retailerId: req.user._id,
    location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] }
  });

  const createdDeal = await deal.save();
  res.status(201).json(createdDeal);
});
