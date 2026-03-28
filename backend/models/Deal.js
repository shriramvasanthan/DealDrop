import mongoose from 'mongoose';

const dealSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: 'https://via.placeholder.com/300x200?text=DealDrop' },
    originalPrice: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    category: { type: String, required: true },
    expiryTime: { type: Date, required: true },
    quantity: { type: Number, required: true, default: 0 },
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    }
  },
  { timestamps: true }
);

dealSchema.index({ location: '2dsphere' });

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;
