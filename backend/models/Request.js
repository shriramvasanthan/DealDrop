import mongoose from 'mongoose';

const requestSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    quantity: { type: String },
    category: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    }
  },
  { timestamps: true }
);

requestSchema.index({ location: '2dsphere' });

const Request = mongoose.model('Request', requestSchema);
export default Request;
