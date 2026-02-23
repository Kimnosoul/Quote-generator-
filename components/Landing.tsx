
import React from 'react';

const Landing: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center text-center px-6">
      <div className="absolute inset-0 z-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover grayscale" 
          alt="Atmosphere"
        />
      </div>
      
      <div className="z-10 space-y-12 animate-reveal">
        <h1 className="text-[12vw] leading-[0.85] font-serif font-bold tracking-tighter">
          VISUAL<br/><span className="italic ml-[4vw]">RESONANCE</span>
        </h1>
        
        <p className="max-w-xl mx-auto text-lg text-stone-500 font-medium leading-relaxed">
          The intersection of human thought and artificial perception. 
          Synthesize high-impact visual narratives with professional precision.
        </p>

        <button 
          onClick={onStart}
          className="group relative px-16 py-6 overflow-hidden rounded-full bg-black text-white text-xs uppercase tracking-[0.3em] font-bold transition-all hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">Enter Atelier</span>
          <div className="absolute inset-0 bg-stone-800 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </button>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] opacity-30 flex gap-4">
        <span>Infinite Generations</span>
        <span>•</span>
        <span>No Credentials Required</span>
      </div>
    </div>
  );
};

export default Landing;
