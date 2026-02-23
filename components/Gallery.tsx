
import React, { useState, useEffect } from 'react';
import { ImpactImage } from '../types';

const Gallery: React.FC<{ onGenerate: () => void }> = ({ onGenerate }) => {
  const [items, setItems] = useState<ImpactImage[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('sentience_gallery');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const remove = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('sentience_gallery', JSON.stringify(updated));
  };

  return (
    <div className="pt-32 pb-20 px-8 max-w-7xl mx-auto space-y-16">
      <div className="flex justify-between items-end border-b border-stone-100 pb-8">
        <div className="space-y-2">
          <h2 className="text-5xl font-serif font-bold tracking-tighter">Archive</h2>
          <p className="text-stone-400 text-sm font-medium">Your collection of visual resonances.</p>
        </div>
        <button 
          onClick={onGenerate}
          className="px-8 py-4 bg-stone-900 text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:scale-105 transition-all"
        >
          Begin New Creation
        </button>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group relative space-y-4">
              <div className="aspect-[9/16] rounded-3xl overflow-hidden shadow-lg bg-stone-50 relative">
                <img src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Work" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 text-center text-white">
                  <p className="text-sm italic font-serif mb-6 line-clamp-4">"{item.plan.quote}"</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => remove(item.id)} className="bg-red-500/20 hover:bg-red-500 text-white p-3 rounded-full transition-colors">✕</button>
                  </div>
                </div>
              </div>
              <div className="px-2">
                <p className="text-[9px] uppercase tracking-[0.2em] font-black opacity-30">{new Date(item.timestamp).toLocaleDateString()}</p>
                <p className="text-xs font-serif italic truncate opacity-50">{item.plan.quote}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center space-y-6">
          <p className="text-3xl font-serif italic text-stone-300">The archive is empty.</p>
          <button onClick={onGenerate} className="text-black font-bold uppercase tracking-widest text-[10px] underline underline-offset-8">Start your journey</button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
