import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white px-4 py-10 text-slate-700">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-4 text-2xl font-bold text-emerald-700">GreenBasket</h3>
          <p className="text-sm leading-6 text-slate-600">Fresh groceries, simple checkout, and everyday essentials delivered with a clean shopping experience.</p>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-slate-950">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-emerald-700">Home</Link></li>
            <li><Link to="/cart" className="hover:text-emerald-700">Cart</Link></li>
            <li><Link to="/orders" className="hover:text-emerald-700">Orders</Link></li>
            <li><Link to="/watchlist" className="hover:text-emerald-700">Watchlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-slate-950">Categories</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Fruits</li>
            <li>Vegetables</li>
            <li>Dairy</li>
            <li>Rice</li>
            <li>Pulses</li>
            <li>Spices</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-slate-950">Contact</h4>
          <p className="mb-2 text-sm text-slate-600">hello@greenbasket.com</p>
          <p className="text-sm text-slate-600">+91 98765 43210</p>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        © 2026 GreenBasket. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
