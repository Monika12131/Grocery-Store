import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../utils/api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    ordersAPI.getOrders()
      .then(res => {
        setOrders(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders');
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen py-12 px-4 bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Please login to view your dashboard</h2>
          <Link to="/signin" className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen py-12 px-4 bg-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );

  // Calculate stats from ALL orders (not just recent 3)
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const ordersCount = orders.length;
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome back, {user.name}!</h1>
          <p className="text-xl text-gray-600">Your dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <User size={48} className="mx-auto text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Profile</h3>
            <p className="text-2xl font-bold text-green-600">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <ShoppingBag size={48} className="mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Total Spent</h3>
            <p className="text-2xl font-bold text-blue-600">₹{totalSpent.toFixed(0)}</p>
            <p className="text-sm text-gray-500">{paidOrders.length} completed orders</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <Package size={48} className="mx-auto text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Total Orders</h3>
            <p className="text-2xl font-bold text-purple-600">{ordersCount}</p>
            <p className="text-sm text-gray-500">{pendingOrders.length} pending</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <TrendingUp size={48} className="mx-auto text-indigo-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order History</h3>
            <p className="text-lg font-semibold text-indigo-600">{paidOrders.length} completed</p>
            <p className="text-sm text-gray-500">All-time orders</p>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
            <Link to="/orders" className="text-green-600 hover:text-green-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start shopping to see your order history here</p>
              <Link to="/" className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map(order => (
                <div key={order._id} className="flex items-center p-6 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Order #{order._id.slice(-6)}</h4>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">₹{order.totalAmount}</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
