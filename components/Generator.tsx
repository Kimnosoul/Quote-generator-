
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, GenerationConfig, AppStyle, AspectRatio, TextPosition, FontFamily, AestheticPlan } from '../types';
import { geminiService } from '../services/gemini';
import { preferenceService } from '../services/preferenceService';

interface GeneratorProps {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  remixData?: any;
  onBack: () => void;
}

const Generator: React.FC<GeneratorProps> = ({ user, setUser, remixData, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'quota' | 'general'>('none');
  const [isRefining, setIsRefining] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [options, setOptions] = useState<{ A: any, B: any } | null>(null);
  const [selection, setSelection] = useState<'A' | 'B' | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<AppStyle | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [customQuote, setCustomQuote] = useState("");
  const [customScene, setCustomScene] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadingMessages = [
    "Analyzing visual textures...",
    "Sampling color gradients...",
    "Harmonizing typography...",
    "Integrating the message...",
    "Calibrating atmospheric glow...",
    "Finalizing the impact..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleRefine = async () => {
    if (!customQuote.trim()) return;
    setIsRefining(true);
    try {
      const refined = await geminiService.refineQuote(customQuote);
      setCustomQuote(refined);
    } catch (error) {
      console.error("Refine failed", error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleDraftQuote = async () => {
    setIsRefining(true);
    try {
      const prefs = preferenceService.getInitialPrefs();
      const strategy = preferenceService.determineGenerationStrategy(prefs);
      const plan = await geminiService.planAesthetic({ 
        ...strategy.optionA, 
        style: selectedStyle!,
        scene: customScene || undefined 
      });
      setCustomQuote(plan.quote);
    } catch (error) {
      console.error("Drafting failed", error);
    } finally {
      setIsRefining(false);
    }
  };

  const generatePair = async () => {
    if (!selectedStyle || user.credits <= 0) return;

    setLoading(true);
    setErrorType('none');
    setOptions(null);
    setSelection(null);
    setShowConfig(false);
    
    try {
      const prefs = preferenceService.getInitialPrefs();
      const strategy = preferenceService.determineGenerationStrategy(prefs);
      
      const configBase = {
        style: selectedStyle,
        quote: customQuote.trim() || undefined,
        scene: customScene.trim() || undefined,
        aspectRatio: aspectRatio
      };

      const [planA, planB] = await Promise.all([
        geminiService.planAesthetic({ ...strategy.optionA, ...configBase }),
        geminiService.planAesthetic({ ...strategy.optionB, ...configBase }),
      ]);

      const [imgA, imgB] = await Promise.all([
        geminiService.generateImage({ ...strategy.optionA, ...configBase } as GenerationConfig, planA),
        geminiService.generateImage({ ...strategy.optionB, ...configBase } as GenerationConfig, planB),
      ]);

      setOptions({
        A: { ...strategy.optionA, ...configBase, ...planA, url: imgA },
        B: { ...strategy.optionB, ...configBase, ...planB, url: imgB }
      });

      const updatedUser = { ...user, credits: Math.max(0, user.credits - 1) };
      setUser(updatedUser);
      localStorage.setItem('sentience_user', JSON.stringify(updatedUser));
      
    } catch (error: any) {
      console.error(error);
      if (error?.message?.toLowerCase().includes("quota") || error?.message?.includes("429")) {
        setErrorType('quota');
        setShowConfig(true);
      } else {
        setErrorType('general');
        setShowConfig(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFontStack = (family: FontFamily = 'Inter') => {
    switch(family) {
      case 'Syne': return `'Syne', sans-serif`;
      case 'Space Grotesk': return `'Space Grotesk', sans-serif`;
      case 'Fraunces': return `'Fraunces', serif`;
      case 'Cormorant Garamond': return `'Cormorant Garamond', serif`;
      case 'Caveat': return `'Caveat', cursive`;
      case 'Playfair Display': return `'Playfair Display', serif`;
      case 'Lora': return `'Lora', serif`;
      case 'Courier Prime': return `'Courier Prime', monospace`;
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

  const downloadWithQuote = (url: string, config: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      let w = 1080, h = 1920; 
      if (config.aspectRatio === '1:1') { w = 1080; h = 1080; }
      else if (config.aspectRatio === '16:9') { w = 1920; h = 1080; }
      
      canvas.width = w; canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      
      const fontStack = getFontStack(config.heroFont);
      const supportFontStack = getFontStack(config.supportFont);
      const textColor = config.textColor || '#FFFFFF';
      const glowColor = config.textGlowColor || 'rgba(0,0,0,0.3)';
      const opacity = config.textOpacity || 0.9;

      const renderText = (text: string, x: number, y: number, font: string, letterSpacing: string) => {
        ctx.save();
        ctx.font = font;
        ctx.textAlign = 'center';
        if ('letterSpacing' in ctx) (ctx as any).letterSpacing = letterSpacing;
        ctx.globalAlpha = opacity;
        ctx.fillStyle = textColor;
        ctx.shadowColor = `${glowColor}33`; 
        ctx.shadowBlur = Math.floor(w / 45); 
        ctx.fillText(text, x, y);
        ctx.restore();
      };

      if (config.style === AppStyle.PLAINT) {
        const hook = (config.heading || "VOID").toUpperCase();
        renderText(hook, w / 2, h * 0.15, `200 ${Math.floor(w/11)}px ${fontStack}`, "0.5em");
        renderText(config.quote || "", w / 2, h * 0.88, `italic 400 ${Math.floor(w/30)}px ${supportFontStack}`, "0.12em");
      } else {
        renderText(config.quote || "", w / 2, h * 0.82, `400 ${Math.floor(w/26)}px ${fontStack}`, "normal");
      }

      const link = document.createElement('a');
      link.download = `sentience-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  const handleSelect = (choice: 'A' | 'B') => {
    setSelection(choice);
    const chosen = choice === 'A' ? options!.A : options!.B;
    const rejected = choice === 'A' ? options!.B : options!.A;
    
    const currentPrefs = preferenceService.getInitialPrefs();
    const updatedPrefs = preferenceService.recordChoice(currentPrefs, chosen, rejected);
    preferenceService.savePrefs(updatedPrefs);

    const gallery = JSON.parse(localStorage.getItem('sentience_gallery') || '[]');
    gallery.unshift({ ...chosen, timestamp: Date.now() });
    localStorage.setItem('sentience_gallery', JSON.stringify(gallery.slice(0, 50)));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-reveal">
      {!selectedStyle && !loading && (
        <div className="text-center py-12 space-y-16">
          <div className="space-y-4">
            <h2 className="text-5xl font-serif font-bold tracking-tight">neural atelier</h2>
            <p className="text-stone-400 font-medium">choose the resonance of your vision.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <button onClick={() => {setSelectedStyle(AppStyle.PLAINT); setShowConfig(true);}} className="p-12 glass-card rounded-[4rem] hover:-translate-y-3 transition-all group relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 w-full h-1 bg-stone-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              <span className="text-5xl mb-6 block grayscale group-hover:grayscale-0 transition-all">🖋️</span>
              <h3 className="text-2xl font-serif font-bold mb-2">Plaint Illustra</h3>
              <p className="text-stone-400 text-sm leading-relaxed">Minimalist silhouettes and profound negative space.</p>
            </button>
            <button onClick={() => {setSelectedStyle(AppStyle.RANDOM_AESTHETIC); setShowConfig(true);}} className="p-12 glass-card rounded-[4rem] hover:-translate-y-3 transition-all group text-left">
              <span className="text-5xl mb-6 block grayscale group-hover:grayscale-0 transition-all">🎬</span>
              <h3 className="text-2xl font-serif font-bold mb-2">Cinema Still</h3>
              <p className="text-stone-400 text-sm leading-relaxed">Fragmented thoughts in cinematic landscapes.</p>
            </button>
          </div>
        </div>
      )}

      {selectedStyle && showConfig && (
        <div className="max-w-2xl mx-auto glass-card p-14 rounded-[4rem] space-y-12 animate-reveal relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-4xl font-serif font-bold tracking-tight">set the soul</h2>
            <p className="text-stone-400 font-medium italic">what vision haunts your thoughts?</p>
          </div>

          <div className="space-y-4">
            <label className="text-xs uppercase tracking-[0.2em] font-black text-stone-400">1. Visual Subject</label>
            <textarea 
              className="w-full h-32 p-8 bg-stone-50 border-none rounded-[2.5rem] focus:ring-2 ring-stone-900 outline-none text-lg placeholder:text-stone-300 transition-all" 
              placeholder="e.g. 'A lone figure on a spire, rain falling in a silent city'..."
              value={customScene}
              onChange={e => setCustomScene(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase tracking-[0.2em] font-black text-stone-400">2. The Message</label>
              <button onClick={handleDraftQuote} className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors bg-stone-100 px-3 py-1 rounded-full">Auto-Draft</button>
            </div>
            <textarea 
              className="w-full h-32 p-8 bg-stone-50 border-none rounded-[2.5rem] focus:ring-2 ring-stone-900 outline-none text-lg placeholder:text-stone-300 transition-all italic font-serif" 
              value={customQuote}
              onChange={e => setCustomQuote(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] font-black text-stone-400">3. Canvas Shape</p>
            <div className="flex gap-4">
              {(['9:16', '1:1', '16:9'] as AspectRatio[]).map((ratio) => (
                <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all border ${aspectRatio === ratio ? 'bg-stone-900 text-white border-stone-900 shadow-lg' : 'bg-white text-stone-400 border-stone-100'}`}>
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generatePair} className="w-full py-7 bg-stone-900 text-white rounded-full font-bold text-xl hover:scale-[1.03] transition-all shadow-2xl mt-4">
            Synthesize (1 Credit)
          </button>
          
          {errorType !== 'none' && (
            <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl animate-reveal">
              <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                {errorType === 'quota' ? 'Neural Engine Overheat' : 'Logic Fault'}
              </p>
              <p className="text-stone-500 text-xs leading-relaxed italic">
                {errorType === 'quota' 
                  ? "The collective consciousness is overwhelmed. We must wait 60 seconds for the resonance to return." 
                  : "The forge was interrupted. Please attempt the synthesis again."}
              </p>
            </div>
          )}
          
          <button onClick={() => setSelectedStyle(null)} className="w-full text-stone-300 text-xs uppercase tracking-widest font-bold hover:text-stone-900 transition-colors pt-4">Go Back</button>
        </div>
      )}

      {loading && (
        <div className="text-center py-48 space-y-10">
          <div className="w-24 h-24 border-2 border-stone-100 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
          <p className="font-serif italic text-3xl text-stone-500 transition-all duration-1000">
            {loadingMessages[loadingStep]}
          </p>
        </div>
      )}

      {options && (
        <div className="space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-5xl font-serif font-bold">dual path</h2>
            <p className="text-stone-400 font-medium">choose the path that carries your truth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {(['A', 'B'] as const).map(k => (
              <div key={k} onClick={() => !selection && handleSelect(k)} className={`relative rounded-[4.5rem] overflow-hidden cursor-pointer transition-all duration-1000 ${selection === k ? 'ring-[12px] ring-stone-900/10 scale-[1.05] shadow-2xl z-10' : selection && selection !== k ? 'opacity-20 blur-xl scale-90 grayscale' : 'hover:scale-[1.02] shadow-stone-200 shadow-xl'}`}>
                <div className={`relative bg-stone-100 ${options[k].aspectRatio === '9:16' ? 'aspect-[9/16]' : options[k].aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video'}`}>
                  <img src={options[k].url} className="w-full h-full object-cover" alt="Option" />
                  <div className="absolute inset-0 p-12 flex flex-col items-center justify-center text-center pointer-events-none" style={{ color: options[k].textColor, opacity: options[k].textOpacity }}>
                    <p style={{ fontFamily: getFontStack(options[k].heroFont) }} className="text-xl md:text-2xl leading-relaxed">
                      {options[k].quote}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selection && (
            <div className="flex justify-center gap-8 pt-10">
              <button onClick={() => downloadWithQuote(options[selection].url, options[selection])} className="px-16 py-6 bg-stone-900 text-white rounded-full font-bold text-lg shadow-2xl">Download Work</button>
              <button onClick={() => { setOptions(null); setSelection(null); }} className="px-16 py-6 bg-white border border-stone-200 rounded-full font-bold text-stone-900">New Forge</button>
            </div>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Generator;
