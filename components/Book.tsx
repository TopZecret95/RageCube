import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface BookItem {
  id: string;
  type: 'block' | 'powerup' | 'mechanic';
  renderClass?: string;
  renderContent?: string;
  renderStyle?: React.CSSProperties;
}

const BOOK_ITEMS: BookItem[] = [
  // BLOCKS
  {
    id: 'wall', type: 'block',
    renderStyle: { backgroundColor: '#404040' }
  },
  {
    id: 'hazard', type: 'block',
    renderClass: 'shadow-[0_0_10px_#ff0044]',
    renderStyle: { backgroundColor: '#ff0044' }
  },
  {
    id: 'goal', type: 'block',
    renderClass: 'shadow-[0_0_15px_#00ff88]',
    renderStyle: { backgroundColor: '#00ff88' }
  },
  {
    id: 'coin', type: 'block',
    renderClass: 'rounded-full',
    renderStyle: { backgroundColor: '#fbbf24' }
  },
  {
    id: 'bounce', type: 'block',
    renderStyle: { backgroundColor: '#00ccff' }, renderContent: '⌇'
  },
  {
    id: 'ice', type: 'block',
    renderStyle: { backgroundColor: '#a5f3fc' }
  },
  {
    id: 'slime', type: 'block',
    renderStyle: { backgroundColor: '#84cc16' }
  },
  {
    id: 'trampoline', type: 'block',
    renderStyle: { backgroundColor: '#ec4899' }, renderContent: '↑'
  },
  {
    id: 'teleport', type: 'block',
    renderClass: 'animate-pulse',
    renderStyle: { backgroundColor: '#8b5cf6' }
  },
  {
    id: 'moving_platform', type: 'block',
    renderStyle: { backgroundColor: '#aaa' }, renderContent: '↔'
  },
  {
    id: 'fragile', type: 'block',
    renderClass: 'border-2 border-dashed border-neutral-400',
    renderStyle: { backgroundColor: '#ffffff' }
  },
  {
    id: 'checkpoint', type: 'block',
    renderStyle: { backgroundColor: '#2dd4bf' }
  },
  {
    id: 'invisible_hazard', type: 'block',
    renderClass: 'border border-red-500 border-dashed bg-transparent'
  },

  // POWERUPS
  {
    id: 'powerup_double_jump', type: 'powerup',
    renderClass: 'rounded-full animate-bounce shadow-[0_0_10px_#9c27b0]', 
    renderStyle: { backgroundColor: '#9c27b0' }, renderContent: '2x'
  },
  {
    id: 'powerup_triple_jump', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#ff00ff]', 
    renderStyle: { backgroundColor: '#ff00ff' }, renderContent: '3x'
  },
  {
    id: 'powerup_hook', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#607d8b]', 
    renderStyle: { backgroundColor: '#607d8b' }, renderContent: '⚓'
  },
  {
    id: 'powerup_dash', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#f59e0b]', 
    renderStyle: { backgroundColor: '#f59e0b' }, renderContent: '»'
  },
  {
    id: 'powerup_xray', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#facc15]', 
    renderStyle: { backgroundColor: '#facc15' }, renderContent: '👁'
  },
  {
    id: 'powerup_shield', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#2dd4bf]', 
    renderStyle: { backgroundColor: '#2dd4bf' }, renderContent: '⛨'
  },
  {
    id: 'powerup_fireball', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_10px_#ff4500]', 
    renderStyle: { backgroundColor: '#ff4500' }, renderContent: '🔥'
  },
  {
    id: 'powerup_shrink', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#10b981]', 
    renderStyle: { backgroundColor: '#10b981' }, renderContent: '↓'
  },
  {
    id: 'powerup_grow', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#8b5cf6]', 
    renderStyle: { backgroundColor: '#8b5cf6' }, renderContent: '↑'
  },
  {
    id: 'powerup_slow_mo', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#3b82f6]',
    renderStyle: { backgroundColor: '#3b82f6' }, renderContent: '⏱'
  },
  {
    id: 'powerup_build', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#00bcd4]',
    renderStyle: { backgroundColor: '#00bcd4' }, renderContent: '🧱'
  },

  // MECHANICS & TROLL
  {
    id: 'fake', type: 'mechanic',
    renderClass: 'opacity-80',
    renderStyle: { backgroundColor: '#404040' }
  },
  {
    id: 'fake_goal', type: 'mechanic',
    renderClass: 'shadow-[0_0_5px_#00ff88]',
    renderStyle: { backgroundColor: '#00ff88' }
  },
  {
    id: 'troll_wall', type: 'mechanic',
    renderStyle: { backgroundColor: '#0a0a0a' }
  },
  {
    id: 'gravity_reverse', type: 'mechanic',
    renderStyle: { backgroundColor: '#8b5cf6' }, renderContent: '⇅'
  },
  {
    id: 'gravity_zero', type: 'mechanic',
    renderClass: 'border-2 border-dashed border-indigo-400 bg-transparent', renderContent: '☄'
  }
];

interface BookProps {
  onClose: () => void;
  lang: Language;
}

const Book: React.FC<BookProps> = ({ onClose, lang }) => {
  const [filter, setFilter] = useState<'all' | 'block' | 'powerup' | 'mechanic'>('all');
  
  const t = TRANSLATIONS[lang] || TRANSLATIONS[Language.EN];
  const filteredItems = BOOK_ITEMS.filter(item => filter === 'all' || item.type === filter);

  return (
    <div className="absolute inset-0 bg-neutral-950 flex flex-col z-[100] p-6 lg:p-10 font-sans animate-fade-in text-white overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b-2 border-red-900 pb-4 shrink-0">
        <div>
          <h2 className="text-4xl lg:text-5xl font-arcade text-rage-red tracking-tighter shadow-red-900 drop-shadow-md">
            {t.wikiTitle}
          </h2>
          <p className="text-neutral-400 text-xs mt-2 font-bold uppercase tracking-[0.2em]">
            {t.wikiSubtitle}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center bg-neutral-900 border-2 border-neutral-700 text-white hover:text-rage-red hover:border-rage-red transition-all rounded-lg text-2xl"
        >
          ✕
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-4 mb-6 shrink-0 border-b border-neutral-800 pb-2">
        {(['all', 'block', 'powerup', 'mechanic'] as const).map(tab => {
          const tabLabel = tab === 'all' ? t.wikiTabAll : 
                           tab === 'block' ? t.wikiTabBlocks : 
                           tab === 'powerup' ? t.wikiTabPowerups : 
                           t.wikiTabMechanics;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 font-bold text-xs tracking-widest uppercase transition-all rounded-t-lg ${
                filter === tab 
                  ? 'bg-red-900/30 text-white border-b-4 border-rage-red shadow-[inset_0_-10px_20px_rgba(255,0,68,0.2)]' 
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>

      {/* CONTENT GRID */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const itemTranslation = (t.wikiItems as any)[item.id] || { name: item.id, desc: '' };
            const typeLabel = item.type === 'block' ? t.wikiTypeBlock : 
                             item.type === 'powerup' ? t.wikiTypePowerup : 
                             t.wikiTypeMechanic;
            return (
              <div 
                key={item.id} 
                className="group bg-neutral-900 border border-neutral-800 hover:border-red-900 hover:bg-neutral-800/80 transition-all duration-300 p-5 rounded-xl flex flex-col gap-4 relative overflow-hidden"
              >
                {/* Decorative background glow on hover */}
                <div className="absolute -inset-10 bg-gradient-to-br from-red-900/0 via-red-900/5 to-red-900/0 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity pointer-events-none"></div>

                {/* Icon / Render */}
                <div className="w-16 h-16 shrink-0 bg-black border border-neutral-800 rounded-lg flex items-center justify-center relative z-10 shadow-inner">
                  <div 
                    className={`w-8 h-8 flex items-center justify-center font-bold text-lg text-white ${item.renderClass || ''}`}
                    style={item.renderStyle}
                  >
                    {item.renderContent}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col relative z-10">
                  <span className="text-[9px] uppercase tracking-widest text-red-500 font-black mb-1">
                    {typeLabel}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {itemTranslation.name}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {itemTranslation.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Book;
