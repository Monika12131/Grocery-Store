import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { UserPlus } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
      const res = await authAPI.signup(formData);
      login(res.data);
      showToast('Account created successfully');
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
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
          <UserPlus size={56} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-3xl font-bold text-slate-950 mb-2">Create Account</h2>
          <p className="text-slate-600">Join GreenBasket today</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">{error}</div>}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
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
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-emerald-600 hover:text-emerald-500">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
