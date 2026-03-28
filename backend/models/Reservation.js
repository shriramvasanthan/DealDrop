import mongoose from 'mongoose';

const reservationSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    dealId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Deal' },
    quantity: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
  },
  { timestamps: true }
);

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
