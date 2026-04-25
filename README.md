# GreenBasket - Online Grocery Store (MERN + Razorpay)

## Features
- Full MERN stack (MongoDB, Express, React, Node)
- Responsive Tailwind CSS (mobile-first, green theme)
- Auth: Signup/Signin (JWT, bcrypt, Mongo)
- Products: Browse/filter/search, real organic grocery images (Unsplash)
- Cart: Add/remove/qty like Zepto/Swiggy
- Payment: Razorpay (INR test mode)
- Orders: History with status
- Direct API calls with Express CORS

## Quick Start
1. **Backend (.env required)**
   ```
   cd backend
   cp .env.example .env
   # Edit .env: JWT_SECRET=your_secret, RAZORPAY_KEY_ID/SECRET from https://dashboard.razorpay.com (test mode)
   npm run dev  # port 5000, Mongo localhost:27017/greenbasket
   ```
   Products auto-seeded.

2. **Frontend**
   ```
   cd frontend
   npm run dev  # localhost:3000
   ```

3. **Test Flow**
   - Signup/Signin
   - Browse Home → Add to cart
   - Cart → Checkout → Pay (test: 1111111111111111 CVV any, expiry future)
   - Orders view

## Structure
```
.
├── backend/     # Express APIs, models
├── frontend/    # Vite React Tailwind
├── TODO.md      # Progress tracked (all complete)
└── README.md
```

## Razorpay Test
- Dashboard → Settings → API Keys → Generate Test
- Payments test mode - no real money.

## Production
- Mongo Atlas
- Live Razorpay keys
- Build frontend `npm run build` → serve static
- PM2/Docker for servers

Enjoy shopping! 🛒🌿
