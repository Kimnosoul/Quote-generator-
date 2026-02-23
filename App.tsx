
import React, { useState } from 'react';
import Landing from './components/Landing';
import Atelier from './components/Atelier';
import Gallery from './components/Gallery';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'atelier' | 'gallery'>('landing');

  return (
    <div className="min-h-screen bg-[#080808] text-stone-200 selection:bg-white selection:text-black overflow-x-hidden">
      <header className="fixed top-0 left-0 w-full z-50 px-8 py-8 flex justify-between items-center text-white">
        <button onClick={() => setView('landing')} className="font-serif text-2xl font-bold tracking-tighter opacity-80 hover:opacity-100 transition-opacity">SENTIENCE</button>
        <nav className="flex gap-8 text-[9px] uppercase tracking-[0.4em] font-bold">
          <button onClick={() => setView('atelier')} className={view === 'atelier' ? 'opacity-100' : 'opacity-40 hover:opacity-100 transition-opacity'}>Atelier</button>
          <button onClick={() => setView('gallery')} className={view === 'gallery' ? 'opacity-100' : 'opacity-40 hover:opacity-100 transition-opacity'}>Archive</button>
        </nav>
      </header>

      <main>
        {view === 'landing' && <Landing onStart={() => setView('atelier')} />}
        {view === 'atelier' && <Atelier onDone={() => setView('gallery')} />}
        {view === 'gallery' && <Gallery onGenerate={() => setView('atelier')} />}
      </main>

      <footer className="py-20 text-center opacity-10 text-[8px] uppercase tracking-[0.5em] font-bold">
        Pure Visual Intelligence • Minimalist Narrative
      </footer>
    </div>
  );
};

export default App;
