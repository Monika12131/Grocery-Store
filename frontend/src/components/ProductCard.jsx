import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWatchlist } from '../context/WatchlistContext';
import QuantityModal from './QuantityModal';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const [quantityOpen, setQuantityOpen] = useState(false);
  const saved = isInWatchlist(product._id);

  const handleAddToCart = (quantity) => {
    addItem(product, quantity);
    setQuantityOpen(false);
    showToast(`${quantity} x ${product.name} added to cart`);
  };

  const handleWatchlist = () => {
    toggleWatchlist(product);
    showToast(saved ? `${product.name} removed from watchlist` : `${product.name} added to watchlist`, saved ? 'info' : 'success');
  };

  const getFallbackImage = (category) => {
    const fallbacks = {
      'Vegetables': 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=900',
      'Fruits': 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=900',
      'Dairy': 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=900',
      'Bakery': 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900',
      'Rice': 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=900',
      'Pulses': 'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg?auto=compress&cs=tinysrgb&w=900',
      'Oils': 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900',
      'Beverages': 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=900',
      'Snacks': 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=900',
      'Household': 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900',
      'Pet Care': 'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=900',
      'Personal Care': 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900',
      'Frozen Foods': 'https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=900'
    };
    return fallbacks[category] || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=900';
  };

  return (
    <>
      <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative overflow-hidden bg-slate-100">
          <Link to={`/product/${product._id}`}>
            <img 
              src={product.image} 
              alt={product.name} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getFallbackImage(product.category);
              }}
              className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-60" 
            />
          </Link>
          {product.discount > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">{product.discount}% off</span>
          )}
          <button
            type="button"
            onClick={handleWatchlist}
            className={`absolute right-3 top-3 rounded-full p-2.5 shadow-sm transition-colors ${saved ? 'bg-red-50 text-red-600' : 'bg-white text-slate-600 hover:text-red-600'}`}
          >
            <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to={`/product/${product._id}`} className="block truncate text-lg font-semibold text-slate-900 hover:text-emerald-700">{product.name}</Link>
              <p className="mt-1 text-sm text-slate-500">{product.unit || product.category}</p>
            </div>
            <p className="shrink-0 text-xl font-bold text-emerald-700">₹{product.price}</p>
          </div>
          <div className="mb-4 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span className="truncate">{product.brand || 'GreenBasket'}</span>
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700">
              <Star size={13} fill="currentColor" />
              {product.rating || 4.5}
            </span>
          </div>
          <button
            onClick={() => setQuantityOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
      <QuantityModal product={product} open={quantityOpen} onClose={() => setQuantityOpen(false)} onConfirm={handleAddToCart} />
    </>
  );
};
export default ProductCard;
