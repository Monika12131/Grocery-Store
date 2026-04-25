const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, protect } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

const formatUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  deliveryProfile: user.deliveryProfile,
  ...(token ? { token } : {}),
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({ name, email, password: hashedPassword });
  if (user) {
    res.status(201).json(formatUser(user, generateToken(user._id)));
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json(formatUser(user, generateToken(user._id)));
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

router.put('/profile', protect, async (req, res) => {
  const { name, email, deliveryProfile } = req.body;
  const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });

  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = name || user.name;
  user.email = email || user.email;
  if (deliveryProfile) {
    user.deliveryProfile = {
      ...user.deliveryProfile,
      ...deliveryProfile,
    };
  }
  await user.save();

  res.json(formatUser(user));
});

module.exports = router;
