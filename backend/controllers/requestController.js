import asyncHandler from 'express-async-handler';
import Request from '../models/Request.js';

export const createRequest = asyncHandler(async (req, res) => {
  const { description, quantity, category, latitude, longitude } = req.body;
  const request = await Request.create({
    userId: req.user._id,
    description, quantity, category,
    location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] }
  });
  res.status(201).json(request);
});

export const getNearbyRequests = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 20000 } = req.query;
  let query = {};
  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius)
      }
    };
  }
  const requests = await Request.find(query).populate('userId', 'name').sort({ createdAt: -1 });
  res.json(requests);
});
