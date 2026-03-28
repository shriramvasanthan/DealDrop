import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Zap, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed w-full top-0 z-50 px-6 py-4 flex justify-between items-center bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/60 shadow-lg">
      <Link to="/" className="flex items-center gap-2 text-3xl font-black tracking-tight neon-text-blue hover:text-white transition-colors">
        <Zap className="text-neon-blue" fill="#00f3ff" size={28} />
        DealDrop
      </Link>
      
      <div className="flex items-center gap-4">
        <Link to="/requests" className="text-sm font-medium text-slate-400 hover:text-neon-blue transition-colors hidden sm:block">
          🔁 Requests
        </Link>
        {user ? (
          <>
            {user.role === 'retailer' && (
              <Link to="/retailer" className="text-sm font-medium hover:text-neon-purple transition-colors">
                Dashboard
              </Link>
            )}
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <User size={16} className="text-neon-blue" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-red-400">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link to="/auth" className="bg-neon-blue/10 text-neon-blue border border-neon-blue px-4 py-2 rounded-lg font-medium hover:bg-neon-blue hover:text-slate-900 transition-all shadow-[0_0_10px_rgba(0,243,255,0.3)]">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
