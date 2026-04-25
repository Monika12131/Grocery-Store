import React, { createContext, useContext, useReducer } from 'react';
const CartContext = createContext();
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const quantity = action.payload.quantity || 1;
      const existing = state.find(item => item._id === action.payload.item._id);
      if (existing) {
        return state.map(item =>
          item._id === action.payload.item._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...state, { ...action.payload.item, quantity }];
    case 'UPDATE_QTY':
      return state.map(item =>
        item._id === action.payload._id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
    case 'REMOVE_ITEM':
      return state.filter(item => item._id !== action.payload._id);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
};
const loadCart = () => {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('Error loading cart from localStorage', err);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, [], loadCart);

  React.useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = (item, quantity = 1) => dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
  const updateQty = (_id, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { _id, quantity } });
  const removeItem = (_id) => dispatch({ type: 'REMOVE_ITEM', payload: { _id } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <CartContext.Provider value={{ cart, addItem, updateQty, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);
