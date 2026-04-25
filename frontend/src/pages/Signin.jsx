import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { LogIn } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Signin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.signin(formData);
      login(res.data);
      showToast('Signed in successfully');
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Signin failed';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <LogIn size={56} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-3xl font-bold text-slate-950 mb-2">Welcome Back</h2>
          <p className="text-slate-600">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">{error}</div>}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 font-semibold text-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-500">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
