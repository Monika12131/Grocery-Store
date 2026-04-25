import { ArrowRight, BadgePercent, Clock, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import ProductCard from './ProductCard';

const categoryCards = [
  { name: 'Rice', image: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=500', color: 'bg-amber-50 text-amber-800' },
  { name: 'Pulses', image: 'https://images.pexels.com/photos/7421513/pexels-photo-7421513.jpeg?auto=compress&cs=tinysrgb&w=500', color: 'bg-orange-50 text-orange-800' },
  { name: 'Vegetables', image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=500', color: 'bg-emerald-50 text-emerald-800' },
  { name: 'Fruits', image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=500', color: 'bg-red-50 text-red-800' },
  { name: 'Dairy', image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=500', color: 'bg-sky-50 text-sky-800' },
  { name: 'Spices', image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=500', color: 'bg-yellow-50 text-yellow-800' },
  { name: 'Dry Fruits', image: 'https://images.pexels.com/photos/3997459/pexels-photo-3997459.jpeg?auto=compress&cs=tinysrgb&w=500', color: 'bg-stone-50 text-stone-800' },
  { name: 'Beverages', image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=500', color: 'bg-cyan-50 text-cyan-800' },
];

const promises = [
  { icon: Truck, title: 'Fast delivery', text: 'Same-day slots' },
  { icon: PackageCheck, title: 'Fresh packed', text: 'Quality checked' },
  { icon: BadgePercent, title: 'Daily deals', text: 'Offers on essentials' },
  { icon: ShieldCheck, title: 'Secure payment', text: 'Razorpay checkout' },
];

const SectionRow = ({ title, subtitle, products }) => {
  if (!products.length) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

const HomeSections = ({ products, onCategorySelect }) => {
  const getProducts = (category) => products.filter((product) => product.category === category);
  const offers = products.filter((product) => product.discount >= 10).slice(0, 4);

  return (
    <>
      <section className="mb-10 grid gap-4 md:grid-cols-4">
        {promises.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon size={22} />
            </span>
            <div>
              <p className="font-semibold text-slate-950">{title}</p>
              <p className="text-sm text-slate-500">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-10 overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-700 text-white shadow-sm">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-100"><Clock size={16} /> Amazon Fresh style grocery flow</p>
            <h2 className="text-3xl font-bold">Build your weekly basket faster</h2>
            <p className="mt-2 max-w-2xl text-emerald-50">Shop staples, fresh produce, dairy, breakfast, snacks, and beverages in one clean storefront.</p>
          </div>
          <button type="button" onClick={() => onCategorySelect('Rice')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-700 hover:bg-emerald-50">
            Shop staples
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Shop by Category</h2>
            <p className="mt-1 text-sm text-slate-600">Rice, pulses, vegetables, dairy, spices, beverages, and more.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categoryCards.map((category) => (
            <button key={category.name} type="button" onClick={() => onCategorySelect(category.name)} className={`overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${category.color}`}>
              <img src={category.image} alt={category.name} className="h-24 w-full object-cover" />
              <p className="px-3 py-3 text-sm font-bold">{category.name}</p>
            </button>
          ))}
        </div>
      </section>

      <SectionRow title="Top Deals Today" subtitle="Discounted grocery essentials for your basket." products={offers} />
      <SectionRow title="Rice & Grains" subtitle="Daily staples for lunch, dinner, biryani, and meal prep." products={[...getProducts('Rice'), ...getProducts('Breakfast')]} />
      <SectionRow title="Pulses & Protein" subtitle="Dal, chana, and protein-rich pantry essentials." products={getProducts('Pulses')} />
      <SectionRow title="Fresh Vegetables" subtitle="Farm-fresh produce for everyday Indian cooking." products={getProducts('Vegetables')} />
    </>
  );
};

export default HomeSections;
