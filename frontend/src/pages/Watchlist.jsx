import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../context/ToastContext';

const Watchlist = () => {
  const { watchlist, clearWatchlist } = useWatchlist();
  const { showToast } = useToast();

  const handleClear = () => {
    clearWatchlist();
    showToast('Watchlist cleared', 'info');
  };

  if (watchlist.length === 0) {
    return (
      <div className="min-h-screen px-4 py-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <Heart size={72} className="mb-6 text-slate-300" />
          <h1 className="mb-3 text-3xl font-bold text-slate-950">Your watchlist is empty</h1>
          <p className="mb-8 max-w-md text-slate-600">Save groceries you buy often and find them quickly when you shop again.</p>
          <Link to="/" className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">Saved Products</p>
            <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">Watchlist</h1>
            <p className="mt-2 text-slate-600">{watchlist.length} item{watchlist.length > 1 ? 's' : ''} saved for later.</p>
          </div>
          <button type="button" onClick={handleClear} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Clear Watchlist
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {watchlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Watchlist;
