import React from 'react';
import { motion } from 'motion/react';
import { 
  TRAIL_PRESETS, 
  EYE_OPTIONS, 
  ACC_OPTIONS,
  hexToRgb
} from '../../../types';

interface ShopViewProps {
  t: any;
  customization: any;
  setCustomization: React.Dispatch<React.SetStateAction<any>>;
  shopTab: 'items' | 'trails' | 'sounds';
  setShopTab: (tab: 'items' | 'trails' | 'sounds') => void;
  coins: number;
  isUnlocked: (type: string, id: string) => boolean;
  onPurchase: (type: string, id: string, price: number) => void;
  CharacterPreview: any;
}

const ShopView: React.FC<ShopViewProps> = ({
  t,
  customization,
  setCustomization,
  shopTab,
  setShopTab,
  coins,
  isUnlocked,
  onPurchase,
  CharacterPreview
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/95 z-[60] overflow-y-auto">
      <div className="w-full max-w-4xl flex flex-col h-full">
        <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
          <h2 className="text-4xl text-yellow-400 font-arcade tracking-widest">{t.shopTitle || "PROTZ-PALAST"}</h2>
          <div className="flex items-center gap-3 bg-neutral-900 px-6 py-3 rounded-2xl border border-neutral-800 shadow-xl">
            <span className="text-xl">💰</span>
            <span className="text-2xl font-bold font-mono text-yellow-400">{coins}</span>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          {['items', 'trails', 'sounds'].map((tab) => (
            <button
              key={tab}
              onClick={() => setShopTab(tab as any)}
              className={`px-8 py-3 rounded-xl font-arcade text-xs transition-all border-b-4 tracking-widest ${
                shopTab === tab 
                  ? "bg-yellow-500 text-black border-yellow-700 scale-105 shadow-[0_0_20px_rgba(234,179,8,0.4)]" 
                  : "bg-neutral-800 text-neutral-400 border-neutral-950 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden min-h-0">
          <div className="bg-neutral-900/50 p-6 rounded-3xl border border-neutral-800 flex flex-col items-center justify-center gap-6 shadow-inner">
            <div className="w-64 h-64 bg-black/40 rounded-full border-4 border-neutral-800 flex items-center justify-center shadow-2xl relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent animate-pulse" />
              <CharacterPreview customization={customization} scale={8} />
            </div>
            
            <div className="grid grid-cols-3 gap-3 w-full">
               <div className="bg-black/40 p-3 rounded-xl border border-neutral-800 text-center">
                  <div className="text-[8px] text-neutral-500 mb-1 uppercase font-bold tracking-widest">Color</div>
                  <div className="w-full h-1 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '100%' }} />
                  </div>
               </div>
               <div className="bg-black/40 p-3 rounded-xl border border-neutral-800 text-center">
                  <div className="text-[8px] text-neutral-500 mb-1 uppercase font-bold tracking-widest">Style</div>
                  <div className="text-yellow-400 font-bold text-[10px] truncate">{customization.eyes.toUpperCase()}</div>
               </div>
               <div className="bg-black/40 p-3 rounded-xl border border-neutral-800 text-center">
                  <div className="text-[8px] text-neutral-500 mb-1 uppercase font-bold tracking-widest">Accessory</div>
                  <div className="text-yellow-400 font-bold text-[10px] truncate">{customization.accessory.toUpperCase()}</div>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
            {shopTab === 'items' && (
              <div className="grid grid-cols-2 gap-4">
                {[...EYE_OPTIONS, ...ACC_OPTIONS].filter(opt => opt !== 'normal' && opt !== 'none').map((id) => {
                  const type = id.startsWith('glass') || id.startsWith('angry') || id.startsWith('cool') || id.startsWith('blink') ? 'eyes' : 'accessory';
                  const unlocked = isUnlocked(type, id);
                  const price = id.length * 25 + (type === 'accessory' ? 150 : 50);
                  
                  return (
                    <button
                      key={id}
                      onClick={() => !unlocked && onPurchase(type, id, price)}
                      className={`group relative p-4 border-2 rounded-2xl transition-all flex flex-col items-center gap-2 overflow-hidden ${
                        unlocked 
                          ? "bg-neutral-800/20 border-green-500/30 cursor-default" 
                          : "bg-neutral-900 border-neutral-800 hover:border-yellow-500/50 hover:bg-neutral-800"
                      }`}
                    >
                      <div className="w-16 h-16 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <CharacterPreview 
                            customization={{
                              ...customization,
                              eyes: type === 'eyes' ? id : 'normal',
                              accessory: type === 'accessory' ? id : 'none'
                            }} 
                            scale={2} 
                          />
                      </div>
                      <div className="text-[10px] font-bold text-white uppercase tracking-tighter">
                        {id.replace('_', ' ')}
                      </div>
                      {!unlocked ? (
                        <div className="mt-1 flex items-center gap-1 bg-yellow-400/90 text-black px-3 py-1 rounded-full font-bold text-[10px] shadow-lg">
                          <span>💰</span> {price}
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold text-[10px] border border-green-500/30">
                          <span>✓</span> BEREITS BESITZ
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {shopTab === 'trails' && (
              <div className="grid grid-cols-2 gap-4">
                {TRAIL_PRESETS.filter(p => p.val !== '#ffffff').map((preset) => {
                  const unlocked = isUnlocked('trail', preset.val);
                  const price = 250;
                  
                  return (
                    <button
                      key={preset.val}
                      onClick={() => !unlocked && onPurchase('trail', preset.val, price)}
                      className={`group relative p-4 border-2 rounded-2xl transition-all flex flex-col items-center gap-2 ${
                        unlocked 
                          ? "bg-neutral-800/20 border-green-500/30 cursor-default" 
                          : "bg-neutral-900 border-neutral-800 hover:border-yellow-500/50 hover:bg-neutral-800"
                      }`}
                    >
                      <div 
                        className="w-full h-12 rounded-lg relative overflow-hidden shadow-xl"
                        style={{ background: preset.gradient }}
                      >
                         <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shine" />
                      </div>
                      <div className="text-[10px] font-bold text-white uppercase tracking-tighter">
                        {preset.name}
                      </div>
                      {!unlocked ? (
                        <div className="mt-1 flex items-center gap-1 bg-yellow-400/90 text-black px-3 py-1 rounded-full font-bold text-[10px] shadow-lg">
                          <span>💰</span> {price}
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold text-[10px] border border-green-500/30">
                          <span>✓</span> BEREITS BESITZ
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            {shopTab === 'sounds' && (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-3xl opacity-50">
                    <span className="text-4xl mb-4">🎵</span>
                    <p className="font-arcade text-xs tracking-widest uppercase">Kommende Sounds</p>
                </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
            <button
                onClick={() => setCustomization(p => ({ ...p, status: 'menu' }))}
                className="px-12 py-4 bg-neutral-800 text-white hover:bg-neutral-700 rounded-2xl font-arcade text-sm uppercase tracking-[0.2em] transition-all border-b-8 border-neutral-950 active:translate-y-2 active:border-b-0 shadow-2xl"
            >
                {t.back || "ZURÜCK"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShopView;
