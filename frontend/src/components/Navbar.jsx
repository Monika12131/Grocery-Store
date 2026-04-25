import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, Home, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingCart, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../context/ToastContext';

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-100 hover:text-emerald-700'}`;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { watchlist } = useWatchlist();
  const { showToast } = useToast();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  const closeMenus = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  const profileLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'Orders', icon: Package },
    { to: '/watchlist', label: 'Watchlist', icon: Heart },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" onClick={closeMenus} className="flex items-center gap-2 text-xl font-bold text-emerald-700 sm:text-2xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">G</span>
            <span>GreenBasket</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/watchlist" className={navLinkClass}>Watchlist</NavLink>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/cart" onClick={closeMenus} className="relative rounded-xl p-2.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-emerald-700">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-emerald-600 px-1.5 text-center text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div ref={profileRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <User size={18} />
                  </span>
                  <span className="max-w-28 truncate">{user.name}</span>
                  <ChevronDown size={16} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <div className="p-2">
                      {profileLinks.map(({ to, label, icon: Icon }) => (
                        <Link key={to} to={to} onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                          <Icon size={18} />
                          <span className="flex-1">{label}</span>
                          {label === 'Watchlist' && watchlist.length > 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{watchlist.length}</span>}
                        </Link>
                      ))}
                      <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link to="/signin" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Sign In</Link>
                <Link to="/signup" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Sign Up</Link>
              </div>
            )}

            <button type="button" onClick={() => setMobileOpen((open) => !open)} className="rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 md:hidden">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 py-3 md:hidden">
            <div className="space-y-1">
              <Link to="/" onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                <Home size={18} />
                Home
              </Link>
              <Link to="/cart" onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                <ShoppingCart size={18} />
                Cart ({totalItems})
              </Link>
              {user ? (
                <>
                  <div className="my-2 rounded-xl bg-slate-50 px-3 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  {profileLinks.map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                      <Icon size={18} />
                      <span className="flex-1">{label}</span>
                      {label === 'Watchlist' && watchlist.length > 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{watchlist.length}</span>}
                    </Link>
                  ))}
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/signin" onClick={closeMenus} className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700">Sign In</Link>
                  <Link to="/signup" onClick={closeMenus} className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
