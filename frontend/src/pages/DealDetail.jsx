import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Clock, MapPin, CheckCircle, ArrowLeft, Loader2, Tag, Star, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
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

// Indian mock deals matching the Home page mock data
const mockDeals = [
  { _id: 'mock1', title: 'Sonic Wireless Headphones', description: 'Noise cancelling overhead headphones at massive discount for the next hour only. Premium sound quality, 30hr battery, and a stunning matte-black finish.', discountPrice: 4999, originalPrice: 12999, expiryTime: new Date(Date.now() + 1000 * 60 * 45).toISOString(), image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2707, 13.0827] }, category: 'Electronics', quantity: 12 },
  { _id: 'mock2', title: 'Nike Air Max 2024', description: 'Exclusive street-style colorway releasing today ONLY. Ultra-cushioned sole with dynamic fit system.', discountPrice: 6999, originalPrice: 11999, expiryTime: new Date(Date.now() + 1000 * 60 * 12).toISOString(), image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2765, 13.0900] }, category: 'Apparel', quantity: 5 },
  { _id: 'mock3', title: 'Artisan Espresso Beans', description: 'Freshly roasted reserve batch from Coorg, Karnataka. Single origin. Limited 50kg batch.', discountPrice: 699, originalPrice: 1299, expiryTime: new Date(Date.now() + 1000 * 60 * 120).toISOString(), image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2600, 13.0750] }, category: 'Food & Drink', quantity: 30 },
  { _id: 'mock4', title: 'Nomad Leather Messenger', description: 'Handcrafted genuine leather messenger bag. Laptop-compatible up to 15 inches. Just 10 units at this price.', discountPrice: 4999, originalPrice: 9999, expiryTime: new Date(Date.now() + 1000 * 60 * 30).toISOString(), image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800', location: { coordinates: [80.2550, 13.0830] }, category: 'Fashion', quantity: 10 },
];

const DealDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        // First check mock deals
        const mock = mockDeals.find(d => d._id === id);
        if (mock) { setDeal(mock); setLoading(false); return; }

        // Otherwise fetch from backend
        const res = await axios.get(`http://localhost:5001/api/deals`);
        const found = res.data.find(d => d._id === id);
        setDeal(found || null);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchDeal();
  }, [id]);

  useEffect(() => {
    if (!deal) return;
    const updateTime = () => {
      const expiry = new Date(deal.expiryTime);
      setTimeLeft(expiry > new Date() ? formatDistanceToNow(expiry, { addSuffix: false }) : 'Expired');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [deal]);

  if (loading) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-neon-blue" size={48} /></div>;
  if (!deal) return (
    <div className="text-center mt-32">
      <p className="text-xl text-slate-400 mb-4">Deal not found</p>
      <Link to="/" className="text-neon-blue hover:text-white transition-colors">← Back to deals</Link>
    </div>
  );

  const isExpired = timeLeft === 'Expired';
  const discountPercent = Math.round(((deal.originalPrice - deal.discountPrice) / deal.originalPrice) * 100);
  const loc = deal.location?.coordinates ? [deal.location.coordinates[1], deal.location.coordinates[0]] : null;
  const savings = deal.originalPrice - deal.discountPrice;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors w-fit group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to deals
      </Link>
      
      <div className="glass rounded-3xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left - Image */}
          <div className="lg:w-1/2 relative">
            <img src={deal.image} alt={deal.title} className="w-full h-[400px] lg:h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
            <div className="absolute top-6 left-6 bg-neon-purple text-white font-black px-5 py-2 rounded-xl shadow-[0_0_20px_#bc13fe] rotate-[-3deg] text-lg">
              {discountPercent}% OFF
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <span className="bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold text-neon-blue border border-neon-blue/30">
                {deal.category}
              </span>
              <button className="p-2.5 bg-slate-900/80 backdrop-blur rounded-xl border border-slate-700 hover:border-neon-blue transition-colors">
                <Share2 size={16} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Right - Info */}
          <div className="lg:w-1/2 p-8 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-black leading-tight">{deal.title}</h1>
            </div>

            <p className="text-slate-300 leading-relaxed mb-6">{deal.description}</p>

            {/* Price */}
            <div className="bg-slate-800/50 rounded-2xl p-5 mb-6 border border-slate-700">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-black text-neon-blue">₹{deal.discountPrice.toLocaleString('en-IN')}</span>
                <span className="text-2xl text-slate-500 line-through">₹{deal.originalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-green-400" />
                <span className="text-green-400 font-bold text-sm">You save ₹{savings.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Meta */}
            <div className="space-y-3 mb-8">
              <div className={`flex items-center gap-3 p-3 rounded-xl ${isExpired ? 'bg-red-500/10 border border-red-500/30' : 'bg-neon-blue/5 border border-neon-blue/20'}`}>
                <Clock className={isExpired ? "text-red-500" : "text-neon-blue"} size={20} />
                <span className={`font-semibold ${isExpired ? "text-red-400" : "text-slate-200"}`}>
                  {isExpired ? "This deal has expired" : `Hurry! Ends in ${timeLeft}`}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <MapPin className="text-neon-purple" size={20} />
                <span className="text-slate-200">Chennai, Tamil Nadu</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <CheckCircle className="text-green-400" size={20} />
                <span className="text-slate-200"><b className="text-white">{deal.quantity}</b> units remaining in stock</span>
              </div>
            </div>

            {/* CTA */}
            {reserved ? (
              <div className="bg-green-500/20 border border-green-500 rounded-2xl p-4 text-center text-green-300 font-bold text-lg">
                ✅ Reserved Successfully! Show this at the store.
              </div>
            ) : isExpired ? (
              <button disabled className="w-full bg-slate-700 text-slate-400 font-bold py-4 rounded-2xl text-lg cursor-not-allowed">
                Sale Ended
              </button>
            ) : (
              <button
                onClick={() => setReserved(true)}
                className="w-full bg-neon-blue text-slate-900 font-black py-4 rounded-2xl text-xl hover:bg-[#52f6ff] transition-all shadow-[0_0_20px_rgba(0,243,255,0.5)] hover:shadow-[0_0_35px_rgba(0,243,255,0.7)] active:scale-95"
              >
                Reserve Now ⚡
              </button>
            )}
          </div>
        </div>

        {/* Store Map */}
        {loc && (
          <div className="border-t border-slate-700">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold flex items-center gap-2"><MapPin size={20} className="text-neon-purple" /> Store Location</h3>
            </div>
            <div className="h-[300px] relative z-0">
              <MapContainer center={loc} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }} className="z-0">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={loc}><Popup>{deal.title} — Pick up here</Popup></Marker>
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DealDetail;
