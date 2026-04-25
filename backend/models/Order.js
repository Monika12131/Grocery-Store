const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    productId: {
      type: String,
    },
    name: String,
    price: Number,
    quantity: Number,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  deliveryStatus: {
    type: String,
    enum: ['pending', 'shipped', 'delivered'],
    default: 'pending',
  },
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);
