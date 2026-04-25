import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Bell, Heart, Home, Mail, MapPin, Package, Save, ShieldCheck, ShoppingCart, User, Edit3 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { useWatchlist } from '../context/WatchlistContext';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { cart, total } = useCart();
  const { watchlist } = useWatchlist();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [deliveryEditing, setDeliveryEditing] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    address: user?.deliveryProfile?.address || '',
    city: user?.deliveryProfile?.city || '',
    pincode: user?.deliveryProfile?.pincode || '',
    preferredSlot: user?.deliveryProfile?.preferredSlot || 'Morning delivery · 8 AM to 11 AM',
  });
  const [loading, setLoading] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '' });
      setDeliveryData({
        address: user.deliveryProfile?.address || '',
        city: user.deliveryProfile?.city || '',
        pincode: user.deliveryProfile?.pincode || '',
        preferredSlot: user.deliveryProfile?.preferredSlot || 'Morning delivery · 8 AM to 11 AM',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.put('/auth/profile', formData);
      updateUser(res.data);
      setEditing(false);
      showToast('Profile updated successfully');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to update profile';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  const handleDeliverySave = async (e) => {
    e.preventDefault();
    setDeliveryLoading(true);
    setError('');
    try {
      const res = await api.put('/auth/profile', {
        name: user.name,
        email: user.email,
        deliveryProfile: deliveryData,
      });
      updateUser(res.data);
      setDeliveryEditing(false);
      showToast('Delivery profile updated successfully');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to update delivery profile';
      setError(message);
      showToast(message, 'error');
    } finally {
      setDeliveryLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen py-12 px-4 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="mx-auto text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-950 mb-6">Please login to manage settings</h2>
          <Link to="/signin" className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-28 h-28 bg-emerald-100 rounded-full mx-auto mb-5 flex items-center justify-center">
            <User size={56} className="text-emerald-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-950 mb-2">Profile Settings</h1>
          <p className="text-slate-600">Manage your GreenBasket account details.</p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShoppingCart className="mb-3 text-emerald-700" size={26} />
            <p className="text-sm text-slate-500">Cart Items</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{cart.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Heart className="mb-3 text-red-500" size={26} />
            <p className="text-sm text-slate-500">Watchlist</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{watchlist.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Package className="mb-3 text-blue-600" size={26} />
            <p className="text-sm text-slate-500">Basket Value</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">₹{total.toFixed(0)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="mb-3 text-emerald-700" size={26} />
            <p className="text-sm text-slate-500">Account</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">Active</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
            <form onSubmit={handleSave}>
              {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">{error}</div>}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <div className="relative">
                    <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-50"
                      disabled={!editing}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-50"
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {editing ? (
                  <>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-emerald-600 text-white py-4 px-6 rounded-xl hover:bg-emerald-700 font-semibold flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
                    >
                      {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <Save size={20} />}
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="bg-slate-100 text-slate-700 py-4 px-6 rounded-xl hover:bg-slate-200 font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="bg-emerald-50 text-emerald-700 py-4 px-6 rounded-xl hover:bg-emerald-100 font-semibold flex items-center justify-center space-x-2 transition-all sm:col-span-2"
                  >
                    <Edit3 size={20} />
                    <span>Edit Profile</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-red-600 text-white py-4 px-6 rounded-xl hover:bg-red-700 font-semibold transition-all sm:col-span-2"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <MapPin className="text-emerald-700" size={24} />
              <h2 className="text-xl font-bold text-slate-950">Delivery Profile</h2>
            </div>
            <form onSubmit={handleDeliverySave} className="space-y-4 text-sm">
              <div>
                <label className="mb-2 block font-semibold text-slate-900">Home Address</label>
                <textarea
                  rows="3"
                  value={deliveryData.address}
                  onChange={(e) => setDeliveryData({ ...deliveryData, address: e.target.value })}
                  placeholder="Apartment, street, area"
                  disabled={!deliveryEditing}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-transparent focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold text-slate-900">City</label>
                  <input
                    type="text"
                    value={deliveryData.city}
                    onChange={(e) => setDeliveryData({ ...deliveryData, city: e.target.value })}
                    placeholder="City"
                    disabled={!deliveryEditing}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-transparent focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-semibold text-slate-900">Pincode</label>
                  <input
                    type="text"
                    value={deliveryData.pincode}
                    onChange={(e) => setDeliveryData({ ...deliveryData, pincode: e.target.value })}
                    placeholder="Pincode"
                    disabled={!deliveryEditing}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-transparent focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block font-semibold text-slate-900">Preferred Slot</label>
                <select
                  value={deliveryData.preferredSlot}
                  onChange={(e) => setDeliveryData({ ...deliveryData, preferredSlot: e.target.value })}
                  disabled={!deliveryEditing}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-transparent focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                >
                  <option>Morning delivery · 8 AM to 11 AM</option>
                  <option>Afternoon delivery · 12 PM to 3 PM</option>
                  <option>Evening delivery · 5 PM to 8 PM</option>
                  <option>Express delivery · Within 2 hours</option>
                </select>
              </div>
              {deliveryEditing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="submit" disabled={deliveryLoading} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                    <Save size={18} />
                    {deliveryLoading ? 'Saving...' : 'Save Delivery'}
                  </button>
                  <button type="button" onClick={() => setDeliveryEditing(false)} className="rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200">
                    Cancel
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setDeliveryEditing(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                  <Home size={18} />
                  Edit Delivery Profile
                </button>
              )}
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <Bell className="text-emerald-700" size={24} />
              <h2 className="text-xl font-bold text-slate-950">Shopping Preferences</h2>
            </div>
            <div className="space-y-3">
              {['Notify me about fresh produce offers', 'Show vegetarian grocery picks first', 'Save basket items for quick re-order'].map((item) => (
                <label key={item} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700">
                  <span>{item}</span>
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link to="/orders" className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800">
              <Package size={18} />
              View Orders
            </Link>
            <Link to="/watchlist" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">
              <Heart size={18} />
              Open Watchlist
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
