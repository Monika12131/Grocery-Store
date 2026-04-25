import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Cart = () => {
  const { user } = useAuth();
  const { cart, total, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleClearCart = () => {
    clearCart();
    showToast('Cart cleared', 'info');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingCart size={96} className="mx-auto text-slate-300 mb-8" />
          <h2 className="text-3xl font-bold text-slate-950 mb-4">Your Cart is Empty</h2>
          <p className="text-xl text-slate-600 mb-8">Add some fresh groceries to get started</p>
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="py-8 px-4 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-950 mb-8">Shopping Cart</h1>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-8 border-b border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-slate-950">Your Items ({cart.length})</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-200">
            {cart.map(item => (
              <CartItem key={item._id} item={item} />
            ))}
          </div>
        </div>
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
            <span className="text-2xl font-bold text-slate-950">Total: ₹{total.toFixed(0)}</span>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-500 font-medium"
            >
              Clear Cart
            </button>
          </div>
          {user ? (
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-emerald-600 text-white py-4 px-8 rounded-xl hover:bg-emerald-700 font-semibold text-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Proceed to Checkout
            </button>
          ) : (
            <Link
              to="/signin"
              className="w-full block text-center bg-emerald-600 text-white py-4 px-8 rounded-xl hover:bg-emerald-700 font-semibold text-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Login to Checkout
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
