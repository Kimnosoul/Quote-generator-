
import React, { useState, useRef } from 'react';
import { geminiService } from '../services/gemini';
import { ArtisticStyle, AspectRatio, ImpactImage, AestheticPlan, FontFamily, MoodProfile } from '../types';

const Atelier: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'quota' | 'general'>('none');
  const [config, setConfig] = useState({
    mood: MoodProfile.SOLACE,
    style: ArtisticStyle.MOODY_ATMOSPHERE,
    aspectRatio: '9:16' as AspectRatio,
    subject: '',
    customQuote: ''
  });
  const [result, setResult] = useState<ImpactImage | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorType('none');
    setResult(null);
    try {
      const plan = await geminiService.planAesthetic(config);
      const url = await geminiService.generateImage(config, plan);
      
      const newImpact: ImpactImage = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        plan,
        config,
        timestamp: Date.now()
      };
      
      setResult(newImpact);
      const gallery = JSON.parse(localStorage.getItem('sentience_gallery') || '[]');
      localStorage.setItem('sentience_gallery', JSON.stringify([newImpact, ...gallery].slice(0, 50)));
    } catch (err: any) {
      console.error(err);
      if (err?.message?.toLowerCase().includes("quota") || err?.message?.includes("429")) {
        setErrorType('quota');
      } else {
        setErrorType('general');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFontStack = (family: FontFamily) => {
    switch(family) {
      case 'Syne': return `'Syne', sans-serif`;
      case 'Space Grotesk': return `'Space Grotesk', sans-serif`;
      case 'Fraunces': return `'Fraunces', serif`;
      case 'Cormorant Garamond': return `'Cormorant Garamond', serif`;
      case 'Playfair Display': return `'Playfair Display', serif`;
      case 'Lora': return `'Lora', serif`;
      case 'Courier Prime': return `'Courier Prime', monospace`;
      case 'Caveat': return `'Caveat', cursive`;
      case 'UnifrakturMaguntia': return `'UnifrakturMaguntia', cursive`;
      case 'Bebas Neue': return `'Bebas Neue', sans-serif`;
      case 'Montserrat': return `'Montserrat', sans-serif`;
      case 'Cinzel': return `'Cinzel', serif`;
      case 'Italiana': return `'Italiana', serif`;
      case 'Major Mono Display': return `'Major Mono Display', monospace`;
      case 'Krona One': return `'Krona One', sans-serif`;
      case 'Old Standard TT': return `'Old Standard TT', serif`;
      case 'Six Caps': return `'Six Caps', sans-serif`;
      case 'VT323': return `'VT323', monospace`;
      case 'Libre Caslon Display': return `'Libre Caslon Display', serif`;
      case 'Abril Fatface': return `'Abril Fatface', cursive`;
      default: return `'Inter', sans-serif`;
    }
  };

  const download = () => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = result.url;
    img.onload = () => {
      let w = 1080, h = 1920;
      if (result.config.aspectRatio === '1:1') { w = 1080; h = 1080; }
      if (result.config.aspectRatio === '16:9') { w = 1920; h = 1080; }
      
      canvas.width = w; canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      
      const { plan } = result;
      ctx.save();
      ctx.textAlign = 'center';
      
      let yPos = h * 0.5;
      if (plan.verticalAlign === 'top') yPos = h * 0.25;
      if (plan.verticalAlign === 'bottom') yPos = h * 0.75;

      // LAYOUT RENDERER
      if (plan.layoutType === 'boxed_minimal') {
        const boxW = w * 0.6;
        const boxH = h * 0.08;
        ctx.fillStyle = plan.backgroundColor || 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.roundRect(w/2 - boxW/2, yPos - boxH/2, boxW, boxH, 20);
        ctx.fill();
        ctx.fillStyle = plan.textColor;
        ctx.font = `${Math.floor(w/24)}px ${getFontStack(plan.heroFont)}`;
        ctx.fillText(plan.quote.toUpperCase(), w/2, yPos + Math.floor(w/60));
      } else if (plan.layoutType === 'hero_stack') {
        ctx.fillStyle = plan.textColor;
        ctx.globalAlpha = plan.textOpacity;
        const hSize = Math.floor(w / 8);
        ctx.font = `700 ${hSize}px ${getFontStack(plan.heroFont)}`;
        if ('letterSpacing' in ctx) (ctx as any).letterSpacing = plan.letterSpacing;
        ctx.fillText(plan.heading.toUpperCase(), w/2, yPos);
        const qSize = Math.floor(w / 18);
        ctx.font = `400 ${qSize}px ${getFontStack(plan.supportFont)}`;
        (ctx as any).letterSpacing = 'normal';
        ctx.fillText(plan.quote, w/2, yPos + hSize/1.5);
      } else if (plan.layoutType === 'window_scribe') {
        ctx.fillStyle = plan.textColor;
        ctx.globalAlpha = plan.textOpacity;
        ctx.shadowColor = plan.textGlowColor || 'rgba(255,255,255,0.5)';
        ctx.shadowBlur = 15;
        const size = Math.floor(w / 14);
        ctx.font = `${size}px ${getFontStack('Caveat')}`;
        ctx.fillText(plan.quote, w/2, yPos);
      } else {
        ctx.fillStyle = plan.textColor;
        ctx.globalAlpha = plan.textOpacity;
        const size = Math.floor(w / (plan.layoutType === 'bold_headline' ? 10 : 22));
        ctx.font = `${plan.layoutType === 'bold_headline' ? '900' : '400'} ${size}px ${getFontStack(plan.heroFont)}`;
        if ('letterSpacing' in ctx) (ctx as any).letterSpacing = plan.letterSpacing;
        ctx.fillText(plan.quote, w/2, yPos);
      }
      
      ctx.restore();
      const link = document.createElement('a');
      link.download = `impact-${result.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto space-y-16">
      {!result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-reveal">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-serif font-bold tracking-tight mb-4">Mood Archive</h2>
              <p className="text-stone-500 text-sm">Synthesize a resonance based on the visual archive.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.values(MoodProfile).map(m => (
                <button 
                  key={m}
                  onClick={() => setConfig({ ...config, mood: m })}
                  className={`py-5 rounded-3xl text-[9px] uppercase tracking-widest font-black border transition-all ${config.mood === m ? 'bg-white text-black border-white shadow-xl scale-105' : 'bg-transparent text-stone-600 border-white/5 hover:border-white/20'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-black opacity-30">The Vision</label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 text-stone-100 rounded-3xl p-8 h-40 focus:ring-1 ring-white outline-none text-lg transition-all"
                placeholder="Describe the scene... (e.g. A lone figure on a bridge over dark trees)"
                value={config.subject}
                onChange={e => setConfig({ ...config, subject: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-10">
            <div className="space-y-8">
               <h2 className="text-4xl font-serif font-bold tracking-tight mb-4">Message</h2>
               <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-black opacity-30">Text Overlay</label>
                  <input 
                    type="text"
                    className="w-full bg-white/5 border border-white/10 text-stone-100 rounded-full px-10 py-5 focus:ring-1 ring-white outline-none italic text-lg"
                    placeholder="Reflections on life..."
                    value={config.customQuote}
                    onChange={e => setConfig({ ...config, customQuote: e.target.value })}
                  />
               </div>
               
               <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-black opacity-30">Canvas</label>
                  <div className="flex gap-4">
                    {(['9:16', '1:1', '16:9'] as AspectRatio[]).map(r => (
                      <button 
                        key={r}
                        onClick={() => setConfig({ ...config, aspectRatio: r })}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-bold border transition-all ${config.aspectRatio === r ? 'bg-white text-black border-white' : 'bg-transparent text-stone-600 border-white/10'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <button 
              onClick={handleGenerate}
              className="w-full py-8 bg-white text-black rounded-full font-bold uppercase tracking-[0.4em] text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Synthesize Impact
            </button>
            
            {errorType !== 'none' && (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl animate-reveal">
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">
                  {errorType === 'quota' ? 'Neural Engine Cooling' : 'Synthesis Interrupted'}
                </p>
                <p className="text-stone-500 text-[10px] leading-relaxed">
                  {errorType === 'quota' 
                    ? 'The synthesis quota is full. Please wait 60 seconds for resonance to stabilize.' 
                    : 'An unexpected fragment interrupted the forge. Please try again.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-10 text-center animate-reveal">
          <div className="w-16 h-16 border-2 border-white/5 border-t-white rounded-full animate-spin"></div>
          <div className="space-y-3">
            <p className="font-serif italic text-3xl text-white">Synthesizing Resonance...</p>
            <p className="text-stone-500 text-xs uppercase tracking-widest animate-pulse">Analyzing reference micro-patterns</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-16 animate-reveal flex flex-col items-center">
          <div className="relative w-full max-w-sm rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-black aspect-[9/16] group">
            <img src={result.url} className="w-full h-full object-cover opacity-90 transition-transform duration-[10s] group-hover:scale-110" alt="Result" />
            
            <div 
              className={`absolute inset-0 flex flex-col items-center p-12 text-center pointer-events-none ${
                result.plan.verticalAlign === 'top' ? 'justify-start pt-32' : 
                result.plan.verticalAlign === 'bottom' ? 'justify-end pb-32' : 'justify-center'
              }`}
              style={{ color: result.plan.textColor }}
            >
              {result.plan.layoutType === 'boxed_minimal' ? (
                <div className="px-8 py-4 rounded-full" style={{ backgroundColor: result.plan.backgroundColor || 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
                  <p 
                    style={{ fontFamily: getFontStack(result.plan.heroFont), letterSpacing: '0.1em' }} 
                    className="text-xs md:text-sm uppercase font-bold"
                  >
                    {result.plan.quote}
                  </p>
                </div>
              ) : result.plan.layoutType === 'hero_stack' ? (
                <div className="space-y-2">
                  <h3 
                    style={{ fontFamily: getFontStack(result.plan.heroFont), letterSpacing: result.plan.letterSpacing }} 
                    className="text-4xl font-bold uppercase"
                  >
                    {result.plan.heading}
                  </h3>
                  <p 
                    style={{ fontFamily: getFontStack(result.plan.supportFont) }} 
                    className="text-lg italic opacity-80"
                  >
                    {result.plan.quote}
                  </p>
                </div>
              ) : result.plan.layoutType === 'window_scribe' ? (
                <p 
                  style={{ 
                    fontFamily: getFontStack('Caveat'),
                    opacity: result.plan.textOpacity,
                    textShadow: `0 0 10px ${result.plan.textGlowColor || 'rgba(255,255,255,0.5)'}`
                  }} 
                  className="text-3xl font-medium leading-relaxed"
                >
                  {result.plan.quote}
                </p>
              ) : (
                <p 
                  style={{ 
                    fontFamily: getFontStack(result.plan.heroFont),
                    letterSpacing: result.plan.letterSpacing,
                    opacity: result.plan.textOpacity,
                    textShadow: result.plan.layoutType === 'neon_reflection' ? `0 0 20px ${result.plan.textGlowColor}` : 'none'
                  }} 
                  className={`${result.plan.layoutType === 'bold_headline' ? 'text-3xl font-black uppercase' : 'text-xl font-medium'} leading-relaxed`}
                >
                  {result.plan.quote}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            <button onClick={download} className="px-14 py-5 bg-white text-black rounded-full font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Export Work</button>
            <button onClick={() => setResult(null)} className="px-14 py-5 border border-white/10 text-stone-500 rounded-full font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all">New Forge</button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Atelier;
