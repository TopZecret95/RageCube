import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Monitor, Keyboard, Gamepad2, Languages, Share2, Info } from 'lucide-react';

interface SettingsMenuProps {
  t: any;
  settings: any;
  setSettings: React.Dispatch<React.SetStateAction<any>>;
  lang: string;
  setGameState: React.Dispatch<React.SetStateAction<any>>;
  setMenuSelection: (sel: number) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  t,
  settings,
  setSettings,
  lang,
  setGameState,
  setMenuSelection
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-neutral-950/98 z-[200] backdrop-blur-md overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rage-red/10 rounded-2xl border border-rage-red/20 shadow-[0_0_15px_rgba(255,0,0,0.1)]">
              <Monitor className="w-8 h-8 text-rage-red" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-arcade tracking-widest text-white uppercase">{t.settings || "EINSTELLUNGEN"}</h1>
              <p className="text-[10px] text-neutral-500 font-mono tracking-[0.3em] uppercase">{t.configInfo || "CONFIGURATION INTERFACE V7.0"}</p>
            </div>
          </div>
          <button 
            onClick={() => setGameState(p => ({ ...p, status: p.previousStatus || 'menu' }))}
            className="p-3 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
          >
            <Share2 className="w-6 h-6 rotate-45" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General Section */}
          <div className="space-y-4">
             <div className="bg-neutral-900/50 p-6 rounded-3xl border border-neutral-800 hover:border-neutral-700 transition-colors group">
                <div className="flex items-center gap-3 mb-6">
                   <Monitor className="w-5 h-5 text-blue-400" />
                   <h3 className="text-xs font-arcade font-black text-neutral-300 tracking-widest uppercase">{t.display || "ANZEIGE"}</h3>
                </div>
                
                <div className="space-y-6">
                   <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center px-1">
                         <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">FPS Limit: {settings.fpsLimit}</span>
                         <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{settings.fpsLimit} FPS</span>
                      </div>
                      <input 
                        type="range" min="30" max="240" step="30"
                        value={settings.fpsLimit}
                        onChange={(e) => setSettings(p => ({ ...p, fpsLimit: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                   </div>

                   <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-neutral-800/50">
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-white uppercase tracking-tight">{t.showFPS || "FPS ANZEIGEN"}</span>
                         <span className="text-[9px] text-neutral-500 font-medium">Performance Monitoring</span>
                      </div>
                      <button 
                         onClick={() => setSettings(p => ({ ...p, showFPS: !p.showFPS }))}
                         className={`w-12 h-6 flex items-center rounded-full transition-all px-1 ${settings.showFPS ? "bg-blue-600" : "bg-neutral-700"}`}
                      >
                         <motion.div 
                            animate={{ x: settings.showFPS ? 24 : 0 }}
                            className="w-4 h-4 bg-white rounded-full shadow-lg"
                         />
                      </button>
                   </div>
                </div>
             </div>

             <div className="bg-neutral-900/50 p-6 rounded-3xl border border-neutral-800">
                <div className="flex items-center gap-3 mb-6">
                   <Languages className="w-5 h-5 text-orange-400" />
                   <h3 className="text-xs font-arcade font-black text-neutral-300 tracking-widest uppercase">{t.language || "SPRACHE"}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   {['DE', 'EN'].map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                           // Set the actual language using the passed setter if we had one
                           // For now we assume the global window or similar or rely on state
                           // Since lang is passed, we might need setLang but let's assume it's handled via settings too
                           setSettings(p => ({ ...p, language: l.toLowerCase() }));
                        }}
                        className={`py-3 px-4 rounded-xl font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                           lang.toUpperCase() === l 
                            ? "bg-orange-500/10 border-orange-500 text-orange-500" 
                            : "bg-neutral-800/50 border-neutral-800 text-neutral-500 hover:border-neutral-700"
                        }`}
                      >
                        {l === 'DE' ? '🇩🇪 DEUTSCH' : '🇺🇸 ENGLISH'}
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Audio Section */}
          <div className="space-y-4">
             <div className="bg-neutral-900/50 p-6 rounded-3xl border border-neutral-800 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-8">
                   <Volume2 className="w-5 h-5 text-rage-red" />
                   <h3 className="text-xs font-arcade font-black text-neutral-300 tracking-widest uppercase">{t.audio || "AUDIO"}</h3>
                </div>

                <div className="space-y-10 flex-1">
                   {/* Master Volume */}
                   <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-2">
                           {settings.volume === 0 ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-rage-red" />}
                           <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t.volume || "LAUTSTÄRKE"}</span>
                         </div>
                         <span className="text-xs font-mono font-bold text-white bg-rage-red/20 px-3 py-1 rounded-full border border-rage-red/30">{Math.round(settings.volume * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={settings.volume}
                        onChange={(e) => setSettings(p => ({ ...p, volume: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-rage-red"
                      />
                   </div>

                   {/* Music Volume */}
                   <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-2">
                           <Gamepad2 className="w-4 h-4 text-orange-400" />
                           <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t.musicVolume || "MUSIK"}</span>
                         </div>
                         <span className="text-xs font-mono font-bold text-white bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">{Math.round((settings.musicVolume || 0.5) * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={settings.musicVolume || 0.5}
                        onChange={(e) => setSettings(p => ({ ...p, musicVolume: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-orange-500"
                      />
                   </div>

                   {/* SFX Volume */}
                   <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-2">
                           <Monitor className="w-4 h-4 text-blue-400" />
                           <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t.sfxVolume || "EFFEKTE"}</span>
                         </div>
                         <span className="text-xs font-mono font-bold text-white bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">{Math.round((settings.sfxVolume || 0.7) * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={settings.sfxVolume || 0.7}
                        onChange={(e) => setSettings(p => ({ ...p, sfxVolume: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                   </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => setGameState(p => ({ ...p, status: "keybindings" }))}
                     className="flex items-center justify-center gap-2 py-4 bg-neutral-800 text-white rounded-2xl hover:bg-neutral-700 transition-all border-b-4 border-black active:translate-y-1 active:border-b-0"
                   >
                     <Keyboard className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{t.keybindings || "STEUERUNG"}</span>
                   </button>
                   <button 
                     onClick={() => setSettings(p => ({ ...p, volume: p.volume > 0 ? 0 : 0.5 }))}
                     className={`flex items-center justify-center gap-2 py-4 rounded-2xl transition-all border-b-4 active:translate-y-1 active:border-b-0 ${settings.volume === 0 ? "bg-red-600 border-red-900" : "bg-neutral-800 border-black"}`}
                   >
                     {settings.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                     <span className="text-[10px] font-black uppercase tracking-widest">{settings.volume === 0 ? "STUMM" : "AKTIV"}</span>
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 mt-2">
           <button
             onClick={() => setGameState(p => ({ ...p, status: "menu" }))}
             className="flex-1 py-5 bg-neutral-800 text-white rounded-3xl font-arcade uppercase tracking-[0.2em] transition-all border-b-8 border-black active:translate-y-2 active:border-b-0 hover:bg-neutral-700 shadow-2xl"
           >
             {t.back || "ZURÜCK"}
           </button>
           <button
             onClick={() => {
                if(confirm("RESTORE DEFAULT SETTINGS?")) {
                   setSettings({ volume: 0.5, fpsLimit: 60, showFPS: false, language: 'de' });
                }
             }}
             className="px-8 py-5 bg-red-900/30 text-red-500 rounded-3xl font-arcade uppercase tracking-[0.2em] transition-all border-b-8 border-red-950 active:translate-y-2 active:border-b-0 border-red-500/20"
           >
             RESET
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
