import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { PlusCircle, Tag, TrendingUp, Package } from 'lucide-react';
import MapPicker from '../components/MapPicker';

const RetailerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [deals, setDeals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', originalPrice: '', discountPrice: '',
    category: '', expiryTime: '', quantity: '', image: '', latitude: 40.7128, longitude: -74.0060
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('http://localhost:5001/api/deals/retailer', config);
      setDeals(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5001/api/deals', formData, config);
      setShowAddForm(false);
      setFormData({ title: '', description: '', originalPrice: '', discountPrice: '', category: '', expiryTime: '', quantity: '', image: '', latitude: 40.7128, longitude: -74.0060});
      fetchDeals();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold neon-text-purple mb-2">Retailer Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user.name}</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-neon-purple text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#d44dff] transition-all shadow-[0_0_15px_rgba(188,19,254,0.4)]"
        >
          <PlusCircle size={18} /> Add New Deal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 flex flex-col items-center justify-center border-neon-purple/30">
          <Tag size={32} className="text-neon-purple mb-3" />
          <h3 className="text-3xl font-black">{deals.length}</h3>
          <p className="text-slate-400 text-sm">Total Deals Posted</p>
        </div>
        <div className="glass p-6 flex flex-col items-center justify-center border-neon-blue/30">
          <TrendingUp size={32} className="text-neon-blue mb-3" />
          <h3 className="text-3xl font-black">{deals.filter(d => new Date(d.expiryTime) > new Date()).length}</h3>
          <p className="text-slate-400 text-sm">Active Deals</p>
        </div>
        <div className="glass p-6 flex flex-col items-center justify-center border-slate-600">
          <Package size={32} className="text-slate-400 mb-3" />
          <h3 className="text-3xl font-black">{deals.filter(d => new Date(d.expiryTime) <= new Date()).length}</h3>
          <p className="text-slate-400 text-sm">Expired Deals</p>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-neon-purple/50">
          <h2 className="col-span-full text-xl font-bold mb-4 border-b border-slate-700 pb-2">Create Flash Deal</h2>
          
          <div>
            <label className="block text-sm mb-1 text-slate-300">Title</label>
            <input type="text" required className="w-full bg-slate-800 rounded p-2 focus:ring-1 focus:ring-neon-purple outline-none" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-300">Category</label>
            <input type="text" required className="w-full bg-slate-800 rounded p-2 focus:ring-1 focus:ring-neon-purple outline-none" 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          </div>
          <div className="col-span-full">
            <label className="block text-sm mb-1 text-slate-300">Description</label>
            <textarea required rows="2" className="w-full bg-slate-800 rounded p-2 focus:ring-1 focus:ring-neon-purple outline-none"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-300">Original Price ($)</label>
            <input type="number" required className="w-full bg-slate-800 rounded p-2 focus:ring-1 focus:ring-neon-purple outline-none"
              value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-300">Flash Price ($)</label>
            <input type="number" required className="w-full bg-slate-800 rounded p-2 focus:ring-1 focus:ring-neon-blue outline-none border border-neon-blue/30"
              value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-300">Quantity Available</label>
            <input type="number" required className="w-full bg-slate-800 rounded p-2 focus:ring-1 focus:ring-neon-purple outline-none"
              value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-300">Expiry Time</label>
            <input type="datetime-local" required className="w-full bg-slate-800 rounded p-2 focus:ring-1 focus:ring-neon-purple outline-none"
              value={formData.expiryTime} onChange={e => setFormData({...formData, expiryTime: e.target.value})} />
          </div>
          <div className="col-span-full">
            <label className="block text-sm mb-1 text-slate-300">Image URL</label>
            <input type="text" className="w-full bg-slate-800 rounded p-2 focus:ring-1 focus:ring-neon-purple outline-none"
              value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="col-span-full">
            <label className="block text-sm mb-1 text-slate-300">Store Location</label>
            <p className="text-xs text-slate-400">Click on the map to set the location where customers will pick up this deal.</p>
            <MapPicker onLocationSelect={(loc) => setFormData({...formData, latitude: loc.lat, longitude: loc.lng})} />
          </div>
          
          <button type="submit" className="col-span-full mt-4 bg-neon-purple text-white py-3 rounded-lg font-bold hover:bg-[#d44dff] transition-all">
            Post Deal 🚀
          </button>
        </form>
      )}

      <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Your Deals</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 text-slate-300">
            <tr>
              <th className="p-3 rounded-tl-lg">Item</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {deals.map(deal => (
              <tr key={deal._id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 font-medium">{deal.title}</td>
                <td className="p-3">
                  <span className="text-neon-blue">${deal.discountPrice}</span>
                  <span className="text-slate-500 line-through text-xs ml-2">${deal.originalPrice}</span>
                </td>
                <td className="p-3">{deal.quantity}</td>
                <td className="p-3">
                  {new Date(deal.expiryTime) > new Date() ? (
                    <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs">Active</span>
                  ) : (
                    <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs">Expired</span>
                  )}
                </td>
                <td className="p-3">
                  <button className="text-slate-400 hover:text-white mr-3">Edit</button>
                </td>
              </tr>
            ))}
            {deals.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-400">No deals posted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RetailerDashboard;
