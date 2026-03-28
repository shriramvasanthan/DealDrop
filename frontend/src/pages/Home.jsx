import { useState, useEffect } from 'react';
import axios from 'axios';
import DealCard from '../components/DealCard';
import { Map, Grid, SlidersHorizontal, Zap, ArrowRight, ChevronDown, Flame, Clock, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Chennai, India coordinates
const INDIA_CENTER = [13.0827, 80.2707];

const defaultMockDeals = [
  { _id: 'mock1', title: 'Sonic Wireless Headphones', description: 'Noise cancelling overhead headphones at massive discount for the next hour only.', discountPrice: 4999, originalPrice: 12999, expiryTime: new Date(Date.now() + 1000 * 60 * 45).toISOString(), image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2707, 13.0827] }, category: 'Electronics', distance: 1.2 },
  { _id: 'mock2', title: 'Nike Air Max 2024', description: 'Exclusive street-style colorway releasing today.', discountPrice: 6999, originalPrice: 11999, expiryTime: new Date(Date.now() + 1000 * 60 * 12).toISOString(), image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2765, 13.0900] }, category: 'Apparel', distance: 0.5 },
  { _id: 'mock3', title: 'Artisan Coorg Coffee', description: 'Freshly roasted reserve batch from Coorg, Karnataka.', discountPrice: 699, originalPrice: 1299, expiryTime: new Date(Date.now() + 1000 * 60 * 120).toISOString(), image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2600, 13.0750] }, category: 'Food & Drink', distance: 2.1 },
  { _id: 'mock4', title: 'Nomad Leather Messenger', description: 'Handcrafted genuine leather messenger bag.', discountPrice: 4999, originalPrice: 9999, expiryTime: new Date(Date.now() + 1000 * 60 * 30).toISOString(), image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2550, 13.0830] }, category: 'Fashion', distance: 3.4 },
  { _id: 'mock5', title: 'Apple Watch Series 9', description: 'Open box, fully verified with 1-year warranty. Best deal in the city.', discountPrice: 28999, originalPrice: 45900, expiryTime: new Date(Date.now() + 1000 * 60 * 8).toISOString(), image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2480, 13.0870] }, category: 'Electronics', distance: 1.8 },
  { _id: 'mock6', title: 'Mysore Silk Saree', description: 'Authentic Mysore pure silk, border embroidery. Limited stock at this price.', discountPrice: 3499, originalPrice: 7500, expiryTime: new Date(Date.now() + 1000 * 60 * 200).toISOString(), image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2620, 13.0710] }, category: 'Ethnic Wear', distance: 4.0 },
  { _id: 'mock7', title: 'Himalaya Skincare Kit', description: 'Complete 6-piece face care regime. Buy today, collect tomorrow.', discountPrice: 799, originalPrice: 1450, expiryTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(), image: 'https://images.unsplash.com/photo-1556228890-d2e5a94d1bdb?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2790, 13.0760] }, category: 'Beauty', distance: 0.9 },
  { _id: 'mock8', title: 'Gaming Chair Pro', description: 'Ergonomic racing-style gaming chair with lumbar support. Warehouse clearance.', discountPrice: 8999, originalPrice: 18000, expiryTime: new Date(Date.now() + 1000 * 60 * 90).toISOString(), image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2670, 13.0950] }, category: 'Furniture', distance: 5.2 },
];

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="glass rounded-2xl p-6 flex flex-col items-center text-center"
  >
    <Icon size={28} className={`mb-3 ${color}`} />
    <span className={`text-3xl font-black mb-1 ${color}`}>{value}</span>
    <span className="text-slate-400 text-sm">{label}</span>
  </motion.div>
);

const Home = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/deals?lat=${INDIA_CENTER[0]}&lng=${INDIA_CENTER[1]}`);
        setDeals(res.data.length > 0 ? res.data : defaultMockDeals);
      } catch (error) {
        setDeals(defaultMockDeals);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const handleScrollToDeals = () => {
    document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const endingSoon = deals.filter(d => {
    const t = new Date(d.expiryTime) - new Date();
    return t > 0 && t < 1000 * 60 * 30;
  });

  const filteredDeals = selectedCategory === 'All'
    ? deals
    : deals.filter(d => d.category === selectedCategory);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full relative">
      {/* Ambient glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/20 blur-[130px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/15 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* HERO */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center text-center px-4 z-10 -mt-8">
        <motion.div style={{ y: y1, opacity }} className="max-w-5xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/80 backdrop-blur border border-neon-blue/40 text-neon-blue text-sm font-bold mb-8 shadow-[0_0_20px_rgba(0,243,255,0.2)]"
          >
            <Zap size={16} fill="currentColor" /> Live Hyperlocal Flash Sales — Chennai
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-tight"
          >
            Catch Deals Before <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-cyan-300 to-neon-purple">They Drop.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl font-light leading-relaxed"
          >
            Exclusive discounts from your favorite local brands dropping in real-time. Unbeatable prices, ticking timers.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-5 w-full justify-center"
          >
            <button onClick={handleScrollToDeals} className="bg-neon-blue text-slate-950 font-black px-10 py-4 rounded-2xl text-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.5)] hover:shadow-[0_0_40px_rgba(0,243,255,0.8)] flex items-center justify-center gap-3 group active:scale-95">
              Explore Deals <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link to="/auth" className="glass text-white font-bold px-10 py-4 rounded-2xl text-lg hover:bg-slate-800 transition-all border-slate-600 hover:border-slate-400 active:scale-95 flex items-center justify-center">
              Partner With Us
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="grid grid-cols-3 gap-6 mt-16 w-full max-w-lg"
          >
            {[['50+', 'Active Deals'], ['₹2Cr+', 'Saved by Users'], ['200+', 'Local Retailers']].map(([val, label]) => (
              <div key={label} className="glass rounded-2xl py-4 px-2 text-center">
                <div className="text-2xl font-black text-neon-blue mb-1">{val}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 12, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 text-slate-500 cursor-pointer hover:text-neon-blue transition-colors"
          onClick={handleScrollToDeals}
        >
          <ChevronDown size={40} />
        </motion.div>
      </section>

      {/* ENDING SOON SECTION */}
      {endingSoon.length > 0 && (
        <section className="relative z-10 mb-16">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-red-400 font-black text-2xl">
                <Flame size={24} className="animate-pulse" />
                Ending in &lt;30 mins
              </div>
              <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full border border-red-500/30 font-bold animate-pulse">HURRY UP</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {endingSoon.map((deal, i) => (
                <motion.div key={deal._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="h-full ring-1 ring-red-500/50 rounded-2xl">
                  <DealCard deal={deal} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* MAIN DEALS SECTION */}
      <section id="deals-section" className="relative z-10 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4"
        >
          <div>
            <h2 className="text-4xl font-bold neon-text-blue mb-3">Trending Nearby</h2>
            <p className="text-slate-400 text-lg">
              {selectedCategory === 'All' ? 'Offers vanishing quickly near Chennai' : `Showing: ${selectedCategory}`}
              {selectedCategory !== 'All' && (
                <button onClick={() => setSelectedCategory('All')} className="ml-3 text-sm text-neon-purple hover:text-white underline">Clear filter</button>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid size={20} /> <span className="hidden sm:inline font-semibold">Grid</span>
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`p-3 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-slate-800 text-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.3)]' : 'text-slate-400 hover:text-white'}`}
            >
              <Map size={20} /> <span className="hidden sm:inline font-semibold">Map</span>
            </button>
            <div className="w-px h-8 bg-slate-700 mx-2"></div>
            <button className="p-3 text-slate-400 hover:text-white transition-colors">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-neon-blue"></div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDeals.length > 0 ? filteredDeals.map((deal, index) => (
              <motion.div
                key={deal._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="h-full"
              >
                <DealCard deal={deal} />
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-20 text-slate-400">
                <p className="text-2xl mb-2">😔 No deals in <span className="text-neon-purple">{selectedCategory}</span></p>
                <button onClick={() => setSelectedCategory('All')} className="text-neon-blue hover:text-white transition-colors mt-2">Show all deals</button>
              </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass h-[700px] w-full rounded-3xl overflow-hidden border border-slate-700 relative z-0 shadow-2xl"
          >
            <MapContainer center={INDIA_CENTER} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {deals.map(deal => (
                deal.location?.coordinates && deal.location.coordinates.length === 2 && (
                  <Marker key={deal._id} position={[deal.location.coordinates[1], deal.location.coordinates[0]]}>
                    <Popup>
                      <div className="w-56 !m-0 !p-0">
                        <img src={deal.image} alt={deal.title} className="w-full h-32 object-cover rounded-t-lg" />
                        <div className="p-3 bg-white rounded-b-lg">
                          <h4 className="font-bold text-[15px] text-slate-900 leading-snug mb-1">{deal.title}</h4>
                          <p className="text-purple-700 font-black text-[15px] mb-3">₹{deal.discountPrice.toLocaleString('en-IN')} <span className="text-slate-400 font-normal line-through text-xs">₹{deal.originalPrice.toLocaleString('en-IN')}</span></p>
                          <Link to={`/deal/${deal._id}`} className="block text-center w-full bg-slate-900 text-cyan-400 font-bold rounded-lg py-2 text-sm hover:bg-slate-800 transition-colors">View Offer</Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </motion.div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative z-10 pb-24">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How <span className="neon-text-blue">DealDrop</span> Works</h2>
          <p className="text-slate-400 text-lg">Three steps to never miss a deal again</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Allow Location', desc: 'Grant location access once and we take care of the rest — instantly discovering deals around you.', icon: '📍' },
            { step: '02', title: 'Browse Flash Sales', desc: 'See live deals sorted by distance, category, or time remaining. Switch between grid and map views.', icon: '⚡' },
            { step: '03', title: 'Reserve & Collect', desc: 'Tap Reserve Now, get your unique QR code, and walk in to collect your deal before it expires.', icon: '🎉' },
          ].map((step, i) => (
            <motion.div key={step.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }} className="glass rounded-3xl p-8 text-center border-t-2 border-neon-blue/30 hover:border-neon-blue transition-colors group">
              <div className="text-5xl mb-4">{step.icon}</div>
              <div className="text-xs font-black text-neon-purple tracking-widest mb-2">STEP {step.step}</div>
              <h3 className="text-xl font-bold mb-3 group-hover:neon-text-blue transition-all">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="relative z-10 pb-32">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h2 className="text-4xl font-bold mb-8">Browse by <span className="neon-text-purple">Category</span></h2>
          <div className="flex flex-wrap gap-3">
            {['All', 'Electronics', 'Fashion', 'Food & Drink', 'Beauty', 'Ethnic Wear', 'Furniture', 'Apparel', 'Sports'].map((cat, i) => (
              <motion.button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-[0_0_12px_rgba(188,19,254,0.4)]'
                    : 'glass border-slate-600 hover:border-neon-blue hover:text-neon-blue'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
