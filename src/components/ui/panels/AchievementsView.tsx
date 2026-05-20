import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Shield, Zap, Target, Flame, Heart, Crown } from 'lucide-react';

interface AchievementsViewProps {
  t: any;
  gameState: any;
  onBack: () => void;
  ACHIEVEMENTS_LIST: any[];
  MenuButton: any;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({
  t,
  gameState,
  onBack,
  ACHIEVEMENTS_LIST,
  MenuButton
}) => {
  const getIcon = (id: string, iconStr: string) => {
    switch (iconStr) {
      case "🏆": return <Trophy className="w-8 h-8 text-yellow-400" />;
      case "⭐": return <Star className="w-8 h-8 text-yellow-400" />;
      case "🛡️": return <Shield className="w-8 h-8 text-blue-400" />;
      case "⚡": return <Zap className="w-8 h-8 text-yellow-400" />;
      case "🎯": return <Target className="w-8 h-8 text-red-500" />;
      case "🔥": return <Flame className="w-8 h-8 text-orange-500" />;
      case "❤️": return <Heart className="w-8 h-8 text-red-400" />;
      case "👑": return <Crown className="w-8 h-8 text-yellow-500" />;
      default: return <span className="text-3xl">{iconStr}</span>;
    }
  };

  const unlockedCount = (gameState.achievements || []).length;
  const totalCount = ACHIEVEMENTS_LIST.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/95 z-30">
      <div className="w-full max-w-4xl flex flex-col h-full bg-neutral-900/40 p-8 rounded-[40px] border border-neutral-800 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-5xl font-arcade text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-2 tracking-widest uppercase">
              {t.achievementsTitle || "ERFOLGE"}
            </h1>
            <p className="text-[10px] text-neutral-500 font-mono tracking-[0.4em] uppercase">TROPHY ROOM V1.0</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-black font-arcade text-yellow-500">{unlockedCount}</span>
              <span className="text-xl font-bold text-neutral-700 font-arcade">/</span>
              <span className="text-xl font-bold text-neutral-600 font-arcade">{totalCount}</span>
            </div>
            <div className="w-48 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700 shadow-inner">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progressPercent}%` }}
                 className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
               />
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-4 pb-4">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const unlocked = (gameState.achievements || []).includes(ach.id);
            const localized = t.achievements_data?.[ach.id];
            
            return (
              <motion.div
                key={ach.id}
                whileHover={unlocked ? { scale: 1.02, x: 5 } : {}}
                className={`p-5 rounded-3xl border-2 transition-all flex items-center gap-6 ${
                  unlocked 
                    ? "bg-neutral-800/40 border-yellow-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.3)]" 
                    : "bg-black/40 border-neutral-800 opacity-40 grayscale"
                }`}
              >
                <div className={`shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl border ${
                  unlocked ? "bg-gradient-to-br from-neutral-700 to-neutral-900 border-yellow-500/50" : "bg-neutral-900 border-neutral-800"
                }`}>
                  {getIcon(ach.id, ach.icon)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-black font-arcade text-sm mb-1 tracking-tight truncate ${unlocked ? 'text-white' : 'text-neutral-500'}`}>
                    {localized?.title || ach.title}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                    {localized?.desc || ach.desc}
                  </span>
                  {unlocked && (
                     <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                        <span className="text-[8px] font-black text-green-500/80 uppercase tracking-widest">Unlocked</span>
                     </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center pt-6 border-t border-neutral-800">
           <div className="w-80">
              <MenuButton
                index={0}
                label={t.back || "ZURÜCK"}
                onClick={onBack}
                isSelected={true}
              />
           </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsView;
