import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const DealCard = ({ deal }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const expiry = new Date(deal.expiryTime);
      if (expiry > new Date()) {
        setTimeLeft(formatDistanceToNow(expiry));
      } else {
        setTimeLeft('Expired');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, [deal.expiryTime]);

  const discountPercent = Math.round(((deal.originalPrice - deal.discountPrice) / deal.originalPrice) * 100);

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass overflow-hidden group flex flex-col h-full"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={deal.image} 
          alt={deal.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-neon-purple text-white text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_#bc13fe]">
          {discountPercent}% OFF
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-1 truncate group-hover:text-neon-blue transition-all">{deal.title}</h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{deal.description}</p>
        
        <div className="flex items-center gap-2 mb-4 text-sm font-medium">
          <span className="text-2xl font-black text-neon-blue">₹{deal.discountPrice.toLocaleString('en-IN')}</span>
          <span className="text-slate-500 line-through">₹{deal.originalPrice.toLocaleString('en-IN')}</span>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded">
              <Clock size={14} className={timeLeft === 'Expired' ? 'text-red-500' : 'text-neon-blue'} />
              <span className={timeLeft === 'Expired' ? 'text-red-500 font-bold' : ''}>
                {timeLeft === 'Expired' ? 'Expired' : `${timeLeft} left`}
              </span>
            </div>
            {deal.distance && (
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-neon-purple" />
                <span>{deal.distance} km away</span>
              </div>
            )}
          </div>

          <Link 
            to={`/deal/${deal._id}`}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-neon-blue border border-slate-700 hover:border-neon-blue text-white hover:text-slate-900 py-2.5 rounded-lg transition-all font-semibold"
          >
            View Deal <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default DealCard;
