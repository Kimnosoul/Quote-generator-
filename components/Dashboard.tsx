
import React, { useState, useEffect } from 'react';
import { UserProfile, UserPreferences, AppStyle } from '../types';
import { preferenceService } from '../services/preferenceService';

interface DashboardProps {
  user: UserProfile;
  onGenerate: (remixData?: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onGenerate }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(preferenceService.getInitialPrefs());
  const [gallery, setGallery] = useState<any[]>([]);

  useEffect(() => {
    const savedGallery = localStorage.getItem('sentience_gallery');
    if (savedGallery) {
      setGallery(JSON.parse(savedGallery));
    }
  }, []);

  const favoriteStyle = preferenceService.getTopAttribute(prefs.styleHistory, [AppStyle.PLAINT]);
  const favoriteTheme = preferenceService.getTopAttribute(prefs.themes, ['peaceful']);

  const handleDelete = (id: number) => {
    const updated = gallery.filter(item => item.timestamp !== id);
    setGallery(updated);
    localStorage.setItem('sentience_gallery', JSON.stringify(updated));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-reveal">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold mb-2 tracking-tight">Personal Atelier</h2>
          <p className="text-stone-500 font-medium">Curating your emotional journey through visuals.</p>
        </div>
        <button 
          onClick={() => onGenerate()}
          className="px-10 py-4 bg-stone-900 text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
        >
          <span>Create New Impact</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">1 Credit</span>
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <h3 className="font-serif text-2xl font-bold">Your Visual Legacy</h3>
          {gallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {gallery.map((item, idx) => (
                <div key={item.timestamp} className="group glass-card rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl">
                  <div className="aspect-square relative">
                    <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Creation" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-6 text-center">
                      <p className="text-white text-sm font-medium mb-4 line-clamp-3 italic">"{item.quote}"</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onGenerate(item)}
                          className="bg-white text-stone-900 px-4 py-2 rounded-full text-xs font-bold hover:bg-stone-100 transition-colors"
                        >
                          Remix
                        </button>
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = item.url;
                            link.download = `impact-${item.timestamp}.png`;
                            link.click();
                          }}
                          className="bg-stone-900/50 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-xs font-bold hover:bg-stone-800 transition-colors"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => handleDelete(item.timestamp)}
                          className="bg-red-500/50 backdrop-blur-md text-white border border-white/20 px-3 py-2 rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center border-2 border-dashed border-stone-200 rounded-[3rem] space-y-6">
              <div className="text-4xl opacity-50">🕯️</div>
              <div className="space-y-2">
                <p className="text-stone-400 font-serif text-xl">The gallery is currently silent.</p>
                <p className="text-stone-500 text-sm max-w-xs mx-auto">Start generating to see your emotional preferences take visual form.</p>
              </div>
              <button onClick={() => onGenerate()} className="text-stone-900 font-bold underline underline-offset-4 hover:text-stone-600">Begin Your First Path</button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] p-8 space-y-8">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
              <span className="text-lg">👁️</span> Perception
            </h3>
            <div className="space-y-6">
              <ProfileItem label="Available Credits" value={`${user.credits} Generations`} />
              <ProfileItem label="Dominant Style" value={favoriteStyle} />
              <ProfileItem label="Core Resonance" value={favoriteTheme} />
              <ProfileItem label="Self-Discovery" value={`${Math.round(prefs.confidenceScore * 100)}%`} />
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-8 space-y-4 bg-stone-50/50">
            <h3 className="text-xs uppercase tracking-widest font-black text-stone-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              API Engine Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-stone-500">Tier</span>
                <span className="font-bold">Gemini Free</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-500">Daily Quota</span>
                <span className="font-bold">~1,500 Images</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-500">Rate Limit</span>
                <span className="font-bold">15 RPM</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 italic pt-2 border-t border-stone-100">
              The neural engine is healthy. You have significant bandwidth remaining for this session.
            </p>
          </div>

          <div className="bg-stone-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-white/5 text-8xl group-hover:rotate-12 transition-transform duration-1000">✦</div>
            <h3 className="text-xl font-serif font-bold mb-3">Ascend to Prime</h3>
            <p className="text-stone-400 text-sm mb-8 leading-relaxed">
              Infinite credits, 4K exports, and the ability to upload your own reference memories.
            </p>
            <button className="w-full py-4 bg-white text-stone-900 rounded-full font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg">
              Unlock Everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileItem: React.FC<{label: string, value: string}> = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">{label}</span>
    <span className="text-lg font-serif font-medium capitalize text-stone-900">{value}</span>
  </div>
);

export default Dashboard;
