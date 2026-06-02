
import React from 'react';
import { PlayerCustomization, EntityType } from '../../../types';
import CharacterPreview from '../../CharacterPreview';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: string;
}

interface Achievement {
    id: string;
    rewardType?: string;
    rewardId?: string;
}

interface ShopViewProps {
  t: any;
  customization: PlayerCustomization;
  setCustomization: React.Dispatch<React.SetStateAction<PlayerCustomization>>;
  shopTab: string;
  setShopTab: (tab: string) => void;
  hoveredShopItem: ShopItem | null;
  setHoveredShopItem: (item: ShopItem | null) => void;
  gameState: any;
  SHOP_ITEMS: ShopItem[];
  ACHIEVEMENTS_LIST: Achievement[];
  onBack: () => void;
}

const ShopView: React.FC<ShopViewProps> = ({
  t,
  customization,
  setCustomization,
  shopTab,
  setShopTab,
  hoveredShopItem,
  setHoveredShopItem,
  gameState,
  SHOP_ITEMS,
  ACHIEVEMENTS_LIST,
  onBack,
}) => {
  const isItemUnlocked = (item: ShopItem) => {
    const ach = ACHIEVEMENTS_LIST.find((a) => a.rewardType === item.type.replace('Type', '') && a.rewardId === item.id);
    if (ach) return gameState.unlockedAchievements.includes(ach.id);
    
    if (item.price === 0) return true;
    if (item.type === "deathAnim") return (customization.unlockedDeathAnims || []).includes(item.id);
    if (item.type === "trailType") return (customization.unlockedTrails || []).includes(item.id);
    if (item.type === "eyes") return (customization.unlockedEyes || []).includes(item.id);
    if (item.type === "accessory") return (customization.unlockedAccessories || []).includes(item.id);
    if (item.type === "deathSound") return (customization.unlockedDeathSounds || []).includes(item.id);
    return false;
  };

  const isEquipped = (item: ShopItem) => {
    if (item.type === "deathAnim") return customization.deathAnim === item.id;
    if (item.type === "trailType") return (customization.trailType || "normal") === item.id;
    if (item.type === "eyes") return customization.eyes === item.id;
    if (item.type === "accessory") return customization.accessory === item.id;
    if (item.type === "deathSound") return customization.deathSound === item.id || (!customization.deathSound && item.id === "default");
    return false;
  };

  const handleAction = (item: ShopItem) => {
    const unlocked = isItemUnlocked(item);
    const canAfford = (customization.coins || 0) >= item.price;
    const ach = ACHIEVEMENTS_LIST.find((a) => a.rewardType === item.type.replace('Type', '') && a.rewardId === item.id);
    const isAchievementReward = !!ach;

    if (unlocked) {
      setCustomization(p => ({ ...p, [item.type]: item.id }));
    } else if (canAfford && !isAchievementReward) {
      setCustomization(p => {
        const newState = { ...p, coins: (p.coins || 0) - item.price, [item.type]: item.id };
        if (item.type === "deathAnim") newState.unlockedDeathAnims = [...(p.unlockedDeathAnims || []), item.id];
        if (item.type === "trailType") newState.unlockedTrails = [...(p.unlockedTrails || []), item.id];
        if (item.type === "eyes") newState.unlockedEyes = [...(p.unlockedEyes || []), item.id];
        if (item.type === "accessory") newState.unlockedAccessories = [...(p.unlockedAccessories || []), item.id];
        if (item.type === "deathSound") newState.unlockedDeathSounds = [...(p.unlockedDeathSounds || []), item.id];
        return newState;
      });
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center bg-black/95 text-white z-30 pt-10">
      <div className="flex items-center justify-between w-full max-w-6xl px-8 mb-6">
        <h2 className="text-4xl text-yellow-500 font-arcade tracking-widest">{t.shop || "SHOP"}</h2>
        <div className="flex gap-4">
          {["effects", "cosmetics", "sounds"].map(tab => (
            <button 
              key={tab}
              onClick={() => setShopTab(tab)} 
              className={`px-4 py-2 font-bold tracking-widest uppercase transition-all border-b-2 ${shopTab === tab ? "border-yellow-500 text-yellow-500" : "border-transparent text-neutral-500 hover:text-white"}`}
            >
              {tab === "sounds" ? (t.soundsTab || "SOUNDS") : tab.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">{t.totalCoins || "TOTAL COINS"}</span>
          <span className="text-3xl text-yellow-400 font-arcade drop-shadow-[0_0_10px_#eab308]">{customization.coins || 0}</span>
        </div>
      </div>

      <div className="flex w-full max-w-6xl px-8 gap-8 h-[60vh]">
        {/* Big Character Preview */}
        <div className="w-1/3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-inner p-4 relative">
          <div className="absolute top-4 left-4 text-xs font-black text-neutral-500 tracking-widest uppercase">
            PREVIEW
          </div>
          <CharacterPreview 
            customization={hoveredShopItem ? { ...customization, [hoveredShopItem.type]: hoveredShopItem.id } : customization} 
            scale={6} 
          />
          {hoveredShopItem && (
            <div className="absolute bottom-4 text-center w-full flex justify-center">
              <span className="bg-black/80 px-3 py-1 rounded text-yellow-500 font-bold text-sm tracking-widest uppercase shadow-lg">
                {hoveredShopItem.name.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        {/* Shop Lists */}
        <div className="flex-1 flex gap-8 h-full overflow-hidden">
          {shopTab === "effects" && (
            <>
              <ShopList 
                title={t.deathAnims || "DEATH ANIMATIONS"} 
                items={SHOP_ITEMS.filter(i => i.type === "deathAnim")}
                isUnlocked={isItemUnlocked}
                isEquipped={isEquipped}
                onAction={handleAction}
                setHovered={setHoveredShopItem}
                t={t}
                customization={customization}
                gameState={gameState}
                ACHIEVEMENTS_LIST={ACHIEVEMENTS_LIST}
              />
              <ShopList 
                title={t.trails || "TRAILS"} 
                items={SHOP_ITEMS.filter(i => i.type === "trailType")}
                isUnlocked={isItemUnlocked}
                isEquipped={isEquipped}
                onAction={handleAction}
                setHovered={setHoveredShopItem}
                t={t}
                customization={customization}
                gameState={gameState}
                ACHIEVEMENTS_LIST={ACHIEVEMENTS_LIST}
              />
            </>
          )}
          {shopTab === "cosmetics" && (
            <>
              <ShopList 
                title={t.eyesTab || "EYES"} 
                items={SHOP_ITEMS.filter(i => i.type === "eyes")}
                isUnlocked={isItemUnlocked}
                isEquipped={isEquipped}
                onAction={handleAction}
                setHovered={setHoveredShopItem}
                t={t}
                customization={customization}
                gameState={gameState}
                ACHIEVEMENTS_LIST={ACHIEVEMENTS_LIST}
              />
              <ShopList 
                title={t.hatsTab || "HATS & ACCESSORIES"} 
                items={SHOP_ITEMS.filter(i => i.type === "accessory")}
                isUnlocked={isItemUnlocked}
                isEquipped={isEquipped}
                onAction={handleAction}
                setHovered={setHoveredShopItem}
                t={t}
                customization={customization}
                gameState={gameState}
                ACHIEVEMENTS_LIST={ACHIEVEMENTS_LIST}
              />
            </>
          )}
          {shopTab === "sounds" && (
              <ShopList 
                title={t.deathSounds || "DEATH SOUNDS"} 
                items={SHOP_ITEMS.filter(i => i.type === "deathSound")}
                isUnlocked={isItemUnlocked}
                isEquipped={isEquipped}
                onAction={handleAction}
                setHovered={setHoveredShopItem}
                t={t}
                customization={customization}
                gameState={gameState}
                ACHIEVEMENTS_LIST={ACHIEVEMENTS_LIST}
                fullWidth
              />
          )}
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-arcade uppercase tracking-widest border border-neutral-700 transition-all hover:scale-105 active:scale-95"
        >
          {t.backToMenu || "BACK"}
        </button>
      </div>
    </div>
  );
};

interface ShopListProps {
  title: string;
  items: ShopItem[];
  isUnlocked: (i: ShopItem) => boolean;
  isEquipped: (i: ShopItem) => boolean;
  onAction: (i: ShopItem) => void;
  setHovered: (i: ShopItem | null) => void;
  t: any;
  customization: PlayerCustomization;
  gameState: any;
  ACHIEVEMENTS_LIST: Achievement[];
  fullWidth?: boolean;
}

const ShopList: React.FC<ShopListProps> = ({ title, items, isUnlocked, isEquipped, onAction, setHovered, t, customization, gameState, ACHIEVEMENTS_LIST, fullWidth }) => {
  return (
    <div className={`${fullWidth ? 'w-full' : 'flex-1'} overflow-y-auto custom-scrollbar flex flex-col gap-4 border-r border-neutral-800 pr-4 last:border-r-0 last:pr-0 last:pl-4`}>
      <h3 className="text-xl text-neutral-400 font-black tracking-widest border-b border-neutral-800 pb-2 uppercase">{title}</h3>
      {items.map(item => {
        const unlocked = isUnlocked(item);
        const equipped = isEquipped(item);
        const ach = ACHIEVEMENTS_LIST.find((a) => a.rewardType === item.type.replace('Type', '') && a.rewardId === item.id);
        const isAchievementReward = !!ach;
        const canAfford = (customization.coins || 0) >= item.price;

        return (
          <div 
            key={`${item.type}_${item.id}`}
            onMouseEnter={() => setHovered(item)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onAction(item)}
            className={`p-4 border-2 flex flex-col gap-2 transition-all cursor-pointer ${equipped ? "border-yellow-500 bg-yellow-900/20" : unlocked ? "border-green-600 bg-neutral-900 hover:border-green-400" : (canAfford && !isAchievementReward) ? "border-neutral-700 bg-black hover:border-yellow-600/50" : "border-neutral-800 bg-black opacity-80"}`}
          >
            <div className="flex justify-between items-center">
              <div className={`font-arcade text-lg ${unlocked ? 'text-white' : 'text-neutral-500'}`}>
                {((item.type === 'eyes' ? t.eye_names?.[item.id] : item.type === 'accessory' ? t.acc_names?.[item.id] : item.type === 'deathSound' ? t.sound_names?.[item.id] : t.shopItemNames?.[item.id]) || item.name).toUpperCase()}
              </div>
            </div>
            {!unlocked && (
              isAchievementReward ? 
              <div className="text-purple-400 text-[10px] font-bold uppercase">{t.locked} ({t.achievementReward})</div> :
              <div className="text-yellow-500 text-xs font-bold">{item.price} {t.coins || 'COINS'}</div>
            )}
            <div className={`w-full py-2 font-bold text-xs rounded text-center transition-all ${equipped ? 'bg-yellow-500 text-black' : unlocked ? 'bg-green-600 text-white hover:bg-green-500' : (canAfford && !isAchievementReward) ? 'bg-yellow-600 text-black hover:bg-yellow-500' : 'bg-neutral-800 text-neutral-600'}`}>
              {equipped ? (t.equipped || "EQUIPPED") : unlocked ? (t.equip || "EQUIP") : isAchievementReward ? t.locked : (t.buy || "BUY")}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShopView;
