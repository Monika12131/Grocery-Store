import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const CartItem = ({ item }) => {
  const { updateQty, removeItem } = useCart();
  const { showToast } = useToast();

  const updateQuantity = (delta) => {
    const newQty = Math.max(1, item.quantity + delta);
    updateQty(item._id, newQty);
  };

  const handleRemove = () => {
    removeItem(item._id);
    showToast(`${item.name} removed from cart`, 'info');
  };

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 p-4 last:border-b-0 sm:flex-row sm:items-center">
      <img src={item.image} alt={item.name} className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-20" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-950 mb-1">{item.name}</h3>
        <p className="text-emerald-700 font-bold text-lg">₹{item.price}</p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="flex items-center rounded-full border border-slate-200">
        <button onClick={() => updateQuantity(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Minus size={16} />
        </button>
        <span className="font-bold text-lg min-w-[2rem] text-center">{item.quantity}</span>
        <button onClick={() => updateQuantity(1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Plus size={16} />
        </button>
        </div>
        <span className="text-slate-950 font-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
        <button onClick={handleRemove} className="p-2 hover:bg-red-100 rounded-full transition-colors">
          <Trash2 size={20} className="text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
