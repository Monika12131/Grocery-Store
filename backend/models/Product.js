const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  externalId: {
    type: String,
    unique: true,
    sparse: true,
  },
  source: {
    type: String,
    default: 'manual',
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    default: '1 pack',
  },
  brand: {
    type: String,
    default: 'GreenBasket',
  },
  origin: {
    type: String,
    default: 'India',
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  discount: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
  }],
  image: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 100,
  },
}, { timestamps: true });
module.exports = mongoose.model('Product', productSchema);
