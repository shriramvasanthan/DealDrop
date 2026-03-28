import { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { PlusCircle, Tag, TrendingUp, Package, Mic, MicOff, Brain, Layers, Trash2, Loader2, Recycle, IndianRupee } from 'lucide-react';
import MapPicker from '../components/MapPicker';
import PhotoEnhancer from '../components/PhotoEnhancer';
import { motion, AnimatePresence } from 'framer-motion';

// Category templates for one-tap prefill
const CATEGORY_TEMPLATES = {
  Snacks:     { category: 'Snacks',     originalPrice: '150',  discountPrice: '99',  quantity: '30', expiryTime: '', description: 'Fresh snack pack, limited units!' },
  Dairy:      { category: 'Dairy',      originalPrice: '80',   discountPrice: '55',  quantity: '20', expiryTime: '', description: 'Fresh dairy product, expiring soon.' },
  Staples:    { category: 'Staples',    originalPrice: '500',  discountPrice: '350', quantity: '50', expiryTime: '', description: 'Essential staple, buy more save more.' },
  Toiletries: { category: 'Toiletries', originalPrice: '250',  discountPrice: '179', quantity: '25', expiryTime: '', description: 'Personal care bundle at unbeatable price.' },
  Beverages:  { category: 'Beverages',  originalPrice: '120',  discountPrice: '79',  quantity: '40', expiryTime: '', description: 'Refreshing beverage, grab it while it lasts!' },
};

const RetailerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [deals, setDeals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('deals'); // deals | bundle | analytics
  const [formData, setFormData] = useState({
    title: '', description: '', originalPrice: '', discountPrice: '',
    category: '', expiryTime: '', quantity: '', image: '', latitude: 13.0827, longitude: 80.2707,
    demand: 'medium', minimumPrice: ''
  });

  // AI Pricing state
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Voice state
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Bundle state
  const [selectedForBundle, setSelectedForBundle] = useState([]);

  useEffect(() => { fetchDeals(); }, []);

  const fetchDeals = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('http://localhost:5001/api/deals/retailer', config);
      setDeals(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5001/api/deals', formData, config);
      setShowAddForm(false);
      setFormData({ title: '', description: '', originalPrice: '', discountPrice: '', category: '', expiryTime: '', quantity: '', image: '', latitude: 13.0827, longitude: 80.2707, demand: 'medium', minimumPrice: '' });
      setPriceSuggestion(null);
      fetchDeals();
    } catch (e) { console.error(e); }
  };

  // ── Smart Price Engine ──
  const handleSuggestPrice = async () => {
    const { originalPrice, quantity, expiryTime, demand, minimumPrice } = formData;
    if (!originalPrice || !quantity || !expiryTime) return alert('Fill in Original Price, Quantity, and Expiry Time first.');
    const expiryHours = ((new Date(expiryTime) - new Date()) / 1000 / 3600).toFixed(1);
    setLoadingPrice(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post('http://localhost:5001/api/deals/recommend-price', { originalPrice, quantity, expiryHours, demand, minimumPrice }, config);
      setPriceSuggestion(res.data);
      setFormData(f => ({ ...f, discountPrice: String(res.data.suggestedPrice) }));
    } catch (e) { console.error(e); }
    setLoadingPrice(false);
  };

  // ── Voice Deal Posting ──
  const handleVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice input is not supported in this browser. Try Chrome.');
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (listening) { recognition.stop(); setListening(false); return; }

    recognition.start();
    setListening(true);
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setListening(false);

      // Extract fields from speech
      const newData = { ...formData };
      const txt = text.toLowerCase();

      // Price
      const priceMatch = txt.match(/(?:price|cost|worth|rs|rupees?)\s*(?:is|of)?\s*(\d+)/i) || txt.match(/(\d+)\s*(?:rs|rupees?)/i);
      if (priceMatch) newData.originalPrice = priceMatch[1];

      // Quantity
      const qtyMatch = txt.match(/(\d+)\s*(?:units?|pieces?|kg|items?|pcs)/i);
      if (qtyMatch) newData.quantity = qtyMatch[1];

      // Category keywords
      const catMap = { snack: 'Snacks', dairy: 'Dairy', milk: 'Dairy', rice: 'Staples', wheat: 'Staples', coffee: 'Beverages', tea: 'Beverages', shampoo: 'Toiletries', soap: 'Toiletries' };
      for (const [kw, cat] of Object.entries(catMap)) {
        if (txt.includes(kw)) { newData.category = cat; break; }
      }

      // Product name (first noun phrase — simplistic)
      const words = text.split(' ');
      if (words.length > 0) newData.title = words.slice(0, Math.min(4, words.length)).join(' ');
      newData.description = text;

      setFormData(newData);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  }, [listening, formData]);

  // ── Category Template ──
  const applyTemplate = (templateKey) => {
    const t = CATEGORY_TEMPLATES[templateKey];
    setFormData(f => ({ ...f, ...t }));
  };

  // ── Bundle Creator ──
  const toggleBundleSelect = (dealId) => {
    setSelectedForBundle(prev => prev.includes(dealId) ? prev.filter(id => id !== dealId) : [...prev, dealId]);
  };
  const bundleDeals = deals.filter(d => selectedForBundle.includes(d._id));
  const bundleTotal = bundleDeals.reduce((s, d) => s + d.discountPrice, 0);
  const bundleDiscountPct = bundleDeals.length >= 3 ? 25 : bundleDeals.length === 2 ? 15 : 0;
  const bundlePrice = Math.round(bundleTotal * (1 - bundleDiscountPct / 100));

  // ── Waste Analytics ──
  const totalSaved = deals.reduce((s, d) => s + (d.originalPrice - d.discountPrice) * (d.quantity || 0), 0);
  const totalUnits = deals.reduce((s, d) => s + (d.quantity || 0), 0);
  const activeDeals = deals.filter(d => new Date(d.expiryTime) > new Date()).length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text-purple">Retailer Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user.name}</p>
        </div>
        <button onClick={() => { setShowAddForm(!showAddForm); setActiveTab('deals'); }}
          className="bg-neon-purple text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#d44dff] transition-all shadow-[0_0_15px_rgba(188,19,254,0.4)] active:scale-95">
          <PlusCircle size={18} /> {showAddForm ? 'Cancel' : 'Add New Deal'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Tag, label: 'Total Deals', value: deals.length, color: 'text-neon-purple' },
          { icon: TrendingUp, label: 'Active', value: activeDeals, color: 'text-neon-blue' },
          { icon: Package, label: 'Expired', value: deals.length - activeDeals, color: 'text-slate-400' },
          { icon: IndianRupee, label: 'Max Savings', value: `₹${(totalSaved / 1000).toFixed(1)}K`, color: 'text-green-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <motion.div key={label} whileHover={{ scale: 1.03 }} className="glass p-5 flex flex-col items-center text-center rounded-2xl">
            <Icon size={28} className={`mb-2 ${color}`} />
            <span className={`text-2xl font-black ${color}`}>{value}</span>
            <span className="text-slate-400 text-xs mt-1">{label}</span>
          </motion.div>
        ))}
      </div>

      {/* Waste Saved Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass border border-green-500/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <Recycle size={32} className="text-green-400 animate-pulse" />
          <div>
            <p className="font-black text-xl text-green-400">♻️ Waste Saved Dashboard</p>
            <p className="text-slate-400 text-sm">Estimated impact from your deals</p>
          </div>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-black text-neon-blue">₹{totalSaved.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-400">Customer Savings</p>
          </div>
          <div>
            <p className="text-2xl font-black text-green-400">{totalUnits}</p>
            <p className="text-xs text-slate-400">Units Saved from Waste</p>
          </div>
        </div>
      </motion.div>

      {/* Add Deal Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit} className="glass p-6 mb-8 rounded-2xl border border-neon-purple/40 overflow-hidden">
            <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-3">⚡ Create Flash Deal</h2>

            {/* Category Templates */}
            <div className="mb-5">
              <p className="text-xs text-slate-400 mb-2 font-semibold tracking-wider">ONE-TAP TEMPLATES</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(CATEGORY_TEMPLATES).map(t => (
                  <button key={t} type="button" onClick={() => applyTemplate(t)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/20 transition-all active:scale-95">
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-slate-300">Product Title</label>
                <div className="flex gap-2">
                  <input type="text" required className="flex-1 bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-purple outline-none"
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                  <button type="button" onClick={handleVoice}
                    className={`p-2.5 rounded-lg border transition-all ${listening ? 'border-red-400 bg-red-500/20 text-red-400 animate-pulse' : 'border-slate-600 text-slate-400 hover:border-neon-blue hover:text-neon-blue'}`}
                    title="Voice input">
                    {listening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </div>
                {transcript && <p className="text-xs text-slate-500 mt-1">🎤 "{transcript}"</p>}
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Category</label>
                <input type="text" required className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-purple outline-none"
                  value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1 text-slate-300">Description</label>
                <textarea required rows="2" className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-purple outline-none resize-none"
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Original Price (₹)</label>
                <input type="number" required className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-purple outline-none"
                  value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300 flex items-center gap-1">
                  Flash Price (₹)
                  <button type="button" onClick={handleSuggestPrice} disabled={loadingPrice}
                    className="ml-2 text-xs px-2.5 py-1 bg-neon-blue/10 border border-neon-blue/40 text-neon-blue rounded-full hover:bg-neon-blue hover:text-slate-900 transition-all flex items-center gap-1 disabled:opacity-50">
                    {loadingPrice ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
                    Suggest 🤖
                  </button>
                </label>
                <input type="number" required className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-blue outline-none border border-neon-blue/20"
                  value={formData.discountPrice} onChange={e => setFormData({ ...formData, discountPrice: e.target.value })} />
                {priceSuggestion && (
                  <p className="text-xs text-neon-blue mt-1">🤖 Suggested: ₹{priceSuggestion.suggestedPrice} ({priceSuggestion.discountPercent}% off) — {priceSuggestion.reasoning}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Quantity</label>
                <input type="number" required className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-purple outline-none"
                  value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Demand Level</label>
                <select className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-purple outline-none appearance-none"
                  value={formData.demand} onChange={e => setFormData({ ...formData, demand: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Expiry Time</label>
                <input type="datetime-local" required className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-purple outline-none"
                  value={formData.expiryTime} onChange={e => setFormData({ ...formData, expiryTime: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Min. Price Floor (₹, optional)</label>
                <input type="number" className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-slate-500 outline-none"
                  placeholder="Price never goes below this"
                  value={formData.minimumPrice} onChange={e => setFormData({ ...formData, minimumPrice: e.target.value })} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1 text-slate-300">Image URL</label>
                <input type="text" className="w-full bg-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-neon-purple outline-none"
                  placeholder="https://example.com/product.jpg"
                  value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
              </div>

              {/* Photo Enhancer */}
              {formData.image && (
                <div className="md:col-span-2">
                  <PhotoEnhancer imageUrl={formData.image} title={formData.title} />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm mb-1 text-slate-300">Store Location <span className="text-slate-500">(click map to set)</span></label>
                <MapPicker onLocationSelect={useCallback((loc) => setFormData(f => ({ ...f, latitude: loc.lat, longitude: loc.lng })), [])} />
              </div>
            </div>

            <button type="submit" className="w-full mt-6 bg-neon-purple text-white py-3.5 rounded-xl font-black text-lg hover:bg-[#d44dff] transition-all shadow-[0_0_20px_rgba(188,19,254,0.4)] active:scale-[0.98]">
              🚀 Post Flash Deal
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 w-fit">
        {[['deals', 'My Deals'], ['bundle', '🧩 Bundle Creator'], ['analytics', '📊 Analytics']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-slate-800 text-neon-purple shadow-[0_0_10px_rgba(188,19,254,0.3)]' : 'text-slate-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab: My Deals Table */}
      {activeTab === 'deals' && (
        <div className="overflow-x-auto glass rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-300">
              <tr>
                <th className="p-4 rounded-tl-2xl">Item</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 rounded-tr-2xl">Bundle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {deals.map(deal => (
                <tr key={deal._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-medium">{deal.title}</td>
                  <td className="p-4">
                    <span className="text-neon-blue font-bold">₹{deal.discountPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-500 line-through ml-2">₹{deal.originalPrice.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="p-4">{deal.quantity}</td>
                  <td className="p-4">
                    {new Date(deal.expiryTime) > new Date()
                      ? <span className="bg-green-400/10 text-green-400 px-2 py-1 rounded text-xs font-bold">Active</span>
                      : <span className="bg-red-400/10 text-red-400 px-2 py-1 rounded text-xs font-bold">Expired</span>}
                  </td>
                  <td className="p-4">
                    <input type="checkbox" className="accent-neon-purple w-4 h-4 cursor-pointer"
                      checked={selectedForBundle.includes(deal._id)}
                      onChange={() => toggleBundleSelect(deal._id)} />
                  </td>
                </tr>
              ))}
              {deals.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No deals posted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Bundle Creator */}
      {activeTab === 'bundle' && (
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-2">🧩 Bundle Deal Creator</h2>
          <p className="text-slate-400 text-sm mb-6">Select 2+ deals → auto-generate a combo bundle with 15–25% off</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {deals.map(deal => (
              <div key={deal._id} onClick={() => toggleBundleSelect(deal._id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedForBundle.includes(deal._id) ? 'border-neon-purple bg-neon-purple/10' : 'border-slate-700 hover:border-slate-500'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{deal.title}</span>
                  <span className="text-neon-blue font-bold">₹{deal.discountPrice.toLocaleString('en-IN')}</span>
                </div>
                {selectedForBundle.includes(deal._id) && <span className="text-xs text-neon-purple mt-1 block">✓ In bundle</span>}
              </div>
            ))}
          </div>
          {bundleDeals.length >= 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass border border-neon-blue/40 p-5 rounded-2xl text-center">
              <p className="text-slate-400 text-sm mb-1">{bundleDeals.length} deals bundled</p>
              <p className="text-slate-500 text-lg line-through">₹{bundleTotal.toLocaleString('en-IN')}</p>
              <p className="text-4xl font-black text-neon-blue mb-1">₹{bundlePrice.toLocaleString('en-IN')}</p>
              <p className="text-green-400 font-bold text-lg mb-4">🎉 {bundleDiscountPct}% Bundle Discount!</p>
              <button className="bg-neon-blue text-slate-900 px-8 py-3 rounded-xl font-black hover:bg-white transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]">
                Create Bundle Deal
              </button>
            </motion.div>
          )}
          {bundleDeals.length < 2 && deals.length > 0 && (
            <div className="text-center py-8 text-slate-400">
              <Layers size={40} className="mx-auto mb-3 opacity-40" />
              <p>Select at least 2 deals to create a bundle.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Value Created', value: `₹${(deals.reduce((s,d) => s + d.originalPrice * (d.quantity || 0), 0) / 1000).toFixed(1)}K`, color: 'text-neon-purple', icon: '💰' },
              { label: 'Customer Savings Generated', value: `₹${(totalSaved / 1000).toFixed(1)}K`, color: 'text-green-400', icon: '🎁' },
              { label: 'Units Prevented from Waste', value: `${totalUnits} units`, color: 'text-neon-blue', icon: '♻️' },
            ].map(({ label, value, color, icon }) => (
              <motion.div key={label} whileHover={{ scale: 1.03 }} className="glass p-6 rounded-2xl text-center">
                <div className="text-4xl mb-3">{icon}</div>
                <p className={`text-3xl font-black ${color} mb-1`}>{value}</p>
                <p className="text-slate-400 text-sm">{label}</p>
              </motion.div>
            ))}
          </div>
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-neon-blue" /> Deal Performance Breakdown</h3>
            <div className="space-y-3">
              {deals.slice(0, 5).map(deal => {
                const saved = (deal.originalPrice - deal.discountPrice) * (deal.quantity || 0);
                const pct = Math.round(((deal.originalPrice - deal.discountPrice) / deal.originalPrice) * 100);
                return (
                  <div key={deal._id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium truncate">{deal.title}</span>
                        <span className="text-green-400 font-bold text-xs">₹{saved.toLocaleString('en-IN')} saved</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full" />
                      </div>
                    </div>
                    <span className="text-xs text-neon-purple font-bold w-12 text-right">{pct}% off</span>
                  </div>
                );
              })}
              {deals.length === 0 && <p className="text-slate-400 text-center py-8">No deals to analyze yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerDashboard;
