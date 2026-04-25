import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import HomeSections from '../components/HomeSections';
import { productsAPI } from '../utils/api';

const categories = ['All', 'Rice', 'Pulses', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Oils', 'Spices', 'Breakfast', 'Dry Fruits', 'Snacks', 'Beverages', 'Frozen Foods', 'Personal Care', 'Household', 'Pet Care'];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productsAPI.getAll().then(res => {
      setProducts(res.data);
      setFilteredProducts(res.data);
      setLoading(false);
    }).catch(() => {
      setError('Unable to load products. Please check the backend server.');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let filtered = products;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, search, products]);

  return (
    <div className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-10 overflow-hidden rounded-3xl bg-slate-950">
          <img
            src="https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Fresh grocery produce"
            className="absolute inset-0 h-full w-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-emerald-900/20" />
          <div className="relative px-5 py-16 sm:px-10 sm:py-20 lg:px-14">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-200">Online Grocery Store</p>
              <h1 className="mb-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">Fresh groceries for everyday meals</h1>
              <p className="mb-8 max-w-xl text-base leading-7 text-slate-100 sm:text-lg">Shop fruits, vegetables, dairy, grains, and snacks with fast checkout and Razorpay payment.</p>
              <div className="flex max-w-xl items-center gap-3 rounded-2xl bg-white p-2 shadow-xl">
                <Search size={20} className="ml-3 shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search apples, milk, rice..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-1 py-3 text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">All Grocery Products</h2>
            <p className="mt-1 text-sm text-slate-600">{filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'} available</p>
          </div>
          <div className="flex max-w-full flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800">{error}</div>
        ) : (
          <>
            {!search && selectedCategory === 'All' && <HomeSections products={products} onCategorySelect={setSelectedCategory} />}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                <p className="text-lg font-semibold text-slate-700">No products found</p>
                <p className="mt-2 text-slate-500">Try another search or category.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
