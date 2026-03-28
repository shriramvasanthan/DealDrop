import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let res;
    if (isLogin) {
      res = await login(formData.email, formData.password);
    } else {
      res = await register(formData);
    }

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8"
      >
        <h2 className="text-3xl font-bold mb-6 text-center neon-text-blue">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Name</label>
              <input 
                type="text" 
                required 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Email</label>
            <input 
              type="email" 
              required 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
            <input 
              type="password" 
              required 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Role</label>
              <select 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue appearance-none"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="user">Customer</option>
                <option value="retailer">Retailer</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-neon-blue text-slate-900 font-bold py-3 rounded-lg hover:bg-[#52f6ff] transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] mt-6"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-neon-blue hover:text-[#52f6ff] font-medium transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
