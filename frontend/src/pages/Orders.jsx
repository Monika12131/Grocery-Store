import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import { Clock, Package, Truck, ShoppingBag } from 'lucide-react';
const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (user) {
      ordersAPI.getOrders()
        .then(res => {
          setOrders(res.data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch orders:', err);
          setError('Failed to load orders. Please try again.');
          setLoading(false);
        });
    }
  }, [user]);
  if (!user) {
    return (
      <div className="min-h-screen py-12 px-4 bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please login to view orders</h2>
        </div>
      </div>
    );
  }
  if (loading) return (
    <div className="min-h-screen py-12 px-4 bg-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    </div>
  );

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-lg">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-8">Start shopping to see your orders here</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-8 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Order #{order._id.slice(-6)}</h3>
                      <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₹{order.totalAmount}</p>
                      <p className="text-sm font-medium capitalize">{order.paymentStatus} | {order.deliveryStatus}</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Items:</h4>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center py-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-sm font-medium text-gray-600">{item.name}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} x ₹{item.price}</p>
                        </div>
                        <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Orders;

