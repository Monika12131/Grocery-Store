const express = require('express');
const Razorpay = require('razorpay');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/', protect, async (req, res) => {
  const { items, totalAmount } = req.body;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ message: 'Razorpay keys are not configured' });
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100),
    currency: 'INR',
    receipt: `receipt#${Date.now()}`,
  });
  const order = new Order({
    userId: req.user._id,
    items,
    totalAmount,
    razorpayOrderId: razorpayOrder.id,
  });
  await order.save();
  res.json({ ...razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID });
});

router.post('/:id/verify', protect, async (req, res) => {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  const crypto = require('crypto');
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpayOrderId + '|' + razorpayPaymentId)
    .digest('hex');
  if (generated_signature === razorpaySignature) {
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

router.get('/', protect, async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
