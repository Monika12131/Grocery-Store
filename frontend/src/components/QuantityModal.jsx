import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';

const QuantityModal = ({ product, open, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);

  if (!open || !product) return null;

  const maxQty = Math.max(1, Math.min(product.stock || 20, 20));
  const subtotal = product.price * quantity;

  const handleConfirm = () => {
    onConfirm(quantity);
    setQuantity(1);
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 px-4 py-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <img src={product.image} alt={product.name} className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-950">{product.name}</h3>
              <p className="text-sm text-slate-500">{product.unit || product.category}</p>
              <p className="mt-1 font-semibold text-emerald-700">₹{product.price}</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">How many do you want to add?</p>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setQuantity((qty) => Math.max(1, qty - 1))} className="rounded-full border border-slate-200 bg-white p-3 text-slate-700 hover:bg-slate-100">
              <Minus size={18} />
            </button>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-950">{quantity}</p>
              <p className="text-xs text-slate-500">Max {maxQty}</p>
            </div>
            <button type="button" onClick={() => setQuantity((qty) => Math.min(maxQty, qty + 1))} className="rounded-full border border-slate-200 bg-white p-3 text-slate-700 hover:bg-slate-100">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span className="text-xl font-bold text-slate-950">₹{subtotal.toFixed(0)}</span>
        </div>

        <button type="button" onClick={handleConfirm} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-semibold text-white hover:bg-emerald-700">
          <ShoppingCart size={19} />
          Add {quantity} to Cart
        </button>
      </div>
    </div>
  );
};

export default QuantityModal;
