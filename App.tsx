import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import GameCanvas from "./components/GameCanvas";
import LevelEditor from "./components/LevelEditor";
import CustomLevelSelect from "./components/CustomLevelSelect";
import LevelPreview from "./components/LevelPreview";
import Book from "./components/Book";
import {
  GameState,
  Language,
  LevelData,
  PlayerCustomization,
  GameSettings,
  HighScore,
  SortMode,
  Entity,
  EntityType,
  EyeType,
  AccessoryType,
  Keybindings,
  BrawlerTeamMode,
  BrawlerHazardMode,
  Achievement,
} from "./types";
import {
  INITIAL_LEVELS,
  ADVANCED_LEVELS,
  EXPERT_LEVELS,
  GOD_LEVELS,
  BRAWLER_LEVELS,
  TRANSLATIONS,
  ACHIEVEMENTS_LIST,
  STANDARD_EMOJIS,
  SPECIAL_EMOJIS,
} from "./constants";
import { audio } from "./services/audioService";
import {
  onlineService,
  OnlinePlayer,
  ChatMessage,
  VoteData,
  VoteType,
} from "./services/onlineService";
import {
  leaderboardService,
  LeaderboardEntry,
} from "./services/leaderboardService";

const DEFAULT_CUSTOMIZATION: PlayerCustomization = {
  color: "#ff0044",
  eyes: "normal",
  accessory: "none",
  trailColor: "#ff0044", // Changed default to hex for easier slider manipulation
  coins: 0,
  unlockedTrails: ["normal"],
  unlockedDeathAnims: ["normal"],
  deathAnim: "normal",
  trailType: "normal",
  brawlerClass: "standard",
};

const FPS_OPTIONS = [30, 60, 120, 144, 165, 240, 0]; // 0 = Unlimited
const UI_SCALE_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5];
const RESOLUTION_OPTIONS = [720, 1080, 1440, 2160];

const BRAWLER_CLASS_OPTIONS = ["standard", "fighter", "dasher", "jumper", "tank", "ninja", "heavy", "vampire"] as const;

const BRAWLER_DESCS: Record<string, {pos: string, neg: string}> = {
  "fighter": { pos: "+ Starke Gesamt-Stats", neg: "- Viel längerer Dash CD" },
  "dasher": { pos: "+ Sehr kurzer Dash CD", neg: "- Weniger Leben" },
  "jumper": { pos: "+ Echter Triple Jump", neg: "- Weniger Leben" },
  "tank": { pos: "+ Mehr Leben & Resistenz", neg: "- Sehr langsam" },
  "ninja": { pos: "+ Sehr schnell & hoch", neg: "- Sehr wenig Leben" },
  "heavy": { pos: "+ Gewaltiger Knockback", neg: "- Langsam & Massiv" },
  "vampire": { pos: "+ Heilt bei Kill", neg: "- Extrem wenig Leben" },
};

const BRAWLER_STATS: Record<string, {hp: number, speed: number, jump: number}> = {
  "standard": { hp: 10, speed: 10, jump: 10 },
  "fighter": { hp: 12, speed: 11, jump: 7 },
  "dasher": { hp: 8, speed: 12, jump: 10 },
  "jumper": { hp: 8, speed: 10, jump: 12 },
  "tank": { hp: 15, speed: 7, jump: 8 },
  "ninja": { hp: 7, speed: 11.5, jump: 11.5 },
  "heavy": { hp: 13, speed: 8, jump: 9 },
  "vampire": { hp: 6, speed: 12, jump: 12 },
};

const PINGS = ["Ggwp!", "Oops!", "Help!", "Haha!", "Team?", "Wait!"];

const StatBar = ({ label, value, max, color }: { label: string, value: number, max: number, color: string }) => (
  <div className="w-full flex flex-col gap-0.5">
    <div className="flex justify-between text-[6px] font-black tracking-tighter uppercase text-neutral-400">
      <span>{label}</span>
      <span>{Math.round(value)}</span>
    </div>
    <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden border border-white/5">
      <div 
        className={`h-full ${color} transition-all duration-500`} 
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);

// Available Customization Options
const EYE_OPTIONS: EyeType[] = [
  "normal",
  "angry",
  "cyclops",
  "derp",
  "anime",
  "dead",
  "sunglasses",
  "pirate",
  "rich",
  "glowing",
  "ninja",
  "tired",
  "laser",
  "kawaii",
  "monocle",
  "masked",
  "alien",
  "cyborg",
  "stars",
  "hearts",
  "hypno",
  "googly",
];
const ACC_OPTIONS: AccessoryType[] = [
  "none",
  "crown",
  "horns",
  "headband",
  "cowboy",
  "viking",
  "halo",
  "headphones",
  "tophat",
  "cap",
  "propeller",
  "cat_ears",
  "demon_horns",
  "builder_hat",
  "wizard_hat",
  "bunny_ears",
  "pirate_hat",
  "party_hat",
  "sombrero",
  "ushanka",
  "fedora",
  "chef",
  "police",
  "pumpkin",
  "unicorn",
];

const SHOP_ITEMS = [
  // Death Animations (10 total)
  { id: 'normal', type: 'deathAnim', name: 'None', price: 0 }, // 1
  { id: 'blood', type: 'deathAnim', name: 'Blood Pop', price: 250 }, // 2
  { id: 'confetti', type: 'deathAnim', name: 'Confetti Party', price: 350 }, // 3
  { id: 'firework', type: 'deathAnim', name: 'Glow Burst', price: 450 }, // 4
  { id: 'dust', type: 'deathAnim', name: 'Poof Cloud', price: 250 }, // 5
  { id: 'electric', type: 'deathAnim', name: 'Volt Burst', price: 500 }, // 6
  { id: 'ghost', type: 'deathAnim', name: 'Soul Release', price: 550 }, // 7
  { id: 'freeze', type: 'deathAnim', name: 'Ice Shatter', price: 600 }, // 8
  { id: 'blackhole', type: 'deathAnim', name: 'Void Collapse', price: 750 }, // 9
  { id: 'bubble', type: 'deathAnim', name: 'Bubble Pop', price: 400 }, // 10

  // Trail Types (10 total)
  { id: 'normal', type: 'trailType', name: 'Standard (Free)', price: 0 }, // 1
  { id: 'pixel-fire', type: 'trailType', name: 'Flame Trail', price: 300 }, // 2
  { id: 'stardust', type: 'trailType', name: 'Galaxy Dust', price: 400 }, // 3
  { id: 'slime', type: 'trailType', name: 'Ooze Trail', price: 350 }, // 4
  { id: 'rainbow-pulse', type: 'trailType', name: 'RGB Flow', price: 600 }, // 5
  { id: 'ghostly', type: 'trailType', name: 'Phantom Vapor', price: 500 }, // 6
  { id: 'bubble-trail', type: 'trailType', name: 'Deep Sea', price: 450 }, // 7
  { id: 'spark-trail', type: 'trailType', name: 'Electric Spark', price: 550 }, // 8
  { id: 'shadow-trail', type: 'trailType', name: 'Dark Void', price: 700 }, // 9
  { id: 'neon-trail', type: 'trailType', name: 'Cyber Neon', price: 750 }, // 10
  { id: 'matrix_trail', type: 'trailType', name: 'Matrix Code', price: 99999 },

  // Death Sounds (10 total)
  { id: 'default', type: 'deathSound', name: 'Standard (Free)', price: 0 },
  { id: 'fart', type: 'deathSound', name: 'Fart', price: 100 },
  { id: 'explosion', type: 'deathSound', name: 'Explosion', price: 150 },
  { id: 'whistle_down', type: 'deathSound', name: 'Falling Whistle', price: 200 },
  { id: 'power_down', type: 'deathSound', name: 'Power Down', price: 250 },
  { id: 'glass', type: 'deathSound', name: 'Shatter', price: 300 },
  { id: 'splat', type: 'deathSound', name: 'Splat', price: 250 },
  { id: 'crunch', type: 'deathSound', name: 'Crunch', price: 200 },
  { id: 'glitch', type: 'deathSound', name: 'Glitch Out', price: 350 },
  { id: 'sad_trombone', type: 'deathSound', name: 'Sad Trombone', price: 400 },
  { id: 'boing_die', type: 'deathSound', name: 'Boing', price: 150 },

  // Eyes (Prices 50-250)
  { id: 'normal', type: 'eyes', name: 'Default', price: 0 },
  { id: 'angry', type: 'eyes', name: 'Angry Eyes', price: 50 },
  { id: 'cyclops', type: 'eyes', name: 'Cyclops', price: 100 },
  { id: 'derp', type: 'eyes', name: 'Derp Eyes', price: 50 },
  { id: 'anime', type: 'eyes', name: 'Anime Eyes', price: 150 },
  { id: 'dead', type: 'eyes', name: 'Dead Eyes', price: 100 },
  { id: 'sunglasses', type: 'eyes', name: 'Cool Shades', price: 200 },
  { id: 'pirate', type: 'eyes', name: 'Pirate Patch', price: 200 },
  { id: 'rich', type: 'eyes', name: 'Money Eyes', price: 250 },
  { id: 'glowing', type: 'eyes', name: 'Neon Glow', price: 180 },
  { id: 'ninja', type: 'eyes', name: 'Ninja Mask', price: 220 },
  { id: 'tired', type: 'eyes', name: 'Tired Eyes', price: 80 },
  { id: 'laser', type: 'eyes', name: 'Laser Beam', price: 250 },
  { id: 'kawaii', type: 'eyes', name: 'Kawaii', price: 150 },
  { id: 'monocle', type: 'eyes', name: 'Gentleman', price: 180 },
  { id: 'masked', type: 'eyes', name: 'Secret Mask', price: 200 },
  { id: 'alien', type: 'eyes', name: 'Alien Eyes', price: 150 },
  { id: 'cyborg', type: 'eyes', name: 'Cyborg Eye', price: 250 },
  { id: 'stars', type: 'eyes', name: 'Star Eyes', price: 120 },
  { id: 'hearts', type: 'eyes', name: 'Heart Eyes', price: 120 },
  { id: 'hypno', type: 'eyes', name: 'Hypno Eyes', price: 250 },
  { id: 'googly', type: 'eyes', name: 'Googly Eyes', price: 60 },
  { id: 'void_eyes', type: 'eyes', name: 'Void Eyes', price: 99999 },

  // Accessories (Prices 50-250)
  { id: 'none', type: 'accessory', name: 'None', price: 0 },
  { id: 'crown', type: 'accessory', name: 'King Crown', price: 250 },
  { id: 'horns', type: 'accessory', name: 'Devil Horns', price: 100 },
  { id: 'headband', type: 'accessory', name: 'Ninja Band', price: 80 },
  { id: 'cowboy', type: 'accessory', name: 'Cowboy Hat', price: 150 },
  { id: 'viking', type: 'accessory', name: 'Viking Helmet', price: 180 },
  { id: 'halo', type: 'accessory', name: 'Angel Halo', price: 250 },
  { id: 'headphones', type: 'accessory', name: 'Beats', price: 120 },
  { id: 'tophat', type: 'accessory', name: 'Top Hat', price: 200 },
  { id: 'cap', type: 'accessory', name: 'Sport Cap', price: 80 },
  { id: 'propeller', type: 'accessory', name: 'Propeller Hat', price: 150 },
  { id: 'cat_ears', type: 'accessory', name: 'Neko Ears', price: 120 },
  { id: 'demon_horns', type: 'accessory', name: 'Greater Horns', price: 220 },
  { id: 'builder_hat', type: 'accessory', name: 'Hard Hat', price: 90 },
  { id: 'wizard_hat', type: 'accessory', name: 'Mage Hat', price: 250 },
  { id: 'bunny_ears', type: 'accessory', name: 'Bunny Ears', price: 120 },
  { id: 'pirate_hat', type: 'accessory', name: 'Captain Hat', price: 150 },
  { id: 'party_hat', type: 'accessory', name: 'Birthday!', price: 70 },
  { id: 'sombrero', type: 'accessory', name: 'Sombrero', price: 130 },
  { id: 'ushanka', type: 'accessory', name: 'Ushanka', price: 110 },
  { id: 'fedora', type: 'accessory', name: 'Fedora', price: 150 },
  { id: 'chef', type: 'accessory', name: 'Chef Hat', price: 90 },
  { id: 'police', type: 'accessory', name: 'Police Cap', price: 140 },
  { id: 'pumpkin', type: 'accessory', name: 'Pumpkin Head', price: 250 },
  { id: 'secret_crown', type: 'accessory', name: 'Hacker Crown', price: 99999 },
  { id: 'rainbow_horn', type: 'accessory', name: 'Rainbow Horn', price: 99999 },
  { id: 'ghost_sheet', type: 'accessory', name: 'Ghost Sheet', price: 99999 },
  { id: 'coffee_cup', type: 'accessory', name: 'Coffee Cup', price: 99999 },
];


const LevelMenu = ({
  categories,
  selectedLevels,
  onToggleLevel,
  onClose,
  onStart,
  t,
}: {
  categories: { name: string; levels: LevelData[] }[];
  selectedLevels: LevelData[];
  onToggleLevel: (lvl: LevelData) => void;
  onClose: () => void;
  onStart: () => void;
  t: any;
}) => {
  return (
    <div className="absolute inset-0 bg-black/98 z-[100] flex flex-col p-6 md:p-10 overflow-hidden animate-fade-in font-arcade">
      <div className="flex justify-between items-center mb-8 border-b-2 border-neutral-800 pb-4">
        <div>
          <h2 className="text-4xl font-arcade text-rage-red tracking-tighter">
            {t.levelSelection}
          </h2>
          <p className="text-neutral-500 text-xs mt-1 font-bold uppercase tracking-widest">
            {t.selectLevelDesc}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center bg-neutral-900 border-2 border-neutral-700 text-white hover:text-rage-red hover:border-rage-red transition-all rounded-lg text-2xl"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-12">
        {categories.map(
          (cat) =>
            cat.levels.length > 0 && (
              <div key={cat.name} className="animate-slide-up">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-2xl font-arcade text-white whitespace-nowrap">
                    {cat.name}
                  </h3>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-neutral-700 to-transparent"></div>
                  <span className="text-neutral-500 font-mono text-sm">
                    {cat.levels.length} LEVELS
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                  {cat.levels.map((lvl) => {
                    const isSelected = selectedLevels.some(
                      (s) => s.id === lvl.id,
                    );
                    const selectIndex = selectedLevels.findIndex(
                      (s) => s.id === lvl.id,
                    );

                    return (
                      <div
                        key={lvl.id}
                        onClick={() => onToggleLevel(lvl)}
                        className={`relative aspect-video border-2 cursor-pointer transition-all duration-300 group overflow-hidden rounded-xl ${
                          isSelected
                            ? "border-yellow-400 scale-[0.98] shadow-[0_0_25px_rgba(250,204,21,0.3)] ring-4 ring-yellow-400/10"
                            : "border-neutral-800 hover:border-neutral-500 hover:bg-neutral-900"
                        }`}
                      >
                        {/* Level Preview */}
                        <div className="absolute inset-0 bg-neutral-950">
                          <LevelPreview
                            level={lvl}
                            width={160}
                            height={90}
                            className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                          />
                        </div>

                        {/* Selection Badge */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-7 h-7 bg-yellow-400 text-black rounded-full flex items-center justify-center font-black text-sm z-10 animate-pop shadow-lg">
                            {selectIndex + 1}
                          </div>
                        )}

                        {/* Name Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-6">
                          <div
                            className={`text-xs font-bold truncate transition-colors ${isSelected ? "text-yellow-400" : "text-neutral-300 group-hover:text-white"}`}
                          >
                            {lvl.name}
                          </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
        )}
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-6 items-center bg-neutral-900/80 backdrop-blur-md p-6 rounded-2xl border border-neutral-800 shadow-2xl">
        <div className="flex-1">
          <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            {t.selectionStatus}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-arcade text-white">
              {selectedLevels.length}
            </span>
            <span className="text-neutral-400 font-bold text-sm uppercase">
              {t.levelsSelected}
            </span>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={onClose}
            className="flex-1 md:flex-none px-10 py-4 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white rounded-xl font-arcade text-xs transition-all border-b-4 border-neutral-950 active:translate-y-1 active:border-b-0"
          >
            {t.back}
          </button>
          <button
            onClick={onStart}
            disabled={selectedLevels.length === 0}
            className={`flex-1 md:flex-none px-12 py-4 rounded-xl font-arcade text-xs transition-all border-b-4 active:translate-y-1 active:border-b-0 ${
              selectedLevels.length > 0
                ? "bg-rage-red text-white border-red-900 hover:brightness-110 shadow-[0_10px_30px_rgba(255,0,68,0.3)]"
                : "bg-neutral-800 text-neutral-600 border-neutral-900 cursor-not-allowed"
            }`}
          >
            {t.select}
          </button>
        </div>
      </div>
    </div>
  );
};

// Trail Presets
const TRAIL_PRESETS = [
  { name: "RAGE RED", val: "#ff0044" },
  { name: "TOXIC GREEN", val: "#00ff88" },
  { name: "ICE BLUE", val: "#00ccff" },
  { name: "GOLD", val: "#fbbf24" },
  { name: "VOID PURPLE", val: "#9c27b0" },
  { name: "FIRE", val: "#ff4400" },
  { name: "RAINBOW", val: "rainbow" },
];

// Helper to handle colors
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 0, b: 68 };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const filterVSLevels = (levels: LevelData[]) => {
  return levels.filter((lvl) => {
    // VS mode requires a goal to be playable
    const hasGoal = lvl.entities.some((e) => e.type === "goal");
    if (!hasGoal) return false;

    // Exclude brawler-specific levels from VS race
    if (lvl.isBrawler) return false;

    const hasForbiddenAbility =
      lvl.allowedAbility === "build" || lvl.allowedAbility === "hook";
    const hasForbiddenPowerup = lvl.entities.some(
      (e) =>
        e.type === "powerup_build" ||
        e.type === "powerup_hook" ||
        e.type === "powerup_spawner",
    );

    return !hasForbiddenAbility && !hasForbiddenPowerup;
  });
};

const filterBrawlerLevels = (levels: LevelData[]) => {
  return levels.filter((lvl) => lvl.isBrawler || !!lvl.startP2);
};

// --- Extracted Components for Performance ---

const Chat: React.FC<{
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isHost: boolean;
  lang: string;
  unlockedAchievements: string[];
}> = React.memo(
  ({ messages, onSendMessage, isHost, lang, unlockedAchievements }) => {
    const [input, setInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const t =
      TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS["EN"];

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages]);

    const handleSend = () => {
      if (input.trim()) {
        onSendMessage(input);
        setInput("");
        setShowEmojiPicker(false);
      }
    };

    const addEmoji = (emoji: string) => {
      setInput((prev) => prev + emoji);
    };

    return (
      <div className="flex flex-col w-full h-64 bg-black/80 border-2 border-neutral-800 rounded-lg overflow-hidden font-mono text-xs relative">
        <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800">
          <span className="text-cyan-400 font-bold uppercase tracking-widest">
            Lobby Chat
          </span>
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-12 left-2 right-2 bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 z-50 animate-pop shadow-2xl max-h-40 overflow-y-auto custom-scrollbar">
            <div className="text-[8px] text-neutral-500 mb-2 uppercase font-bold tracking-widest">
              Standard Emojis
            </div>
            <div className="grid grid-cols-8 gap-1 mb-3">
              {STANDARD_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => addEmoji(e)}
                  className="text-lg hover:bg-neutral-800 rounded p-1 transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>

            <div className="text-[8px] text-neutral-500 mb-2 uppercase font-bold tracking-widest">
              Unlocked Special Emojis
            </div>
            <div className="grid grid-cols-8 gap-1">
              {SPECIAL_EMOJIS.map((se) => {
                const isUnlocked = unlockedAchievements.includes(
                  se.achievementId,
                );
                return (
                  <button
                    key={se.id}
                    onClick={() => isUnlocked && addEmoji(se.emoji)}
                    disabled={!isUnlocked}
                    className={`text-lg rounded p-1 transition-colors ${isUnlocked ? "hover:bg-neutral-800" : "opacity-20 grayscale cursor-not-allowed"}`}
                    title={isUnlocked ? "" : "Locked by Achievement"}
                  >
                    {se.emoji}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="text-neutral-600 italic text-center mt-4">
              No messages yet...
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={m.id || i}
              className={`flex flex-col ${m.type === "system" ? "items-center" : ""}`}
            >
              {m.type === "system" ? (
                <span className="text-yellow-500/70 text-[10px] italic">
                  -- {m.text} --
                </span>
              ) : (
                <div className="flex gap-2">
                  <span className="text-cyan-600 font-bold shrink-0">
                    [{m.senderName}]
                  </span>
                  <span className="text-neutral-300 break-all">{m.text}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-2 bg-neutral-900/50 border-t border-neutral-800 flex gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`px-2 py-1 rounded border transition-all ${showEmojiPicker ? "bg-cyan-900 border-cyan-500 text-cyan-400" : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white"}`}
          >
            😊
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type message..."
            className="flex-1 bg-black border border-neutral-800 px-2 py-1 text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSend}
            className="bg-cyan-900/50 hover:bg-cyan-800 text-cyan-400 px-3 py-1 font-bold uppercase"
          >
            Send
          </button>
        </div>
      </div>
    );
  },
);

const MenuButton = React.memo(
  ({
    index,
    label,
    onClick,
    isSelected,
    onHover,
    disabled,
    danger,
  }: any) => (
    <button
      onMouseEnter={() => onHover(index)}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-3 px-4 font-arcade text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] transition-all transform-gpu will-change-transform box-border
        relative overflow-hidden flex items-center justify-center text-center
        ${
          danger 
            ? "bg-red-950 text-red-500 border-2" 
            : "lava-btn-bg border-2"
        }
        ${
          disabled
            ? "opacity-40 cursor-not-allowed grayscale"
            : isSelected
              ? (danger ? "border-red-400 scale-105 z-20 brightness-150 shadow-[0_0_20px_#ff000044]" : "lava-border-active scale-105 z-20 brightness-125 shadow-[0_0_20px_#ea710844]")
              : (danger ? "border-red-800 hover:brightness-110" : "lava-border hover:brightness-110")
        }
      `}
    >
      {/* Lava glow effect inside */}
      {!danger && <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 to-transparent pointer-events-none"></div>}
      
      {/* Selected electric dots */}
      {isSelected && (
        <>
          <div className={`absolute left-1 top-1 w-1.5 h-1.5 ${danger ? 'bg-red-400' : 'bg-white'} shadow-[0_0_10px_#fff]`}></div>
          <div className={`absolute right-1 top-1 w-1.5 h-1.5 ${danger ? 'bg-red-400' : 'bg-white'} shadow-[0_0_10px_#fff]`}></div>
          <div className={`absolute left-1 bottom-1 w-1.5 h-1.5 ${danger ? 'bg-red-400' : 'bg-white'} shadow-[0_0_10px_#fff]`}></div>
          <div className={`absolute right-1 bottom-1 w-1.5 h-1.5 ${danger ? 'bg-red-400' : 'bg-white'} shadow-[0_0_10px_#fff]`}></div>
        </>
      )}
      
      <span className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-normal text-center leading-tight">
        {label}
      </span>
    </button>
  ),
);

const SliderRow = React.memo(
  ({
    label,
    value,
    index,
    colorClass,
    onChange,
    isSelected,
    onHover,
    max = 255,
  }: any) => {
    const barRef = useRef<HTMLDivElement>(null);
    const [localValue, setLocalValue] = useState(value);
    const isDragging = useRef(false);

    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      if (!isDragging.current) {
        setLocalValue(value);
      }
    }, [value]);

    const handleMouseInteraction = useCallback(
      (clientX: number) => {
        if (barRef.current && onChangeRef.current) {
          const rect = barRef.current.getBoundingClientRect();
          const x = clientX - rect.left;
          const percentage = Math.max(0, Math.min(1, x / rect.width));
          const newValue = Math.round(percentage * max);
          setLocalValue(newValue);
          onChangeRef.current(newValue);
        }
      },
      [max],
    );

    const onMouseDown = (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      isDragging.current = true;
      handleMouseInteraction(e.clientX);

      const onMouseMove = (moveEvent: MouseEvent) => {
        handleMouseInteraction(moveEvent.clientX);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    return (
      <div
        className={`p-2 border cursor-ew-resize transition-colors ${isSelected ? "border-white bg-neutral-800" : "border-transparent hover:bg-neutral-800/50"} text-xs md:text-sm`}
        onMouseEnter={() => onHover(index)}
        onMouseDown={onMouseDown}
      >
        <div className="flex justify-between mb-1 pointer-events-none select-none">
          <span>{label}</span>
          <span>{localValue}</span>
        </div>
        <div
          ref={barRef}
          className="w-full h-2 bg-neutral-700 rounded overflow-hidden pointer-events-none"
        >
          <div
            className={`h-full transition-all duration-75 ${colorClass}`}
            style={{ width: `${(localValue / max) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  },
);

const SettingsSlider = React.memo(
  ({ label, value, index, colorClass, onChange, isSelected, onHover }: any) => {
    const barRef = useRef<HTMLDivElement>(null);
    const [localValue, setLocalValue] = useState(value);
    const isDragging = useRef(false);

    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      if (!isDragging.current) {
        setLocalValue(value);
      }
    }, [value]);

    const handleMouseInteraction = useCallback((clientX: number) => {
      if (barRef.current && onChangeRef.current) {
        const rect = barRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        setLocalValue(percentage);
        onChangeRef.current(percentage);
      }
    }, []);

    const onMouseDown = (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      isDragging.current = true;
      handleMouseInteraction(e.clientX);

      const onMouseMove = (moveEvent: MouseEvent) => {
        handleMouseInteraction(moveEvent.clientX);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    return (
      <div
        className={`p-4 border cursor-ew-resize transition-colors ${isSelected ? "border-white bg-neutral-800" : "border-transparent hover:bg-neutral-800/50"}`}
        onMouseEnter={() => onHover(index)}
        onMouseDown={onMouseDown}
      >
        <div className="flex justify-between mb-2 text-sm pointer-events-none select-none">
          <span>{label}</span>
          <span>{Math.round(localValue * 100)}%</span>
        </div>
        <div
          ref={barRef}
          className="w-full h-2 bg-gray-700 rounded overflow-hidden pointer-events-none"
        >
          <div
            className={`h-full transition-all duration-75 ${colorClass}`}
            style={{ width: `${localValue * 100}%` }}
          ></div>
        </div>
      </div>
    );
  },
);

const CharacterPreview = React.memo(
  ({
    customization,
    scale = 4,
  }: {
    customization: PlayerCustomization;
    scale?: number;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const triggerDeathRef = useRef<boolean>(false);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const animationStartTime = Date.now();
      let animationId: number;
      let deathStartTime = 0;

      const render = () => {
        const now = Date.now();
        const frame = (now - animationStartTime) / 16.666; // Normalize to equivalent of 60 FPS for existing formulas
        
        // Clear background
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const CX = canvas.width / 2;
        const CY = canvas.height * 0.65;
        const P_SIZE = 20 * scale;

        if (triggerDeathRef.current) {
            triggerDeathRef.current = false;
            deathStartTime = now;
        }

        // Draw deathAnim preview
        const deathElapsed = now - deathStartTime;
        const isDying = deathElapsed <= 500 && deathStartTime > 0;
        if (isDying) {
          ctx.globalAlpha = 1.0;
          const anim = customization.deathAnim || "normal";
          const particleColor = customization.color;
          const progress = (deathElapsed / 500) * 30;
          
          if (anim === "normal") {
             ctx.fillStyle = "red";
             for(let i=0; i<10; i++) {
                const r = 5 * scale;
                ctx.beginPath();
                ctx.arc(CX + Math.cos(i) * r * progress/10, CY + Math.sin(i) * r * progress/10 - 5 * scale, 2*scale, 0, Math.PI*2);
                ctx.fill();
             }
          } else if (anim === "blood") {
             ctx.fillStyle = "#aa0000";
             const baseAngle = -Math.PI / 3; // up-right
             for(let i=0; i<15; i++) {
                // simple pseudo randomness based on index
                const angleOffset = Math.sin(i * 12.34) * 0.5;
                const speedMult = 0.5 + Math.abs(Math.cos(i * 43.21)) * 1.5;
                const dist = progress * 1.5 * speedMult * scale;
                const gravity = (progress * progress) * 0.1 * scale;

                ctx.beginPath();
                ctx.arc(
                  CX + Math.cos(baseAngle + angleOffset) * dist,
                  CY + Math.sin(baseAngle + angleOffset) * dist + gravity - 5 * scale,
                  (1.5 + Math.abs(Math.sin(i)) * 1.5) * scale,
                  0,
                  Math.PI*2
                );
                ctx.fill();
             }
          } else if (anim === "confetti") {
             for(let i=0; i<10; i++) {
                ctx.fillStyle = `hsl(${i * 40}, 80%, 60%)`;
                ctx.fillRect(CX + Math.cos(i) * 10 * scale * progress/10, CY + Math.sin(i) * 10 * scale * progress/10 - 5 * scale, 3*scale, 3*scale);
             }
          } else if (anim === "firework") {
            ctx.fillStyle = "yellow";
            ctx.shadowBlur = 10 * scale;
            ctx.shadowColor = "yellow";
            for(let i=0; i<8; i++) {
               ctx.beginPath();
               ctx.arc(CX + Math.cos(i*Math.PI/4) * 12 * scale * progress/10, CY + Math.sin(i*Math.PI/4) * 12 * scale * progress/10 - 5 * scale, 1.5*scale, 0, Math.PI*2);
               ctx.fill();
            }
            ctx.shadowBlur = 0;
          } else if (anim === "dust") {
            ctx.fillStyle = "#aaa";
            for(let i=0; i<6; i++) {
               ctx.beginPath();
               ctx.arc(CX + (i-3) * 4 * scale, CY - 5 * scale - progress * scale, 3*scale, 0, Math.PI*2);
               ctx.fill();
            }
          } else if (anim === "electric") {
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 2 * scale;
            for(let i=0; i<5; i++) {
               ctx.beginPath();
               ctx.moveTo(CX + (Math.random()-0.5)*20*scale, CY + (Math.random()-0.5)*20*scale - 5*scale);
               ctx.lineTo(CX + (Math.random()-0.5)*20*scale, CY + (Math.random()-0.5)*20*scale - 5*scale);
               ctx.stroke();
            }
          } else if (anim === "ghost") {
            ctx.fillStyle = "rgba(255, 255, 255, " + (1 - progress / 30) + ")";
            ctx.fillRect(CX - P_SIZE/2, CY - P_SIZE/2 - progress * scale, P_SIZE, P_SIZE);
          } else if (anim === "freeze") {
            ctx.fillStyle = "#88ccff";
            for(let i=0; i<8; i++) {
               const rot = (i * Math.PI) / 4;
               ctx.save();
               ctx.translate(CX, CY - 5*scale);
               ctx.rotate(rot);
               ctx.fillRect(5 * scale * progress/10, -1*scale, 5*scale, 2*scale);
               ctx.restore();
            }
          } else if (anim === "blackhole") {
            ctx.fillStyle = "black";
            ctx.strokeStyle = "purple";
            ctx.lineWidth = 2 * scale;
            const radius = Math.max(0, 15 * scale - progress * scale);
            ctx.beginPath();
            ctx.arc(CX, CY - 5*scale, radius, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
          } else if (anim === "bubble") {
            ctx.strokeStyle = "rgba(100, 200, 255, 0.8)";
            ctx.lineWidth = 1 * scale;
            for(let i=0; i<5; i++) {
               ctx.beginPath();
               ctx.arc(CX + Math.sin(i+frame/5)*10*scale, CY - 5*scale - (i*5 + progress*2)*scale, 4*scale, 0, Math.PI*2);
               ctx.stroke();
            }
          }
          
          animationId = requestAnimationFrame(render);
          return;
        }

        // Draw Trail (with alpha fading)
        for (let i = 2; i >= 0; i--) {
          if (customization.color.toLowerCase() === "#ffffff") {
            continue; // No trail for ghost mode
          }
          if (customization.color === "#130009") {
             ctx.fillStyle = (Math.floor(now / 100) + i) % 2 === 0 ? "#ffff00" : "#000000";
          } else if (customization.trailColor === "rainbow") {
            ctx.fillStyle = `hsl(${frame * 5 + i * 40}, 100%, 50%)`;
          } else {
            ctx.fillStyle = customization.trailColor;
          }
          ctx.globalAlpha = 0.3 - i * 0.1;
          const offset = (i + 1) * 2 * scale;
          const size = P_SIZE - i * 1 * scale;
          
          const trailBounceOffset = Math.sin((now - (i + 1) * 60) / 200) * 5 * scale;
          ctx.save();
          ctx.translate(0, trailBounceOffset);
          
          if (customization.trailType === "stardust") {
            ctx.beginPath();
            ctx.arc(CX - offset, CY, size / 2, 0, Math.PI * 2);
            ctx.fill();
            if (frame % 10 === 0) {
              ctx.fillStyle = "white";
              ctx.fillRect(CX - offset + (Math.random()*10 - 5), CY + (Math.random()*10 - 5), 2*scale, 2*scale);
            }
          } else if (customization.trailType === "pixel-fire") {
            ctx.fillRect(CX - offset - size/2, CY - size/2 - (5 - i) * scale, size, size);
            ctx.fillStyle = "#ffaa00";
            ctx.globalAlpha *= 0.8;
            ctx.fillRect(CX - offset - size/4, CY - size/4 - (8 - i) * scale, size/2, size/2);
          } else if (customization.trailType === "slime") {
            ctx.beginPath();
            ctx.arc(CX - offset, CY + (5 - i) * scale, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(CX - offset - 4*scale, CY + (8 - i) * scale, size/3, 0, Math.PI*2);
            ctx.fill();
          } else if (customization.trailType === "rainbow-pulse") {
            ctx.fillStyle = `hsl(${(frame * 10 + i * 60) % 360}, 80%, 60%)`;
            ctx.globalAlpha = 0.4;
            ctx.fillRect(CX - offset - size/2, CY - size/2, size, size);
          } else if (customization.trailType === "ghostly") {
            ctx.fillStyle = "white";
            ctx.globalAlpha = (0.2 - i * 0.05) * Math.sin(frame/5);
            ctx.beginPath();
            ctx.moveTo(CX - offset - size/2, CY - size/2);
            ctx.lineTo(CX - offset + size/2, CY - size/2);
            ctx.lineTo(CX - offset, CY + size);
            ctx.fill();
          } else if (customization.trailType === "bubble-trail") {
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.arc(CX - offset, CY + Math.sin(frame/10 + i)*5*scale, size/4, 0, Math.PI*2);
            ctx.stroke();
          } else if (customization.trailType === "spark-trail") {
            ctx.fillStyle = "#ffff00";
            if (frame % 5 === 0) {
              ctx.fillRect(CX - offset + (Math.random()-0.5)*10*scale, CY + (Math.random()-0.5)*10*scale, 2*scale, 2*scale);
            }
          } else if (customization.trailType === "shadow-trail") {
            ctx.fillStyle = "black";
            ctx.globalAlpha = 0.5 - i * 0.1;
            ctx.fillRect(CX - offset - (size+4*scale)/2, CY - (size+4*scale)/2, size+4*scale, size+4*scale);
          } else if (customization.trailType === "neon-trail") {
            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 2*scale;
            ctx.shadowBlur = 5*scale;
            ctx.shadowColor = "#00ff00";
            ctx.strokeRect(CX - offset - size/2, CY - size/2, size, size);
            ctx.shadowBlur = 0;
          } else if (customization.trailType === "matrix_trail") {
            ctx.fillStyle = "#00ff00";
            ctx.font = `${8 * scale}px monospace`;
            ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), CX - offset, CY);
          } else {
            ctx.fillRect(CX - size / 2 - offset, CY - size / 2, size, size);
          }
          ctx.restore();
        }
        ctx.globalAlpha = 1.0;

        // Draw Player Body
        // Animation factors for dancing
        const bounceOffset = Math.sin(now / 200) * 5 * scale;
        const scaleFactor = 1 + Math.sin(now / 150) * 0.05;
        
        ctx.save();
        ctx.translate(CX, CY);
        ctx.scale(scaleFactor, scaleFactor);
        ctx.translate(-CX, -CY);

        const px = CX - P_SIZE / 2;
        const py = CY - P_SIZE / 2 + bounceOffset;
        const w = P_SIZE;

        if (customization.color.toLowerCase() === "#ffffff") {
          ctx.fillStyle = "rgba(0,0,0,0)";
        } else if (customization.color === "#130009") {
          const time = now / 500;
          const grad = ctx.createLinearGradient(
            px + Math.cos(time) * w,
            py + Math.sin(time) * w,
            px + w + Math.cos(time + Math.PI) * w,
            py + w + Math.sin(time + Math.PI) * w
          );
          grad.addColorStop(0, "#ffff00");
          grad.addColorStop(0.5, "#000000");
          grad.addColorStop(1, "#ffff00");
          ctx.fillStyle = grad;
        } else if (customization.color.toLowerCase() === "#ff0080") {
          ctx.fillStyle = `hsl(${frame * 2 % 360}, 100%, 50%)`;
        } else {
          ctx.fillStyle = customization.color;
        }
        ctx.fillRect(px, py, w, w);

        // Draw Eyes
        ctx.fillStyle = "white";
        const eyes = customization.eyes;
        switch (eyes) {
          case "cyclops":
            ctx.fillRect(px + w / 2 - 4 * scale, py + 4 * scale, 8 * scale, 8 * scale);
            ctx.fillStyle = "black";
            ctx.fillRect(px + w / 2 - 1 * scale, py + 6 * scale, 2 * scale, 2 * scale);
            break;
          case "anime":
            ctx.fillRect(px + 1 * scale, py + 3 * scale, 6 * scale, 8 * scale);
            ctx.fillRect(px + w - 7 * scale, py + 3 * scale, 6 * scale, 8 * scale);
            ctx.fillStyle = "black";
            ctx.fillRect(px + 2 * scale, py + 4 * scale, 3 * scale, 4 * scale);
            ctx.fillRect(px + w - 5 * scale, py + 4 * scale, 3 * scale, 4 * scale);
            break;
          case "dead":
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(px + 2 * scale, py + 4 * scale); ctx.lineTo(px + 6 * scale, py + 8 * scale);
            ctx.moveTo(px + 6 * scale, py + 4 * scale); ctx.lineTo(px + 2 * scale, py + 8 * scale);
            ctx.moveTo(px + w - 6 * scale, py + 4 * scale); ctx.lineTo(px + w - 2 * scale, py + 8 * scale);
            ctx.moveTo(px + w - 2 * scale, py + 4 * scale); ctx.lineTo(px + w - 6 * scale, py + 8 * scale);
            ctx.stroke();
            break;
          case "sunglasses":
            ctx.fillStyle = "black";
            ctx.fillRect(px, py + 4 * scale, w, 4 * scale);
            break;
          case "alien":
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.ellipse(px + 6 * scale, py + 6 * scale, 4 * scale, 7 * scale, -Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(px + w - 6 * scale, py + 6 * scale, 4 * scale, 7 * scale, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "cyborg":
            ctx.fillStyle = "white";
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillStyle = "red";
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            break;
          case "stars":
          case "hearts":
          case "hypno":
            ctx.fillStyle = eyes === "stars" ? "yellow" : eyes === "hearts" ? "red" : "magenta";
            ctx.font = `${10 * scale}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const sym = eyes === "stars" ? "★" : eyes === "hearts" ? "♥" : "🌀";
            ctx.fillText(sym, px + 5 * scale, py + 6 * scale);
            ctx.fillText(sym, px + w - 5 * scale, py + 6 * scale);
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
            break;
          case "googly":
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(px + 6 * scale, py + 6 * scale, 4 * scale, 0, Math.PI * 2);
            ctx.arc(px + w - 6 * scale, py + 6 * scale, 4 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.beginPath();
            const ox = Math.sin(frame / 10) * 1.5 * scale;
            const oy = Math.cos(frame / 10) * 1.5 * scale;
            ctx.arc(px + 6 * scale + ox, py + 6 * scale + oy, 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + w - 6 * scale - ox, py + 6 * scale + oy, 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "void_eyes":
            ctx.fillStyle = "#000";
            ctx.fillRect(px + 2 * scale, py + 2 * scale, w - 4 * scale, 8 * scale);
            ctx.fillStyle = "#fff";
            ctx.fillRect(px + 5 * scale, py + 4 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w - 7 * scale, py + 4 * scale, 2 * scale, 2 * scale);
            break;
          case "pirate":
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillStyle = "black";
            ctx.fillRect(px + w - 10 * scale, py + 2 * scale, 8 * scale, 8 * scale);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1 * scale;
            ctx.beginPath(); ctx.moveTo(px, py + 2 * scale); ctx.lineTo(px + w, py + 10 * scale); ctx.stroke();
            break;
          case "rich":
            ctx.fillStyle = "#22c55e";
            ctx.font = `${12 * scale}px Arial`;
            ctx.textAlign = "center";
            ctx.fillText("$", px + 6 * scale, py + 11 * scale);
            ctx.fillText("$", px + w - 6 * scale, py + 11 * scale);
            ctx.textAlign = "left";
            break;
          case "glowing":
          case "laser":
            ctx.fillStyle = eyes === "laser" ? "#ff0000" : "#00ffff";
            ctx.shadowBlur = 10 * scale;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.shadowBlur = 0;
            break;
          case "ninja":
            ctx.fillStyle = "#111";
            ctx.fillRect(px, py + 2 * scale, w, 10 * scale);
            ctx.fillStyle = "white";
            ctx.fillRect(px + 2 * scale, py + 4 * scale, 6 * scale, 6 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 6 * scale, 6 * scale);
            ctx.fillStyle = "black";
            ctx.fillRect(px + 4 * scale, py + 6 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w - 6 * scale, py + 6 * scale, 2 * scale, 2 * scale);
            break;
          case "tired":
            ctx.fillStyle = "#aaa";
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillStyle = "#444";
            ctx.fillRect(px + 2 * scale, py + 8 * scale, 8 * scale, 2 * scale);
            ctx.fillRect(px + w - 10 * scale, py + 8 * scale, 8 * scale, 2 * scale);
            break;
          case "kawaii":
            ctx.fillStyle = "white";
            ctx.fillRect(px + 1 * scale, py + 3 * scale, 6 * scale, 8 * scale);
            ctx.fillRect(px + w - 7 * scale, py + 3 * scale, 6 * scale, 8 * scale);
            ctx.fillStyle = "pink";
            ctx.fillRect(px + 2 * scale, py + 5 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w - 4 * scale, py + 5 * scale, 2 * scale, 2 * scale);
            break;
          case "monocle":
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.strokeStyle = "gold";
            ctx.lineWidth = 1 * scale;
            ctx.strokeRect(px + w - 10 * scale, py + 2 * scale, 8 * scale, 8 * scale);
            ctx.beginPath(); ctx.moveTo(px + w - 2 * scale, py + 10 * scale); ctx.lineTo(px + w + 4 * scale, py + 14 * scale); ctx.stroke();
            break;
          case "masked":
            ctx.fillStyle = "#333";
            ctx.fillRect(px - 2 * scale, py + 2 * scale, w + 4 * scale, 8 * scale);
            ctx.fillStyle = "white";
            ctx.fillRect(px + 2 * scale, py + 4 * scale, 6 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 6 * scale, 4 * scale);
            break;
          case "derp":
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 8 * scale, 4 * scale, 4 * scale);
            break;
          case "angry":
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillStyle = customization.color;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + w, py + 6 * scale); ctx.lineTo(px + w, py); ctx.fill();
            break;
          default:
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            break;
        }

        // Draw Accessories
        const acc = customization.accessory;
        if (customization.color.toLowerCase() !== "#ffffff") {
          switch (acc) {
            case "crown":
            ctx.fillStyle = "gold";
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 10 * scale); ctx.lineTo(px + 5 * scale, py - 5 * scale); ctx.lineTo(px + 10 * scale, py - 12 * scale); ctx.lineTo(px + 15 * scale, py - 5 * scale); ctx.lineTo(px + w, py - 10 * scale); ctx.lineTo(px + w, py); ctx.fill();
            break;
          case "horns":
            ctx.fillStyle = "#a00";
            ctx.beginPath(); ctx.moveTo(px + 2 * scale, py); ctx.lineTo(px - 2 * scale, py - 8 * scale); ctx.lineTo(px + 6 * scale, py); ctx.fill();
            ctx.beginPath(); ctx.moveTo(px + w - 6 * scale, py); ctx.lineTo(px + w + 2 * scale, py - 8 * scale); ctx.lineTo(px + w - 2 * scale, py); ctx.fill();
            break;
          case "headband":
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(px, py + 2 * scale, w, 4 * scale);
            ctx.fillRect(px - 2 * scale, py + 3 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w, py + 3 * scale, 2 * scale, 2 * scale);
            break;
          case "cowboy":
            ctx.fillStyle = "#8B4513";
            ctx.fillRect(px - 4 * scale, py - 4 * scale, w + 8 * scale, 4 * scale);
            ctx.fillRect(px + 2 * scale, py - 12 * scale, w - 4 * scale, 8 * scale);
            break;
          case "viking":
            ctx.fillStyle = "#aaa";
            ctx.beginPath(); ctx.arc(px + w / 2, py, w / 2, Math.PI, 0); ctx.fill();
            ctx.fillStyle = "white";
            ctx.beginPath(); ctx.moveTo(px, py - 4 * scale); ctx.lineTo(px - 4 * scale, py - 10 * scale); ctx.lineTo(px + 2 * scale, py - 6 * scale); ctx.fill();
            ctx.beginPath(); ctx.moveTo(px + w, py - 4 * scale); ctx.lineTo(px + w + 4 * scale, py - 10 * scale); ctx.lineTo(px + w - 2 * scale, py - 6 * scale); ctx.fill();
            break;
          case "halo":
            ctx.strokeStyle = "gold";
            ctx.lineWidth = 2 * scale;
            ctx.beginPath(); ctx.ellipse(px + w / 2, py - 12 * scale, 8 * scale, 3 * scale, 0, 0, Math.PI * 2); ctx.stroke();
            break;
          case "headphones":
            ctx.fillStyle = "#333";
            ctx.fillRect(px - 2 * scale, py + 4 * scale, 2 * scale, 12 * scale);
            ctx.fillRect(px + w, py + 4 * scale, 2 * scale, 12 * scale);
            ctx.beginPath(); ctx.arc(px + w / 2, py + 4 * scale, w / 2 + 2 * scale, Math.PI, 0); ctx.stroke();
            break;
          case "tophat":
            ctx.fillStyle = "#111";
            ctx.fillRect(px - 4 * scale, py - 4 * scale, w + 8 * scale, 4 * scale);
            ctx.fillRect(px + 2 * scale, py - 18 * scale, w - 4 * scale, 14 * scale);
            ctx.fillStyle = "#f00";
            ctx.fillRect(px + 2 * scale, py - 6 * scale, w - 4 * scale, 3 * scale);
            break;
          case "cap":
            ctx.fillStyle = "#3b82f6";
            ctx.beginPath(); ctx.arc(px + w / 2, py, w / 2, Math.PI, 0); ctx.fill();
            ctx.fillRect(px + w / 2, py - 4 * scale, w / 2 + 6 * scale, 4 * scale);
            break;
          case "propeller":
            ctx.fillStyle = "#facc15";
            ctx.beginPath(); ctx.arc(px + w / 2, py, w / 2, Math.PI, 0); ctx.fill();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1 * scale;
            ctx.beginPath(); ctx.moveTo(px + w / 2, py - 10 * scale); ctx.lineTo(px + w / 2, py - 16 * scale); ctx.stroke();
            ctx.fillStyle = "silver";
            const propX = Math.cos(frame / 5) * 8 * scale;
            ctx.fillRect(px + w / 2 - propX, py - 18 * scale, propX * 2, 2 * scale);
            break;
          case "cat_ears":
            ctx.fillStyle = customization.color;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 6 * scale, py); ctx.lineTo(px, py - 8 * scale); ctx.fill();
            ctx.beginPath(); ctx.moveTo(px + w, py); ctx.lineTo(px + w - 6 * scale, py); ctx.lineTo(px + w, py - 8 * scale); ctx.fill();
            break;
          case "demon_horns":
            ctx.fillStyle = "#000";
            ctx.beginPath(); ctx.moveTo(px + 2 * scale, py); ctx.quadraticCurveTo(px - 10 * scale, py - 15 * scale, px - 2 * scale, py - 20 * scale); ctx.quadraticCurveTo(px - 2 * scale, py - 10 * scale, px + 6 * scale, py); ctx.fill();
            ctx.beginPath(); ctx.moveTo(px + w - 2 * scale, py); ctx.quadraticCurveTo(px + w + 10 * scale, py - 15 * scale, px + w + 2 * scale, py - 20 * scale); ctx.quadraticCurveTo(px + w + 2 * scale, py - 10 * scale, px + w - 6 * scale, py); ctx.fill();
            break;
          case "builder_hat":
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath(); ctx.arc(px + w / 2, py, w / 2 + 2 * scale, Math.PI, 0); ctx.fill();
            ctx.fillRect(px - 2 * scale, py - 2 * scale, w + 4 * scale, 3 * scale);
            break;
          case "wizard_hat":
            ctx.fillStyle = "#7c3aed";
            ctx.beginPath(); ctx.moveTo(px - 4 * scale, py); ctx.lineTo(px + w / 2, py - 24 * scale); ctx.lineTo(px + w + 4 * scale, py); ctx.fill();
            ctx.fillStyle = "white";
            ctx.fillRect(px + w / 2 - 1 * scale, py - 10 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w / 2 + 3 * scale, py - 16 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w / 2 - 5 * scale, py - 18 * scale, 2 * scale, 2 * scale);
            break;
          case "bunny_ears":
            ctx.fillStyle = "white";
            ctx.fillRect(px + 2 * scale, py - 12 * scale, 5 * scale, 12 * scale);
            ctx.fillRect(px + w - 7 * scale, py - 12 * scale, 5 * scale, 12 * scale);
            ctx.fillStyle = "pink";
            ctx.fillRect(px + 3 * scale, py - 10 * scale, 3 * scale, 8 * scale);
            ctx.fillRect(px + w - 6 * scale, py - 10 * scale, 3 * scale, 8 * scale);
            break;
          case "pirate_hat":
            ctx.fillStyle = "black";
            ctx.beginPath(); ctx.moveTo(px - 6 * scale, py); ctx.quadraticCurveTo(px + w / 2, py - 15 * scale, px + w + 6 * scale, py); ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = `bold ${6 * scale}px sans-serif`;
            ctx.fillText("X", px + w / 2 - 3 * scale, py - 4 * scale);
            break;
          case "party_hat":
            ctx.fillStyle = `hsl(${frame * 2 % 360}, 70%, 60%)`;
            ctx.beginPath(); ctx.moveTo(px + 2 * scale, py); ctx.lineTo(px + w / 2, py - 16 * scale); ctx.lineTo(px + w - 2 * scale, py); ctx.fill();
            ctx.fillStyle = "red"; ctx.beginPath(); ctx.arc(px + w / 2, py - 16 * scale, 3 * scale, 0, Math.PI * 2); ctx.fill();
            break;
          case "sombrero":
            ctx.fillStyle = "#eab308";
            ctx.fillRect(px - 8 * scale, py - 4 * scale, w + 16 * scale, 4 * scale);
            ctx.fillRect(px + 2 * scale, py - 12 * scale, w - 4 * scale, 8 * scale);
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(px + 2 * scale, py - 6 * scale, w - 4 * scale, 2 * scale);
            break;
          case "ushanka":
            ctx.fillStyle = "#52525b";
            ctx.fillRect(px, py - 8 * scale, w, 8 * scale);
            ctx.fillRect(px - 2 * scale, py - 2 * scale, 4 * scale, 10 * scale);
            ctx.fillRect(px + w - 2 * scale, py - 2 * scale, 4 * scale, 10 * scale);
            break;
          case "fedora":
            ctx.fillStyle = "#27272a";
            ctx.fillRect(px - 4 * scale, py - 2 * scale, w + 8 * scale, 2 * scale);
            ctx.fillRect(px + 2 * scale, py - 10 * scale, w - 4 * scale, 8 * scale);
            break;
          case "chef":
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(px + 5 * scale, py - 10 * scale, 6 * scale, 0, Math.PI * 2);
            ctx.arc(px + w - 5 * scale, py - 10 * scale, 6 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(px + 2 * scale, py - 6 * scale, w - 4 * scale, 6 * scale);
            break;
          case "police":
            ctx.fillStyle = "#1e3a8a";
            ctx.fillRect(px, py - 8 * scale, w, 8 * scale);
            ctx.fillStyle = "gold";
            ctx.fillRect(px + w / 2 - 2 * scale, py - 6 * scale, 4 * scale, 4 * scale);
            break;
          case "pumpkin":
            ctx.fillStyle = "#f97316";
            ctx.fillRect(px, py - 12 * scale, w, 12 * scale);
            ctx.fillStyle = "#22c55e";
            ctx.fillRect(px + w / 2 - 2 * scale, py - 16 * scale, 4 * scale, 4 * scale);
            break;
          case "secret_crown":
            ctx.fillStyle = "#111"; // Hacker crown
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px, py - 10 * scale);
            ctx.lineTo(px + 5 * scale, py - 5 * scale);
            ctx.lineTo(px + 10 * scale, py - 12 * scale);
            ctx.lineTo(px + 15 * scale, py - 5 * scale);
            ctx.lineTo(px + w, py - 10 * scale);
            ctx.lineTo(px + w, py);
            ctx.fill();
            break;
          case "rainbow_horn":
            ctx.fillStyle = `hsl(${(Date.now() / 10) % 360}, 100%, 50%)`;
            ctx.beginPath();
            ctx.moveTo(px + w / 2 - 4 * scale, py);
            ctx.lineTo(px + w / 2, py - 20 * scale);
            ctx.lineTo(px + w / 2 + 4 * scale, py);
            ctx.fill();
            break;
          case "ghost_sheet":
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.beginPath();
            ctx.arc(px + w / 2, py + 4 * scale, w / 2 + 2 * scale, Math.PI, 0);
            ctx.lineTo(px + w + 2 * scale, py + w + 2 * scale);
            ctx.lineTo(px - 2 * scale, py + w + 2 * scale);
            ctx.fill();
            break;
          case "coffee_cup":
            ctx.fillStyle = "#fff";
            ctx.fillRect(px + w / 2 - 6 * scale, py - 14 * scale, 12 * scale, 14 * scale);
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.arc(px + w / 2 + 6 * scale, py - 7 * scale, 4 * scale, -Math.PI / 2, Math.PI / 2);
            ctx.stroke();
            ctx.fillStyle = "#4a2c0f"; // Coffee brown
            ctx.fillRect(px + w / 2 - 5 * scale, py - 13 * scale, 10 * scale, 2 * scale);
            break;
          case "unicorn":
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.moveTo(px + w / 2 - 4 * scale, py);
            ctx.lineTo(px + w / 2, py - 20 * scale);
            ctx.lineTo(px + w / 2 + 4 * scale, py);
            ctx.fill();
            ctx.strokeStyle = `hsl(${(Date.now() / 2) % 360}, 100%, 70%)`;
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(px + w / 2 - 2 * scale, py - 5 * scale);
            ctx.lineTo(px + w / 2 + 2 * scale, py - 5 * scale);
            ctx.moveTo(px + w / 2 - 1.5 * scale, py - 10 * scale);
            ctx.lineTo(px + w / 2 + 1.5 * scale, py - 10 * scale);
            ctx.moveTo(px + w / 2 - 1 * scale, py - 15 * scale);
            ctx.lineTo(px + w / 2 + 1 * scale, py - 15 * scale);
            ctx.stroke();
            break;
          }
        }
        
        ctx.restore();

        animationId = requestAnimationFrame(render);
      };
      render();
      return () => cancelAnimationFrame(animationId);
    }, [customization, scale]);

    return (
      <canvas
        ref={canvasRef}
        onClick={() => {
          triggerDeathRef.current = true;
          import('./services/audioService').then(m => m.audio.playDie(customization.deathSound));
        }}
        width={96 * scale}
        height={96 * scale}
        className="w-full h-full object-contain block image-pixelated cursor-pointer"
      />
    );
  },
);

const ItemPreview = ({ 
  item, 
  customization 
}: { 
  item: any, 
  customization: PlayerCustomization 
}) => {
  const previewCustom = {
    ...customization,
    [item.type]: item.id
  };

  return (
    <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden flex items-center justify-center p-0 shadow-inner group-hover:border-neutral-600 transition-colors">
       <div className="w-16 h-16">
         <CharacterPreview customization={previewCustom} scale={3} />
       </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.DE);
  const [level, setLevel] = useState<LevelData>(INITIAL_LEVELS[0]);

  const [customization, setCustomization] = useState<PlayerCustomization>(
    DEFAULT_CUSTOMIZATION,
  );
  const [customizationP2, setCustomizationP2] = useState<PlayerCustomization>({
    ...DEFAULT_CUSTOMIZATION,
    color: "#00ff88",
    trailColor: "#00ff88",
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    const stored = localStorage.getItem("ragecube_settings");
    const defaultKeybindingsP1: Keybindings = {
      up: ["KeyW", "GP_B0", "GP_B12"],
      down: ["KeyS", "GP_B13"],
      left: ["KeyA", "GP_B14"],
      right: ["KeyD", "GP_B15"],
      action: ["KeyQ", "GP_B2"],
      dash: ["KeyF", "GP_B1"],
    };
    const defaultKeybindingsP2: Keybindings = {
      up: ["ArrowUp", "GP_B0", "GP_B12"],
      down: ["ArrowDown", "GP_B13"],
      left: ["ArrowLeft", "GP_B14"],
      right: ["ArrowRight", "GP_B15"],
      action: ["ControlRight", "Numpad0", "GP_B2"],
      dash: ["ShiftRight", "GP_B1"],
    };

    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.musicVolume !== 'number' || isNaN(parsed.musicVolume)) parsed.musicVolume = 0.3;
      if (typeof parsed.sfxVolume !== 'number' || isNaN(parsed.sfxVolume)) parsed.sfxVolume = 0.5;
      if (typeof parsed.deathVolume !== 'number' || isNaN(parsed.deathVolume)) parsed.deathVolume = 0.5;
      if (typeof parsed.showGhost !== 'boolean') parsed.showGhost = true;
      if (typeof parsed.editorEdgeScroll !== 'boolean') parsed.editorEdgeScroll = true;
      if (typeof parsed.editorScrollSpeed !== 'number' || isNaN(parsed.editorScrollSpeed)) parsed.editorScrollSpeed = 350;
      if (typeof parsed.uiScale !== 'number' || isNaN(parsed.uiScale)) parsed.uiScale = 1;
      if (typeof parsed.playerName !== 'string') parsed.playerName = "";
      if (typeof parsed.opponentOpacity !== 'number' || isNaN(parsed.opponentOpacity)) parsed.opponentOpacity = 0.5;
      if (typeof parsed.resolutionScale !== 'number' || isNaN(parsed.resolutionScale)) parsed.resolutionScale = 1080;
      if (!parsed.keybindingsP1) parsed.keybindingsP1 = defaultKeybindingsP1;
      else if (!parsed.keybindingsP1.dash) parsed.keybindingsP1.dash = defaultKeybindingsP1.dash;
      
      if (!parsed.keybindingsP2) parsed.keybindingsP2 = defaultKeybindingsP2;
      else if (!parsed.keybindingsP2.dash) parsed.keybindingsP2.dash = defaultKeybindingsP2.dash;
      return parsed;
    }
    return {
      musicVolume: 0.3,
      sfxVolume: 0.5,
      deathVolume: 0.5,
      fpsCap: 60,
      uiScale: 1,
      showGhost: true,
      resolutionScale: 1080,
      editorEdgeScroll: true,
      editorScrollSpeed: 350,
      playerName: "",
      opponentOpacity: 0.5,
      keybindingsP1: defaultKeybindingsP1,
      keybindingsP2: defaultKeybindingsP2,
    };
  });
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [playerName, setPlayerName] = useState(() => settings.playerName || "");

  // Custom Levels from Editor
  const [customLevels, setCustomLevels] = useState<LevelData[]>([]);

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isRainbowUnlocked, setIsRainbowUnlocked] = useState(false);
  const [isInvisibleUnlocked, setIsInvisibleUnlocked] = useState(false);
  const [isCoffeeUnlocked, setIsCoffeeUnlocked] = useState(false);
  const [isMatrixUnlocked, setIsMatrixUnlocked] = useState(false);
  const [isVoidUnlocked, setIsVoidUnlocked] = useState(false);

  useEffect(() => {
    const lowerColor = customization.color.toLowerCase();
    if (lowerColor === "#130009") {
      if (!isAdminUnlocked) {
        setIsAdminUnlocked(true);
        audio.playSfx("secret");
      }
    } else if (lowerColor === "#ff0080") {
      if (!isRainbowUnlocked) {
        setIsRainbowUnlocked(true);
        audio.playSfx("secret");
        setCustomization(prev => ({ ...prev, accessory: 'unicorn' }));
      }
    } else if (lowerColor === "#ffffff") {
      if (!isInvisibleUnlocked) {
        setIsInvisibleUnlocked(true);
        audio.playSfx("secret");
      }
    } else if (lowerColor === "#c0ffee") {
      if (!isCoffeeUnlocked) {
        setIsCoffeeUnlocked(true);
        audio.playSfx("secret");
      }
    } else if (lowerColor === "#00ff00") {
      if (!isMatrixUnlocked) {
        setIsMatrixUnlocked(true);
        audio.playSfx("secret");
      }
    } else if (lowerColor === "#000000") {
      if (!isVoidUnlocked) {
        setIsVoidUnlocked(true);
        audio.playSfx("secret");
      }
    } else {
      if (isAdminUnlocked) setIsAdminUnlocked(false);
      if (isRainbowUnlocked) setIsRainbowUnlocked(false);
      if (isInvisibleUnlocked) setIsInvisibleUnlocked(false);
      if (isCoffeeUnlocked) setIsCoffeeUnlocked(false);
      if (isMatrixUnlocked) setIsMatrixUnlocked(false);
      if (isVoidUnlocked) setIsVoidUnlocked(false);
    }
  }, [customization.color, isAdminUnlocked, isRainbowUnlocked, isInvisibleUnlocked, isCoffeeUnlocked, isMatrixUnlocked, isVoidUnlocked]);

  // Editor State
  const [editorData, setEditorData] = useState<LevelData | null>(null);
  const [editorVerified, setEditorVerified] = useState(false);
  // Persist Editor History when testing
  const [editorHistory, setEditorHistory] = useState<{
    history: Entity[][];
    index: number;
  } | null>(null);

  // Menu navigation state
  const [menuSelection, setMenuSelection] = useState(0);
  const [editingKey, setEditingKey] = useState<{
    player: 1 | 2;
    action: keyof Keybindings;
  } | null>(null);

  const lastRemapGPState = useRef<boolean[]>([]);
  const handleGamepadRebind = useCallback((btnCode: string) => {
    if (!editingKey) return;
    const { player, action } = editingKey;
    const key = player === 1 ? "keybindingsP1" : "keybindingsP2";
    
    setSettings(p => {
      const current = p[key] || {};
      const existing = current[action] || [];
      // Keep keyboard keys, replace GP_ bindings
      const newBindings = [...existing.filter(k => !k.startsWith("GP_")), btnCode];
      return {
        ...p,
        [key]: { ...current, [action]: newBindings }
      };
    });
    setEditingKey(null);
  }, [editingKey]);

  useEffect(() => {
    if (!editingKey) {
      lastRemapGPState.current = [];
      return;
    }

    let rafId: number;
    const poll = () => {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp) continue;

        gp.buttons.forEach((btn, bIdx) => {
          if (btn.pressed && !lastRemapGPState.current[bIdx]) {
            handleGamepadRebind(`GP_B${bIdx}`);
          }
        });

        // Simple Axes detection for stick remapping if desired
        // (X: 0, Y: 1)
        gp.axes.forEach((val, aIdx) => {
           // We only rebind axes if they are pushed far
           if (Math.abs(val) > 0.8) {
              const axisCode = `GP_AXIS_${aIdx}_${val > 0 ? 'POS' : 'NEG'}`;
              // We need a way to debounce axes?
              // For now let's just stick to buttons as it's more reliable for simple remapping.
              // Actually D-pad is usually buttons.
           }
        });

        lastRemapGPState.current = gp.buttons.map(b => b.pressed);
      }
      rafId = requestAnimationFrame(poll);
    };

    rafId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafId);
  }, [editingKey, handleGamepadRebind]);
  const [highscoreLevelIndex, setHighscoreLevelIndex] = useState(0);
  const [globalScores, setGlobalScores] = useState<LeaderboardEntry[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<LevelData[]>([]);

  const toggleLevelSelection = (lvl: LevelData) => {
    setSelectedLevels((prev) => {
      const exists = prev.find((s) => s.id === lvl.id);
      if (exists) {
        return prev.filter((s) => s.id !== lvl.id);
      } else {
        return [...prev, lvl];
      }
    });
  };

  const [cheatBuffer, setCheatBuffer] = useState("");

  const unlockEverything = () => {
    // Unlock all shop items
    const allDeathAnims = SHOP_ITEMS.filter(i => i.type === 'deathAnim').map(i => i.id);
    const allDeathSounds = SHOP_ITEMS.filter(i => i.type === 'deathSound').map(i => i.id);
    const allTrails = SHOP_ITEMS.filter(i => i.type === 'trailType').map(i => i.id);
    const allEyes = SHOP_ITEMS.filter(i => i.type === 'eyes').map(i => i.id);
    const allAccessories = SHOP_ITEMS.filter(i => i.type === 'accessory').map(i => i.id);

    setCustomization(p => ({
      ...p,
      unlockedDeathAnims: Array.from(new Set([...(p.unlockedDeathAnims || []), ...allDeathAnims])),
      unlockedDeathSounds: Array.from(new Set([...(p.unlockedDeathSounds || []), ...allDeathSounds])),
      unlockedTrails: Array.from(new Set([...(p.unlockedTrails || []), ...allTrails])),
      unlockedEyes: Array.from(new Set([...(p.unlockedEyes || []), ...allEyes])),
      unlockedAccessories: Array.from(new Set([...(p.unlockedAccessories || []), ...allAccessories])),
      coins: p.coins + 999999 // Give a massive coin boost
    }));

    // Unlock all achievements
    const allAchievementIds = ACHIEVEMENTS_LIST.map(a => a.id);
    setGameState(p => ({
      ...p,
      unlockedAchievements: allAchievementIds
    }));

    showToast("🔓 ADMIN UNLOCK ACTIVATED!");
    audio.playSfx('goal');
  };

  // Source Toggle for VS Mode and Highscores ('beginner', 'advanced', 'expert', 'god', 'custom', 'brawler', 'builtin')
  const [levelSource, setLevelSource] = useState<
    | "beginner"
    | "advanced"
    | "expert"
    | "god"
    | "custom"
    | "brawler"
    | "builtin"
    | "global"
  >("beginner");

  // Sorting
  const [levelSortMode, setLevelSortMode] = useState<SortMode>("date");

  const [brawlerPowerups, setBrawlerPowerups] = useState<
    Record<string, number>
  >({
    powerup_ice_block: 100,
    powerup_slime_block: 100,
    powerup_fireball: 100,
    powerup_teleport: 100,
    powerup_triple_jump: 100,
    powerup_bomb: 100,
    powerup_shield: 100,
    powerup_steal: 100,
    powerup_slow: 100,
    powerup_melee: 100,
    powerup_shrink: 100,
    powerup_grow: 100,
  });
  const [brawlerTeamMode, setBrawlerTeamMode] =
    useState<BrawlerTeamMode>("TEAMS");
  const [brawlerTeam1, setBrawlerTeam1] = useState<number>(0);
  const [brawlerTeam2, setBrawlerTeam2] = useState<number>(1);
  const [brawlerHazardMode, setBrawlerHazardMode] =
    useState<BrawlerHazardMode>("none");
  const [brawlerSuddenDeath, setBrawlerSuddenDeath] = useState<boolean>(true);
  const [currentVote, setCurrentVote] = useState<VoteData | null>(null);
  const [shopTab, setShopTab] = useState<"effects" | "cosmetics" | "sounds">("effects");
  const [hoveredShopItem, setHoveredShopItem] = useState<any>(null);

  const [gameState, setGameState] = useState<GameState>({
    status: "menu",
    currentLevelIndex: 0,
    deaths: 0,
    levelDeaths: 0,
    time: 0,
    levelTime: 0,
    score: 0,
    levelStartScore: 0, // Snapshot of score at level start for resets
    lastRoast: "",
    collectedCoins: [], // IDs of collected coins
    customLevelsQueue: undefined, // For Random Run
    blocksPlaced: 0, // Track for achievements
    totalJumps: 0, // Track for achievements
    hooksUsed: 0, // Track for achievements
    unlockedAchievements: [],
    winner: undefined, // For VS mode
    onlineWins: 0,
    levelsPlayedCount: 0,
    playedLevelIds: [],
    totalBlocksPlaced: 0,
    totalCoinsCollected: 0,
    flawlessLevelsCount: 0,
    chatMessagesSent: 0,
    brawlerLevelsPlayedCount: 0,
    editorTime: 0,
    collisionEnabled: true,
    isSpectating: false,
    spectateTargetId: undefined,
  });

  // Track Difficulty for Story Mode flow
  const [selectedDifficultySet, setSelectedDifficultySet] =
    useState<LevelData[]>(INITIAL_LEVELS);

  const [respawnTrigger, setRespawnTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);

  const [onlineLobbyInput, setOnlineLobbyInput] = useState("");
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [onlineSuggestions, setOnlineSuggestions] = useState<any[]>([]);
  const [showSuggestionMenu, setShowSuggestionMenu] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [onlineError, setOnlineError] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Debouncing refs
  const lastDeathTime = useRef(0);
  const processedCoins = useRef<Set<string>>(new Set());

  // --- STATE REF PATTERN FOR PERFORMANCE ---
  const stateRef = useRef({
    gameState,
    menuSelection,
    editingKey,
    level,
    customLevels,
    settings,
    customization,
    playerName,
    highscoreLevelIndex,
    selectedDifficultySet,
    levelSource,
    respawnTrigger,
    brawlerPowerups,
    showJoinPrompt,
    showDeleteConfirm,
    sortedCustomLevels: [] as LevelData[],
    unlockEverything,
  });

  const t = TRANSLATIONS[lang];

  // Initialize Audio
  useEffect(() => {
    const handleInitAudio = () => {
      audio.init();
    };
    window.addEventListener("click", handleInitAudio, { once: true });
    window.addEventListener("keydown", handleInitAudio, { once: true });
  }, []);

  useEffect(() => {
    localStorage.setItem("ragecube_settings", JSON.stringify(settings));
    audio.setVolumes(settings.musicVolume, settings.sfxVolume, settings.deathVolume);
    document.documentElement.style.fontSize = `${(settings.uiScale || 1) * 16}px`;
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(
      "ragecube_customization",
      JSON.stringify(customization),
    );
    if (onlineService.lobbyCode) {
      updateOnlineCustomization(customization);
    }
  }, [customization]);

  // Load Highscores & Custom Levels & Achievements
  useEffect(() => {
    const storedScores = localStorage.getItem("ragecube_highscores_v2");
    if (storedScores) setHighScores(JSON.parse(storedScores));

    const storedCustomization = localStorage.getItem("ragecube_customization");
    if (storedCustomization) setCustomization(JSON.parse(storedCustomization));

    const storedLevels = localStorage.getItem("ragecube_custom_levels");
    if (storedLevels) setCustomLevels(JSON.parse(storedLevels));

    const storedAch = localStorage.getItem("ragecube_achievements");
    if (storedAch)
      setGameState((p) => ({
        ...p,
        unlockedAchievements: JSON.parse(storedAch),
      }));

    const storedStats = localStorage.getItem("ragecube_stats");
    if (storedStats) {
      const stats = JSON.parse(storedStats);
      setGameState((p) => ({
        ...p,
        totalBlocksPlaced: stats.totalBlocksPlaced || 0,
        totalCoinsCollected: stats.totalCoinsCollected || 0,
        flawlessLevelsCount: stats.flawlessLevelsCount || 0,
        onlineWins: stats.onlineWins || 0,
        chatMessagesSent: stats.chatMessagesSent || 0,
        levelsPlayedCount: stats.levelsPlayedCount || 0,
        playedLevelIds: stats.playedLevelIds || [],
        totalJumps: stats.totalJumps || 0,
        brawlerLevelsPlayedCount: stats.brawlerLevelsPlayedCount || 0,
        editorTime: stats.editorTime || 0,
      }));
    }
  }, []);

  const checkAchievements = useCallback(
    (stats: any) => {
      const newUnlocked = [...gameState.unlockedAchievements];
      const unlockedCount = newUnlocked.length;
      let added = false;

      // Check conditions
      ACHIEVEMENTS_LIST.forEach((ach) => {
        if (
          !newUnlocked.includes(ach.id) &&
          ach.condition({ ...stats, unlockedCount })
        ) {
          newUnlocked.push(ach.id);
          setAchievementToast(ach);
          audio.playWin(); // Re-use win sound for achievement
          setTimeout(() => setAchievementToast(null), 4000);
          added = true;
        }
      });

      if (added) {
        setGameState((p) => ({ ...p, unlockedAchievements: newUnlocked }));
        localStorage.setItem(
          "ragecube_achievements",
          JSON.stringify(newUnlocked),
        );
      }

      // Persist stats whenever they change (or just here for simplicity if stats are passed)
      const statsToSave = {
        totalBlocksPlaced:
          stats.totalBlocksPlaced || gameState.totalBlocksPlaced,
        totalCoinsCollected:
          stats.totalCoinsCollected || gameState.totalCoinsCollected,
        flawlessLevelsCount:
          stats.flawlessLevelsCount || gameState.flawlessLevelsCount,
        onlineWins: stats.onlineWins || gameState.onlineWins,
        chatMessagesSent: stats.chatMessagesSent || gameState.chatMessagesSent,
        levelsPlayedCount:
          stats.levelsPlayedCount || gameState.levelsPlayedCount,
        playedLevelIds: stats.playedLevelIds || gameState.playedLevelIds,
        totalJumps: stats.totalJumps || gameState.totalJumps,
        brawlerLevelsPlayedCount: stats.brawlerLevelsPlayedCount || gameState.brawlerLevelsPlayedCount,
        editorTime: stats.editorTime || gameState.editorTime,
      };
      localStorage.setItem("ragecube_stats", JSON.stringify(statsToSave));
    },
    [
      gameState.unlockedAchievements,
      gameState.totalBlocksPlaced,
      gameState.totalCoinsCollected,
      gameState.flawlessLevelsCount,
      gameState.onlineWins,
      gameState.chatMessagesSent,
      gameState.levelsPlayedCount,
      gameState.playedLevelIds,
      gameState.totalJumps,
      gameState.brawlerLevelsPlayedCount,
      gameState.editorTime,
      audio,
    ],
  );

  useEffect(() => {
    if (isAdminUnlocked) checkAchievements({ adminDesignUnlocked: true });
    if (isRainbowUnlocked) checkAchievements({ rainbowDesignUnlocked: true });
    if (isInvisibleUnlocked) checkAchievements({ ghostDesignUnlocked: true });
    if (isCoffeeUnlocked) checkAchievements({ coffeeDesignUnlocked: true });
    if (isMatrixUnlocked) checkAchievements({ matrixDesignUnlocked: true });
    if (isVoidUnlocked) checkAchievements({ voidDesignUnlocked: true });
  }, [isAdminUnlocked, isRainbowUnlocked, isInvisibleUnlocked, isCoffeeUnlocked, isMatrixUnlocked, isVoidUnlocked, checkAchievements]);

  // Track Editor Time
  useEffect(() => {
    let interval: any;
    if (gameState.status === "editor") {
      interval = setInterval(() => {
        setGameState((p) => {
          const nextEditorTime = (p.editorTime || 0) + 1;
          // Check for worker achievement here too? 
          // Better to keep checkAchievements for win/start/death etc.
          // But 30 mins is a long time, let's check it every minute
          if (nextEditorTime % 60 === 0) {
            checkAchievements({
              editorTime: nextEditorTime,
            });
          }
          return { ...p, editorTime: nextEditorTime };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.status, checkAchievements]);

  const [onlineFinishTimer, setOnlineFinishTimer] = useState<number | null>(
    null,
  );
  const [onlineResults, setOnlineResults] = useState<any[]>([]);

  // Memoized Sorted Custom Levels
  const sortedCustomLevels = React.useMemo(() => {
    return [...customLevels].sort((a, b) => {
      if (levelSortMode === "name") return a.name.localeCompare(b.name);
      if (levelSortMode === "played")
        return (b.lastPlayed || 0) - (a.lastPlayed || 0);
      // Date sort (extract timestamp from ID or fallback)
      const getTs = (id: string) => {
        const parts = id.split("_");
        const ts = parseInt(parts[parts.length - 1]);
        return isNaN(ts) ? 0 : ts;
      };
      return getTs(b.id) - getTs(a.id);
    });
  }, [customLevels, levelSortMode]);

  // Sync Ref with State
  useEffect(() => {
    stateRef.current = {
      gameState,
      menuSelection,
      editingKey,
      level,
      customLevels,
      sortedCustomLevels, // Use the memoized version
      settings,
      customization,
      playerName,
      highscoreLevelIndex,
      selectedDifficultySet,
      levelSource,
      respawnTrigger,
      showJoinPrompt,
      showDeleteConfirm,
      brawlerPowerups,
      unlockEverything,
    };
  });

  useEffect(() => {
    if (gameState.status === "highscores" && levelSource === "global") {
      const fetchGlobal = async () => {
        setIsLoadingScores(true);
        const activeList = INITIAL_LEVELS; // Default to story levels for global
        const idx = Math.min(
          Math.max(0, highscoreLevelIndex),
          Math.max(0, activeList.length - 1),
        );
        const currentLvl = activeList[idx];
        const scores = await leaderboardService.getTopScores(currentLvl.id);
        setGlobalScores(scores);
        setIsLoadingScores(false);
      };
      fetchGlobal();
    }
  }, [gameState.status, levelSource, highscoreLevelIndex]);

  // Unlock Helper
  const isUnlocked = (type: "eyes" | "accessory" | "trail" | "brawlerClass", id: string) => {
    if (type === "brawlerClass") return true;

    if (type === "accessory" && id === "unicorn") return isRainbowUnlocked;

    // Check achievement rewards FIRST
    const ach = ACHIEVEMENTS_LIST.find(
      (a) => a.rewardType === type && a.rewardId === id,
    );
    if (ach) {
      return gameState.unlockedAchievements.includes(ach.id);
    }

    // Default items
    if (["normal", "angry", "derp", "cyclops"].includes(id) && type === "eyes")
      return true;
    if (
      ["none", "crown", "horns", "headband"].includes(id) &&
      type === "accessory"
    )
      return true;

    // Check if it's a shop item
    const shopItem = SHOP_ITEMS.find((s) => s.type === type && s.id === id);
    if (shopItem && shopItem.price > 0) {
      if (type === "eyes") return (customization.unlockedEyes || []).includes(id);
      if (type === "accessory") return (customization.unlockedAccessories || []).includes(id);
      if (type === "trail") return (customization.unlockedTrails || []).includes(id);
    }

    // Default colors always unlocked, specific trails might be locked
    if (type === "trail" && id.startsWith("#")) {
      return true; // Simple hex colors usually unlocked
    }

    return true;
  };

  const getLockReason = (type: "eyes" | "accessory" | "trail", id: string) => {
    const ach = ACHIEVEMENTS_LIST.find(
      (a) => a.rewardType === type && a.rewardId === id,
    );
    if (ach) {
      return `ACHIEVEMENT: ${(t.achievements_data as any)?.[ach.id]?.title || ach.title}`;
    }
    
    // Legacy support just in case
    if (id === "#ff4400" && type === "trail") return "HASEN-POWER: 1000 SPRÜNGE";
    if (id === "rainbow" && type === "trail") return "EDITOR GOTT: LEVEL VERIFIZIERT";

    const shopItem = SHOP_ITEMS.find((s) => s.type === type && s.id === id);
    if (shopItem && shopItem.price > 0) {
       return `${shopItem.price} COINS (SHOP)`;
    }

    return "STANDARD";
  };

  // Save Custom Levels
  const handleSaveLevel = (newLevel: LevelData) => {
    const existingIndex = customLevels.findIndex((l) => l.id === newLevel.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...customLevels];
      updated[existingIndex] = newLevel;
    } else {
      updated = [...customLevels, newLevel];
    }

    setCustomLevels(updated);
    localStorage.setItem("ragecube_custom_levels", JSON.stringify(updated));
    setEditorData(null);
    setEditorHistory(null);
    setEditorVerified(false);
    setGameState((p) => ({ ...p, status: "menu" }));

    if (newLevel.isVerified) {
      checkAchievements({ verifiedLevel: true });
    }
  };

  const handleImportLevel = (newLevels: LevelData[]) => {
    setCustomLevels((prev) => {
      const updated = [...prev, ...newLevels];
      localStorage.setItem("ragecube_custom_levels", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteLevel = (id: string) => {
    setCustomLevels((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      localStorage.setItem("ragecube_custom_levels", JSON.stringify(updated));

      // If deleted the last item, or the selection is now out of bounds
      if (updated.length === 0) {
        setMenuSelection(0);
      } else if (menuSelection >= updated.length) {
        setMenuSelection(updated.length - 1);
      }
      return updated;
    });
  };

  const handleEditLevel = (levelToEdit: LevelData) => {
    setEditorData(levelToEdit);
    setEditorHistory(null);
    setEditorVerified(false);
    setGameState((p) => ({ ...p, status: "editor" }));
  };

  const playSingleCustomLevel = (levelData: LevelData) => {
    const updatedLevel = { ...levelData, lastPlayed: Date.now() };
    const newLevels = customLevels.map((l) =>
      l.id === levelData.id ? updatedLevel : l,
    );

    setCustomLevels(newLevels);
    localStorage.setItem("ragecube_custom_levels", JSON.stringify(newLevels));

    setLevel(updatedLevel);
    processedCoins.current.clear();
    setGameState(prev => ({
      ...prev,
      status: "random_run",
      currentLevelIndex: 0,
      deaths: 0,
      levelDeaths: 0,
      time: 0,
      levelTime: 0,
      score: 0,
      levelStartScore: 0,
      lastRoast: "",
      collectedCoins: [],
      customLevelsQueue: [updatedLevel],
      blocksPlaced: 0,
      totalJumps: prev.totalJumps,
      hooksUsed: prev.hooksUsed,
      unlockedAchievements: prev.unlockedAchievements,
    }));
    setRespawnTrigger(0);
  };

  // Timer & Input
  useEffect(() => {
    let interval: number;
    const playingStates = [
      "playing",
      "random_run",
      "tutorial",
      "testing",
      "brawler_testing",
      "vs_playing",
      "brawler_playing",
    ];

    const menuStates = [
      "menu",
      "online_menu",
      "online_lobby",
      "customizing",
      "shop",
      "highscores",
      "settings",
      "level_select",
      "credits",
      "vs_setup",
      "brawler_setup",
      "brawler_powerup_setup",
      "editor_test_select"
    ];

    if (playingStates.includes(gameState.status)) {
      interval = window.setInterval(() => {
        if (onlineService.isPaused) return;
        setGameState((prev) => ({
          ...prev,
          time: prev.time + 1,
          levelTime: prev.levelTime + 1,
        }));
      }, 1000);

      // Check Marathon Achievement (10 mins = 600s)
      if (gameState.time >= 600) {
        checkAchievements({ time: gameState.time });
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.status]);

  // Brawler Powerup Spawning
  useEffect(() => {
    if (gameState.status !== "brawler_playing") return;

    // Only host spawns in online mode
    if (onlineService.lobbyCode && !onlineService.isHost) return;

    const spawnInterval = setInterval(() => {
      if (onlineService.isPaused) return;
      setLevel((currentLevel) => {
        // Count existing powerups
        const powerupCount = currentLevel.entities.filter((e) =>
          e.type.startsWith("powerup_"),
        ).length;
        if (powerupCount >= 20) return currentLevel; // Slight limit to prevent overflow

        // Get enabled powerups from brawler settings
        const enabledPowerups = Object.keys(brawlerPowerups).filter(
          (k) => brawlerPowerups[k] > 0,
        );
        if (enabledPowerups.length === 0) return currentLevel;

        const randomType = enabledPowerups[
          Math.floor(Math.random() * enabledPowerups.length)
        ] as EntityType;

        // Find spawn bounds based on walls
        let minX = 100,
          maxX = 700,
          minY = 100,
          maxY = 500;
        const walls = currentLevel.entities.filter((e) => e.type === "wall");
        if (walls.length > 0) {
          minX = Math.min(...walls.map((e) => e.x)) + 40;
          maxX = Math.max(...walls.map((e) => e.x + e.w)) - 40;
          minY = Math.min(...walls.map((e) => e.y)) + 40;
          maxY = Math.max(...walls.map((e) => e.y + e.h)) - 40;
        }

        // Ensure bounds are valid
        if (maxX <= minX) {
          minX = 100;
          maxX = 700;
        }
        if (maxY <= minY) {
          minY = 100;
          maxY = 500;
        }

        const newPowerup: Entity = {
          id: `spawned_${Date.now()}`,
          type: randomType,
          x: minX + Math.random() * (maxX - minX - 20),
          y: minY + Math.random() * (maxY - minY - 20),
          w: 20,
          h: 20,
        };

        const updatedLevel = {
          ...currentLevel,
          entities: [...currentLevel.entities, newPowerup],
        };

        // Broadcast if online host
        if (onlineService.lobbyCode && onlineService.isHost) {
          onlineService.broadcastLobbyState(
            undefined,
            updatedLevel,
            undefined,
            brawlerTeamMode,
            brawlerHazardMode,
          );
        }

        return updatedLevel;
      });
    }, 5000); // 5 seconds

    return () => clearInterval(spawnInterval);
  }, [gameState.status, brawlerPowerups]);

  // Reset selection on state change
  useEffect(() => {
    const resetStates = [
      "menu",
      "custom_level_select",
      "customizing",
      "difficulty_select",
      "paused",
      "online_menu",
      "online_lobby",
      "online_summary",
      "won",
      "vs_won",
      "brawler_won",
      "settings",
      "keybindings",
      "highscores",
    ];
    if (resetStates.includes(gameState.status)) {
      setMenuSelection(0);
    }
  }, [gameState.status]);

  // Unified color updater for P1 or P2
  const updateColorRGB = (
    player: 1 | 2,
    field: "color" | "trailColor",
    channel: "r" | "g" | "b",
    delta: number,
  ) => {
    const setter = player === 1 ? setCustomization : setCustomizationP2;
    setter((p) => {
      const currentHex = p[field];
      const rgb = hexToRgb(currentHex === "rainbow" ? "#ff0044" : currentHex);
      rgb[channel] = Math.max(0, Math.min(255, rgb[channel] + delta));
      return { ...p, [field]: rgbToHex(rgb.r, rgb.g, rgb.b) };
    });
  };

  const setExactRGB = (
    player: 1 | 2,
    field: "color" | "trailColor",
    channel: "r" | "g" | "b",
    value: number,
  ) => {
    const setter = player === 1 ? setCustomization : setCustomizationP2;
    setter((p) => {
      const currentHex = p[field];
      // Allow editing rainbow (resets to color)
      const rgb = hexToRgb(currentHex === "rainbow" ? "#ff0044" : currentHex);
      rgb[channel] = Math.max(0, Math.min(255, value));
      return { ...p, [field]: rgbToHex(rgb.r, rgb.g, rgb.b) };
    });
  };

  // Core functions accessed by ref
  const handleRetry = () => {
    const st = stateRef.current;

    // Strict Reset for current level context
    processedCoins.current.clear();

    setGameState((prev) => ({
      ...prev,
      status: prev.customLevelsQueue ? "random_run" : "playing",
      levelTime: 0,
      levelDeaths: 0,
      // Reset score to what it was when level started (undo penalties/gains)
      score: prev.levelStartScore,
      collectedCoins: [], // Clear coins collected in this level
      blocksPlaced: 0, // Reset blocks for this run segment
    }));
    setRespawnTrigger((p) => p + 1);
    setResetTrigger((p) => p + 1);
  };

  const startStoryGame = (levelSet: LevelData[] = INITIAL_LEVELS) => {
    setSelectedDifficultySet(levelSet);
    setLevel(levelSet[0]);
    processedCoins.current.clear();
    setGameState(prev => ({
      ...prev,
      status: "playing",
      currentLevelIndex: 0,
      deaths: 0,
      levelDeaths: 0,
      time: 0,
      levelTime: 0,
      score: 0,
      levelStartScore: 0,
      lastRoast: "",
      collectedCoins: [],
      blocksPlaced: 0,
      totalJumps: prev.totalJumps,
      hooksUsed: prev.hooksUsed,
      unlockedAchievements: prev.unlockedAchievements,
    }));
    setRespawnTrigger(0);
  };

  const handleNextLevel = () => {
    const currentState = stateRef.current.gameState;
    const nextIdx = currentState.currentLevelIndex + 1;
    const collection = currentState.customLevelsQueue || stateRef.current.selectedDifficultySet;

    if (nextIdx < collection.length) {
      const nextLevel = collection[nextIdx];
      setLevel(nextLevel);
      processedCoins.current.clear(); // Reset coins for new level

      setOnlineResults([]);
      setOnlineFinishTimer(null);
      setCurrentVote(null);

      if (onlineService.lobbyCode && onlineService.isHost) {
        (async () => {
          await onlineService.broadcastLobbyState(
            undefined,
            nextLevel,
            undefined,
            brawlerTeamMode,
            brawlerHazardMode,
            undefined,
            nextIdx,
          );
          await onlineService.startGame(); // Ensure everyone transitions to playing
        })();
      }

      setGameState((prev) => {
        let nextStatus: GameState["status"] = "playing";
        if (prev.customLevelsQueue) {
          if (prev.onlineMode === "vs") nextStatus = "vs_playing";
          else if (prev.onlineMode === "brawler")
            nextStatus = "brawler_playing";
          else if (
            prev.status === "vs_won" ||
            prev.previousStatus === "vs_playing"
          )
            nextStatus = "vs_playing";
          else if (
            prev.status === "brawler_won" ||
            prev.previousStatus === "brawler_playing"
          )
            nextStatus = "brawler_playing";
          else nextStatus = "random_run";
        }

        return {
          ...prev,
          status: nextStatus,
          currentLevelIndex: nextIdx,
          levelTime: 0,
          levelDeaths: 0,
          blocksPlaced: 0,
          collectedCoins: [], // Clear coins
          // IMPORTANT: Snapshot total score at start of new level
          levelStartScore: prev.score,
          time: prev.time, // Keep total time
        };
      });
      setRespawnTrigger((p) => p + 1);
    } else {
      setGameState((prev) => ({ ...prev, status: "menu" }));
    }
  };

  const toggleFavorite = (type: 'skin' | 'trail', id: string) => {
    setSettings(prev => {
      const field = type === 'skin' ? 'favoriteSkins' : 'favoriteTrails' as keyof GameSettings;
      const existing = (prev as any)[field] || [];
      const updated = existing.includes(id) 
        ? existing.filter((x: string) => x !== id) 
        : [...existing, id];
      return { ...prev, [field]: updated };
    });
  };

  const rotateOption = (
    player: 1 | 2,
    type: "eyes" | "accessory" | "trail" | "brawlerClass",
    dir: 1 | -1,
  ) => {
    const setter = player === 1 ? setCustomization : setCustomizationP2;
    setter((prev) => {
      let options: string[] = [];
      let current = "";

      if (type === "eyes") {
        options = EYE_OPTIONS;
        current = prev.eyes;
      }
      if (type === "accessory") {
        options = ACC_OPTIONS;
        current = prev.accessory;
      }
      if (type === "brawlerClass") {
        options = BRAWLER_CLASS_OPTIONS as unknown as string[];
        current = prev.brawlerClass || "standard";
      }

      if (type === "trail") {
        // Trail logic
        const currentVal = prev.trailColor;
        let currentIndex = TRAIL_PRESETS.findIndex((p) => p.val === currentVal);

        let attempts = TRAIL_PRESETS.length;
        let nextIndex = currentIndex;
        let nextVal = currentVal;

        while (attempts > 0) {
          nextIndex =
            (nextIndex + dir + TRAIL_PRESETS.length) % TRAIL_PRESETS.length;
          // Handle wrapping if coming from custom (-1)
          if (currentIndex === -1) {
            nextIndex = dir > 0 ? 0 : TRAIL_PRESETS.length - 1;
          }

          const potential = TRAIL_PRESETS[nextIndex];
          if (isUnlocked("trail", potential.val)) {
            nextVal = potential.val;
            break;
          }
          attempts--;

          // Update for loop
          currentIndex = nextIndex;
        }
        return { ...prev, trailColor: nextVal };
      }

      let idx = options.indexOf(current);
      if (idx === -1) idx = 0;

      let attempts = options.length;
      let nextVal = current;

      while (attempts > 0) {
        idx = (idx + dir + options.length) % options.length;
        const potential = options[idx];
        if (isUnlocked(type, potential)) {
          nextVal = potential;
          break;
        }
        attempts--;
      }

      return { ...prev, [type]: nextVal };
    });
  };

  const resolveVote = () => {
    const st = stateRef.current;
    
    // Fallback to onlineService.currentVote since stateRef doesn't have it
    const currentVoteCopy = currentVote || onlineService.currentVote;
    if (!currentVoteCopy) return;

    setCurrentVote(null);
    if (onlineService.currentVote) {
      onlineService.currentVote = null;
    }

    const votes = currentVoteCopy.votes;
    const ids = Object.keys(votes);
    let yesCount = 0;
    let noCount = 0;

    ids.forEach((id) => {
      if (votes[id] === "yes") yesCount++;
      else noCount++;
    });

    const totalPlayers = Array.from(onlineService.players.values()).length;
    const success = yesCount > noCount && yesCount > 0;

    if (success) {
      // System message about success
      onlineService.sendChatMessage(`VOTE PASSED: ${currentVoteCopy.type.toUpperCase()} (${yesCount} vs ${noCount})`);

      if (currentVoteCopy.type === "next" || currentVoteCopy.type === "skip") {
        handleNextLevel();
      } else if (currentVoteCopy.type === "repeat" || currentVoteCopy.type === "restart") {
        setOnlineResults([]);
        setOnlineFinishTimer(null);
        onlineService.startGame();
        setGameState((prev) => ({
          ...prev,
          status:
            prev.onlineMode === "vs"
              ? "vs_playing"
              : prev.onlineMode === "brawler"
                ? "brawler_playing"
                : "playing",
          levelTime: 0,
          levelDeaths: 0,
          blocksPlaced: 0,
          collectedCoins: [],
        }));
        setRespawnTrigger((t) => t + 1);
      } else if (currentVoteCopy.type === "kick" && currentVoteCopy.targetId) {
        onlineService.kickPlayer(currentVoteCopy.targetId);
      }
    } else {
      // System message about failure
      onlineService.sendChatMessage(`VOTE FAILED: ${currentVoteCopy.type.toUpperCase()} (${yesCount} vs ${noCount})`);
    }

    if (onlineService.isHost) {
      onlineService.clearVote();
    }
  };

  const handleKeyboardNavigation = useCallback((e: KeyboardEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }
    const st = stateRef.current; // Read from Ref
    const status = st.gameState.status;

    // Secret Cheat Code Detection
    if (e.key && e.key.length === 1) {
      setCheatBuffer(prev => {
        const next = (prev + e.key.toUpperCase()).slice(-16);
        let h = 5381;
        for (let i = 0; i < next.length; i++) {
          h = ((h << 5) + h) + next.charCodeAt(i);
        }
        if ((h >>> 0) === 1621615750) {
          st.unlockEverything();
          return "";
        }
        return next;
      });
    }

    if (onlineService.lobbyCode && onlineService.currentVote) {
      if (e.key === "+" || e.key === "1") {
        e.preventDefault();
        onlineService.castVote("yes");
      }
      if (e.key === "-" || e.key === "2") {
        e.preventDefault();
        onlineService.castVote("no");
      }
    }

    if (status === "editor") return;
    if (st.showJoinPrompt) return;

    if (st.showDeleteConfirm) {
      if (e.code === "ArrowUp" || e.code === "KeyW") setMenuSelection(0);
      if (e.code === "ArrowDown" || e.code === "KeyS") setMenuSelection(1);
      if (e.code === "Enter") {
        if (st.menuSelection === 0) {
          setShowDeleteConfirm(null);
        } else {
          handleDeleteLevel(st.showDeleteConfirm);
          setShowDeleteConfirm(null);
        }
      }
      if (e.code === "Escape") {
        setShowDeleteConfirm(null);
      }
      return;
    }

    if (
      [
        "playing",
        "random_run",
        "tutorial",
        "testing",
        "brawler_testing",
        "vs_playing",
        "brawler_playing",
      ].includes(status)
    ) {
      if (e.code === "Escape") {
        if (status === "testing" || status === "brawler_testing") {
          setGameState((p) => ({ ...p, status: "editor", collectedCoins: [] })); // Clear coins on exit test
        } else if (status === "vs_playing" || status === "brawler_playing") {
          setGameState((p) => ({
            ...p,
            status: "paused",
            previousStatus: status,
          }));
        } else {
          setGameState((p) => ({ ...p, status: "paused" }));
        }
      }
      return;
    }

    const navUp = () => setMenuSelection((prev) => Math.max(0, prev - 1));
    const navDown = (max: number) =>
      setMenuSelection((prev) => Math.min(max, prev + 1));
    const sel = st.menuSelection;

    if (status === "menu") {
      const maxItems = 11;

      if (e.code === "ArrowRight" || e.code === "KeyD") {
        if (sel % 2 === 0 && sel < 11) setMenuSelection(sel + 1);
      }
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        if (sel % 2 !== 0 && sel <= 11) setMenuSelection(sel - 1);
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        if (sel === 8 || sel === 9) setMenuSelection(sel + 2);
        else if (sel + 2 <= 9) setMenuSelection(sel + 2);
      }
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        if (sel === 10 || sel === 11) setMenuSelection(sel - 2);
        else if (sel - 2 >= 0) setMenuSelection(sel - 2);
      }

      if (e.code === "Enter" || e.code === "Space") {
        switch (sel) {
          case 0:
            setGameState((p) => ({ ...p, status: "difficulty_select" }));
            break; // Story
          case 1: // VS
            setLevelSource("builtin");
            setHighscoreLevelIndex(0);
            setMenuSelection(0);
            setGameState((p) => ({ ...p, status: "vs_setup" }));
            break;
          case 2:
            setGameState((p) => ({ ...p, status: "custom_level_select" }));
            break; // Custom
          case 3: // Brawler
            setLevelSource("builtin");
            setHighscoreLevelIndex(0);
            setMenuSelection(0);
            setGameState((p) => ({ ...p, status: "brawler_setup" }));
            break;
          case 4: // Editor
            setEditorData(null);
            setEditorHistory(null);
            setEditorVerified(false);
            setGameState((p) => ({ ...p, status: "editor" }));
            break;
          case 5: // Random
            setMenuSelection(0);
            setGameState((p) => ({ ...p, status: "random_run_setup" }));
            break; 
          case 6: // Highscores
            setLevelSource("builtin");
            setHighscoreLevelIndex(0);
            setGameState((p) => ({ ...p, status: "highscores" }));
            break;
          case 7:
            setGameState((p) => ({ ...p, status: "achievements" }));
            break; // Achievs
          case 8: // Shop
            setMenuSelection(0);
            setGameState((p) => ({ ...p, status: "shop" }));
            break;
          case 9: // Online
            setMenuSelection(0);
            setGameState((p) => ({ ...p, status: "online_menu" }));
            break; 
          case 10: // Settings
            setGameState((p) => ({ ...p, status: "settings", previousStatus: "menu" }));
            break;
          case 11: // Book
            setGameState((p) => ({ ...p, status: "book" }));
            break;
        }
      }
    } else if (status === "customizing") {
      if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
      if (e.code === "ArrowDown" || e.code === "KeyS") navDown(10);

      if (
        e.code === "ArrowRight" ||
        e.code === "ArrowLeft" ||
        e.code === "KeyD" ||
        e.code === "KeyA"
      ) {
        const delta = e.code === "ArrowRight" || e.code === "KeyD" ? 10 : -10;
        const dir = e.code === "ArrowRight" || e.code === "KeyD" ? 1 : -1;

        if (sel === 0) updateColorRGB(1, "color", "r", delta);
        if (sel === 1) updateColorRGB(1, "color", "g", delta);
        if (sel === 2) updateColorRGB(1, "color", "b", delta);

        if (sel === 3) rotateOption(1, "trail", dir);

        if (sel === 4) updateColorRGB(1, "trailColor", "r", delta);
        if (sel === 5) updateColorRGB(1, "trailColor", "g", delta);
        if (sel === 6) updateColorRGB(1, "trailColor", "b", delta);

        if (sel === 7) rotateOption(1, "eyes", dir);
        if (sel === 8) rotateOption(1, "accessory", dir);
      }

      if (e.code === "Enter" || e.code === "Space") {
        if (sel === 9)
          setGameState((p) => ({ ...p, status: p.previousStatus || "menu" }));
        if (sel === 10) {
          setMenuSelection(0);
          setGameState((p) => ({
            ...p,
            status:
              p.previousStatus === "online_menu"
                ? "online_menu"
                : "difficulty_select",
          }));
        }
        // Cycling via enter
        if (sel === 3) rotateOption(1, "trail", 1);
        if (sel === 7) rotateOption(1, "eyes", 1);
        if (sel === 8) rotateOption(1, "accessory", 1);
      }
      if (e.code === "Escape")
        setGameState((p) => ({ ...p, status: p.previousStatus || "menu" }));
    } else if (status === "difficulty_select") {
      if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
      if (e.code === "ArrowDown" || e.code === "KeyS") navDown(4);
      if (e.code === "Enter" || e.code === "Space") {
        if (sel === 0) startStoryGame(INITIAL_LEVELS);
        if (sel === 1) startStoryGame(ADVANCED_LEVELS);
        if (sel === 2) startStoryGame(EXPERT_LEVELS);
        if (sel === 3) startStoryGame(GOD_LEVELS);
        if (sel === 4) setGameState((p) => ({ ...p, status: p.previousStatus || "menu", previousStatus: undefined }));
      }
      if (e.code === "Escape")
        setGameState((p) => ({ ...p, status: p.previousStatus || "menu", previousStatus: undefined }));
    } else if (status === "random_run_setup") {
      if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
      if (e.code === "ArrowDown" || e.code === "KeyS") navDown(2);
      if (
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight" ||
        e.code === "KeyA" ||
        e.code === "KeyD"
      ) {
        if (sel === 0) {
          setSettings((p) => ({ ...p, showGhost: !p.showGhost }));
        }
      }
      if (e.code === "Enter" || e.code === "Space") {
        if (sel === 0) {
          setSettings((p) => ({ ...p, showGhost: !p.showGhost }));
        }
        if (sel === 1) startRandomRun();
        if (sel === 2) setGameState((p) => ({ ...p, status: p.previousStatus || "menu", previousStatus: undefined }));
      }
      if (e.code === "Escape")
        setGameState((p) => ({ ...p, status: p.previousStatus || "menu", previousStatus: undefined }));
    } else if (status === "vs_setup" || status === "brawler_setup") {
      // VS Setup Logic
      // 0-5 (P1), 6-11 (P2), 12 (Level Menu), 14 (Play), 15 (Back)
      const maxSel = 15;
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        setMenuSelection((prev) => {
          let next = prev > 0 ? prev - 1 : maxSel;
          if (status === "brawler_setup" && next === 13) next = 12;
          return next;
        });
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        setMenuSelection((prev) => {
          let next = prev < maxSel ? prev + 1 : 0;
          if (status === "brawler_setup" && next === 13) next = 14;
          return next;
        });
      }

      const delta = e.code === "ArrowRight" || e.code === "KeyD" ? 10 : -10;
      const dir = e.code === "ArrowRight" || e.code === "KeyD" ? 1 : -1;

      if (
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight" ||
        e.code === "KeyD" ||
        e.code === "KeyA"
      ) {
        // P1 Config
        if (sel === 0) updateColorRGB(1, "color", "r", delta);
        if (sel === 1) updateColorRGB(1, "color", "g", delta);
        if (sel === 2) updateColorRGB(1, "color", "b", delta);
        if (sel === 3) rotateOption(1, "eyes", dir);
        if (sel === 4) rotateOption(1, "accessory", dir);
        if (sel === 5) rotateOption(1, "trail", dir);

        // P2 Config
        if (sel === 6) updateColorRGB(2, "color", "r", delta);
        if (sel === 7) updateColorRGB(2, "color", "g", delta);
        if (sel === 8) updateColorRGB(2, "color", "b", delta);
        if (sel === 9) rotateOption(2, "eyes", dir);
        if (sel === 10) rotateOption(2, "accessory", dir);
        if (sel === 11) rotateOption(2, "trail", dir);
      }

      if (e.code === "Enter" || e.code === "Space") {
        if (sel === 12) setShowLevelMenu(true);
        if (sel === 13 && status === "vs_setup") setGameState(p => ({ ...p, collisionEnabled: !p.collisionEnabled }));
        if (sel === 15) setGameState((p) => ({ ...p, status: "menu" }));
      }

      if (
        (e.code === "ArrowLeft" || e.code === "ArrowRight") &&
        sel === 13 &&
        status === "vs_setup"
      ) {
        setGameState(p => ({ ...p, collisionEnabled: !p.collisionEnabled }));
      }

      if (sel === 14 && (e.code === "Enter" || e.code === "Space")) {
        let currentList =
          st.levelSource === "builtin"
            ? status === "brawler_setup"
              ? BRAWLER_LEVELS
              : INITIAL_LEVELS
            : st.customLevels;
        if (status === "vs_setup") currentList = filterVSLevels(currentList);
        if (status === "brawler_setup")
          currentList = filterBrawlerLevels(currentList);
        if (currentList.length > 0) {
          const idx = Math.min(
            Math.max(0, st.highscoreLevelIndex),
            Math.max(0, currentList.length - 1),
          );
          setLevel(currentList[idx]);
          setGameState((p) => ({
            ...p,
            status:
              status === "brawler_setup"
                ? "brawler_powerup_setup"
                : "vs_playing",
            levelDeaths: 0,
            levelTime: 0,
            collectedCoins: [],
            deaths: 0,
            blocksPlaced: 0,
          }));
          if (status !== "brawler_setup") {
            setRespawnTrigger(0);
            checkAchievements({ mode: "vs" });
          } else {
            setMenuSelection(0);
          }
        }
      }

      if (e.code === "Escape") setGameState((p) => ({ ...p, status: p.previousStatus || "menu", previousStatus: undefined }));
    } else if (status === "brawler_powerup_setup") {
      const powerupKeys = Object.keys(st.brawlerPowerups);
      const maxSel = powerupKeys.length + 1; // 0 to length-1 are powerups, length is PLAY button, length+1 is BACK button

      if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
      if (e.code === "ArrowDown" || e.code === "KeyS") navDown(maxSel);

      if (
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight" ||
        e.code === "KeyA" ||
        e.code === "KeyD"
      ) {
        if (sel < powerupKeys.length) {
          if (st.gameState.onlineMode && !onlineService.isHost) return;
          const key = powerupKeys[sel];
          const delta = e.code === "ArrowRight" || e.code === "KeyD" ? 10 : -10;
          setBrawlerPowerups((prev) => {
              const newPowerups = { ...prev, [key]: Math.max(0, Math.min(100, prev[key] + delta)) };
              if (st.gameState.onlineMode && onlineService.isHost) {
                  onlineService.broadcastLobbyState(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, newPowerups);
              }
              return newPowerups;
          });
        }
      }

      if (e.code === "Enter" || e.code === "Space") {
        if (sel < powerupKeys.length) {
          if (st.gameState.onlineMode && !onlineService.isHost) return;
          const key = powerupKeys[sel];
          setBrawlerPowerups((prev) => {
              const newPowerups = { ...prev, [key]: prev[key] > 0 ? 0 : 100 };
              if (st.gameState.onlineMode && onlineService.isHost) {
                  onlineService.broadcastLobbyState(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, newPowerups);
              }
              return newPowerups;
          });
        } else if (sel === powerupKeys.length) {
            if (st.gameState.onlineMode && !onlineService.isHost) return;
            if (st.gameState.onlineMode && onlineService.isHost) {
                if (onlineService.lobbyCode) {
                    onlineService.broadcastLobbyState('brawler', undefined, undefined, undefined, undefined, 'playing');
                }
            } else if (!st.gameState.onlineMode) {
              setGameState((p) => ({ ...p, status: "brawler_playing" }));
              setRespawnTrigger(0);
              checkAchievements({ mode: "vs" });
            }
        } else if (sel === powerupKeys.length + 1) {
          setGameState((p) => ({ ...p, status: p.previousStatus === "online_lobby" ? "online_lobby" : "brawler_setup" }));
        }
      }

      if (e.code === "Escape")
        setGameState((p) => ({ ...p, status: p.previousStatus === "online_lobby" ? "online_lobby" : "brawler_setup" }));
    } else if (status === "highscores") {
      const ls = st.levelSource;
      const currentList = ls === "builtin" ? INITIAL_LEVELS : st.customLevels;

      if (
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "KeyW" ||
        e.code === "KeyS"
      ) {
        if (st.customLevels.length > 0) {
          const newSource = ls === "builtin" ? "custom" : "builtin";
          setLevelSource(newSource);
          setHighscoreLevelIndex(0);
        }
      }

      if (e.code === "ArrowLeft" || e.code === "KeyA")
        setHighscoreLevelIndex((p) => Math.max(0, p - 1));
      if (e.code === "ArrowRight" || e.code === "KeyD")
        setHighscoreLevelIndex((p) => Math.min(currentList.length - 1, p + 1));

      if (e.code === "Escape") setGameState((p) => ({ ...p, status: p.previousStatus || "menu", previousStatus: undefined }));
    } else if (status === "paused") {
      if (e.code === "KeyR") {
        handleRetry();
        return;
      } // Quick Retry

      const buttonsCount =
        1 +
        ((!onlineService.lobbyCode || onlineService.isHost) &&
        gameState.customLevelsQueue &&
        gameState.currentLevelIndex < gameState.customLevelsQueue.length - 1
          ? 1
          : 0) +
        (!(
          gameState.previousStatus === "vs_playing" ||
          gameState.previousStatus === "brawler_playing"
        )
          ? 1
          : 0) +
        (onlineService.lobbyCode ? 2 : 0) + // Give Up and Lobby button
        1; // Main Menu button

      if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
      if (e.code === "ArrowDown" || e.code === "KeyS")
        navDown(buttonsCount - 1);
      if (e.code === "Enter" || e.code === "Space") {
        // We need to find which button was clicked based on index
        const buttons: any[] = [];
        buttons.push({
          action: () =>
            setGameState((p) => ({
              ...p,
              status:
                p.previousStatus ||
                (p.customLevelsQueue ? "random_run" : "playing"),
            })),
        });
        if (
          (!onlineService.lobbyCode || onlineService.isHost) &&
          gameState.customLevelsQueue &&
          gameState.currentLevelIndex < gameState.customLevelsQueue.length - 1
        ) {
          buttons.push({ action: handleNextLevel });
        }
        if (
          !(
            gameState.previousStatus === "vs_playing" ||
            gameState.previousStatus === "brawler_playing"
          )
        ) {
          buttons.push({ action: handleRetry });
        }

        if (onlineService.lobbyCode) {
          buttons.push({
            action: () => {
              onlineService.sendEvent("give_up", { name: playerName });
              setGameState((p) => ({
                ...p,
                status: p.previousStatus || "playing",
              }));
              handleWin("GAVE UP");
            },
          });
          buttons.push({
            action: () => {
              if (onlineService.isHost) {
                onlineService.returnToLobby();
              } else {
                setGameState((p) => ({ ...p, status: "online_lobby" }));
              }
            },
          });
        }

        buttons.push({
          action: () => {
            if (onlineService.lobbyCode) {
              if (onlineService.isHost) {
                onlineService.closeLobby();
              } else {
                onlineService.disconnect();
              }
            }
            setGameState((p) => ({ ...p, status: "menu" }));
          },
        });

        if (buttons[sel]) buttons[sel].action();
      }
      if (e.code === "Escape")
        setGameState((p) => ({
          ...p,
          status:
            p.previousStatus ||
            (p.customLevelsQueue ? "random_run" : "playing"),
        }));
    } else if (status === "settings") {
      if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
      if (e.code === "ArrowDown" || e.code === "KeyS") navDown(10);
      if (
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight" ||
        e.code === "KeyA" ||
        e.code === "KeyD"
      ) {
        const diff = e.code === "ArrowRight" || e.code === "KeyD" ? 0.1 : -0.1;
        if (sel === 0)
          setSettings((p) => ({
            ...p,
            sfxVolume: Math.min(1, Math.max(0, p.sfxVolume + diff)),
          }));
        if (sel === 1)
          setSettings((p) => ({
            ...p,
            deathVolume: Math.min(1, Math.max(0, (p.deathVolume ?? 0.5) + diff)),
          }));
        if (sel === 2) {
          setSettings((p) => {
            const currentIndex = FPS_OPTIONS.indexOf(p.fpsCap);
            let nextIndex =
              e.code === "ArrowRight" || e.code === "KeyD"
                ? currentIndex + 1
                : currentIndex - 1;
            if (nextIndex >= FPS_OPTIONS.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = FPS_OPTIONS.length - 1;
            return { ...p, fpsCap: FPS_OPTIONS[nextIndex] };
          });
        }
        if (sel === 3) {
          setSettings((p) => {
            const currentScale = p.uiScale || 1;
            const currentIndex = UI_SCALE_OPTIONS.indexOf(currentScale) !== -1 ? UI_SCALE_OPTIONS.indexOf(currentScale) : 2;
            let nextIndex =
              e.code === "ArrowRight" || e.code === "KeyD"
                ? currentIndex + 1
                : currentIndex - 1;
            if (nextIndex >= UI_SCALE_OPTIONS.length) nextIndex = UI_SCALE_OPTIONS.length - 1;
            if (nextIndex < 0) nextIndex = 0;
            return { ...p, uiScale: UI_SCALE_OPTIONS[nextIndex] };
          });
        }
        if (sel === 4) {
          setSettings((p) => {
            const currentScale = p.resolutionScale || 1080;
            const currentIndex = RESOLUTION_OPTIONS.indexOf(currentScale) !== -1 ? RESOLUTION_OPTIONS.indexOf(currentScale) : 1;
            let nextIndex =
              e.code === "ArrowRight" || e.code === "KeyD"
                ? currentIndex + 1
                : currentIndex - 1;
            if (nextIndex >= RESOLUTION_OPTIONS.length) nextIndex = RESOLUTION_OPTIONS.length - 1;
            if (nextIndex < 0) nextIndex = 0;
            return { ...p, resolutionScale: RESOLUTION_OPTIONS[nextIndex] };
          });
        }
        if (sel === 5) {
          setSettings((p) => ({
            ...p,
            screenShake: Math.min(1, Math.max(0, (p.screenShake ?? 1) + diff)),
          }));
        }
        if (sel === 6) {
          setSettings((p) => ({
            ...p,
            opponentOpacity: Math.min(1, Math.max(0, (p.opponentOpacity ?? 0.5) + diff)),
          }));
        }
      }
      if (e.code === "Enter" || e.code === "Space") {
        if (sel === 7) {
          setSettings((p) => ({ ...p, editorEdgeScroll: !p.editorEdgeScroll }));
        }
        if (sel === 8) {
          setGameState((p) => ({ ...p, status: "keybindings" }));
          setMenuSelection(0);
        }
        if (sel === 9) {
          setGameState((p) => ({ ...p, status: p.previousStatus || "menu", previousStatus: undefined }));
        }
      }
      if (e.code === "Escape") setGameState((p) => ({ ...p, status: p.previousStatus || "menu", previousStatus: undefined }));
    } else if (status === "keybindings") {
      if (st.editingKey) {
        e.preventDefault();
        if (e.code === "Escape") {
          setEditingKey(null);
          return;
        }
        const { player, action } = st.editingKey;
        const key = player === 1 ? "keybindingsP1" : "keybindingsP2";
        setSettings((p) => {
          const currentBindings =
            p[key] ||
            (player === 1
              ? {
                  up: ["ArrowUp"],
                  down: ["ArrowDown"],
                  left: ["ArrowLeft"],
                  right: ["ArrowRight"],
                  action: ["ControlRight", "ControlLeft", "Numpad0", "Digit0"],
                  dash: ["ShiftRight"],
                }
              : {
                  up: ["KeyW"],
                  down: ["KeyS"],
                  left: ["KeyA"],
                  right: ["KeyD"],
                  action: ["KeyQ"],
                  dash: ["ShiftLeft"],
                });
          
          const existing = currentBindings[action] || [];
          // Keep GP_ keys, replace keyboard keys
          const newBindings = [...existing.filter(k => k.startsWith("GP_")), e.code];

          return {
            ...p,
            [key]: {
              ...currentBindings,
              [action]: newBindings,
            },
          };
        });
        setEditingKey(null);
        return;
      }

      if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
      if (e.code === "ArrowDown" || e.code === "KeyS") navDown(12); // 6 actions * 2 players + back button

      if (e.code === "Enter" || e.code === "Space") {
        if (sel === 12) {
          setGameState((p) => ({ ...p, status: "settings" }));
          setMenuSelection(2);
        } else {
          const numActions = 6;
          const player = sel < numActions ? 1 : 2;
          const actionIndex = sel < numActions ? sel : sel - numActions;
          const actions: (keyof Keybindings)[] = [
            "up",
            "down",
            "left",
            "right",
            "action",
            "dash",
          ];
          if (actions[actionIndex]) {
            setEditingKey({ player, action: actions[actionIndex] });
          }
        }
      }
      if (e.code === "Escape") {
        setGameState((p) => ({ ...p, status: "settings" }));
        setMenuSelection(2);
      }
    } else if (status === "online_menu") {
      if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
      if (e.code === "ArrowDown" || e.code === "KeyS") navDown(4);
      if (e.code === "Enter" || e.code === "Space") {
        if (sel === 0) {
          setGameState((p) => ({
            ...p,
            status: "customizing",
            previousStatus: "online_menu",
          }));
        } else if (sel === 1) {
          // Create Brawler Lobby
          createOnlineLobby("brawler");
        } else if (sel === 2) {
          // Create VS Lobby
          createOnlineLobby("vs");
        } else if (sel === 3) {
          // Join Lobby
          setShowJoinPrompt(true);
        } else if (sel === 4) {
          setGameState((p) => ({ ...p, status: "menu" }));
        }
      }
      if (e.code === "Escape") setGameState((p) => ({ ...p, status: "menu" }));
    } else if (status === "online_lobby") {
      if (e.code === "Escape") {
        onlineService.disconnect();
        setGameState((p) => ({ ...p, status: "online_menu", previousStatus: undefined }));
        return;
      }
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        if (st.gameState.isHost && sel === 0) {
          const sources: any[] =
            st.gameState.onlineMode === "brawler"
              ? ["brawler", "custom"]
              : ["beginner", "advanced", "expert", "god", "custom"];
          const currentIdx = sources.indexOf(st.levelSource);
          let nextIdx = currentIdx - 1;
          if (nextIdx < 0) nextIdx = sources.length - 1;
          const newSource = sources[nextIdx];

          setLevelSource(newSource);
          setHighscoreLevelIndex(0);

          const getList = (src: string) => {
            if (src === "beginner") return INITIAL_LEVELS;
            if (src === "advanced") return ADVANCED_LEVELS;
            if (src === "expert") return EXPERT_LEVELS;
            if (src === "god") return GOD_LEVELS;
            if (src === "brawler") return BRAWLER_LEVELS;
            return st.customLevels;
          };

          const list = getList(newSource);
          if (list.length > 0) {
            setLevel(list[0]);
            onlineService.broadcastLobbyState(
              st.gameState.onlineMode!,
              list[0],
              undefined,
              brawlerTeamMode,
              brawlerHazardMode,
            );
          }
        } else {
          const max = st.gameState.isHost
            ? 5
            : 2;
          setMenuSelection((prev) => (prev === 0 ? max : prev - 1));
        }
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        if (st.gameState.isHost && sel === 0) {
          const sources: any[] =
            st.gameState.onlineMode === "brawler"
              ? ["brawler", "custom"]
              : ["beginner", "advanced", "expert", "god", "custom"];
          const currentIdx = sources.indexOf(st.levelSource);
          let nextIdx = currentIdx + 1;
          if (nextIdx >= sources.length) nextIdx = 0;
          const newSource = sources[nextIdx];

          setLevelSource(newSource);
          setHighscoreLevelIndex(0);

          const getList = (src: string) => {
            if (src === "beginner") return INITIAL_LEVELS;
            if (src === "advanced") return ADVANCED_LEVELS;
            if (src === "expert") return EXPERT_LEVELS;
            if (src === "god") return GOD_LEVELS;
            if (src === "brawler") return BRAWLER_LEVELS;
            return st.customLevels;
          };

          const list = getList(newSource);
          if (list.length > 0) {
            setLevel(list[0]);
            onlineService.broadcastLobbyState(
              st.gameState.onlineMode!,
              list[0],
              undefined,
              brawlerTeamMode,
              brawlerHazardMode,
            );
          }
        } else {
          const max = st.gameState.isHost
            ? 5
            : 2;
          setMenuSelection((prev) => (prev === max ? 0 : prev + 1));
        }
      }
      if (st.gameState.isHost && sel === 0) {
        if (e.code === "ArrowLeft" || e.code === "KeyA") {
          const getList = (src: string) => {
            if (src === "beginner") return INITIAL_LEVELS;
            if (src === "advanced") return ADVANCED_LEVELS;
            if (src === "expert") return EXPERT_LEVELS;
            if (src === "god") return GOD_LEVELS;
            if (src === "brawler") return BRAWLER_LEVELS;
            return st.customLevels;
          };
          const list = getList(st.levelSource);
          const newIdx = Math.max(0, st.highscoreLevelIndex - 1);
          setHighscoreLevelIndex(newIdx);
          setLevel(list[newIdx]);
          onlineService.broadcastLobbyState(
            st.gameState.onlineMode!,
            list[newIdx],
            undefined,
            brawlerTeamMode,
            brawlerHazardMode,
          );
        }
        if (e.code === "ArrowRight" || e.code === "KeyD") {
          const getList = (src: string) => {
            if (src === "beginner") return INITIAL_LEVELS;
            if (src === "advanced") return ADVANCED_LEVELS;
            if (src === "expert") return EXPERT_LEVELS;
            if (src === "god") return GOD_LEVELS;
            if (src === "brawler") return BRAWLER_LEVELS;
            return st.customLevels;
          };
          const list = getList(st.levelSource);
          const newIdx = Math.min(list.length - 1, st.highscoreLevelIndex + 1);
          setHighscoreLevelIndex(newIdx);
          setLevel(list[newIdx]);
          onlineService.broadcastLobbyState(
            st.gameState.onlineMode!,
            list[newIdx],
            undefined,
            brawlerTeamMode,
            brawlerHazardMode,
          );
        }
      }
      if (e.code === "Enter" || e.code === "Space") {
        if (st.gameState.isHost) {
          if (sel === 1) {
            setShowLevelMenu(true);
          } else if (sel === 2) {
            if (onlinePlayers.length < 2) {
              setOnlineError("Need at least 2 players!");
              setTimeout(() => setOnlineError(""), 2000);
            } else if (onlinePlayers.every((p) => p.ready)) {
              onlineService.startGame();
            } else {
              setOnlineError("Not all players are ready!");
              setTimeout(() => setOnlineError(""), 2000);
            }
          } else if (sel === 3) {
            setGameState((p) => ({
              ...p,
              status: "customizing",
              previousStatus: "online_lobby",
            }));
          } else if (sel === 4) {
            if (st.gameState.onlineMode === "brawler") {
              setGameState((p) => ({
                ...p,
                status: "brawler_powerup_setup",
                previousStatus: "online_lobby",
              }));
            } else if (st.gameState.onlineMode === "vs") {
              const newValue = !st.gameState.collisionEnabled;
              setGameState(p => ({ ...p, collisionEnabled: newValue }));
              onlineService.broadcastLobbyState(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                newValue
              );
            }
          } else if (sel === 5) {
            onlineService.closeLobby();
            setGameState((p) => ({ ...p, status: "online_menu" }));
          }
        } else {
          if (sel === 0) {
            const localP = onlinePlayers.find(
              (p) => p.id === onlineService.localPlayer?.id,
            );
            if (localP) onlineService.setReady(!localP.ready);
          } else if (sel === 1) {
            setGameState((p) => ({
              ...p,
              status: "customizing",
              previousStatus: "online_lobby",
            }));
          } else if (sel === 2) {
            onlineService.disconnect();
            setGameState((p) => ({ ...p, status: "online_menu" }));
          }
        }
      }
    } else if (status === "custom_level_select") {
      const sortedLevels = st.sortedCustomLevels;
      if (sortedLevels.length > 0) {
        if (e.code === "ArrowUp" || e.code === "KeyW")
          setMenuSelection((prev) => Math.max(0, prev - 1));
        if (e.code === "ArrowDown" || e.code === "KeyS")
          setMenuSelection((prev) =>
            Math.min(sortedLevels.length - 1, prev + 1),
          );

        if (e.code === "Enter") {
          const selected = sortedLevels[sel];
          if (selected.isVerified !== false) {
            // Only play if not draft
            playSingleCustomLevelHook(selected);
          }
        }
        if (e.code === "Delete") {
          setShowDeleteConfirm(sortedLevels[sel].id);
          setMenuSelection(0);
        }
        if (e.code === "KeyE") handleEditLevel(sortedLevels[sel]);
      }

      if (e.code === "Escape") setGameState((p) => ({ ...p, status: "menu" }));
    } else if (
      status === "won" ||
      status === "vs_won" ||
      status === "brawler_won"
    ) {
      if (e.code === "Escape") {
        if (onlineService.lobbyCode) {
          setGameState((p) => ({ ...p, status: "online_lobby" }));
        } else {
          setGameState((p) => ({ ...p, status: "menu" }));
        }
      }

      const isVS = status === "vs_won" || status === "brawler_won";
      const queue = st.gameState.customLevelsQueue;
      const hasNext =
        queue && st.gameState.currentLevelIndex < queue.length - 1;

      if (isVS) {
        if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
        if (e.code === "ArrowDown" || e.code === "KeyS") {
          const max = hasNext ? 2 : 1;
          navDown(max);
        }
        if (e.code === "Enter" || e.code === "Space") {
          if (sel === 0) {
            if (hasNext) {
              handleNextLevel();
            } else {
              setGameState((p) => ({
                ...p,
                status: onlineService.lobbyCode ? "online_lobby" : "menu",
              }));
            }
          } else if (sel === 1) {
            if (hasNext) {
              setGameState((p) => ({
                ...p,
                status: onlineService.lobbyCode ? "online_lobby" : "menu",
              }));
            } else {
              setGameState((p) => ({ ...p, status: "menu" }));
            }
          } else if (sel === 2) {
            setGameState((p) => ({ ...p, status: "menu" }));
          }
        }
      } else {
        const isStoryMode = !st.gameState.customLevelsQueue;
        const isLastStoryLevel =
          isStoryMode &&
          st.gameState.currentLevelIndex >= st.selectedDifficultySet.length - 1;

        if (isStoryMode && !isLastStoryLevel) {
          if (e.code === "Enter" || e.code === "Space") {
            const nextIdx = st.gameState.currentLevelIndex + 1;
            const collection =
              st.gameState.customLevelsQueue || st.selectedDifficultySet;

            if (nextIdx < collection.length) {
              setLevel(collection[nextIdx]);
              processedCoins.current.clear();
              setGameState((prev) => ({
                ...prev,
                status: prev.customLevelsQueue ? "random_run" : "playing",
                currentLevelIndex: nextIdx,
                levelTime: 0,
                levelDeaths: 0,
                blocksPlaced: 0,
                collectedCoins: [],
                score: prev.score,
                levelStartScore: prev.score,
              }));
            } else {
              setGameState((prev) => ({ ...prev, status: "menu" }));
            }
          }
        } else {
          if (e.code === "Enter") {
            if (st.playerName.length > 0) saveHighscore();
          }
        }
      }
    } else if (status === "achievements") {
      if (e.code === "Escape") {
        setGameState((p) => ({ ...p, status: p.previousStatus || "menu", previousStatus: undefined }));
      }
    } else if (status === "online_summary") {
      const isHost = onlineService.isHost;
      const hasNext =
        st.gameState.customLevelsQueue &&
        st.gameState.currentLevelIndex <
          st.gameState.customLevelsQueue.length - 1;

      let maxItems = 1; // Default for non-host (Warte auf Host, Main Menu)
      if (isHost) {
        maxItems = hasNext ? 3 : 2; // Next (if any), Repeat, Lobby, Menu
      }

      if (e.code === "ArrowUp" || e.code === "KeyW") {
        setMenuSelection((prev) => (prev <= 0 ? maxItems : prev - 1));
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        setMenuSelection((prev) => (prev >= maxItems ? 0 : prev + 1));
      }
      if (e.code === "Enter" || e.code === "Space") {
        if (isHost) {
          if (hasNext) {
            if (sel === 0) onlineService.initiateVote("next");
            else if (sel === 1) onlineService.initiateVote("repeat");
            else if (sel === 2) onlineService.returnToLobby();
            else if (sel === 3) {
              onlineService.disconnect();
              setGameState((p) => ({ ...p, status: "menu" }));
            }
          } else {
            if (sel === 0) onlineService.initiateVote("repeat");
            else if (sel === 1) onlineService.returnToLobby();
            else if (sel === 2) {
              onlineService.disconnect();
              setGameState((p) => ({ ...p, status: "menu" }));
            }
          }
        } else {
          if (sel === 1) {
            onlineService.disconnect();
            setGameState((p) => ({ ...p, status: "menu" }));
          }
        }
      }
    }
  }, []); // Empty dependency array = attached once, never removed!

  useEffect(() => {
    // Prevent gaming mouse thumb buttons (Back/Forward) from leaving the game
    const blockExtraMouseButtons = (e: MouseEvent) => {
      // button 3 & 4 are typically "Back" and "Forward" thumb buttons
      if (e.button === 3 || e.button === 4) {
        e.preventDefault();
      }
    };
    window.addEventListener("mousedown", blockExtraMouseButtons);
    window.addEventListener("mouseup", blockExtraMouseButtons);

    window.addEventListener("keydown", handleKeyboardNavigation);
    return () => {
      window.removeEventListener("keydown", handleKeyboardNavigation);
      window.removeEventListener("mousedown", blockExtraMouseButtons);
      window.removeEventListener("mouseup", blockExtraMouseButtons);
    };
  }, [handleKeyboardNavigation]);

  // --- ONLINE LOBBY LOGIC ---
  const createOnlineLobby = async (mode: "brawler" | "vs") => {
    if (!playerName.trim()) {
      setOnlineError(t.nameRequired || "NAME IS REQUIRED TO JOIN OR CREATE A LOBBY");
      return;
    }
    setOnlineError("Creating lobby...");
    try {
      const localPlayer: OnlinePlayer = {
        id: Math.random().toString(36).substr(2, 9),
        name: playerName.trim(),
        customization: customization,
        isHost: true,
        ready: true,
        team: 0, // Team 1
      };
      const list = mode === "brawler" ? BRAWLER_LEVELS : INITIAL_LEVELS;
      const initialLevel = list[0];
      const initialQueue = mode === "brawler" ? BRAWLER_LEVELS : [];
      
      const code = await onlineService.createLobby(localPlayer, mode, {
        level: initialLevel,
        levelQueue: initialQueue,
        teamMode: brawlerTeamMode,
        hazardMode: brawlerHazardMode,
        vsCollision: gameState.collisionEnabled,
        powerups: brawlerPowerups
      });
      setLevelSource("builtin");
      setHighscoreLevelIndex(0);
      setMenuSelection(0);
      setLevel(initialLevel);
      setGameState((p) => ({
        ...p,
        status: "online_lobby",
        lobbyCode: code,
        isHost: true,
        onlineMode: mode,
        customLevelsQueue: initialQueue,
        currentLevelIndex: 0,
      }));
      setOnlinePlayers([localPlayer]);
      setOnlineError("");
      onlineService.broadcastLobbyState(
        mode,
        undefined,
        [],
        brawlerTeamMode,
        brawlerHazardMode,
      );
      setSelectedLevels([]);
    } catch (err: any) {
      setOnlineError("Failed to create lobby: " + err.message);
    }
  };

  const updateOnlineCustomization = (newCustomization: PlayerCustomization) => {
    if (onlineService.localPlayer) {
      const updatedPlayer = {
        ...onlineService.localPlayer,
        customization: newCustomization,
      };
      onlineService.updateLocalPlayer(updatedPlayer);
    }
  };

  const joinOnlineLobby = async (code: string) => {
    if (!playerName.trim()) {
      setOnlineError(t.nameRequired || "NAME IS REQUIRED TO JOIN OR CREATE A LOBBY");
      return;
    }
    setOnlineError("Joining lobby...");
    try {
      // Determine team based on current player count if possible, or just default to 0
      // We will adjust it once the lobby update comes in
      const localPlayer: OnlinePlayer = {
        id: Math.random().toString(36).substr(2, 9),
        name: playerName.trim(),
        customization: customization,
        isHost: false,
        ready: false,
      };
      await onlineService.joinLobby(code, localPlayer);
      setGameState((p) => ({
        ...p,
        status: "online_lobby",
        lobbyCode: code,
        isHost: false,
      }));
      setOnlineError("");
    } catch (err: any) {
      onlineService.disconnect();
      setOnlineError("Failed to join lobby: " + err.message);
    }
  };

  useEffect(() => {
    onlineService.onLobbyUpdate = (
      players,
      newLevel,
      mode,
      levelQueue,
      teamMode,
      hazardMode,
      levelIndex,
      updatedVsCollision,
      updatedPowerups,
      suddenDeath,
      suggestions,
      finishTimerEnabled
    ) => {
      // Automatic team assignment for local player if not set
      if (onlineService.localPlayer && (onlineService.localPlayer.team === undefined || onlineService.localPlayer.team === null)) {
          const myIdx = players.findIndex(p => p.id === onlineService.localPlayer?.id);
          if (myIdx !== -1) {
              const updatedPlayer = { ...onlineService.localPlayer, team: myIdx % 8 };
              onlineService.updateLocalPlayer(updatedPlayer);
          }
      }

      setOnlinePlayers([...players]);
      if (suggestions) setOnlineSuggestions([...suggestions]);

      // Check if host is still present
      if (onlineService.lobbyCode && !onlineService.isHost) {
        const hostExists = players.some(p => p.id === onlineService.hostId);
        if (!hostExists) {
          setGameState(prev => ({ ...prev, status: 'online_menu' }));
          setOnlineError("Lobby closed: Host left");
          onlineService.disconnect();
          return;
        }
      }

      const queue = levelQueue || stateRef.current.gameState.customLevelsQueue;
      let nextIdx = levelIndex !== undefined ? levelIndex : -1;
      if (nextIdx === -1 && newLevel && queue) {
        nextIdx = queue.findIndex((l) => l.id === newLevel.id);
      }

      if (updatedVsCollision !== undefined && !onlineService.isHost) {
        setGameState(p => ({ ...p, collisionEnabled: updatedVsCollision }));
      }
      
      if (updatedPowerups !== undefined && !onlineService.isHost) {
        setBrawlerPowerups(updatedPowerups as any);
      }

      if (newLevel && stateRef.current.level?.id !== newLevel.id) {
        setLevel(newLevel);
      }

      if (teamMode && !onlineService.isHost) {
        setBrawlerTeamMode(teamMode as BrawlerTeamMode);
      }

      if (hazardMode && !onlineService.isHost) {
        setBrawlerHazardMode(hazardMode as BrawlerHazardMode);
      }
      if (suddenDeath !== undefined && !onlineService.isHost) {
        setBrawlerSuddenDeath(suddenDeath);
      }

      setGameState((p) => {
        const updates: any = {
          finishTimerEnabled: finishTimerEnabled !== undefined ? finishTimerEnabled : p.finishTimerEnabled
        };
        if (mode) updates.onlineMode = mode;
        if (levelQueue) {
          updates.customLevelsQueue = levelQueue;
          if (newLevel) {
            updates.currentLevelIndex = levelQueue.findIndex(
              (l) => l.id === newLevel.id,
            );
            if (updates.currentLevelIndex === -1) updates.currentLevelIndex = 0;
          } else if (!onlineService.isHost) {
            updates.currentLevelIndex = 0;
          }
        } else if (nextIdx !== -1) {
          updates.currentLevelIndex = nextIdx;
        }

        if (Object.keys(updates).length > 0) return { ...p, ...updates };
        return p;
      });
    };
    onlineService.onGameStart = (
      mode,
      level,
      levelQueue,
      teamMode,
      hazardMode,
      levelIndex,
      updatedVsCollision,
    ) => {
      lastStartTimeRef.current = Date.now();
      const gameMode = mode || "brawler";

      if (updatedVsCollision !== undefined) {
        setGameState(p => ({ ...p, collisionEnabled: updatedVsCollision }));
      }

      setGameState((p) => ({
        ...p,
        status: gameMode === "brawler" ? "brawler_playing" : "vs_playing",
        levelTime: 0,
        levelDeaths: 0,
        collectedCoins: [],
        blocksPlaced: 0,
        onlineMode: gameMode,
        isSpectating: false,
        spectateTargetId: undefined,
        currentLevel: level || p.currentLevel,
        currentLevelIndex:
          levelIndex !== undefined ? levelIndex : p.currentLevelIndex,
        customLevelsQueue: levelQueue || p.customLevelsQueue,
        brawlerTeamMode: teamMode || p.brawlerTeamMode,
        brawlerHazardMode: hazardMode || p.brawlerHazardMode,
      }));
      setRespawnTrigger((p) => p + 1);
    };
    onlineService.onStatusChange = (status) => {
      const currentGameState = stateRef.current.gameState;
      if (status === "lobby") {
        setOnlineResults([]);
        setOnlineFinishTimer(null);
        setCurrentVote(null);
        setGameState((p) => ({
          ...p,
          status: "online_lobby",
          isSpectating: false,
          spectateTargetId: undefined,
          currentLevelIndex: 0,
        }));
      } else if (status === "summary") {
        // Only clear timer if we are actually entering summary (results should already be populated or ready)
        setGameState((p) => ({ ...p, status: "online_summary" }));
        setOnlineFinishTimer(null);
      } else if (status === "closed") {
        setGameState((p) => ({ ...p, status: "online_menu" }));
        setOnlineError("Lobby was closed by host");
        onlineService.disconnect();
      } else if (status === "kicked") {
        setGameState((p) => ({ ...p, status: "online_menu" }));
        setOnlineError(t.kickedMessage || "Du wurdest aus der Lobby gekickt.");
        onlineService.disconnect();
      }
    };
    onlineService.onDisconnect = () => {
      setGameState((p) => ({ ...p, status: "online_menu" }));
      setOnlineError("Disconnected from host");
    };
    onlineService.onError = (msg) => {
      setOnlineError(msg);
      setTimeout(() => setOnlineError(""), 3000);
    };
    onlineService.onChatUpdate = (msgs) => {
      setChatMessages([...msgs]);
    };
    onlineService.onVoteUpdate = (vote) => {
      setCurrentVote(vote);
    };

    const resolveVoteInterval = setInterval(() => {
      if (onlineService.isHost && onlineService.currentVote) {
        if (Date.now() > onlineService.currentVote.endTime) {
          resolveVote();
        }
      }
    }, 1000);

    onlineService.onAppEvent = (id, event, data) => {
      if (event === "start_timer") {
        setOnlineFinishTimer(data?.duration || 20);
      }
      if (event === "give_up") {
        const playerName = data?.name || "Unknown";
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            text: `${playerName} gave up!`,
            senderId: "system",
            senderName: "SYSTEM",
            timestamp: Date.now(),
            type: "system",
          },
        ]);
      }
      if (event === "cast_vote") {
        onlineService.handleCastVote(id, data.choice);
      }
      if (event === "request_vote") {
        if (onlineService.isHost && !onlineService.currentVote) {
          // Initialize it manually so it's synchronous
          onlineService.currentVote = {
            type: data.type,
            votes: { [id]: 'yes' }, // Requester implicitly votes yes
            endTime: Date.now() + 15000,
            targetId: data.targetId
          };
          onlineService.broadcastLobbyState(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, onlineService.currentVote);
        }
      }
      if (event === "finish_stats") {
        const isPlaying = stateRef.current.gameState.status === "vs_playing" || stateRef.current.gameState.status === "brawler_playing";
        if (onlineService.isHost && isPlaying) {
          setOnlineResults((prev) => {
            const existing = prev.findIndex((r) => r.id === data.id);
            if (existing !== -1) return prev;
            const newResults = [...prev, data];
            
            // Check for early finish if everyone is done
            if (onlineService.players.size > 0 && newResults.length >= onlineService.players.size) {
              setOnlineFinishTimer(0);
            } else if (newResults.length === 1 && onlineFinishTimerRef.current === null && (stateRef.current.gameState.finishTimerEnabled !== false)) {
              // First person finished, start 20s timer
              onlineService.sendEvent("start_timer", { duration: 20 });
              setOnlineFinishTimer(20);
            }
            
            return newResults;
          });
        }
      }
      if (event === "online_results") {
        const isPlaying = stateRef.current.gameState.status === "vs_playing" || stateRef.current.gameState.status === "brawler_playing";
        if (
          stateRef.current.gameState.status === "online_lobby" ||
          stateRef.current.gameState.status === "menu" ||
          stateRef.current.gameState.status === "online_menu" ||
          (isPlaying && (stateRef.current.gameState.levelTime < 2 || Date.now() - lastStartTimeRef.current < 2000))
        ) {
          return;
        }
        setOnlineResults(data.results);
        setGameState((p) => ({
          ...p,
          status: "online_summary",
          previousStatus: p.status,
        }));
        setOnlineFinishTimer(null);
      }
    };

    return () => {
      clearInterval(resolveVoteInterval);
      onlineService.onLobbyUpdate = undefined;
      onlineService.onGameStart = undefined;
      onlineService.onStatusChange = undefined;
      onlineService.onChatUpdate = undefined;
      onlineService.onVoteUpdate = undefined;
      onlineService.onDisconnect = undefined;
      onlineService.onError = undefined;
      onlineService.onEvent = undefined;
      onlineService.onAppEvent = undefined;
    };
  }, []);

  // Use a ref to track timer state without triggering re-renders in some effects
  const onlineFinishTimerRef = useRef(onlineFinishTimer);
  useEffect(() => {
    onlineFinishTimerRef.current = onlineFinishTimer;
  }, [onlineFinishTimer]);

  const lastStartTimeRef = useRef(0);

  // Online Finish Timer
  useEffect(() => {
    if (onlineFinishTimer === null) return;
    if (onlineFinishTimer <= 0) {
      const isPlaying = stateRef.current.gameState.status === "vs_playing" || stateRef.current.gameState.status === "brawler_playing";
      if (
        stateRef.current.gameState.status === "online_lobby" ||
        stateRef.current.gameState.status === "menu" ||
        stateRef.current.gameState.status === "online_menu" ||
        (isPlaying && stateRef.current.gameState.levelTime < 2)
      ) {
        setOnlineFinishTimer(null);
        return;
      }
      if (onlineService.lobbyCode) {
        if (onlineService.isHost) {
          // Only broadcast if we are actually playing and transitioning to summary
          const currentStatus = stateRef.current.gameState.status;
          if (currentStatus !== "vs_playing" && currentStatus !== "brawler_playing") {
             setOnlineFinishTimer(null);
             return;
          }

          // Compile results and broadcast
          const results = Array.from(onlineService.players.values()).map(
            (p) => {
              const stats = onlineResults.find((r) => r.id === p.id);
              const isLocal = p.id === onlineService.localPlayer?.id;
              let localScore = stateRef.current.gameState.score;
              if (
                stateRef.current.gameState.status === "brawler_playing" &&
                isLocal
              ) {
                localScore =
                  stateRef.current.gameState.winner ===
                  onlineService.localPlayer?.name
                    ? 1
                    : 0;
              }
              return {
                name: p.name,
                id: p.id,
                score: stats ? stats.score : isLocal ? localScore : 0,
                time: stats
                  ? stats.time
                  : isLocal
                    ? stateRef.current.gameState.levelTime
                    : 999,
                deaths: stats
                  ? stats.deaths
                  : isLocal
                    ? stateRef.current.gameState.levelDeaths
                    : 0,
              };
            },
          );
          // Sort by score desc, then time asc
          results.sort((a, b) => b.score - a.score || a.time - b.time);
          onlineService.sendEvent("online_results", { results });
          onlineService.finishGame(); // Set room status to summary
          setOnlineResults(results);
          setGameState((p) => ({
            ...p,
            status: "online_summary",
            previousStatus: p.status,
          }));
          setOnlineFinishTimer(null);
        }
      } else {
        // Local VS Mode
        setOnlineResults((prev) => {
          const results = [...prev];
          const p1Finished = results.find((r) => r.name === "P1");
          const p2Finished = results.find((r) => r.name === "P2");
          if (!p1Finished)
            results.push({
              id: "P1",
              name: "P1",
              score: 0,
              time: 999,
              deaths: 0,
            });
          if (!p2Finished)
            results.push({
              id: "P2",
              name: "P2",
              score: 0,
              time: 999,
              deaths: 0,
            });
          results.sort((a, b) => a.time - b.time);
          return results;
        });
        setGameState((p) => ({
          ...p,
          status: "online_summary",
          previousStatus: p.status,
        }));
        setOnlineFinishTimer(null);
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!onlineService.isPaused) {
        setOnlineFinishTimer((prev) => (prev !== null ? prev - 1 : null));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [onlineFinishTimer, onlineResults]);

  const calculateLevelScore = (timeTaken: number, deaths: number) => {
    let s = 1000;
    s -= timeTaken * 5;
    s -= deaths * 50;
    return Math.max(0, s);
  };

  const handleDie = useCallback(async () => {
    if (
      gameState.status === "vs_playing" ||
      gameState.status === "brawler_playing"
    ) {
      return;
    }

    const now = Date.now();
    if (now - lastDeathTime.current < 500) return; // Prevent double death penalty within 500ms
    lastDeathTime.current = now;

    audio.playDie(customization.deathSound);
    const newTotalDeaths = gameState.deaths + 1;

    checkAchievements({
      totalDeaths: newTotalDeaths,
      levelDeaths: gameState.levelDeaths + 1,
      won: false,
      blocksPlaced: gameState.blocksPlaced,
      levelId: level?.id,
    });

    if (
      gameState.status === "testing" ||
      gameState.status === "brawler_testing"
    ) {
      setRespawnTrigger((prev) => prev + 1);
      return;
    }

    setGameState((prev) => ({
      ...prev,
      deaths: newTotalDeaths,
      levelDeaths: prev.levelDeaths + 1,
      score: Math.max(0, prev.score - 50), // Fixed 50 points penalty per death
    }));

    setRespawnTrigger((prev) => prev + 1);
  }, [
    gameState.deaths,
    gameState.levelDeaths,
    gameState.status,
    checkAchievements,
    level?.id,
    customization.deathSound,
  ]);

  const handleCoin = useCallback(
    (id: string) => {
      if (processedCoins.current.has(id)) return;
      if (gameState.collectedCoins.includes(id)) return;

      processedCoins.current.add(id);
      audio.playCoin();

      // Add to persistent bank
      setCustomization((prev) => ({
        ...prev,
        coins: (prev.coins || 0) + 1,
      }));

      setGameState((prev) => {
        const newTotalCoins = (prev.totalCoinsCollected || 0) + 1;
        const newState = {
          ...prev,
          score: prev.score + 500, // Fixed 500 points per coin
          collectedCoins: [...prev.collectedCoins, id],
          totalCoinsCollected: newTotalCoins,
        };
        checkAchievements({
          collectedCoinsCount: newState.collectedCoins.length,
          totalCoinsCollected: newTotalCoins,
        });
        return newState;
      });
    },
    [gameState.collectedCoins, checkAchievements],
  );

  const handleBlockPlace = useCallback(() => {
    setGameState((prev) => {
      const newTotalBlocks = (prev.totalBlocksPlaced || 0) + 1;
      const newState = {
        ...prev,
        blocksPlaced: prev.blocksPlaced + 1,
        totalBlocksPlaced: newTotalBlocks,
      };
      checkAchievements({ totalBlocksPlaced: newTotalBlocks });
      return newState;
    });
  }, [checkAchievements]);

  const handleWin = useCallback(
    (
      winnerName?: string,
      livesStats?: Record<string, number>,
      exactTime?: number,
      isLocal?: boolean,
    ) => {
      audio.playWin();

      if (
        gameState.status === "testing" ||
        gameState.status === "brawler_testing"
      ) {
        setEditorVerified(true);
        setGameState((p) => ({ ...p, status: "editor" }));
        return;
      }

      const finalTime =
        exactTime !== undefined
          ? Number(exactTime.toFixed(2))
          : gameState.levelTime;

      if (
        gameState.status === "vs_playing" ||
        gameState.status === "brawler_playing"
      ) {
        if (onlineService.lobbyCode) {
          // Online Multiplayer Win Logic
          // Send stats to host only if the local player is the one who finished
          const isLocalName = onlineService.localPlayer?.name;
          const isLocalFinish =
            winnerName === isLocalName ||
            (gameState.status === "brawler_playing" &&
              livesStats &&
              isLocalName &&
              livesStats[isLocalName] === 0);
          const isWinner =
            winnerName !== undefined &&
            winnerName !== "DRAW" &&
            winnerName !== "GAVE UP" &&
            (winnerName === isLocalName ||
              (onlineService.localPlayer?.team !== undefined &&
                winnerName === `TEAM ${onlineService.localPlayer.team + 1}`));

          if (isLocalFinish || isWinner) {
            const playerName = isLocalName || "Unknown";
            const myStats = {
              id: onlineService.localPlayer?.id,
              name: playerName,
              score: isWinner ? 1 : 0,
              time: finalTime,
              deaths:
                livesStats && isLocalName ? livesStats[isLocalName] : 0,
            };
            onlineService.sendEvent("finish_stats", myStats);

            if (onlineService.isHost) {
              setOnlineResults((prev) => {
                const existing = prev.findIndex((r) => r.id === myStats.id);
                if (existing !== -1) return prev;
                const newResults = [...prev, myStats];
                
                // Check for early finish if everyone is done
                if (onlineService.players.size > 0 && newResults.length >= onlineService.players.size) {
                  setOnlineFinishTimer(0);
                } else if (newResults.length === 1 && onlineFinishTimerRef.current === null && (stateRef.current.gameState.finishTimerEnabled !== false)) {
                  // First person finished, start 20s timer
                  onlineService.sendEvent("start_timer", { duration: 20 });
                  setOnlineFinishTimer(20);
                }
                
                return newResults;
              });
            }
          }

          const isActuallyLocal = isLocal !== false;
          setGameState((p) => ({ ...p, winner: p.winner || winnerName, isSpectating: isActuallyLocal }));

          // Locally we don't transition yet, we wait for the timer or host to end it
          // But we should probably show a "Finished" message
          if (winnerName === "GAVE UP") {
            setGameState((p) => ({ ...p, status: "online_summary" })); // Wait, if they give up, they should just wait for the summary?
            // Actually, if they give up, they should just wait and watch, or maybe we just show a message.
            // Let's just set a flag or something. For now, just return.
          }
          return;
        }

        // Local VS Mode Logic
        if (gameState.status === "vs_playing") {
          setGameState((p) => ({ ...p, winner: p.winner || winnerName }));
          
          setOnlineResults((prev) => {
            if (prev.find((r) => r.name === winnerName)) return prev;
            const newResults = [
              ...prev,
              {
                id: winnerName,
                name: winnerName,
                score: 0,
                time: finalTime,
                deaths: livesStats ? livesStats[winnerName] || 0 : 0,
              },
            ];
            // End immediately if everyone finished
            if (newResults.length >= 2) {
              setOnlineFinishTimer(0);
            } else if (onlineFinishTimerRef.current === null && (gameState.finishTimerEnabled !== false)) {
              setOnlineFinishTimer(20);
            }
            return newResults;
          });
          return;
        }

        // Local Brawler Mode Logic
        const p1Team = brawlerTeamMode === "TEAMS" ? brawlerTeam1 : 0;
        const p1Name = "P1";
        const isWinner =
          winnerName === p1Name ||
          winnerName === `TEAM ${p1Team + 1}`;
        
        const newWins = isWinner
          ? (gameState.onlineWins || 0) + 1
          : gameState.onlineWins || 0;

        const p2Name = "P2";
        const p2Team = brawlerTeamMode === "TEAMS" ? brawlerTeam2 : 1;
        const results = [
          {
            id: p1Name,
            name: p1Name,
            score: winnerName === "DRAW" ? 0 : (winnerName === p1Name || winnerName === `TEAM ${p1Team + 1}`) ? 1 : 0,
            time: finalTime,
            deaths: livesStats ? livesStats[p1Name] || 0 : 0,
          },
          {
            id: p2Name,
            name: p2Name,
            score: winnerName === "DRAW" ? 0 : (winnerName === p2Name || winnerName === `TEAM ${p2Team + 1}`) ? 1 : 0,
            time: finalTime,
            deaths: livesStats ? livesStats[p2Name] || 0 : 0,
          },
        ];
        results.sort((a, b) => b.score - a.score || a.time - b.time);
        setOnlineResults(results);

        setGameState((p) => ({
          ...p,
          status: "online_summary",
          previousStatus: p.status,
          winner: winnerName,
          onlineWins: newWins,
        }));
        if (isWinner) {
          checkAchievements({ onlineWins: newWins });
        }
        return;
      }

      const playedIds = gameState.playedLevelIds || [];
      const newPlayedIds = playedIds.includes(level.id)
        ? playedIds
        : [...playedIds, level.id];
      const isFlawless = gameState.levelDeaths === 0 && level.id !== "tutorial";
      const newFlawlessCount = isFlawless
        ? (gameState.flawlessLevelsCount || 0) + 1
        : gameState.flawlessLevelsCount || 0;

      checkAchievements({
        totalDeaths: gameState.deaths,
        levelDeaths: gameState.levelDeaths,
        levelTime: gameState.levelTime,
        won: true,
        blocksPlaced: gameState.blocksPlaced,
        levelId: level.id,
        levelsPlayedCount: newPlayedIds.length,
        totalBlocksPlaced: gameState.totalBlocksPlaced,
        totalCoinsCollected: gameState.totalCoinsCollected,
        flawlessLevelsCount: newFlawlessCount,
        totalJumps: gameState.totalJumps,
        hooksUsed: gameState.hooksUsed,
        time: gameState.time,
      });

      const levelBonus = calculateLevelScore(
        gameState.levelTime,
        gameState.levelDeaths,
      );

      // Auto-submit to global leaderboard if it's a story level
      if (level.id && !level.isCustom) {
        const savedGhost = localStorage.getItem(`ghost_${level.id}`);
        let ghostData = undefined;
        if (savedGhost) {
          try {
            ghostData = JSON.parse(savedGhost);
          } catch (e) {}
        }
        leaderboardService.submitScore(
          level.id,
          playerName || "ANON",
          levelBonus,
          gameState.levelTime,
          gameState.levelDeaths,
          ghostData,
        );
      }

      setGameState((prev) => ({
        ...prev,
        status: "won",
        score: prev.score + levelBonus,
        playedLevelIds: newPlayedIds,
        levelsPlayedCount: newPlayedIds.length,
        flawlessLevelsCount: newFlawlessCount,
      }));
    },
    [
      gameState.levelTime,
      gameState.levelDeaths,
      gameState.status,
      gameState.deaths,
      gameState.blocksPlaced,
      checkAchievements,
      level.id,
    ],
  );

  const saveHighscore = () => {
    let saveId: string;
    let isStory = false;

    if (gameState.customLevelsQueue && gameState.customLevelsQueue.length > 0) {
      saveId = gameState.customLevelsQueue[0].id;
    } else if (gameState.customLevelsQueue) {
      // Should not happen, but fallback
      saveId = "CUSTOM_RUN";
    } else {
      saveId = "STORY_MODE";
      isStory = true;
    }

    const newScore: HighScore = {
      levelId: saveId,
      name: playerName || "ANON",
      score: gameState.score,
      time: gameState.time,
      deaths: gameState.deaths,
      date: new Date().toLocaleDateString(),
    };

    const updated = [...highScores, newScore];
    setHighScores(updated);
    localStorage.setItem("ragecube_highscores_v2", JSON.stringify(updated));

    // Redirect to the correct highscore view
    if (isStory) {
      setLevelSource("builtin");
      setHighscoreLevelIndex(0); // Story mode uses index 0 logic in highscore view
    } else if (
      gameState.customLevelsQueue &&
      gameState.customLevelsQueue.length > 0
    ) {
      setLevelSource("custom");
      // Find index in main list
      const idx = customLevels.findIndex((l) => l.id === saveId);
      setHighscoreLevelIndex(idx >= 0 ? idx : 0);
    }

    setGameState((p) => ({ ...p, status: "highscores" }));
  };

  const startRandomRun = () => {
    const normalLevels = customLevels;
    if (normalLevels.length === 0) {
      showToast(t.noCustomLevels);
      return;
    }

    const shuffled = [...normalLevels]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    setLevel(shuffled[0]);
    processedCoins.current.clear();
    setGameState(prev => ({
      ...prev,
      status: "random_run",
      currentLevelIndex: 0,
      deaths: 0,
      levelDeaths: 0,
      time: 0,
      levelTime: 0,
      score: 0,
      levelStartScore: 0,
      lastRoast: "",
      collectedCoins: [],
      customLevelsQueue: shuffled,
      blocksPlaced: 0,
      totalJumps: prev.totalJumps,
      hooksUsed: prev.hooksUsed,
      unlockedAchievements: prev.unlockedAchievements,
    }));
    setRespawnTrigger(0);
  };

  const playSingleCustomLevelHook = (levelData: LevelData) => {
    playSingleCustomLevel(levelData);
  };

  const currentLevelCoins =
    level?.entities?.filter((e) => e.type === "coin").map((e) => e.id!) || [];
  const collectedInLevelCount = currentLevelCoins.filter((id) =>
    gameState.collectedCoins.includes(id),
  ).length;
  const isGoalUnlocked = collectedInLevelCount === currentLevelCoins.length;

  const isStoryMode =
    !gameState.customLevelsQueue && gameState.status !== "tutorial";
  const isLastStoryLevel =
    isStoryMode &&
    gameState.currentLevelIndex >= selectedDifficultySet.length - 1;
  const isCustomGame = !!gameState.customLevelsQueue;
  const showHighscoreInput = isLastStoryLevel || isCustomGame;

  // Render Helpers
  const renderLock = (type: "eyes" | "accessory" | "trail", id: string) => {
    if (!isUnlocked(type, id)) {
      return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 group">
          <span className="text-xl">🔒</span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black border border-red-500 text-red-400 text-[9px] p-1 w-32 text-center hidden group-hover:block pointer-events-none">
            {t.lockedItem} {getLockReason(type, id)}
          </div>
        </div>
      );
    }
    return null;
  };

  const gamescreenLevel = useMemo(() => {
    if (
      !gameState.status.includes("vs") &&
      !gameState.status.includes("brawler") &&
      level.isBrawler &&
      !level.entities.some((e) => e.type === "goal")
    ) {
      return {
        ...level,
        entities: [
          ...level.entities,
          {
            id: "auto_goal",
            type: "goal",
            x: level.startP2?.x || level.start.x + 100,
            y: level.startP2?.y || level.start.y,
            w: 20,
            h: 20,
          },
        ],
      };
    }
    return level;
  }, [level, gameState.status]);

  return (
    <div className="w-full h-full absolute inset-0 bg-neutral-900 flex flex-col p-2 font-arcade text-white select-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full h-full flex flex-col gap-2">
        {/* HUD */}
        {[
          "playing",
          "dead",
          "won",
          "paused",
          "random_run",
          "tutorial",
          "testing",
          "brawler_testing",
          "vs_playing",
          "brawler_playing",
        ].includes(gameState.status) && (
          <div className="w-full shrink-0 bg-neutral-900 border-b border-neutral-700 p-2 flex justify-between items-center z-20">
            <div className="flex flex-col gap-0.5">
              <span className="text-yellow-400 text-sm md:text-base leading-none truncate max-w-[40vw] font-bold">
                {level.name}
              </span>
              {gameState.status === "vs_playing" ||
              gameState.status === "brawler_playing" ||
              gameState.status === "brawler_testing" ? (
                <span className="text-[10px] md:text-xs text-rage-red animate-pulse">
                  {t.vsControls}
                </span>
              ) : (
                level?.id !== "tutorial" &&
                gameState.status !== "testing" &&
                gameState.status !== "brawler_testing" && (
                  <span className="text-[10px] text-neutral-500 hidden sm:block">
                    {t.control}
                  </span>
                )
              )}
              {gameState.status === "random_run" && (
                <span className="text-[10px] text-blue-400">
                  {t.randomRun} {gameState.currentLevelIndex + 1}/
                  {gameState.customLevelsQueue?.length || 1}
                </span>
              )}
              {(gameState.status === "testing" ||
                gameState.status === "brawler_testing") && (
                <span className="text-xs text-blue-300 animate-pulse">
                  {t.testing}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-2">
                {onlineFinishTimer !== null && (
                  <div className="bg-red-600 text-white px-2 py-0.5 animate-pulse border border-white rounded shadow-lg flex items-center gap-1">
                    <span className="text-[8px] font-bold uppercase">
                      Grace:
                    </span>
                    <span className="text-xs font-bold">
                      {onlineFinishTimer}s
                    </span>
                  </div>
                )}
                <div className="bg-neutral-800 text-white px-2 py-0.5 text-[10px] md:text-xs border border-neutral-700">
                  {t.time}: {gameState.time}s
                </div>
                {onlineService.lobbyCode && (
                  <div className="flex gap-1 ml-2">
                    {onlineService.isHost && (
                      <button
                        onClick={() => onlineService.togglePause()}
                        className={`px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase transition-all border-b-2 active:translate-y-px ${onlineService.isPaused ? "bg-green-600 border-green-900 text-white" : "bg-yellow-600 border-yellow-900 text-white"}`}
                      >
                        {onlineService.isPaused ? "RESUME" : "PAUSE"}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (currentVote) return;
                        const type = window.confirm("Restart level?") ? "restart" : null;
                        if (type) onlineService.initiateVote(type);
                      }}
                      disabled={!!currentVote}
                      className={`px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase border-b-2 ${
                        currentVote 
                          ? "bg-neutral-600 text-neutral-400 border-neutral-700 cursor-not-allowed" 
                          : "bg-blue-600 text-white border-blue-900 active:translate-y-px"
                      }`}
                      title="Initiate Restart Vote"
                    >
                      RESET
                    </button>
                    <button
                      onClick={() => {
                        if (currentVote) return;
                        const type = window.confirm("Skip level?") ? "skip" : null;
                        if (type) onlineService.initiateVote(type);
                      }}
                      disabled={!!currentVote}
                      className={`px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase border-b-2 ${
                        currentVote 
                          ? "bg-neutral-600 text-neutral-400 border-neutral-700 cursor-not-allowed" 
                          : "bg-purple-600 text-white border-purple-900 active:translate-y-px"
                      }`}
                      title="Initiate Skip Vote"
                    >
                      SKIP
                    </button>
                    <button
                      onClick={() => {
                        if (currentVote) return;
                        const players = Array.from(onlineService.players.values()).filter(p => p.id !== onlineService.localPlayer?.id);
                        if (players.length === 0) return;
                        const target = players[0]; // Simple kick first other player for now or I'll add a better list if possible
                        if (window.confirm(`Kick ${target.name}?`)) {
                          onlineService.initiateVote("kick", target.id);
                        }
                      }}
                      disabled={!!currentVote}
                      className={`px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase border-b-2 ${
                        currentVote 
                          ? "bg-neutral-600 text-neutral-400 border-neutral-700 cursor-not-allowed" 
                          : "bg-red-600 text-white border-red-900 active:translate-y-px"
                      }`}
                      title="Initiate Kick Vote"
                    >
                      KICK
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area - Maximizes space */}
        <div className="flex-1 relative flex items-center justify-center min-h-0 min-w-0 w-full">
          {/* Aspect Ratio Container */}
          <div 
             className="aspect-video h-full w-full max-w-full max-h-full bg-black shadow-[0_0_50px_rgba(255,0,68,0.2)] border-4 border-neutral-800 rounded-lg overflow-hidden relative flex flex-col items-center justify-center"
          >
            {/* Editor Layer */}
            {gameState.status === "editor" && (
              <LevelEditor
                onSave={handleSaveLevel}
                onExit={() => setGameState((p) => ({ ...p, status: "menu" }))}
                onTest={(levelData, history, historyIndex) => {
                  setEditorData(levelData);
                  setEditorHistory({
                    history: history || [],
                    index: historyIndex || 0,
                  }); // Preserve History
                  setLevel(levelData);
                  setRespawnTrigger(0);
                  processedCoins.current.clear(); // Reset coins for testing session
                  setGameState((p) => ({
                    ...p,
                    status: levelData.isBrawler ? "brawler_testing" : "testing",
                    collectedCoins: [],
                  }));
                }}
                lang={lang}
                initialLevel={editorData}
                isVerified={editorVerified}
                initialHistory={editorHistory?.history}
                initialHistoryIndex={editorHistory?.index}
                showToast={showToast}
              />
            )}

            {/* Custom Level Select Layer */}
            {gameState.status === "custom_level_select" && (
              <CustomLevelSelect
                levels={sortedCustomLevels}
                onPlay={playSingleCustomLevelHook}
                onEdit={handleEditLevel}
                onDelete={handleDeleteLevel}
                onImport={handleImportLevel}
                onBack={() => setGameState((p) => ({ ...p, status: "menu" }))}
                lang={lang}
                selectedIndex={menuSelection}
                setSelectedIndex={setMenuSelection}
                sortMode={levelSortMode}
                onSortChange={(mode) => {
                  setLevelSortMode(mode);
                  setMenuSelection(0);
                }}
                showToast={showToast}
                showGhost={settings.showGhost || false}
                onToggleGhost={() =>
                  setSettings((p) => ({ ...p, showGhost: !p.showGhost }))
                }
              />
            )}

            {/* Delete Confirm Modal */}
            {showDeleteConfirm && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50">
                <h2 className="text-2xl mb-8 text-white">DELETE LEVEL?</h2>
                <div className="text-neutral-400 mb-8">
                  This action cannot be undone.
                </div>
                <div className="w-72 flex flex-col gap-2">
                  <MenuButton
                    index={0}
                    label="CANCEL"
                    onClick={() => setShowDeleteConfirm(null)}
                    isSelected={menuSelection === 0}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={1}
                    label="DELETE"
                    danger
                    onClick={() => {
                      handleDeleteLevel(showDeleteConfirm);
                      setShowDeleteConfirm(null);
                    }}
                    isSelected={menuSelection === 1}
                    onHover={setMenuSelection}
                  />
                </div>
              </div>
            )}

            {/* Game Layer */}
            {[
              "playing",
              "dead",
              "won",
              "paused",
              "settings",
              "random_run",
              "tutorial",
              "testing",
              "brawler_testing",
              "vs_playing",
              "vs_won",
              "brawler_playing",
              "brawler_won",
              "online_summary",
            ].includes(gameState.status) && (
              <GameCanvas
                level={gamescreenLevel}
                customization={customization}
                customizationP2={customizationP2}
                settings={settings}
                onDie={handleDie}
                onWin={handleWin}
                onCoin={handleCoin}
                onBlockPlace={handleBlockPlace}
                onJump={() => {
                  setGameState((p) => {
                    const newJumps = p.totalJumps + 1;
                    checkAchievements({ totalJumps: newJumps });
                    return { ...p, totalJumps: newJumps };
                  });
                }}
                onHook={() => {
                  setGameState((p) => {
                    const newHooks = p.hooksUsed + 1;
                    checkAchievements({ hooksUsed: newHooks });
                    return { ...p, hooksUsed: newHooks };
                  });
                }}
                status={gameState.status}
                collectedCoins={gameState.collectedCoins}
                paused={
                  gameState.status === "paused" ||
                  gameState.status === "won" ||
                  gameState.status === "vs_won" ||
                  gameState.status === "brawler_won" ||
                  gameState.status === "online_summary" ||
                  onlineService.isPaused
                }
                respawnTrigger={respawnTrigger}
                resetTrigger={resetTrigger}
                gameMode={
                  (gameState.status === "paused" ? (gameState.previousStatus || "playing") : gameState.status).includes("vs")
                    ? "vs"
                    : (gameState.status === "paused" ? (gameState.previousStatus || "playing") : gameState.status).includes("brawler")
                      ? "brawler"
                      : "story"
                }
                fpsCap={settings.fpsCap}
                brawlerPowerups={brawlerPowerups}
                brawlerTeamMode={brawlerTeamMode}
                brawlerTeam1={brawlerTeam1}
                brawlerTeam2={brawlerTeam2}
                brawlerHazardMode={brawlerHazardMode}
                brawlerSuddenDeath={brawlerSuddenDeath}
                vsCollision={gameState.collisionEnabled}
                isOnline={!!onlineService.lobbyCode}
                onlinePing={onlineService.ping}
                onlinePlayers={onlinePlayers}
                lang={lang}
                isSpectating={gameState.isSpectating}
                spectateTargetId={gameState.spectateTargetId}
                opponentOpacity={settings.opponentOpacity}
              />
            )}

            {/* Online Pause Overlay */}
            {onlineService.lobbyCode && onlineService.isPaused && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-[60] backdrop-blur-sm">
                <div className="bg-neutral-900 border-4 border-yellow-500 p-10 rounded-2xl flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                  <div className="text-6xl font-arcade text-yellow-500 tracking-widest drop-shadow-[0_0_20px_#eab308]">GAME PAUSED</div>
                  <div className="text-neutral-400 font-bold uppercase tracking-[0.3em]">HOST HAS PAUSED THE MATCH</div>
                  {onlineService.isHost && (
                    <button
                      onClick={() => onlineService.togglePause()}
                      className="mt-4 bg-green-600 hover:bg-green-500 text-white px-10 py-5 font-arcade text-2xl border-b-8 border-green-900 active:translate-y-2 active:border-b-0 transition-all rounded-xl"
                    >
                      RESUME GAME
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Voting UI Overlay */}
            {onlineService.lobbyCode && currentVote && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[70] w-full max-w-md pt-2">
                <div className="bg-black/90 border-b-2 border-x-2 border-cyan-500 p-4 rounded-b-2xl shadow-[0_10px_30px_rgba(6,182,212,0.5)] flex flex-col items-center animate-in slide-in-from-top duration-500 ease-out backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 bg-cyan-500 animate-pulse rounded-full shadow-[0_0_10px_#06b6d4]"></div>
                    <span className="text-cyan-400 text-xs font-black uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                      {t.voteRunning || "VOTING IN PROGRESS"}
                    </span>
                    <div className="w-2 h-2 bg-cyan-500 animate-pulse rounded-full shadow-[0_0_10px_#06b6d4]"></div>
                  </div>
                  
                  <div className="text-white text-lg font-arcade mb-4 uppercase tracking-tight text-center px-4 leading-tight">
                    {currentVote.type === 'restart' || currentVote.type === 'repeat' ? 'RESTART LEVEL?' : 
                     currentVote.type === 'skip' || currentVote.type === 'next' ? 'SKIP LEVEL?' : 
                     currentVote.type === 'kick' ? `KICK ${onlineService.players.get(currentVote.targetId || '')?.name.toUpperCase() || 'PLAYER'}?` : 'CALL A VOTE?'}
                  </div>
                  
                  <div className="flex gap-4 w-full px-6 mb-4">
                    <button 
                      onClick={() => onlineService.castVote('yes')}
                      className={`flex-1 py-3 px-4 font-arcade text-sm border-b-4 rounded-xl transition-all shadow-lg flex flex-col items-center
                        ${(onlineService.localPlayer && currentVote.votes[onlineService.localPlayer.id] === 'yes')
                          ? "bg-green-700 text-white border-green-950 scale-105 opacity-100" 
                          : "bg-green-600 hover:bg-green-500 text-white/80 border-green-900 active:translate-y-1 active:border-b-0 opacity-80"
                        }`}
                    >
                      <span className="block mb-1">JA [1]</span>
                      <span className="text-xs opacity-80 bg-black/30 px-2 py-0.5 rounded-full">
                        {Object.values(currentVote.votes).filter(v => v === 'yes').length}
                      </span>
                    </button>
                    <button 
                      onClick={() => onlineService.castVote('no')}
                      className={`flex-1 py-3 px-4 font-arcade text-sm border-b-4 rounded-xl transition-all shadow-lg flex flex-col items-center
                        ${(onlineService.localPlayer && currentVote.votes[onlineService.localPlayer.id] === 'no')
                          ? "bg-red-700 text-white border-red-950 scale-105 opacity-100" 
                          : "bg-red-600 hover:bg-red-500 text-white/80 border-red-900 active:translate-y-1 active:border-b-0 opacity-80"
                        }`}
                    >
                      <span className="block mb-1">NEIN [2]</span>
                      <span className="text-xs opacity-80 bg-black/30 px-2 py-0.5 rounded-full">
                        {Object.values(currentVote.votes).filter(v => v === 'no').length}
                      </span>
                    </button>
                  </div>
                  
                  <div className="w-full px-6">
                    <div className="relative h-2 bg-neutral-800/80 rounded-full w-full overflow-hidden border border-white/5">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-100 linear"
                        style={{ width: `${Math.max(0, (currentVote.endTime - Date.now()) / 15000 * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] text-neutral-400 font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                     <span>{Object.keys(currentVote.votes).length}</span>
                     <span className="opacity-30">/</span>
                     <span>{Array.from(onlineService.players.values()).length} {t.players?.toUpperCase() || 'PLAYERS'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Difficulty Select */}
            {gameState.status === "difficulty_select" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 overflow-y-auto py-10">
                <h2 className="text-2xl mb-8 text-white uppercase tracking-widest">{t.selectDifficulty || "SELECT DIFFICULTY"}</h2>
                <div className="w-72 flex flex-col gap-2">
                  <MenuButton
                    index={0}
                    label={`${t.beginner || "BEGINNER"} (${INITIAL_LEVELS.length})`}
                    onClick={() => startStoryGame(INITIAL_LEVELS)}
                    isSelected={menuSelection === 0}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={1}
                    label={`${t.advanced || "ADVANCED"} (${ADVANCED_LEVELS.length})`}
                    onClick={() => startStoryGame(ADVANCED_LEVELS)}
                    isSelected={menuSelection === 1}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={2}
                    label={`${t.expert || "EXPERT"} (${EXPERT_LEVELS.length})`}
                    onClick={() => startStoryGame(EXPERT_LEVELS)}
                    isSelected={menuSelection === 2}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={3}
                    label={`${t.god || "JUMP GOD"} (${GOD_LEVELS.length})`}
                    onClick={() => startStoryGame(GOD_LEVELS)}
                    danger
                    isSelected={menuSelection === 3}
                    onHover={setMenuSelection}
                  />
                    <MenuButton
                      index={4}
                      label={t.back}
                      onClick={() =>
                        setGameState((p) => ({ ...p, status: "menu" }))
                      }
                      isSelected={menuSelection === 4}
                      onHover={setMenuSelection}
                    />
                    <button
                      onClick={() => setGameState(p => ({ ...p, status: "settings", previousStatus: "difficulty_select" }))}
                      className="mt-4 px-6 py-2 bg-neutral-800 text-white hover:bg-neutral-700 rounded-lg font-arcade text-[10px] transition-all border-b-4 border-neutral-900 active:translate-y-px active:border-b-0 flex items-center justify-center gap-2"
                    >
                      ⚙️ {t.settings || "SETTINGS"}
                    </button>
                </div>
              </div>
            )}

            {/* Random Run Setup Screen */}
            {gameState.status === "random_run_setup" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30">
                <h2 className="text-3xl mb-8 text-white uppercase">{t.randomRun || "ZUFALLS-LAUF"}</h2>
                <div className="w-72 flex flex-col gap-2">
                    <MenuButton
                      index={0}
                      label={t.startRun || "START RUN"}
                      onClick={startRandomRun}
                      isSelected={menuSelection === 0}
                      onHover={setMenuSelection}
                    />
                    <MenuButton
                      index={1}
                      label={t.back}
                      onClick={() => setGameState((p) => ({ ...p, status: "menu" }))}
                      isSelected={menuSelection === 1}
                      onHover={setMenuSelection}
                    />
                    <button
                      onClick={() => setGameState(p => ({ ...p, status: "settings", previousStatus: "random_run_setup" }))}
                      className="mt-4 px-6 py-2 bg-neutral-800 text-white hover:bg-neutral-700 rounded-lg font-arcade text-[10px] transition-all border-b-4 border-neutral-900 active:translate-y-px active:border-b-0 flex items-center justify-center gap-2"
                    >
                      ⚙️ {t.settings || "SETTINGS"}
                    </button>
                </div>
              </div>
            )}

            {/* VS Setup Screen - IMPROVED */}
            {(gameState.status === "vs_setup" ||
              gameState.status === "brawler_setup") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white z-30 overflow-y-auto py-10">
                <h2 className="text-3xl mb-4 text-rage-red">
                  {gameState.status === "brawler_setup"
                    ? "BRAWLER MODE"
                    : t.vsTitle}
                </h2>

                <div className="flex gap-8 w-full max-w-4xl px-4 mb-6">
                  {/* Player 1 Config */}
                  <div className="flex-1 border border-neutral-700 p-4 bg-neutral-900/50 flex flex-col items-center">
                    <h3 className="text-xl font-bold text-red-500 mb-2">
                      {t.player1}
                    </h3>
                    {/* Preview */}
                    <div className="w-48 h-48 bg-black border border-neutral-600 mb-2 flex items-center justify-center relative shrink-0">
                      <CharacterPreview
                        customization={customization}
                        scale={6}
                      />
                    </div>
                    <div className="flex flex-col gap-1 h-56 overflow-y-auto custom-scrollbar w-full">
                      <SliderRow
                        label={t.red}
                        value={hexToRgb(customization.color).r}
                        index={0}
                        colorClass="bg-red-500"
                        onChange={(v: number) =>
                          setExactRGB(1, "color", "r", v)
                        }
                        isSelected={menuSelection === 0}
                        onHover={setMenuSelection}
                      />
                      <SliderRow
                        label={t.green}
                        value={hexToRgb(customization.color).g}
                        index={1}
                        colorClass="bg-green-500"
                        onChange={(v: number) =>
                          setExactRGB(1, "color", "g", v)
                        }
                        isSelected={menuSelection === 1}
                        onHover={setMenuSelection}
                      />
                      <SliderRow
                        label={t.blue}
                        value={hexToRgb(customization.color).b}
                        index={2}
                        colorClass="bg-blue-500"
                        onChange={(v: number) =>
                          setExactRGB(1, "color", "b", v)
                        }
                        isSelected={menuSelection === 2}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={3}
                        label={`${t.eyes}: ${t.eye_names?.[customization.eyes] || customization.eyes}`}
                        onClick={() => rotateOption(1, "eyes", 1)}
                        isSelected={menuSelection === 3}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={4}
                        label={`${t.hat || 'ITEM'}: ${t.acc_names?.[customization.accessory] || customization.accessory}`}
                        onClick={() => rotateOption(1, "accessory", 1)}
                        isSelected={menuSelection === 4}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={5}
                        label={`${t.trail || 'SCHWEIF'}: ${TRAIL_PRESETS.find(p => p.val === customization.trailColor)?.name || 'CUSTOM'}`}
                        onClick={() => rotateOption(1, "trail", 1)}
                        isSelected={menuSelection === 5}
                        onHover={setMenuSelection}
                      />
                      <div className="flex gap-1 w-full">
                        <button
                          onClick={() => toggleFavorite('skin', `${customization.eyes}_${customization.accessory}`)}
                          className={`flex-1 py-1 text-[8px] font-black uppercase tracking-tighter border transition-all ${
                            (settings.favoriteSkins || []).includes(`${customization.eyes}_${customization.accessory}`)
                              ? "bg-yellow-600 border-yellow-400 text-white"
                              : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-white"
                          }`}
                        >
                          ⭐ SKIN FAVORITE
                        </button>
                        <button
                          onClick={() => toggleFavorite('trail', customization.trailColor)}
                          className={`flex-1 py-1 text-[8px] font-black uppercase tracking-tighter border transition-all ${
                            (settings.favoriteTrails || []).includes(customization.trailColor)
                              ? "bg-yellow-600 border-yellow-400 text-white"
                              : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-white"
                          }`}
                        >
                          ⭐ TRAIL FAVORITE
                        </button>
                      </div>
                      {gameState.status === "brawler_setup" && (
                        <div className="w-full flex justify-center">
                          <button
                            onClick={() => rotateOption(1, "brawlerClass", 1)}
                            className="w-full py-1.5 bg-neutral-900 border border-neutral-700 text-white font-black uppercase text-[10px] tracking-widest mt-1 hover:bg-neutral-800 transition-colors"
                          >
                            {t.class || 'CLASS'}: {customization.brawlerClass?.toUpperCase() || "FIGHTER"}
                          </button>
                        </div>
                      )}
                      {gameState.status === "brawler_setup" && (
                        <div className="w-full bg-black/40 p-2 rounded border border-white/5 mt-1 flex flex-col gap-1.5">
                          <StatBar label="HP" value={BRAWLER_STATS[customization.brawlerClass || "standard"].hp} max={15} color="bg-red-500" />
                          <StatBar label="SPD" value={BRAWLER_STATS[customization.brawlerClass || "standard"].speed} max={15} color="bg-blue-500" />
                          <StatBar label="JMP" value={BRAWLER_STATS[customization.brawlerClass || "standard"].jump} max={15} color="bg-green-500" />
                        </div>
                      )}
                      {gameState.status === "brawler_setup" && (
                        <div className="w-full text-center flex flex-col gap-0.5 mt-1">
                          <div className="text-[7px] text-green-400 uppercase font-bold tracking-wider">{t.brawlerClasses[customization.brawlerClass || "standard"]?.pos}</div>
                          <div className="text-[7px] text-red-500 uppercase font-bold tracking-wider">{t.brawlerClasses[customization.brawlerClass || "standard"]?.neg}</div>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                          const eyesPool = EYE_OPTIONS.filter(opt => isUnlocked('eyes', opt));
                          const accPool = ACC_OPTIONS.filter(opt => isUnlocked('accessory', opt) && opt !== 'unicorn');
                          const trailPool = TRAIL_PRESETS.filter(opt => isUnlocked('trail', opt.val));
                          const randomEyes = eyesPool[Math.floor(Math.random() * eyesPool.length)] || 'normal';
                          const randomAcc = accPool[Math.floor(Math.random() * accPool.length)] || 'none';
                          const randomTrail = trailPool[Math.floor(Math.random() * trailPool.length)]?.val || randomColor;
                          setCustomization(prev => ({ ...prev, color: randomColor, eyes: randomEyes, accessory: randomAcc, trailColor: randomTrail }));
                        }}
                        className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-white font-black uppercase tracking-widest mt-1 transition-all active:scale-95"
                      >
                        🎲 {t.random}
                      </button>
                    </div>
                  </div>

                  {/* Player 2 Config */}
                  <div className="flex-1 border border-neutral-700 p-4 bg-neutral-900/50 flex flex-col items-center">
                    <h3 className="text-xl font-bold text-green-500 mb-2">
                      {t.player2}
                    </h3>
                    {/* Preview */}
                    <div className="w-48 h-48 bg-black border border-neutral-600 mb-2 flex items-center justify-center relative shrink-0">
                      <CharacterPreview
                        customization={customizationP2}
                        scale={6}
                      />
                    </div>
                    <div className="flex flex-col gap-1 h-56 overflow-y-auto custom-scrollbar w-full">
                      <SliderRow
                        label={t.red}
                        value={hexToRgb(customizationP2.color).r}
                        index={6}
                        colorClass="bg-red-500"
                        onChange={(v: number) =>
                          setExactRGB(2, "color", "r", v)
                        }
                        isSelected={menuSelection === 6}
                        onHover={setMenuSelection}
                      />
                      <SliderRow
                        label={t.green}
                        value={hexToRgb(customizationP2.color).g}
                        index={7}
                        colorClass="bg-green-500"
                        onChange={(v: number) =>
                          setExactRGB(2, "color", "g", v)
                        }
                        isSelected={menuSelection === 7}
                        onHover={setMenuSelection}
                      />
                      <SliderRow
                        label={t.blue}
                        value={hexToRgb(customizationP2.color).b}
                        index={8}
                        colorClass="bg-blue-500"
                        onChange={(v: number) =>
                          setExactRGB(2, "color", "b", v)
                        }
                        isSelected={menuSelection === 8}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={9}
                        label={`${t.eyes}: ${t.eye_names?.[customizationP2.eyes] || customizationP2.eyes}`}
                        onClick={() => rotateOption(2, "eyes", 1)}
                        isSelected={menuSelection === 9}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={10}
                        label={`${t.hat || 'ITEM'}: ${t.acc_names?.[customizationP2.accessory] || customizationP2.accessory}`}
                        onClick={() => rotateOption(2, "accessory", 1)}
                        isSelected={menuSelection === 10}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={11}
                        label={`${t.trail || 'SCHWEIF'}: ${TRAIL_PRESETS.find(p => p.val === customizationP2.trailColor)?.name || 'CUSTOM'}`}
                        onClick={() => rotateOption(2, "trail", 1)}
                        isSelected={menuSelection === 11}
                        onHover={setMenuSelection}
                      />
                      {gameState.status === "brawler_setup" && (
                        <div className="w-full flex justify-center">
                          <button
                            onClick={() => rotateOption(2, "brawlerClass", 1)}
                            className="w-full py-1.5 bg-neutral-900 border border-neutral-700 text-white font-black uppercase text-[10px] tracking-widest mt-1 hover:bg-neutral-800 transition-colors"
                          >
                            {t.class || 'CLASS'}: {customizationP2.brawlerClass?.toUpperCase() || "FIGHTER"}
                          </button>
                        </div>
                      )}
                      {gameState.status === "brawler_setup" && (
                        <div className="w-full bg-black/40 p-2 rounded border border-white/5 mt-1 flex flex-col gap-1.5">
                          <StatBar label="HP" value={BRAWLER_STATS[customizationP2.brawlerClass || "standard"].hp} max={15} color="bg-red-500" />
                          <StatBar label="SPD" value={BRAWLER_STATS[customizationP2.brawlerClass || "standard"].speed} max={15} color="bg-blue-500" />
                          <StatBar label="JMP" value={BRAWLER_STATS[customizationP2.brawlerClass || "standard"].jump} max={15} color="bg-green-500" />
                        </div>
                      )}
                      {gameState.status === "brawler_setup" && (
                        <div className="w-full text-center flex flex-col gap-0.5 mt-1">
                          <div className="text-[7px] text-green-400 uppercase font-bold tracking-wider">{t.brawlerClasses[customizationP2.brawlerClass || "standard"]?.pos}</div>
                          <div className="text-[7px] text-red-500 uppercase font-bold tracking-wider">{t.brawlerClasses[customizationP2.brawlerClass || "standard"]?.neg}</div>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                          const eyesPool = EYE_OPTIONS.filter(opt => isUnlocked('eyes', opt));
                          const accPool = ACC_OPTIONS.filter(opt => isUnlocked('accessory', opt) && opt !== 'unicorn');
                          const trailPool = TRAIL_PRESETS.filter(opt => isUnlocked('trail', opt.val));
                          const randomEyes = eyesPool[Math.floor(Math.random() * eyesPool.length)] || 'normal';
                          const randomAcc = accPool[Math.floor(Math.random() * accPool.length)] || 'none';
                          const randomTrail = trailPool[Math.floor(Math.random() * trailPool.length)]?.val || randomColor;
                          setCustomizationP2(prev => ({ ...prev, color: randomColor, eyes: randomEyes, accessory: randomAcc, trailColor: randomTrail }));
                        }}
                        className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-white font-black uppercase tracking-widest mt-1 transition-all active:scale-95"
                      >
                        🎲 ZUFALL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Level Select */}
                <div className="w-full max-w-lg border-t border-neutral-700 pt-4 flex flex-col items-center">
                  <div className="flex gap-2 w-72 mb-4">
                    <MenuButton
                      index={12}
                      label={t.levelMenu || "LEVEL MENU"}
                      onClick={() => setShowLevelMenu(true)}
                      isSelected={menuSelection === 12}
                      onHover={setMenuSelection}
                    />
                  </div>

                  {selectedLevels.length > 0 && (
                    <div className="mb-6 flex flex-col items-center">
                      <div className="text-[10px] text-neutral-400 font-bold mb-2 uppercase tracking-widest">
                        Ausgewählte Level
                      </div>
                      <div className="w-48 aspect-video bg-black border border-neutral-700 rounded overflow-hidden shadow-lg relative">
                        <LevelPreview
                          level={selectedLevels[0]}
                          width={192}
                          height={108}
                          className="w-full h-full"
                        />
                        {selectedLevels.length > 1 && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-2">
                            <div className="text-[10px] text-yellow-400 font-black uppercase mb-1 tracking-tighter">
                              Queue Active
                            </div>
                            <div className="text-[8px] text-white flex flex-col gap-0.5 w-full text-center overflow-hidden">
                              {selectedLevels.slice(0, 4).map((sl, i) => (
                                <div
                                  key={sl.id}
                                  className="truncate px-1 bg-white/10 rounded"
                                >
                                  {i + 1}. {sl.name}
                                </div>
                              ))}
                              {selectedLevels.length > 4 && (
                                <div>+ {selectedLevels.length - 4} MORE</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 font-bold truncate max-w-[200px] text-white text-sm text-center">
                        {selectedLevels.length > 1
                          ? `${selectedLevels.length} ${t.levels || "LEVELS"} ${t.selected || "SELECTED"}`
                          : selectedLevels[0].name}
                      </div>
                    </div>
                  )}

                  <div className="w-72 flex flex-col gap-2">
                    {gameState.status === "vs_setup" && (
                      <MenuButton
                        index={13}
                        label={`${t.collisionLabel || "COLLISION"}: ${gameState.collisionEnabled ? (t.onLabel || "ON") : (t.offLabel || "OFF")}`}
                        onClick={() => setGameState(p => ({ ...p, collisionEnabled: !p.collisionEnabled }))}
                        isSelected={menuSelection === 13}
                        onHover={setMenuSelection}
                      />
                    )}
                    {(gameState.status === "vs_setup" || gameState.status === "brawler_setup") && (
                      <MenuButton
                        index={14}
                        label={`${t.finishTimerLabel || "LEVEL-TIMER"}: ${gameState.finishTimerEnabled !== false ? (t.onLabel || "ON") : (t.offLabel || "OFF")}`}
                        onClick={() => setGameState(p => ({ ...p, finishTimerEnabled: p.finishTimerEnabled === false ? true : false }))}
                        isSelected={menuSelection === 14}
                        onHover={setMenuSelection}
                      />
                    )}
                    <MenuButton
                      index={15}
                      label={t.play}
                      onClick={() => {
                        let currentList =
                          levelSource === "builtin"
                            ? gameState.status === "brawler_setup"
                              ? BRAWLER_LEVELS
                              : INITIAL_LEVELS
                            : customLevels;
                        if (gameState.status === "vs_setup") {
                          currentList = filterVSLevels(currentList);
                        }
                        if (gameState.status === "brawler_setup") {
                          currentList = filterBrawlerLevels(currentList);
                        }
                        if (currentList.length > 0) {
                          const idx = Math.min(
                            Math.max(0, highscoreLevelIndex),
                            Math.max(0, currentList.length - 1),
                          );
                          setLevel(currentList[idx]);
                          setGameState((p) => ({
                            ...p,
                            status:
                              gameState.status === "brawler_setup"
                                ? "brawler_powerup_setup"
                                : "vs_playing",
                            levelDeaths: 0,
                            levelTime: 0,
                            collectedCoins: [],
                            deaths: 0,
                            blocksPlaced: 0,
                          }));
                          if (gameState.status !== "brawler_setup") {
                            setRespawnTrigger(0);
                            checkAchievements({ mode: "vs" });
                          } else {
                            setMenuSelection(0);
                          }
                        }
                      }}
                      isSelected={menuSelection === 15}
                      onHover={setMenuSelection}
                    />
                    <MenuButton
                      index={16}
                      label={t.back}
                      danger
                      onClick={() =>
                        setGameState((p) => ({ ...p, status: "menu" }))
                      }
                      isSelected={menuSelection === 16}
                      onHover={setMenuSelection}
                    />
                    <button
                      onClick={() => setGameState(p => ({ ...p, status: "settings", previousStatus: gameState.status }))}
                      className="mt-2 px-6 py-3 bg-neutral-800 text-white hover:bg-neutral-700 rounded-xl font-arcade text-[10px] transition-all border-b-4 border-neutral-900 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-3 w-full"
                    >
                      ⚙️ {t.settings || "SETTINGS"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Brawler Powerup Setup Screen */}
            {gameState.status === "brawler_powerup_setup" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white z-30">
                <h2 className="text-3xl mb-4 text-rage-red">
                  {t.brawlerSettings || "BRAWLER SETTINGS"}
                </h2>

                <div className="flex flex-col gap-4 w-full max-w-lg px-4 mb-6 h-96 overflow-y-auto custom-scrollbar">
                  {/* Sudden Death Toggle */}
                  <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">
                        SUDDEN DEATH
                      </div>
                      <button
                        onClick={() => {
                          if (gameState.onlineMode && !onlineService.isHost) return;
                          const newVal = !brawlerSuddenDeath;
                          setBrawlerSuddenDeath(newVal);
                          if (onlineService.isHost) {
                            onlineService.broadcastLobbyState(
                              undefined,
                              undefined,
                              undefined,
                              undefined,
                              undefined,
                              undefined,
                              undefined,
                              undefined,
                              undefined,
                              undefined,
                              newVal
                            );
                          }
                        }}
                        className={`w-12 h-6 flex items-center rounded-full transition-all ${brawlerSuddenDeath ? "bg-orange-600" : "bg-neutral-600"} ${gameState.onlineMode && !onlineService.isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${brawlerSuddenDeath ? "translate-x-7" : "translate-x-1"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Hazard Mode Selection */}
                  <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                    <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-3">
                      UMGEBUNGS-GEFAHREN
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {(
                        ["none", "collapsing_platforms"] as BrawlerHazardMode[]
                      ).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            if (gameState.onlineMode && !onlineService.isHost) return;
                            setBrawlerHazardMode(mode);
                            if (onlineService.isHost)
                              onlineService.broadcastLobbyState(
                                undefined,
                                undefined,
                                undefined,
                                brawlerTeamMode,
                                mode,
                              );
                          }}
                          className={`py-2 text-[10px] font-arcade border transition-all ${brawlerHazardMode === mode ? "bg-orange-600 border-orange-400 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]" : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700"}`}
                        >
                          {mode === "none"
                            ? "KEINE"
                            : mode.replace("_", " ").toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[1px] bg-neutral-800 my-2"></div>
                  <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest px-2">
                    POWERUPS
                  </div>

                  {Object.keys(brawlerPowerups).map((key, idx) => {
                    const label = key
                      .replace("powerup_", "")
                      .replace(/_/g, " ")
                      .toUpperCase();
                    const isOn = brawlerPowerups[key] > 0;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <button
                          className={`w-16 py-2 text-xs font-bold border transition-colors ${isOn ? "bg-green-600 border-green-500 text-white hover:bg-green-500" : "bg-red-900/50 border-red-800 text-red-300 hover:bg-red-800/50"}`}
                          onClick={() => {
                            if (gameState.onlineMode && !onlineService.isHost) return;
                            const newPowerups = { ...brawlerPowerups, [key]: isOn ? 0 : 100 };
                            setBrawlerPowerups(newPowerups);
                            if (gameState.onlineMode && onlineService.isHost) {
                                onlineService.broadcastLobbyState(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, newPowerups);
                            }
                          }}
                        >
                          {isOn ? (t.onLabel || "ON") : (t.offLabel || "OFF")}
                        </button>
                        <div className="flex-1">
                          <SliderRow
                            label={label}
                            value={brawlerPowerups[key]}
                            index={idx}
                            colorClass="bg-yellow-500"
                            onChange={(v: number) => {
                              if (gameState.onlineMode && !onlineService.isHost) return;
                              const newPowerups = { ...brawlerPowerups, [key]: v };
                              setBrawlerPowerups(newPowerups);
                              if (gameState.onlineMode && onlineService.isHost) {
                                  onlineService.broadcastLobbyState(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, newPowerups);
                              }
                            }}
                            isSelected={menuSelection === idx}
                            onHover={setMenuSelection}
                            max={100}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="w-72 flex flex-col gap-2">
                  {!gameState.onlineMode && (
                      <MenuButton
                        index={Object.keys(brawlerPowerups).length}
                        label="START BRAWL"
                        onClick={() => {
                            setGameState((p) => ({
                              ...p,
                              status: "brawler_playing",
                            }));
                            setRespawnTrigger(0);
                            checkAchievements({ mode: "vs" });
                        }}
                        isSelected={
                          menuSelection === Object.keys(brawlerPowerups).length
                        }
                        onHover={setMenuSelection}
                      />
                  )}
                  <MenuButton
                    index={Object.keys(brawlerPowerups).length + 1}
                    label={t.back}
                    danger
                    onClick={() =>
                      setGameState((p) => ({ ...p, status: p.previousStatus === "online_lobby" ? "online_lobby" : "brawler_setup" }))
                    }
                    isSelected={
                      menuSelection === Object.keys(brawlerPowerups).length + 1
                    }
                    onHover={setMenuSelection}
                  />
                </div>
              </div>
            )}

            {/* Achievements Menu - IMPROVED LIST VIEW */}
            {gameState.status === "achievements" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white z-30">
                <div className="flex items-center justify-between w-full max-w-3xl mb-6 px-4">
                  <h2 className="text-3xl text-yellow-500 font-arcade tracking-widest">
                    ERRUNGENSCHAFTEN
                  </h2>
                  <div className="text-right">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      UNLOCKED
                    </div>
                    <div className="text-2xl text-white font-arcade">
                      {gameState.unlockedAchievements.length}{" "}
                      <span className="text-neutral-700">/</span>{" "}
                      {ACHIEVEMENTS_LIST.length}
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-3xl h-[60vh] overflow-y-auto px-2 custom-scrollbar flex flex-col gap-3 pb-4">
                  {ACHIEVEMENTS_LIST.map((ach) => {
                    const isUnlocked = gameState.unlockedAchievements.includes(
                      ach.id,
                    );
                    const achData = (t.achievements_data as any)[ach.id] || {
                      title: ach.title,
                      desc: ach.description,
                    };

                    return (
                      <div
                        key={ach.id}
                        className={`w-full p-4 border-l-4 border-y border-r rounded-r-lg flex items-center gap-4 transition-all duration-300 ${isUnlocked ? "bg-neutral-900 border-l-yellow-500 border-y-neutral-800 border-r-neutral-800 shadow-[0_0_20px_rgba(234,179,8,0.1)]" : "bg-black border-l-neutral-700 border-y-neutral-900 border-r-neutral-900 opacity-70"}`}
                      >
                        {/* Icon */}
                        <div
                          className={`w-16 h-16 shrink-0 flex items-center justify-center rounded-lg border-2 text-3xl shadow-inner ${isUnlocked ? "bg-neutral-800 border-yellow-900/50 text-white" : "bg-neutral-950 border-neutral-800 text-neutral-700 grayscale"}`}
                        >
                          {ach.icon}
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div
                            className={`font-bold font-arcade text-base md:text-lg mb-1 ${isUnlocked ? "text-yellow-400" : "text-neutral-500"}`}
                          >
                            {achData.title}
                          </div>
                          <div
                            className={`text-xs md:text-sm font-mono leading-snug ${isUnlocked ? "text-neutral-300" : "text-neutral-600"}`}
                          >
                            {achData.desc}
                          </div>
                        </div>

                        {/* Reward Section */}
                        {ach.reward && (
                          <div
                            className={`shrink-0 flex flex-col items-end border-l pl-4 ${isUnlocked ? "border-neutral-700" : "border-neutral-900"}`}
                          >
                            <div className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 mb-1">
                              BELOHNUNG
                            </div>
                            <div
                              className={`text-xs font-bold font-arcade px-2 py-1 rounded ${isUnlocked ? "bg-blue-900/30 text-blue-300 border border-blue-800" : "bg-neutral-900 text-neutral-600 border border-neutral-800"}`}
                            >
                              {ach.reward}
                            </div>
                          </div>
                        )}

                        {/* Status Icon */}
                        <div className="shrink-0 w-6 flex justify-center">
                          {isUnlocked ? (
                            <span className="text-green-500 text-xl font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="text-neutral-800 text-xl">🔒</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="w-72 mt-6">
                  <MenuButton
                    index={0}
                    label={t.back}
                    onClick={() =>
                      setGameState((p) => ({ ...p, status: "menu" }))
                    }
                    isSelected={menuSelection === 0}
                    onHover={setMenuSelection}
                  />
                </div>
              </div>
            )}

            {/* Main Menu */}
            {gameState.status === "menu" && (
              <div className="absolute inset-0 flex flex-col items-center justify-between p-8 z-30 overflow-hidden bg-neutral-950">
                {/* Volcanic Background */}
                <div className="absolute inset-0 z-[-1]">
                  <img 
                    src="https://picsum.photos/seed/volcano/1920/1080?blur=2" 
                    alt="Volcanic Background" 
                    className="w-full h-full object-cover opacity-60 mix-blend-overlay scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-transparent to-red-950 opacity-80"></div>
                  <div className="absolute inset-0 bg-black/40"></div>
                  
                  {/* Lava particles / glow effects can be added here if needed */}
                </div>

                {/* Split Logo */}
                <div className="mt-8 md:mt-12 flex flex-col md:flex-row gap-4 md:gap-16 relative items-center">
                  <h1 className="text-5xl sm:text-7xl md:text-9xl lava-text font-arcade tracking-[-0.15em] relative">
                    RAGE
                    <div className="absolute -inset-2 blur-xl bg-orange-600/30 -z-10 animate-pulse"></div>
                  </h1>
                  <h1 className="text-5xl sm:text-7xl md:text-9xl lava-text font-arcade tracking-[-0.15em] relative">
                    CUBE
                    <div className="absolute -inset-2 blur-xl bg-orange-600/30 -z-10 animate-pulse"></div>
                  </h1>
                </div>

                {/* Quick Customizer (Stone Frame) - Hidden on very small screens or repositioned */}
                <div className="hidden lg:flex absolute left-8 bottom-8 z-20 flex-col items-center lava-btn-bg p-5 rounded-sm lava-border min-w-[220px] max-w-[240px] scale-90 origin-bottom-left transition-all hover:scale-95 duration-300">
                  <div className="text-[10px] font-black text-yellow-500 mb-6 tracking-[0.3em] uppercase drop-shadow-[0_2px_2px_#000]">{t.quickCustomizer}</div>

                  <div className="grid grid-cols-1 gap-3 w-full h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="flex flex-col gap-2 w-full">
                        <span className="text-[9px] text-red-700 font-black uppercase tracking-widest border-b border-red-900/50 pb-1">{t.colorLabel}</span>
                        <div className="flex gap-2 justify-center py-2">
                           {['#ff3300', '#00ff88', '#00ccff', '#fbbf24', '#ff00ff'].map(c => (
                             <button 
                               key={c}
                               onClick={() => setCustomization(p => ({ ...p, color: c }))}
                               className={`w-8 h-8 rounded-full border-2 ${customization.color === c ? 'border-white scale-125 shadow-[0_0_10px_#fff]' : 'border-black/50 opacity-60 hover:opacity-100 hover:scale-110'} transition-all`}
                               style={{ backgroundColor: c }}
                             />
                           ))}
                        </div>
                        
                        <div className="space-y-1">
                          <SliderRow label="R" value={hexToRgb(customization.color).r} index={100} colorClass="bg-red-600" onChange={(v: number) => setExactRGB(1, "color", "r", v)} isSelected={false} onHover={() => {}} />
                          <SliderRow label="G" value={hexToRgb(customization.color).g} index={101} colorClass="bg-green-600" onChange={(v: number) => setExactRGB(1, "color", "g", v)} isSelected={false} onHover={() => {}} />
                          <SliderRow label="B" value={hexToRgb(customization.color).b} index={102} colorClass="bg-blue-600" onChange={(v: number) => setExactRGB(1, "color", "b", v)} isSelected={false} onHover={() => {}} />
                        </div>
                      </div>

                     <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-red-700 font-black uppercase tracking-widest border-b border-red-900/50 pb-1">{t.eyesLabel}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <button onClick={() => rotateOption(1, "eyes", -1)} className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs">◀</button>
                           <div className="flex-1 text-center">
                              <div className={`text-[9px] text-white font-black uppercase drop-shadow-[0_1px_1px_#000] ${!isUnlocked('eyes', customization.eyes) ? 'opacity-50 text-red-500' : ''}`}>
                                {t.eye_names?.[customization.eyes] || customization.eyes}
                                {!isUnlocked('eyes', customization.eyes) && ' 🔒'}
                              </div>
                              {!isUnlocked('eyes', customization.eyes) && (
                                <div className="text-[7px] text-red-400 font-bold uppercase leading-none mt-0.5 opacity-80">
                                   {getLockReason('eyes', customization.eyes)}
                                </div>
                              )}
                           </div>
                           <button onClick={() => rotateOption(1, "eyes", 1)} className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs">▶</button>
                        </div>
                     </div>

                     <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-red-700 font-black uppercase tracking-widest border-b border-red-900/50 pb-1">{t.accLabel}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <button onClick={() => rotateOption(1, "accessory", -1)} className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs">◀</button>
                           <div className="flex-1 text-center">
                              <div className={`text-[9px] text-white font-black uppercase drop-shadow-[0_1px_1px_#000] truncate ${!isUnlocked('accessory', customization.accessory) ? 'opacity-50 text-red-500' : ''}`}>
                                {t.acc_names?.[customization.accessory] || customization.accessory}
                                {!isUnlocked('accessory', customization.accessory) && ' 🔒'}
                              </div>
                              {!isUnlocked('accessory', customization.accessory) && (
                                <div className="text-[7px] text-red-400 font-bold uppercase leading-none mt-0.5 opacity-80">
                                   {getLockReason('accessory', customization.accessory)}
                                </div>
                              )}
                           </div>
                           <button onClick={() => rotateOption(1, "accessory", 1)} className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs">▶</button>
                        </div>
                     </div>

                     <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-red-700 font-black uppercase tracking-widest border-b border-red-900/50 pb-1">{t.trailLabel}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <button onClick={() => rotateOption(1, "trail", -1)} className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs">◀</button>
                           <div className="flex-1 text-center">
                              <div className={`text-[9px] text-white font-black uppercase drop-shadow-[0_1px_1px_#000] truncate ${!isUnlocked("trail", customization.trailColor) ? 'opacity-50 text-red-500' : ''}`}>
                                {TRAIL_PRESETS.find(p => p.val === customization.trailColor)?.name || (customization.trailColor === "" ? (t.offLabelShort || 'OFF') : (t.customLabel || 'CUSTOM'))}
                                {!isUnlocked("trail", customization.trailColor) && ' 🔒'}
                              </div>
                              {!isUnlocked('trail', customization.trailColor) && (
                                <div className="text-[7px] text-red-400 font-bold uppercase leading-none mt-0.5 opacity-80">
                                   {getLockReason('trail', customization.trailColor)}
                                </div>
                              )}
                           </div>
                           <button onClick={() => rotateOption(1, "trail", 1)} className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs">▶</button>
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-2 w-full mt-4">
                    <button 
                      onClick={() => {
                        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                        
                        const eyesPool = EYE_OPTIONS.filter(opt => isUnlocked('eyes', opt));
                        const accPool = ACC_OPTIONS.filter(opt => isUnlocked('accessory', opt) && opt !== 'unicorn');
                        const trailPool = TRAIL_PRESETS.filter(opt => isUnlocked('trail', opt.val));

                        const randomEyes = eyesPool[Math.floor(Math.random() * eyesPool.length)] || 'normal';
                        const randomAcc = accPool[Math.floor(Math.random() * accPool.length)] || 'none';
                        const randomTrail = trailPool[Math.floor(Math.random() * trailPool.length)]?.val || randomColor;
                        
                        setCustomization(prev => ({ ...prev, color: randomColor, eyes: randomEyes, accessory: randomAcc, trailColor: randomTrail }));
                      }}
                      className="flex-1 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[7px] text-white font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                      🎲 {t.random || "ZUFALL"}
                    </button>
                    <button 
                      onClick={() => setCustomization(p => ({
                        ...p,
                        color: DEFAULT_CUSTOMIZATION.color,
                        eyes: DEFAULT_CUSTOMIZATION.eyes,
                        accessory: DEFAULT_CUSTOMIZATION.accessory,
                        trailColor: DEFAULT_CUSTOMIZATION.trailColor,
                        deathAnim: "blood",
                        trailType: "normal"
                      }))}
                      className="flex-1 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[7px] text-white font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                      🔄 RESET
                    </button>
                  </div>
                </div>

                {/* Center Content (Character Preview) */}
                <div className="flex-1 w-full flex items-center justify-center pointer-events-none z-10 relative mt-2 md:mt-4 lg:-mt-8 mb-4 min-h-0">
                  <div className="w-[30vh] h-[30vh] sm:w-[40vh] sm:h-[40vh] md:w-[50vh] md:h-[50vh] lg:w-[60vh] lg:h-[60vh] aspect-square max-h-full max-w-full drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)] relative">
                     <CharacterPreview customization={customization} scale={16} />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-end w-full max-w-6xl mt-auto pb-6 z-10 scale-[0.85] sm:scale-100 origin-bottom">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-2 sm:gap-y-3 w-full max-w-3xl mb-3">
                    <div className="space-y-3">
                      <MenuButton
                        index={0}
                        label={t.start}
                        disabled={!isUnlocked("eyes", customization.eyes) || !isUnlocked("accessory", customization.accessory) || !isUnlocked("trail", customization.trailColor)}
                        onClick={() =>
                          setGameState((p) => ({
                            ...p,
                            status: "difficulty_select",
                          }))
                        }
                        isSelected={menuSelection === 0}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={2}
                        label={t.customLevels}
                        disabled={!isUnlocked("eyes", customization.eyes) || !isUnlocked("accessory", customization.accessory) || !isUnlocked("trail", customization.trailColor)}
                        onClick={() =>
                          setGameState((p) => ({
                            ...p,
                            status: "custom_level_select",
                          }))
                        }
                        isSelected={menuSelection === 2}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={4}
                        label={t.editor}
                        onClick={() => {
                          setEditorData(null);
                          setEditorHistory(null);
                          setEditorVerified(false);
                          setGameState((p) => ({ ...p, status: "editor" }));
                        }}
                        isSelected={menuSelection === 4}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={6}
                        label={t.highscores}
                        onClick={() => {
                          setLevelSource("builtin");
                          setHighscoreLevelIndex(0);
                          setGameState((p) => ({ ...p, status: "highscores" }));
                        }}
                        isSelected={menuSelection === 6}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={8}
                        label={t.shop || "SHOP"}
                        disabled={false}
                        onClick={() => {
                          setMenuSelection(0);
                          setGameState((p) => ({ ...p, status: "shop" }));
                        }}
                        isSelected={menuSelection === 8}
                        onHover={setMenuSelection}
                      />
                    </div>

                    <div className="space-y-3">
                      <MenuButton
                        index={1}
                        label={t.vsMode}
                        disabled={!isUnlocked("eyes", customization.eyes) || !isUnlocked("accessory", customization.accessory) || !isUnlocked("trail", customization.trailColor)}
                        onClick={() => {
                          setLevelSource("builtin");
                          setHighscoreLevelIndex(0);
                          setMenuSelection(0);
                          setGameState((p) => ({ ...p, status: "vs_setup" }));
                        }}
                        isSelected={menuSelection === 1}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={3}
                        label={t.brawlerMode}
                        disabled={!isUnlocked("eyes", customization.eyes) || !isUnlocked("accessory", customization.accessory) || !isUnlocked("trail", customization.trailColor)}
                        onClick={() => {
                          setLevelSource("builtin");
                          setHighscoreLevelIndex(0);
                          setMenuSelection(0);
                          setGameState((p) => ({
                            ...p,
                            status: "brawler_setup",
                          }));
                        }}
                        isSelected={menuSelection === 3}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={5}
                        label={t.randomRun}
                        disabled={!isUnlocked("eyes", customization.eyes) || !isUnlocked("accessory", customization.accessory) || !isUnlocked("trail", customization.trailColor)}
                        onClick={() => {
                          setMenuSelection(0);
                          setGameState((p) => ({ ...p, status: "random_run_setup" }));
                        }}
                        isSelected={menuSelection === 5}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={7}
                        label={t.achievements}
                        onClick={() =>
                          setGameState((p) => ({ ...p, status: "achievements" }))
                        }
                        isSelected={menuSelection === 7}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={9}
                        label={t.onlineMultiplayer}
                        disabled={!isUnlocked("eyes", customization.eyes) || !isUnlocked("accessory", customization.accessory) || !isUnlocked("trail", customization.trailColor)}
                        onClick={() => {
                          setMenuSelection(0);
                          setGameState((p) => ({ ...p, status: "online_menu" }));
                        }}
                        isSelected={menuSelection === 9}
                        onHover={setMenuSelection}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-3 w-full max-w-3xl mb-12">
                    <MenuButton
                      index={10}
                      label={t.settings}
                      onClick={() =>
                        setGameState((p) => ({ ...p, status: "settings", previousStatus: "menu" }))
                      }
                      isSelected={menuSelection === 10}
                      onHover={setMenuSelection}
                    />
                    <MenuButton
                      index={11}
                      label={t.book}
                      onClick={() =>
                        setGameState((p) => ({ ...p, status: "book" }))
                      }
                      isSelected={menuSelection === 11}
                      onHover={setMenuSelection}
                    />
                  </div>

                  <div className="flex gap-4 text-[10px] text-white uppercase font-black tracking-[0.2em] mb-4">
                    {Object.keys(Language).map((l) => (
                      <button
                        key={l}
                        onClick={() =>
                          setLang(Language[l as keyof typeof Language])
                        }
                        className={`w-12 h-12 flex items-center justify-center lava-btn-bg lava-border rounded-full hover:scale-110 hover:lava-border-active transition-all transform-gpu will-change-transform box-border ${lang === Language[l as keyof typeof Language] ? "lava-border-active text-yellow-400 scale-110 shadow-[0_0_15px_#ff4400]" : "opacity-60"}`}
                      >
                        <span className="tracking-normal">{l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Online Menu */}
            {gameState.status === "online_menu" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/95 z-30">
                <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 font-bold font-arcade mb-8">
                  {t.onlineMultiplayer}
                </h1>

                <div className="mb-8 flex flex-col items-center gap-4">
                  <div className="w-48 h-48 bg-neutral-900 border-2 border-neutral-700 relative flex items-center justify-center">
                    <CharacterPreview customization={customization} scale={6} />
                  </div>
                  <input
                    type="text"
                    placeholder={t.enterName}
                    maxLength={12}
                    value={playerName}
                    onChange={(e) =>
                      setPlayerName(e.target.value.toUpperCase())
                    }
                    className="bg-black border border-white p-2 text-center text-white w-48 font-bold"
                  />
                  <div className="w-48">
                  </div>
                </div>

                {onlineError && (
                  <div className="text-red-500 mb-4 font-bold animate-pulse">
                    {onlineError}
                  </div>
                )}
                <div className="flex flex-col gap-3 w-full max-w-[320px]">
                  <MenuButton
                    index={1}
                    label={t.createBrawlerLobby}
                    onClick={() => createOnlineLobby("brawler")}
                    isSelected={menuSelection === 1}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={2}
                    label={t.createVsLobby}
                    onClick={() => createOnlineLobby("vs")}
                    isSelected={menuSelection === 2}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={3}
                    label={t.joinLobby}
                    onClick={() => {
                      setShowJoinPrompt(true);
                      setOnlineError("");
                      setOnlineLobbyInput("");
                    }}
                    isSelected={menuSelection === 3}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={4}
                    label={t.back}
                    onClick={() =>
                      setGameState((p) => ({ ...p, status: "menu" }))
                    }
                    danger
                    isSelected={menuSelection === 4}
                    onHover={setMenuSelection}
                  />
                  <button
                    onClick={() => setGameState(p => ({ ...p, status: "settings", previousStatus: "online_menu" }))}
                    className="mt-4 px-6 py-3 bg-neutral-800 text-white hover:bg-neutral-700 rounded-xl font-arcade text-xs transition-all border-b-4 border-neutral-900 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-3 w-full"
                  >
                    ⚙️ {t.settings || "SETTINGS"}
                  </button>
                </div>

                {showJoinPrompt && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-40">
                    <div className="bg-neutral-900 p-8 border-2 border-cyan-500 flex flex-col items-center">
                      <h2 className="text-2xl text-cyan-400 mb-4 font-arcade">
                        {t.enterLobbyCode}
                      </h2>
                      <input
                        type="text"
                        autoFocus
                        maxLength={4}
                        value={onlineLobbyInput}
                        onChange={(e) =>
                          setOnlineLobbyInput(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") {
                            if (onlineLobbyInput.length === 4) {
                              setShowJoinPrompt(false);
                              joinOnlineLobby(onlineLobbyInput);
                            } else {
                              setOnlineError(t.codeLengthError || "Code must be 4 characters");
                            }
                          }
                          if (e.key === "Escape") {
                            setShowJoinPrompt(false);
                          }
                        }}
                        className="bg-black border border-white p-2 text-center text-white w-48 font-bold text-2xl tracking-widest mb-4"
                      />
                      <div className="flex gap-4 w-full">
                        <button
                          className="flex-1 bg-neutral-800 p-2 hover:bg-neutral-700"
                          onClick={() => setShowJoinPrompt(false)}
                        >
                          {t.cancel || "CANCEL"}
                        </button>
                        <button
                          className="flex-1 bg-cyan-600 p-2 hover:bg-cyan-500 text-white font-bold"
                          onClick={() => {
                            if (onlineLobbyInput.length === 4) {
                              setShowJoinPrompt(false);
                              joinOnlineLobby(onlineLobbyInput);
                            } else {
                              setOnlineError(t.codeLengthError || "Code must be 4 characters");
                            }
                          }}
                        >
                          {t.join || "JOIN"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Online Lobby Screen */}
            {gameState.status === "online_lobby" && (
              <div className="absolute inset-0 flex flex-col items-center p-4 md:p-8 bg-black/95 z-30 overflow-y-auto">
                <div className="w-full max-w-4xl flex flex-col min-h-full">
                  {/* Lobby Header */}
                  <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
                    <div>
                      <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        {onlineService.currentMode === 'vs' ? t.vsTitle : t.brawlerMode}
                      </h2>
                      <p className="text-neutral-500 font-bold uppercase tracking-tighter text-sm mt-1">
                        {t.lobby}: <span className="text-rage-red font-arcade">{onlineService.lobbyCode}</span>
                      </p>
                    </div>
                    {onlineService.isHost && (
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => {
                            audio.init();
                            audio.checkContext();
                          }}
                          className="px-4 py-2 bg-neutral-800 text-neutral-400 hover:text-white rounded-lg font-arcade text-[10px] transition-all border-b-4 border-neutral-900 active:translate-y-1 active:border-b-0 flex items-center gap-2"
                          title="Click here if you don't hear sound"
                        >
                          <span>🔊</span> {t.fixAudio || "AUDIO FIX"}
                        </button>
                        {onlineService.currentMode === 'vs' && (
                          <button
                            onClick={() => {
                              const newValue = !gameState.collisionEnabled;
                              setGameState(p => ({ ...p, collisionEnabled: newValue }));
                              onlineService.broadcastLobbyState(
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                newValue
                              );
                            }}
                            className={`px-4 py-2 rounded-lg font-arcade text-[10px] transition-all border-b-4 ${
                              gameState.collisionEnabled 
                                ? "bg-green-600 border-green-900 text-white" 
                                : "bg-neutral-700 border-neutral-900 text-neutral-400"
                            }`}
                          >
                            {(t.collisionLabel || "COLLISION")}: {gameState.collisionEnabled ? (t.onLabel || "ON") : (t.offLabel || "OFF")}
                          </button>
                        )}
                        {onlineService.currentMode === 'vs' && (
                          <button
                            onClick={() => onlineService.toggleFinishTimer()}
                            className={`px-4 py-2 rounded-lg font-arcade text-[10px] transition-all border-b-4 ${
                              gameState.finishTimerEnabled !== false 
                                ? "bg-green-600 border-green-900 text-white" 
                                : "bg-neutral-700 border-neutral-900 text-neutral-400"
                            }`}
                          >
                            {(t.finishTimerLabel || "LEVEL-TIMER")}: {gameState.finishTimerEnabled !== false ? (t.onLabel || "ON") : (t.offLabel || "OFF")}
                          </button>
                        )}
                        <button
                          onClick={() => setGameState(p => ({ ...p, status: "settings", previousStatus: "online_lobby" }))}
                          className="px-6 py-2 bg-neutral-700 text-white hover:bg-neutral-600 rounded-lg font-arcade text-[10px] transition-all border-b-4 border-neutral-900 active:translate-y-1 active:border-b-0"
                        >
                          ⚙️ {t.settings || "SETTINGS"}
                        </button>
                        <button
                          onClick={() => setShowLevelMenu(true)}
                          className="px-6 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg font-arcade text-[10px] transition-all border-b-4 border-neutral-400 active:translate-y-1 active:border-b-0"
                        >
                          {t.openLevelMenu || "LEVEL MENÜ"}
                        </button>
                        {gameState.onlineMode === "brawler" && (
                          <button
                            onClick={() => setGameState(p => ({ ...p, status: "brawler_powerup_setup", previousStatus: "online_lobby" }))}
                            className="px-6 py-2 bg-orange-600 text-white hover:bg-orange-500 rounded-lg font-arcade text-[10px] transition-all border-b-4 border-orange-900 active:translate-y-1 active:border-b-0"
                          >
                            {t.brawlerSettings || "POWERUPS"}
                          </button>
                        )}
                      </div>
                    )}

                    {!onlineService.isHost && (
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => {
                            audio.init();
                            audio.checkContext();
                          }}
                          className="px-4 py-2 bg-neutral-800 text-neutral-400 hover:text-white rounded-lg font-arcade text-[10px] transition-all border-b-4 border-neutral-900 active:translate-y-1 active:border-b-0 flex items-center gap-2"
                          title="Click here if you don't hear sound"
                        >
                          <span>🔊</span> {t.fixAudio || "AUDIO FIX"}
                        </button>
                      </div>
                    )}
                  </div>
                <h2 className="text-xl text-neutral-400 mb-2 uppercase">
                  {gameState.onlineMode} MODE
                </h2>
                {onlineError && (
                  <div className="text-red-500 mb-4 font-bold animate-pulse">
                    {onlineError}
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl flex-1 overflow-hidden">
                  <div className="flex-1 flex flex-col items-center overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                      {onlinePlayers.map((p, idx) => {
                        const isLocal = p.id === onlineService.localPlayer?.id;
                        const teamColors = [
                          "#ff0044",
                          "#00ff88",
                          "#00ccff",
                          "#fbbf24",
                          "#9c27b0",
                          "#ff4400",
                          "#607d8b",
                          "#795548",
                        ];

                        return (
                          <div
                            key={p.id}
                            className="flex flex-col items-center bg-neutral-900 p-4 border-2 border-neutral-700 rounded-lg w-40 relative group"
                          >
                            <div
                              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white/20"
                              style={{
                                backgroundColor: teamColors[(p.team || 0) % 8],
                              }}
                            >
                              {((p.team || 0) % 8) + 1}
                            </div>

                            <div className="w-40 h-40 mb-4 relative flex items-center justify-center">
                              <CharacterPreview
                                customization={p.customization}
                                scale={5}
                              />
                            </div>
                             <div className="text-white font-bold mb-2 truncate w-full text-center text-sm">
                              {p.name} {p.isHost ? `(${t.host || "HOST"})` : ""}
                            </div>

                            {onlineService.isHost && !p.isHost && (
                              <button
                                onClick={() => onlineService.kickPlayer(p.id)}
                                className="mb-2 w-full py-1 bg-red-600 hover:bg-red-500 text-white text-[8px] font-black uppercase rounded shadow-lg border-b-2 border-red-900 active:translate-y-0.5 active:border-b-0 transition-all scale-90 group-hover:scale-100"
                              >
                                {t.kick || "KICK"}
                              </button>
                            )}

                            <div className="flex flex-col items-center gap-1 mb-2">
                              {isLocal && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] text-neutral-500 font-bold uppercase">
                                    Team
                                  </span>
                                  <select
                                    value={p.team || 0}
                                    onChange={(e) => {
                                      const newTeam = parseInt(e.target.value);
                                      const updatedPlayer = {
                                        ...onlineService.localPlayer!,
                                        team: newTeam,
                                      };
                                      onlineService.updateLocalPlayer(
                                        updatedPlayer,
                                      );
                                    }}
                                    className="bg-neutral-800 text-white text-[10px] rounded border border-neutral-700 outline-none px-1"
                                  >
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map((t) => (
                                      <option key={t} value={t}>
                                        Team {t + 1}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {!isLocal && (
                                <div className="flex flex-col items-center">
                                  <div className="text-[8px] text-neutral-400 font-bold uppercase">
                                    Team {(p.team || 0) + 1}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div
                              className={`text-[10px] font-bold ${p.ready ? "text-green-500" : "text-red-500"}`}
                            >
                              {p.ready ? (t.ready || "READY") : (t.notReady || "NOT READY")}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-full max-w-lg border-t border-neutral-700 pt-4 flex flex-col items-center mb-4">
                      <div className="text-[10px] text-neutral-400 font-bold mb-2 uppercase tracking-widest">
                        {t.selectedLevels || "Selected Level(s)"}
                      </div>

                      {/* Suggestions notification for Host */}
                      {onlineService.isHost && onlineSuggestions.length > 0 && (
                        <div className="w-full bg-blue-900/30 border border-blue-500/50 rounded-lg p-2 mb-4 animate-pulse">
                          <div className="flex justify-between items-center text-[10px] text-blue-400 font-black uppercase mb-2">
                             <span>{onlineSuggestions.filter(s => s.status === 'pending').length} NEUE VORSCHLÄGE</span>
                             <button 
                               onClick={() => onlineService.clearSuggestions()}
                               className="text-neutral-500 hover:text-white"
                             >
                               CLEAR
                             </button>
                          </div>
                          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                            {onlineSuggestions.map((s, idx) => (
                              <div key={s.id} className="flex items-center justify-between bg-black/40 p-2 rounded border border-white/5">
                                <div className="flex flex-col min-w-0">
                                  <span className="text-white text-xs font-bold truncate">{s.level.name}</span>
                                  <span className="text-[8px] text-neutral-500 uppercase">VON {s.playerName}</span>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  {s.status === 'pending' ? (
                                    <>
                                      <button 
                                        onClick={() => onlineService.handleSuggestion(s.id, 'accept')}
                                        className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white hover:bg-green-500"
                                      >
                                        ✓
                                      </button>
                                      <button 
                                        onClick={() => onlineService.handleSuggestion(s.id, 'decline')}
                                        className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white hover:bg-red-500"
                                      >
                                        ✕
                                      </button>
                                    </>
                                  ) : (
                                    <span className={`text-[8px] font-black ${s.status === 'accepted' ? 'text-green-500' : 'text-red-500'}`}>
                                      {s.status.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggestion button for Players */}
                      {!onlineService.isHost && (
                        <div className="w-full mb-4">
                           <button 
                             onClick={() => setShowSuggestionMenu(!showSuggestionMenu)}
                             className="w-full py-2 bg-blue-600 text-white rounded-lg font-arcade text-[10px] border-b-4 border-blue-900 active:translate-y-1 active:border-b-0"
                           >
                             {t.suggestLevel || "LEVEL VORSCHLAGEN"} ({onlineSuggestions.filter(s => s.playerId === onlineService.localPlayer?.id).length}/5)
                           </button>
                           
                           {showSuggestionMenu && (
                             <div className="mt-2 p-4 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl">
                                <div className="text-white font-bold mb-4 text-center">{t.yourLevels || "DEINE LEVEL"}</div>
                                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                   {customLevels.filter(l => l.isVerified).map(l => (
                                     <button 
                                       key={l.id}
                                       onClick={() => {
                                         onlineService.suggestLevel(l);
                                         setShowSuggestionMenu(false);
                                       }}
                                       className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-600 text-left text-xs text-white truncate"
                                     >
                                       {l.name}
                                     </button>
                                   ))}
                                   {customLevels.filter(l => l.isVerified).length === 0 && (
                                     <div className="col-span-2 text-center text-neutral-500 py-4 text-[10px]">
                                       Keine veröffentlichten Level gefunden.
                                     </div>
                                   )}
                                </div>
                             </div>
                           )}

                           {onlineSuggestions.filter(s => s.playerId === onlineService.localPlayer?.id).length > 0 && (
                             <div className="mt-2 text-[8px] text-neutral-500 font-bold uppercase text-center">
                                DEINE VORSCHLÄGE: {onlineSuggestions.filter(s => s.playerId === onlineService.localPlayer?.id).map(s => (
                                  <span key={s.id} className={`ml-2 ${s.status === 'accepted' ? 'text-green-500' : s.status === 'declined' ? 'text-red-500' : 'text-blue-400'}`}>
                                    {s.level.name}
                                  </span>
                                ))}
                             </div>
                           )}
                        </div>
                      )}

                      <div className="text-white font-bold text-xl flex flex-col items-center gap-2">
                        <div className="w-48 aspect-video bg-black border border-neutral-700 rounded overflow-hidden shadow-lg relative">
                          {gameState.customLevelsQueue && gameState.customLevelsQueue.length > 0 && (
                            <LevelPreview
                              level={gameState.customLevelsQueue[0]}
                              width={192}
                              height={108}
                              className="w-full h-full"
                            />
                          )}
                          {gameState.customLevelsQueue &&
                            gameState.customLevelsQueue.length > 1 && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-2">
                                <div className="text-[10px] text-yellow-400 font-black uppercase mb-1 tracking-tighter">
                                  {t.activeQueue || "Active Queue"}
                                </div>
                                <div className="text-[8px] text-white flex flex-col gap-0.5 w-full text-center overflow-hidden">
                                  {gameState.customLevelsQueue
                                    .slice(0, 4)
                                    .map((sl, i) => (
                                      <div
                                        key={sl.id || i}
                                        className="truncate px-1 bg-white/10 rounded"
                                      >
                                        {i + 1}. {sl.name}
                                      </div>
                                    ))}
                                  {gameState.customLevelsQueue.length > 4 && (
                                    <div>
                                      + {gameState.customLevelsQueue.length - 4}{" "}
                                      {t.more || "MORE"}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                        <span className="text-center text-sm md:text-base">
                          {!gameState.customLevelsQueue || gameState.customLevelsQueue.length === 0
                            ? (t.noLevelSelected || "NO LEVEL SELECTED")
                            : gameState.customLevelsQueue.length > 1
                            ? `${gameState.customLevelsQueue.length} ${t.levels} SELECTED`
                            : gameState.customLevelsQueue[0].name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-80 flex flex-col gap-4">
                    <Chat
                      messages={chatMessages}
                      onSendMessage={(text) => {
                        onlineService.sendChatMessage(text);
                        const newCount = (gameState.chatMessagesSent || 0) + 1;
                        setGameState((p) => ({
                          ...p,
                          chatMessagesSent: newCount,
                        }));
                        checkAchievements({ chatMessagesSent: newCount });
                      }}
                      isHost={gameState.isHost || false}
                      lang={lang}
                      unlockedAchievements={gameState.unlockedAchievements}
                    />
                    
                    {/* Quick Chat Pings */}
                    <div className="grid grid-cols-3 gap-1 bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
                      {PINGS.map(ping => (
                        <button
                          key={ping}
                          onClick={() => onlineService.sendChatMessage(ping)}
                          className="py-1 px-2 text-[9px] font-arcade bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 transition-colors truncate"
                        >
                          {ping}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3">
                      <MenuButton
                        index={gameState.isHost ? 2 : 0}
                        label={
                          gameState.isHost
                            ? (t.startGame || "START GAME")
                            : onlinePlayers.find(
                                  (p) => p.id === onlineService.localPlayer?.id,
                                )?.ready
                              ? (t.unready || "UNREADY")
                              : (t.ready || "READY")
                        }
                            onClick={() => {
                              if (gameState.isHost) {
                                if (!gameState.customLevelsQueue || gameState.customLevelsQueue.length === 0) {
                                  setOnlineError("PLEASE SELECT LEVEL(S) FIRST!");
                                  setTimeout(() => setOnlineError(""), 3000);
                                  return;
                                }
                                const teamModeRequirements: Record<
                                  BrawlerTeamMode,
                                  number
                                > = {
                                  FFA: 2,
                                  TEAMS: 2,
                                };
                                const requiredPlayers =
                                  gameState.onlineMode === "brawler"
                                    ? teamModeRequirements[brawlerTeamMode]
                                    : 2;

                                if (onlinePlayers.length < requiredPlayers) {
                                  setOnlineError(
                                    `ERROR: Need at least ${requiredPlayers} players!`,
                                  );
                                  setTimeout(() => setOnlineError(""), 2000);
                                  return;
                                }

                                const occupiedTeams = new Set(onlinePlayers.filter(p => p.team !== undefined && p.team !== null).map(p => p.team));
                                if (gameState.onlineMode === "brawler" && occupiedTeams.size < 2) {
                                  setOnlineError(
                                    "ERROR: At least two teams must be occupied!",
                                  );
                                  setTimeout(() => setOnlineError(""), 3000);
                                  return;
                                }

                                if (onlinePlayers.every((p) => p.ready)) {
                                  lastStartTimeRef.current = Date.now();
                                  setOnlineResults([]);
                                  setOnlineFinishTimer(null);
                                  onlineService.startGame();
                                } else {
                                  setOnlineError("Not all players are ready!");
                                  setTimeout(() => setOnlineError(""), 2000);
                                }
                              } else {
                            const localP = onlinePlayers.find(
                              (p) => p.id === onlineService.localPlayer?.id,
                            );
                            if (localP) onlineService.setReady(!localP.ready);
                          }
                        }}
                        isSelected={
                          gameState.isHost
                            ? menuSelection === 2
                            : menuSelection === 0
                        }
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={gameState.isHost ? 3 : 1}
                        label={t.customize || "CUSTOMIZE"}
                        onClick={() =>
                          setGameState((p) => ({
                            ...p,
                            status: "customizing",
                            previousStatus: "online_lobby",
                          }))
                        }
                        isSelected={
                          gameState.isHost
                            ? menuSelection === 3
                            : menuSelection === 1
                        }
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={
                          gameState.isHost
                            ? 5
                            : 2
                        }
                        label={t.back}
                        danger
                        onClick={() => {
                          if (onlineService.isHost) {
                            onlineService.closeLobby();
                          } else {
                            onlineService.disconnect();
                          }
                          setGameState((p) => ({
                            ...p,
                            status: "online_menu",
                          }));
                        }}
                        isSelected={
                          gameState.isHost
                            ? menuSelection === 5
                            : menuSelection === 2
                        }
                        onHover={setMenuSelection}
                      />
                      <button
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-400 rounded border border-neutral-700 transition-all uppercase font-bold"
                        onClick={() => onlineService.reconnectPeer()}
                      >
                        {t.fixConnection || "Fix Connection"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Customization Menu */}
            {gameState.status === "customizing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30">
                <h2 className="text-2xl mb-4 text-white">{t.customize}</h2>

                {/* Character Preview (Live Canvas) */}
                <div className="w-56 h-56 bg-neutral-900 border-2 border-neutral-700 mb-6 flex items-center justify-center relative overflow-hidden">
                  <CharacterPreview customization={customization} scale={8} />
                  {renderLock("eyes", customization.eyes)}
                  {renderLock("accessory", customization.accessory)}
                  {renderLock("trail", customization.trailColor)}
                </div>

                <div className="flex flex-col gap-1 w-80 mb-4 h-64 overflow-y-auto custom-scrollbar">
                  {/* Body RGB */}
                  <div className="flex justify-between items-end mt-2 mb-1">
                    <div className="text-xs text-neutral-500 font-bold uppercase tracking-widest">
                      {t.bodyColor || "BODY COLOR"}
                    </div>
                    {isAdminUnlocked && (
                      <div className="text-[10px] font-black text-yellow-400 animate-pulse tracking-tighter">
                        ★ SECRET ADMIN DESIGN ★
                      </div>
                    )}
                    {isRainbowUnlocked && (
                      <div className="text-[10px] font-black text-fuchsia-400 animate-bounce tracking-tighter">
                        🌈 RAINBOW LOVER 🌈
                      </div>
                    )}
                    {isInvisibleUnlocked && (
                      <div className="text-[10px] font-black text-cyan-200 animate-pulse tracking-tighter">
                        👻 GHOST MODE 👻
                      </div>
                    )}
                  </div>
                  <SliderRow
                    label="RED"
                    value={hexToRgb(customization.color).r}
                    index={0}
                    colorClass="bg-red-500"
                    onChange={(v: number) => setExactRGB(1, "color", "r", v)}
                    isSelected={menuSelection === 0}
                    onHover={setMenuSelection}
                  />
                  <SliderRow
                    label="GREEN"
                    value={hexToRgb(customization.color).g}
                    index={1}
                    colorClass="bg-green-500"
                    onChange={(v: number) => setExactRGB(1, "color", "g", v)}
                    isSelected={menuSelection === 1}
                    onHover={setMenuSelection}
                  />
                  <SliderRow
                    label="BLUE"
                    value={hexToRgb(customization.color).b}
                    index={2}
                    colorClass="bg-blue-500"
                    onChange={(v: number) => setExactRGB(1, "color", "b", v)}
                    isSelected={menuSelection === 2}
                    onHover={setMenuSelection}
                  />

                  {/* Trail RGB */}
                  <div className="text-xs text-neutral-500 font-bold mt-2">
                    {t.trailColor || "TRAIL COLOR"}
                  </div>

                  {/* Preset Selector */}
                  <div className="relative mb-1">
                    <MenuButton
                      index={3}
                      label={`${t.style || "STYLE"}: ${TRAIL_PRESETS.find((p) => p.val === customization.trailColor)?.name || "CUSTOM"}`}
                      onClick={() => rotateOption(1, "trail", 1)}
                      isSelected={menuSelection === 3}
                      onHover={setMenuSelection}
                    />
                    <div className="text-[8px] text-neutral-500 text-center uppercase -mt-1 mb-2 px-4 italic leading-tight">
                        {getLockReason('trail', customization.trailColor)}
                    </div>
                    {!isUnlocked("trail", customization.trailColor) && (
                        <div className="absolute right-4 top-3 text-red-500">
                          🔒
                        </div>
                      )}
                  </div>

                  <SliderRow
                    label="RED"
                    value={
                      hexToRgb(
                        customization.trailColor === "rainbow"
                          ? "#ff0044"
                          : customization.trailColor,
                      ).r
                    }
                    index={4}
                    colorClass="bg-red-500"
                    onChange={(v: number) =>
                      setExactRGB(1, "trailColor", "r", v)
                    }
                    isSelected={menuSelection === 4}
                    onHover={setMenuSelection}
                  />
                  <SliderRow
                    label="GREEN"
                    value={
                      hexToRgb(
                        customization.trailColor === "rainbow"
                          ? "#ff0044"
                          : customization.trailColor,
                      ).g
                    }
                    index={5}
                    colorClass="bg-green-500"
                    onChange={(v: number) =>
                      setExactRGB(1, "trailColor", "g", v)
                    }
                    isSelected={menuSelection === 5}
                    onHover={setMenuSelection}
                  />
                  <SliderRow
                    label="BLUE"
                    value={
                      hexToRgb(
                        customization.trailColor === "rainbow"
                          ? "#ff0044"
                          : customization.trailColor,
                      ).b
                    }
                    index={6}
                    colorClass="bg-blue-500"
                    onChange={(v: number) =>
                      setExactRGB(1, "trailColor", "b", v)
                    }
                    isSelected={menuSelection === 6}
                    onHover={setMenuSelection}
                  />

                  <div className="text-xs text-neutral-500 font-bold mt-2">
                    {t.adjustControls || "ARROWS TO ADJUST • ENTER TO CYCLE"}
                  </div>
                  <div className="relative">
                    <MenuButton
                      index={7}
                      label={`${t.eyes}: ${t.eye_names?.[customization.eyes] || customization.eyes}`}
                      onClick={() => rotateOption(1, "eyes", 1)}
                      isSelected={menuSelection === 7}
                      onHover={setMenuSelection}
                    />
                    <div className="text-[8px] text-neutral-500 text-center uppercase -mt-1 mb-2 px-4 italic leading-tight">
                        {getLockReason('eyes', customization.eyes)}
                    </div>
                    {!isUnlocked("eyes", customization.eyes) && (
                      <div className="absolute right-4 top-3 text-red-500">
                        🔒
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <MenuButton
                      index={8}
                      label={`${t.hat}: ${t.acc_names?.[customization.accessory] || customization.accessory}`}
                      onClick={() => rotateOption(1, "accessory", 1)}
                      isSelected={menuSelection === 8}
                      onHover={setMenuSelection}
                    />
                    <div className="text-[8px] text-neutral-500 text-center uppercase -mt-1 mb-2 px-4 italic leading-tight">
                        {getLockReason('accessory', customization.accessory)}
                    </div>
                    {!isUnlocked("accessory", customization.accessory) && (
                      <div className="absolute right-4 top-3 text-red-500">
                        🔒
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 w-full max-w-[500px] mt-2">
                  <MenuButton
                    index={9}
                    label="🎲 RANDOM"
                    onClick={() => {
                        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                        const eyesPool = EYE_OPTIONS.filter(opt => isUnlocked('eyes', opt));
                        const accPool = ACC_OPTIONS.filter(opt => isUnlocked('accessory', opt) && opt !== 'unicorn');
                        const trailPool = TRAIL_PRESETS.filter(opt => isUnlocked('trail', opt.val));

                        const randomEyes = eyesPool[Math.floor(Math.random() * eyesPool.length)] || 'normal';
                        const randomAcc = accPool[Math.floor(Math.random() * accPool.length)] || 'none';
                        const randomTrail = trailPool[Math.floor(Math.random() * trailPool.length)]?.val || randomColor;
                        
                        setCustomization(prev => ({ ...prev, color: randomColor, eyes: randomEyes, accessory: randomAcc, trailColor: randomTrail }));
                    }}
                    isSelected={menuSelection === 9}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={10}
                    label={t.back}
                    onClick={() =>
                      setGameState((p) => ({
                        ...p,
                        status: p.previousStatus || "menu",
                      }))
                    }
                    danger
                    isSelected={menuSelection === 10}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={11}
                    label={
                      gameState.previousStatus === "online_menu" ||
                      gameState.previousStatus === "online_lobby"
                        ? "CONFIRM"
                        : t.play
                    }
                    // Disable play if selected items are locked
                    disabled={
                      !isUnlocked("eyes", customization.eyes) ||
                      !isUnlocked("accessory", customization.accessory) ||
                      !isUnlocked("trail", customization.trailColor)
                    }
                    onClick={() => {
                      if (gameState.previousStatus === "online_lobby") {
                        updateOnlineCustomization(customization);
                      }
                      setMenuSelection(0);
                      setGameState((p) => ({
                        ...p,
                        status:
                          p.previousStatus === "online_menu" ||
                          p.previousStatus === "online_lobby" ||
                          p.previousStatus === "menu"
                            ? p.previousStatus
                            : "difficulty_select",
                      }));
                    }}
                    isSelected={menuSelection === 11}
                    onHover={setMenuSelection}
                  />
                </div>

                <div className="text-[10px] text-neutral-500 mt-2">
                    {t.adjustControls || "ARROWS to adjust • ENTER to cycle"}
                </div>
              </div>
            )}

            {/* ... (Other Menus remain similar but condensed in existing code) ... */}
            {/* Pause Menu */}
            {gameState.status === "paused" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                <h2 className="text-4xl text-white mb-8">{t.paused}</h2>
                <div className="flex flex-col gap-2 w-72">
                  {(() => {
                    const buttons = [];

                    if (
                      (!onlineService.lobbyCode || onlineService.isHost) &&
                      gameState.customLevelsQueue &&
                      gameState.currentLevelIndex <
                        gameState.customLevelsQueue.length - 1
                    ) {
                      buttons.push({
                        label: t.nextLevelBtn || "NEXT LEVEL",
                        onClick: handleNextLevel,
                      });
                    }

                    if (
                      !(
                        gameState.previousStatus === "vs_playing" ||
                        gameState.previousStatus === "brawler_playing"
                      )
                    ) {
                      buttons.push({ label: t.retry, onClick: handleRetry });
                    }

                    if (onlineService.lobbyCode) {
                      buttons.push({
                        label: t.giveUp,
                        danger: true,
                        onClick: () => {
                          onlineService.sendEvent("give_up", {
                            name: playerName,
                          });
                          setGameState((p) => ({
                            ...p,
                            status: p.previousStatus || "playing",
                          }));
                          // Locally we treat it as finished with poor stats
                          handleWin("GAVE UP");
                        },
                      });
                      buttons.push({
                        label: t.backToLobby,
                        onClick: () => {
                          if (onlineService.isHost) {
                            onlineService.returnToLobby();
                          } else {
                            setGameState((p) => ({
                              ...p,
                              status: "online_lobby",
                            }));
                          }
                        },
                      });
                    }

                    buttons.push({
                      label: t.settings,
                      onClick: () => {
                        setGameState((p) => ({ ...p, status: "settings", previousStatus: "paused" }));
                        setMenuSelection(0);
                      },
                    });

                    buttons.push({
                      label: t.quit,
                      danger: true,
                      onClick: () => {
                        if (onlineService.lobbyCode) {
                          onlineService.disconnect();
                        }
                        setGameState((p) => ({ ...p, status: "menu" }));
                      },
                    });

                    return buttons.map((btn, i) => (
                      <MenuButton
                        key={i}
                        index={i}
                        label={btn.label}
                        danger={btn.danger}
                        onClick={btn.onClick}
                        isSelected={menuSelection === i}
                        onHover={setMenuSelection}
                      />
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Win Screen / VS Win */}
            {(gameState.status === "won" ||
              gameState.status === "vs_won" ||
              gameState.status === "brawler_won") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/80 backdrop-blur-md z-40">
                {gameState.status === "vs_won" ||
                gameState.status === "brawler_won" ? (
                  <>
                    <h2 className="text-5xl text-white font-bold mb-4 animate-bounce">
                      {gameState.winner ? t.playerWin(gameState.winner) : ""}
                    </h2>
                    <div className="text-xl mb-8">TIME: {gameState.time}s</div>
                    <div className="flex flex-col gap-3 w-72">
                      {(!onlineService.lobbyCode || onlineService.isHost) &&
                      gameState.customLevelsQueue &&
                      gameState.currentLevelIndex <
                        gameState.customLevelsQueue.length - 1 ? (
                        <>
                          <MenuButton
                            index={0}
                            label={t.nextLevelBtn}
                            onClick={handleNextLevel}
                            isSelected={menuSelection === 0}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={1}
                            label={
                              onlineService.lobbyCode
                                ? t.backToLobby
                                : t.backToSelection
                            }
                            onClick={() => {
                              if (
                                onlineService.lobbyCode &&
                                onlineService.isHost
                              ) {
                                onlineService.returnToLobby();
                              } else {
                                setGameState((p) => ({
                                  ...p,
                                  status: onlineService.lobbyCode
                                    ? "online_lobby"
                                    : gameState.status === "brawler_won"
                                      ? "brawler_setup"
                                      : "vs_setup",
                                }));
                              }
                            }}
                            isSelected={menuSelection === 1}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={2}
                            label={t.mainMenu}
                            danger
                            onClick={() => {
                              if (onlineService.lobbyCode)
                                onlineService.disconnect();
                              setGameState((p) => ({ ...p, status: "menu" }));
                            }}
                            isSelected={menuSelection === 2}
                            onHover={setMenuSelection}
                          />
                        </>
                      ) : (
                        <>
                          <MenuButton
                            index={0}
                            label={
                              onlineService.lobbyCode
                                ? t.backToLobby
                                : "ZURÜCK ZUR AUSWAHL"
                            }
                            onClick={() => {
                              if (
                                onlineService.lobbyCode &&
                                onlineService.isHost
                              ) {
                                onlineService.returnToLobby();
                              } else {
                                setGameState((p) => ({
                                  ...p,
                                  status: onlineService.lobbyCode
                                    ? "online_lobby"
                                    : gameState.status === "brawler_won"
                                      ? "brawler_setup"
                                      : "vs_setup",
                                }));
                              }
                            }}
                            isSelected={menuSelection === 0}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={1}
                            label={t.mainMenu}
                            danger
                            onClick={() => {
                              if (onlineService.lobbyCode)
                                onlineService.disconnect();
                              setGameState((p) => ({ ...p, status: "menu" }));
                            }}
                            isSelected={menuSelection === 1}
                            onHover={setMenuSelection}
                          />
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl text-white font-bold mb-2">
                      {t.won}
                    </h2>
                    <div className="text-2xl text-green-300 mb-8 flex flex-col items-center gap-2">
                      <span>
                        {t.totalScore}: {gameState.score}
                      </span>
                      <span className="text-sm opacity-70">
                        {t.time}: {gameState.time}s
                      </span>
                    </div>

                    {showHighscoreInput ? (
                      <div className="flex flex-col items-center gap-4 animate-fade-in">
                        <h3 className="text-xl text-yellow-400 font-bold">
                          {t.gameOver}
                        </h3>
                        <input
                          type="text"
                          placeholder={t.enterName}
                          maxLength={8}
                          value={playerName}
                          autoFocus
                          onChange={(e) =>
                            setPlayerName(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && playerName.length > 0) {
                              e.stopPropagation();
                              saveHighscore();
                            }
                          }}
                          className="bg-black border border-white p-2 text-center text-white"
                        />
                        <div className="w-72 mt-4">
                          <MenuButton
                            index={0}
                            label={t.save}
                            onClick={saveHighscore}
                            isSelected={menuSelection === 0}
                            onHover={setMenuSelection}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 w-72">
                        <MenuButton
                          index={0}
                          label={t.nextLevelBtn}
                          onClick={handleNextLevel}
                          isSelected={menuSelection === 0}
                          onHover={setMenuSelection}
                        />
                        <MenuButton
                          index={1}
                          label={t.mainMenu}
                          danger
                          onClick={() =>
                            setGameState((prev) => ({
                              ...prev,
                              status: "menu",
                            }))
                          }
                          isSelected={menuSelection === 1}
                          onHover={setMenuSelection}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Online Summary Screen */}
            {gameState.status === "online_summary" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 p-4 overflow-y-auto pt-20 pb-10">
                <h2 className="text-4xl text-cyan-400 font-arcade mb-8 tracking-widest">
                  GAME RESULTS
                </h2>

                <div className="w-full max-w-2xl bg-neutral-900 border-2 border-neutral-700 p-6 rounded-lg shadow-2xl custom-scrollbar overflow-y-auto max-h-[70vh]">
                  <table className="w-full text-left font-mono">
                    <thead>
                      <tr className="text-neutral-500 border-b border-neutral-800 text-xs">
                        <th className="pb-2">RANK</th>
                        <th className="pb-2">PLAYER</th>
                        {gameState.previousStatus === "brawler_playing" && (
                          <th className="pb-2">SCORE</th>
                        )}
                        {gameState.previousStatus !== "brawler_playing" && (
                          <th className="pb-2">TIME</th>
                        )}
                        <th className="pb-2">
                          {gameState.previousStatus === "brawler_playing"
                            ? "LEBEN"
                            : "DEATHS"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {onlineResults.map((res, i) => (
                        <tr
                          key={res.id}
                          className={`border-b border-neutral-800/50 ${res.id === onlineService.localPlayer?.id ? "bg-cyan-900/20" : ""}`}
                        >
                          <td className="py-3 font-arcade text-yellow-500">
                            {i + 1}
                          </td>
                          <td className="py-3 font-bold text-white">
                            {res.name}{" "}
                            {res.id === onlineService.localPlayer?.id
                              ? "(YOU)"
                              : ""}
                          </td>
                          {gameState.previousStatus === "brawler_playing" && (
                            <td className="py-3 text-green-400">{res.score}</td>
                          )}
                          {gameState.previousStatus !== "brawler_playing" && (
                            <td className="py-3 text-cyan-300">
                              {res.time === 999 ? "-" : `${res.time}s`}
                            </td>
                          )}
                          <td className="py-3 text-red-500">{res.deaths}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 flex flex-col gap-3 w-72">
                  {onlineService.lobbyCode ? (
                    <>
                      {onlineService.isHost ? (
                        <>
                          {gameState.customLevelsQueue &&
                            gameState.currentLevelIndex <
                              gameState.customLevelsQueue.length - 1 && (
                              <MenuButton
                                index={0}
                                label="NÄCHSTES LEVEL"
                                onClick={handleNextLevel}
                                isSelected={menuSelection === 0}
                                onHover={setMenuSelection}
                              />
                            )}
                          <MenuButton
                            index={
                              gameState.customLevelsQueue &&
                              gameState.currentLevelIndex <
                                gameState.customLevelsQueue.length - 1
                                ? 1
                                : 0
                            }
                            label="NOCHMAL SPIELEN"
                            onClick={async () => {
                               setOnlineResults([]);
                               setOnlineFinishTimer(null);
                               if (onlineService.lobbyCode && onlineService.isHost) {
                                   let targetIdx = gameState.currentLevelIndex;
                                   // If we were at the end of a queue, restart from the beginning
                                   if (gameState.customLevelsQueue && gameState.currentLevelIndex >= gameState.customLevelsQueue.length - 1) {
                                       targetIdx = 0;
                                   }
                                   
                                   const targetLevel = (gameState.customLevelsQueue && gameState.customLevelsQueue.length > 0) 
                                       ? gameState.customLevelsQueue[targetIdx] 
                                       : level;

                                   if (targetLevel) {
                                       await onlineService.broadcastLobbyState(
                                           undefined,
                                           targetLevel,
                                           undefined,
                                           brawlerTeamMode,
                                           brawlerHazardMode,
                                           undefined,
                                           targetIdx
                                       );
                                   }
                                   lastStartTimeRef.current = Date.now();
                                   onlineService.startGame();
                                   
                                   // Immediately transition host to playing state
                                   setGameState(p => ({
                                       ...p,
                                       status: p.onlineMode === "brawler" ? "brawler_playing" : "vs_playing",
                                       levelTime: 0,
                                       levelDeaths: 0,
                                       collectedCoins: [],
                                       blocksPlaced: 0
                                   }));
                                   setRespawnTrigger(p => p + 1);
                               }
                            }}
                            isSelected={
                              menuSelection ===
                              (gameState.customLevelsQueue &&
                              gameState.currentLevelIndex <
                                gameState.customLevelsQueue.length - 1
                                ? 1
                                : 0)
                            }
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={
                              gameState.customLevelsQueue &&
                              gameState.currentLevelIndex <
                                gameState.customLevelsQueue.length - 1
                                ? 2
                                : 1
                            }
                            label={t.backToLobby}
                            onClick={() => onlineService.returnToLobby()}
                            isSelected={
                              menuSelection ===
                              (gameState.customLevelsQueue &&
                              gameState.currentLevelIndex <
                                gameState.customLevelsQueue.length - 1
                                ? 2
                                : 1)
                            }
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={
                              gameState.customLevelsQueue &&
                              gameState.currentLevelIndex <
                                gameState.customLevelsQueue.length - 1
                                ? 3
                                : 2
                            }
                            label={t.mainMenu}
                            danger
                            onClick={() => {
                              if (onlineService.isHost) {
                                onlineService.closeLobby();
                              } else {
                                onlineService.disconnect();
                              }
                              setGameState((p) => ({ ...p, status: "menu" }));
                            }}
                            isSelected={
                              menuSelection ===
                              (gameState.customLevelsQueue &&
                              gameState.currentLevelIndex <
                                gameState.customLevelsQueue.length - 1
                                ? 3
                                : 2)
                            }
                            onHover={setMenuSelection}
                          />
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col gap-2 w-full">
                            <MenuButton
                              index={0}
                              label="WARTE AUF HOST..."
                              onClick={() => {}}
                              disabled
                              isSelected={menuSelection === 0}
                              onHover={setMenuSelection}
                            />
                            <MenuButton
                              index={1}
                              label={t.backToLobby}
                              onClick={() => {
                                setGameState((p) => ({
                                  ...p,
                                  status: "online_lobby",
                                }));
                              }}
                              isSelected={menuSelection === 1}
                              onHover={setMenuSelection}
                            />
                            <MenuButton
                              index={2}
                              label={t.mainMenu}
                              danger
                              onClick={() => {
                                onlineService.disconnect();
                                setGameState((p) => ({
                                  ...p,
                                  status: "menu",
                                }));
                              }}
                              isSelected={menuSelection === 2}
                              onHover={setMenuSelection}
                            />
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {gameState.customLevelsQueue &&
                      gameState.currentLevelIndex <
                        gameState.customLevelsQueue.length - 1 ? (
                        <>
                          <MenuButton
                            index={0}
                            label={t.nextLevelBtn}
                            onClick={handleNextLevel}
                            isSelected={menuSelection === 0}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={1}
                            label={t.backToSelection}
                            onClick={() =>
                              setGameState((p) => ({
                                ...p,
                                status:
                                  p.previousStatus === "brawler_playing"
                                    ? "brawler_setup"
                                    : "vs_setup",
                              }))
                            }
                            isSelected={menuSelection === 1}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={2}
                            label={t.mainMenu}
                            danger
                            onClick={() =>
                              setGameState((p) => ({ ...p, status: "menu" }))
                            }
                            isSelected={menuSelection === 2}
                            onHover={setMenuSelection}
                          />
                        </>
                      ) : (
                        <>
                          <MenuButton
                            index={0}
                            label={t.backToSelection}
                            onClick={() =>
                              setGameState((p) => ({
                                ...p,
                                status:
                                  p.previousStatus === "brawler_playing"
                                    ? "brawler_setup"
                                    : "vs_setup",
                              }))
                            }
                            isSelected={menuSelection === 0}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={1}
                            label={t.mainMenu}
                            danger
                            onClick={() =>
                              setGameState((p) => ({ ...p, status: "menu" }))
                            }
                            isSelected={menuSelection === 1}
                            onHover={setMenuSelection}
                          />
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Shop UI */}
            {gameState.status === "shop" && (
              <div className="absolute inset-0 flex flex-col items-center bg-black/95 text-white z-30 pt-10">
                <div className="flex items-center justify-between w-full max-w-6xl px-8 mb-6">
                  <h2 className="text-4xl text-yellow-500 font-arcade tracking-widest">{t.shop || "SHOP"}</h2>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShopTab("effects")} 
                      className={`px-4 py-2 font-bold tracking-widest uppercase transition-all border-b-2 ${shopTab === "effects" ? "border-yellow-500 text-yellow-500" : "border-transparent text-neutral-500 hover:text-white"}`}
                    >
                      EFFECTS
                    </button>
                    <button 
                      onClick={() => setShopTab("cosmetics")} 
                      className={`px-4 py-2 font-bold tracking-widest uppercase transition-all border-b-2 ${shopTab === "cosmetics" ? "border-yellow-500 text-yellow-500" : "border-transparent text-neutral-500 hover:text-white"}`}
                    >
                      COSMETICS
                    </button>
                    <button 
                      onClick={() => setShopTab("sounds")} 
                      className={`px-4 py-2 font-bold tracking-widest uppercase transition-all border-b-2 ${shopTab === "sounds" ? "border-yellow-500 text-yellow-500" : "border-transparent text-neutral-500 hover:text-white"}`}
                    >
                      {t.soundsTab || "SOUNDS"}
                    </button>
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
                  <div className="flex-1 flex gap-8 h-full">
                  {shopTab === "effects" && (
                    <>
                      {/* Death Animations Tab */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 border-r border-neutral-800 pr-4">
                        <h3 className="text-xl text-neutral-400 font-black tracking-widest border-b border-neutral-800 pb-2">{t.deathAnims || "DEATH ANIMATIONS"}</h3>
                        {SHOP_ITEMS.filter((i) => i.type === "deathAnim")
                          .sort((a, b) => {
                            const aUnlocked = a.price === 0 || (customization.unlockedDeathAnims || []).includes(a.id);
                            const bUnlocked = b.price === 0 || (customization.unlockedDeathAnims || []).includes(b.id);
                            if (aUnlocked && !bUnlocked) return -1;
                            if (!aUnlocked && bUnlocked) return 1;
                            if (!aUnlocked && !bUnlocked) return a.price - b.price;
                            return 0;
                          })
                          .map((item) => {
                          const isItemUnlocked = item.price === 0 || (customization.unlockedDeathAnims || []).includes(item.id);
                          const isEquipped = customization.deathAnim === item.id;
                          const canAfford = (customization.coins || 0) >= item.price;
                          
                          return (
                            <div 
                              key={item.id} 
                              className={`p-4 border-2 flex items-center gap-4 transition-all ${isEquipped ? "border-yellow-500 bg-yellow-900/20" : isItemUnlocked ? "border-green-600 bg-neutral-900 hover:border-green-400" : "border-neutral-800 bg-black"}`}
                              onMouseEnter={() => setHoveredShopItem(item)}
                              onMouseLeave={() => setHoveredShopItem(null)}
                            >
                               <div className="flex-1">
                                 <div className={`font-arcade text-lg ${isItemUnlocked ? 'text-white' : 'text-neutral-500'}`}>{(t.shopItemNames?.[item.id] || item.name).toUpperCase()}</div>
                                 {!isItemUnlocked && <div className="text-yellow-500 text-xs font-bold pt-1">{item.price} {t.coins || 'COINS'}</div>}
                                 <button 
                                   onClick={() => {
                                     if (isItemUnlocked) {
                                       setCustomization(p => ({ ...p, deathAnim: item.id }));
                                     } else if (canAfford) {
                                       setCustomization(p => ({
                                         ...p,
                                         coins: (p.coins || 0) - item.price,
                                         unlockedDeathAnims: [...(p.unlockedDeathAnims || []), item.id],
                                         deathAnim: item.id
                                       }));
                                     }
                                   }}
                                   disabled={!isItemUnlocked && !canAfford}
                                   className={`mt-2 px-4 py-2 font-bold text-xs w-full transition-colors ${isEquipped ? 'bg-yellow-500 text-black' : isItemUnlocked ? 'bg-green-600 text-white hover:bg-green-500' : canAfford ? 'bg-yellow-600 text-black hover:bg-yellow-500' : 'bg-neutral-800 text-neutral-600'}`}
                                 >
                                   {isEquipped ? (t.equipped || "EQUIPPED") : isItemUnlocked ? (t.equip || "EQUIP") : (t.buy || "BUY")}
                                 </button>
                               </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Trails Tab */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pl-4 border-l border-neutral-800">
                        <h3 className="text-xl text-neutral-400 font-black tracking-widest border-b border-neutral-800 pb-2">{t.trails || "TRAILS"}</h3>
                        {SHOP_ITEMS.filter((i) => i.type === "trailType")
                          .sort((a, b) => {
                            const aAch = ACHIEVEMENTS_LIST.find((ach) => ach.rewardType === "trail" && ach.rewardId === a.id);
                            const bAch = ACHIEVEMENTS_LIST.find((ach) => ach.rewardType === "trail" && ach.rewardId === b.id);
                            const aUnlocked = !!aAch ? gameState.unlockedAchievements.includes(aAch.id) : (a.price === 0 || (customization.unlockedTrails || []).includes(a.id));
                            const bUnlocked = !!bAch ? gameState.unlockedAchievements.includes(bAch.id) : (b.price === 0 || (customization.unlockedTrails || []).includes(b.id));

                            if (aUnlocked && !bUnlocked) return -1;
                            if (!aUnlocked && bUnlocked) return 1;
                            if (!aUnlocked && !bUnlocked) {
                              const aIsAch = !!aAch;
                              const bIsAch = !!bAch;
                              if (!aIsAch && bIsAch) return -1;
                              if (aIsAch && !bIsAch) return 1;
                              if (!aIsAch && !bIsAch) return a.price - b.price;
                              return 0;
                            }
                            return 0;
                          })
                          .map((item) => {
                          const ach = ACHIEVEMENTS_LIST.find((a) => a.rewardType === "trail" && a.rewardId === item.id);
                          const isAchievementReward = !!ach;
                          const isItemUnlocked = isAchievementReward ? gameState.unlockedAchievements.includes(ach.id) : (item.price === 0 || (customization.unlockedTrails || []).includes(item.id));
                          const isEquipped = (customization.trailType || "normal") === item.id;
                          const canAfford = (customization.coins || 0) >= item.price;
                          
                          return (
                            <div 
                              key={item.id} 
                              className={`p-4 border-2 flex items-center gap-4 transition-all ${isEquipped ? "border-yellow-500 bg-yellow-900/20" : isItemUnlocked ? "border-green-600 bg-neutral-900 hover:border-green-400" : "border-neutral-800 bg-black"}`}
                              onMouseEnter={() => setHoveredShopItem(item)}
                              onMouseLeave={() => setHoveredShopItem(null)}
                            >
                               <div className="flex-1">
                                 <div className={`font-arcade text-lg ${isItemUnlocked ? 'text-white' : 'text-neutral-500'}`}>{(t.shopItemNames?.['trail_' + item.id] || item.name).toUpperCase()}</div>
                                 {!isItemUnlocked && (
                                   isAchievementReward ? 
                                     <div className="text-purple-400 text-xs font-bold pt-1 uppercase">{t.locked} ({t.achievementReward})</div> :
                                     <div className="text-yellow-500 text-xs font-bold pt-1">{item.price} {t.coins || 'COINS'}</div>
                                 )}
                                 <button 
                                   onClick={() => {
                                     if (isItemUnlocked) {
                                       setCustomization(p => ({ ...p, trailType: item.id }));
                                     } else if (canAfford && !isAchievementReward) {
                                       setCustomization(p => ({
                                         ...p,
                                         coins: (p.coins || 0) - item.price,
                                         unlockedTrails: [...(p.unlockedTrails || []), item.id],
                                         trailType: item.id
                                       }));
                                     }
                                   }}
                                   disabled={!isItemUnlocked && (!canAfford || isAchievementReward)}
                                   className={`mt-2 px-4 py-2 font-bold text-xs w-full transition-colors ${isEquipped ? 'bg-yellow-500 text-black' : isItemUnlocked ? 'bg-green-600 text-white hover:bg-green-500' : (canAfford && !isAchievementReward) ? 'bg-yellow-600 text-black hover:bg-yellow-500' : 'bg-neutral-800 text-neutral-600'}`}
                                 >
                                   {isEquipped ? (t.equipped || "EQUIPPED") : isItemUnlocked ? (t.equip || "EQUIP") : isAchievementReward ? t.locked : (t.buy || "BUY")}
                                 </button>
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {shopTab === "cosmetics" && (
                    <>
                      {/* Eyes Tab */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 border-r border-neutral-800 pr-4">
                        <h3 className="text-xl text-neutral-400 font-black tracking-widest border-b border-neutral-800 pb-2">{t.eyesTab || "EYES"}</h3>
                        {SHOP_ITEMS.filter((i) => i.type === "eyes")
                          .sort((a, b) => {
                            const aAch = ACHIEVEMENTS_LIST.find((ach) => ach.rewardType === "eyes" && ach.rewardId === a.id);
                            const bAch = ACHIEVEMENTS_LIST.find((ach) => ach.rewardType === "eyes" && ach.rewardId === b.id);
                            const aUnlocked = !!aAch ? gameState.unlockedAchievements.includes(aAch.id) : (a.price === 0 || (customization.unlockedEyes || []).includes(a.id));
                            const bUnlocked = !!bAch ? gameState.unlockedAchievements.includes(bAch.id) : (b.price === 0 || (customization.unlockedEyes || []).includes(b.id));

                            if (aUnlocked && !bUnlocked) return -1;
                            if (!aUnlocked && bUnlocked) return 1;
                            if (!aUnlocked && !bUnlocked) {
                              const aIsAch = !!aAch;
                              const bIsAch = !!bAch;
                              if (!aIsAch && bIsAch) return -1;
                              if (aIsAch && !bIsAch) return 1;
                              if (!aIsAch && !bIsAch) return a.price - b.price;
                              return 0;
                            }
                            return 0;
                          })
                          .map((item) => {
                          const ach = ACHIEVEMENTS_LIST.find((a) => a.rewardType === "eyes" && a.rewardId === item.id);
                          const isAchievementReward = !!ach;
                          const isItemUnlocked = isAchievementReward ? gameState.unlockedAchievements.includes(ach.id) : (item.price === 0 || (customization.unlockedEyes || []).includes(item.id));
                          const isEquipped = customization.eyes === item.id;
                          const canAfford = (customization.coins || 0) >= item.price;
                          
                          return (
                            <div 
                              key={item.id} 
                              onMouseEnter={() => setHoveredShopItem(item)}
                              onMouseLeave={() => setHoveredShopItem(null)}
                              onClick={() => {
                                if (isItemUnlocked) {
                                  setCustomization(p => ({ ...p, eyes: item.id as any }));
                                } else if (canAfford && !isAchievementReward) {
                                  setCustomization(p => ({
                                    ...p,
                                    coins: (p.coins || 0) - item.price,
                                    unlockedEyes: [...(p.unlockedEyes || []), item.id],
                                    eyes: item.id as any
                                  }));
                                }
                              }}
                              className={`p-4 border-2 flex items-center gap-4 transition-all cursor-pointer ${isEquipped ? "border-yellow-500 bg-yellow-900/40" : isItemUnlocked ? "border-green-600 bg-neutral-900 hover:border-green-400" : (canAfford && !isAchievementReward) ? "border-neutral-700 bg-black hover:border-yellow-600/50" : "border-neutral-800 bg-black opacity-80"}`}
                            >
                               <div className="flex-1">
                                 <div className={`font-arcade text-lg ${isItemUnlocked ? 'text-white' : 'text-neutral-500'}`}>{(t.eye_names?.[item.id] || item.name).toUpperCase()}</div>
                                 {!isItemUnlocked && (
                                   isAchievementReward ? 
                                     <div className="text-purple-400 text-xs font-bold pt-1 uppercase">{t.locked} ({t.achievementReward})</div> :
                                     <div className="text-yellow-500 text-xs font-bold pt-1">{item.price} {t.coins || 'COINS'}</div>
                                 )}
                                 <div className="mt-2 w-full">
                                   {isEquipped ? (
                                     <div className="w-full text-yellow-500 font-black text-[10px] tracking-tighter bg-yellow-950 px-2 py-2 rounded border border-yellow-500/50 animate-pulse text-center uppercase">
                                       {t.equipped || "EQUIPPED"}
                                     </div>
                                   ) : isItemUnlocked ? (
                                     <div className="w-full text-green-500 font-bold text-[8px] uppercase tracking-widest bg-green-950 px-2 py-2 rounded border border-green-500/30 text-center">
                                       {t.equip || "EQUIP"}
                                     </div>
                                   ) : isAchievementReward ? (
                                     <div className="w-full px-2 py-2 font-bold text-[8px] uppercase tracking-widest bg-purple-900/50 text-purple-400 border border-purple-500/30 rounded text-center">
                                        {t.locked}
                                     </div>
                                   ) : (
                                     <div className={`w-full px-4 py-2 font-bold text-xs rounded transition-all text-center ${canAfford ? 'bg-yellow-600 text-black hover:bg-yellow-500 shadow-[0_0_10px_rgba(234,113,8,0.3)]' : 'bg-neutral-800 text-neutral-600'}`}>
                                       {t.buy || "BUY"}
                                     </div>
                                   )}
                                 </div>
                               </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Hats Tab */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pl-4 border-l border-neutral-800">
                        <h3 className="text-xl text-neutral-400 font-black tracking-widest border-b border-neutral-800 pb-2">{t.hatsTab || "HATS & ACCESSORIES"}</h3>
                        {SHOP_ITEMS.filter((i) => i.type === "accessory")
                          .sort((a, b) => {
                            const aAch = ACHIEVEMENTS_LIST.find((ach) => ach.rewardType === "accessory" && ach.rewardId === a.id);
                            const bAch = ACHIEVEMENTS_LIST.find((ach) => ach.rewardType === "accessory" && ach.rewardId === b.id);
                            const aUnlocked = !!aAch ? gameState.unlockedAchievements.includes(aAch.id) : (a.price === 0 || (customization.unlockedAccessories || []).includes(a.id));
                            const bUnlocked = !!bAch ? gameState.unlockedAchievements.includes(bAch.id) : (b.price === 0 || (customization.unlockedAccessories || []).includes(b.id));

                            if (aUnlocked && !bUnlocked) return -1;
                            if (!aUnlocked && bUnlocked) return 1;
                            if (!aUnlocked && !bUnlocked) {
                              const aIsAch = !!aAch;
                              const bIsAch = !!bAch;
                              if (!aIsAch && bIsAch) return -1;
                              if (aIsAch && !bIsAch) return 1;
                              if (!aIsAch && !bIsAch) return a.price - b.price;
                              return 0;
                            }
                            return 0;
                          })
                          .map((item) => {
                          const ach = ACHIEVEMENTS_LIST.find((a) => a.rewardType === "accessory" && a.rewardId === item.id);
                          const isAchievementReward = !!ach;
                          const isItemUnlocked = isAchievementReward ? gameState.unlockedAchievements.includes(ach.id) : (item.price === 0 || (customization.unlockedAccessories || []).includes(item.id));
                          const isEquipped = customization.accessory === item.id;
                          const canAfford = (customization.coins || 0) >= item.price;
                          
                          return (
                            <div 
                              key={item.id} 
                              onMouseEnter={() => setHoveredShopItem(item)}
                              onMouseLeave={() => setHoveredShopItem(null)}
                              onClick={() => {
                                if (isItemUnlocked) {
                                  setCustomization(p => ({ ...p, accessory: item.id as any }));
                                } else if (canAfford && !isAchievementReward) {
                                  setCustomization(p => ({
                                    ...p,
                                    coins: (p.coins || 0) - item.price,
                                    unlockedAccessories: [...(p.unlockedAccessories || []), item.id],
                                    accessory: item.id as any
                                  }));
                                }
                              }}
                              className={`p-4 border-2 flex items-center gap-4 transition-all cursor-pointer ${isEquipped ? "border-yellow-500 bg-yellow-900/40" : isItemUnlocked ? "border-green-600 bg-neutral-900 hover:border-green-400" : (canAfford && !isAchievementReward) ? "border-neutral-700 bg-black hover:border-yellow-600/50" : "border-neutral-800 bg-black opacity-80"}`}
                            >
                               <div className="flex-1">
                                 <div className={`font-arcade text-lg ${isItemUnlocked ? 'text-white' : 'text-neutral-500'}`}>{(t.acc_names?.[item.id] || item.name).toUpperCase()}</div>
                                 {!isItemUnlocked && (
                                   isAchievementReward ? 
                                     <div className="text-purple-400 text-xs font-bold pt-1 uppercase">{t.locked} ({t.achievementReward})</div> :
                                     <div className="text-yellow-500 text-xs font-bold pt-1">{item.price} {t.coins || 'COINS'}</div>
                                 )}
                                 <div className="mt-2 w-full">
                                   {isEquipped ? (
                                     <div className="w-full text-yellow-500 font-black text-[10px] tracking-tighter bg-yellow-950 px-2 py-2 rounded border border-yellow-500/50 animate-pulse text-center uppercase">
                                       {t.equipped || "EQUIPPED"}
                                     </div>
                                   ) : isItemUnlocked ? (
                                     <div className="w-full text-green-500 font-bold text-[8px] uppercase tracking-widest bg-green-950 px-2 py-2 rounded border border-green-500/30 text-center">
                                       {t.equip || "EQUIP"}
                                     </div>
                                   ) : isAchievementReward ? (
                                     <div className="w-full px-2 py-2 font-bold text-[8px] uppercase tracking-widest bg-purple-900/50 text-purple-400 border border-purple-500/30 rounded text-center">
                                        {t.locked}
                                     </div>
                                   ) : (
                                     <div className={`w-full px-4 py-2 font-bold text-xs rounded transition-all text-center ${canAfford ? 'bg-yellow-600 text-black hover:bg-yellow-500 shadow-[0_0_10px_rgba(234,113,8,0.3)]' : 'bg-neutral-800 text-neutral-600'}`}>
                                       {t.buy || "BUY"}
                                     </div>
                                   )}
                                 </div>
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {shopTab === "sounds" && (
                    <>
                      {/* Sounds Tab */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 border-r border-neutral-800 pr-4">
                        <h3 className="text-xl text-neutral-400 font-black tracking-widest border-b border-neutral-800 pb-2">{t.deathSounds || "DEATH SOUNDS"}</h3>
                        {SHOP_ITEMS.filter((i) => i.type === "deathSound")
                          .sort((a, b) => {
                            const aUnlocked = a.price === 0 || (customization.unlockedDeathSounds || []).includes(a.id);
                            const bUnlocked = b.price === 0 || (customization.unlockedDeathSounds || []).includes(b.id);
                            if (aUnlocked && !bUnlocked) return -1;
                            if (!aUnlocked && bUnlocked) return 1;
                            return a.price - b.price;
                          })
                          .map((item) => {
                            const isUnlocked = item.price === 0 || (customization.unlockedDeathSounds || []).includes(item.id);
                            const isSelected = customization.deathSound === item.id || (!customization.deathSound && item.id === "default");
                            
                            return (
                              <div
                                key={item.id}
                                onMouseEnter={() => setHoveredShopItem(item)}
                                onMouseLeave={() => setHoveredShopItem(null)}
                                className={`flex flex-col p-4 rounded-lg border-2 transition-all group ${
                                  isSelected
                                    ? "bg-yellow-500/20 border-yellow-500 cursor-default"
                                    : "bg-black/40 border-neutral-800 hover:border-neutral-600 cursor-pointer"
                                }`}
                                onClick={() => {
                                  if (isUnlocked) {
                                    setCustomization((p) => ({ ...p, deathSound: item.id }));
                                    import('./services/audioService').then(m => m.audio.playDie(item.id));
                                  } else if ((customization.coins || 0) >= item.price) {
                                    setCustomization((p) => ({
                                      ...p,
                                      coins: (p.coins || 0) - item.price,
                                      unlockedDeathSounds: [...(p.unlockedDeathSounds || []), item.id],
                                      deathSound: item.id,
                                    }));
                                    import('./services/audioService').then(m => m.audio.playDie(item.id));
                                  }
                                }}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <div className="flex-1">
                                    <div className={`font-black uppercase tracking-wider text-lg ${isSelected ? "text-yellow-400" : "text-white group-hover:text-yellow-200"}`}>{item.name}</div>
                                    {!isUnlocked && (
                                      <div className="text-yellow-500 font-arcade text-sm mt-1">{item.price} COINS</div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        import('./services/audioService').then(m => m.audio.playDie(item.id));
                                      }}
                                      className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors text-white"
                                      title="Preview Sound"
                                    >
                                      ▶️
                                    </button>
                                    <div className="text-3xl opacity-50">
                                      {isUnlocked ? "🎵" : "🔒"}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 w-full">
                                  {isSelected ? (
                                    <div className="w-full text-yellow-500 font-black text-[10px] tracking-tighter bg-yellow-950 px-2 py-2 rounded border border-yellow-500/50 animate-pulse text-center uppercase">
                                      {t.equipped || "EQUIPPED"}
                                    </div>
                                  ) : isUnlocked ? (
                                    <div className="w-full text-green-500 font-bold text-[8px] uppercase tracking-widest bg-green-950 px-2 py-2 rounded border border-green-500/30 text-center">
                                      {t.equip || "EQUIP"}
                                    </div>
                                  ) : (
                                    <div className={`w-full px-4 py-2 font-bold text-xs rounded transition-all text-center ${(customization.coins || 0) >= item.price ? 'bg-yellow-600 text-black hover:bg-yellow-500' : 'bg-neutral-800 text-neutral-600'}`}>
                                      {t.buy || "BUY"}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                        })}
                      </div>
                      <div className="flex-1 flex flex-col justify-center items-center text-center opacity-50 mb-10">
                         <div className="text-6xl mb-4">🔊</div>
                         <div className="text-xl font-bold max-w-[250px]">{t.deathSoundDesc || "Equip a custom sound effect to assert dominance when you fall!"}</div>
                      </div>
                    </>
                  )}
                  </div>
                </div>

                <div className="mt-8 w-72">
                  <MenuButton
                    index={0}
                    label={t.back}
                    onClick={() => setGameState((p) => ({ ...p, status: "menu" }))}
                    isSelected={menuSelection === 0}
                    onHover={setMenuSelection}
                  />
                </div>
              </div>
            )}

            {/* Book Menu */}
            {gameState.status === "book" && (
              <Book onClose={() => setGameState((p) => ({ ...p, status: "menu" }))} lang={lang || Language.DE} />
            )}

            {/* Settings Menu */}
            {gameState.status === "settings" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white z-30 overflow-y-auto py-12">
                <h2 className="text-3xl mb-8 text-rage-red">{t.settings}</h2>
                <div className="w-72 space-y-6">
                  <div
                    className={`p-4 border transition-all ${menuSelection === 0 ? "border-white bg-neutral-800" : "border-transparent"}`}
                    onMouseEnter={() => setMenuSelection(0)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="uppercase text-[10px] font-arcade text-neutral-400 w-full text-left ml-2">
                        {t.playerNameLabel || "PLAYER NAME"}
                      </span>
                      <div className="w-full bg-black border border-neutral-700 p-1">
                        <input
                          type="text"
                          value={settings.playerName || ""}
                          maxLength={10}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                            setSettings((p) => ({ ...p, playerName: val }));
                            setPlayerName(val);
                          }}
                          className="w-full bg-transparent outline-none text-center text-white font-arcade uppercase placeholder:text-neutral-800"
                          placeholder="???"
                        />
                      </div>
                    </div>
                    <div className="text-[7px] text-neutral-600 mt-2 text-center uppercase tracking-widest">
                      Max. 10 {lang === Language.DE ? "Zeichen" : "Chars"}
                    </div>
                  </div>
                  <SettingsSlider
                    label={t.sfx}
                    value={settings.sfxVolume}
                    index={1}
                    colorClass="bg-troll-green"
                    onChange={(v: number) =>
                      setSettings((p) => ({ ...p, sfxVolume: v }))
                    }
                    isSelected={menuSelection === 1}
                    onHover={setMenuSelection}
                  />
                  <SettingsSlider
                    label={t.deathSounds || "DEATH SOUNDS"}
                    value={settings.deathVolume ?? 0.5}
                    index={2}
                    colorClass="bg-red-500"
                    onChange={(v: number) =>
                      setSettings((p) => ({ ...p, deathVolume: v }))
                    }
                    isSelected={menuSelection === 2}
                    onHover={setMenuSelection}
                  />
                  <div
                    className={`p-4 border cursor-pointer ${menuSelection === 3 ? "border-white bg-neutral-800" : "border-transparent"}`}
                    onMouseEnter={() => setMenuSelection(3)}
                    onClick={() => {
                      setSettings((p) => {
                        const currentIndex = FPS_OPTIONS.indexOf(p.fpsCap);
                        let nextIndex = currentIndex + 1;
                        if (nextIndex >= FPS_OPTIONS.length) nextIndex = 0;
                        return { ...p, fpsCap: FPS_OPTIONS[nextIndex] };
                      });
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span>MAX FPS</span>
                      <span className="text-blue-400 font-bold">
                        {settings.fpsCap === 0 ? "UNLIMITED" : settings.fpsCap}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      {t.clickOrArrowsToChange || "CLICK OR ARROWS TO CHANGE"}
                    </div>
                  </div>
                  <div
                    className={`p-4 border cursor-pointer ${menuSelection === 4 ? "border-white bg-neutral-800" : "border-transparent"}`}
                    onMouseEnter={() => setMenuSelection(4)}
                    onClick={() => {
                      setSettings((p) => {
                        const currentScale = p.uiScale || 1;
                        const currentIndex = UI_SCALE_OPTIONS.indexOf(currentScale) !== -1 ? UI_SCALE_OPTIONS.indexOf(currentScale) : 2;
                        let nextIndex = currentIndex + 1;
                        if (nextIndex >= UI_SCALE_OPTIONS.length) nextIndex = 0;
                        return { ...p, uiScale: UI_SCALE_OPTIONS[nextIndex] };
                      });
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span>{t.uiSize || "UI SIZE"}</span>
                      <span className="text-blue-400 font-bold">
                        {Math.round((settings.uiScale || 1) * 100)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      {t.clickOrArrowsToChange || "CLICK OR ARROWS TO CHANGE"}
                    </div>
                  </div>
                   <div
                    className={`p-4 border cursor-pointer ${menuSelection === 5 ? "border-white bg-neutral-800" : "border-transparent"}`}
                    onMouseEnter={() => setMenuSelection(5)}
                    onClick={() => {
                      setSettings((p) => {
                        const currentScale = p.resolutionScale || 1080;
                        const currentIndex = RESOLUTION_OPTIONS.indexOf(currentScale) !== -1 ? RESOLUTION_OPTIONS.indexOf(currentScale) : 1;
                        let nextIndex = currentIndex + 1;
                        if (nextIndex >= RESOLUTION_OPTIONS.length) nextIndex = 0;
                        return { ...p, resolutionScale: RESOLUTION_OPTIONS[nextIndex] };
                      });
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span>AUFLÖSUNG / RESOLUTION</span>
                      <span className="text-blue-400 font-bold">
                        {settings.resolutionScale === 720 ? "720p (HD)" : settings.resolutionScale === 1080 ? "1080p (FHD)" : settings.resolutionScale === 1440 ? "1440p (WQHD)" : "2160p (4K)"}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      {t.clickOrArrowsToChange || "CLICK OR ARROWS TO CHANGE"}
                    </div>
                  </div>
                  <SettingsSlider
                    label="SCREEN SHAKE"
                    value={settings.screenShake ?? 1}
                    index={6}
                    colorClass="bg-yellow-500"
                    onChange={(v: number) =>
                      setSettings((p) => ({ ...p, screenShake: v }))
                    }
                    isSelected={menuSelection === 6}
                    onHover={setMenuSelection}
                  />
                  <SettingsSlider
                    label={t.opponentOpacity || "OPPONENT OPACITY"}
                    value={settings.opponentOpacity ?? 0.5}
                    index={7}
                    colorClass="bg-cyan-500"
                    onChange={(v: number) =>
                      setSettings((p) => ({ ...p, opponentOpacity: v }))
                    }
                    isSelected={menuSelection === 7}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={8}
                    label={`${t.editorEdgeScroll}: ${settings.editorEdgeScroll ? t.onLabel : t.offLabel}`}
                    onClick={() =>
                      setSettings((p) => ({ ...p, editorEdgeScroll: !p.editorEdgeScroll }))
                    }
                    isSelected={menuSelection === 8}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={9}
                    label={t.keybindings}
                    onClick={() => {
                      setGameState((p) => ({ ...p, status: "keybindings" }));
                      setMenuSelection(0);
                    }}
                    isSelected={menuSelection === 9}
                    onHover={setMenuSelection}
                  />
                  <MenuButton
                    index={10}
                    label={t.back}
                    onClick={() => {
                      const nextStatus = gameState.previousStatus || "menu";
                      setGameState((p) => ({ 
                        ...p, 
                        status: nextStatus,
                        previousStatus: undefined 
                      }));
                      if (nextStatus === "paused") {
                        setMenuSelection(0);
                      }
                    }}
                    isSelected={menuSelection === 10}
                    onHover={setMenuSelection}
                  />
                </div>
              </div>
            )}

            {/* Keybindings Menu */}
            {gameState.status === "keybindings" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white z-30 overflow-y-auto custom-scrollbar py-10">
                <h2 className="text-3xl mb-4 text-rage-red uppercase">{t.keybindings}</h2>
                <div className="text-center text-sm text-neutral-400 mb-8 max-w-md">
                  {t.keybindingsDesc}
                </div>

                <div className="flex gap-8 mb-8">
                  {/* Player 1 */}
                  <div className="w-64 space-y-1">
                    <h3 className="text-xl text-troll-green mb-2 text-center uppercase">
                      {t.player1}
                    </h3>
                    {[
                      "up",
                      "down",
                      "left",
                      "right",
                      "action",
                      "dash",
                    ].map((action, i) => {
                      const isEditing =
                        editingKey?.player === 1 &&
                        editingKey.action === action;
                      const bindings =
                        settings.keybindingsP1?.[
                          action as keyof Keybindings
                        ] || [];
                      const keyBind = bindings.find(k => !k.startsWith("GP_")) || 
                        (action === "up" ? "KeyW" : action === "down" ? "KeyS" : action === "left" ? "KeyA" : action === "right" ? "KeyD" : action === "action" ? "KeyQ" : "KeyF");
                      const gpBind = bindings.find(k => k.startsWith("GP_")) || "None";

                      return (
                        <div
                          key={action}
                          className={`p-2 border cursor-pointer flex flex-col transition-colors ${menuSelection === i ? "border-white bg-neutral-800" : "border-transparent border-b-neutral-800"}`}
                          onMouseEnter={() => setMenuSelection(i)}
                          onClick={() =>
                            setEditingKey({
                              player: 1,
                              action: action as keyof Keybindings,
                            })
                          }
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="uppercase text-[10px] font-bold text-neutral-400">
                              {t[action as keyof typeof t] || action}
                            </span>
                            {isEditing && (
                              <span className="text-rage-red animate-pulse text-[9px] font-black italic">
                                {t.pressKey}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <div className="flex gap-1 items-center">
                              <span className="font-bold text-blue-400">
                                {keyBind
                                    .replace("Arrow", "")
                                    .replace("Key", "")
                                    .replace("Digit", "")
                                    .replace("ControlRight", "R-CTRL")
                                    .replace("ControlLeft", "L-CTRL")
                                    .toUpperCase()}
                              </span>
                            </div>
                            <div className="flex gap-1 items-center">
                               <span className="font-bold text-yellow-500">
                                 {gpBind.replace("GP_", "").toUpperCase()}
                               </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Player 2 */}
                  <div className="w-64 space-y-1">
                    <h3 className="text-xl text-troll-green mb-2 text-center uppercase">
                      {t.player2}
                    </h3>
                    {[
                      "up",
                      "down",
                      "left",
                      "right",
                      "action",
                      "dash",
                    ].map((action, i) => {
                      const idx = i + 6;
                      const isEditing =
                        editingKey?.player === 2 &&
                        editingKey.action === action;
                      const bindings =
                        settings.keybindingsP2?.[
                          action as keyof Keybindings
                        ] || [];
                      const keyBind = bindings.find(k => !k.startsWith("GP_")) || 
                        (action === "up" ? "ArrowUp" : action === "down" ? "ArrowDown" : action === "left" ? "ArrowLeft" : action === "right" ? "ArrowRight" : action === "action" ? "ControlRight" : "ShiftRight");
                      const gpBind = bindings.find(k => k.startsWith("GP_")) || "None";

                      return (
                        <div
                          key={action}
                          className={`p-2 border cursor-pointer flex flex-col transition-colors ${menuSelection === idx ? "border-white bg-neutral-800" : "border-transparent border-b-neutral-800"}`}
                          onMouseEnter={() => setMenuSelection(idx)}
                          onClick={() =>
                            setEditingKey({
                              player: 2,
                              action: action as keyof Keybindings,
                            })
                          }
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="uppercase text-[10px] font-bold text-neutral-400">
                               {t[action as keyof typeof t] || action}
                            </span>
                            {isEditing && (
                              <span className="text-rage-red animate-pulse text-[9px] font-black italic">
                                {t.pressKey}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <div className="flex gap-1 items-center">
                              <span className="font-bold text-blue-400">
                                {keyBind
                                    .replace("Arrow", "")
                                    .replace("Key", "")
                                    .replace("Digit", "")
                                    .replace("ControlRight", "R-CTRL")
                                    .replace("ControlLeft", "L-CTRL")
                                    .toUpperCase()}
                              </span>
                            </div>
                            <div className="flex gap-1 items-center">
                               <span className="font-bold text-yellow-500">
                                 {gpBind.replace("GP_", "").toUpperCase()}
                               </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="w-72">
                  <MenuButton
                    index={12}
                    label={t.back}
                    onClick={() => {
                      setGameState((p) => ({ ...p, status: "settings" }));
                      setMenuSelection(2);
                    }}
                    isSelected={menuSelection === 12}
                    onHover={setMenuSelection}
                  />
                </div>
              </div>
            )}

            {/* Highscores Menu (Per Level) */}
            {gameState.status === "highscores" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white z-30">
                <h2 className="text-3xl mb-4 text-troll-green">
                  {t.highscores}
                </h2>

                <div className="mb-4 flex flex-col items-center">
                  <div className="text-[10px] text-neutral-500 mb-1">
                    {t.changeSourceHint || "USE UP/DOWN TO CHANGE SOURCE"}
                  </div>
                  <button
                    onClick={() => {
                      const sources: any[] =
                        gameState.onlineMode === "brawler"
                          ? ["brawler", "custom"]
                          : ["builtin", "beginner", "advanced", "expert", "god", "custom"];
                      const currentIdx = sources.indexOf(levelSource);
                      let nextIdx = (currentIdx + 1) % sources.length;
                      const newSource = sources[nextIdx];
                      if (newSource === "custom" && customLevels.length === 0) {
                        nextIdx = (nextIdx + 1) % sources.length;
                      }
                      setLevelSource(sources[nextIdx]);
                      setHighscoreLevelIndex(0);
                    }}
                    className={`text-sm font-bold text-blue-400 hover:underline cursor-pointer uppercase tracking-widest`}
                  >
                    {(() => {
                      if (levelSource === "beginner") return t.beginner || "BEGINNER";
                      if (levelSource === "advanced") return t.advanced || "ADVANCED";
                      if (levelSource === "expert") return t.expert || "EXPERT";
                      if (levelSource === "god") return t.god || "JUMP GOD";
                      if (levelSource === "brawler") return t.brawlerLevels || "BRAWLER";
                      if (levelSource === "custom") return t.customLevelsLabel || "OWN LEVELS";
                      if (levelSource === "builtin") return t.fullRun || "FULL RUN";
                      return levelSource.toUpperCase();
                    })()}
                  </button>
                </div>

                {levelSource !== "builtin" && (
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="w-48 aspect-video bg-black border border-neutral-700 rounded overflow-hidden shadow-lg">
                      {(() => {
                        let activeList: LevelData[] = [];
                        if (levelSource === "beginner") activeList = INITIAL_LEVELS;
                        else if (levelSource === "advanced") activeList = ADVANCED_LEVELS;
                        else if (levelSource === "expert") activeList = EXPERT_LEVELS;
                        else if (levelSource === "god") activeList = GOD_LEVELS;
                        else if (levelSource === "brawler") activeList = BRAWLER_LEVELS;
                        else if (levelSource === "custom") activeList = customLevels;

                        const idx = Math.min(
                          Math.max(0, highscoreLevelIndex),
                          Math.max(0, activeList.length - 1),
                        );
                        if (activeList[idx]) {
                          return (
                            <LevelPreview
                              level={activeList[idx]}
                              width={192}
                              height={108}
                              className="w-full h-full"
                            />
                          );
                        }
                        return <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">NO PREVIEW</div>;
                      })()}
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        className="text-3xl hover:text-white text-neutral-500 transition-colors p-2"
                        onClick={() =>
                          setHighscoreLevelIndex((p) => Math.max(0, p - 1))
                        }
                      >
                        ◀
                      </button>
                      <div className="text-center w-64 px-2">
                        {(() => {
                          let activeList: LevelData[] = [];
                          if (levelSource === "beginner") activeList = INITIAL_LEVELS;
                          else if (levelSource === "advanced") activeList = ADVANCED_LEVELS;
                          else if (levelSource === "expert") activeList = EXPERT_LEVELS;
                          else if (levelSource === "god") activeList = GOD_LEVELS;
                          else if (levelSource === "brawler") activeList = BRAWLER_LEVELS;
                          else if (levelSource === "custom") activeList = customLevels;

                          const idx = Math.min(
                            Math.max(0, highscoreLevelIndex),
                            Math.max(0, activeList.length - 1),
                          );
                          const currentLevel = activeList[idx];

                          return (
                            <>
                              <div className="text-xs text-neutral-400 font-mono tracking-tighter">
                                {t.level || "LEVEL"}{" "}
                                {idx + 1} / {activeList.length}
                              </div>
                              <div className="text-white font-bold truncate text-lg">
                                {currentLevel?.name || "NO LEVELS"}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <button
                        className="text-3xl hover:text-white text-neutral-500 transition-colors p-2"
                        onClick={() => {
                          let activeList: LevelData[] = [];
                          if (levelSource === "beginner") activeList = INITIAL_LEVELS;
                          else if (levelSource === "advanced") activeList = ADVANCED_LEVELS;
                          else if (levelSource === "expert") activeList = EXPERT_LEVELS;
                          else if (levelSource === "god") activeList = GOD_LEVELS;
                          else if (levelSource === "brawler") activeList = BRAWLER_LEVELS;
                          else if (levelSource === "custom") activeList = customLevels;

                          setHighscoreLevelIndex((p) =>
                            Math.min(activeList.length - 1, p + 1),
                          );
                        }}
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                )}

                {levelSource === "builtin" && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-center w-64">
                      <div className="text-white font-bold text-xl text-yellow-500 animate-pulse uppercase tracking-widest">
                        {t.fullRun || "FULL RUN (1-10)"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-80 space-y-2 mb-8 h-64 overflow-y-auto custom-scrollbar bg-neutral-900/50 rounded-lg p-2 border border-neutral-800">
                  {(() => {
                    let activeList: LevelData[] = [];
                    if (levelSource === "beginner") activeList = INITIAL_LEVELS;
                    else if (levelSource === "advanced") activeList = ADVANCED_LEVELS;
                    else if (levelSource === "expert") activeList = EXPERT_LEVELS;
                    else if (levelSource === "god") activeList = GOD_LEVELS;
                    else if (levelSource === "brawler") activeList = BRAWLER_LEVELS;
                    else if (levelSource === "custom") activeList = customLevels;
                    else if (levelSource === "builtin") activeList = INITIAL_LEVELS; // Just for fallback

                    if (levelSource === "custom" && activeList.length === 0)
                      return (
                        <p className="text-center text-red-500 mt-10">
                          {t.noLevels || "NO CUSTOM LEVELS"}
                        </p>
                      );

                    const idx = Math.min(
                      Math.max(0, highscoreLevelIndex),
                      Math.max(0, activeList.length - 1),
                    );
                    const currentId =
                      levelSource === "builtin"
                        ? "STORY_MODE"
                        : activeList[idx]?.id;

                    if (!currentId) return <p className="text-center text-neutral-500 mt-10">ERROR</p>;

                    const scores = highScores
                      .filter((h) => h.levelId === currentId)
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 10);

                    if (scores.length === 0)
                      return (
                        <div className="flex flex-col items-center justify-center mt-10 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-lg p-8">
                          <span className="text-4xl mb-2">👻</span>
                          <p className="text-center font-bold uppercase tracking-widest text-xs">
                            {t.noRecords || "NO RECORDS"}
                          </p>
                        </div>
                      );

                    return scores.map((h, i) => (
                      <div
                        key={i}
                        className="flex flex-col bg-black/40 border border-neutral-800 rounded p-3 mb-1 hover:border-blue-500/50 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white text-sm">
                            {i + 1}. {h.name}
                          </span>
                          <span className="text-yellow-400 font-bold text-sm">
                            {h.score}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-neutral-500 uppercase font-mono">
                          <span>{h.date}</span>
                          <span className="text-neutral-400">{h.time}s • {h.deaths}☠</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
                <div className="w-72">
                  <MenuButton
                    index={0}
                    label={t.back}
                    onClick={() =>
                      setGameState((p) => ({ ...p, status: "menu" }))
                    }
                    isSelected={menuSelection === 0}
                    onHover={setMenuSelection}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Toast */}
        {toastMessage && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white px-6 py-3 rounded-xl shadow-2xl border border-neutral-700 z-50 animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* Achievement Toast */}
        {achievementToast && (
          <div className="fixed bottom-4 right-4 bg-neutral-900 border-2 border-yellow-500 text-white p-4 rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.3)] z-[200] animate-in slide-in-from-right-10 fade-in duration-300 flex items-center gap-4 max-w-sm pointer-events-none">
            <div className="text-4xl animate-bounce">{achievementToast.icon}</div>
            <div className="flex flex-col">
              <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-1">
                {t.achievementUnlocked || "ACHIEVEMENT UNLOCKED"}
              </div>
              <div className="font-bold text-sm text-yellow-100">
                {t.achievements_data?.[achievementToast.id as keyof typeof t.achievements_data]?.title || achievementToast.title}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {t.achievements_data?.[achievementToast.id as keyof typeof t.achievements_data]?.desc || achievementToast.description}
              </div>
            </div>
          </div>
        )}

        {showLevelMenu && (
          <LevelMenu
            categories={(() => {
              const isVS =
                gameState.status === "vs_setup" ||
                gameState.onlineMode === "vs";
              const isBrawler =
                gameState.status === "brawler_setup" ||
                gameState.onlineMode === "brawler";
              const process = (list: LevelData[]) => {
                if (isVS) return filterVSLevels(list);
                if (isBrawler) return filterBrawlerLevels(list);
                return list;
              };

              return [
                { name: "Beginner", levels: process(INITIAL_LEVELS) },
                { name: "Advanced", levels: process(ADVANCED_LEVELS) },
                { name: "Expert", levels: process(EXPERT_LEVELS) },
                { name: "God", levels: process(GOD_LEVELS) },
                { name: "Brawler", levels: process(BRAWLER_LEVELS) },
                { name: "Custom Levels", levels: process(customLevels) },
              ];
            })()}
            selectedLevels={selectedLevels}
            onToggleLevel={toggleLevelSelection}
            onClose={() => setShowLevelMenu(false)}
            onStart={() => {
              setShowLevelMenu(false);
              if (selectedLevels.length > 0) {
                if (onlineService.lobbyCode && gameState.isHost) {
                  const firstLevel = selectedLevels[0];
                  setLevel(firstLevel);
                  setGameState(p => ({
                    ...p,
                    customLevelsQueue: selectedLevels,
                    currentLevelIndex: 0
                  }));
                  onlineService.broadcastLobbyState(
                    gameState.onlineMode!,
                    firstLevel,
                    selectedLevels,
                    brawlerTeamMode,
                    brawlerHazardMode,
                    undefined,
                    0,
                    gameState.collisionEnabled,
                    undefined,
                    brawlerPowerups,
                    brawlerSuddenDeath,
                    gameState.finishTimerEnabled
                  );
                } else {
                  // Local mode: if multiple levels, start a queue
                  setLevel(selectedLevels[0]);
                  setGameState((p) => ({
                    ...p,
                    customLevelsQueue:
                      selectedLevels.length > 1 ? selectedLevels : undefined,
                    currentLevelIndex: 0,
                  }));

                  // If we are in a setup screen, we might want to transition to playing
                  if (gameState.status === "vs_setup") {
                    setGameState((p) => ({
                      ...p,
                      status: "vs_playing",
                      levelDeaths: 0,
                      levelTime: 0,
                      collectedCoins: [],
                      deaths: 0,
                      blocksPlaced: 0,
                    }));
                    setRespawnTrigger(0);
                    checkAchievements({ mode: "vs" });
                  } else if (gameState.status === "brawler_setup") {
                    setGameState((p) => ({
                      ...p,
                      status: "brawler_powerup_setup",
                      levelDeaths: 0,
                      levelTime: 0,
                      collectedCoins: [],
                      deaths: 0,
                      blocksPlaced: 0,
                    }));
                    setMenuSelection(0);
                  }
                }
              }
            }}
            t={t}
          />
        )}
      </div>

      <div className="mt-4 text-neutral-500 text-xs hidden md:block text-center opacity-0 pointer-events-none">
        Rage Cube v7.0
      </div>
    </div>
  );
};

export default App;
