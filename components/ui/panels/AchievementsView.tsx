
import React from 'react';
import { Achievement } from '../../../types';

interface AchievementsViewProps {
  t: any;
  gameState: any;
  ACHIEVEMENTS_LIST: Achievement[];
  onBack: () => void;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({
  t,
  gameState,
  ACHIEVEMENTS_LIST,
  onBack,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center bg-black/95 text-white z-30 pt-10 px-8 overflow-hidden">
      <div className="w-full max-w-6xl flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <h2 className="text-4xl text-purple-500 font-arcade tracking-widest">{t.achievements || "ACHIEVEMENTS"}</h2>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">{t.completed || "COMPLETED"}</span>
            <span className="text-3xl text-purple-400 font-arcade drop-shadow-[0_0_10px_#a855f7]">
              {gameState.unlockedAchievements.length} / {ACHIEVEMENTS_LIST.length}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACHIEVEMENTS_LIST.map((ach) => {
              const isUnlocked = gameState.unlockedAchievements.includes(ach.id);
              return (
                <div 
                  key={ach.id}
                  className={`p-6 border-2 flex flex-col gap-4 transition-all relative overflow-hidden group ${
                    isUnlocked 
                      ? "border-purple-500 bg-purple-900/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]" 
                      : "border-neutral-800 bg-neutral-900/50 grayscale opacity-60"
                  }`}
                >
                  {isUnlocked && (
                    <div className="absolute -top-10 -right-10 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/40 transition-all" />
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 shrink-0 flex items-center justify-center rounded-xl text-3xl shadow-lg border ${
                      isUnlocked ? "bg-purple-600 border-purple-400" : "bg-neutral-800 border-neutral-700"
                    }`}>
                      {ach.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-arcade text-lg leading-tight mb-1 ${isUnlocked ? 'text-white' : 'text-neutral-500'}`}>
                        {ach.title.toUpperCase()}
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>

                  {ach.reward && (
                    <div className={`mt-auto pt-4 border-t ${isUnlocked ? 'border-purple-500/30' : 'border-neutral-800'}`}>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{t.reward || "REWARD"}:</span>
                         <span className={`text-[10px] font-bold uppercase ${isUnlocked ? 'text-yellow-400' : 'text-neutral-600'}`}>
                           {ach.reward}
                         </span>
                      </div>
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="absolute top-2 right-2">
                       <span className="text-[10px] font-black text-neutral-700 uppercase tracking-tighter border border-neutral-800 px-1 rounded">
                         LOCKED
                       </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center py-6 shrink-0">
          <button 
            onClick={onBack}
            className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-arcade uppercase tracking-widest border border-neutral-700 transition-all hover:scale-105 active:scale-95"
          >
            {t.backToMenu || "BACK"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementsView;
