import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { PlusCircle, MessageSquare, MapPin, Tag, Loader2 } from 'lucide-react';

const INDIA_CENTER = { lat: 13.0827, lng: 80.2707 };

const Requests = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ description: '', quantity: '', category: '', latitude: INDIA_CENTER.lat, longitude: INDIA_CENTER.lng });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/requests?lat=${INDIA_CENTER.lat}&lng=${INDIA_CENTER.lng}`);
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to post a request');
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5001/api/requests', formData, config);
      setShowForm(false);
      setFormData({ description: '', quantity: '', category: '', latitude: INDIA_CENTER.lat, longitude: INDIA_CENTER.lng });
      fetchRequests();
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const timeAgo = (date) => {
    const diff = Math.round((Date.now() - new Date(date)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
    return `${Math.round(diff / 1440)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold neon-text-blue mb-2">Community Requests</h1>
          <p className="text-slate-400">Can't find what you need? Post a request — local retailers will respond!</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-neon-blue text-slate-900 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:bg-white transition-all active:scale-95">
          <PlusCircle size={18} /> {showForm ? 'Cancel' : 'I Need This'}
        </button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="glass p-6 rounded-2xl mb-8 border border-neon-blue/30 space-y-4">
          <h3 className="font-bold text-lg mb-2">Post Your Request</h3>
          <div>
            <label className="block text-sm text-slate-300 mb-1">What do you need?</label>
            <input required className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-blue outline-none" placeholder="e.g., Need rice 5kg cheap, prefer organic"
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Quantity</label>
              <input className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-blue outline-none" placeholder="e.g., 2 kg, 3 pcs"
                value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Category</label>
              <select className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-blue outline-none appearance-none"
                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option value="">Any</option>
                {['Staples', 'Dairy', 'Snacks', 'Beverages', 'Toiletries', 'Electronics', 'Apparel', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-neon-blue text-slate-900 py-3 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 size={18} className="animate-spin" /> Posting...</> : '📢 Post Request'}
          </button>
        </motion.form>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-neon-blue" /></div>
      ) : (
        <div className="space-y-4">
          {requests.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-xl">No requests yet — be the first!</p>
            </div>
          )}
          {requests.map((req, i) => (
            <motion.div key={req._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 hover:border-neon-blue/40 transition-colors border border-slate-700/50 group">
              <div className="flex-1">
                <p className="font-semibold text-lg group-hover:text-neon-blue transition-colors">{req.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-400">
                  {req.quantity && <span className="flex items-center gap-1"><Tag size={13} />{req.quantity}</span>}
                  {req.category && <span className="bg-slate-800 px-3 py-0.5 rounded-full text-xs text-neon-purple border border-neon-purple/30">{req.category}</span>}
                  <span className="flex items-center gap-1"><MapPin size={13} />Nearby</span>
                </div>
              </div>
              <div className="flex flex-col items-end text-right text-xs text-slate-500 shrink-0">
                <span className="font-medium">{req.userId?.name || 'Anonymous'}</span>
                <span>{timeAgo(req.createdAt)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
