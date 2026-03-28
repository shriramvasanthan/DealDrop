import { useState, useRef, useEffect } from 'react';
import { Sun, Contrast, Download } from 'lucide-react';

const PhotoEnhancer = ({ imageUrl, title }) => {
  const canvasRef = useRef(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0);

      if (showBadge) {
        ctx.filter = 'none';
        const badgeW = Math.min(img.width * 0.55, 260);
        const badgeH = 48;
        const x = img.width / 2 - badgeW / 2;
        const y = img.height - badgeH - 16;
        ctx.fillStyle = 'rgba(188,19,254,0.88)';
        ctx.beginPath();
        ctx.roundRect(x, y, badgeW, badgeH, 24);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.round(badgeH * 0.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🔥 Deal of the Day`, img.width / 2, y + badgeH / 2);
      }
    };
  }, [imageUrl, brightness, contrast, showBadge]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'enhanced-deal.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if (!imageUrl) return null;

  return (
    <div className="mt-4 glass rounded-2xl p-5 border border-neon-purple/30">
      <h4 className="text-base font-bold mb-3 text-neon-purple">📸 Photo Enhancer</h4>
      <canvas ref={canvasRef} className="w-full rounded-xl mb-4 max-h-52 object-cover" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Sun size={16} className="text-yellow-400 shrink-0" />
          <span className="text-xs text-slate-400 w-20">Brightness</span>
          <input type="range" min="50" max="180" value={brightness} onChange={e => setBrightness(+e.target.value)} className="flex-1 accent-neon-blue" />
          <span className="text-xs text-neon-blue w-8">{brightness}%</span>
        </div>
        <div className="flex items-center gap-3">
          <Contrast size={16} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 w-20">Contrast</span>
          <input type="range" min="50" max="200" value={contrast} onChange={e => setContrast(+e.target.value)} className="flex-1 accent-neon-purple" />
          <span className="text-xs text-neon-purple w-8">{contrast}%</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
            <input type="checkbox" checked={showBadge} onChange={e => setShowBadge(e.target.checked)} className="accent-neon-purple" />
            Add "🔥 Deal of the Day" badge
          </label>
          <button onClick={handleDownload} className="flex items-center gap-1 text-xs text-neon-blue hover:text-white transition-colors">
            <Download size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoEnhancer;
