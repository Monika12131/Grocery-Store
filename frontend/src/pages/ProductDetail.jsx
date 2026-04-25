import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { productsAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWatchlist } from '../context/WatchlistContext';
import QuantityModal from '../components/QuantityModal';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const [quantityOpen, setQuantityOpen] = useState(false);

  useEffect(() => {
    productsAPI.getById(id).then(res => {
      setProduct(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-slate-600">Product not found</div>;

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

  return (
    <div className="px-4 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 md:p-6 lg:gap-12">
          <img src={product.image} alt={product.name} className="h-80 w-full rounded-2xl object-cover sm:h-[460px]" />
          <div className="flex flex-col justify-center p-2 sm:p-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">{product.category} · {product.brand || 'GreenBasket'}</p>
            <h1 className="mb-4 text-3xl font-bold text-slate-950 sm:text-4xl">{product.name}</h1>
            <p className="mb-6 text-3xl font-bold text-emerald-700">₹{product.price}</p>
            <p className="mb-6 text-base leading-7 text-slate-600 sm:text-lg">{product.description || 'Fresh grocery product selected for everyday cooking and healthy meals.'}</p>
            <div className="mb-8 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-slate-500">Pack</p>
                <p className="mt-1 font-semibold text-slate-900">{product.unit || '1 pack'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-slate-500">Stock</p>
                <p className="mt-1 font-semibold text-slate-900">{product.stock || 0} available</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-slate-500">Rating</p>
                <p className="mt-1 font-semibold text-slate-900">{product.rating || 4.5}/5</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-slate-500">Delivery</p>
                <p className="mt-1 font-semibold text-slate-900">Same day</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                onClick={() => setQuantityOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleWatchlist}
                className={`flex items-center justify-center gap-2 rounded-xl border px-6 py-4 font-semibold transition-colors ${saved ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <QuantityModal product={product} open={quantityOpen} onClose={() => setQuantityOpen(false)} onConfirm={handleAddToCart} />
    </div>
  );
};
export default ProductDetail;
