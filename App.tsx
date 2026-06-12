import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";

import { motion, AnimatePresence } from "motion/react";

import { secureSave, secureLoad, signData, verifyData } from "./utils/storage";
import GameCanvas from "./components/GameCanvas";
import LevelEditor from "./components/LevelEditor";
import CustomLevelSelect from "./components/CustomLevelSelect";
import LevelPreview from "./components/LevelPreview";
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
  Status,
  EYE_OPTIONS,
  ACC_OPTIONS,
  TRAIL_PRESETS,
  hexToRgb,
} from "./types";
import {
  INITIAL_LEVELS,
  ADVANCED_LEVELS,
  EXPERT_LEVELS,
  GOD_LEVELS,
  BRAWLER_LEVELS,
  BUILD_BATTLE_LEVELS,
  TRANSLATIONS,
  ACHIEVEMENTS_LIST,
  STANDARD_EMOJIS,
  SPECIAL_EMOJIS,
  GAME_WIDTH,
  GAME_HEIGHT,
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
import { assetLoader } from "./services/assetLoader";

const BUILD_BATTLE_POSSIBLE_ITEMS = [
  { type: "wall", label: "WAND", icon: "🧱", args: { w: 60, h: 30 } },
  { type: "wall", label: "WAND (KLEIN)", icon: "🧱", args: { w: 30, h: 30 } },
  { type: "wall", label: "WAND (LANG)", icon: "🧱", args: { w: 120, h: 30 } },
  { type: "wall", label: "WAND (GROSS)", icon: "🧱", args: { w: 90, h: 90 } },
  { type: "hazard", label: "STACHELN", icon: "⚠️", args: { w: 60, h: 30 } },
  {
    type: "hazard",
    label: "STACHELN (KLEIN)",
    icon: "⚠️",
    args: { w: 30, h: 30 },
  },
  {
    type: "hazard",
    label: "STACHELN (LANG)",
    icon: "⚠️",
    args: { w: 120, h: 30 },
  },
  { type: "ice", label: "EISBLOCK", icon: "🧊", args: { w: 60, h: 30 } },
  {
    type: "ice",
    label: "EISBLOCK (KLEIN)",
    icon: "🧊",
    args: { w: 30, h: 30 },
  },
  { type: "slime", label: "SCHLEIM", icon: "🟩", args: { w: 60, h: 30 } },
  {
    type: "slime",
    label: "SCHLEIM (KLEIN)",
    icon: "🟩",
    args: { w: 30, h: 30 },
  },
  {
    type: "trampoline",
    label: "TRAMPOLIN",
    icon: "⬆️",
    args: { w: 60, h: 30 },
  },
  { type: "fragile", label: "BRÖCKEL", icon: "🪨", args: { w: 60, h: 30 } },
  {
    type: "moving_platform_h",
    label: "LIFT (H)",
    icon: "↔️",
    args: { w: 60, h: 30, moveRange: 150, moveSpeed: 0.003 },
  },
  {
    type: "moving_platform_v",
    label: "LIFT (V)",
    icon: "↕️",
    args: { w: 60, h: 30, moveRange: 150, moveSpeed: 0.003 },
  },
  {
    type: "gravity_reverse",
    label: "GRAV (UMKEHR)",
    icon: "🔃",
    args: { w: 90, h: 90 },
  },
  {
    type: "gravity_zero",
    label: "GRAV (SCHWERELOS)",
    icon: "🌌",
    args: { w: 90, h: 90 },
  },
  { type: "teleport", label: "TELEPORTER", icon: "🌀", args: { w: 40, h: 40 } },
  {
    type: "powerup_double_jump",
    label: "DOPPELSPRUNG",
    icon: "⚡",
    args: { w: 30, h: 30 },
  },
  { type: "block_dash", label: "DASH BLOCK", icon: "💨", args: { w: 30, h: 30 } },
  // Neue Blöcke / Erweiterung:
  { type: "fan", label: "VENTILATOR", icon: "🌬️", args: { w: 60, h: 30 } },
  {
    type: "orbit",
    label: "ROTOR ROTIEREND",
    icon: "🎡",
    args: { w: 60, h: 30, moveRange: 80, moveSpeed: 0.0025 },
  },
  { type: "bomb", label: "BOMBE", icon: "💣", args: { w: 30, h: 30 } },
  { type: "glue", label: "KLEBER", icon: "🍯", args: { w: 30, h: 6 } },
  { type: "coin", label: "MÜNZE", icon: "🪙", args: { w: 30, h: 30 } },
  // Eigenschaften-Blocker (modifiers):
  {
    type: "modifier_moving_platform_h",
    label: "MOD: H-BEWEGUNG",
    icon: "⚡↔️",
    isModifier: true,
    args: { w: 30, h: 30 },
  },
  {
    type: "modifier_moving_platform_v",
    label: "MOD: V-BEWEGUNG",
    icon: "⚡↕️",
    isModifier: true,
    args: { w: 30, h: 30 },
  },
  {
    type: "modifier_ice",
    label: "MOD: EIS",
    icon: "⚡🧊",
    isModifier: true,
    args: { w: 30, h: 30 },
  },
  {
    type: "modifier_slime",
    label: "MOD: SCHLEIM",
    icon: "⚡🟩",
    isModifier: true,
    args: { w: 30, h: 30 },
  },
  {
    type: "modifier_fragile",
    label: "MOD: BRÖCKELN",
    icon: "⚡🪨",
    isModifier: true,
    args: { w: 30, h: 30 },
  },
];

const getBbItemTranslation = (label: string, lang: Language): string => {
  if (lang === Language.EN) {
    switch (label) {
      case "WAND":
        return "WALL";
      case "WAND (KLEIN)":
        return "WALL (SMALL)";
      case "WAND (LANG)":
        return "WALL (LONG)";
      case "WAND (GROSS)":
        return "WALL (LARGE)";
      case "STACHELN":
        return "SPIKES";
      case "STACHELN (KLEIN)":
        return "SPIKES (SMALL)";
      case "STACHELN (LANG)":
        return "SPIKES (LONG)";
      case "EISBLOCK":
        return "ICE BLOCK";
      case "EISBLOCK (KLEIN)":
        return "ICE BLOCK (SMALL)";
      case "SCHLEIM":
        return "SLIME";
      case "SCHLEIM (KLEIN)":
        return "SLIME (SMALL)";
      case "TRAMPOLIN":
        return "TRAMPOLINE";
      case "BRÖCKEL":
        return "FRAGILE";
      case "LIFT (H)":
        return "ELEVATOR (H)";
      case "LIFT (V)":
        return "ELEVATOR (V)";
      case "GRAV (UMKEHR)":
        return "GRAVITY (REVERSE)";
      case "GRAV (SCHWERELOS)":
        return "GRAVITY (LOW)";
      case "TELEPORTER":
        return "TELEPORTER";
      case "DOPPELSPRUNG":
        return "DOUBLE JUMP";
      case "DASH":
        return "DASH";
      case "VENTILATOR":
        return "FAN";
      case "ROTOR ROTIEREND":
        return "ROTATING ROTOR";
      case "BOMBE":
        return "BOMB";
      case "KLEBER":
        return "GLUE";
      case "MÜNZE":
        return "COIN";
      case "MOD: H-BEWEGUNG":
        return "MOD: H-MOTION";
      case "MOD: V-BEWEGUNG":
        return "MOD: V-MOTION";
      case "MOD: EIS":
        return "MOD: ICE";
      case "MOD: SCHLEIM":
        return "MOD: SLIME";
      case "MOD: BRÖCKELN":
        return "MOD: FRAGILE";
      default:
        return label;
    }
  } else if (lang === Language.ES) {
    switch (label) {
      case "WAND":
        return "PARED";
      case "WAND (KLEIN)":
        return "PARED (PEQ)";
      case "WAND (LANG)":
        return "PARED (LARGA)";
      case "WAND (GROSS)":
        return "PARED (GRANDE)";
      case "STACHELN":
        return "PINCHOS";
      case "STACHELN (KLEIN)":
        return "PINCHOS (PEQ)";
      case "STACHELN (LANG)":
        return "PINCHOS (LARGOS)";
      case "EISBLOCK":
        return "BLOQUE DE HIELO";
      case "EISBLOCK (KLEIN)":
        return "HIELO (PEQUEÑO)";
      case "SCHLEIM":
        return "BABA";
      case "SCHLEIM (KLEIN)":
        return "BABA (PEQUEÑA)";
      case "TRAMPOLIN":
        return "TRAMPOLÍN";
      case "BRÖCKEL":
        return "FRÁGIL";
      case "LIFT (H)":
        return "ASCENSOR (H)";
      case "LIFT (V)":
        return "ASCENSOR (V)";
      case "GRAV (UMKEHR)":
        return "GRAVEDAD (INV)";
      case "GRAV (SCHWERELOS)":
        return "SIN GRAVEDAD";
      case "TELEPORTER":
        return "TELEPORTADOR";
      case "DOPPELSPRUNG":
        return "DOBLE SALTO";
      case "DASH":
        return "DASH";
      case "VENTILATOR":
        return "VENTILADOR";
      case "ROTOR ROTIEREND":
        return "ROTOR ROTATORIO";
      case "BOMBE":
        return "BOMBA";
      case "KLEBER":
        return "PEGAMENTO";
      case "MÜNZE":
        return "MONEDA";
      case "MOD: H-BEWEGUNG":
        return "MOD: MOVER H";
      case "MOD: V-BEWEGUNG":
        return "MOD: MOVER V";
      case "MOD: EIS":
        return "MOD: HIELO";
      case "MOD: SCHLEIM":
        return "MOD: BABA";
      case "MOD: BRÖCKELN":
        return "MOD: FRÁGIL";
      default:
        return label;
    }
  }
  return label;
};

const get8UniqueBuildBattleItems = (allowedItems?: Record<string, boolean>) => {
  const filtered = BUILD_BATTLE_POSSIBLE_ITEMS.filter((item) => {
    if (allowedItems) {
      return allowedItems[item.label] !== false;
    }
    return true;
  });

  const pool = filtered.length >= 8 ? filtered : BUILD_BATTLE_POSSIBLE_ITEMS;
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 8).map((item, i) => ({
    id: `item_${Date.now()}_${i}_${Math.floor(Math.random() * 10000)}`,
    ...item,
  }));
};
import { ComicIntro } from "./components/ComicIntro";

import SettingsMenu from "./components/ui/panels/SettingsMenu";
import ShopView from "./components/ui/panels/ShopView";
import AchievementsView from "./components/ui/panels/AchievementsView";
import CharacterPreview from "./components/CharacterPreview";

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
  continuousRotation: false,
};

const FPS_OPTIONS = [30, 60, 120, 144, 165, 240, 0]; // 0 = Unlimited
const UI_SCALE_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5];
const RESOLUTION_OPTIONS = [720, 1080, 1440, 2160];

const createGDLevel = (spec: {
  id: string;
  name: string;
  length: number;
  gaps?: [number, number][];
  ceilings?: [number, number][];
  hazards?: number[];
  upsideDownHazards?: number[];
  trampolines?: number[];
  gravityBlocks?: { x: number; y: number }[];
  coins?: { x: number; y: number }[];
  platforms?: { x: number; y: number; w: number; h?: number; type?: string }[];
  floorSegments?: { start: number; end: number; type: string }[];
  additionalEntities?: any[];
  goalY?: number;
  goalX?: number;
}): LevelData => {
  const entities: any[] = [];

  // 1. Generate core floor blocks (w: 30, h: 30) from 0 to length at y = 480
  const gapList = spec.gaps || [];
  for (let x = 0; x < spec.length; x += 30) {
    const inGap = gapList.some(([start, end]) => x >= start && x < end);
    if (!inGap) {
      let floorType = "wall";
      if (spec.floorSegments) {
        const segment = spec.floorSegments.find(
          (s) => x >= s.start && x < s.end,
        );
        if (segment) floorType = segment.type;
      }
      entities.push({ x, y: 480, w: 30, h: 30, type: floorType });
    }
  }

  // 2. Generate ceilings (w: 30, h: 30 at y = 150)
  const ceilingList = spec.ceilings || [];
  ceilingList.forEach(([start, end]) => {
    for (let x = start; x < end; x += 30) {
      entities.push({ x, y: 150, w: 30, h: 30, type: "wall" });
    }
  });

  // 3. Generate floor hazards (spikes) at y = 450
  if (spec.hazards) {
    spec.hazards.forEach((x) => {
      entities.push({ x, y: 450, w: 30, h: 30, type: "hazard" });
    });
  }

  // 4. Generate ceiling hazards at y = 180 (directly under y=150 ceiling)
  if (spec.upsideDownHazards) {
    spec.upsideDownHazards.forEach((x) => {
      entities.push({ x, y: 180, w: 30, h: 30, type: "hazard" });
    });
  }

  // 5. Generate floor trampolines at y = 450
  if (spec.trampolines) {
    spec.trampolines.forEach((x) => {
      entities.push({ x, y: 450, w: 30, h: 30, type: "trampoline" });
    });
  }

  // 6. Generate gravity block triggers
  if (spec.gravityBlocks) {
    spec.gravityBlocks.forEach(({ x, y }) => {
      entities.push({ x, y, w: 30, h: 30, type: "block_gravity" });
    });
  }

  // 7. Generate coins (type "coin", auto-assigned dynamic ID)
  if (spec.coins) {
    spec.coins.forEach(({ x, y }, index) => {
      entities.push({
        x,
        y,
        w: 20,
        h: 20,
        type: "coin",
        id: `${spec.id}_coin_${index + 1}`,
      });
    });
  }

  // 8. Generate floating platforms
  if (spec.platforms) {
    spec.platforms.forEach((p) => {
      entities.push({
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h || 30,
        type: p.type || "wall",
      });
    });
  }

  // 9. Add any extra custom entities
  if (spec.additionalEntities) {
    spec.additionalEntities.forEach((ent) => {
      entities.push(ent);
    });
  }

  // 10. Generate final Goal automatically
  entities.push({
    x: spec.goalX !== undefined ? spec.goalX : spec.length - 200,
    y: spec.goalY !== undefined ? spec.goalY : 420,
    w: 30,
    h: 60,
    type: "goal",
  });

  return {
    id: spec.id,
    name: spec.name,
    start: { x: 50, y: 420 },
    allowedAbility: "none",
    isCustom: true,
    isBrawler: false,
    isVerified: true,
    entities,
  };
};

const GD_LEVEL_1_STEREO_MADNESS = createGDLevel({
  id: "gd_stereo_madness",
  name: "Stereo Madness",
  length: 4000,
  floorSegments: [{ start: 2000, end: 2600, type: "ice" }],
  hazards: [
    390, 570, 750, 780, 1020, 1170, 1200, 1230, 1560, 1710, 1890, 1920, 2220,
    2400, 2430, 2760, 3060, 3090, 3120,
  ],
  trampolines: [1950],
  platforms: [
    { x: 900, y: 450, w: 30, type: "wall" },
    { x: 930, y: 420, w: 30, type: "wall" },
    { x: 960, y: 390, w: 30, type: "wall" },
    { x: 1350, y: 450, w: 30, type: "slime" },
    { x: 1380, y: 420, w: 30, type: "slime" },
    { x: 1410, y: 450, w: 30, type: "slime" },
    { x: 1600, y: 390, w: 90, type: "ice" },
    { x: 2100, y: 390, w: 90, type: "ice" },
    { x: 2040, y: 360, w: 60, type: "wall" },
    { x: 2700, y: 360, w: 120, type: "wall" },
  ],
  additionalEntities: [
    { x: 1630, y: 360, w: 30, h: 30, type: "hazard" },
    { x: 2130, y: 360, w: 30, h: 30, type: "hazard" },
  ],
  coins: [
    { x: 975, y: 340 },
    { x: 1400, y: 380 },
    { x: 1635, y: 290 },
    { x: 2135, y: 290 },
    { x: 2750, y: 300 },
  ],
});

const GD_LEVEL_2_BACK_ON_TRACK = createGDLevel({
  id: "gd_back_on_track",
  name: "Back On Track",
  length: 4000,
  floorSegments: [{ start: 500, end: 1000, type: "slime" }],
  hazards: [450, 900, 1500, 1530, 2100, 2500, 2900, 3100, 3130],
  trampolines: [1800],
  platforms: [
    { x: 1100, y: 450, w: 30, type: "ice" },
    { x: 1130, y: 420, w: 30, type: "ice" },
    { x: 1160, y: 390, w: 120, type: "ice" },
    { x: 1500, y: 390, w: 90, type: "wall" },
    { x: 2300, y: 420, w: 120, type: "slime" },
    { x: 2800, y: 360, w: 90, type: "wall" },
  ],
  additionalEntities: [{ x: 1950, y: 250, w: 150, h: 30, type: "wall" }],
  coins: [
    { x: 700, y: 380 },
    { x: 1220, y: 330 },
    { x: 1500, y: 380 },
    { x: 2025, y: 200 },
    { x: 3115, y: 350 },
  ],
});

const GD_LEVEL_3_POLARGEIST = createGDLevel({
  id: "gd_polargeist",
  name: "Polargeist",
  length: 4200,
  gaps: [
    [1000, 1060],
    [2000, 2090],
  ],
  floorSegments: [{ start: 2500, end: 3200, type: "ice" }],
  hazards: [500, 1500, 2500, 2530, 3000, 3300, 3330],
  platforms: [
    { x: 700, y: 450, w: 30, type: "wall" },
    { x: 730, y: 420, w: 30, type: "wall" },
    { x: 760, y: 390, w: 90, type: "wall" },
    { x: 1600, y: 420, w: 60, type: "ice" },
    { x: 1800, y: 390, w: 60, type: "ice" },
    { x: 2650, y: 450, w: 30, type: "slime" },
    { x: 2680, y: 420, w: 30, type: "slime" },
    { x: 2710, y: 390, w: 120, type: "slime" },
  ],
  coins: [
    { x: 790, y: 330 },
    { x: 1500, y: 380 },
    { x: 2045, y: 350 },
    { x: 2750, y: 330 },
    { x: 3315, y: 350 },
  ],
});

const GD_LEVEL_4_DRY_OUT = createGDLevel({
  id: "gd_dry_out",
  name: "Dry Out",
  length: 4400,
  ceilings: [[1400, 2600]],
  gravityBlocks: [
    { x: 1450, y: 420 },
    { x: 2500, y: 210 },
  ],
  hazards: [500, 800, 830, 1200, 2800, 3200, 3600],
  upsideDownHazards: [1700, 2100, 2130, 2300],
  platforms: [
    { x: 1000, y: 450, w: 120, type: "wall" },
    { x: 1350, y: 450, w: 30, type: "wall" },
    { x: 1700, y: 390, w: 90, type: "ice" },
    { x: 2900, y: 420, w: 90, type: "slime" },
  ],
  floorSegments: [{ start: 3000, end: 3600, type: "slime" }],
  coins: [
    { x: 500, y: 380 },
    { x: 815, y: 350 },
    { x: 1600, y: 250 },
    { x: 2115, y: 250 },
    { x: 3615, y: 380 },
  ],
});

const GD_LEVEL_5_BASE_AFTER_BASE = createGDLevel({
  id: "gd_base_after_base",
  name: "Base After Base",
  length: 4600,
  gaps: [
    [1000, 1060],
    [1800, 1890],
    [3000, 3090],
  ],
  floorSegments: [{ start: 0, end: 1000, type: "ice" }],
  hazards: [400, 600, 700, 1200, 1230, 2200, 2500, 2530, 2560, 3500, 3800],
  trampolines: [1350, 2300],
  additionalEntities: [
    { x: 1500, y: 250, w: 120, h: 30, type: "wall" },
    { x: 2450, y: 250, w: 120, h: 30, type: "wall" },
  ],
  platforms: [
    { x: 850, y: 450, w: 120, type: "wall" },
    { x: 1200, y: 450, w: 90, type: "slime" },
    { x: 1600, y: 390, w: 90, type: "ice" },
    { x: 2200, y: 420, w: 120, type: "wall" },
  ],
  coins: [
    { x: 500, y: 380 },
    { x: 1215, y: 350 },
    { x: 2100, y: 380 },
    { x: 2530, y: 350 },
    { x: 3045, y: 350 },
  ],
});

const GD_LEVEL_6_CANT_LET_GO = createGDLevel({
  id: "gd_cant_let_go",
  name: "Can't Let Go",
  length: 4800,
  ceilings: [
    [900, 2100],
    [2800, 3800],
  ],
  gravityBlocks: [
    { x: 950, y: 420 },
    { x: 2000, y: 210 },
    { x: 2850, y: 420 },
    { x: 3700, y: 210 },
  ],
  gaps: [
    [1300, 1360],
    [1700, 1760],
    [3100, 3190],
    [3400, 3460],
  ],
  floorSegments: [{ start: 2200, end: 2800, type: "slime" }],
  hazards: [400, 600, 2300, 4000, 4200],
  upsideDownHazards: [1100, 1400, 1600, 1900, 3000, 3300, 3600],
  platforms: [
    { x: 1100, y: 420, w: 90, type: "wall" },
    { x: 1800, y: 390, w: 90, type: "ice" },
    { x: 2900, y: 450, w: 90, type: "slime" },
  ],
  coins: [
    { x: 700, y: 380 },
    { x: 1415, y: 250 },
    { x: 2515, y: 430 },
    { x: 3315, y: 250 },
    { x: 4100, y: 380 },
  ],
});

const GD_LEVEL_7_JUMPER = createGDLevel({
  id: "gd_jumper",
  name: "Jumper",
  length: 4800,
  gaps: [
    [600, 660],
    [1200, 1260],
    [2500, 2590],
  ],
  floorSegments: [
    { start: 1000, end: 1500, type: "ice" },
    { start: 2000, end: 3000, type: "ice" },
  ],
  hazards: [1500, 1800, 2800, 3200, 3800],
  trampolines: [1000, 1600, 2100, 3000, 3500],
  additionalEntities: [
    { x: 1150, y: 250, w: 120, h: 30, type: "wall" },
    { x: 1750, y: 250, w: 120, h: 30, type: "wall" },
    { x: 2250, y: 250, w: 120, h: 30, type: "wall" },
    { x: 3150, y: 250, w: 120, h: 30, type: "wall" },
    { x: 3650, y: 250, w: 120, h: 30, type: "wall" },
  ],
  platforms: [
    { x: 800, y: 450, w: 120, type: "slime" },
    { x: 1400, y: 390, w: 90, type: "wall" },
    { x: 2000, y: 420, w: 90, type: "ice" },
  ],
  coins: [
    { x: 1230, y: 350 },
    { x: 1750, y: 200 },
    { x: 2250, y: 200 },
    { x: 2500, y: 350 },
    { x: 3215, y: 350 },
  ],
});

const GD_LEVEL_8_TIME_MACHINE = createGDLevel({
  id: "gd_time_machine",

  name: "Time Machine",
  length: 6000,
  ceilings: [
    [1000, 2000],
    [3200, 4800],
  ],
  floorSegments: [
    { start: 2000, end: 3200, type: "slime" },
    { start: 3500, end: 4500, type: "ice" },
  ],
  gaps: [
    [1500, 1560],
    [2800, 2860],
    [3800, 3950],
  ],
  hazards: [
    400, 600, 1000, 1030, 2050, 2300, 2600, 3100, 4100, 4500, 5000, 5030, 5060,
  ],
  upsideDownHazards: [1200, 1300, 3400, 3430, 3460, 4200, 4230],
  additionalEntities: [
    { x: 1200, y: 350, w: 90, h: 30, type: "walkthrough_wall" },
    { x: 2500, y: 380, w: 60, h: 30, type: "ghost_hazard" },
    { x: 4000, y: 390, w: 30, h: 30, type: "powerup_double_jump" },
    { x: 4400, y: 150, w: 90, h: 30, type: "walkthrough_wall" },
  ],
  platforms: [
    { x: 800, y: 400, w: 60, type: "wall" },
    { x: 1800, y: 390, w: 90, type: "ice" },
    { x: 2300, y: 350, w: 60, type: "walkthrough_wall" },
    { x: 2600, y: 250, w: 120, type: "slime" },
    { x: 4200, y: 300, w: 90, type: "wall" },
    { x: 5200, y: 350, w: 150, type: "ice" },
  ],
  trampolines: [900, 1400, 2510],
  coins: [
    { x: 815, y: 350 },
    { x: 1445, y: 250 },
    { x: 2650, y: 200 },
    { x: 4230, y: 250 },
    { x: 5310, y: 300 },
  ],
});

const GD_LEVEL_9_CYCLES = createGDLevel({
  id: "gd_cycles",
  name: "Cycles",
  length: 5000,
  ceilings: [
    [900, 1500],
    [1800, 2400],
    [3500, 4200],
  ],
  gravityBlocks: [
    { x: 950, y: 420 },
    { x: 1400, y: 210 },
    { x: 1850, y: 420 },
    { x: 2300, y: 210 },
    { x: 3600, y: 420 },
    { x: 4100, y: 210 },
  ],
  floorSegments: [
    { start: 1200, end: 1800, type: "slime" },
    { start: 3000, end: 4000, type: "ice" },
  ],
  gaps: [
    [800, 890],
    [1500, 1560],
    [2400, 2510],
    [3400, 3520],
  ],
  hazards: [
    400, 600, 1100, 1300, 2000, 2200, 2700, 2730, 2760, 3100, 3300, 4560,
  ],
  upsideDownHazards: [1050, 1250, 1950, 2150, 3750, 3950],
  platforms: [
    { x: 700, y: 390, w: 90, type: "wall" },
    { x: 1000, y: 300, w: 60, type: "walkthrough_wall" },
    { x: 1650, y: 350, w: 90, type: "slime" },
    { x: 2600, y: 380, w: 120, type: "wall" },
    { x: 2850, y: 320, w: 90, type: "ice" },
    { x: 3200, y: 350, w: 90, type: "wall" },
    { x: 4300, y: 390, w: 120, type: "wall" },
    { x: 4500, y: 330, w: 90, type: "walkthrough_wall" },
  ],
  additionalEntities: [
    { x: 1100, y: 350, w: 30, h: 30, type: "powerup_double_jump" },
    { x: 2100, y: 390, w: 60, h: 30, type: "ghost_hazard" },
    { x: 3100, y: 350, w: 30, h: 30, type: "powerup_double_jump" },
    { x: 4600, y: 400, w: 30, h: 30, type: "fake_goal" },
  ],
  trampolines: [1680, 2650, 3230, 4345],
  coins: [
    { x: 730, y: 320 },
    { x: 1200, y: 250 },
    { x: 2650, y: 300 },
    { x: 3850, y: 250 },
    { x: 4400, y: 300 },
  ],
});

const GD_LEVEL_10_CLUBSTEP = createGDLevel({
  id: "gd_clubstep",
  name: "Clubstep",
  length: 5500,
  ceilings: [
    [1400, 2800],
    [3600, 4800],
  ],
  gravityBlocks: [
    { x: 1450, y: 420 },
    { x: 2700, y: 210 },
    { x: 3650, y: 420 },
    { x: 4700, y: 210 },
  ],
  gaps: [
    [500, 550],
    [900, 950],
  ],
  floorSegments: [
    { start: 0, end: 1400, type: "wall" },
    { start: 2800, end: 3600, type: "wall" },
  ],
  hazards: [400, 1080, 3100, 3400, 5000, 5300],
  upsideDownHazards: [1600, 1800, 2200, 2400, 3800, 4000, 4400],
  trampolines: [300, 1200, 3200],
  additionalEntities: [
    { x: 450, y: 250, w: 120, h: 30, type: "wall" },
    { x: 1350, y: 250, w: 120, h: 30, type: "wall" },
    { x: 3350, y: 250, w: 120, h: 30, type: "wall" },
  ],
  platforms: [
    { x: 600, y: 420, w: 90, type: "wall" },
    { x: 1200, y: 390, w: 90, type: "wall" },
    { x: 2000, y: 450, w: 120, type: "wall" },
    { x: 3500, y: 420, w: 90, type: "wall" },
  ],
  coins: [
    { x: 1080, y: 350 },
    { x: 1830, y: 250 },
    { x: 3000, y: 380 },
    { x: 4030, y: 250 },
    { x: 4900, y: 380 },
  ],
});

const GD_LEVELS: LevelData[] = [
  GD_LEVEL_1_STEREO_MADNESS,
  GD_LEVEL_2_BACK_ON_TRACK,
  GD_LEVEL_3_POLARGEIST,
  GD_LEVEL_4_DRY_OUT,
  GD_LEVEL_5_BASE_AFTER_BASE,
  GD_LEVEL_6_CANT_LET_GO,
  GD_LEVEL_7_JUMPER,
  GD_LEVEL_8_TIME_MACHINE,
  GD_LEVEL_9_CYCLES,
  GD_LEVEL_10_CLUBSTEP,
];

const BRAWLER_CLASS_OPTIONS = [
  "standard",
  "fighter",
  "dasher",
  "jumper",
  "tank",
  "ninja",
  "heavy",
  "vampire",
] as const;

const BRAWLER_DESCS: Record<string, { pos: string; neg: string }> = {
  fighter: { pos: "+ Starke Gesamt-Stats", neg: "- Viel längerer Dash CD" },
  dasher: { pos: "+ Sehr kurzer Dash CD", neg: "- Weniger Leben" },
  jumper: { pos: "+ Echter Triple Jump", neg: "- Weniger Leben" },
  tank: { pos: "+ Mehr Leben & Resistenz", neg: "- Sehr langsam" },
  ninja: { pos: "+ Sehr schnell & hoch", neg: "- Sehr wenig Leben" },
  heavy: { pos: "+ Gewaltiger Knockback", neg: "- Langsam & Massiv" },
  vampire: { pos: "+ Heilt bei Kill", neg: "- Extrem wenig Leben" },
};

const BRAWLER_STATS: Record<
  string,
  { hp: number; speed: number; jump: number }
> = {
  standard: { hp: 10, speed: 10, jump: 10 },
  fighter: { hp: 12, speed: 11, jump: 7 },
  dasher: { hp: 8, speed: 12, jump: 10 },
  jumper: { hp: 8, speed: 10, jump: 12 },
  tank: { hp: 15, speed: 7, jump: 8 },
  ninja: { hp: 7, speed: 11.5, jump: 11.5 },
  heavy: { hp: 13, speed: 8, jump: 9 },
  vampire: { hp: 6, speed: 12, jump: 12 },
};

const PINGS = ["Ggwp!", "Oops!", "Help!", "Haha!", "Team?", "Wait!"];

const StatBar = ({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) => (
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

const SHOP_ITEMS = [
  // Death Animations (10 total)
  { id: "normal", type: "deathAnim", name: "None", price: 0 }, // 1
  { id: "blood", type: "deathAnim", name: "Blood Pop", price: 250 }, // 2
  { id: "confetti", type: "deathAnim", name: "Confetti Party", price: 350 }, // 3
  { id: "firework", type: "deathAnim", name: "Glow Burst", price: 450 }, // 4
  { id: "dust", type: "deathAnim", name: "Poof Cloud", price: 250 }, // 5
  { id: "electric", type: "deathAnim", name: "Volt Burst", price: 500 }, // 6
  { id: "ghost", type: "deathAnim", name: "Soul Release", price: 550 }, // 7
  { id: "freeze", type: "deathAnim", name: "Ice Shatter", price: 600 }, // 8
  { id: "blackhole", type: "deathAnim", name: "Void Collapse", price: 750 }, // 9
  { id: "bubble", type: "deathAnim", name: "Bubble Pop", price: 400 }, // 10

  // Trail Types (10 total)
  { id: "normal", type: "trailType", name: "Standard (Free)", price: 0 }, // 1
  { id: "pixel-fire", type: "trailType", name: "Flame Trail", price: 300 }, // 2
  { id: "stardust", type: "trailType", name: "Galaxy Dust", price: 400 }, // 3
  { id: "slime", type: "trailType", name: "Ooze Trail", price: 350 }, // 4
  { id: "rainbow-pulse", type: "trailType", name: "RGB Flow", price: 600 }, // 5
  { id: "ghostly", type: "trailType", name: "Phantom Vapor", price: 500 }, // 6
  { id: "bubble-trail", type: "trailType", name: "Deep Sea", price: 450 }, // 7
  { id: "spark-trail", type: "trailType", name: "Electric Spark", price: 550 }, // 8
  { id: "shadow-trail", type: "trailType", name: "Dark Void", price: 700 }, // 9
  { id: "neon-trail", type: "trailType", name: "Cyber Neon", price: 750 }, // 10
  { id: "matrix_trail", type: "trailType", name: "Matrix Code", price: 99999 },

  // Death Sounds (10 total)
  { id: "default", type: "deathSound", name: "Standard (Free)", price: 0 },
  { id: "fart", type: "deathSound", name: "Fart", price: 100 },
  { id: "explosion", type: "deathSound", name: "Explosion", price: 150 },
  {
    id: "whistle_down",
    type: "deathSound",
    name: "Falling Whistle",
    price: 200,
  },
  { id: "power_down", type: "deathSound", name: "Power Down", price: 250 },
  { id: "glass", type: "deathSound", name: "Shatter", price: 300 },
  { id: "splat", type: "deathSound", name: "Splat", price: 250 },
  { id: "crunch", type: "deathSound", name: "Crunch", price: 200 },
  { id: "glitch", type: "deathSound", name: "Glitch Out", price: 350 },
  { id: "sad_trombone", type: "deathSound", name: "Sad Trombone", price: 400 },
  { id: "boing_die", type: "deathSound", name: "Boing", price: 150 },

  // Eyes (Prices 50-250)
  { id: "normal", type: "eyes", name: "Default", price: 0 },
  { id: "angry", type: "eyes", name: "Angry Eyes", price: 50 },
  { id: "cyclops", type: "eyes", name: "Cyclops", price: 100 },
  { id: "derp", type: "eyes", name: "Derp Eyes", price: 50 },
  { id: "anime", type: "eyes", name: "Anime Eyes", price: 150 },
  { id: "dead", type: "eyes", name: "Dead Eyes", price: 100 },
  { id: "sunglasses", type: "eyes", name: "Cool Shades", price: 200 },
  { id: "pirate", type: "eyes", name: "Pirate Patch", price: 200 },
  { id: "rich", type: "eyes", name: "Money Eyes", price: 250 },
  { id: "glowing", type: "eyes", name: "Neon Glow", price: 180 },
  { id: "ninja", type: "eyes", name: "Ninja Mask", price: 220 },
  { id: "tired", type: "eyes", name: "Tired Eyes", price: 80 },
  { id: "laser", type: "eyes", name: "Laser Beam", price: 250 },
  { id: "kawaii", type: "eyes", name: "Kawaii", price: 150 },
  { id: "monocle", type: "eyes", name: "Gentleman", price: 180 },
  { id: "masked", type: "eyes", name: "Secret Mask", price: 200 },
  { id: "alien", type: "eyes", name: "Alien Eyes", price: 150 },
  { id: "cyborg", type: "eyes", name: "Cyborg Eye", price: 250 },
  { id: "stars", type: "eyes", name: "Star Eyes", price: 120 },
  { id: "hearts", type: "eyes", name: "Heart Eyes", price: 120 },
  { id: "hypno", type: "eyes", name: "Hypno Eyes", price: 250 },
  { id: "googly", type: "eyes", name: "Googly Eyes", price: 60 },
  { id: "void_eyes", type: "eyes", name: "Void Eyes", price: 99999 },
  { id: "evil", type: "eyes", name: "Evil Eyes", price: 666 },

  // Accessories (Prices 50-250)
  { id: "none", type: "accessory", name: "None", price: 0 },
  { id: "crown", type: "accessory", name: "King Crown", price: 250 },
  { id: "horns", type: "accessory", name: "Devil Horns", price: 100 },
  { id: "headband", type: "accessory", name: "Ninja Band", price: 80 },
  { id: "cowboy", type: "accessory", name: "Cowboy Hat", price: 150 },
  { id: "viking", type: "accessory", name: "Viking Helmet", price: 180 },
  { id: "halo", type: "accessory", name: "Angel Halo", price: 250 },
  { id: "headphones", type: "accessory", name: "Beats", price: 120 },
  { id: "tophat", type: "accessory", name: "Top Hat", price: 200 },
  { id: "cap", type: "accessory", name: "Sport Cap", price: 80 },
  { id: "propeller", type: "accessory", name: "Propeller Hat", price: 150 },
  { id: "cat_ears", type: "accessory", name: "Neko Ears", price: 120 },
  { id: "demon_horns", type: "accessory", name: "Greater Horns", price: 220 },
  { id: "builder_hat", type: "accessory", name: "Hard Hat", price: 90 },
  { id: "wizard_hat", type: "accessory", name: "Mage Hat", price: 250 },
  { id: "bunny_ears", type: "accessory", name: "Bunny Ears", price: 120 },
  { id: "pirate_hat", type: "accessory", name: "Captain Hat", price: 150 },
  { id: "party_hat", type: "accessory", name: "Birthday!", price: 70 },
  { id: "sombrero", type: "accessory", name: "Sombrero", price: 130 },
  { id: "ushanka", type: "accessory", name: "Ushanka", price: 110 },
  { id: "fedora", type: "accessory", name: "Fedora", price: 150 },
  { id: "chef", type: "accessory", name: "Chef Hat", price: 90 },
  { id: "police", type: "accessory", name: "Police Cap", price: 140 },
  { id: "pumpkin", type: "accessory", name: "Pumpkin Head", price: 250 },
  { id: "secret_crown", type: "accessory", name: "Hacker Crown", price: 99999 },
  { id: "rainbow_horn", type: "accessory", name: "Rainbow Horn", price: 99999 },
  { id: "ghost_sheet", type: "accessory", name: "Ghost Sheet", price: 99999 },
  { id: "coffee_cup", type: "accessory", name: "Coffee Cup", price: 99999 },
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
                  {cat.levels.map((lvl, idx) => {
                    const isSelected = selectedLevels.some(
                      (s) => s.id === lvl.id,
                    );
                    const selectIndex = selectedLevels.findIndex(
                      (s) => s.id === lvl.id,
                    );

                    return (
                      <div
                        key={`${lvl.id || ""}_${idx}`}
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

// Helper to handle colors
const GLOBAL_LEVEL_TIME_LIMIT = 300; // 5 minutes per level before forced end

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
              key={`${m.id || ""}_${i}`}
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
    className = "",
  }: any) => (
    <button
      onMouseEnter={() => onHover(index)}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${className.includes("w-") ? "" : "w-full"} py-3 px-4 font-arcade text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] transition-all transform-gpu will-change-transform box-border
        relative overflow-hidden flex items-center justify-center text-center ${className}
        ${danger ? "bg-red-950 text-red-500 border-2" : "lava-btn-bg border-2"}
        ${
          disabled
            ? "opacity-40 cursor-not-allowed grayscale"
            : isSelected
              ? danger
                ? "border-red-400 scale-105 z-20 brightness-150 shadow-[0_0_20px_#ff000044]"
                : "lava-border-active scale-105 z-20 brightness-125 shadow-[0_0_20px_#ea710844]"
              : danger
                ? "border-red-800 hover:brightness-110"
                : "lava-border hover:brightness-110"
        }
      `}
    >
      {/* Lava glow effect inside */}
      {!danger && (
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 to-transparent pointer-events-none"></div>
      )}

      {/* Selected electric dots */}
      {isSelected && (
        <>
          <div
            className={`absolute left-1 top-1 w-1.5 h-1.5 ${danger ? "bg-red-400" : "bg-white"} shadow-[0_0_10px_#fff]`}
          ></div>
          <div
            className={`absolute right-1 top-1 w-1.5 h-1.5 ${danger ? "bg-red-400" : "bg-white"} shadow-[0_0_10px_#fff]`}
          ></div>
          <div
            className={`absolute left-1 bottom-1 w-1.5 h-1.5 ${danger ? "bg-red-400" : "bg-white"} shadow-[0_0_10px_#fff]`}
          ></div>
          <div
            className={`absolute right-1 bottom-1 w-1.5 h-1.5 ${danger ? "bg-red-400" : "bg-white"} shadow-[0_0_10px_#fff]`}
          ></div>
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

const ItemPreview = ({
  item,
  customization,
}: {
  item: any;
  customization: PlayerCustomization;
}) => {
  const previewCustom = {
    ...customization,
    [item.type]: item.id,
  };

  return (
    <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden flex items-center justify-center p-0 shadow-inner group-hover:border-neutral-600 transition-colors">
      <div className="w-16 h-16">
        <CharacterPreview customization={previewCustom} scale={3} />
      </div>
    </div>
  );
};

const getGlueSnappedPosition = (
  px: number,
  py: number,
  w: number,
  h: number,
  allBlocks: any[],
) => {
  const solidBlocks = allBlocks.filter(
    (b) =>
      b.type === "wall" ||
      b.type === "ice" ||
      b.type === "slime" ||
      b.type === "trampoline" ||
      b.type === "fragile" ||
      b.type.startsWith("moving_platform_") ||
      b.type === "fan" ||
      b.type === "orbit" ||
      b.type === "glue",
  );

  let bestBlock: any = null;
  let minDistance = 999999;

  for (const b of solidBlocks) {
    const bw = b.w || 30;
    const bh = b.h || 30;

    // Calculate edge-to-edge distance between the cursor (px, py, w, h) and block (b.x, b.y, bw, bh)
    const dx = Math.max(0, Math.max(px, b.x) - Math.min(px + w, b.x + bw));
    const dy = Math.max(0, Math.max(py, b.y) - Math.min(py + h, b.y + bh));
    const dist = Math.hypot(dx, dy);

    // Dynamic snapping range up to 60px (allows snapping from 2 grid spaces away easily)
    if (dist < minDistance && dist <= 60) {
      minDistance = dist;
      bestBlock = b;
    }
  }

  if (bestBlock) {
    const bw = bestBlock.w || 30;
    const bh = bestBlock.h || 30;
    let finalX = px;
    let finalY = py;

    if (w > h) {
      // Horizontal glue: snap to top or bottom edge of block
      const cursorCenterY = py + h / 2;
      const blockCenterY = bestBlock.y + bh / 2;
      const snapToTop = cursorCenterY < blockCenterY;
      
      finalY = snapToTop ? bestBlock.y - h : bestBlock.y + bh;
      
      // Align X relative to the block starting coordinate in increments of 30px
      const relX = px - bestBlock.x;
      const steps = Math.round(relX / 30);
      finalX = bestBlock.x + steps * 30;
      
      // Keep within the bounds of the block
      finalX = Math.max(bestBlock.x - w + 30, Math.min(finalX, bestBlock.x + bw - 30));
    } else {
      // Vertical glue: snap to left or right edge of block
      const cursorCenterX = px + w / 2;
      const blockCenterX = bestBlock.x + bw / 2;
      const snapToLeft = cursorCenterX < blockCenterX;
      
      finalX = snapToLeft ? bestBlock.x - w : bestBlock.x + bw;
      
      // Align Y relative to the block starting coordinate in increments of 30px
      const relY = py - bestBlock.y;
      const steps = Math.round(relY / 30);
      finalY = bestBlock.y + steps * 30;
      
      // Keep within the bounds of the block
      finalY = Math.max(bestBlock.y - h + 30, Math.min(finalY, bestBlock.y + bh - 30));
    }

    return { finalX, finalY, success: true };
  }

  return { finalX: px, finalY: py, success: false };
};

const getBlockSnappedToGluePosition = (
  px: number,
  py: number,
  w: number,
  h: number,
  allBlocks: any[],
) => {
  const glueBlocks = allBlocks.filter((b) => b.type === "glue");
  let bestGlue: any = null;
  let minDistance = 999999;

  for (const b of glueBlocks) {
    const bw = b.w || 30;
    const bh = b.h || 30;

    // Calculate edge-to-edge distance between the cursor (px, py, w, h) and glue block (b.x, b.y, bw, bh)
    const dx = Math.max(0, Math.max(px, b.x) - Math.min(px + w, b.x + bw));
    const dy = Math.max(0, Math.max(py, b.y) - Math.min(py + h, b.y + bh));
    const dist = Math.hypot(dx, dy);

    // Snapping range up to 60px
    if (dist < minDistance && dist <= 60) {
      minDistance = dist;
      bestGlue = b;
    }
  }

  if (bestGlue) {
    const bw = bestGlue.w || 30;
    const bh = bestGlue.h || 30;
    let finalX = px;
    let finalY = py;

    if (bw > bh) {
      // Horizontal glue: snap above or below it
      const cursorCenterY = py + h / 2;
      const blockCenterY = bestGlue.y + bh / 2;
      const snapToTop = cursorCenterY < blockCenterY;
      
      finalY = snapToTop ? bestGlue.y - h : bestGlue.y + bh;
      
      // Align X to the closest 30px step relative to the glue
      const relX = px - bestGlue.x;
      const steps = Math.round(relX / 30);
      finalX = bestGlue.x + steps * 30;
    } else {
      // Vertical glue: snap left or right of it
      const cursorCenterX = px + w / 2;
      const blockCenterX = bestGlue.x + bw / 2;
      const snapToLeft = cursorCenterX < blockCenterX;
      
      finalX = snapToLeft ? bestGlue.x - w : bestGlue.x + bw;
      
      // Align Y to the closest 30px step relative to the glue
      const relY = py - bestGlue.y;
      const steps = Math.round(relY / 30);
      finalY = bestGlue.y + steps * 30;
    }

    return { finalX, finalY, success: true };
  }

  return { finalX: px, finalY: py, success: false };
};

const getBombSnappedPosition = (px: number, py: number, allBlocks: any[]) => {
  const targetBlocks = allBlocks.filter(
    (ent) =>
      ent.type === "wall" ||
      ent.type === "ice" ||
      ent.type === "slime" ||
      ent.type === "hazard" ||
      ent.type === "trampoline" ||
      ent.type === "fragile" ||
      ent.type.startsWith("moving_platform_") ||
      ent.type === "fan" ||
      ent.type === "orbit" ||
      ent.type === "glue",
  );

  // 1. Prioritize blocks where the cursor is directly inside the boundaries
  const insideBlocks = targetBlocks.filter((ent) => {
    const ew = ent.w || 30;
    const eh = ent.h || 30;
    return px >= ent.x && px < ent.x + ew && py >= ent.y && py < ent.y + eh;
  });

  if (insideBlocks.length > 0) {
    let bestInsideBlock: any = null;
    let bestInsideX = px;
    let bestInsideY = py;
    let minDist = 999999;

    for (const ent of insideBlocks) {
      const ew = ent.w || 30;
      const eh = ent.h || 30;

      const numStepsX = Math.max(0, Math.floor((ew - 30) / 30));
      const numStepsY = Math.max(0, Math.floor((eh - 30) / 30));

      const relX = px - ent.x;
      const relY = py - ent.y;

      const stepX = Math.round(relX / 30);
      const clampedStepX = Math.max(0, Math.min(stepX, numStepsX));
      const snapX = ent.x + clampedStepX * 30;

      const stepY = Math.round(relY / 30);
      const clampedStepY = Math.max(0, Math.min(stepY, numStepsY));
      const snapY = ent.y + clampedStepY * 30;

      // Distance to the center of the 30x30 snap slot
      const dx = px - (snapX + 15);
      const dy = py - (snapY + 15);
      const dist = Math.hypot(dx, dy);

      if (dist < minDist) {
        minDist = dist;
        bestInsideBlock = ent;
        bestInsideX = snapX;
        bestInsideY = snapY;
      }
    }

    if (bestInsideBlock) {
      return { snapX: bestInsideX, snapY: bestInsideY, target: bestInsideBlock, found: true };
    }
  }

  // 2. Fall back to edge-snapping on any block if raw coords are not inside any blocks
  let bestBlock: any = null;
  let bestX = px;
  let bestY = py;
  let minDistance = 999999;

  for (const ent of targetBlocks) {
    const ew = ent.w || 30;
    const eh = ent.h || 30;

    const numStepsX = Math.max(0, Math.floor((ew - 30) / 30));
    const numStepsY = Math.max(0, Math.floor((eh - 30) / 30));

    const relX = px - ent.x;
    const relY = py - ent.y;

    const stepX = Math.round(relX / 30);
    const clampedStepX = Math.max(0, Math.min(stepX, numStepsX));
    const snapX = ent.x + clampedStepX * 30;

    const stepY = Math.round(relY / 30);
    const clampedStepY = Math.max(0, Math.min(stepY, numStepsY));
    const snapY = ent.y + clampedStepY * 30;

    // Use center-to-center distance instead of top-left corner distance
    const dx = px - (snapX + 15);
    const dy = py - (snapY + 15);
    const dist = Math.hypot(dx, dy);

    if (dist < minDistance && dist <= 45) {
      minDistance = dist;
      bestBlock = ent;
      bestX = snapX;
      bestY = snapY;
    }
  }

  if (bestBlock) {
    return { snapX: bestX, snapY: bestY, target: bestBlock, found: true };
  }

  return { snapX: px, snapY: py, target: null, found: false };
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
      up: ["KeyW", "Space"],
      down: ["KeyS"],
      left: ["KeyA"],
      right: ["KeyD"],
      action: ["KeyQ"],
      dash: ["KeyF"],
    };
    const defaultKeybindingsP2: Keybindings = {
      up: ["ArrowUp"],
      down: ["ArrowDown"],
      left: ["ArrowLeft"],
      right: ["ArrowRight"],
      action: ["ControlRight", "Numpad0"],
      dash: ["ShiftRight"],
    };

    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.musicVolume !== "number" || isNaN(parsed.musicVolume))
        parsed.musicVolume = 0.3;
      if (typeof parsed.sfxVolume !== "number" || isNaN(parsed.sfxVolume))
        parsed.sfxVolume = 0.5;
      if (typeof parsed.deathVolume !== "number" || isNaN(parsed.deathVolume))
        parsed.deathVolume = 0.5;
      if (typeof parsed.showGhost !== "boolean") parsed.showGhost = true;
      if (typeof parsed.editorEdgeScroll !== "boolean")
        parsed.editorEdgeScroll = true;
      if (
        typeof parsed.editorScrollSpeed !== "number" ||
        isNaN(parsed.editorScrollSpeed)
      )
        parsed.editorScrollSpeed = 350;
      if (typeof parsed.uiScale !== "number" || isNaN(parsed.uiScale))
        parsed.uiScale = 1;
      if (typeof parsed.playerName !== "string") parsed.playerName = "";
      if (
        typeof parsed.opponentOpacity !== "number" ||
        isNaN(parsed.opponentOpacity)
      )
        parsed.opponentOpacity = 0.5;
      if (
        typeof parsed.resolutionScale !== "number" ||
        isNaN(parsed.resolutionScale)
      )
        parsed.resolutionScale = 1080;
      if (!parsed.keybindingsP1) parsed.keybindingsP1 = defaultKeybindingsP1;
      else {
        if (!parsed.keybindingsP1.dash)
          parsed.keybindingsP1.dash = defaultKeybindingsP1.dash;
        // Make sure space is added to jump for P1 if missing
        if (!parsed.keybindingsP1.up.includes("Space"))
          parsed.keybindingsP1.up.push("Space");
        // Strip GP bindings from existing settings
        (Object.keys(parsed.keybindingsP1) as Array<keyof Keybindings>).forEach(
          (key) => {
            parsed.keybindingsP1[key] = parsed.keybindingsP1[key].filter(
              (k: string) => !k.startsWith("GP_"),
            );
          },
        );
      }

      if (!parsed.keybindingsP2) parsed.keybindingsP2 = defaultKeybindingsP2;
      else {
        if (!parsed.keybindingsP2.dash)
          parsed.keybindingsP2.dash = defaultKeybindingsP2.dash;
        // Strip GP bindings from existing settings
        (Object.keys(parsed.keybindingsP2) as Array<keyof Keybindings>).forEach(
          (key) => {
            parsed.keybindingsP2[key] = parsed.keybindingsP2[key].filter(
              (k: string) =>
                !k.startsWith("GP_") && !(key === "up" && k === "Space"),
            );
          },
        );
      }
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
        setCustomization((prev) => ({ ...prev, accessory: "unicorn" }));
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
  }, [
    customization.color,
    isAdminUnlocked,
    isRainbowUnlocked,
    isInvisibleUnlocked,
    isCoffeeUnlocked,
    isMatrixUnlocked,
    isVoidUnlocked,
  ]);

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
  const [gdSelectedLevelIndex, setGdSelectedLevelIndex] = useState(0);
  const [editingKey, setEditingKey] = useState<{
    player: 1 | 2;
    action: keyof Keybindings;
  } | null>(null);

  const [highscoreLevelIndex, setHighscoreLevelIndex] = useState(0);
  const [globalScores, setGlobalScores] = useState<LeaderboardEntry[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<LevelData[]>([]);

  const toggleLevelSelection = (lvl: LevelData) => {
    setSelectedLevels((prev) => {
      if (gameState.onlineMode === "editor") {
        const exists = prev.find((s) => s.id === lvl.id);
        if (exists) {
          return [];
        } else {
          return [lvl];
        }
      }
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
    const allDeathAnims = SHOP_ITEMS.filter((i) => i.type === "deathAnim").map(
      (i) => i.id,
    );
    const allDeathSounds = SHOP_ITEMS.filter(
      (i) => i.type === "deathSound",
    ).map((i) => i.id);
    const allTrails = SHOP_ITEMS.filter((i) => i.type === "trailType").map(
      (i) => i.id,
    );
    const allEyes = SHOP_ITEMS.filter((i) => i.type === "eyes").map(
      (i) => i.id,
    );
    const allAccessories = SHOP_ITEMS.filter((i) => i.type === "accessory").map(
      (i) => i.id,
    );

    setCustomization((p) => ({
      ...p,
      unlockedDeathAnims: Array.from(
        new Set([...(p.unlockedDeathAnims || []), ...allDeathAnims]),
      ),
      unlockedDeathSounds: Array.from(
        new Set([...(p.unlockedDeathSounds || []), ...allDeathSounds]),
      ),
      unlockedTrails: Array.from(
        new Set([...(p.unlockedTrails || []), ...allTrails]),
      ),
      unlockedEyes: Array.from(
        new Set([...(p.unlockedEyes || []), ...allEyes]),
      ),
      unlockedAccessories: Array.from(
        new Set([...(p.unlockedAccessories || []), ...allAccessories]),
      ),
      coins: p.coins + 999999, // Give a massive coin boost
    }));

    // Unlock all achievements
    const allAchievementIds = ACHIEVEMENTS_LIST.map((a) => a.id);
    setGameState((p) => ({
      ...p,
      unlockedAchievements: allAchievementIds,
    }));

    showToast("🔓 ADMIN UNLOCK ACTIVATED!");
    audio.playSfx("goal");
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
  const [brawlerComboPowerups, setBrawlerComboPowerups] =
    useState<boolean>(false);
  const [currentVote, setCurrentVote] = useState<VoteData | null>(null);

  // --- BUILD-BATTLE STATES ---
  const [buildBattlePhase, setBuildBattlePhase] = useState<
    "select" | "build" | "countdown" | "run"
  >("select");
  const [buildBattlePhaseTimer, setBuildBattlePhaseTimer] = useState<number>(0);
  const [buildBattleIntroCountdown, setBuildBattleIntroCountdown] =
    useState<number>(0);
  const [buildBattleSelectTimerConfig, setBuildBattleSelectTimerConfig] =
    useState<number>(15);
  const [buildBattleBuildTimerConfig, setBuildBattleBuildTimerConfig] =
    useState<number>(30);
  const [buildBattleTargetPointsConfig, setBuildBattleTargetPointsConfig] =
    useState<number>(5);
  const [buildBattleAllowedItems, setBuildBattleAllowedItems] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    BUILD_BATTLE_POSSIBLE_ITEMS.forEach((item) => {
      initial[item.label] = true;
    });
    return initial;
  });
  const [buildBattleSettingsOpen, setBuildBattleSettingsOpen] =
    useState<boolean>(false);
  const [buildBattleCustomPresets, setBuildBattleCustomPresets] = useState<
    Array<{
      id: string;
      name: string;
      selectTimer: number;
      buildTimer: number;
      targetPoints: number;
      allowedItems: Record<string, boolean>;
    }>
  >(() => {
    try {
      const saved = localStorage.getItem("build_battle_presets");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [newPresetName, setNewPresetName] = useState<string>("");
  const [buildBattleItems, setBuildBattleItems] = useState<
    { id: string; type: string; args?: any; label: string; icon: string }[]
  >([]);
  const [buildBattleSelection, setBuildBattleSelection] = useState<{
    P1: number;
    P2: number;
  }>({ P1: 0, P2: 1 });
  const [buildBattleConfirmed, setBuildBattleConfirmed] = useState<{
    P1: boolean;
    P2: boolean;
  }>({ P1: false, P2: false });
  const [buildBattleSurrenders, setBuildBattleSurrenders] = useState<
    Record<string, boolean>
  >({});
  const [buildBattleRotation, setBuildBattleRotation] = useState<{
    P1: boolean;
    P2: boolean;
  }>({ P1: false, P2: false });
  const [buildBattleCursors, setBuildBattleCursors] = useState<{
    P1: { x: number; y: number };
    P2: { x: number; y: number };
  }>({ P1: { x: 480, y: 270 }, P2: { x: 480, y: 270 } });

  const [buildTurn, setBuildTurn] = useState<number>(0); // 0 = Player 1, 1 = Player 2 (may be unused now)
  const [selectedBuildItem, setSelectedBuildItem] = useState<string>("wall");
  const [buildBattleScores, setBuildBattleScores] = useState<
    Record<string, number>
  >({ P1: 0, P2: 0 });
  const [lastBuildBattleRoundStats, setLastBuildBattleRoundStats] = useState<{
    winner: string | null;
    p1Coins: number;
    p2Coins: number;
    p1ScoreAdded: number;
    p2ScoreAdded: number;
    p1Kills?: number;
    p2Kills?: number;
  } | null>(null);
  const [buildBattleScoresOnline, setBuildBattleScoresOnline] = useState<
    Record<string, number>
  >({});
  const [buildBattleRound, setBuildBattleRound] = useState<number>(1);
  const [buildBattleVotes, setBuildBattleVotes] = useState<{
    P1: string | null;
    P2: string | null;
  }>({ P1: null, P2: null });
  const [buildBattleVoteSelection, setBuildBattleVoteSelection] = useState<{
    P1: number;
    P2: number;
  }>({ P1: 0, P2: 1 });
  const [buildBattleVoteTimer, setBuildBattleVoteTimer] = useState<
    number | null
  >(null);
  const [buildBattlePlacedEntities, setBuildBattlePlacedEntities] = useState<
    any[]
  >([]);
  const [buildBattlePlacedThisRound, setBuildBattlePlacedThisRound] = useState<
    Record<string, any>
  >({});
  const [buildBattleSelectedMapId, setBuildBattleSelectedMapId] =
    useState<string>("build1");
  const [buildBattleHoverPos, setBuildBattleHoverPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [shopTab, setShopTab] = useState<"effects" | "cosmetics" | "sounds">(
    "effects",
  );
  const [hoveredShopItem, setHoveredShopItem] = useState<any>(null);

  // Check intro status
  const hasSeenIntro = (() => {
    try {
      return localStorage.getItem("ragecube_intro_seen") === "true";
    } catch {
      return false;
    }
  })();

  const [gameState, setGameState] = useState<GameState>({
    status: hasSeenIntro ? "menu" : "intro",
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

  const [assetLoadProgress, setAssetLoadProgress] = useState(0);
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      assetLoader.onProgress((p) => setAssetLoadProgress(p));
      try {
        await Promise.all([assetLoader.loadImage("intro", "/intro.png")]);
        setTimeout(() => setIsAssetsLoaded(true), 800);
      } catch (err) {
        console.error("Asset loading failed", err);
        setIsAssetsLoaded(true);
      }
    };
    loadAssets();
  }, []);

  // --- BUILD-BATTLE EFFECTS ---
  useEffect(() => {
    if (gameState.status !== "build_battle_playing") {
      setBuildBattleIntroCountdown(0);
      return;
    }
    if (buildBattlePhase === "select" || buildBattlePhase === "build") {
      setBuildBattleIntroCountdown(3);
    } else {
      setBuildBattleIntroCountdown(0);
    }
  }, [buildBattlePhase, gameState.status]);

  useEffect(() => {
    if (gameState.status !== "build_battle_playing") return;

    if (
      buildBattlePhase === "select" ||
      buildBattlePhase === "build" ||
      buildBattlePhase === "countdown" ||
      buildBattlePhase === "run"
    ) {
      const interval = setInterval(() => {
        setBuildBattleIntroCountdown((c) => {
          if (c > 0) {
            return c - 1;
          } else {
            setBuildBattlePhaseTimer((p) => {
              if (p <= 0) return 0;
              return p - 1;
            });
            return 0;
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.status, buildBattlePhase]);

  useEffect(() => {
    if (gameState.status !== "build_battle_playing") return;

    if (buildBattlePhaseTimer <= 0) {
      if (buildBattlePhase === "select") {
        setBuildBattlePhase("build");
        setBuildBattlePhaseTimer(buildBattleBuildTimerConfig);
        setBuildBattleConfirmed({ P1: false, P2: false });
        setBuildBattleCursors({
          P1: { x: 480, y: 270 },
          P2: { x: 510, y: 270 },
        });
      } else if (buildBattlePhase === "build") {
        setBuildBattlePhase("countdown");
        setBuildBattlePhaseTimer(3);
        setBuildBattleConfirmed({ P1: false, P2: false });
        // Place the entities
        const newEntities: any[] = [];
        if (buildBattlePlacedThisRound.P1) {
          const ent = buildBattlePlacedThisRound.P1;
          newEntities.push({
            ...ent,
            id:
              ent.id ||
              `bb_P1_${buildBattleRound}_${Date.now()}_${ent.type}_${ent.x}_${ent.y}_${Math.floor(Math.random() * 1000)}`,
          });
        }
        if (buildBattlePlacedThisRound.P2) {
          const ent = buildBattlePlacedThisRound.P2;
          newEntities.push({
            ...ent,
            id:
              ent.id ||
              `bb_P2_${buildBattleRound}_${Date.now()}_${ent.type}_${ent.x}_${ent.y}_${Math.floor(Math.random() * 1000)}`,
          });
        }
        setBuildBattlePlacedEntities((prev) => [...prev, ...newEntities]);
        // Rebuild level dynamically? GameCanvas takes `level`, we can override there
      } else if (buildBattlePhase === "countdown") {
        setBuildBattlePhase("run");
        setBuildBattlePhaseTimer(300); // 5 minutes (300 seconds) max!
        setRespawnTrigger((p) => p + 1);
      } else if (buildBattlePhase === "run") {
        handleWin("ZEIT_ABGELAUFEN");
      }
    }
  }, [
    buildBattlePhaseTimer,
    buildBattlePhase,
    gameState.status,
    buildBattleBuildTimerConfig,
  ]);

  useEffect(() => {
    if (gameState.status === "build_battle_playing") {
      if (
        (buildBattlePhase === "select" || buildBattlePhase === "build") &&
        buildBattleConfirmed.P1 &&
        buildBattleConfirmed.P2
      ) {
        setBuildBattlePhaseTimer(0);
      }
    }
  }, [buildBattleConfirmed, buildBattlePhase, gameState.status]);

  // Build Battle Keyboard Handling
  useEffect(() => {
    if (gameState.status !== "build_battle_playing") return;

    const moveCursor = (player: "P1" | "P2", dx: number, dy: number) => {
      setBuildBattleCursors((prev) => {
        const cur = prev[player];
        let nx = cur.x + dx * 30;
        let ny = cur.y + dy * 30;
        const maxW = level.width ? level.width - 30 : 1470;
        const maxH = level.height ? level.height - 30 : 510;
        nx = Math.max(0, Math.min(nx, maxW));
        ny = Math.max(0, Math.min(ny, maxH));
        return { ...prev, [player]: { x: nx, y: ny } };
      });
    };

    const getNextAvailableIndex = (
      current: number,
      dir: number,
      otherConfirmed: boolean,
      otherSelectionIndex: number,
      total: number,
    ) => {
      let check = current;
      for (let i = 0; i < total; i++) {
        check = (check + dir + total) % total;
        if (!(otherConfirmed && otherSelectionIndex === check)) {
          return check;
        }
      }
      return current;
    };

    const isProtectedLevelBlock = (ent: any) => {
      if (!level) return false;
      const start = level.start;
      const startP2 = level.startP2;
      const goal = level.entities?.find((e: any) => e.type === "goal");
      
      const checkUnder = (targetX: number, targetY: number) => {
        const platforms = level.entities?.filter((e: any) => e.type !== "goal" && e.y >= targetY - 10 && e.x <= targetX + 15 && e.x + e.w >= targetX - 15) || [];
        const plat = platforms.sort((a: any, b: any) => a.y - b.y)[0];
        return plat && Math.abs(plat.x - ent.x) < 0.1 && Math.abs(plat.y - ent.y) < 0.1;
      };

      if (start && checkUnder(start.x, start.y)) return true;
      if (startP2 && checkUnder(startP2.x, startP2.y)) return true;
      if (goal && checkUnder(goal.x, goal.y + (goal.h || 60))) return true;
      
      return false;
    };

    const applyModifier = (
      player: "P1" | "P2",
      itm: any,
      px: number,
      py: number,
      w: number,
      h: number,
    ) => {
      // 1. Find in buildBattlePlacedEntities
      let pIdx = buildBattlePlacedEntities.findIndex(
        (ent) =>
          px < ent.x + ent.w &&
          px + w > ent.x &&
          py < ent.y + ent.h &&
          py + h > ent.y,
      );
      if (pIdx !== -1) {
        setBuildBattlePlacedEntities((prev) => {
          const cloned = [...prev];
          const target = { ...cloned[pIdx] };
          if (itm.type === "modifier_moving_platform_h") {
            target.type = "moving_platform_h";
            target.movingH = true;
            target.moveRange = 150;
            target.moveSpeed = 0.003;
          } else if (itm.type === "modifier_moving_platform_v") {
            target.type = "moving_platform_v";
            target.movingV = true;
            target.moveRange = 150;
            target.moveSpeed = 0.003;
          } else if (itm.type === "modifier_ice") {
            target.type = "ice";
          } else if (itm.type === "modifier_slime") {
            target.type = "slime";
          } else if (itm.type === "modifier_fragile") {
            target.type = "fragile";
            target.fragile = true;
          }
          cloned[pIdx] = target;
          return cloned;
        });
        showToast(`${player}: Block geupgraded!`);
        setBuildBattleConfirmed((p) => ({ ...p, [player]: true }));
        return true;
      }

      // 2. Find in level.entities (static blocks)
      const lEnt = level.entities?.find(
        (ent) =>
          (ent.type === "wall" ||
            ent.type === "ice" ||
            ent.type === "slime" ||
            ent.type === "hazard") &&
          px < ent.x + ent.w &&
          px + w > ent.x &&
          py < ent.y + ent.h &&
          py + h > ent.y,
      );
      if (lEnt) {
        if (isProtectedLevelBlock(lEnt)) {
          showToast(`${player}: Start/Ziel-Block kann nicht verändert werden!`);
          return false;
        }
        const target = { ...lEnt };
        if (itm.type === "modifier_moving_platform_h") {
          target.type = "moving_platform_h";
          target.movingH = true;
          target.moveRange = 150;
          target.moveSpeed = 0.003;
        } else if (itm.type === "modifier_moving_platform_v") {
          target.type = "moving_platform_v";
          target.movingV = true;
          target.moveRange = 150;
          target.moveSpeed = 0.003;
        } else if (itm.type === "modifier_ice") {
          target.type = "ice";
        } else if (itm.type === "modifier_slime") {
          target.type = "slime";
        } else if (itm.type === "modifier_fragile") {
          target.type = "fragile";
          target.fragile = true;
        }
        setBuildBattlePlacedEntities((prev) => [...prev, target]);
        showToast(`${player}: Level-Block geupgraded!`);
        setBuildBattleConfirmed((p) => ({ ...p, [player]: true }));
        return true;
      }

      showToast(`${player}: Setze auf einen vorhandenen Block auf!`);
      return false;
    };

    const applyBomb = (player: "P1" | "P2", px: number, py: number) => {
      const overlapW = 30;
      const overlapH = 30;

      const splitBlock = (
        ent: any,
        ox: number,
        oy: number,
        ow: number = 30,
        oh: number = 30,
      ) => {
        const pieces: any[] = [];
        const newId = () =>
          `split_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        if (oy > ent.y) {
          pieces.push({ ...ent, id: newId(), y: ent.y, h: oy - ent.y });
        }
        if (oy + oh < ent.y + ent.h) {
          pieces.push({
            ...ent,
            id: newId(),
            y: oy + oh,
            h: ent.y + ent.h - (oy + oh),
          });
        }
        if (ox > ent.x) {
          const topY = Math.max(ent.y, oy);
          const bottomY = Math.min(ent.y + ent.h, oy + oh);
          if (bottomY > topY) {
            pieces.push({
              ...ent,
              id: newId(),
              x: ent.x,
              y: topY,
              w: ox - ent.x,
              h: bottomY - topY,
            });
          }
        }
        if (ox + ow < ent.x + ent.w) {
          const topY = Math.max(ent.y, oy);
          const bottomY = Math.min(ent.y + ent.h, oy + oh);
          if (bottomY > topY) {
            pieces.push({
              ...ent,
              id: newId(),
              x: ox + ow,
              y: topY,
              w: ent.x + ent.w - (ox + ow),
              h: bottomY - topY,
            });
          }
        }
        return pieces;
      };

      // Use the smart snappable bomb finder
      const allBlocks = [
        ...(level.entities || []),
        ...buildBattlePlacedEntities,
      ];
      const snapResult = getBombSnappedPosition(px, py, allBlocks);

      if (snapResult.found) {
        const ent = snapResult.target;
        // Check if it exists in battle placed entities
        const pIdx = buildBattlePlacedEntities.findIndex((e) => e.id === ent.id);
        if (pIdx !== -1) {
          setBuildBattlePlacedEntities((prev) => {
            const cloned = [...prev];
            cloned.splice(pIdx, 1);
            cloned.push(
              ...splitBlock(
                ent,
                snapResult.snapX,
                snapResult.snapY,
                overlapW,
                overlapH,
              ),
            );
            return cloned;
          });
          showToast(`${player}: Block gesprengt (30x30)!`);
          setBuildBattleConfirmed((p) => ({ ...p, [player]: true }));
          return true;
        }

        // Check if it exists in level entities
        const lIdx = level.entities?.findIndex(
          (e) =>
            e.id === ent.id ||
            (e.x === ent.x && e.y === ent.y && e.type === ent.type),
        );
        if (lIdx !== undefined && lIdx !== -1) {
          if (isProtectedLevelBlock(level.entities![lIdx])) {
            showToast(`${player}: Start/Ziel-Block kann nicht zerstört werden!`);
            return false;
          }
          setLevel((prev) => {
            const updated = [...(prev.entities || [])];
            updated.splice(lIdx, 1);
            updated.push(
              ...splitBlock(
                ent,
                snapResult.snapX,
                snapResult.snapY,
                overlapW,
                overlapH,
              ),
            );
            return { ...prev, entities: updated };
          });
          showToast(`${player}: Level-Block gesprengt (30x30)!`);
          setBuildBattleConfirmed((p) => ({ ...p, [player]: true }));
          return true;
        }
      }

      showToast(`${player}: Platziere die Bombe auf einen Block!`);
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (buildBattleIntroCountdown > 0) return;

      if (buildBattlePhase === "select") {
        const totalItems = buildBattleItems.length;
        if (!buildBattleConfirmed.P1) {
          if (e.code === "KeyW" || e.code === "KeyA") {
            setBuildBattleSelection((p) => {
              const next = getNextAvailableIndex(
                p.P1,
                -1,
                buildBattleConfirmed.P2,
                p.P2,
                totalItems,
              );
              return { ...p, P1: next };
            });
          }
          if (e.code === "KeyS" || e.code === "KeyD") {
            setBuildBattleSelection((p) => {
              const next = getNextAvailableIndex(
                p.P1,
                1,
                buildBattleConfirmed.P2,
                p.P2,
                totalItems,
              );
              return { ...p, P1: next };
            });
          }
          if (e.code === "Space" || e.code === "KeyQ") {
            if (
              buildBattleConfirmed.P2 &&
              buildBattleSelection.P2 === buildBattleSelection.P1
            ) {
              showToast("Bereits gewaehlt!");
            } else {
              setBuildBattleConfirmed((p) => ({ ...p, P1: true }));
              setBuildBattleSelection((prev) => {
                if (prev.P2 === prev.P1) {
                  return {
                    ...prev,
                    P2: getNextAvailableIndex(
                      prev.P2,
                      1,
                      true,
                      prev.P1,
                      totalItems,
                    ),
                  };
                }
                return prev;
              });
            }
          }
        }
        if (!buildBattleConfirmed.P2) {
          if (e.code === "ArrowUp" || e.code === "ArrowLeft") {
            setBuildBattleSelection((p) => {
              const next = getNextAvailableIndex(
                p.P2,
                -1,
                buildBattleConfirmed.P1,
                p.P1,
                totalItems,
              );
              return { ...p, P2: next };
            });
          }
          if (e.code === "ArrowDown" || e.code === "ArrowRight") {
            setBuildBattleSelection((p) => {
              const next = getNextAvailableIndex(
                p.P2,
                1,
                buildBattleConfirmed.P1,
                p.P1,
                totalItems,
              );
              return { ...p, P2: next };
            });
          }
          if (e.code === "Enter" || e.code === "ShiftRight") {
            if (
              buildBattleConfirmed.P1 &&
              buildBattleSelection.P1 === buildBattleSelection.P2
            ) {
              showToast("Bereits gewaehlt!");
            } else {
              setBuildBattleConfirmed((p) => ({ ...p, P2: true }));
              setBuildBattleSelection((prev) => {
                if (prev.P1 === prev.P2) {
                  return {
                    ...prev,
                    P1: getNextAvailableIndex(
                      prev.P1,
                      1,
                      true,
                      prev.P2,
                      totalItems,
                    ),
                  };
                }
                return prev;
              });
            }
          }
        }
      } else if (buildBattlePhase === "build") {
        const isTooClose = (x: number, y: number, w: number, h: number) => {
          const lvl = BUILD_BATTLE_LEVELS.find(
            (l) => l.id === gameState.levelId,
          );
          if (!lvl) return false;
          const cx = x + w / 2;
          const cy = y + h / 2;
          if (lvl.start) {
            const dx = cx - lvl.start.x,
              dy = cy - lvl.start.y;
            if (Math.hypot(dx, dy) < 100) return true;
          }
          const goal = lvl.entities.find((e) => e.type === "goal");
          if (goal) {
            const dx = cx - (goal.x + goal.w / 2);
            const dy = cy - (goal.y + goal.h / 2);
            if (Math.hypot(dx, dy) < 100) return true;
          }
          return false;
        };

        if (!buildBattleConfirmed.P1) {
          if (e.code === "KeyW") moveCursor("P1", 0, -1);
          if (e.code === "KeyS") moveCursor("P1", 0, 1);
          if (e.code === "KeyA") moveCursor("P1", -1, 0);
          if (e.code === "KeyD") moveCursor("P1", 1, 0);
          if (e.code === "KeyE")
            setBuildBattleRotation((p) => ({ ...p, P1: !p.P1 }));
          if (e.code === "Space" || e.code === "KeyQ") {
            const itm = buildBattleItems[buildBattleSelection.P1];
            if (itm) {
              const px = buildBattleCursors.P1.x;
              const py = buildBattleCursors.P1.y;
              let w = itm.args?.w || 30;
              let h = itm.args?.h || 30;
              if (buildBattleRotation.P1 && itm.type !== "orbit") {
                const tmp = w;
                w = h;
                h = tmp;
              }
              if (itm.type === "bomb") {
                applyBomb("P1", px, py);
              } else if (isTooClose(px, py, w, h)) {
                showToast("P1: Zu nah an Start/Ziel!");
              } else {
                let finalX = px;
                let finalY = py;
                if (itm.type === "glue") {
                  const allBlocks = [
                    ...(level.entities || []),
                    ...buildBattlePlacedEntities,
                    ...(buildBattlePlacedThisRound.P1 ? [buildBattlePlacedThisRound.P1] : []),
                    ...(buildBattlePlacedThisRound.P2 ? [buildBattlePlacedThisRound.P2] : []),
                  ];
                  const snap = getGlueSnappedPosition(px, py, w, h, allBlocks);
                  if (!snap.success) {
                    showToast(
                      "P1: Kleber benötigt einen benachbarten Block zum Anheften!",
                    );
                    return;
                  }
                  finalX = snap.finalX;
                  finalY = snap.finalY;
                } else {
                  const bookkeepingBlocks = [
                    ...(level.entities || []),
                    ...buildBattlePlacedEntities,
                    ...(buildBattlePlacedThisRound.P1 ? [buildBattlePlacedThisRound.P1] : []),
                    ...(buildBattlePlacedThisRound.P2 ? [buildBattlePlacedThisRound.P2] : []),
                  ];
                  const snap = getBlockSnappedToGluePosition(px, py, w, h, bookkeepingBlocks);
                  if (snap.success) {
                    finalX = snap.finalX;
                    finalY = snap.finalY;
                  }
                }
                if (false && itm.type === "glue") {
                  const allBlocks = [
                    ...(level.entities || []),
                    ...buildBattlePlacedEntities,
                  ].filter(
                    (e) =>
                      e.type === "wall" ||
                      e.type === "ice" ||
                      e.type === "slime" ||
                      e.type === "trampoline" ||
                      e.type === "fragile" ||
                      e.type.startsWith("moving_platform_"),
                  );
                  let touchedBelow = false;
                  let touchedAbove = false;
                  let touchedLeft = false;
                  let touchedRight = false;
                  if (w > h) {
                    touchedBelow = allBlocks.some((b) => {
                      const bw = b.w || 30;
                      const hOverlap =
                        Math.min(px + 60, b.x + bw) - Math.max(px, b.x);
                      return hOverlap >= 15 && Math.abs(b.y - (py + 30)) <= 2;
                    });
                    touchedAbove = allBlocks.some((b) => {
                      const bw = b.w || 30;
                      const bh = b.h || 30;
                      const hOverlap =
                        Math.min(px + 60, b.x + bw) - Math.max(px, b.x);
                      return hOverlap >= 15 && Math.abs(b.y + bh - py) <= 2;
                    });
                    if (!touchedBelow && !touchedAbove) {
                      showToast(
                        "P1: Kleber benötigt flach anliegenden Block darüber oder darunter!",
                      );
                      return;
                    }
                    finalY = touchedBelow ? py + 24 : py;
                  } else {
                    touchedRight = allBlocks.some((b) => {
                      const bw = b.w || 30;
                      const bh = b.h || 30;
                      const vOverlap =
                        Math.min(py + 60, b.y + bh) - Math.max(py, b.y);
                      return vOverlap >= 15 && Math.abs(b.x - (px + 30)) <= 2;
                    });
                    touchedLeft = allBlocks.some((b) => {
                      const bw = b.w || 30;
                      const bh = b.h || 30;
                      const vOverlap =
                        Math.min(py + 60, b.y + bh) - Math.max(py, b.y);
                      return vOverlap >= 15 && Math.abs(b.x + bw - px) <= 2;
                    });
                    if (!touchedLeft && !touchedRight) {
                      showToast(
                        "P1: Kleber benötigt flach anliegenden Block links oder rechts!",
                      );
                      return;
                    }
                    finalX = touchedRight ? px + 24 : px;
                  }
                }

                if (itm.isModifier) {
                  applyModifier("P1", itm, px, py, w, h);
                } else {
                  setBuildBattlePlacedThisRound((p) => ({
                    ...p,
                    P1: {
                      ...itm.args,
                      x: finalX,
                      y: finalY,
                      w,
                      h,
                      type: itm.type,
                      ...(itm.type === "orbit" && buildBattleRotation.P1
                        ? { moveSpeed: -(itm.args?.moveSpeed || 0.0025) }
                        : {}),
                    },
                  }));
                  setBuildBattleConfirmed((p) => ({ ...p, P1: true }));
                }
              }
            }
          }
        }
        if (!buildBattleConfirmed.P2) {
          if (e.code === "ArrowUp") moveCursor("P2", 0, -1);
          if (e.code === "ArrowDown") moveCursor("P2", 0, 1);
          if (e.code === "ArrowLeft") moveCursor("P2", -1, 0);
          if (e.code === "ArrowRight") moveCursor("P2", 1, 0);
          if (e.code === "ControlRight" || e.code === "Numpad0")
            setBuildBattleRotation((p) => ({ ...p, P2: !p.P2 }));
          if (e.code === "Enter" || e.code === "ShiftRight") {
            const itm = buildBattleItems[buildBattleSelection.P2];
            if (itm) {
              const px = buildBattleCursors.P2.x;
              const py = buildBattleCursors.P2.y;
              let w = itm.args?.w || 30;
              let h = itm.args?.h || 30;
              if (buildBattleRotation.P2 && itm.type !== "orbit") {
                const tmp = w;
                w = h;
                h = tmp;
              }
              if (itm.type === "bomb") {
                applyBomb("P2", px, py);
              } else if (isTooClose(px, py, w, h)) {
                showToast("P2: Zu nah an Start/Ziel!");
              } else {
                let finalX = px;
                let finalY = py;
                if (itm.type === "glue") {
                  const allBlocks = [
                    ...(level.entities || []),
                    ...buildBattlePlacedEntities,
                    ...(buildBattlePlacedThisRound.P1 ? [buildBattlePlacedThisRound.P1] : []),
                    ...(buildBattlePlacedThisRound.P2 ? [buildBattlePlacedThisRound.P2] : []),
                  ];
                  const snap = getGlueSnappedPosition(px, py, w, h, allBlocks);
                  if (!snap.success) {
                    showToast(
                      "P2: Kleber benötigt einen benachbarten Block zum Anheften!",
                    );
                    return;
                  }
                  finalX = snap.finalX;
                  finalY = snap.finalY;
                } else {
                  const bookkeepingBlocks = [
                    ...(level.entities || []),
                    ...buildBattlePlacedEntities,
                    ...(buildBattlePlacedThisRound.P1 ? [buildBattlePlacedThisRound.P1] : []),
                    ...(buildBattlePlacedThisRound.P2 ? [buildBattlePlacedThisRound.P2] : []),
                  ];
                  const snap = getBlockSnappedToGluePosition(px, py, w, h, bookkeepingBlocks);
                  if (snap.success) {
                    finalX = snap.finalX;
                    finalY = snap.finalY;
                  }
                }
                if (false && itm.type === "glue") {
                  const allBlocks = [
                    ...(level.entities || []),
                    ...buildBattlePlacedEntities,
                  ].filter(
                    (e) =>
                      e.type === "wall" ||
                      e.type === "ice" ||
                      e.type === "slime" ||
                      e.type === "trampoline" ||
                      e.type === "fragile" ||
                      e.type.startsWith("moving_platform_"),
                  );
                  let touchedBelow = false;
                  let touchedAbove = false;
                  let touchedLeft = false;
                  let touchedRight = false;
                  if (w > h) {
                    touchedBelow = allBlocks.some((b) => {
                      const bw = b.w || 30;
                      const hOverlap =
                        Math.min(px + 60, b.x + bw) - Math.max(px, b.x);
                      return hOverlap >= 15 && Math.abs(b.y - (py + 30)) <= 2;
                    });
                    touchedAbove = allBlocks.some((b) => {
                      const bw = b.w || 30;
                      const bh = b.h || 30;
                      const hOverlap =
                        Math.min(px + 60, b.x + bw) - Math.max(px, b.x);
                      return hOverlap >= 15 && Math.abs(b.y + bh - py) <= 2;
                    });
                    if (!touchedBelow && !touchedAbove) {
                      showToast(
                        "P2: Kleber benötigt flach anliegenden Block darüber oder darunter!",
                      );
                      return;
                    }
                    finalY = touchedBelow ? py + 24 : py;
                  } else {
                    touchedRight = allBlocks.some((b) => {
                      const bw = b.w || 30;
                      const bh = b.h || 30;
                      const vOverlap =
                        Math.min(py + 60, b.y + bh) - Math.max(py, b.y);
                      return vOverlap >= 15 && Math.abs(b.x - (px + 30)) <= 2;
                    });
                    touchedLeft = allBlocks.some((b) => {
                      const bw = b.w || 30;
                      const bh = b.h || 30;
                      const vOverlap =
                        Math.min(py + 60, b.y + bh) - Math.max(py, b.y);
                      return vOverlap >= 15 && Math.abs(b.x + bw - px) <= 2;
                    });
                    if (!touchedLeft && !touchedRight) {
                      showToast(
                        "P2: Kleber benötigt flach anliegenden Block links oder rechts!",
                      );
                      return;
                    }
                    finalX = touchedRight ? px + 24 : px;
                  }
                }

                if (itm.isModifier) {
                  applyModifier("P2", itm, px, py, w, h);
                } else {
                  setBuildBattlePlacedThisRound((p) => ({
                    ...p,
                    P2: {
                      ...itm.args,
                      x: finalX,
                      y: finalY,
                      w,
                      h,
                      type: itm.type,
                      ...(itm.type === "orbit" && buildBattleRotation.P2
                        ? { moveSpeed: -(itm.args?.moveSpeed || 0.0025) }
                        : {}),
                    },
                  }));
                  setBuildBattleConfirmed((p) => ({ ...p, P2: true }));
                }
              }
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    gameState.status,
    buildBattlePhase,
    buildBattleConfirmed,
    buildBattleCursors,
    buildBattleSelection,
    buildBattleItems,
    buildBattleIntroCountdown,
    buildBattlePlacedEntities,
    level,
    buildBattleVotes,
    buildBattleVoteSelection,
  ]);

  // Auto-transition out of build_battle_won after 5 seconds if match is not over
  useEffect(() => {
    if (gameState.status === "build_battle_won") {
      const isMatchOver =
        buildBattleScores.P1 >= buildBattleTargetPointsConfig ||
        buildBattleScores.P2 >= buildBattleTargetPointsConfig;
      if (!isMatchOver) {
        const timer = setTimeout(() => {
          const newItems = get8UniqueBuildBattleItems(buildBattleAllowedItems);
          setBuildBattleItems(newItems);
          setBuildBattlePhase("select");
          setBuildBattlePhaseTimer(buildBattleSelectTimerConfig);
          setBuildTurn(0);
          setBuildBattleRound((p) => p + 1);
          setBuildBattlePlacedThisRound({});
          setBuildBattleSelection({ P1: 0, P2: 1 });
          setBuildBattleConfirmed({ P1: false, P2: false });
          setBuildBattleSurrenders({});
          setBuildBattleRotation({ P1: false, P2: false });
          setBuildBattleCursors({
            P1: { x: 480, y: 270 },
            P2: { x: 510, y: 270 },
          });
          setResetTrigger((p) => p + 1);
          setRespawnTrigger((p) => p + 1);
          setGameState((p) => ({
            ...p,
            status: "build_battle_playing",
          }));
          showToast(`Start Runde ${buildBattleRound + 1}!`);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [
    gameState.status,
    buildBattleScores,
    buildBattleTargetPointsConfig,
    buildBattleRound,
    buildBattleAllowedItems,
  ]);

  // Monitor votes to toggle 5-sec countdown timer
  useEffect(() => {
    if (gameState.status !== "build_battle_vote") {
      if (buildBattleVoteTimer !== null) setBuildBattleVoteTimer(null);
      return;
    }

    const allVoted =
      buildBattleVotes.P1 !== null && buildBattleVotes.P2 !== null;
    if (allVoted) {
      if (buildBattleVoteTimer === null) {
        setBuildBattleVoteTimer(5);
        showToast(
          lang === "de"
            ? "Alle Spieler abgestimmt! Timer läuft... ⏳"
            : "All players voted! Timer counting down... ⏳",
        );
      }
    } else {
      if (buildBattleVoteTimer !== null) {
        setBuildBattleVoteTimer(null);
        showToast(
          lang === "de"
            ? "Abstimmung unvollständig. Timer gestoppt."
            : "Voting incomplete. Timer stopped.",
        );
      }
    }
  }, [gameState.status, buildBattleVotes, buildBattleVoteTimer]);

  // Countdown decrement and map choice logic
  useEffect(() => {
    if (
      gameState.status !== "build_battle_vote" ||
      buildBattleVoteTimer === null
    )
      return;

    if (buildBattleVoteTimer <= 0) {
      // Determine winner map
      const votes: string[] = [];
      if (buildBattleVotes.P1) votes.push(buildBattleVotes.P1);
      if (buildBattleVotes.P2) votes.push(buildBattleVotes.P2);

      let finalLevelId = "build1";
      if (votes.length > 0) {
        const counts: Record<string, number> = {};
        votes.forEach((v) => {
          counts[v] = (counts[v] || 0) + 1;
        });

        let maxVotes = 0;
        let candidates: string[] = [];
        for (const [lvlId, qty] of Object.entries(counts)) {
          if (qty > maxVotes) {
            maxVotes = qty;
            candidates = [lvlId];
          } else if (qty === maxVotes) {
            candidates.push(lvlId);
          }
        }

        if (candidates.length > 0) {
          const randIdx = Math.floor(Math.random() * candidates.length);
          finalLevelId = candidates[randIdx];
        }
      }

      const selectedLevel =
        BUILD_BATTLE_LEVELS.find((l) => l.id === finalLevelId) ||
        BUILD_BATTLE_LEVELS[0];
      setLevel(selectedLevel);

      const newItems = get8UniqueBuildBattleItems(buildBattleAllowedItems);
      setBuildBattleItems(newItems);
      setBuildBattleSelection({ P1: 0, P2: 1 });
      setBuildBattleConfirmed({ P1: false, P2: false });
      setBuildBattleSurrenders({});
      setBuildBattleRotation({ P1: false, P2: false });
      setBuildBattleCursors({ P1: { x: 480, y: 270 }, P2: { x: 510, y: 270 } });
      setBuildBattlePhase("select");
      setBuildBattlePhaseTimer(buildBattleSelectTimerConfig);
      setBuildTurn(0);
      setBuildBattleRound(1);
      setBuildBattlePlacedEntities([]);
      setBuildBattlePlacedThisRound({});
      setResetTrigger((p) => p + 1);
      setRespawnTrigger(0);

      setGameState((p) => ({
        ...p,
        status: "build_battle_playing",
        levelDeaths: 0,
        levelTime: 0,
        collectedCoins: [],
        deaths: 0,
        blocksPlaced: 0,
      }));

      showToast(
        lang === "de"
          ? `Level gewählt: ${selectedLevel.name}`
          : `Level selected: ${selectedLevel.name}`,
      );
      setBuildBattleVoteTimer(null);
      return;
    }

    const interval = setInterval(() => {
      setBuildBattleVoteTimer((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [
    gameState.status,
    buildBattleVoteTimer,
    buildBattleVotes,
    buildBattleAllowedItems,
    buildBattleSelectTimerConfig,
  ]);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevStatusRef = useRef(gameState.status);

  useEffect(() => {
    if (prevStatusRef.current !== gameState.status) {
      const oldStatus = prevStatusRef.current;
      const newStatus = gameState.status;
      prevStatusRef.current = newStatus;

      // Only block if the new status is a menu status (prevent blocking mouse/touch in game)
      const isMenu = (status: string) => {
        return ![
          "playing",
          "vs_playing",
          "brawler_playing",
          "testing",
          "brawler_testing",
          "random_run",
        ].includes(status);
      };

      if (isMenu(newStatus)) {
        setIsTransitioning(true);
        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, 200); // block input for 200ms during transition
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.status]);

  // Track Difficulty for Story Mode flow
  const [selectedDifficultySet, setSelectedDifficultySet] =
    useState<LevelData[]>(INITIAL_LEVELS);

  const [respawnTrigger, setRespawnTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(
    null,
  );

  const [onlineLobbyInput, setOnlineLobbyInput] = useState("");
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [kickMenuOpen, setKickMenuOpen] = useState(false);
  const [kickConfirmTarget, setKickConfirmTarget] =
    useState<OnlinePlayer | null>(null);
  const [voteConfirmType, setVoteConfirmType] = useState<VoteType | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [onlineSuggestions, setOnlineSuggestions] = useState<any[]>([]);
  const [showSuggestionMenu, setShowSuggestionMenu] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showInGameChat, setShowInGameChat] = useState(false);
  const [inGameChatText, setInGameChatText] = useState("");
  const [onlineError, setOnlineError] = useState("");

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 5000);
  };

  // Debouncing refs
  const lastDeathTime = useRef(0);
  const processedCoins = useRef<Set<string>>(new Set());
  const saveInputRef = useRef<HTMLInputElement>(null);

  const handleExportSave = useCallback(() => {
    const saveData = {
      ragecube_settings: JSON.parse(
        localStorage.getItem("ragecube_settings") || "{}",
      ),
      ragecube_customization: secureLoad("ragecube_customization"),
      ragecube_achievements: secureLoad("ragecube_achievements"),
      ragecube_stats: secureLoad("ragecube_stats"),
      ragecube_highscores_v2: secureLoad("ragecube_highscores_v2"),
      ragecube_custom_levels: secureLoad("ragecube_custom_levels"),
    };

    // Sign the whole saveData object
    const signedData = signData(saveData);

    const blob = new Blob([JSON.stringify(signedData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ragecube_save_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleImportSave = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let parsedObject;
          try {
            parsedObject = JSON.parse(content);
          } catch (e) {
            alert(
              lang === Language.DE
                ? "Fehler: Die Datei ist kein gültiges Speicherstand-Format (Ungültiges JSON)."
                : lang === Language.ES
                  ? "Error: El archivo no tiene un formato de guardado válido (JSON inválido)."
                  : "Error: The file is not a valid save format (Invalid JSON).",
            );
            return;
          }

          // Verify signature
          const data = verifyData(parsedObject);
          if (data === null) {
            showToast(
              lang === Language.DE
                ? "Der Import hat wegen Dateimanipulation nicht funktioniert."
                : lang === Language.ES
                  ? "La importación falló debido a la manipulación del archivo."
                  : "The import failed due to file manipulation.",
            );
            return;
          }

          // Basic validation
          if (!data || typeof data !== "object") {
            alert(
              lang === Language.DE
                ? "Fehler: Die Datei enthält keine gültigen Daten."
                : lang === Language.ES
                  ? "Error: El archivo no contiene datos válidos."
                  : "Error: The file does not contain valid data.",
            );
            return;
          }

          if (data.ragecube_settings) {
            localStorage.setItem(
              "ragecube_settings",
              JSON.stringify(data.ragecube_settings),
            );
            setSettings(data.ragecube_settings);
          }
          if (data.ragecube_customization) {
            secureSave("ragecube_customization", data.ragecube_customization);
            setCustomization(data.ragecube_customization);
          }
          if (data.ragecube_achievements) {
            secureSave("ragecube_achievements", data.ragecube_achievements);
            setGameState((p) => ({
              ...p,
              unlockedAchievements: data.ragecube_achievements,
            }));
          }
          if (data.ragecube_stats) {
            secureSave("ragecube_stats", data.ragecube_stats);
            setGameState((p) => ({
              ...p,
              totalBlocksPlaced: data.ragecube_stats.totalBlocksPlaced || 0,
              totalCoinsCollected: data.ragecube_stats.totalCoinsCollected || 0,
              flawlessLevelsCount: data.ragecube_stats.flawlessLevelsCount || 0,
              pacifistLevelsCount: data.ragecube_stats.pacifistLevelsCount || 0,
              totalJumps: data.ragecube_stats.totalJumps || 0,
              totalDeaths: data.ragecube_stats.totalDeaths || 0,
              totalPlayTime: data.ragecube_stats.totalPlayTime || 0,
              distanceWalked: data.ragecube_stats.distanceWalked || 0,
              powerupsCollected: data.ragecube_stats.powerupsCollected || 0,
              totalScore: data.ragecube_stats.totalScore || 0,
              speedrunUnder30Count:
                data.ragecube_stats.speedrunUnder30Count || 0,
              wallJumpsCount: data.ragecube_stats.wallJumpsCount || 0,
              multiplayerWins: data.ragecube_stats.multiplayerWins || 0,
              brawlerLevelsPlayedCount:
                data.ragecube_stats.brawlerLevelsPlayedCount || 0,
              editorTime: data.ragecube_stats.editorTime || 0,
            }));
          }
          if (data.ragecube_highscores_v2) {
            secureSave("ragecube_highscores_v2", data.ragecube_highscores_v2);
            setHighScores(data.ragecube_highscores_v2);
          }
          if (data.ragecube_custom_levels) {
            secureSave("ragecube_custom_levels", data.ragecube_custom_levels);
            setCustomLevels(data.ragecube_custom_levels);
          }

          showToast(
            lang === Language.DE
              ? "Speicherstand erfolgreich importiert! Das Spiel wird nun neu gestartet..."
              : lang === Language.ES
                ? "¡Datos de guardado importados de manera correcta! El juego se reiniciará..."
                : "Save loaded successfully! The game will now restart...",
          );

          // Wait for the user to be able to read the toast before reloading
          setTimeout(() => {
            window.location.reload();
          }, 2500);
        } catch (err) {
          console.error("Failed to parse save file", err);
          alert(
            lang === Language.DE
              ? "Fehler beim Importieren!"
              : lang === Language.ES
                ? "¡Error al importar!"
                : "Error importing save data!",
          );
        }
      };
      reader.readAsText(file);
      if (saveInputRef.current) saveInputRef.current.value = "";
    },
    [lang],
  );

  const triggerImport = useCallback(() => {
    if (saveInputRef.current) {
      saveInputRef.current.click();
    }
  }, []);

  // --- STATE REF PATTERN FOR PERFORMANCE ---
  const stateRef = useRef({
    gameState,
    isTransitioning: false,
    menuSelection,
    editingKey,
    level,
    editorData: null as LevelData | null,
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
    onlinePlayersCount: 0,
    onlineResults: [] as any[],
    buildBattleVotes,
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
    audio.setVolumes(
      settings.musicVolume,
      settings.sfxVolume,
      settings.deathVolume,
    );
    document.documentElement.style.fontSize = `${(settings.uiScale || 1) * 16}px`;
  }, [settings]);

  useEffect(() => {
    secureSave("ragecube_customization", customization);
    if (onlineService.lobbyCode) {
      updateOnlineCustomization(customization);
    }
  }, [customization]);

  // Load Highscores & Custom Levels & Achievements
  useEffect(() => {
    const storedScores = secureLoad("ragecube_highscores_v2");
    if (storedScores) setHighScores(storedScores);

    const storedCustomization = secureLoad("ragecube_customization");
    if (storedCustomization) setCustomization(storedCustomization);

    const storedLevels = secureLoad("ragecube_custom_levels");
    if (storedLevels) setCustomLevels(storedLevels);

    const storedAch = secureLoad("ragecube_achievements");
    if (storedAch)
      setGameState((p) => ({
        ...p,
        unlockedAchievements: storedAch,
      }));

    const stats = secureLoad("ragecube_stats");
    if (stats) {
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
        secureSave("ragecube_achievements", newUnlocked);
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
        brawlerLevelsPlayedCount:
          stats.brawlerLevelsPlayedCount || gameState.brawlerLevelsPlayedCount,
        editorTime: stats.editorTime || gameState.editorTime,
      };
      secureSave("ragecube_stats", statsToSave);
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
  }, [
    isAdminUnlocked,
    isRainbowUnlocked,
    isInvisibleUnlocked,
    isCoffeeUnlocked,
    isMatrixUnlocked,
    isVoidUnlocked,
    checkAchievements,
  ]);

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
  useEffect(() => {
    stateRef.current.onlineResults = onlineResults;
  }, [onlineResults]);

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

  const storyCategories = React.useMemo(
    () => [
      { name: t.beginner || "BEGINNER", levels: INITIAL_LEVELS },
      { name: t.advanced || "ADVANCED", levels: ADVANCED_LEVELS },
      { name: t.expert || "EXPERT", levels: EXPERT_LEVELS },
      { name: t.god || "GOD", levels: GOD_LEVELS },
      { name: t.brawlerLevels || "BRAWLER", levels: BRAWLER_LEVELS },
    ],
    [t],
  );

  // Sync Ref with State
  useEffect(() => {
    Object.assign(stateRef.current, {
      gameState,
      isTransitioning,
      menuSelection,
      editingKey,
      level,
      editorData,
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
      onlineResults,
      buildBattleVotes,
    });
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
  const isUnlocked = (
    type: "eyes" | "accessory" | "trail" | "brawlerClass",
    id: string,
  ) => {
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
      if (type === "eyes")
        return (customization.unlockedEyes || []).includes(id);
      if (type === "accessory")
        return (customization.unlockedAccessories || []).includes(id);
      if (type === "trail")
        return (customization.unlockedTrails || []).includes(id);
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
    if (id === "#ff4400" && type === "trail")
      return "HASEN-POWER: 1000 SPRÜNGE";
    if (id === "rainbow" && type === "trail")
      return "EDITOR GOTT: LEVEL VERIFIZIERT";

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
    secureSave("ragecube_custom_levels", updated);
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
      secureSave("ragecube_custom_levels", updated);
      return updated;
    });
  };

  const handleDeleteLevel = (id: string) => {
    setCustomLevels((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      secureSave("ragecube_custom_levels", updated);

      // If deleted the last item, or the selection is now out of bounds
      if (updated.length === 0) {
        setMenuSelection(0);
      } else if (menuSelection >= updated.length) {
        setMenuSelection(updated.length - 1);
      }
      return updated;
    });
  };

  const startNewEditor = (isBrawler: boolean) => {
    setEditorData({
      id: `custom_${Date.now()}`,
      name: "New Level",
      start: { x: 50, y: 450 },
      startP2: isBrawler ? { x: GAME_WIDTH - 70, y: 450 } : undefined,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      entities: [],
      isCustom: true,
      isBrawler: isBrawler,
      isVerified: false,
      allowedAbility: "none",
    });
    setEditorHistory(null);
    setEditorVerified(false);
    setGameState((p) => ({ ...p, status: "editor" }));
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
    secureSave("ragecube_custom_levels", newLevels);

    setLevel(updatedLevel);
    processedCoins.current.clear();
    setGameState((prev) => ({
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
      storyCategoryName: undefined,
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
      "editor_test_select",
    ];

    if (playingStates.includes(gameState.status)) {
      interval = window.setInterval(() => {
        if (onlineService.isPaused) return;
        setGameState((prev) => {
          const newLevelTime = prev.levelTime + 1;

          // Forced timeout logic for multiplayer matches (Online & Local)
          const isMulti =
            prev.status === "vs_playing" || prev.status === "brawler_playing";
          const isHost = onlineService.lobbyCode ? onlineService.isHost : true;
          if (
            isMulti &&
            isHost &&
            newLevelTime >= GLOBAL_LEVEL_TIME_LIMIT &&
            onlineFinishTimerRef.current === null
          ) {
            // Force start the end-of-round sequence
            setTimeout(() => finalizeMatch(stateRef.current.onlineResults), 0);
          }

          return {
            ...prev,
            time: prev.time + 1,
            levelTime: newLevelTime,
          };
        });
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

  // --- BUILD-BATTLE SETUP INITIALIZER ---
  useEffect(() => {
    if (gameState.status === "build_battle_setup") {
      if (
        selectedLevels.length === 0 ||
        !BUILD_BATTLE_LEVELS.some((b) => b.id === selectedLevels[0].id)
      ) {
        setSelectedLevels([BUILD_BATTLE_LEVELS[0]]);
      }
    }
  }, [gameState.status, selectedLevels]);

  // Reset selection on state change
  useEffect(() => {
    const resetStates = [
      "menu",
      "multiplayer_menu",
      "local_multiplayer_menu",
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
      "build_battle_setup",
      "build_battle_won",
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

    // Reset results for VS/Multi
    setOnlineResults([]);
    setOnlineFinishTimer(null);
    stateRef.current.onlineResults = [];
    stateRef.current.onlineFinishTimer = null;
    setCurrentVote(null);

    // Reset winner
    setGameState((prev) => ({ ...prev, winner: null }));

    setGameState((prev) => {
      let nextStatus: GameState["status"] = "playing";

      const isVS =
        prev.status === "vs_won" ||
        prev.previousStatus === "vs_playing" ||
        prev.onlineMode === "vs" ||
        (prev.status === "paused" && prev.previousStatus === "vs_playing");

      const isBrawler =
        prev.status === "brawler_won" ||
        prev.previousStatus === "brawler_playing" ||
        prev.onlineMode === "brawler" ||
        (prev.status === "paused" && prev.previousStatus === "brawler_playing");

      if (isVS) {
        nextStatus = "vs_playing";
      } else if (isBrawler) {
        nextStatus = "brawler_playing";
      } else if (prev.customLevelsQueue) {
        nextStatus = "random_run";
      }

      return {
        ...prev,
        status: nextStatus,
        levelTime: 0,
        levelDeaths: 0,
        winner: null,
        isSpectating: false,
        spectateTargetId: undefined,
        // Reset score to what it was when level started (undo penalties/gains)
        score: prev.levelStartScore,
        collectedCoins: [], // Clear coins collected in this level
        blocksPlaced: 0, // Reset blocks for this run segment
      };
    });
    setRespawnTrigger((p) => p + 1);
    setResetTrigger((p) => p + 1);
  };

  const startStoryGame = (levelSet: LevelData[] = INITIAL_LEVELS) => {
    setSelectedDifficultySet(levelSet);
    setLevel(levelSet[0]);
    processedCoins.current.clear();
    setGameState((prev) => ({
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
    let collection =
      currentState.customLevelsQueue || stateRef.current.selectedDifficultySet;

    // Fallback if collection is empty but we are in a known mode
    if ((!collection || collection.length === 0) && onlineService.lobbyCode) {
      if (currentState.onlineMode === "brawler") collection = BRAWLER_LEVELS;
      else collection = filterVSLevels(INITIAL_LEVELS);
    }

    if (collection && nextIdx < collection.length) {
      const nextLevel = collection[nextIdx];
      setLevel(nextLevel);
      processedCoins.current.clear(); // Reset coins for new level

      setOnlineResults([]);
      setOnlineFinishTimer(null);
      stateRef.current.onlineResults = [];
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
        if (prev.customLevelsQueue || onlineService.lobbyCode) {
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
          customLevelsQueue:
            prev.customLevelsQueue ||
            (onlineService.lobbyCode ? collection : null),
          levelTime: 0,
          levelDeaths: 0,
          winner: null,
          isSpectating: false,
          spectateTargetId: undefined,
          blocksPlaced: 0,
          collectedCoins: [], // Clear coins
          // IMPORTANT: Snapshot total score at start of new level
          levelStartScore: prev.score,
          time: prev.time, // Keep total time
        };
      });
      setRespawnTrigger((p) => p + 1);
    } else {
      if (
        onlineService.lobbyCode ||
        currentState.status === "vs_playing" ||
        currentState.status === "brawler_playing" ||
        currentState.status === "online_summary"
      ) {
        setGameState((p) => ({ ...p, status: "online_lobby" }));
        onlineService.returnToLobby();
      } else {
        setGameState((prev) => ({ ...prev, status: "menu" }));
      }
    }
  };

  const toggleFavorite = (type: "skin" | "trail", id: string) => {
    setSettings((prev) => {
      const field =
        type === "skin"
          ? "favoriteSkins"
          : ("favoriteTrails" as keyof GameSettings);
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
      onlineService.sendChatMessage(
        `VOTE PASSED: ${currentVoteCopy.type.toUpperCase()} (${yesCount} vs ${noCount})`,
      );

      if (currentVoteCopy.type === "next" || currentVoteCopy.type === "skip") {
        handleNextLevel();
      } else if (
        currentVoteCopy.type === "repeat" ||
        currentVoteCopy.type === "restart"
      ) {
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
      } else if (currentVoteCopy.type === "test_level") {
        const testLevel = stateRef.current.editorData || stateRef.current.level;
        onlineService.broadcastLobbyState(
          "editor",
          testLevel,
          undefined,
          undefined,
          undefined,
          "testing",
        );
      } else if (currentVoteCopy.type === "kick" && currentVoteCopy.targetId) {
        onlineService.kickPlayer(currentVoteCopy.targetId);
      }
    } else {
      // System message about failure
      onlineService.sendChatMessage(
        `VOTE FAILED: ${currentVoteCopy.type.toUpperCase()} (${yesCount} vs ${noCount})`,
      );
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
      if (e.code === "Escape" && showInGameChat) {
         setShowInGameChat(false);
      }
      return;
    }

    if ((e.code === "KeyT" || e.code === "Enter") && onlineService.lobbyCode && (stateRef.current.gameState.status.includes("playing") || stateRef.current.gameState.status.includes("setup"))) {
       e.preventDefault();
       setShowInGameChat(true);
       return;
    }

    const st = stateRef.current; // Read from Ref
    if (st.isTransitioning) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const status = st.gameState.status;

    // Secret Cheat Code Detection
    if (e.key && e.key.length === 1) {
      setCheatBuffer((prev) => {
        const next = (prev + e.key.toUpperCase()).slice(-16);
        let h = 5381;
        for (let i = 0; i < next.length; i++) {
          h = (h << 5) + h + next.charCodeAt(i);
        }
        if (h >>> 0 === 1621615750) {
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
        "build_battle_playing",
      ].includes(status)
    ) {
      if (e.code === "Escape") {
        if (status === "testing" || status === "brawler_testing") {
          if (onlineService.lobbyCode) {
            if (onlineService.isHost) {
              setGameState((p) => ({
                ...p,
                status: "editor",
                collectedCoins: [],
              }));
              onlineService.broadcastLobbyState(
                "editor",
                undefined,
                undefined,
                undefined,
                undefined,
                "editor",
              );
            }
          } else {
            setGameState((p) => ({
              ...p,
              status: "editor",
              collectedCoins: [],
            })); // Clear coins on exit test
          }
        } else if (
          status === "vs_playing" ||
          status === "brawler_playing" ||
          status === "build_battle_playing"
        ) {
          setGameState((p) => ({
            ...p,
            status: "paused",
            previousStatus: status,
          }));
        } else {
          setGameState((p) => ({ ...p, status: "paused", previousStatus: status }));
        }
      }
      return;
    }

    const navUp = () => setMenuSelection((prev) => Math.max(0, prev - 1));
    const navDown = (max: number) =>
      setMenuSelection((prev) => Math.min(max, prev + 1));
    const sel = st.menuSelection;

    if (status === "multiplayer_menu") {
      if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
      if (e.code === "ArrowDown" || e.code === "KeyS") navDown(2);
      if (e.code === "Enter" || e.code === "Space") {
        switch (sel) {
          case 0: // Local
            setMenuSelection(0);
            setGameState((p) => ({ ...p, status: "local_multiplayer_menu" }));
            break;
          case 1: // Online
            setMenuSelection(1);
            setGameState((p) => ({ ...p, status: "online_menu" }));
            break;
          case 2: // Back
            setMenuSelection(1); // Set hover back to "Multiplayer" (index 1) in main menu
            setGameState((p) => ({ ...p, status: "menu" }));
            break;
        }
      }
      if (e.code === "Escape") {
        setMenuSelection(1);
        setGameState((p) => ({ ...p, status: "menu" }));
      }
      return;
    }

    if (status === "local_multiplayer_menu") {
      if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
      if (e.code === "ArrowDown" || e.code === "KeyS") navDown(3);
      if (e.code === "Enter" || e.code === "Space") {
        switch (sel) {
          case 0: // VS
            setLevelSource("builtin");
            setHighscoreLevelIndex(0);
            setMenuSelection(0);
            setGameState((p) => ({ ...p, status: "vs_setup" }));
            break;
          case 1: // Brawler
            setLevelSource("builtin");
            setHighscoreLevelIndex(0);
            setMenuSelection(0);
            setGameState((p) => ({ ...p, status: "brawler_setup" }));
            break;
          case 2: // Build Battle Local
            setLevelSource("builtin");
            setSelectedLevels([BUILD_BATTLE_LEVELS[0]]);
            setLevel(BUILD_BATTLE_LEVELS[0]);
            setHighscoreLevelIndex(0);
            setMenuSelection(0);
            setGameState((p) => ({
              ...p,
              status: "build_battle_setup",
              onlineMode: undefined,
            }));
            break;
          case 3: // Back
            setMenuSelection(0); // Set hover back to "Local Multiplayer" (index 0) in multiplayer_menu
            setGameState((p) => ({ ...p, status: "multiplayer_menu" }));
            break;
        }
      }
      if (e.code === "Escape") {
        setMenuSelection(0); // Set hover back to "Local Multiplayer" (index 0) in multiplayer_menu
        setGameState((p) => ({ ...p, status: "multiplayer_menu" }));
      }
      return;
    }

    if (status === "menu") {
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        if (sel % 2 === 0 && sel < 8) {
          setMenuSelection(sel + 1);
        }
      }
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        if (sel % 2 !== 0 && sel < 8) {
          setMenuSelection(sel - 1);
        }
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        if (sel === 6 || sel === 7) {
          setMenuSelection(8);
        } else if (sel === 8) {
          // bottom row, do nothing on down
        } else if (sel + 2 <= 7) {
          setMenuSelection(sel + 2);
        }
      }
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        if (sel === 8) {
          setMenuSelection(6); // Default to Editor
        } else if (sel - 2 >= 0) {
          setMenuSelection(sel - 2);
        }
      }

      if (e.code === "Enter" || e.code === "Space") {
        switch (sel) {
          case 0:
            setGameState((p) => ({ ...p, status: "difficulty_select" }));
            break; // Story
          case 1: // Unified Multiplayer Menu
            setMenuSelection(0);
            setGameState((p) => ({ ...p, status: "multiplayer_menu" }));
            break;
          case 2:
            setGameState((p) => ({ ...p, status: "custom_level_select" }));
            break; // Custom Levels
          case 3: // Highscores
            setLevelSource("builtin");
            setHighscoreLevelIndex(0);
            setGameState((p) => ({ ...p, status: "highscores" }));
            break;
          case 4: // Random Run
            setMenuSelection(0);
            setGameState((p) => ({ ...p, status: "random_run_setup" }));
            break;
          case 5: // Achievements
            setGameState((p) => ({ ...p, status: "achievements" }));
            break;
          case 6: // Editor
            setGameState((p) => ({ ...p, status: "editor_type_select" }));
            break;
          case 7: // Shop
            setMenuSelection(0);
            setGameState((p) => ({ ...p, status: "shop" }));
            break;
          case 8: // Settings
            setGameState((p) => ({
              ...p,
              status: "settings",
              previousStatus: "menu",
            }));
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
        if (sel === 4)
          setGameState((p) => ({
            ...p,
            status: p.previousStatus || "menu",
            previousStatus: undefined,
          }));
      }
      if (e.code === "Escape")
        setGameState((p) => ({
          ...p,
          status: p.previousStatus || "menu",
          previousStatus: undefined,
        }));
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
        if (sel === 2)
          setGameState((p) => ({
            ...p,
            status: p.previousStatus || "menu",
            previousStatus: undefined,
          }));
      }
      if (e.code === "Escape")
        setGameState((p) => ({
          ...p,
          status: p.previousStatus || "menu",
          previousStatus: undefined,
        }));
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
        if (sel === 13 && status === "vs_setup")
          setGameState((p) => ({
            ...p,
            collisionEnabled: !p.collisionEnabled,
          }));
        if (sel === 15) setGameState((p) => ({ ...p, status: "menu" }));
      }

      if (
        (e.code === "ArrowLeft" || e.code === "ArrowRight") &&
        sel === 13 &&
        status === "vs_setup"
      ) {
        setGameState((p) => ({ ...p, collisionEnabled: !p.collisionEnabled }));
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

      if (e.code === "Escape")
        setGameState((p) => ({
          ...p,
          status: p.previousStatus || "menu",
          previousStatus: undefined,
        }));
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
            const newPowerups = {
              ...prev,
              [key]: Math.max(0, Math.min(100, prev[key] + delta)),
            };
            if (st.gameState.onlineMode && onlineService.isHost) {
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
                newPowerups,
              );
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
                newPowerups,
              );
            }
            return newPowerups;
          });
        } else if (sel === powerupKeys.length) {
          if (st.gameState.onlineMode && !onlineService.isHost) return;
          if (st.gameState.onlineMode && onlineService.isHost) {
            if (onlineService.lobbyCode) {
              onlineService.broadcastLobbyState(
                "brawler",
                undefined,
                undefined,
                undefined,
                undefined,
                "playing",
              );
            }
          } else if (!st.gameState.onlineMode) {
            setGameState((p) => ({ ...p, status: "brawler_playing" }));
            setRespawnTrigger(0);
            checkAchievements({ mode: "vs" });
          }
        } else if (sel === powerupKeys.length + 1) {
          setGameState((p) => ({
            ...p,
            status:
              p.previousStatus === "online_lobby"
                ? "online_lobby"
                : "brawler_setup",
          }));
        }
      }

      if (e.code === "Escape")
        setGameState((p) => ({
          ...p,
          status:
            p.previousStatus === "online_lobby"
              ? "online_lobby"
              : "brawler_setup",
        }));
    } else if (status === "build_battle_vote") {
      const totalLevels = BUILD_BATTLE_LEVELS.length;
      const key = e.key.toLowerCase();
      const code = e.code;

      if (
        [
          "keyw",
          "keya",
          "keys",
          "keyd",
          "arrowup",
          "arrowleft",
          "arrowdown",
          "arrowright",
          "space",
          "enter",
          "shiftright",
          "keyq",
        ].includes(code.toLowerCase()) ||
        [
          "w",
          "a",
          "s",
          "d",
          "q",
          " ",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "enter",
        ].includes(key)
      ) {
        e.preventDefault();
      }

      if (!st.buildBattleVotes.P1) {
        if (code === "KeyW" || code === "KeyA" || key === "w" || key === "a") {
          setBuildBattleVoteSelection((p) => ({
            ...p,
            P1: (p.P1 - 1 + totalLevels) % totalLevels,
          }));
        }
        if (code === "KeyS" || code === "KeyD" || key === "s" || key === "d") {
          setBuildBattleVoteSelection((p) => ({
            ...p,
            P1: (p.P1 + 1) % totalLevels,
          }));
        }
        if (code === "Space" || key === " " || code === "KeyQ" || key === "q") {
          setBuildBattleVoteSelection((p) => {
            const lvl = BUILD_BATTLE_LEVELS[p.P1];
            if (lvl) {
              setBuildBattleVotes((prev) => ({ ...prev, P1: lvl.id }));
              audio.playCoin && audio.playCoin();
            }
            return p;
          });
        }
      } else {
        if (code === "Space" || key === " " || code === "KeyQ" || key === "q") {
          setBuildBattleVotes((prev) => ({ ...prev, P1: null }));
          audio.playDie && audio.playDie();
        }
      }

      if (!st.buildBattleVotes.P2) {
        if (
          code === "ArrowUp" ||
          code === "ArrowLeft" ||
          key === "arrowup" ||
          key === "arrowleft"
        ) {
          setBuildBattleVoteSelection((p) => ({
            ...p,
            P2: (p.P2 - 1 + totalLevels) % totalLevels,
          }));
        }
        if (
          code === "ArrowDown" ||
          code === "ArrowRight" ||
          key === "arrowdown" ||
          key === "arrowright"
        ) {
          setBuildBattleVoteSelection((p) => ({
            ...p,
            P2: (p.P2 + 1) % totalLevels,
          }));
        }
        if (
          code === "Enter" ||
          key === "enter" ||
          code === "ShiftRight" ||
          key === "shift"
        ) {
          setBuildBattleVoteSelection((p) => {
            const lvl = BUILD_BATTLE_LEVELS[p.P2];
            if (lvl) {
              setBuildBattleVotes((prev) => ({ ...prev, P2: lvl.id }));
              audio.playCoin && audio.playCoin();
            }
            return p;
          });
        }
      } else {
        if (
          code === "Enter" ||
          key === "enter" ||
          code === "ShiftRight" ||
          key === "shift"
        ) {
          setBuildBattleVotes((prev) => ({ ...prev, P2: null }));
          audio.playDie && audio.playDie();
        }
      }
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

      if (e.code === "Escape")
        setGameState((p) => ({
          ...p,
          status: p.previousStatus || "menu",
          previousStatus: undefined,
        }));
    } else if (status === "paused") {
      if (e.code === "KeyR" && gameState.previousStatus !== "build_battle_playing") {
        handleRetry();
        return;
      } // Quick Retry (disabled for build battle)

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

      const isBuildBattle = gameState.previousStatus === "build_battle_playing";

      if (isBuildBattle && !onlineService.lobbyCode) {
        buttons.push({
          action: () => {
            setGameState((p) => ({ ...p, status: p.previousStatus || "playing" }));
            setBuildBattleSurrenders((prev) => ({ ...prev, P1: true }));
          },
        });
        buttons.push({
          action: () => {
            setGameState((p) => ({ ...p, status: p.previousStatus || "playing" }));
            setBuildBattleSurrenders((prev) => ({ ...prev, P2: true }));
          },
        });
      }

      if (!isBuildBattle) {
        // Skip Level Button (Local VS/Brawler with queue)
        if (
          (!onlineService.lobbyCode || onlineService.isHost) &&
          gameState.customLevelsQueue &&
          gameState.currentLevelIndex < gameState.customLevelsQueue.length - 1
        ) {
          buttons.push({ action: handleNextLevel });
        }

        // Retry Level Button (Always in Local VS/Brawler, or if authorized/STORY)
        if (
          !(
            gameState.previousStatus === "vs_playing" ||
            gameState.previousStatus === "brawler_playing"
          ) ||
          !onlineService.lobbyCode
        ) {
          buttons.push({ action: handleRetry });
        }
      }

      if (onlineService.lobbyCode) {
        buttons.push({
          action: () => {
            onlineService.sendEvent("give_up", { name: playerName });
            setGameState((p) => ({
              ...p,
              status: p.previousStatus || "playing",
            }));
            if (isBuildBattle) {
              setBuildBattleSurrenders((prev) => ({ ...prev, [playerName]: true }));
            } else {
              handleWin("GAVE UP");
            }
          },
        });
        if (isBuildBattle && onlineService.isHost) {
          buttons.push({
            action: () => {
              onlineService.sendEvent("force_end_round", { name: playerName });
              setGameState((p) => ({
                ...p,
                status: p.previousStatus || "playing",
              }));
              handleWin("EVERYONE_FINISHED");
            },
          });
        }
        buttons.push({
          action: () => {
            if (onlineService.isHost) {
              onlineService.returnToLobby();
            } else {
              setGameState((p) => ({ ...p, status: "online_lobby" }));
            }
          },
        });
      } else if (
        gameState.previousStatus === "vs_playing" ||
        gameState.previousStatus === "brawler_playing" ||
        gameState.previousStatus === "build_battle_playing" ||
        gameState.previousStatus === "playing" ||
        gameState.previousStatus === "random_run"
      ) {
        buttons.push({
          action: () => {
            setGameState((p) => {
              let nextStatus: GameState["status"] = "menu";
              if (p.previousStatus === "brawler_playing")
                nextStatus = "brawler_setup";
              else if (p.previousStatus === "vs_playing")
                nextStatus = "vs_setup";
              else if (p.previousStatus === "build_battle_playing")
                nextStatus = "build_battle_setup";
              else if (
                p.previousStatus === "playing" ||
                p.previousStatus === "random_run"
              )
                nextStatus = "difficulty_select";

              return {
                ...p,
                status: nextStatus,
              };
            });
          },
        });
      }

      if (!isBuildBattle) {
        // Settings Button
        buttons.push({
          action: () => {
            setGameState((p) => ({
              ...p,
              status: "settings",
              previousStatus: "paused",
            }));
            setMenuSelection(0);
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

      const buttonsCount = buttons.length;

      if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
      if (e.code === "ArrowDown" || e.code === "KeyS")
        navDown(buttonsCount - 1);
      if (e.code === "Enter" || e.code === "Space") {
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
      if (e.code === "ArrowDown" || e.code === "KeyS") navDown(13);
      if (
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight" ||
        e.code === "KeyA" ||
        e.code === "KeyD"
      ) {
        const diff = e.code === "ArrowRight" || e.code === "KeyD" ? 0.1 : -0.1;
        if (sel === 2)
          setSettings((p) => ({
            ...p,
            sfxVolume: Math.min(1, Math.max(0, p.sfxVolume + diff)),
          }));
        if (sel === 3)
          setSettings((p) => ({
            ...p,
            deathVolume: Math.min(
              1,
              Math.max(0, (p.deathVolume ?? 0.5) + diff),
            ),
          }));
        if (sel === 4)
          setSettings((p) => ({
            ...p,
            opponentOpacity: Math.min(
              1,
              Math.max(0, (p.opponentOpacity ?? 0.5) + diff),
            ),
          }));
        if (sel === 5) {
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
        if (sel === 6) {
          setSettings((p) => {
            const currentScale = p.uiScale || 1;
            const currentIndex =
              UI_SCALE_OPTIONS.indexOf(currentScale) !== -1
                ? UI_SCALE_OPTIONS.indexOf(currentScale)
                : 2;
            let nextIndex =
              e.code === "ArrowRight" || e.code === "KeyD"
                ? currentIndex + 1
                : currentIndex - 1;
            if (nextIndex >= UI_SCALE_OPTIONS.length)
              nextIndex = UI_SCALE_OPTIONS.length - 1;
            if (nextIndex < 0) nextIndex = 0;
            return { ...p, uiScale: UI_SCALE_OPTIONS[nextIndex] };
          });
        }
        if (sel === 7) {
          setSettings((p) => {
            const currentScale = p.resolutionScale || 1080;
            const currentIndex =
              RESOLUTION_OPTIONS.indexOf(currentScale) !== -1
                ? RESOLUTION_OPTIONS.indexOf(currentScale)
                : 1;
            let nextIndex =
              e.code === "ArrowRight" || e.code === "KeyD"
                ? currentIndex + 1
                : currentIndex - 1;
            if (nextIndex >= RESOLUTION_OPTIONS.length)
              nextIndex = RESOLUTION_OPTIONS.length - 1;
            if (nextIndex < 0) nextIndex = 0;
            return { ...p, resolutionScale: RESOLUTION_OPTIONS[nextIndex] };
          });
        }
        if (sel === 8) {
          setSettings((p) => ({
            ...p,
            screenShake: Math.min(1, Math.max(0, (p.screenShake ?? 1) + diff)),
          }));
        }
      }
      if (e.code === "Enter" || e.code === "Space") {
        if (sel === 1) {
          setGameState((p) => ({ ...p, status: "keybindings" }));
          setMenuSelection(0);
        }
        if (sel === 9) {
          setSettings((p) => ({
            ...p,
            invertXOnGravityReverse: !p.invertXOnGravityReverse,
          }));
        }
        if (sel === 10) {
          setSettings((p) => ({
            ...p,
            invertYOnGravityReverse: !p.invertYOnGravityReverse,
          }));
        }
        if (sel === 11) {
          triggerImport();
        }
        if (sel === 12) {
          handleExportSave();
        }
        if (sel === 13) {
          setGameState((p) => ({
            ...p,
            status: p.previousStatus || "menu",
            previousStatus: undefined,
          }));
        }
      }
      if (e.code === "Escape")
        setGameState((p) => ({
          ...p,
          status: p.previousStatus || "menu",
          previousStatus: undefined,
        }));
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
          // If it's Player 1 and action is up, we always append "Space" as a secondary jump key
          const newBindings =
            player === 1 && action === "up" && e.code !== "Space"
              ? [e.code, "Space"]
              : [e.code];

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
      if (e.code === "ArrowDown" || e.code === "KeyS") navDown(5);
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
          // Create Build-Battle Lobby
          createOnlineLobby("build_battle");
        } else if (sel === 4) {
          // Join Lobby
          setShowJoinPrompt(true);
        } else if (sel === 5) {
          setMenuSelection(1); // Set hover to "Online Multiplayer"
          setGameState((p) => ({ ...p, status: "multiplayer_menu" }));
        }
      }
      if (e.code === "Escape") {
        setMenuSelection(1); // Set hover to "Online Multiplayer"
        setGameState((p) => ({ ...p, status: "multiplayer_menu" }));
      }
    } else if (status === "online_lobby") {
      if (e.code === "Escape") {
        const isEditor = st.gameState.onlineMode === "editor";
        onlineService.disconnect();
        setGameState((p) => ({
          ...p,
          status: isEditor ? "editor_type_select" : "online_menu",
          previousStatus: undefined,
        }));
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
          const max = st.gameState.isHost ? 5 : 2;
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
          const max = st.gameState.isHost ? 5 : 2;
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
              setGameState((p) => ({ ...p, collisionEnabled: newValue }));
              onlineService.broadcastLobbyState(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                newValue,
              );
            }
          } else if (sel === 5) {
            const isEditor = st.gameState.onlineMode === "editor";
            onlineService.closeLobby();
            setGameState((p) => ({
              ...p,
              status: isEditor ? "editor_type_select" : "online_menu",
            }));
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
            const isEditor = st.gameState.onlineMode === "editor";
            onlineService.disconnect();
            setGameState((p) => ({
              ...p,
              status: isEditor ? "editor_type_select" : "online_menu",
            }));
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
          let maxItems = 1;
          if (hasNext)
            maxItems = 2; // Next, Lobby, Menu
          else if (!onlineService.lobbyCode) maxItems = 2; // Play Again, Lobby, Menu
          navDown(maxItems);
        }
        if (e.code === "Enter" || e.code === "Space") {
          if (hasNext) {
            if (sel === 0) handleNextLevel();
            else if (sel === 1) {
              if (onlineService.lobbyCode && onlineService.isHost) {
                onlineService.returnToLobby();
              } else {
                setGameState((p) => ({
                  ...p,
                  status: onlineService.lobbyCode
                    ? "online_lobby"
                    : p.status === "brawler_won"
                      ? "brawler_setup"
                      : "vs_setup",
                }));
              }
            } else if (sel === 2) {
              if (onlineService.lobbyCode) onlineService.disconnect();
              setGameState((p) => ({ ...p, status: "menu" }));
            }
          } else if (onlineService.lobbyCode) {
            // Online mode without next queue
            if (sel === 0) {
              if (onlineService.isHost) onlineService.returnToLobby();
            } else if (sel === 1) {
              onlineService.disconnect();
              setGameState((p) => ({ ...p, status: "menu" }));
            }
          } else {
            // Local mode without next queue
            if (sel === 0) {
              handleRetry();
            } else if (sel === 1) {
              setGameState((p) => ({
                ...p,
                status:
                  p.status === "brawler_won" ? "brawler_setup" : "vs_setup",
              }));
            } else if (sel === 2) {
              setGameState((p) => ({ ...p, status: "menu" }));
            }
          }
        }
      } else {
        const isLastLevel =
          !st.gameState.geometryDashMode &&
          ((st.gameState.customLevelsQueue &&
            st.gameState.currentLevelIndex >=
              st.gameState.customLevelsQueue.length - 1) ||
            (!st.gameState.customLevelsQueue &&
              st.gameState.currentLevelIndex >=
                st.selectedDifficultySet.length - 1));

        if (!isLastLevel) {
          if (e.code === "ArrowUp" || e.code === "KeyW") navUp();
          if (e.code === "ArrowDown" || e.code === "KeyS") navDown(1);

          if (e.code === "Enter" || e.code === "Space") {
            if (sel === 0) {
              const nextIdx = st.gameState.currentLevelIndex + 1;
              const collection =
                st.gameState.customLevelsQueue || st.selectedDifficultySet;

              if (nextIdx < collection.length) {
                setLevel(collection[nextIdx]);
                processedCoins.current.clear();

                // Clear state for next run
                setOnlineResults([]);
                setOnlineFinishTimer(null);
                setCurrentVote(null);

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

                // Keep respawn logic tight for GD mode as handleNextLevel does
                setRespawnTrigger((p) => p + 1);
              } else {
                setGameState((prev) => ({
                  ...prev,
                  status: "menu",
                  geometryDashMode: false,
                }));
              }
            } else if (sel === 1) {
              setGameState((prev) => ({
                ...prev,
                status: prev.geometryDashMode ? "geometry_dash_menu" : "menu",
                geometryDashMode: false,
              }));
            }
          }
        } else {
          if (e.code === "Enter" || e.code === "Space") {
            if (sel === 0 && st.playerName.length > 0) saveHighscore();
          }
        }
      }
    } else if (status === "achievements") {
      if (e.code === "Escape") {
        setGameState((p) => ({
          ...p,
          status: p.previousStatus || "menu",
          previousStatus: undefined,
        }));
      }
    } else if (status === "online_summary") {
      const isHost = onlineService.isHost;
      const isOnline = !!onlineService.lobbyCode;
      const hasNext =
        st.gameState.customLevelsQueue &&
        st.gameState.currentLevelIndex <
          st.gameState.customLevelsQueue.length - 1;

      let maxItems = 1;
      if (isOnline) {
        if (isHost) {
          maxItems = hasNext ? 3 : 2; // Next (if any), Repeat, Lobby, Menu
        } else {
          maxItems = 2; // Waiting, Lobby, Menu (3 buttons = index 0,1,2 so maxItems 2)
        }
      } else {
        // Local mode
        maxItems = hasNext ? 2 : 2; // Next, Mode Selection, Menu OR Play Again, Mode Selection, Menu
      }

      if (e.code === "ArrowUp" || e.code === "KeyW") {
        setMenuSelection((prev) => (prev <= 0 ? maxItems : prev - 1));
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        setMenuSelection((prev) => (prev >= maxItems ? 0 : prev + 1));
      }
      if (e.code === "Enter" || e.code === "Space") {
        if (isOnline) {
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
              setGameState((p) => ({ ...p, status: "online_lobby" }));
            } else if (sel === 2) {
              onlineService.disconnect();
              setGameState((p) => ({ ...p, status: "menu" }));
            }
          }
        } else {
          // Local mode
          if (hasNext) {
            if (sel === 0) handleNextLevel();
            else if (sel === 1)
              setGameState((p) => ({
                ...p,
                status:
                  p.previousStatus === "brawler_playing"
                    ? "brawler_setup"
                    : "vs_setup",
              }));
            else if (sel === 2) setGameState((p) => ({ ...p, status: "menu" }));
          } else {
            if (sel === 0) handleRetry();
            else if (sel === 1)
              setGameState((p) => ({
                ...p,
                status:
                  p.previousStatus === "brawler_playing"
                    ? "brawler_setup"
                    : "vs_setup",
              }));
            else if (sel === 2) setGameState((p) => ({ ...p, status: "menu" }));
          }
        }
      }
    }
  }, [showInGameChat]); // Dependency array updated

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
  const createOnlineLobby = async (
    mode: "brawler" | "vs" | "editor" | "build_battle",
  ) => {
    let activeName = playerName.trim();
    if (!activeName) {
      activeName = "CUBE_PLAYER_" + Math.floor(1000 + Math.random() * 9000);
      setPlayerName(activeName);
      setSettings((p) => ({ ...p, playerName: activeName }));
    }
    setOnlineError("Creating lobby...");
    try {
      const localPlayer: OnlinePlayer = {
        id: Math.random().toString(36).substr(2, 9),
        name: activeName,
        customization: customization,
        isHost: true,
        ready: true,
        team: 0, // Team 1
      };

      const list =
        mode === "brawler"
          ? BRAWLER_LEVELS
          : mode === "build_battle"
            ? BUILD_BATTLE_LEVELS
            : INITIAL_LEVELS;
      let initialLevel = list[0];
      if (mode === "editor") {
        initialLevel = {
          id: `custom_${Date.now()}`,
          name: "Coop Level",
          start: { x: 50, y: 450 },
          width: 800, // GAME_WIDTH
          height: 600, // GAME_HEIGHT
          entities: [],
          isCustom: true,
          isBrawler: false,
          isVerified: false,
          allowedAbility: "none",
        };
      }
      const initialQueue =
        mode === "brawler"
          ? BRAWLER_LEVELS
          : mode === "build_battle"
            ? BUILD_BATTLE_LEVELS
            : mode === "editor"
              ? []
              : filterVSLevels(INITIAL_LEVELS);

      const code = await onlineService.createLobby(localPlayer, mode, {
        level: initialLevel,
        levelQueue: initialQueue,
        teamMode: brawlerTeamMode,
        hazardMode: brawlerHazardMode,
        vsCollision: gameState.collisionEnabled,
        powerups: brawlerPowerups,
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
    let activeName = playerName.trim();
    if (!activeName) {
      activeName = "CUBE_PLAYER_" + Math.floor(1000 + Math.random() * 9000);
      setPlayerName(activeName);
      setSettings((p) => ({ ...p, playerName: activeName }));
    }
    setOnlineError("Joining lobby...");
    try {
      // Determine team based on current player count if possible, or just default to 0
      // We will adjust it once the lobby update comes in
      const localPlayer: OnlinePlayer = {
        id: Math.random().toString(36).substr(2, 9),
        name: activeName,
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
      finishTimerEnabled,
      comboPowerups,
    ) => {
      // Automatic team assignment for local player if not set
      if (
        onlineService.localPlayer &&
        (onlineService.localPlayer.team === undefined ||
          onlineService.localPlayer.team === null)
      ) {
        const myIdx = players.findIndex(
          (p) => p.id === onlineService.localPlayer?.id,
        );
        if (myIdx !== -1) {
          const updatedPlayer = {
            ...onlineService.localPlayer,
            team: myIdx % 8,
          };
          onlineService.updateLocalPlayer(updatedPlayer);
        }
      }

      setOnlinePlayers([...players]);
      stateRef.current.onlinePlayersCount = players.length;
      if (suggestions) setOnlineSuggestions([...suggestions]);

      // Check if host is still present
      if (onlineService.lobbyCode && !onlineService.isHost) {
        const hostExists = players.some((p) => p.id === onlineService.hostId);
        if (!hostExists) {
          setGameState((prev) => ({ ...prev, status: "online_menu" }));
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
        setGameState((p) => ({ ...p, collisionEnabled: updatedVsCollision }));
      }

      if (updatedPowerups !== undefined && !onlineService.isHost) {
        setBrawlerPowerups(updatedPowerups as any);
      }

      if (newLevel) {
        if (mode === "editor" || stateRef.current.level?.id !== newLevel.id) {
          setLevel(newLevel);
        }
      }

      if (mode === "editor" && newLevel && !onlineService.isHost) {
        setEditorData(newLevel);
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
      if (comboPowerups !== undefined && !onlineService.isHost) {
        setBrawlerComboPowerups(comboPowerups);
      }

      setGameState((p) => {
        const updates: any = {
          finishTimerEnabled:
            finishTimerEnabled !== undefined
              ? finishTimerEnabled
              : p.finishTimerEnabled,
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

      // Clear results from previous round
      setOnlineResults([]);
      setOnlineFinishTimer(null);

      if (updatedVsCollision !== undefined) {
        setGameState((p) => ({ ...p, collisionEnabled: updatedVsCollision }));
      }

      if (gameMode === "editor" && level) {
        setEditorData(level);
        setEditorHistory(null);
        setEditorVerified(false);
      }

      setGameState((p) => ({
        ...p,
        status:
          gameMode === "editor"
            ? "editor"
            : gameMode === "brawler"
              ? "brawler_playing"
              : "vs_playing",
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
      } else if (status === "editor") {
        setGameState((p) => ({
          ...p,
          status: "editor",
        }));
      } else if (status === "testing") {
        const activeLevel =
          onlineService.currentLevel ||
          stateRef.current.editorData ||
          stateRef.current.level;
        if (activeLevel) {
          setLevel(activeLevel);
        }
        setGameState((p) => {
          return {
            ...p,
            status: activeLevel?.isBrawler ? "brawler_testing" : "testing",
            currentLevel: activeLevel,
            collectedCoins: [], // Ensure coins are wiped on start
            score: 0,
            deaths: 0,
            time: 0,
          };
        });
        setRespawnTrigger(0);
        processedCoins.current.clear();
      } else if (status === "summary") {
        setGameState((p) => ({
          ...p,
          status: "online_summary",
          previousStatus: p.status,
        }));
        setOnlineFinishTimer(null);
      } else if (status === "closed") {
        const isEditor = stateRef.current.gameState.onlineMode === "editor";
        setGameState((p) => ({
          ...p,
          status: isEditor ? "editor_type_select" : "online_menu",
        }));
        setOnlineError("Lobby was closed by host");
        onlineService.disconnect();
      } else if (status === "kicked") {
        const isEditor = stateRef.current.gameState.onlineMode === "editor";
        setGameState((p) => ({
          ...p,
          status: isEditor ? "editor_type_select" : "online_menu",
        }));
        setOnlineError(t.kickedMessage || "Du wurdest aus der Lobby gekickt.");
        onlineService.disconnect();
      }
    };
    onlineService.onDisconnect = () => {
      const isEditor = stateRef.current.gameState.onlineMode === "editor";
      setGameState((p) => ({
        ...p,
        status: isEditor ? "editor_type_select" : "online_menu",
      }));
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
        const totalPlayers = Array.from(onlineService.players.values()).length;
        const votesCast = Object.keys(onlineService.currentVote.votes).length;
        if (
          Date.now() > onlineService.currentVote.endTime ||
          (votesCast >= totalPlayers && totalPlayers > 0)
        ) {
          resolveVote();
        }
      }
    }, 250);

    onlineService.onAppEvent = (id, event, data) => {
      if (event === "start_timer") {
        setOnlineFinishTimer(data?.duration || 20);
      }
      if (event === "give_up") {
        const pName = data?.name || "Unknown";
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            text: `${pName} gave up!`,
            senderId: "system",
            senderName: "SYSTEM",
            timestamp: Date.now(),
            type: "system",
          },
        ]);
        const isBb =
          stateRef.current.gameState.status === "build_battle_playing" ||
          stateRef.current.gameState.previousStatus === "build_battle_playing";
        if (isBb) {
          setBuildBattleSurrenders((prev) => ({ ...prev, [pName]: true }));
        }
      }
      if (event === "force_end_round") {
        showToast("Host hat die Runde beendet!");
        setGameState((p) => ({
          ...p,
          status: "build_battle_won",
          winner: "NIEMAND (RUNDE BEENDET)",
        }));
      }
      if (event === "cast_vote") {
        onlineService.handleCastVote(id, data.choice);
      }
      if (event === "editor-sync" && onlineService.lobbyCode) {
        if (onlineService.isHost) {
          // Host receives change from a client, broadcasts to all
          setEditorData(data);
          setLevel(data);
          onlineService.broadcastLobbyState("editor", data);
        } else {
          // Clients receive update via onLobbyUpdate which already updates level, but if they receive it via app event instead, we can process it here.
          // Actually, the host broadcasts via broadcastLobbyState, so clients get it via onLobbyUpdate. We just need this for host receiving from clients.
        }
      }
      if (event === "request_vote") {
        if (onlineService.isHost && !onlineService.currentVote) {
          // Initialize it manually so it's synchronous
          onlineService.currentVote = {
            type: data.type,
            votes: { [id]: "yes" }, // Requester implicitly votes yes
            endTime: Date.now() + 15000,
            targetId: data.targetId,
          };
          onlineService.broadcastLobbyState(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            onlineService.currentVote,
          );
        }
      }
      if (event === "finish_stats") {
        const isPlaying =
          stateRef.current.gameState.status === "vs_playing" ||
          stateRef.current.gameState.status === "brawler_playing" ||
          stateRef.current.gameState.status === "playing";
        if (onlineService.isHost && isPlaying) {
          const prev = stateRef.current.onlineResults || [];
          const existing = prev.findIndex((r) => r.id === data.id);
          if (existing === -1) {
            const newResults = [...prev, data];
            stateRef.current.onlineResults = newResults;
            setOnlineResults(newResults);

            // Get total players from accurate count
            const roomPlayers = onlineService.players.size;
            const status = stateRef.current.gameState.status;
            const isOnlineRoom = !!onlineService.lobbyCode;
            const isMultiSession =
              isOnlineRoom ||
              status === "vs_playing" ||
              status === "brawler_playing";

            // Calculate total players expected to finish
            let totalPlayersCount = 1; // Default to 1
            if (isOnlineRoom) {
              totalPlayersCount = Math.max(2, roomPlayers); // Expect all connected players. At least 2 for online multi to prevent instantly ending if roomPlayers is somehow 1.
            } else if (
              status === "vs_playing" ||
              status === "brawler_playing"
            ) {
              totalPlayersCount = 2; // Local VS/Brawler
            }

            // Check for early finish if everyone is done
            if (newResults.length >= totalPlayersCount) {
              setOnlineFinishTimer(null);
              setTimeout(() => finalizeMatch(newResults), 0);
            } else if (
              newResults.length === 1 &&
              onlineFinishTimerRef.current === null &&
              stateRef.current.gameState.finishTimerEnabled === true &&
              isMultiSession
            ) {
              // First person finished, start grace period timer
              onlineService.sendEvent("start_timer", { duration: 20 });
              setOnlineFinishTimer(20);
            }
          }
        }
      }
      if (event === "online_results") {
        if (
          stateRef.current.gameState.status === "online_lobby" ||
          stateRef.current.gameState.status === "menu" ||
          stateRef.current.gameState.status === "online_menu"
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

  // Finalize Match directly
  const finalizeMatch = useCallback(
    (finalResults: any[]) => {
      if (
        stateRef.current.gameState.status === "online_lobby" ||
        stateRef.current.gameState.status === "menu" ||
        stateRef.current.gameState.status === "online_menu"
      ) {
        setOnlineFinishTimer(null);
        return;
      }

      if (onlineService.lobbyCode) {
        if (onlineService.isHost) {
          const currentStatus = stateRef.current.gameState.status;
          const isGameSession =
            currentStatus === "vs_playing" ||
            currentStatus === "brawler_playing" ||
            currentStatus === "playing";
          if (!isGameSession) {
            setOnlineFinishTimer(null);
            return;
          }

          const compiledResults = Array.from(
            onlineService.players.values(),
          ).map((p) => {
            const stats = finalResults.find((r) => r.id === p.id);
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
          });
          compiledResults.sort((a, b) => b.score - a.score || a.time - b.time);
          onlineService.sendEvent("online_results", {
            results: compiledResults,
          });
          onlineService.finishGame();
          setOnlineResults(compiledResults);
          setGameState((p) => ({
            ...p,
            status: "online_summary",
            previousStatus: p.status,
          }));
          setOnlineFinishTimer(null);
        }
      } else {
        // Local VS Mode Fallback
        const compiledResults = [...finalResults];
        const p1Finished = compiledResults.find((r) => r.name === "P1");
        const p2Finished = compiledResults.find((r) => r.name === "P2");
        if (!p1Finished)
          compiledResults.push({
            id: "P1",
            name: "P1",
            score: 0,
            time: 999,
            deaths: 0,
          });
        if (!p2Finished)
          compiledResults.push({
            id: "P2",
            name: "P2",
            score: 0,
            time: 999,
            deaths: 0,
          });
        compiledResults.sort((a, b) => a.time - b.time);
        setOnlineResults(compiledResults);
        setGameState((p) => ({
          ...p,
          status: "online_summary",
          previousStatus: p.status,
        }));
        setOnlineFinishTimer(null);
      }
    },
    [onlineService],
  );

  // Online Finish Timer
  useEffect(() => {
    if (onlineFinishTimer === null) return;
    if (onlineFinishTimer <= 0) {
      finalizeMatch(onlineResults);
      return;
    }

    const timer = setTimeout(() => {
      if (!onlineService.isPaused) {
        setOnlineFinishTimer((prev) => (prev !== null ? prev - 1 : null));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [onlineFinishTimer, onlineResults, finalizeMatch]);

  const calculateLevelScore = (
    timeTaken: number,
    deaths: number,
    isRun: boolean,
  ) => {
    let s = 1000;
    s -= timeTaken * 5;
    s -= deaths * 10;
    return isRun ? s : Math.max(0, s);
  };

  const handleDie = useCallback(async () => {
    if (
      gameState.status === "vs_playing" ||
      gameState.status === "brawler_playing" ||
      gameState.status === "build_battle_playing"
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
      processedCoins.current.clear();
      setRespawnTrigger((prev) => prev + 1);
      return;
    }

    const isGD = gameState.geometryDashMode;
    const coinsCollectedThisAttempt = gameState.collectedCoins.length;

    if (isGD && coinsCollectedThisAttempt > 0) {
      setCustomization((prev) => ({
        ...prev,
        coins: Math.max(0, (prev.coins || 0) - coinsCollectedThisAttempt),
      }));
    }

    setGameState((prev) => {
      const penaltyAmount = isGD ? 10 : 50;
      const baseScorePenalty =
        prev.status === "random_run" || !!prev.storyCategoryName
          ? prev.score - penaltyAmount
          : Math.max(0, prev.score - penaltyAmount);

      const sessionScore = isGD
        ? Math.max(0, baseScorePenalty - coinsCollectedThisAttempt * 500)
        : baseScorePenalty;

      return {
        ...prev,
        deaths: newTotalDeaths,
        levelDeaths: prev.levelDeaths + 1,
        // In Rage Run (GD mode), coins reappear on death. In Normal levels, they stay collected.
        collectedCoins: isGD ? [] : prev.collectedCoins,
        score: sessionScore,
      };
    });

    if (isGD) processedCoins.current.clear();

    setRespawnTrigger((prev) => prev + 1);
  }, [
    gameState.deaths,
    gameState.levelDeaths,
    gameState.status,
    gameState.collectedCoins,
    gameState.geometryDashMode,
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

  const handleJump = useCallback(() => {
    setGameState((p) => {
      p.totalJumps = (p.totalJumps || 0) + 1;
      checkAchievements({ totalJumps: p.totalJumps });
      return p;
    });
  }, [checkAchievements]);

  const handleHook = useCallback(() => {
    setGameState((p) => {
      p.hooksUsed = (p.hooksUsed || 0) + 1;
      checkAchievements({ hooksUsed: p.hooksUsed });
      return p;
    });
  }, [checkAchievements]);

  const handleWin = useCallback(
    (
      winnerName?: string,
      livesStats?: Record<string, number>,
      exactTime?: number,
      isLocal?: boolean,
      broughtCoins?: Record<string, string[]>,
      killedByBlocks?: Record<string, string>,
    ) => {
      audio.playWin();

      if (
        gameState.status === "build_battle_playing" ||
        (gameState.status === "paused" &&
          gameState.previousStatus === "build_battle_playing")
      ) {
        let p1Coins = 0;
        let p2Coins = 0;
        let p1ScoreAdded = 0;
        let p2ScoreAdded = 0;
        let p1Kills = 0;
        let p2Kills = 0;

        let winnerKey: "P1" | "P2" | null = null;
        if (
          winnerName &&
          winnerName !== "EVERYONE_FINISHED" &&
          winnerName !== "NIEMAND" &&
          winnerName !== "ZEIT_ABGELAUFEN" &&
          !winnerName.startsWith("AUFGEBEN") &&
          winnerName !== "GAVE UP"
        ) {
          const customName = customization.name || "P1";
          const isPlayer1 =
            winnerName === customName ||
            winnerName === "Player 1" ||
            winnerName === "P1" ||
            (winnerName && winnerName.toLowerCase().includes("1"));
          winnerKey = isPlayer1 ? "P1" : "P2";
        }

        if (winnerName === "EVERYONE_FINISHED") {
          p1Coins = 0;
          p2Coins = 0;
          p1ScoreAdded = 0;
          p2ScoreAdded = 0;
        } else {
          if (winnerKey) {
            if (winnerKey === "P1") p1ScoreAdded += 1;
            if (winnerKey === "P2") p2ScoreAdded += 1;
          }

          const p1CoinsBrought = broughtCoins?.["P1"] || [];
          const p2CoinsBrought = broughtCoins?.["P2"] || [];
          p1Coins = p1CoinsBrought.length;
          p2Coins = p2CoinsBrought.length;
          p1ScoreAdded += p1Coins;
          p2ScoreAdded += p2Coins;

          if (killedByBlocks) {
            if (winnerKey === "P1" && killedByBlocks["P2"] === "P1") {
              p1Kills = 1;
              p1ScoreAdded += 1;
            }
            if (winnerKey === "P2" && killedByBlocks["P1"] === "P2") {
              p2Kills = 1;
              p2ScoreAdded += 1;
            }
          }
        }

        setLastBuildBattleRoundStats({
          winner: winnerName || null,
          p1Coins,
          p2Coins,
          p1ScoreAdded,
          p2ScoreAdded,
          p1Kills,
          p2Kills,
        });

        setBuildBattleScores((prev) => ({
          P1: (prev.P1 || 0) + p1ScoreAdded,
          P2: (prev.P2 || 0) + p2ScoreAdded,
        }));

        const p1CoinsBrought = broughtCoins?.["P1"] || [];
        const p2CoinsBrought = broughtCoins?.["P2"] || [];
        const allBroughtCoinIds = [...p1CoinsBrought, ...p2CoinsBrought];
        if (allBroughtCoinIds.length > 0) {
          setBuildBattlePlacedEntities((prev) =>
            prev.filter((ent) => !allBroughtCoinIds.includes(ent.id)),
          );
        }

        if (!winnerName) {
          showToast("Alle sind gestorben! Keine Punkte.");
          setGameState((p) => ({
            ...p,
            status: "build_battle_won",
            winner: "NIEMAND",
          }));
        } else if (winnerName === "ZEIT_ABGELAUFEN") {
          showToast("Zeit abgelaufen! Keine Punkte.");
          setGameState((p) => ({
            ...p,
            status: "build_battle_won",
            winner: "NIEMAND (ZEIT ABGELAUFEN)",
          }));
        } else if (winnerName.startsWith("AUFGEBEN") || winnerName === "GAVE UP") {
          const who = winnerName === "AUFGEBEN_P1" ? "Spieler 1" : winnerName === "AUFGEBEN_P2" ? "Spieler 2" : "Ein Spieler";
          showToast(`${who} hat aufgegeben! Keine Punkte.`);
          setGameState((p) => ({
            ...p,
            status: "build_battle_won",
            winner: `NIEMAND (${who.toUpperCase()} AUFGEGEBEN)`,
          }));
        } else if (winnerName === "EVERYONE_FINISHED") {
          showToast("Zu einfach! Alle im Ziel! Keine Punkte.");
          setGameState((p) => ({
            ...p,
            status: "build_battle_won",
            winner: "NIEMAND (ZU EINFACH)",
          }));
        } else {
          let msg = `Ziel erreicht! Punkt für ${winnerName}!`;
          if (p1Coins > 0 || p2Coins > 0) {
            msg = `Rundensieg: ${winnerName}! Münzen ins Ziel gebracht: P1 (+${p1Coins}), P2 (+${p2Coins})`;
          }
          if (winnerKey === "P1" && p1Kills > 0) {
            msg += ` 💥 Bonuspunkt für Block-Kill!`;
          } else if (winnerKey === "P2" && p2Kills > 0) {
            msg += ` 💥 Bonuspunkt für Block-Kill!`;
          }
          showToast(msg);
          setGameState((p) => ({
            ...p,
            status: "build_battle_won",
            winner: winnerName,
          }));
        }
        return;
      }

      if (
        gameState.status === "testing" ||
        gameState.status === "brawler_testing"
      ) {
        if (onlineService.lobbyCode) {
          if (onlineService.isHost) {
            setEditorVerified(true);
            setGameState((p) => ({
              ...p,
              status: "editor",
              collectedCoins: [],
            }));
            onlineService.broadcastLobbyState(
              "editor",
              undefined,
              undefined,
              undefined,
              undefined,
              "editor",
            );
          } else {
            // Let host decide
          }
        } else {
          setEditorVerified(true);
          setGameState((p) => ({ ...p, status: "editor", collectedCoins: [] }));
        }
        return;
      }

      const finalTime =
        exactTime !== undefined
          ? Number(exactTime.toFixed(2))
          : gameState.levelTime;

      // Online Multiplayer OR Tournament Match
      if (
        onlineService.lobbyCode ||
        gameState.status === "vs_playing" ||
        gameState.status === "brawler_playing"
      ) {
        if (onlineService.lobbyCode) {
          // Send stats to host
          const isLocalName = onlineService.localPlayer?.name;
          // Check if local player is actually the one winning/finishing
          // winnerName can be a team or a specific player name
          const isLocalFinish = isLocal === true || winnerName === isLocalName;

          if (isLocalFinish) {
            const playerName = isLocalName || "Unknown";
            const levelPoints = calculateLevelScore(
              finalTime,
              livesStats && isLocalName
                ? livesStats[isLocalName]
                : gameState.levelDeaths,
              gameState.status === "random_run" ||
                !!gameState.storyCategoryName,
            );
            const myStats = {
              id: onlineService.localPlayer?.id,
              name: playerName,
              score:
                gameState.status === "brawler_playing"
                  ? winnerName &&
                    winnerName !== "DRAW" &&
                    winnerName !== "GAVE UP"
                    ? 1
                    : 0
                  : levelPoints,
              time: finalTime,
              deaths:
                livesStats && isLocalName
                  ? livesStats[isLocalName]
                  : gameState.levelDeaths,
            };
            onlineService.sendEvent("finish_stats", myStats);

            if (onlineService.isHost) {
              const prev = stateRef.current.onlineResults || [];
              const existing = prev.findIndex((r) => r.id === myStats.id);
              if (existing === -1) {
                const newResults = [...prev, myStats];
                stateRef.current.onlineResults = newResults;
                setOnlineResults(newResults);

                // Get total players from accurate count
                const roomPlayers = onlineService.players.size;
                const status = stateRef.current.gameState.status;
                const isOnlineRoom = !!onlineService.lobbyCode;
                const isMultiSession =
                  isOnlineRoom ||
                  status === "vs_playing" ||
                  status === "brawler_playing";

                // Calculate total players expected to finish
                let totalPlayersCount = 1; // Default to 1
                if (isOnlineRoom) {
                  totalPlayersCount = Math.max(2, roomPlayers); // Expect all connected players.
                } else if (
                  status === "vs_playing" ||
                  status === "brawler_playing"
                ) {
                  totalPlayersCount = 2; // Local VS/Brawler
                }

                if (newResults.length >= totalPlayersCount) {
                  setOnlineFinishTimer(null);
                  setTimeout(() => finalizeMatch(newResults), 0);
                } else if (
                  newResults.length === 1 &&
                  onlineFinishTimerRef.current === null &&
                  stateRef.current.gameState.finishTimerEnabled === true &&
                  isMultiSession
                ) {
                  onlineService.sendEvent("start_timer", { duration: 20 });
                  setOnlineFinishTimer(20);
                }
              }
            }
          }

          // Transition to spectating ONLY if the local player is the one who finished
          if (isLocalFinish) {
            setGameState((p) => ({
              ...p,
              winner: p.winner || winnerName,
              isSpectating: true,
            }));
          } else {
            setGameState((p) => ({
              ...p,
              winner: p.winner || winnerName,
            }));
          }

          if (winnerName === "GAVE UP") {
            // Just wait for summary
          }
          return;
        }

        // Local VS Mode Logic
        if (gameState.status === "vs_playing") {
          setGameState((p) => ({ ...p, winner: p.winner || winnerName }));

          const prev = stateRef.current.onlineResults || [];
          if (prev.find((r) => r.name === winnerName)) return;

          const deaths =
            livesStats && winnerName ? livesStats[winnerName] || 0 : 0;
          const points = calculateLevelScore(
            finalTime,
            deaths,
            gameState.status === "random_run" || !!gameState.storyCategoryName,
          );
          const newResults = [
            ...prev,
            {
              id: winnerName,
              name: winnerName,
              score: points,
              time: finalTime,
              deaths: deaths,
            },
          ];

          stateRef.current.onlineResults = newResults;
          setOnlineResults(newResults);

          if (newResults.length >= 2) {
            setOnlineFinishTimer(null);
            setTimeout(() => finalizeMatch(newResults), 0);
          } else if (
            onlineFinishTimerRef.current === null &&
            gameState.finishTimerEnabled === true
          ) {
            setOnlineFinishTimer(20);
          }
          return;
        }

        // Local Brawler Mode Logic
        const p1Team = brawlerTeamMode === "TEAMS" ? brawlerTeam1 : 0;
        const p1Name = "P1";
        const isWinner =
          winnerName === p1Name || winnerName === `TEAM ${p1Team + 1}`;

        const newWins = isWinner
          ? (gameState.onlineWins || 0) + 1
          : gameState.onlineWins || 0;

        const p2Name = "P2";
        const p2Team = brawlerTeamMode === "TEAMS" ? brawlerTeam2 : 1;
        const results = [
          {
            id: p1Name,
            name: p1Name,
            score:
              winnerName === "DRAW"
                ? 0
                : winnerName === p1Name || winnerName === `TEAM ${p1Team + 1}`
                  ? 1
                  : 0,
            time: finalTime,
            deaths: livesStats ? livesStats[p1Name] || 0 : 0,
          },
          {
            id: p2Name,
            name: p2Name,
            score:
              winnerName === "DRAW"
                ? 0
                : winnerName === p2Name || winnerName === `TEAM ${p2Team + 1}`
                  ? 1
                  : 0,
            time: finalTime,
            deaths: livesStats ? livesStats[p2Name] || 0 : 0,
          },
        ];
        results.sort((a, b) => b.score - a.score || a.time - b.time);
        setOnlineResults(results);

        setGameState((p) => ({
          ...p,
          status: "online_summary",
          previousStatus: "brawler_playing",
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

      const isRun =
        gameState.status === "random_run" || !!gameState.storyCategoryName;
      const levelBonus = calculateLevelScore(
        gameState.levelTime,
        gameState.levelDeaths,
        isRun,
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

      if (gameState.geometryDashMode) {
        try {
          const stored = localStorage.getItem("ragecube_highscores");
          const parsed = stored ? JSON.parse(stored) : {};
          const currentScore = parsed[level.id] || 0;
          if (levelBonus > currentScore) {
            parsed[level.id] = levelBonus;
            localStorage.setItem("ragecube_highscores", JSON.stringify(parsed));
          }

          // Track speed clears
          const speedClearsStored = localStorage.getItem(
            "ragecube_gd_speed_clears",
          );
          const speedClears = speedClearsStored
            ? JSON.parse(speedClearsStored)
            : {};
          if (!speedClears[level.id]) speedClears[level.id] = [];

          const speedVal = gameState.gdSpeedMode || 1;
          if (!speedClears[level.id].includes(speedVal)) {
            speedClears[level.id].push(speedVal);
            localStorage.setItem(
              "ragecube_gd_speed_clears",
              JSON.stringify(speedClears),
            );

            // Check for Mastery Achievement
            const allLevels = GD_LEVELS.map((l) => l.id);
            const master = allLevels.every((id) => {
              const clears = speedClears[id] || [];
              return (
                clears.includes(1) &&
                clears.includes(1.25) &&
                clears.includes(1.5)
              );
            });
            if (master) {
              const currentAchievements =
                secureLoad("ragecube_achievements") || [];
              if (!currentAchievements.includes("rage_master")) {
                const newAch = [...currentAchievements, "rage_master"];
                secureSave("ragecube_achievements", newAch);
                showToast(
                  lang === Language.DE
                    ? "RAGE RUN MEISTER FREIGESCHALTET!"
                    : lang === Language.ES
                      ? "¡RAGE RUN MAESTRO DESBLOQUEADO!"
                      : "RAGE RUN MASTER UNLOCKED!",
                );
              }
            }
          }
        } catch (e) {}
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
      gameState.storyCategoryName,
      checkAchievements,
      level.id,
    ],
  );

  const saveHighscore = () => {
    let saveId: string;
    let isStory = false;

    if (gameState.storyCategoryName) {
      saveId = gameState.storyCategoryName;
      isStory = true;
    } else if (
      gameState.customLevelsQueue &&
      gameState.customLevelsQueue.length > 0
    ) {
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
    secureSave("ragecube_highscores_v2", updated);

    // Redirect to the correct highscore view
    if (isStory) {
      setLevelSource("builtin");
      if (gameState.storyCategoryName) {
        const catIdx = storyCategories.findIndex(
          (c) => c.name === gameState.storyCategoryName,
        );
        setHighscoreLevelIndex(catIdx >= 0 ? catIdx + 1 : 0);
      } else {
        setHighscoreLevelIndex(0); // Full story run
      }
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

  const startStoryRun = (levels: LevelData[], categoryName: string) => {
    if (levels.length === 0) return;

    setLevel(levels[0]);
    processedCoins.current.clear();
    setGameState((prev) => ({
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
      customLevelsQueue: levels,
      storyCategoryName: categoryName,
      blocksPlaced: 0,
      totalJumps: prev.totalJumps,
      hooksUsed: prev.hooksUsed,
      unlockedAchievements: prev.unlockedAchievements,
    }));
    setRespawnTrigger(0);
  };

  const startRandomRun = () => {
    const storyLevels: LevelData[] = [
      ...INITIAL_LEVELS,
      ...ADVANCED_LEVELS,
      ...EXPERT_LEVELS,
      ...GOD_LEVELS,
      ...BRAWLER_LEVELS,
    ];
    const allAvailableLevels = [...customLevels, ...storyLevels];

    if (allAvailableLevels.length === 0) {
      showToast(t.noCustomLevels || "Keine Level verfügbar");
      return;
    }

    const shuffled = [...allAvailableLevels]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    setLevel(shuffled[0]);
    processedCoins.current.clear();
    setGameState((prev) => ({
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
      storyCategoryName: undefined,
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
  const isLastCustomLevel =
    !!gameState.customLevelsQueue &&
    gameState.currentLevelIndex >= gameState.customLevelsQueue.length - 1;

  const showHighscoreInput =
    !gameState.geometryDashMode && (isLastStoryLevel || isLastCustomLevel);

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
    let activeLevel = level;
    if (gameState.status.includes("build_battle")) {
      const extraEntities = [...buildBattlePlacedEntities];
      const itm1 = !buildBattleConfirmed.P1
        ? buildBattleItems[buildBattleSelection.P1]
        : null;
      const itm2 = !buildBattleConfirmed.P2
        ? buildBattleItems[buildBattleSelection.P2]
        : null;

      let hoveredP1Id: string | null = null;
      let hoveredP1Coords: string | null = null;
      if (itm1 && itm1.isModifier) {
        let w = itm1.args?.w || 30;
        let h = itm1.args?.h || 30;
        if (buildBattleRotation.P1 && itm1.type !== "orbit") {
          const tmp = w;
          w = h;
          h = tmp;
        }
        const px = buildBattleCursors.P1.x;
        const py = buildBattleCursors.P1.y;

        const match = buildBattlePlacedEntities.find(
          (ent) =>
            px < ent.x + ent.w &&
            px + w > ent.x &&
            py < ent.y + ent.h &&
            py + h > ent.y,
        );
        if (match) {
          hoveredP1Id = match.id || `${match.x}_${match.y}`;
        } else {
          const matchL = level.entities?.find(
            (ent) =>
              (ent.type === "wall" ||
                ent.type === "ice" ||
                ent.type === "slime" ||
                ent.type === "hazard") &&
              px < ent.x + ent.w &&
              px + w > ent.x &&
              py < ent.y + ent.h &&
              py + h > ent.y,
          );
          if (matchL) {
            hoveredP1Coords = `${matchL.x}_${matchL.y}`;
          }
        }
      }

      let hoveredP2Id: string | null = null;
      let hoveredP2Coords: string | null = null;
      if (itm2 && itm2.isModifier) {
        let w = itm2.args?.w || 30;
        let h = itm2.args?.h || 30;
        if (buildBattleRotation.P2 && itm2.type !== "orbit") {
          const tmp = w;
          w = h;
          h = tmp;
        }
        const px = buildBattleCursors.P2.x;
        const py = buildBattleCursors.P2.y;

        const match = buildBattlePlacedEntities.find(
          (ent) =>
            px < ent.x + ent.w &&
            px + w > ent.x &&
            py < ent.y + ent.h &&
            py + h > ent.y,
        );
        if (match) {
          hoveredP2Id = match.id || `${match.x}_${match.y}`;
        } else {
          const matchL = level.entities?.find(
            (ent) =>
              (ent.type === "wall" ||
                ent.type === "ice" ||
                ent.type === "slime" ||
                ent.type === "hazard") &&
              px < ent.x + ent.w &&
              px + w > ent.x &&
              py < ent.y + ent.h &&
              py + h > ent.y,
          );
          if (matchL) {
            hoveredP2Coords = `${matchL.x}_${matchL.y}`;
          }
        }
      }

      if (
        gameState.status === "build_battle_playing" &&
        buildBattlePhase === "build"
      ) {
        if (buildBattlePlacedThisRound.P1)
          extraEntities.push({
            ...buildBattlePlacedThisRound.P1,
            isBuildPreview: true,
          });
        if (buildBattlePlacedThisRound.P2)
          extraEntities.push({
            ...buildBattlePlacedThisRound.P2,
            isBuildPreview: true,
          });
        if (!buildBattleConfirmed.P1) {
          if (itm1) {
            let w = itm1.args?.w || 30;
            let h = itm1.args?.h || 30;
            if (buildBattleRotation.P1 && itm1.type !== "orbit") {
              const tmp = w;
              w = h;
              h = tmp;
            }
            let pX = buildBattleCursors.P1.x;
            let pY = buildBattleCursors.P1.y;
            if (itm1 && itm1.type === "bomb") {
              const allBlocks = [
                ...(level.entities || []),
                ...buildBattlePlacedEntities,
                ...(buildBattlePlacedThisRound.P1 ? [buildBattlePlacedThisRound.P1] : []),
                ...(buildBattlePlacedThisRound.P2 ? [buildBattlePlacedThisRound.P2] : []),
              ];
              const snap = getBombSnappedPosition(pX, pY, allBlocks);
              pX = snap.snapX;
              pY = snap.snapY;
            }
            if (itm1.type === "glue") {
              const allBlocks = [
                ...(level.entities || []),
                ...buildBattlePlacedEntities,
                ...(buildBattlePlacedThisRound.P1 ? [buildBattlePlacedThisRound.P1] : []),
                ...(buildBattlePlacedThisRound.P2 ? [buildBattlePlacedThisRound.P2] : []),
              ];
              const snap = getGlueSnappedPosition(pX, pY, w, h, allBlocks);
              pX = snap.finalX;
              pY = snap.finalY;
            } else if (itm1.type !== "bomb" && !itm1.isModifier) {
              const allBlocks = [
                ...(level.entities || []),
                ...buildBattlePlacedEntities,
                ...(buildBattlePlacedThisRound.P1 ? [buildBattlePlacedThisRound.P1] : []),
                ...(buildBattlePlacedThisRound.P2 ? [buildBattlePlacedThisRound.P2] : []),
              ];
              const snap = getBlockSnappedToGluePosition(pX, pY, w, h, allBlocks);
              if (snap.success) {
                pX = snap.finalX;
                pY = snap.finalY;
              }
            }
            extraEntities.push({
              ...itm1.args,
              x: pX,
              y: pY,
              w,
              h,
              type: itm1.type,
              isFake: true,
              isP1Cursor: true,
              isBuildPreview: true,
              ...(itm1.type === "orbit" && buildBattleRotation.P1
                ? { moveSpeed: -(itm1.args?.moveSpeed || 0.0025) }
                : {}),
            });
          }
        }
        if (!buildBattleConfirmed.P2) {
          if (itm2) {
            let w = itm2.args?.w || 30;
            let h = itm2.args?.h || 30;
            if (buildBattleRotation.P2 && itm2.type !== "orbit") {
              const tmp = w;
              w = h;
              h = tmp;
            }
            let pX = buildBattleCursors.P2.x;
            let pY = buildBattleCursors.P2.y;
            if (itm2 && itm2.type === "bomb") {
              const allBlocks = [
                ...(level.entities || []),
                ...buildBattlePlacedEntities,
                ...(buildBattlePlacedThisRound.P1 ? [buildBattlePlacedThisRound.P1] : []),
                ...(buildBattlePlacedThisRound.P2 ? [buildBattlePlacedThisRound.P2] : []),
              ];
              const snap = getBombSnappedPosition(pX, pY, allBlocks);
              pX = snap.snapX;
              pY = snap.snapY;
            }
            if (itm2.type === "glue") {
              const allBlocks = [
                ...(level.entities || []),
                ...buildBattlePlacedEntities,
                ...(buildBattlePlacedThisRound.P1 ? [buildBattlePlacedThisRound.P1] : []),
                ...(buildBattlePlacedThisRound.P2 ? [buildBattlePlacedThisRound.P2] : []),
              ];
              const snap = getGlueSnappedPosition(pX, pY, w, h, allBlocks);
              pX = snap.finalX;
              pY = snap.finalY;
            } else if (itm2.type !== "bomb" && !itm2.isModifier) {
              const allBlocks = [
                ...(level.entities || []),
                ...buildBattlePlacedEntities,
                ...(buildBattlePlacedThisRound.P1 ? [buildBattlePlacedThisRound.P1] : []),
                ...(buildBattlePlacedThisRound.P2 ? [buildBattlePlacedThisRound.P2] : []),
              ];
              const snap = getBlockSnappedToGluePosition(pX, pY, w, h, allBlocks);
              if (snap.success) {
                pX = snap.finalX;
                pY = snap.finalY;
              }
            }
            extraEntities.push({
              ...itm2.args,
              x: pX,
              y: pY,
              w,
              h,
              type: itm2.type,
              isFake: true,
              isP2Cursor: true,
              isBuildPreview: true,
              ...(itm2.type === "orbit" && buildBattleRotation.P2
                ? { moveSpeed: -(itm2.args?.moveSpeed || 0.0025) }
                : {}),
            });
          }
        }
      }

      const processedPlaced = extraEntities.map((ent) => {
        const key = ent.id || `${ent.x}_${ent.y}`;
        return {
          ...ent,
          isHoveredByModifierP1: key === hoveredP1Id,
          isHoveredByModifierP2: key === hoveredP2Id,
        };
      });

      const filteredLevelEntities = (level.entities || [])
        .filter((ent) => {
          return !processedPlaced.some(
            (override) =>
              !override.isBuildPreview &&
              ((override.id && override.id === ent.id) ||
                (override.x === ent.x &&
                  override.y === ent.y &&
                  override.w === ent.w &&
                  override.h === ent.h)),
          );
        })
        .map((ent) => {
          const key = `${ent.x}_${ent.y}`;
          return {
            ...ent,
            isHoveredByModifierP1: key === hoveredP1Coords,
            isHoveredByModifierP2: key === hoveredP2Coords,
          };
        });

      activeLevel = {
        ...level,
        entities: [...filteredLevelEntities, ...processedPlaced],
      };
    }

    if (
      !gameState.status.includes("vs") &&
      !gameState.status.includes("brawler") &&
      !gameState.status.includes("build_battle") &&
      activeLevel.isBrawler &&
      !activeLevel.entities.some((e) => e.type === "goal")
    ) {
      return {
        ...activeLevel,
        entities: [
          ...activeLevel.entities,
          {
            id: "auto_goal",
            type: "goal",
            x: activeLevel.startP2?.x || activeLevel.start.x + 100,
            y: activeLevel.startP2?.y || activeLevel.start.y,
            w: 20,
            h: 20,
          },
        ],
      };
    }
    return activeLevel;
  }, [
    level,
    gameState.status,
    buildBattlePlacedEntities,
    buildBattlePhase,
    buildBattlePlacedThisRound,
    buildBattleConfirmed,
    buildBattleCursors,
    buildBattleItems,
    buildBattleSelection,
  ]);

  return (
    <>
      <AnimatePresence>
        {!isAssetsLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white p-8 z-[100] overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rage-red/10 via-black to-black animate-pulse" />
            <div className="z-10 flex flex-col items-center">
              <h1 className="text-5xl font-arcade text-rage-red mb-12 tracking-[0.2em] drop-shadow-[0_0_20px_#ff0000] animate-bounce">
                LOADING
              </h1>
              <div className="w-80 bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800 shadow-lg">
                <motion.div
                  className="h-full bg-gradient-to-r from-rage-red to-orange-500 shadow-[0_0_15px_#ff0000]"
                  initial={{ width: 0 }}
                  animate={{ width: `${assetLoadProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="mt-6 text-[10px] font-mono text-neutral-500 tracking-[0.4em] uppercase">
                {Math.round(assetLoadProgress)}% INITIALIZED
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Online Pause Overlay */}
      {onlineService.lobbyCode && onlineService.isPaused && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-neutral-900 border-4 border-yellow-500 p-10 rounded-2xl flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
            <div className="text-6xl font-arcade text-yellow-500 tracking-widest drop-shadow-[0_0_20px_#eab308]">
              GAME PAUSED
            </div>
            <div className="text-neutral-400 font-bold uppercase tracking-[0.3em]">
              HOST HAS PAUSED THE MATCH
            </div>
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

      {/* Votekick Menu */}
      {kickMenuOpen && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-900 border-4 border-red-600 p-6 rounded-2xl flex flex-col items-center gap-4 shadow-[0_0_50px_rgba(255,0,0,0.3)] max-w-md w-full">
            <div className="text-2xl font-arcade text-red-500 text-center uppercase tracking-tighter mb-2">
              {t.kickPlayer || "VOTE KICK"}
            </div>
            <div className="w-full max-h-64 overflow-y-auto custom-scrollbar flex flex-col gap-2">
              {Array.from(onlineService.players.values())
                .filter((p) => p.id !== onlineService.localPlayer?.id)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setKickConfirmTarget(p);
                      setKickMenuOpen(false);
                    }}
                    className="w-full p-4 bg-neutral-800 hover:bg-red-900/40 border border-neutral-700 hover:border-red-500 text-left flex items-center gap-4 transition-all rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-neutral-700 p-2">
                      <CharacterPreview
                        customization={p.customization}
                        scale={1.5}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-lg leading-none">
                        {p.name}
                      </span>
                      <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-1">
                        Player ID: {p.id.slice(0, 8)}
                      </span>
                    </div>
                  </button>
                ))}
              {Array.from(onlineService.players.values()).filter(
                (p) => p.id !== onlineService.localPlayer?.id,
              ).length === 0 && (
                <div className="text-neutral-500 text-center py-10 font-bold uppercase tracking-widest border-2 border-dashed border-neutral-800 rounded-xl">
                  {t.noPlayersToKick || "NO PLAYERS TO KICK"}
                </div>
              )}
            </div>
            <button
              onClick={() => setKickMenuOpen(false)}
              className="mt-2 w-full bg-neutral-800 hover:bg-neutral-700 text-white py-3 font-arcade border-b-4 border-neutral-950 active:translate-y-1 active:border-b-0 rounded-xl transition-all"
            >
              {t.back || "BACK"}
            </button>
          </div>
        </div>
      )}

      {/* Votekick Confirmation */}
      {kickConfirmTarget && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[110] backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-900 border-4 border-red-600 p-8 rounded-2xl flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(255,0,0,0.3)] max-w-sm w-full">
            <div className="text-2xl font-arcade text-red-500 text-center uppercase tracking-tighter leading-tight">
              {t.voteKickFor?.replace(
                "{name}",
                kickConfirmTarget.name.toUpperCase(),
              ) || `KICK ${kickConfirmTarget.name.toUpperCase()}?`}
            </div>
            <div className="text-neutral-400 text-center text-xs font-bold uppercase tracking-widest bg-black/50 px-4 py-2 rounded-lg border border-white/5">
              {t.reallyStartVote || "THIS WILL START A VOTE"}
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => {
                  onlineService.initiateVote("kick", kickConfirmTarget.id);
                  setKickConfirmTarget(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 font-arcade border-b-4 border-red-900 active:translate-y-1 active:border-b-0 rounded-xl transition-all shadow-[0_4px_15px_rgba(220,38,38,0.4)]"
              >
                {t.yes || "YES"}
              </button>
              <button
                onClick={() => setKickConfirmTarget(null)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-3 font-arcade border-b-4 border-neutral-950 active:translate-y-1 active:border-b-0 rounded-xl transition-all"
              >
                {t.no || "NO"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Vote Confirmation (Restart, Skip) */}
      {voteConfirmType && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[110] backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-900 border-4 border-cyan-500 p-8 rounded-2xl flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] max-w-sm w-full">
            <div className="text-2xl font-arcade text-cyan-400 text-center uppercase tracking-tighter leading-tight">
              {voteConfirmType === "restart"
                ? "RESTART VOTE?"
                : voteConfirmType === "skip"
                  ? "SKIP VOTE?"
                  : voteConfirmType === "test_level"
                    ? "TEST LEVEL VOTE?"
                    : "START VOTE?"}
            </div>
            <div className="text-neutral-400 text-center text-[10px] font-bold uppercase tracking-widest bg-black/50 px-4 py-2 rounded-lg border border-white/5">
              {t.reallyStartVote || "THIS WILL START A VOTE"}
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => {
                  onlineService.initiateVote(voteConfirmType);
                  setVoteConfirmType(null);
                }}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 font-arcade border-b-4 border-cyan-900 active:translate-y-1 active:border-b-0 rounded-xl transition-all shadow-[0_4px_15px_rgba(6,182,212,0.4)]"
              >
                {t.yes || "YES"}
              </button>
              <button
                onClick={() => setVoteConfirmType(null)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-3 font-arcade border-b-4 border-neutral-950 active:translate-y-1 active:border-b-0 rounded-xl transition-all"
              >
                {t.no || "NO"}
              </button>
            </div>
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
              {currentVote.type === "restart" || currentVote.type === "repeat"
                ? "RESTART LEVEL?"
                : currentVote.type === "skip" || currentVote.type === "next"
                  ? "SKIP LEVEL?"
                  : currentVote.type === "kick"
                    ? `KICK ${onlineService.players.get(currentVote.targetId || "")?.name.toUpperCase() || "PLAYER"}?`
                    : "CALL A VOTE?"}
            </div>

            <div className="flex gap-4 w-full px-6 mb-4">
              <button
                onClick={() => onlineService.castVote("yes")}
                className={`flex-1 py-3 px-4 font-arcade text-sm border-b-4 rounded-xl transition-all shadow-lg flex flex-col items-center
                        ${
                          onlineService.localPlayer &&
                          currentVote.votes[onlineService.localPlayer.id] ===
                            "yes"
                            ? "bg-green-700 text-white border-green-950 scale-105 opacity-100"
                            : "bg-green-600 hover:bg-green-500 text-white/80 border-green-900 active:translate-y-1 active:border-b-0 opacity-80"
                        }`}
              >
                <span className="block mb-1">JA [1]</span>
                <span className="text-xs opacity-80 bg-black/30 px-2 py-0.5 rounded-full">
                  {
                    Object.values(currentVote.votes).filter((v) => v === "yes")
                      .length
                  }
                </span>
              </button>
              <button
                onClick={() => onlineService.castVote("no")}
                className={`flex-1 py-3 px-4 font-arcade text-sm border-b-4 rounded-xl transition-all shadow-lg flex flex-col items-center
                        ${
                          onlineService.localPlayer &&
                          currentVote.votes[onlineService.localPlayer.id] ===
                            "no"
                            ? "bg-red-700 text-white border-red-950 scale-105 opacity-100"
                            : "bg-red-600 hover:bg-red-500 text-white/80 border-red-900 active:translate-y-1 active:border-b-0 opacity-80"
                        }`}
              >
                <span className="block mb-1">NEIN [2]</span>
                <span className="text-xs opacity-80 bg-black/30 px-2 py-0.5 rounded-full">
                  {
                    Object.values(currentVote.votes).filter((v) => v === "no")
                      .length
                  }
                </span>
              </button>
            </div>

            <div className="w-full px-6">
              <div className="relative h-2 bg-neutral-800/80 rounded-full w-full overflow-hidden border border-white/5">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-100 linear"
                  style={{
                    width: `${Math.max(0, ((currentVote.endTime - Date.now()) / 15000) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-3 text-[10px] text-neutral-400 font-bold tracking-[0.2em] uppercase flex items-center gap-2">
              <span>{Object.keys(currentVote.votes).length}</span>
              <span className="opacity-30">/</span>
              <span>
                {Array.from(onlineService.players.values()).length}{" "}
                {t.players?.toUpperCase() || "PLAYERS"}
              </span>
            </div>
          </div>
        </div>
      )}

      {isTransitioning && (
        <div
          id="transition-blocker"
          className="fixed inset-0 z-[9999] pointer-events-auto bg-transparent cursor-default"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}

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
                  <div className="bg-neutral-800 text-white px-2 py-0.5 text-[10px] md:text-xs border border-neutral-700 flex flex-col items-center">
                    <div className="flex gap-1">
                      <span className="opacity-50">LEVEL:</span>
                      <span>{gameState.levelTime}s</span>
                    </div>
                    {onlineService.lobbyCode && (
                      <div
                        className={`text-[8px] font-black ${GLOBAL_LEVEL_TIME_LIMIT - gameState.levelTime < 30 ? "text-red-500 animate-pulse" : "text-neutral-500"}`}
                      >
                        LIMIT: {GLOBAL_LEVEL_TIME_LIMIT - gameState.levelTime}s
                      </div>
                    )}
                  </div>
                  {(gameState.status === "random_run" ||
                    !!gameState.storyCategoryName) && (
                    <div className="bg-rage-red/20 text-white px-2 py-0.5 text-[10px] md:text-xs border border-rage-red/50 flex flex-col items-center min-w-[60px]">
                      <div className="flex gap-1 items-center justify-center">
                        <span className="opacity-70 text-[8px] md:text-[10px] uppercase font-bold text-rage-red">
                          {t.score}:
                        </span>
                        <span className="font-bold text-rage-red">
                          {gameState.score}
                        </span>
                      </div>
                    </div>
                  )}
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
                          setVoteConfirmType("restart");
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
                          setVoteConfirmType("skip");
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
                          setKickMenuOpen(true);
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
            <div className="aspect-video h-full w-full max-w-full max-h-full bg-black shadow-[0_0_50px_rgba(255,0,68,0.2)] border-4 border-neutral-800 rounded-lg overflow-hidden relative flex flex-col items-center justify-center">
              <AnimatePresence>
                {/* Editor Type Select */}
                {gameState.status === "editor_type_select" && (
                  <motion.div
                    key="editor_type_select"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center justify-center gap-12 w-full p-8 absolute inset-0 bg-neutral-950/95 z-30 overflow-hidden"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <h2 className="text-4xl text-white font-arcade tracking-widest text-center">
                        {t.editorTypeTitle}
                      </h2>
                      <div className="h-1 w-24 bg-cyan-500 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                      {/* Normal Level Option */}
                      <button
                        onClick={() => startNewEditor(false)}
                        className="group relative bg-neutral-900/50 border-2 border-neutral-800 hover:border-cyan-500 rounded-xl p-8 flex flex-col items-center gap-6 transition-all active:scale-95 text-center overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-20 h-20 bg-neutral-800 group-hover:bg-cyan-500/20 rounded-full flex items-center justify-center text-3xl transition-colors">
                          🚩
                        </div>
                        <div>
                          <h3 className="text-xl text-white font-arcade mb-3 group-hover:text-cyan-400">
                            {t.editorTypeNormal}
                          </h3>
                          <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto">
                            {t.editorTypeNormalDesc}
                          </p>
                        </div>
                        <div className="mt-4 px-6 py-2 bg-neutral-800 group-hover:bg-cyan-600 text-neutral-400 group-hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-full transition-all">
                          Select
                        </div>
                      </button>

                      {/* Brawler Level Option */}
                      <button
                        onClick={() => startNewEditor(true)}
                        className="group relative bg-neutral-900/50 border-2 border-neutral-800 hover:border-red-500 rounded-xl p-8 flex flex-col items-center gap-6 transition-all active:scale-95 text-center overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-20 h-20 bg-neutral-800 group-hover:bg-red-500/20 rounded-full flex items-center justify-center text-3xl transition-colors">
                          ⚔️
                        </div>
                        <div>
                          <h3 className="text-xl text-white font-arcade mb-3 group-hover:text-red-400">
                            {t.editorTypeBrawler}
                          </h3>
                          <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto">
                            {t.editorTypeBrawlerDesc}
                          </p>
                        </div>
                        <div className="mt-4 px-6 py-2 bg-neutral-800 group-hover:bg-red-600 text-neutral-400 group-hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-full transition-all">
                          Select
                        </div>
                      </button>

                      {/* Coop Editor Level Option */}
                      <button
                        onClick={() => createOnlineLobby("editor")}
                        className="group relative bg-neutral-900/50 border-2 border-neutral-800 hover:border-purple-500 rounded-xl p-8 flex flex-col items-center gap-6 transition-all active:scale-95 text-center overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-20 h-20 bg-neutral-800 group-hover:bg-purple-500/20 rounded-full flex items-center justify-center text-3xl transition-colors">
                          🤝
                        </div>
                        <div>
                          <h3 className="text-xl text-white font-arcade mb-3 group-hover:text-purple-400">
                            COOP EDITOR
                          </h3>
                          <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto">
                            CREATE A LOBBY TO BUILD A LEVEL TOGETHER
                          </p>
                        </div>
                        <div className="mt-4 px-6 py-2 bg-neutral-800 group-hover:bg-purple-600 text-neutral-400 group-hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-full transition-all">
                          HOST
                        </div>
                      </button>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-full max-w-md mt-4">
                      <div className="flex w-full gap-2">
                        <input
                          type="text"
                          value={onlineLobbyInput}
                          onChange={(e) =>
                            setOnlineLobbyInput(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (onlineLobbyInput.trim()) {
                                joinOnlineLobby(onlineLobbyInput.trim());
                              }
                            }
                          }}
                          placeholder="ENTER ANY LOBBY CODE"
                          className="flex-1 bg-black border-2 border-neutral-800 text-white font-arcade p-3 text-center rounded-lg focus:border-purple-500 outline-none"
                        />
                        <button
                          onClick={() => {
                            if (onlineLobbyInput.trim()) {
                              joinOnlineLobby(onlineLobbyInput.trim());
                            }
                          }}
                          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-arcade rounded-lg border-b-4 border-purple-800 hover:border-purple-600 active:border-b-0 active:translate-y-4 transition-all"
                        >
                          JOIN
                        </button>
                      </div>
                    </div>

                    {onlineError && (
                      <div className="text-red-500 font-arcade text-[10px] md:text-xs mb-3 animate-pulse max-w-sm text-center uppercase tracking-wider">
                        {onlineError}
                      </div>
                    )}

                    <button
                      onClick={() =>
                        setGameState((p) => ({ ...p, status: "menu" }))
                      }
                      className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-neutral-400 hover:text-white font-bold uppercase tracking-[0.3em] transition-all"
                    >
                      ← {t.back}
                    </button>
                  </motion.div>
                )}

                {/* Editor Layer */}
                {gameState.status === "editor" && (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-30 bg-black/95"
                  >
                    <LevelEditor
                      onSave={handleSaveLevel}
                      onExit={() =>
                        setGameState((p) => ({ ...p, status: "menu" }))
                      }
                      onTest={(levelData, history, historyIndex) => {
                        setEditorData(levelData);
                        setEditorHistory({
                          history: history || [],
                          index: historyIndex || 0,
                        }); // Preserve History
                        setLevel(levelData);

                        if (
                          gameState.onlineMode === "editor" &&
                          onlineService.lobbyCode
                        ) {
                          if (onlineService.isHost) {
                            onlineService.broadcastLobbyState(
                              "editor",
                              levelData,
                            );
                          } else {
                            onlineService.sendEvent("editor-sync", levelData);
                          }
                          setVoteConfirmType("test_level");
                          return;
                        }

                        setRespawnTrigger(0);
                        processedCoins.current.clear(); // Reset coins for testing session
                        setGameState((p) => ({
                          ...p,
                          status: levelData.isBrawler
                            ? "brawler_testing"
                            : "testing",
                          collectedCoins: [],
                        }));
                      }}
                      lang={lang}
                      initialLevel={editorData}
                      isVerified={editorVerified}
                      initialHistory={editorHistory?.history}
                      initialHistoryIndex={editorHistory?.index}
                      showToast={showToast}
                      settings={settings}
                      onSettingsChange={setSettings}
                      externalLevelSync={
                        gameState.onlineMode === "editor"
                          ? editorData
                          : undefined
                      }
                      onLevelChange={(levelData) => {
                        if (
                          gameState.onlineMode === "editor" &&
                          onlineService.lobbyCode
                        ) {
                          if (onlineService.isHost) {
                            setEditorData(levelData);
                            setLevel(levelData);
                            onlineService.broadcastLobbyState(
                              "editor",
                              levelData,
                            );
                          } else {
                            setEditorData(levelData);
                            onlineService.sendEvent("editor-sync", levelData);
                          }
                        }
                      }}
                    />
                  </motion.div>
                )}

                {/* Custom Level Select Layer */}
                {gameState.status === "custom_level_select" && (
                  <motion.div
                    key="custom_level_select"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-30 bg-black/95"
                  >
                    <CustomLevelSelect
                      levels={sortedCustomLevels}
                      storyCategories={storyCategories}
                      onPlay={playSingleCustomLevelHook}
                      onPlayRun={startStoryRun}
                      onEdit={handleEditLevel}
                      onDelete={handleDeleteLevel}
                      onImport={handleImportLevel}
                      onBack={() =>
                        setGameState((p) => ({ ...p, status: "menu" }))
                      }
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
                  </motion.div>
                )}

                {/* Game Layer */}
                {([
                  "playing",
                  "dead",
                  "won",
                  "paused",
                  "random_run",
                  "tutorial",
                  "testing",
                  "brawler_testing",
                  "vs_playing",
                  "vs_won",
                  "brawler_playing",
                  "brawler_won",
                  "online_summary",
                  "build_battle_playing",
                  "build_battle_won",
                ].includes(gameState.status) ||
                  (gameState.status === "settings" &&
                    [
                      "playing",
                      "dead",
                      "won",
                      "paused",
                      "random_run",
                      "tutorial",
                      "testing",
                      "brawler_testing",
                      "vs_playing",
                      "vs_won",
                      "brawler_playing",
                      "brawler_won",
                      "online_summary",
                      "build_battle_playing",
                      "build_battle_won",
                    ].includes(gameState.previousStatus || ""))) && (
                  <GameCanvas
                    key="game_layer"
                    level={gamescreenLevel}
                    customization={customization}
                    customizationP2={customizationP2}
                    settings={settings}
                    gdSpeedMode={gameState.gdSpeedMode || 1}
                    onDie={handleDie}
                    onWin={handleWin}
                    onCoin={handleCoin}
                    onBlockPlace={handleBlockPlace}
                    onJump={handleJump}
                    onHook={handleHook}
                    status={gameState.status}
                    collectedCoins={gameState.collectedCoins}
                    paused={
                      gameState.status === "paused" ||
                      gameState.status === "won" ||
                      gameState.status === "vs_won" ||
                      gameState.status === "brawler_won" ||
                      gameState.status === "online_summary" ||
                      gameState.status === "build_battle_won" ||
                      (gameState.status === "build_battle_playing" &&
                        (buildBattlePhase === "select" ||
                          buildBattlePhase === "build" ||
                          buildBattlePhase === "countdown")) ||
                      onlineService.isPaused
                    }
                    respawnTrigger={respawnTrigger}
                    resetTrigger={resetTrigger}
                    suppressCountdown={
                      gameState.status === "build_battle_playing" ||
                      (gameState.status === "paused" &&
                        gameState.previousStatus === "build_battle_playing")
                    }
                    gameMode={
                      (gameState.status === "paused"
                        ? gameState.previousStatus || "playing"
                        : gameState.status
                      ).includes("vs") ||
                      (gameState.status === "paused"
                        ? gameState.previousStatus || "playing"
                        : gameState.status
                      ).includes("build_battle")
                        ? "vs"
                        : (gameState.status === "paused"
                              ? gameState.previousStatus || "playing"
                              : gameState.status
                            ).includes("brawler")
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
                    brawlerComboPowerups={brawlerComboPowerups}
                    vsCollision={gameState.collisionEnabled}
                    isOnline={!!onlineService.lobbyCode}
                    onlinePing={onlineService.ping}
                    onlinePlayers={onlinePlayers}
                    lang={lang}
                    isSpectating={gameState.isSpectating}
                    spectateTargetId={gameState.spectateTargetId}
                    opponentOpacity={settings.opponentOpacity}
                    geometryDashMode={!!gameState.geometryDashMode}
                    levelDeaths={gameState.levelDeaths}
                    buildBattleSurrenders={buildBattleSurrenders}
                  />
                )}

                {/* In-Game Quick Chat Input */}
                {showInGameChat && (
                  <div className="absolute bottom-4 left-4 z-50 animate-pop pointer-events-auto">
                    <input
                      type="text"
                      className="bg-black/90 border-2 border-cyan-500 rounded px-3 py-2 text-white font-mono text-sm w-80 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Say something... (Enter to send, Esc to cancel)"
                      value={inGameChatText}
                      onChange={(e) => setInGameChatText(e.target.value)}
                      autoFocus
                      onBlur={() => setShowInGameChat(false)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                          if (inGameChatText.trim()) {
                            onlineService.sendChatMessage(inGameChatText);
                            const newCount = (gameState.chatMessagesSent || 0) + 1;
                            setGameState((p) => ({ ...p, chatMessagesSent: newCount }));
                            checkAchievements({ chatMessagesSent: newCount });
                            setInGameChatText("");
                          }
                          setShowInGameChat(false);
                        } else if (e.key === "Escape") {
                          setInGameChatText("");
                          setShowInGameChat(false);
                        }
                      }}
                    />
                  </div>
                )}

                {/* Build Battle Interactive Overlay HUD */}
                {gameState.status === "build_battle_playing" && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-between pointer-events-none select-none pb-4">
                    {/* Top Bar Info Dashboard */}
                    <div className="w-full bg-neutral-950/95 border-b border-neutral-800 px-4 py-1.5 flex items-center justify-between backdrop-blur-md pointer-events-auto shadow-md mt-0 animate-fade-in">
                      <div className="flex items-center gap-4">
                        <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded font-arcade text-[10px] uppercase font-bold tracking-wider">
                          Runde {buildBattleRound}
                        </div>
                        <div className="text-white text-[11px] font-arcade uppercase font-black tracking-widest">
                          {buildBattlePhase === "build" ? (
                            <span className="text-yellow-400 animate-pulse">
                              🛠️ BAU-PHASE
                            </span>
                          ) : (
                            <span className="text-green-400">
                              🏃 LAUF-PHASE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score display board */}
                      <div className="flex items-center gap-4 font-arcade text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded bg-cyan-400" />
                          <span className="text-neutral-400 text-[10px] uppercase font-bold">
                            P1:
                          </span>
                          <span className="text-cyan-400 font-bold text-xs bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                            {buildBattleScores.P1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded bg-amber-400" />
                          <span className="text-neutral-400 text-[10px] uppercase font-bold">
                            P2:
                          </span>
                          <span className="text-amber-400 font-bold text-xs bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                            {buildBattleScores.P2}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Phase Timer Overlay */}
                    {buildBattlePhase === "build" && (
                      <div className="absolute top-20 right-4 bg-black/60 backdrop-blur border border-neutral-800 p-4 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-yellow-400 font-arcade text-lg tracking-wider">
                          ZEIT
                        </span>
                        <span className="text-white font-arcade text-3xl">
                          {buildBattlePhaseTimer}
                        </span>
                      </div>
                    )}

                    {buildBattlePhase === "run" && (
                      <div className="absolute top-20 right-4 bg-black/60 backdrop-blur border border-neutral-800 p-4 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-green-400 font-arcade text-lg tracking-wider">
                          ZEIT
                        </span>
                        <span className={`font-arcade text-3xl ${buildBattlePhaseTimer <= 30 ? "text-red-500 animate-pulse" : "text-white"}`}>
                          {Math.floor(buildBattlePhaseTimer / 60)}:{(buildBattlePhaseTimer % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    )}

                    {/* Intro Countdown Overlay (highest priority z-50) */}
                    {buildBattleIntroCountdown > 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                        <span className="text-[10rem] text-yellow-400 font-arcade font-black animate-pulse drop-shadow-[0_0_50px_rgba(234,179,8,1)]">
                          {buildBattleIntroCountdown}
                        </span>
                        <span className="text-white font-arcade text-xl tracking-[0.2em] uppercase mt-4">
                          {buildBattlePhase === "select"
                            ? "Bereitmachen zur Auswahl!"
                            : "Bereitmachen zum Bauen!"}
                        </span>
                      </div>
                    )}

                    {buildBattlePhase === "select" && (
                      <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center pointer-events-auto z-30">
                        {/* High-visibility Selection Timer in the foreground */}
                        <div className="flex flex-col items-center mb-6">
                          <span className="text-yellow-400 font-arcade text-xs tracking-widest uppercase mb-1">
                            {t.bbSelectTimeRemaining ||
                              "Selection Time Remaining"}
                          </span>
                          <span className="text-white font-arcade text-4xl font-black bg-neutral-900 border border-neutral-800 px-6 py-2 rounded-2xl shadow-xl min-w-[100px] text-center">
                            {buildBattlePhaseTimer}
                          </span>
                        </div>

                        <h2 className="text-3xl text-white font-arcade mb-8 tracking-wider">
                          {t.bbItemSelectTitle || "SELECT ITEM"}
                        </h2>
                        <div className="flex gap-4 mb-12 flex-wrap max-w-4xl justify-center">
                          {buildBattleItems.map((item, idx) => {
                            const isP1 = buildBattleSelection.P1 === idx;
                            const showSecret = buildBattleIntroCountdown > 0;
                            const isTakenByP1 =
                              buildBattleConfirmed.P1 &&
                              buildBattleSelection.P1 === idx;
                            const isTakenByP2 =
                              buildBattleConfirmed.P2 &&
                              buildBattleSelection.P2 === idx;
                            const isTaken = isTakenByP1 || isTakenByP2;
                            const isP2 = buildBattleSelection.P2 === idx;
                            return (
                              <div
                                key={item.id}
                                className={`w-20 h-20 bg-neutral-900 border-2 flex flex-col items-center justify-center relative rounded-lg
                                 ${
                                   isP1 && isP2
                                     ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                     : isP1
                                       ? "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                                       : isP2
                                         ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                                         : "border-neutral-700"
                                 }
                                 transition-all`}
                              >
                                <span className="text-3xl mb-1">
                                  {showSecret ? "❓" : item.icon}
                                </span>
                                <span className="text-[8px] font-arcade uppercase text-neutral-400 text-center px-1">
                                  {showSecret
                                    ? t.bbSecret || "GEHEIM"
                                    : getBbItemTranslation(item.label, lang)}
                                </span>
                                {isP1 && (
                                  <div className="absolute -top-3 -left-3 bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                                    P1 {buildBattleConfirmed.P1 ? "✓" : ""}
                                  </div>
                                )}
                                {isP2 && (
                                  <div className="absolute -bottom-3 -right-3 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                                    P2 {buildBattleConfirmed.P2 ? "✓" : ""}
                                  </div>
                                )}
                                {isTaken && !showSecret && (
                                  <div className="absolute inset-0 bg-red-950/85 flex flex-col items-center justify-center rounded-lg border border-red-500 z-10 animate-fade-in shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                    <span className="text-[10px] font-arcade text-red-400 font-bold tracking-wider">
                                      {t.bbTaken || "WEG!"}
                                    </span>
                                    <span className="text-[8px] font-arcade text-white mt-1">
                                      {(t.bbByPrefix || "BY ") +
                                        (isTakenByP1 ? "P1" : "P2")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-16 font-arcade text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                          <div className="flex flex-col items-center">
                            <div className="text-cyan-400 mb-2 font-bold text-sm">
                              {t.bbPlayer1 || "SPIELER 1"}
                            </div>
                            <div className="text-center whitespace-pre-line leading-relaxed">
                              {t.bbSelectControlsP1}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-amber-400 mb-2 font-bold text-sm">
                              {t.bbPlayer2 || "SPIELER 2"}
                            </div>
                            <div className="text-center whitespace-pre-line leading-relaxed">
                              {t.bbSelectControlsP2}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {buildBattlePhase === "build" && (
                      <div className="absolute inset-0 pointer-events-none z-30">
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-12 font-arcade text-[10px] bg-neutral-900/90 p-4 border border-neutral-800 rounded-2xl backdrop-blur">
                          <div className="flex flex-col items-center">
                            <div className="text-cyan-400 mb-2 font-bold text-sm">
                              P1:{" "}
                              {getBbItemTranslation(
                                buildBattleItems[buildBattleSelection.P1]
                                  ?.label || "",
                                lang,
                              )}
                            </div>
                            {buildBattleConfirmed.P1 ? (
                              <div className="text-green-400 font-bold">
                                {t.bbPlaced || "PLATZIERT"}
                              </div>
                            ) : (
                              <div className="text-neutral-400 text-center whitespace-pre-line leading-relaxed">
                                {t.bbControlsP1}
                              </div>
                            )}
                          </div>
                          <div className="w-px bg-neutral-800 h-12" />
                          <div className="flex flex-col items-center">
                            <div className="text-amber-400 mb-2 font-bold text-sm">
                              P2:{" "}
                              {getBbItemTranslation(
                                buildBattleItems[buildBattleSelection.P2]
                                  ?.label || "",
                                lang,
                              )}
                            </div>
                            {buildBattleConfirmed.P2 ? (
                              <div className="text-green-400 font-bold">
                                {t.bbPlaced || "PLATZIERT"}
                              </div>
                            ) : (
                              <div className="text-neutral-400 text-center whitespace-pre-line leading-relaxed">
                                {t.bbControlsP2}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {buildBattlePhase === "countdown" && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-black/50 backdrop-blur-sm">
                        <span className="text-9xl text-white font-arcade animate-ping drop-shadow-[0_0_50px_rgba(255,255,255,1)]">
                          {buildBattlePhaseTimer}
                        </span>
                      </div>
                    )}

                    {/* Run Phase HUD Controls */}
                    {buildBattlePhase === "run" && (
                      <div className="absolute top-20 left-4 pointer-events-auto animate-fade-in">
                        <button
                          onClick={() => {
                            setGameState((p) => ({
                              ...p,
                              status: "build_battle_setup",
                            }));
                          }}
                          className="bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-white px-4 py-2 rounded-xl font-arcade text-[10px] uppercase transition-all shadow-md active:translate-y-1"
                        >
                          {t.bbCancel || "ABBRECHEN"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Difficulty Select */}
                {gameState.status === "difficulty_select" && (
                  <motion.div
                    key="difficulty_select"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 overflow-y-auto py-10"
                  >
                    <h2 className="text-2xl mb-8 text-white uppercase tracking-widest">
                      {t.selectDifficulty || "SELECT DIFFICULTY"}
                    </h2>
                    <div className="w-72 flex flex-col gap-2">
                      <MenuButton
                        index={0}
                        label={`${t.beginner || "BEGINNER"} (${INITIAL_LEVELS.length})`}
                        onClick={() =>
                          startStoryRun(
                            INITIAL_LEVELS,
                            t.beginner || "BEGINNER",
                          )
                        }
                        isSelected={menuSelection === 0}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={1}
                        label={`${t.advanced || "ADVANCED"} (${ADVANCED_LEVELS.length})`}
                        onClick={() =>
                          startStoryRun(
                            ADVANCED_LEVELS,
                            t.advanced || "ADVANCED",
                          )
                        }
                        isSelected={menuSelection === 1}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={2}
                        label={`${t.expert || "EXPERT"} (${EXPERT_LEVELS.length})`}
                        onClick={() =>
                          startStoryRun(EXPERT_LEVELS, t.expert || "EXPERT")
                        }
                        isSelected={menuSelection === 2}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={3}
                        label={`${t.god || "JUMP GOD"} (${GOD_LEVELS.length})`}
                        onClick={() =>
                          startStoryRun(GOD_LEVELS, t.god || "GOD")
                        }
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
                        onClick={() =>
                          setGameState((p) => ({
                            ...p,
                            status: "settings",
                            previousStatus: "difficulty_select",
                          }))
                        }
                        className="mt-4 px-6 py-2 bg-neutral-800 text-white hover:bg-neutral-700 rounded-lg font-arcade text-[10px] transition-all border-b-4 border-neutral-900 active:translate-y-px active:border-b-0 flex items-center justify-center gap-2"
                      >
                        ⚙️ {t.settings || "SETTINGS"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Random Run Setup Screen */}
                {gameState.status === "random_run_setup" && (
                  <motion.div
                    key="random_run_setup"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30"
                  >
                    <h2 className="text-3xl mb-8 text-white uppercase">
                      {t.randomRun || "ZUFALLS-LAUF"}
                    </h2>
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
                        onClick={() =>
                          setGameState((p) => ({ ...p, status: "menu" }))
                        }
                        isSelected={menuSelection === 1}
                        onHover={setMenuSelection}
                      />
                      <button
                        onClick={() =>
                          setGameState((p) => ({
                            ...p,
                            status: "settings",
                            previousStatus: "random_run_setup",
                          }))
                        }
                        className="mt-4 px-6 py-2 bg-neutral-800 text-white hover:bg-neutral-700 rounded-lg font-arcade text-[10px] transition-all border-b-4 border-neutral-900 active:translate-y-px active:border-b-0 flex items-center justify-center gap-2"
                      >
                        ⚙️ {t.settings || "SETTINGS"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* VS Setup Screen - IMPROVED */}
                {(gameState.status === "vs_setup" ||
                  gameState.status === "brawler_setup" ||
                  gameState.status === "build_battle_setup") && (
                  <motion.div
                    key="vs_brawler_setup"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center justify-start bg-black/95 text-white z-30 overflow-y-auto py-10"
                  >
                    <h2 className="text-3xl mb-4 text-rage-red">
                      {gameState.status === "brawler_setup"
                        ? "BRAWLER MODE"
                        : gameState.status === "build_battle_setup"
                          ? "BUILD-BATTLE MODE"
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
                            label={`${t.hat || "ITEM"}: ${t.acc_names?.[customization.accessory] || customization.accessory}`}
                            onClick={() => rotateOption(1, "accessory", 1)}
                            isSelected={menuSelection === 4}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={5}
                            label={`${t.trail || "SCHWEIF"}: ${TRAIL_PRESETS.find((p) => p.val === customization.trailColor)?.name || "CUSTOM"}`}
                            onClick={() => rotateOption(1, "trail", 1)}
                            isSelected={menuSelection === 5}
                            onHover={setMenuSelection}
                          />
                          <div className="flex gap-1 w-full">
                            <button
                              onClick={() =>
                                toggleFavorite(
                                  "skin",
                                  `${customization.eyes}_${customization.accessory}`,
                                )
                              }
                              className={`flex-1 py-1 text-[8px] font-black uppercase tracking-tighter border transition-all ${
                                (settings.favoriteSkins || []).includes(
                                  `${customization.eyes}_${customization.accessory}`,
                                )
                                  ? "bg-yellow-600 border-yellow-400 text-white"
                                  : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-white"
                              }`}
                            >
                              ⭐ SKIN FAVORITE
                            </button>
                            <button
                              onClick={() =>
                                toggleFavorite(
                                  "trail",
                                  customization.trailColor,
                                )
                              }
                              className={`flex-1 py-1 text-[8px] font-black uppercase tracking-tighter border transition-all ${
                                (settings.favoriteTrails || []).includes(
                                  customization.trailColor,
                                )
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
                                onClick={() =>
                                  rotateOption(1, "brawlerClass", 1)
                                }
                                className="w-full py-1.5 bg-neutral-900 border border-neutral-700 text-white font-black uppercase text-[10px] tracking-widest mt-1 hover:bg-neutral-800 transition-colors"
                              >
                                {t.class || "CLASS"}:{" "}
                                {customization.brawlerClass?.toUpperCase() ||
                                  "FIGHTER"}
                              </button>
                            </div>
                          )}
                          {gameState.status === "brawler_setup" && (
                            <div className="w-full bg-black/40 p-2 rounded border border-white/5 mt-1 flex flex-col gap-1.5">
                              <StatBar
                                label="HP"
                                value={
                                  BRAWLER_STATS[
                                    customization.brawlerClass || "standard"
                                  ].hp
                                }
                                max={15}
                                color="bg-red-500"
                              />
                              <StatBar
                                label="SPD"
                                value={
                                  BRAWLER_STATS[
                                    customization.brawlerClass || "standard"
                                  ].speed
                                }
                                max={15}
                                color="bg-blue-500"
                              />
                              <StatBar
                                label="JMP"
                                value={
                                  BRAWLER_STATS[
                                    customization.brawlerClass || "standard"
                                  ].jump
                                }
                                max={15}
                                color="bg-green-500"
                              />
                            </div>
                          )}
                          {gameState.status === "brawler_setup" && (
                            <div className="w-full text-center flex flex-col gap-0.5 mt-1">
                              <div className="text-[7px] text-green-400 uppercase font-bold tracking-wider">
                                {
                                  t.brawlerClasses[
                                    customization.brawlerClass || "standard"
                                  ]?.pos
                                }
                              </div>
                              <div className="text-[7px] text-red-500 uppercase font-bold tracking-wider">
                                {
                                  t.brawlerClasses[
                                    customization.brawlerClass || "standard"
                                  ]?.neg
                                }
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              const randomColor =
                                "#" +
                                Math.floor(Math.random() * 16777215)
                                  .toString(16)
                                  .padStart(6, "0");
                              const eyesPool = EYE_OPTIONS.filter((opt) =>
                                isUnlocked("eyes", opt),
                              );
                              const accPool = ACC_OPTIONS.filter(
                                (opt) =>
                                  isUnlocked("accessory", opt) &&
                                  opt !== "unicorn",
                              );
                              const trailPool = TRAIL_PRESETS.filter((opt) =>
                                isUnlocked("trail", opt.val),
                              );
                              const randomEyes =
                                eyesPool[
                                  Math.floor(Math.random() * eyesPool.length)
                                ] || "normal";
                              const randomAcc =
                                accPool[
                                  Math.floor(Math.random() * accPool.length)
                                ] || "none";
                              const randomTrail =
                                trailPool[
                                  Math.floor(Math.random() * trailPool.length)
                                ]?.val || randomColor;
                              setCustomization((prev) => ({
                                ...prev,
                                color: randomColor,
                                eyes: randomEyes,
                                accessory: randomAcc,
                                trailColor: randomTrail,
                              }));
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
                            label={`${t.hat || "ITEM"}: ${t.acc_names?.[customizationP2.accessory] || customizationP2.accessory}`}
                            onClick={() => rotateOption(2, "accessory", 1)}
                            isSelected={menuSelection === 10}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={11}
                            label={`${t.trail || "SCHWEIF"}: ${TRAIL_PRESETS.find((p) => p.val === customizationP2.trailColor)?.name || "CUSTOM"}`}
                            onClick={() => rotateOption(2, "trail", 1)}
                            isSelected={menuSelection === 11}
                            onHover={setMenuSelection}
                          />
                          {gameState.status === "brawler_setup" && (
                            <div className="w-full flex justify-center">
                              <button
                                onClick={() =>
                                  rotateOption(2, "brawlerClass", 1)
                                }
                                className="w-full py-1.5 bg-neutral-900 border border-neutral-700 text-white font-black uppercase text-[10px] tracking-widest mt-1 hover:bg-neutral-800 transition-colors"
                              >
                                {t.class || "CLASS"}:{" "}
                                {customizationP2.brawlerClass?.toUpperCase() ||
                                  "FIGHTER"}
                              </button>
                            </div>
                          )}
                          {gameState.status === "brawler_setup" && (
                            <div className="w-full bg-black/40 p-2 rounded border border-white/5 mt-1 flex flex-col gap-1.5">
                              <StatBar
                                label="HP"
                                value={
                                  BRAWLER_STATS[
                                    customizationP2.brawlerClass || "standard"
                                  ].hp
                                }
                                max={15}
                                color="bg-red-500"
                              />
                              <StatBar
                                label="SPD"
                                value={
                                  BRAWLER_STATS[
                                    customizationP2.brawlerClass || "standard"
                                  ].speed
                                }
                                max={15}
                                color="bg-blue-500"
                              />
                              <StatBar
                                label="JMP"
                                value={
                                  BRAWLER_STATS[
                                    customizationP2.brawlerClass || "standard"
                                  ].jump
                                }
                                max={15}
                                color="bg-green-500"
                              />
                            </div>
                          )}
                          {gameState.status === "brawler_setup" && (
                            <div className="w-full text-center flex flex-col gap-0.5 mt-1">
                              <div className="text-[7px] text-green-400 uppercase font-bold tracking-wider">
                                {
                                  t.brawlerClasses[
                                    customizationP2.brawlerClass || "standard"
                                  ]?.pos
                                }
                              </div>
                              <div className="text-[7px] text-red-500 uppercase font-bold tracking-wider">
                                {
                                  t.brawlerClasses[
                                    customizationP2.brawlerClass || "standard"
                                  ]?.neg
                                }
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              const randomColor =
                                "#" +
                                Math.floor(Math.random() * 16777215)
                                  .toString(16)
                                  .padStart(6, "0");
                              const eyesPool = EYE_OPTIONS.filter((opt) =>
                                isUnlocked("eyes", opt),
                              );
                              const accPool = ACC_OPTIONS.filter(
                                (opt) =>
                                  isUnlocked("accessory", opt) &&
                                  opt !== "unicorn",
                              );
                              const trailPool = TRAIL_PRESETS.filter((opt) =>
                                isUnlocked("trail", opt.val),
                              );
                              const randomEyes =
                                eyesPool[
                                  Math.floor(Math.random() * eyesPool.length)
                                ] || "normal";
                              const randomAcc =
                                accPool[
                                  Math.floor(Math.random() * accPool.length)
                                ] || "none";
                              const randomTrail =
                                trailPool[
                                  Math.floor(Math.random() * trailPool.length)
                                ]?.val || randomColor;
                              setCustomizationP2((prev) => ({
                                ...prev,
                                color: randomColor,
                                eyes: randomEyes,
                                accessory: randomAcc,
                                trailColor: randomTrail,
                              }));
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
                      {gameState.status !== "build_battle_setup" && (
                        <div className="flex gap-2 w-72 mb-4">
                          <MenuButton
                            index={12}
                            label={t.levelMenu || "LEVEL MENU"}
                            onClick={() => setShowLevelMenu(true)}
                            isSelected={menuSelection === 12}
                            onHover={setMenuSelection}
                          />
                        </div>
                      )}

                      {gameState.status !== "build_battle_setup" &&
                        selectedLevels.length > 0 && (
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
                                        key={`${sl.id || ""}_${i}`}
                                        className="truncate px-1 bg-white/10 rounded"
                                      >
                                        {i + 1}. {sl.name}
                                      </div>
                                    ))}
                                    {selectedLevels.length > 4 && (
                                      <div>
                                        + {selectedLevels.length - 4} MORE
                                      </div>
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

                      {gameState.status === "build_battle_setup" && (
                        <div className="flex flex-col items-center mb-6 w-full max-w-lg">
                          <button
                            onClick={() => setBuildBattleSettingsOpen(true)}
                            className="py-2.5 px-5 rounded-xl text-[10px] tracking-wider uppercase transition-all font-arcade border flex items-center justify-center gap-2 mb-3 shadow-[0_0_15px_rgba(0,0,0,0.4)] bg-neutral-900 hover:bg-neutral-850 hover:text-yellow-500 border-neutral-800 text-neutral-300 font-bold cursor-pointer"
                          >
                            {t.bbSettingsBtn ||
                              "⚙️ REGELN & VOREINSTELLUNGEN ANPASSEN..."}
                          </button>

                          {buildBattleSettingsOpen && (
                            <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[200] flex items-center justify-center p-4">
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-5xl bg-neutral-950 border-2 border-yellow-500 rounded-3xl flex flex-col gap-4 p-6 shadow-[0_0_50px_rgba(234,179,8,0.25)] max-h-[90vh]"
                              >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                                  <div className="text-[12px] sm:text-xs font-arcade text-yellow-500 tracking-wider">
                                    {t.bbModalTitle ||
                                      "⚙️ BUILD-BATTLE REGELN & BLÖCKE"}
                                  </div>
                                  <button
                                    onClick={() =>
                                      setBuildBattleSettingsOpen(false)
                                    }
                                    className="py-1 px-3 bg-red-600 hover:bg-red-500 border border-red-700 text-white rounded-lg font-arcade text-[8px] tracking-wider transition-all cursor-pointer shadow-lg"
                                  >
                                    {t.bbClose || "SCHLIESSEN ✖"}
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left overflow-y-auto pr-1 custom-scrollbar pb-3">
                                  {/* LEFT HALF: REGEL-TUNING */}
                                  <div className="flex flex-col gap-4 bg-neutral-900 border border-neutral-800/80 p-4 rounded-2xl">
                                    <div className="text-[10px] text-yellow-500/90 font-arcade tracking-wide border-b border-neutral-800 pb-1 uppercase">
                                      {t.bbRegelTuning ||
                                        "⏱️ SPIELZEIT & PUNKTELIMIT"}
                                    </div>

                                    {/* Selection phase Timer */}
                                    <div>
                                      <div className="text-[9px] text-neutral-300 font-bold uppercase mb-1.5 tracking-wider font-arcade">
                                        {t.bbSelectPhase ||
                                          "Phase: Block-Auswahl"}
                                      </div>
                                      <div className="flex gap-1">
                                        {[5, 10, 15, 20, 30].map((tVal) => (
                                          <button
                                            key={tVal}
                                            onClick={() =>
                                              setBuildBattleSelectTimerConfig(
                                                tVal,
                                              )
                                            }
                                            className={`flex-1 py-1.5 text-[9px] font-arcade rounded border transition-all cursor-pointer ${
                                              buildBattleSelectTimerConfig ===
                                              tVal
                                                ? "bg-yellow-500 border-yellow-600 text-neutral-950 font-black shadow-lg"
                                                : "bg-black/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                                            }`}
                                          >
                                            {tVal}s
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Build phase Timer */}
                                    <div>
                                      <div className="text-[9px] text-neutral-300 font-bold uppercase mb-1.5 tracking-wider font-arcade">
                                        {t.bbBuildPhase ||
                                          "Phase: Bauen & Platzieren"}
                                      </div>
                                      <div className="flex gap-1">
                                        {[10, 20, 30, 45, 60].map((tVal) => (
                                          <button
                                            key={tVal}
                                            onClick={() =>
                                              setBuildBattleBuildTimerConfig(
                                                tVal,
                                              )
                                            }
                                            className={`flex-1 py-1.5 text-[9px] font-arcade rounded border transition-all cursor-pointer ${
                                              buildBattleBuildTimerConfig ===
                                              tVal
                                                ? "bg-yellow-500 border-yellow-600 text-neutral-950 font-black shadow-lg"
                                                : "bg-black/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                                            }`}
                                          >
                                            {tVal}s
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Max of score points */}
                                    <div>
                                      <div className="text-[9px] text-neutral-300 font-bold uppercase mb-1.5 tracking-wider font-arcade">
                                        {t.bbWinConditions ||
                                          "Siegbedingungen (Punkte)"}
                                      </div>
                                      <div className="flex gap-1">
                                        {[3, 5, 10, 999].map((pVal) => (
                                          <button
                                            key={pVal}
                                            onClick={() =>
                                              setBuildBattleTargetPointsConfig(
                                                pVal,
                                              )
                                            }
                                            className={`flex-1 py-1.5 text-[9px] font-arcade rounded border transition-all cursor-pointer ${
                                              buildBattleTargetPointsConfig ===
                                              pVal
                                                ? "bg-yellow-500 border-yellow-600 text-neutral-950 font-black shadow-lg"
                                                : "bg-black/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                                            }`}
                                          >
                                            {pVal === 999
                                              ? "∞"
                                              : `${pVal} ${t.bbPoints || "Pkt"}`}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Punkteverteilung Info Box */}
                                    <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl flex flex-col gap-1.5">
                                      <div className="text-[9px] text-amber-400 font-arcade uppercase tracking-wider flex items-center gap-1.5 font-bold">
                                        🪙 PUNKTEVERTEILUNG & REGELN
                                      </div>
                                      <div className="text-[8px] text-neutral-300 font-medium leading-relaxed flex flex-col gap-1">
                                        <p>
                                          •{" "}
                                          <strong className="text-amber-300">
                                            Rundensieg:
                                          </strong>{" "}
                                          Wer das Ziel zuerst lebend erreicht,
                                          bekommt{" "}
                                          <strong className="text-green-400 font-arcade font-bold font-mono text-[9px]">
                                            +1 Pkt
                                          </strong>
                                          .
                                        </p>
                                        <p>
                                          •{" "}
                                          <strong className="text-amber-300">
                                            Münzen Bonus:
                                          </strong>{" "}
                                          Jede eingesammelte Münze, die{" "}
                                          <strong className="text-neutral-100">
                                            lebend ins Ziel gebracht
                                          </strong>{" "}
                                          wird, gibt sofort{" "}
                                          <strong className="text-yellow-400 shadow-sm font-arcade font-bold font-mono text-[9px]">
                                            +1 Extra-Pkt
                                          </strong>
                                          !
                                        </p>
                                        <p>
                                          •{" "}
                                          <strong className="text-amber-300">
                                            Verlust auf Tod:
                                          </strong>{" "}
                                          Stirbst du bei der Jagd nach einer
                                          Münze oder sammelst sie nicht ein,
                                          bleibt sie an ihrer Stelle platziert.
                                          Münzen verschwinden nur, wenn sie ins
                                          Ziel getragen werden.
                                        </p>
                                      </div>
                                    </div>

                                    {/* Custom Presets Section */}
                                    <div className="border-t border-neutral-800/80 pt-3 mt-1">
                                      <div className="text-[9px] text-yellow-500/95 font-arcade tracking-wide uppercase mb-1.5 flex items-center justify-between">
                                        <span>
                                          {t.bbOwnPresets ||
                                            "💾 EIGENE VOREINSTELLUNGEN"}{" "}
                                          ({buildBattleCustomPresets.length}/5)
                                        </span>
                                        {buildBattleCustomPresets.length >=
                                          5 && (
                                          <span className="text-[7px] text-red-500 font-bold lowercase">
                                            ★{" "}
                                            {t.bbLimitReached ||
                                              "Limit erreicht"}
                                          </span>
                                        )}
                                      </div>

                                      {/* Save form */}
                                      <div className="flex gap-1.5 mb-3 w-full">
                                        <input
                                          type="text"
                                          placeholder={
                                            buildBattleCustomPresets.length >= 5
                                              ? t.bbPresetLimitPlaceholder ||
                                                "Limit von 5 erreicht!"
                                              : t.bbPresetPlaceholder ||
                                                "Name der Speicherung..."
                                          }
                                          value={newPresetName}
                                          onChange={(e) =>
                                            setNewPresetName(e.target.value)
                                          }
                                          maxLength={25}
                                          disabled={
                                            buildBattleCustomPresets.length >= 5
                                          }
                                          className="flex-1 min-w-0 bg-black/40 border border-neutral-800 text-[9px] font-bold py-1.5 px-2.5 rounded-lg text-white focus:outline-none focus:border-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <button
                                          onClick={() => {
                                            if (
                                              buildBattleCustomPresets.length >=
                                              5
                                            ) {
                                              showToast(
                                                t.toastMax5Reached ||
                                                  "Maximal 5 Voreinstellungen erlaubt! Bitte lösche zuerst eine.",
                                              );
                                              return;
                                            }
                                            if (!newPresetName.trim()) {
                                              showToast(
                                                t.toastEnterName ||
                                                  "Bitte gib einen Namen ein!",
                                              );
                                              return;
                                            }
                                            const isDuplicate =
                                              buildBattleCustomPresets.some(
                                                (p) =>
                                                  p.name.toLowerCase() ===
                                                  newPresetName
                                                    .trim()
                                                    .toLowerCase(),
                                              );
                                            if (isDuplicate) {
                                              showToast(
                                                t.toastNameExists ||
                                                  "Name existiert bereits!",
                                              );
                                              return;
                                            }
                                            const newPreset = {
                                              id: Date.now().toString(),
                                              name: newPresetName.trim(),
                                              selectTimer:
                                                buildBattleSelectTimerConfig,
                                              buildTimer:
                                                buildBattleBuildTimerConfig,
                                              targetPoints:
                                                buildBattleTargetPointsConfig,
                                              allowedItems: {
                                                ...buildBattleAllowedItems,
                                              },
                                            };
                                            const updated = [
                                              ...buildBattleCustomPresets,
                                              newPreset,
                                            ];
                                            setBuildBattleCustomPresets(
                                              updated,
                                            );
                                            localStorage.setItem(
                                              "build_battle_presets",
                                              JSON.stringify(updated),
                                            );
                                            setNewPresetName("");
                                            showToast(
                                              `"${newPreset.name}" ${t.toastSaved || "gespeichert!"}`,
                                            );
                                          }}
                                          className={`shrink-0 py-1.5 px-2.5 border text-neutral-950 font-arcade text-[8px] font-black rounded-lg transition-all cursor-pointer shadow ${
                                            buildBattleCustomPresets.length >= 5
                                              ? "bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed opacity-50"
                                              : "bg-yellow-500 hover:bg-yellow-400 border-yellow-600"
                                          }`}
                                        >
                                          {t.bbSave || "SPEICHERN"}
                                        </button>
                                      </div>

                                      {/* Presets List */}
                                      <div className="max-h-[140px] overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-1.5">
                                        {buildBattleCustomPresets.length ===
                                        0 ? (
                                          <div className="text-[8px] text-neutral-500 italic text-center py-2 bg-black/10 border border-dashed border-neutral-900 rounded-lg">
                                            {t.bbNoPresets ||
                                              "Keine eigenen Voreinstellungen gespeichert."}
                                          </div>
                                        ) : (
                                          buildBattleCustomPresets.map(
                                            (preset) => {
                                              const activeBlockCount =
                                                Object.values(
                                                  preset.allowedItems,
                                                ).filter(Boolean).length;
                                              return (
                                                <div
                                                  key={preset.id}
                                                  className="flex items-center justify-between p-2 bg-black/30 border border-neutral-800 rounded-lg hover:border-neutral-750 transition-all gap-2"
                                                >
                                                  <div className="flex flex-col min-w-0 flex-1">
                                                    <div className="text-[9px] font-bold text-yellow-500/90 font-arcade truncate uppercase tracking-wide">
                                                      {preset.name}
                                                    </div>
                                                    <div className="text-[7px] text-neutral-400 font-mono flex gap-1.5 mt-0.5 whitespace-nowrap overflow-x-auto min-w-0">
                                                      <span>
                                                        ⌛{" "}
                                                        {t.bbAuswahlLabel ||
                                                          "Auswahl"}
                                                        : {preset.selectTimer}s
                                                      </span>
                                                      <span className="text-neutral-700">
                                                        |
                                                      </span>
                                                      <span>
                                                        🏗️{" "}
                                                        {t.bbBauLabel || "Bau"}:{" "}
                                                        {preset.buildTimer}s
                                                      </span>
                                                      <span className="text-neutral-700">
                                                        |
                                                      </span>
                                                      <span>
                                                        🎯{" "}
                                                        {t.bbSiegeLabel ||
                                                          "Siege"}
                                                        :{" "}
                                                        {preset.targetPoints ===
                                                        999
                                                          ? "∞"
                                                          : `${preset.targetPoints} ${t.bbPoints || "Pkt"}`}
                                                      </span>
                                                      <span className="text-neutral-700">
                                                        |
                                                      </span>
                                                      <span>
                                                        🧱{" "}
                                                        {t.bbBlocksLabel ||
                                                          "Blöcke"}
                                                        : {activeBlockCount}
                                                      </span>
                                                    </div>
                                                  </div>

                                                  <div className="flex gap-1.5 shrink-0">
                                                    <button
                                                      onClick={() => {
                                                        setBuildBattleSelectTimerConfig(
                                                          preset.selectTimer,
                                                        );
                                                        setBuildBattleBuildTimerConfig(
                                                          preset.buildTimer,
                                                        );
                                                        setBuildBattleTargetPointsConfig(
                                                          preset.targetPoints,
                                                        );

                                                        // Load allowed items block pool safely
                                                        const cleanAllowed: Record<
                                                          string,
                                                          boolean
                                                        > = {};
                                                        BUILD_BATTLE_POSSIBLE_ITEMS.forEach(
                                                          (it) => {
                                                            const savedVal =
                                                              preset
                                                                .allowedItems[
                                                                it.label
                                                              ];
                                                            cleanAllowed[
                                                              it.label
                                                            ] =
                                                              savedVal !==
                                                              undefined
                                                                ? savedVal
                                                                : true;
                                                          },
                                                        );
                                                        setBuildBattleAllowedItems(
                                                          cleanAllowed,
                                                        );
                                                        showToast(
                                                          `"${preset.name}" ${t.toastLoaded || "geladen!"}`,
                                                        );
                                                      }}
                                                      className="py-1 px-2 bg-green-600 hover:bg-green-500 border border-green-700 text-white rounded font-arcade text-[7px] font-bold transition-all cursor-pointer shadow"
                                                    >
                                                      {t.bbLaden || "LADEN"}
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        const updated =
                                                          buildBattleCustomPresets.filter(
                                                            (p) =>
                                                              p.id !==
                                                              preset.id,
                                                          );
                                                        setBuildBattleCustomPresets(
                                                          updated,
                                                        );
                                                        localStorage.setItem(
                                                          "build_battle_presets",
                                                          JSON.stringify(
                                                            updated,
                                                          ),
                                                        );
                                                        showToast(
                                                          t.toastDeleted ||
                                                            "Preset gelöscht!",
                                                        );
                                                      }}
                                                      className="py-1 px-1.5 bg-red-950/40 hover:bg-red-900 border border-red-900/50 text-red-400 font-bold rounded text-[8px] transition-all cursor-pointer"
                                                      title={t.bbBtnAus || "✖"}
                                                    >
                                                      ✖
                                                    </button>
                                                  </div>
                                                </div>
                                              );
                                            },
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* RIGHT HALF: ALL BLOCK CHOICE POOL */}
                                  <div className="flex flex-col gap-4 bg-neutral-900 border border-neutral-800/80 p-4 rounded-2xl">
                                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                                      <div className="text-[10px] text-yellow-500/90 font-arcade tracking-wide uppercase">
                                        {t.bbBlockSelectionPool ||
                                          "🧱 BLOCK SELECTION POOL"}
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            const next: Record<
                                              string,
                                              boolean
                                            > = {};
                                            BUILD_BATTLE_POSSIBLE_ITEMS.forEach(
                                              (item) => {
                                                next[item.label] = true;
                                              },
                                            );
                                            setBuildBattleAllowedItems(next);
                                            showToast(
                                              t.toastAllOn ||
                                                "Alle Blöcke aktiviert!",
                                            );
                                          }}
                                          className="text-[8px] font-arcade px-2 py-0.5 bg-neutral-850 hover:bg-neutral-800 text-yellow-500 rounded border border-neutral-750 transition-all cursor-pointer"
                                        >
                                          {t.bbAlleAn || "ALLE AN"}
                                        </button>
                                        <button
                                          onClick={() => {
                                            const next: Record<
                                              string,
                                              boolean
                                            > = {};
                                            BUILD_BATTLE_POSSIBLE_ITEMS.forEach(
                                              (item, idx) => {
                                                next[item.label] = idx < 8;
                                              },
                                            );
                                            setBuildBattleAllowedItems(next);
                                            showToast(
                                              t.toastDefault ||
                                                "Standard-Pool (8 Blöcke) aktiviert!",
                                            );
                                          }}
                                          className="text-[8px] font-arcade px-2 py-0.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-455 rounded border border-neutral-750 transition-all cursor-pointer"
                                        >
                                          {t.bbStandard || "STANDARD"}
                                        </button>
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                                      {[
                                        {
                                          title:
                                            t.bbCatWalls ||
                                            "🧱 Wände & Plattformen",
                                          items:
                                            BUILD_BATTLE_POSSIBLE_ITEMS.filter(
                                              (item) =>
                                                !item.isModifier &&
                                                [
                                                  "wall",
                                                  "ice",
                                                  "slime",
                                                  "fragile",
                                                ].includes(item.type),
                                            ),
                                        },
                                        {
                                          title:
                                            t.bbCatHazards ||
                                            "⚠️ Fallen & Gefahren",
                                          items:
                                            BUILD_BATTLE_POSSIBLE_ITEMS.filter(
                                              (item) =>
                                                !item.isModifier &&
                                                ["hazard", "fan"].includes(
                                                  item.type,
                                                ),
                                            ),
                                        },
                                        {
                                          title:
                                            t.bbCatPhysics ||
                                            "🌌 Physik & Mechanik",
                                          items:
                                            BUILD_BATTLE_POSSIBLE_ITEMS.filter(
                                              (item) =>
                                                !item.isModifier &&
                                                [
                                                  "trampoline",
                                                  "moving_platform_h",
                                                  "moving_platform_v",
                                                  "gravity_reverse",
                                                  "gravity_zero",
                                                  "teleport",
                                                  "orbit",
                                                  "bomb",
                                                  "glue",
                                                ].includes(item.type),
                                            ),
                                        },
                                        {
                                          title:
                                            t.bbCatPowerups || "⚡ Power-ups",
                                          items:
                                            BUILD_BATTLE_POSSIBLE_ITEMS.filter(
                                              (item) =>
                                                !item.isModifier &&
                                                [
                                                  "powerup_double_jump",
                                                  "block_dash",
                                                ].includes(item.type),
                                            ),
                                        },
                                        {
                                          title:
                                            t.bbCatModifiers ||
                                            "🪄 Modifikatoren",
                                          items:
                                            BUILD_BATTLE_POSSIBLE_ITEMS.filter(
                                              (item) => item.isModifier,
                                            ),
                                        },
                                      ].map((cat) => (
                                        <div
                                          key={cat.title}
                                          className="bg-black/20 p-2 rounded-xl border border-neutral-800/60 flex flex-col gap-1.5"
                                        >
                                          <div className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider flex items-center justify-between px-1">
                                            <span>{cat.title}</span>
                                            <div className="flex gap-1.5">
                                              <button
                                                onClick={() => {
                                                  const next = {
                                                    ...buildBattleAllowedItems,
                                                  };
                                                  cat.items.forEach((item) => {
                                                    next[item.label] = true;
                                                  });
                                                  setBuildBattleAllowedItems(
                                                    next,
                                                  );
                                                }}
                                                className="text-[7px] text-green-500 hover:underline px-0.5 cursor-pointer font-arcade"
                                              >
                                                {t.bbBtnAlle || "ALLE"}
                                              </button>
                                              <span className="text-neutral-700">
                                                |
                                              </span>
                                              <button
                                                onClick={() => {
                                                  const next = {
                                                    ...buildBattleAllowedItems,
                                                  };
                                                  let activeCount =
                                                    Object.values(next).filter(
                                                      Boolean,
                                                    ).length;
                                                  cat.items.forEach((item) => {
                                                    if (next[item.label]) {
                                                      if (activeCount > 8) {
                                                        next[item.label] =
                                                          false;
                                                        activeCount--;
                                                      }
                                                    }
                                                  });
                                                  setBuildBattleAllowedItems(
                                                    next,
                                                  );
                                                  if (activeCount <= 8) {
                                                    showToast(
                                                      t.toastMin8Keep ||
                                                        "Mindestens 8 Blöcke müssen aktiv bleiben!",
                                                    );
                                                  }
                                                }}
                                                className="text-[7px] text-red-500 hover:underline px-0.5 cursor-pointer font-arcade"
                                              >
                                                {t.bbBtnAus || "AUS"}
                                              </button>
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-1.5">
                                            {cat.items.map((item) => {
                                              const isActive =
                                                buildBattleAllowedItems[
                                                  item.label
                                                ] !== false;
                                              return (
                                                <button
                                                  key={item.label}
                                                  onClick={() => {
                                                    setBuildBattleAllowedItems(
                                                      (prev) => {
                                                        const next = {
                                                          ...prev,
                                                          [item.label]:
                                                            !isActive,
                                                        };
                                                        const activeCount =
                                                          Object.values(
                                                            next,
                                                          ).filter(
                                                            Boolean,
                                                          ).length;
                                                        if (!isActive) {
                                                          return next;
                                                        } else {
                                                          if (activeCount < 8) {
                                                            showToast(
                                                              t.toastMin8 ||
                                                                "Mindestens 8 Blöcke müssen aktiv sein!",
                                                            );
                                                            return prev;
                                                          }
                                                          return next;
                                                        }
                                                      },
                                                    );
                                                  }}
                                                  className={`flex items-center justify-between gap-1 p-1.5 rounded border transition-all text-left cursor-pointer min-h-[34px] ${
                                                    isActive
                                                      ? "bg-green-950/40 border-green-500/30 text-green-400 font-black shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                                                      : "bg-black/30 border-neutral-800/60 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
                                                  }`}
                                                >
                                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                    <span className="text-[11px] w-4 shrink-0 text-center">
                                                      {item.icon}
                                                    </span>
                                                    <span
                                                      className={`text-[8px] sm:text-[9px] font-sans font-extrabold uppercase tracking-wide leading-tight break-words flex-1 min-w-0 ${isActive ? "text-green-400" : "text-neutral-400"}`}
                                                    >
                                                      {getBbItemTranslation(
                                                        item.label,
                                                        lang,
                                                      )}
                                                    </span>
                                                  </div>
                                                  <span className="text-[8px] shrink-0 text-right select-none ml-1">
                                                    {isActive ? "🟢" : "⚫"}
                                                  </span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-center pt-3 border-t border-neutral-800">
                                  <button
                                    onClick={() =>
                                      setBuildBattleSettingsOpen(false)
                                    }
                                    className="py-2.5 px-10 bg-yellow-500 hover:bg-yellow-400 border border-yellow-600 text-neutral-950 rounded-xl font-arcade text-[10px] font-black tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-yellow-500/20"
                                  >
                                    {t.bbSaveAndClose ||
                                      "✔ EINSTELLUNGEN SPEICHERN & SCHLIESSEN"}
                                  </button>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="w-72 flex flex-col gap-2">
                        {gameState.status === "vs_setup" && (
                          <MenuButton
                            index={13}
                            label={`${t.collisionLabel || "COLLISION"}: ${gameState.collisionEnabled ? t.onLabel || "ON" : t.offLabel || "OFF"}`}
                            onClick={() =>
                              setGameState((p) => ({
                                ...p,
                                collisionEnabled: !p.collisionEnabled,
                              }))
                            }
                            isSelected={menuSelection === 13}
                            onHover={setMenuSelection}
                          />
                        )}
                        {(gameState.status === "vs_setup" ||
                          gameState.status === "brawler_setup") && (
                          <MenuButton
                            index={14}
                            label={`${t.finishTimerLabel || "LEVEL-TIMER"}: ${gameState.finishTimerEnabled === true ? t.onLabel || "ON" : t.offLabel || "OFF"}`}
                            onClick={() =>
                              setGameState((p) => ({
                                ...p,
                                finishTimerEnabled:
                                  p.finishTimerEnabled === true ? false : true,
                              }))
                            }
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
                                  : gameState.status === "build_battle_setup"
                                    ? BUILD_BATTLE_LEVELS
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
                              const selectedLevel = currentList[idx];
                              setLevel(selectedLevel);

                              if (gameState.status === "build_battle_setup") {
                                setBuildBattleVotes({ P1: null, P2: null });
                                setBuildBattleVoteSelection({ P1: 0, P2: 1 });
                                setBuildBattleVoteTimer(null);
                                setGameState((p) => ({
                                  ...p,
                                  status: "build_battle_vote",
                                }));
                              } else {
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
                              }
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
                            setGameState((p) => ({
                              ...p,
                              status: "local_multiplayer_menu",
                            }))
                          }
                          isSelected={menuSelection === 16}
                          onHover={setMenuSelection}
                        />
                        <button
                          onClick={() =>
                            setGameState((p) => ({
                              ...p,
                              status: "settings",
                              previousStatus: gameState.status,
                            }))
                          }
                          className="mt-2 px-6 py-3 bg-neutral-800 text-white hover:bg-neutral-700 rounded-xl font-arcade text-[10px] transition-all border-b-4 border-neutral-900 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-3 w-full"
                        >
                          ⚙️ {t.settings || "SETTINGS"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Build Battle Level Selection voting container */}
                {gameState.status === "build_battle_vote" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-4 bg-neutral-950/95 overflow-y-auto"
                  >
                    <div className="w-full max-w-5xl bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md flex flex-col gap-6">
                      {/* Header */}
                      <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-arcade text-yellow-500 tracking-wider mb-2 animate-pulse">
                          {lang === "de"
                            ? "🗳️ LEVEL-ABSTIMMUNG"
                            : "🗳️ LEVEL SELECTION VOTE"}
                        </h2>
                        <p className="text-xs text-neutral-400 uppercase tracking-widest font-mono">
                          {lang === "de"
                            ? "Wähle dein Schlachtfeld für dieses Duell!"
                            : "Choose your battleground for this match!"}
                        </p>
                      </div>

                      {/* Timer Banner */}
                      {buildBattleVoteTimer !== null && (
                        <div className="w-full bg-yellow-500/10 border-2 border-yellow-500/40 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                          <span className="text-[10px] font-arcade text-yellow-500 uppercase tracking-widest">
                            {lang === "de"
                              ? "Abstimmung beendet in"
                              : "Voting finishes in"}
                          </span>
                          <span className="text-4xl font-arcade font-black text-white px-6 py-2 bg-neutral-950 rounded-xl border border-yellow-500 animate-bounce">
                            {buildBattleVoteTimer}s
                          </span>
                        </div>
                      )}

                      {/* Voting grid and controller status */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
                        {/* Player 1 Col */}
                        <div className="lg:col-span-1 bg-red-950/20 border border-red-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                              <h3 className="text-xs sm:text-sm font-arcade text-red-500 uppercase font-black">
                                PLAYER 1 (P1)
                              </h3>
                            </div>
                            <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 mb-4 flex flex-col gap-1.5 justify-between">
                              <div>
                                <span className="text-[10px] text-neutral-400 block mb-1 font-mono uppercase tracking-wider">
                                  {lang === "de"
                                    ? "Aktuelle Auswahl:"
                                    : "Current selection:"}
                                </span>
                                <span className="text-xs font-arcade text-white tracking-wide">
                                  {
                                    BUILD_BATTLE_LEVELS[
                                      buildBattleVoteSelection.P1
                                    ]?.name
                                  }
                                </span>
                              </div>
                              {BUILD_BATTLE_LEVELS[
                                buildBattleVoteSelection.P1
                              ] && (
                                <div className="w-full aspect-video bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800/80 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] relative mt-1 select-none">
                                  <LevelPreview
                                    level={
                                      BUILD_BATTLE_LEVELS[
                                        buildBattleVoteSelection.P1
                                      ]
                                    }
                                    width={180}
                                    height={100}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="mb-4">
                              <span className="text-[10px] text-neutral-500 block font-mono uppercase mb-1">
                                {lang === "de" ? "Status:" : "Status:"}
                              </span>
                              {buildBattleVotes.P1 ? (
                                <span className="inline-block py-1 px-3 bg-red-500 text-neutral-950 font-arcade text-[9px] rounded-lg tracking-wider font-extrabold uppercase animate-pulse border border-red-700">
                                  🔒 LOCKED IN!
                                </span>
                              ) : (
                                <span className="inline-block py-1 px-3 bg-neutral-800 text-neutral-400 font-arcade text-[9px] rounded-lg tracking-wider uppercase border border-neutral-700">
                                  ⏳ WÄHLT...
                                </span>
                              )}
                            </div>
                            <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/50 text-[10px] font-mono text-neutral-400 space-y-1">
                              <div className="flex justify-between border-b border-neutral-800/50 pb-1">
                                <span>W / S / A / D</span>
                                <span>
                                  {lang === "de" ? "Navigation" : "Navigate"}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-neutral-800/50 pt-1 pb-1">
                                <span>E</span>
                                <span>
                                  {lang === "de" ? "Drehen" : "Rotate"}
                                </span>
                              </div>
                              <div className="flex justify-between pt-1">
                                <span>SPACE / Q</span>
                                <span className="text-red-400 font-bold">
                                  {lang === "de"
                                    ? "Einloggen / Zurück"
                                    : "Lock / Unlock"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Map election list */}
                        <div className="lg:col-span-2 bg-neutral-950/50 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3 min-h-[300px] max-h-[420px] overflow-y-auto">
                          <div className="text-[10px] font-arcade text-neutral-400 tracking-wider mb-1 uppercase">
                            {lang === "de"
                              ? "Wähle aus 10 offiziellen Maps:"
                              : "Select from 10 official maps:"}
                          </div>
                          <div className="flex flex-col gap-2">
                            {BUILD_BATTLE_LEVELS.map((lvl, index) => {
                              const isP1Hovered =
                                buildBattleVoteSelection.P1 === index;
                              const isP2Hovered =
                                buildBattleVoteSelection.P2 === index;
                              const hasP1VotedThis =
                                buildBattleVotes.P1 === lvl.id;
                              const hasP2VotedThis =
                                buildBattleVotes.P2 === lvl.id;

                              // Calculate vote counts
                              let votesAmt = 0;
                              if (hasP1VotedThis) votesAmt++;
                              if (hasP2VotedThis) votesAmt++;

                              return (
                                <div
                                  key={lvl.id}
                                  onClick={() => {
                                    if (buildBattleVotes.P1 === lvl.id) {
                                      setBuildBattleVotes((prev) => ({
                                        ...prev,
                                        P1: null,
                                      }));
                                      audio.playDie && audio.playDie();
                                    } else {
                                      setBuildBattleVotes((prev) => ({
                                        ...prev,
                                        P1: lvl.id,
                                      }));
                                      setBuildBattleVoteSelection((p) => ({
                                        ...p,
                                        P1: index,
                                      }));
                                      audio.playCoin && audio.playCoin();
                                    }
                                  }}
                                  className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                                    hasP1VotedThis && hasP2VotedThis
                                      ? "bg-purple-950/30 border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                      : hasP1VotedThis
                                        ? "bg-red-950/30 border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                        : hasP2VotedThis
                                          ? "bg-blue-950/30 border-blue-500/70 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                          : isP1Hovered && isP2Hovered
                                            ? "bg-neutral-800/80 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                                            : isP1Hovered
                                              ? "bg-neutral-800/80 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                                              : isP2Hovered
                                                ? "bg-neutral-800/80 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                                : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                                  } relative`}
                                >
                                  {isP1Hovered && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 rounded-l-xl" />
                                  )}
                                  {isP2Hovered && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r-xl" />
                                  )}

                                  <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-arcade text-white tracking-wide flex items-center gap-2">
                                        {lvl.name}
                                        {votesAmt > 0 && (
                                          <span className="font-sans text-[10px] bg-yellow-500 text-neutral-950 font-black px-1.5 py-0.5 rounded-full">
                                            {votesAmt}{" "}
                                            {votesAmt === 1
                                              ? lang === "de"
                                                ? "Stimme"
                                                : "Vote"
                                              : lang === "de"
                                                ? "Stimmen"
                                                : "Votes"}
                                          </span>
                                        )}
                                      </span>
                                      <span className="text-[10px] text-neutral-500 font-mono tracking-tight uppercase">
                                        {lang === "de"
                                          ? "Dimensionen:"
                                          : "Dimensions:"}{" "}
                                        {lvl.width || 960}x{lvl.height || 540} ·{" "}
                                        {lvl.entities?.length || 0}{" "}
                                        {lang === "de"
                                          ? "Elemente"
                                          : "Entities"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      {hasP1VotedThis && (
                                        <span className="py-0.5 px-2 bg-red-500 border border-red-600 rounded-md font-arcade text-[8px] text-neutral-950 uppercase font-black tracking-wider animate-pulse">
                                          P1
                                        </span>
                                      )}
                                      {hasP2VotedThis && (
                                        <span className="py-0.5 px-2 bg-blue-500 border border-blue-600 rounded-md font-arcade text-[8px] text-neutral-950 uppercase font-black tracking-wider animate-pulse">
                                          P2
                                        </span>
                                      )}
                                    </div>

                                    {!hasP1VotedThis && !hasP2VotedThis && (
                                      <div className="flex gap-1">
                                        {isP1Hovered && (
                                          <span className="text-[9px] font-mono text-red-500/90 font-bold tracking-tight lowercase">
                                            P1 [Space]
                                          </span>
                                        )}
                                        {isP2Hovered && (
                                          <span className="text-[9px] font-mono text-blue-500/90 font-bold tracking-tight lowercase">
                                            P2 [Enter]
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Player 2 Col */}
                        <div className="lg:col-span-1 bg-blue-950/20 border border-blue-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-[0_0_15px_rgba(59,130,246,0.05)]">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
                              <h3 className="text-xs sm:text-sm font-arcade text-blue-400 uppercase font-black">
                                PLAYER 2 (P2)
                              </h3>
                            </div>
                            <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 mb-4 flex flex-col gap-1.5 justify-between">
                              <div>
                                <span className="text-[10px] text-neutral-400 block mb-1 font-mono uppercase tracking-wider">
                                  {lang === "de"
                                    ? "Aktuelle Auswahl:"
                                    : "Current selection:"}
                                </span>
                                <span className="text-xs font-arcade text-white tracking-wide">
                                  {
                                    BUILD_BATTLE_LEVELS[
                                      buildBattleVoteSelection.P2
                                    ]?.name
                                  }
                                </span>
                              </div>
                              {BUILD_BATTLE_LEVELS[
                                buildBattleVoteSelection.P2
                              ] && (
                                <div className="w-full aspect-video bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800/80 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] mt-1 select-none">
                                  <LevelPreview
                                    level={
                                      BUILD_BATTLE_LEVELS[
                                        buildBattleVoteSelection.P2
                                      ]
                                    }
                                    width={180}
                                    height={100}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="mb-4">
                              <span className="text-[10px] text-neutral-500 block font-mono uppercase mb-1">
                                {lang === "de" ? "Status:" : "Status:"}
                              </span>
                              {buildBattleVotes.P2 ? (
                                <span className="inline-block py-1 px-3 bg-blue-500 text-neutral-950 font-arcade text-[9px] rounded-lg tracking-wider font-extrabold uppercase animate-pulse border border-blue-700">
                                  🔒 LOCKED IN!
                                </span>
                              ) : (
                                <span className="inline-block py-1 px-3 bg-neutral-800 text-neutral-400 font-arcade text-[9px] rounded-lg tracking-wider uppercase border border-neutral-700">
                                  ⏳ WÄHLT...
                                </span>
                              )}
                            </div>
                            <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/50 text-[10px] font-mono text-neutral-400 space-y-1">
                              <div className="flex justify-between border-b border-neutral-800/50 pb-1">
                                <span>▲ / ▼ / ◀ / ▶</span>
                                <span>
                                  {lang === "de" ? "Navigation" : "Navigate"}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-neutral-800/50 pt-1 pb-1">
                                <span>CTRL / NUM0</span>
                                <span>
                                  {lang === "de" ? "Drehen" : "Rotate"}
                                </span>
                              </div>
                              <div className="flex justify-between pt-1">
                                <span>ENTER / SHIFT</span>
                                <span className="text-blue-400 font-bold">
                                  {lang === "de"
                                    ? "Einloggen / Zurück"
                                    : "Lock / Unlock"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions Row */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800 pt-5 mt-2">
                        <button
                          onClick={() => {
                            setGameState((p) => ({
                              ...p,
                              status: "build_battle_setup",
                            }));
                          }}
                          className="py-2.5 px-5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-arcade text-[10px] tracking-wider uppercase transition-all border-b-4 border-neutral-950 active:translate-y-px active:border-b-0 cursor-pointer"
                        >
                          {lang === "de" ? "◀ ZURÜCK" : "◀ BACK"}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const totalLevels = BUILD_BATTLE_LEVELS.length;
                              const p1Idx = Math.floor(
                                Math.random() * totalLevels,
                              );
                              const p2Idx = Math.floor(
                                Math.random() * totalLevels,
                              );
                              setBuildBattleVotes({
                                P1: BUILD_BATTLE_LEVELS[p1Idx].id,
                                P2: BUILD_BATTLE_LEVELS[p2Idx].id,
                              });
                              setBuildBattleVoteSelection({
                                P1: p1Idx,
                                P2: p2Idx,
                              });
                              audio.playCoin && audio.playCoin();
                            }}
                            className="py-2.5 px-5 bg-yellow-500 hover:bg-yellow-400 text-neutral-950 rounded-xl font-arcade text-[10px] tracking-wider uppercase transition-all border-b-4 border-yellow-700 active:translate-y-px active:border-b-0 cursor-pointer"
                          >
                            🎲 RANDOM VOTE
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Brawler Powerup Setup Screen */}
                {gameState.status === "brawler_powerup_setup" && (
                  <motion.div
                    key="brawler_powerup_setup"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white z-30"
                  >
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
                              if (gameState.onlineMode && !onlineService.isHost)
                                return;
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
                                  newVal,
                                );
                              }
                            }}
                            className={`w-12 h-6 flex items-center rounded-full transition-all ${brawlerSuddenDeath ? "bg-orange-600" : "bg-neutral-600"} ${gameState.onlineMode && !onlineService.isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full transition-transform ${brawlerSuddenDeath ? "translate-x-7" : "translate-x-1"}`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Combo Powerups (Fusion) Toggle */}
                      <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">
                              {lang === "de"
                                ? "KOMBI-POWERUPS (FUSION)"
                                : "COMBO POWERUPS (FUSION)"}
                            </div>
                            <div className="text-[8px] text-neutral-400 mt-1 max-w-[280px] leading-relaxed">
                              {lang === "de"
                                ? "Sammle ein Powerup, wenn du bereits eins besitzt, um ein extrem starkes fusions-basiertes Powerup zu erschaffen!"
                                : "Collect a second powerup while holding one to fuse them into an extremely powerful combo tier powerup!"}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (gameState.onlineMode && !onlineService.isHost)
                                return;
                              const newVal = !brawlerComboPowerups;
                              setBrawlerComboPowerups(newVal);
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
                                  undefined,
                                  undefined,
                                  undefined,
                                  newVal,
                                );
                              }
                            }}
                            className={`w-12 h-6 flex items-center rounded-full transition-all ${brawlerComboPowerups ? "bg-orange-600" : "bg-neutral-600"} ${gameState.onlineMode && !onlineService.isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full transition-transform ${brawlerComboPowerups ? "translate-x-7" : "translate-x-1"}`}
                            />
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
                            [
                              "none",
                              "collapsing_platforms",
                            ] as BrawlerHazardMode[]
                          ).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                if (
                                  gameState.onlineMode &&
                                  !onlineService.isHost
                                )
                                  return;
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
                                if (
                                  gameState.onlineMode &&
                                  !onlineService.isHost
                                )
                                  return;
                                const newPowerups = {
                                  ...brawlerPowerups,
                                  [key]: isOn ? 0 : 100,
                                };
                                setBrawlerPowerups(newPowerups);
                                if (
                                  gameState.onlineMode &&
                                  onlineService.isHost
                                ) {
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
                                    newPowerups,
                                  );
                                }
                              }}
                            >
                              {isOn ? t.onLabel || "ON" : t.offLabel || "OFF"}
                            </button>
                            <div className="flex-1">
                              <SliderRow
                                label={label}
                                value={brawlerPowerups[key]}
                                index={idx}
                                colorClass="bg-yellow-500"
                                onChange={(v: number) => {
                                  if (
                                    gameState.onlineMode &&
                                    !onlineService.isHost
                                  )
                                    return;
                                  const newPowerups = {
                                    ...brawlerPowerups,
                                    [key]: v,
                                  };
                                  setBrawlerPowerups(newPowerups);
                                  if (
                                    gameState.onlineMode &&
                                    onlineService.isHost
                                  ) {
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
                                      newPowerups,
                                    );
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
                            menuSelection ===
                            Object.keys(brawlerPowerups).length
                          }
                          onHover={setMenuSelection}
                        />
                      )}
                      <MenuButton
                        index={Object.keys(brawlerPowerups).length + 1}
                        label={t.back}
                        danger
                        onClick={() =>
                          setGameState((p) => ({
                            ...p,
                            status:
                              p.previousStatus === "online_lobby"
                                ? "online_lobby"
                                : "brawler_setup",
                          }))
                        }
                        isSelected={
                          menuSelection ===
                          Object.keys(brawlerPowerups).length + 1
                        }
                        onHover={setMenuSelection}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Achievements Menu */}
                {gameState.status === "achievements" && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-30"
                  >
                    <AchievementsView
                      t={t}
                      gameState={gameState}
                      onBack={() =>
                        setGameState((p) => ({ ...p, status: "menu" }))
                      }
                      ACHIEVEMENTS_LIST={ACHIEVEMENTS_LIST}
                      MenuButton={MenuButton}
                    />
                  </motion.div>
                )}

                {/* Comic Intro & Menu Transition */}
                {gameState.status === "intro" && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-50"
                  >
                    <ComicIntro
                      onComplete={() => {
                        localStorage.setItem("ragecube_intro_seen", "true");
                        setGameState((p) => ({ ...p, status: "menu" }));
                      }}
                    />
                  </motion.div>
                )}

                {gameState.status === "menu" && (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center justify-between p-8 z-30 overflow-hidden bg-neutral-950"
                  >
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
                        <button
                          id="secret-gd-mode-btn"
                          onClick={() => {
                            try {
                              audio.playSfx("secret");
                            } catch (e) {}
                            setGameState((p) => ({
                              ...p,
                              status: "geometry_dash_menu",
                            }));
                          }}
                          className="absolute -right-2 top-0 w-8 h-8 flex items-center justify-center text-xs text-yellow-500/10 hover:text-yellow-400 hover:scale-125 transition-all cursor-pointer z-50 animate-pulse"
                          title="⭐"
                        >
                          ⭐
                        </button>
                      </h1>
                    </div>

                    {/* Quick Customizer (Stone Frame) - Hidden on very small screens or repositioned */}
                    <div className="hidden lg:flex absolute left-8 bottom-8 z-20 flex-col items-center lava-btn-bg p-5 rounded-sm lava-border min-w-[220px] max-w-[240px] scale-90 origin-bottom-left transition-all hover:scale-95 duration-300">
                      <div className="text-[10px] font-black text-yellow-500 mb-6 tracking-[0.3em] uppercase drop-shadow-[0_2px_2px_#000]">
                        {t.quickCustomizer}
                      </div>

                      <div className="grid grid-cols-1 gap-3 w-full h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex flex-col gap-2 w-full">
                          <span className="text-[9px] text-red-700 font-black uppercase tracking-widest border-b border-red-900/50 pb-1">
                            {t.colorLabel}
                          </span>
                          <div className="flex gap-2 justify-center py-2">
                            {[
                              "#ff3300",
                              "#00ff88",
                              "#00ccff",
                              "#fbbf24",
                              "#ff00ff",
                            ].map((c) => (
                              <button
                                key={c}
                                onClick={() =>
                                  setCustomization((p) => ({ ...p, color: c }))
                                }
                                className={`w-8 h-8 rounded-full border-2 ${customization.color === c ? "border-white scale-125 shadow-[0_0_10px_#fff]" : "border-black/50 opacity-60 hover:opacity-100 hover:scale-110"} transition-all`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>

                          <div className="space-y-1">
                            <SliderRow
                              label="R"
                              value={hexToRgb(customization.color).r}
                              index={100}
                              colorClass="bg-red-600"
                              onChange={(v: number) =>
                                setExactRGB(1, "color", "r", v)
                              }
                              isSelected={false}
                              onHover={() => {}}
                            />
                            <SliderRow
                              label="G"
                              value={hexToRgb(customization.color).g}
                              index={101}
                              colorClass="bg-green-600"
                              onChange={(v: number) =>
                                setExactRGB(1, "color", "g", v)
                              }
                              isSelected={false}
                              onHover={() => {}}
                            />
                            <SliderRow
                              label="B"
                              value={hexToRgb(customization.color).b}
                              index={102}
                              colorClass="bg-blue-600"
                              onChange={(v: number) =>
                                setExactRGB(1, "color", "b", v)
                              }
                              isSelected={false}
                              onHover={() => {}}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-red-700 font-black uppercase tracking-widest border-b border-red-900/50 pb-1">
                            {t.eyesLabel}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => rotateOption(1, "eyes", -1)}
                              className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs"
                            >
                              ◀
                            </button>
                            <div className="flex-1 text-center">
                              <div
                                className={`text-[9px] text-white font-black uppercase drop-shadow-[0_1px_1px_#000] ${!isUnlocked("eyes", customization.eyes) ? "opacity-50 text-red-500" : ""}`}
                              >
                                {t.eye_names?.[customization.eyes] ||
                                  customization.eyes}
                                {!isUnlocked("eyes", customization.eyes) &&
                                  " 🔒"}
                              </div>
                              {!isUnlocked("eyes", customization.eyes) && (
                                <div className="text-[7px] text-red-400 font-bold uppercase leading-none mt-0.5 opacity-80">
                                  {getLockReason("eyes", customization.eyes)}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => rotateOption(1, "eyes", 1)}
                              className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs"
                            >
                              ▶
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-red-700 font-black uppercase tracking-widest border-b border-red-900/50 pb-1">
                            {t.accLabel}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => rotateOption(1, "accessory", -1)}
                              className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs"
                            >
                              ◀
                            </button>
                            <div className="flex-1 text-center">
                              <div
                                className={`text-[9px] text-white font-black uppercase drop-shadow-[0_1px_1px_#000] truncate ${!isUnlocked("accessory", customization.accessory) ? "opacity-50 text-red-500" : ""}`}
                              >
                                {t.acc_names?.[customization.accessory] ||
                                  customization.accessory}
                                {!isUnlocked(
                                  "accessory",
                                  customization.accessory,
                                ) && " 🔒"}
                              </div>
                              {!isUnlocked(
                                "accessory",
                                customization.accessory,
                              ) && (
                                <div className="text-[7px] text-red-400 font-bold uppercase leading-none mt-0.5 opacity-80">
                                  {getLockReason(
                                    "accessory",
                                    customization.accessory,
                                  )}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => rotateOption(1, "accessory", 1)}
                              className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs"
                            >
                              ▶
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-red-700 font-black uppercase tracking-widest border-b border-red-900/50 pb-1">
                            {t.trailLabel}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => rotateOption(1, "trail", -1)}
                              className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs"
                            >
                              ◀
                            </button>
                            <div className="flex-1 text-center">
                              <div
                                className={`text-[9px] text-white font-black uppercase drop-shadow-[0_1px_1px_#000] truncate ${!isUnlocked("trail", customization.trailColor) ? "opacity-50 text-red-500" : ""}`}
                              >
                                {TRAIL_PRESETS.find(
                                  (p) => p.val === customization.trailColor,
                                )?.name ||
                                  (customization.trailColor === ""
                                    ? t.offLabelShort || "OFF"
                                    : t.customLabel || "CUSTOM")}
                                {!isUnlocked(
                                  "trail",
                                  customization.trailColor,
                                ) && " 🔒"}
                              </div>
                              {!isUnlocked(
                                "trail",
                                customization.trailColor,
                              ) && (
                                <div className="text-[7px] text-red-400 font-bold uppercase leading-none mt-0.5 opacity-80">
                                  {getLockReason(
                                    "trail",
                                    customization.trailColor,
                                  )}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => rotateOption(1, "trail", 1)}
                              className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white/10 rounded-full text-white active:scale-95 text-xs"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full mt-4">
                        <button
                          onClick={() => {
                            const randomColor =
                              "#" +
                              Math.floor(Math.random() * 16777215)
                                .toString(16)
                                .padStart(6, "0");

                            const eyesPool = EYE_OPTIONS.filter((opt) =>
                              isUnlocked("eyes", opt),
                            );
                            const accPool = ACC_OPTIONS.filter(
                              (opt) =>
                                isUnlocked("accessory", opt) &&
                                opt !== "unicorn",
                            );
                            const trailPool = TRAIL_PRESETS.filter((opt) =>
                              isUnlocked("trail", opt.val),
                            );

                            const randomEyes =
                              eyesPool[
                                Math.floor(Math.random() * eyesPool.length)
                              ] || "normal";
                            const randomAcc =
                              accPool[
                                Math.floor(Math.random() * accPool.length)
                              ] || "none";
                            const randomTrail =
                              trailPool[
                                Math.floor(Math.random() * trailPool.length)
                              ]?.val || randomColor;

                            setCustomization((prev) => ({
                              ...prev,
                              color: randomColor,
                              eyes: randomEyes,
                              accessory: randomAcc,
                              trailColor: randomTrail,
                            }));
                          }}
                          className="flex-1 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[7px] text-white font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                          🎲 {t.random || "ZUFALL"}
                        </button>
                        <button
                          onClick={() =>
                            setCustomization((p) => ({
                              ...p,
                              color: DEFAULT_CUSTOMIZATION.color,
                              eyes: DEFAULT_CUSTOMIZATION.eyes,
                              accessory: DEFAULT_CUSTOMIZATION.accessory,
                              trailColor: DEFAULT_CUSTOMIZATION.trailColor,
                              deathAnim: "blood",
                              trailType: "normal",
                            }))
                          }
                          className="flex-1 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[7px] text-white font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                          🔄 RESET
                        </button>
                      </div>
                    </div>

                    {/* Center Content (Character Preview) */}
                    <div className="flex-1 w-full flex items-center justify-center pointer-events-none z-10 relative mt-2 md:mt-4 lg:-mt-8 mb-4 min-h-0">
                      <div className="w-[30vh] h-[30vh] sm:w-[40vh] sm:h-[40vh] md:w-[50vh] md:h-[50vh] lg:w-[60vh] lg:h-[60vh] aspect-square max-h-full max-w-full drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)] relative">
                        <CharacterPreview
                          customization={customization}
                          scale={16}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-end w-full max-w-6xl mt-auto pb-6 z-10 scale-[0.85] sm:scale-100 origin-bottom">
                      <div className="grid grid-cols-2 gap-x-12 gap-y-2 sm:gap-y-3 w-full max-w-3xl mb-3">
                        <div className="space-y-3">
                          <MenuButton
                            index={0}
                            label={t.start}
                            disabled={
                              !isUnlocked("eyes", customization.eyes) ||
                              !isUnlocked(
                                "accessory",
                                customization.accessory,
                              ) ||
                              !isUnlocked("trail", customization.trailColor)
                            }
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
                            disabled={
                              !isUnlocked("eyes", customization.eyes) ||
                              !isUnlocked(
                                "accessory",
                                customization.accessory,
                              ) ||
                              !isUnlocked("trail", customization.trailColor)
                            }
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
                            label={t.randomRun}
                            disabled={
                              !isUnlocked("eyes", customization.eyes) ||
                              !isUnlocked(
                                "accessory",
                                customization.accessory,
                              ) ||
                              !isUnlocked("trail", customization.trailColor)
                            }
                            onClick={() => {
                              setMenuSelection(0);
                              setGameState((p) => ({
                                ...p,
                                status: "random_run_setup",
                              }));
                            }}
                            isSelected={menuSelection === 4}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={6}
                            label={t.editor}
                            onClick={() => {
                              setGameState((p) => ({
                                ...p,
                                status: "editor_type_select",
                              }));
                            }}
                            isSelected={menuSelection === 6}
                            onHover={setMenuSelection}
                          />
                        </div>

                        <div className="space-y-3">
                          <MenuButton
                            index={1}
                            label={t.multiplayer || "MULTIPLAYER"}
                            disabled={
                              !isUnlocked("eyes", customization.eyes) ||
                              !isUnlocked(
                                "accessory",
                                customization.accessory,
                              ) ||
                              !isUnlocked("trail", customization.trailColor)
                            }
                            onClick={() => {
                              setMenuSelection(0);
                              setGameState((p) => ({
                                ...p,
                                status: "multiplayer_menu",
                              }));
                            }}
                            isSelected={menuSelection === 1}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={3}
                            label={t.highscores}
                            onClick={() => {
                              setLevelSource("builtin");
                              setHighscoreLevelIndex(0);
                              setGameState((p) => ({
                                ...p,
                                status: "highscores",
                              }));
                            }}
                            isSelected={menuSelection === 3}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={5}
                            label={t.achievements}
                            onClick={() =>
                              setGameState((p) => ({
                                ...p,
                                status: "achievements",
                              }))
                            }
                            isSelected={menuSelection === 5}
                            onHover={setMenuSelection}
                          />
                          <MenuButton
                            index={7}
                            label={t.shop || "SHOP"}
                            disabled={false}
                            onClick={() => {
                              setMenuSelection(0);
                              setGameState((p) => ({ ...p, status: "shop" }));
                            }}
                            isSelected={menuSelection === 7}
                            onHover={setMenuSelection}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-y-3 w-full max-w-3xl mb-12">
                        <MenuButton
                          index={8}
                          label={t.settings}
                          onClick={() =>
                            setGameState((p) => ({
                              ...p,
                              status: "settings",
                              previousStatus: "menu",
                            }))
                          }
                          isSelected={menuSelection === 8}
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
                  </motion.div>
                )}

                {/* Multiplayer Menu (Unified hub) */}
                {gameState.status === "multiplayer_menu" && (
                  <motion.div
                    key="multiplayer_menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/95 z-30"
                  >
                    <h1 className="text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-pink-400 to-indigo-500 font-bold font-arcade mb-8 text-center uppercase tracking-wider">
                      {t.multiplayer || "MULTIPLAYER"}
                    </h1>

                    {/* Menu Buttons selection */}
                    <div className="flex flex-col gap-3 w-full max-w-[325px]">
                      <MenuButton
                        index={0}
                        label={t.localMultiplayer || "LOKALER MULTIPLAYER"}
                        onClick={() => {
                          setMenuSelection(0);
                          setGameState((p) => ({
                            ...p,
                            status: "local_multiplayer_menu",
                          }));
                        }}
                        isSelected={menuSelection === 0}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={1}
                        label={t.onlineMultiplayer || "ONLINE MULTIPLAYER"}
                        onClick={() => {
                          setMenuSelection(1);
                          setGameState((p) => ({
                            ...p,
                            status: "online_menu",
                          }));
                        }}
                        isSelected={menuSelection === 1}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={2}
                        label={t.back || "ZURÜCK"}
                        onClick={() => {
                          setMenuSelection(1); // hover on unified "Multiplayer" button in main menu
                          setGameState((p) => ({ ...p, status: "menu" }));
                        }}
                        danger
                        isSelected={menuSelection === 2}
                        onHover={setMenuSelection}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Local Multiplayer Menu */}
                {gameState.status === "local_multiplayer_menu" && (
                  <motion.div
                    key="local_multiplayer_menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/95 z-30"
                  >
                    <h1 className="text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 font-bold font-arcade mb-8 text-center uppercase tracking-wider">
                      {t.localMultiplayer || "LOKALER MULTIPLAYER"}
                    </h1>

                    {/* Options Menu Grid */}
                    <div className="flex flex-col gap-3 w-full max-w-[325px]">
                      <MenuButton
                        index={0}
                        label={t.vsMode}
                        onClick={() => {
                          setLevelSource("builtin");
                          setHighscoreLevelIndex(0);
                          setMenuSelection(0);
                          setGameState((p) => ({ ...p, status: "vs_setup" }));
                        }}
                        isSelected={menuSelection === 0}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={1}
                        label={t.brawlerMode}
                        onClick={() => {
                          setLevelSource("builtin");
                          setHighscoreLevelIndex(0);
                          setMenuSelection(0);
                          setGameState((p) => ({
                            ...p,
                            status: "brawler_setup",
                          }));
                        }}
                        isSelected={menuSelection === 1}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={2}
                        label={t.buildBattleMode || "BUILD-BATTLE (2P)"}
                        onClick={() => {
                          setLevelSource("builtin");
                          setSelectedLevels([BUILD_BATTLE_LEVELS[0]]);
                          setLevel(BUILD_BATTLE_LEVELS[0]);
                          setHighscoreLevelIndex(0);
                          setMenuSelection(0);
                          setGameState((p) => ({
                            ...p,
                            status: "build_battle_setup",
                            onlineMode: undefined,
                          }));
                        }}
                        isSelected={menuSelection === 2}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={3}
                        label={t.back}
                        onClick={() => {
                          setMenuSelection(0); // Set hover to "Local Multiplayer"
                          setGameState((p) => ({
                            ...p,
                            status: "multiplayer_menu",
                          }));
                        }}
                        danger
                        isSelected={menuSelection === 3}
                        onHover={setMenuSelection}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Online Menu */}
                {gameState.status === "online_menu" && (
                  <motion.div
                    key="online_menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/95 z-30"
                  >
                    <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 font-bold font-arcade mb-8">
                      {t.onlineMultiplayer}
                    </h1>

                    <div className="mb-8 flex flex-col items-center gap-4">
                      <div className="w-48 h-48 bg-neutral-900 border-2 border-neutral-700 relative flex items-center justify-center">
                        <CharacterPreview
                          customization={customization}
                          scale={6}
                        />
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
                      <div className="w-48"></div>
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
                        label={
                          lang === Language.DE
                            ? "BUILD-BATTLE LOBBY ERSTELLEN"
                            : lang === Language.ES
                              ? "CREAR LOBBY BUILD-BATTLE"
                              : "CREATE BUILD-BATTLE LOBBY"
                        }
                        onClick={() => createOnlineLobby("build_battle")}
                        isSelected={menuSelection === 3}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={4}
                        label={t.joinLobby}
                        onClick={() => {
                          setShowJoinPrompt(true);
                          setOnlineError("");
                          setOnlineLobbyInput("");
                        }}
                        isSelected={menuSelection === 4}
                        onHover={setMenuSelection}
                      />
                      <MenuButton
                        index={5}
                        label={t.back}
                        onClick={() => {
                          setMenuSelection(1); // Set hover to "Online Multiplayer"
                          setGameState((p) => ({
                            ...p,
                            status: "multiplayer_menu",
                          }));
                        }}
                        danger
                        isSelected={menuSelection === 5}
                        onHover={setMenuSelection}
                      />
                      <button
                        onClick={() =>
                          setGameState((p) => ({
                            ...p,
                            status: "settings",
                            previousStatus: "online_menu",
                          }))
                        }
                        className="mt-4 px-6 py-3 bg-neutral-800 text-white hover:bg-neutral-700 rounded-xl font-arcade text-xs transition-all border-b-4 border-neutral-900 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-3 w-full"
                      >
                        ⚙️ {t.settings || "SETTINGS"}
                      </button>
                    </div>

                    {showJoinPrompt && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-40">
                        <form
                          className="bg-neutral-900 p-8 border-2 border-cyan-500 flex flex-col items-center"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (onlineLobbyInput.length === 4) {
                              setShowJoinPrompt(false);
                              joinOnlineLobby(onlineLobbyInput);
                            } else {
                              setOnlineError(
                                t.codeLengthError ||
                                  "Code must be 4 characters",
                              );
                            }
                          }}
                        >
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
                                e.preventDefault();
                                if (onlineLobbyInput.length === 4) {
                                  setShowJoinPrompt(false);
                                  joinOnlineLobby(onlineLobbyInput);
                                } else {
                                  setOnlineError(
                                    t.codeLengthError ||
                                      "Code must be 4 characters",
                                  );
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
                              type="button"
                              className="flex-1 bg-neutral-800 p-2 hover:bg-neutral-700"
                              onClick={() => setShowJoinPrompt(false)}
                            >
                              {t.cancel || "CANCEL"}
                            </button>
                            <button
                              type="submit"
                              className="flex-1 bg-cyan-600 p-2 hover:bg-cyan-500 text-white font-bold"
                            >
                              {t.join || "JOIN"}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Online Lobby Screen */}
                {gameState.status === "online_lobby" && (
                  <motion.div
                    key="online_lobby"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center p-4 md:p-8 bg-black/95 z-30 overflow-y-auto"
                  >
                    <div className="w-full max-w-4xl flex flex-col min-h-full">
                      {/* Lobby Header */}
                      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
                        <div>
                          <h2 className="text-3xl font-black text-white flex items-center gap-3">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            {onlineService.currentMode === "editor"
                              ? "COOP EDITOR"
                              : onlineService.currentMode === "vs"
                                ? t.vsTitle
                                : t.brawlerMode}
                          </h2>
                          <p className="text-neutral-500 font-bold uppercase tracking-tighter text-sm mt-1">
                            {t.lobby}:{" "}
                            <span className="text-rage-red font-arcade">
                              {onlineService.lobbyCode}
                            </span>
                          </p>
                        </div>
                        {onlineService.isHost && (
                          <div className="flex flex-wrap justify-center gap-2">
                            {onlineService.currentMode === "vs" && (
                              <button
                                onClick={() => {
                                  const newValue = !gameState.collisionEnabled;
                                  setGameState((p) => ({
                                    ...p,
                                    collisionEnabled: newValue,
                                  }));
                                  onlineService.broadcastLobbyState(
                                    undefined,
                                    undefined,
                                    undefined,
                                    undefined,
                                    undefined,
                                    undefined,
                                    undefined,
                                    newValue,
                                  );
                                }}
                                className={`px-4 py-2 rounded-lg font-arcade text-[10px] transition-all border-b-4 ${
                                  gameState.collisionEnabled
                                    ? "bg-green-600 border-green-900 text-white"
                                    : "bg-neutral-700 border-neutral-900 text-neutral-400"
                                }`}
                              >
                                {t.collisionLabel || "COLLISION"}:{" "}
                                {gameState.collisionEnabled
                                  ? t.onLabel || "ON"
                                  : t.offLabel || "OFF"}
                              </button>
                            )}
                            {onlineService.currentMode === "vs" && (
                              <button
                                onClick={() =>
                                  onlineService.toggleFinishTimer()
                                }
                                className={`px-4 py-2 rounded-lg font-arcade text-[10px] transition-all border-b-4 ${
                                  gameState.finishTimerEnabled === true
                                    ? "bg-green-600 border-green-900 text-white"
                                    : "bg-neutral-700 border-neutral-900 text-neutral-400"
                                }`}
                              >
                                {t.finishTimerLabel || "LEVEL-TIMER"}:{" "}
                                {gameState.finishTimerEnabled === true
                                  ? t.onLabel || "ON"
                                  : t.offLabel || "OFF"}
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setGameState((p) => ({
                                  ...p,
                                  status: "settings",
                                  previousStatus: "online_lobby",
                                }))
                              }
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
                                onClick={() =>
                                  setGameState((p) => ({
                                    ...p,
                                    status: "brawler_powerup_setup",
                                    previousStatus: "online_lobby",
                                  }))
                                }
                                className="px-6 py-2 bg-orange-600 text-white hover:bg-orange-500 rounded-lg font-arcade text-[10px] transition-all border-b-4 border-orange-900 active:translate-y-1 active:border-b-0"
                              >
                                {t.brawlerSettings || "POWERUPS"}
                              </button>
                            )}
                          </div>
                        )}

                        {!onlineService.isHost && (
                          <div className="flex flex-wrap justify-center gap-2"></div>
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
                              const isLocal =
                                p.id === onlineService.localPlayer?.id;
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
                                  key={`${p.id || ""}_${idx}`}
                                  className="flex flex-col items-center bg-neutral-900 p-4 border-2 border-neutral-700 rounded-lg w-40 relative group"
                                >
                                  <div
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white/20"
                                    style={{
                                      backgroundColor:
                                        teamColors[(p.team || 0) % 8],
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
                                    {p.name}{" "}
                                    {p.isHost ? `(${t.host || "HOST"})` : ""}
                                  </div>

                                  {onlineService.isHost && !p.isHost && (
                                    <button
                                      onClick={() =>
                                        onlineService.kickPlayer(p.id)
                                      }
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
                                            const newTeam = parseInt(
                                              e.target.value,
                                            );
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
                                    {p.ready
                                      ? t.ready || "READY"
                                      : t.notReady || "NOT READY"}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {true && (
                            <div className="w-full max-w-lg border-t border-neutral-700 pt-4 flex flex-col items-center mb-4">
                              <div className="text-[10px] text-neutral-400 font-bold mb-2 uppercase tracking-widest">
                                {t.selectedLevels || "Selected Level(s)"}
                              </div>

                              {/* Suggestions notification for Host */}
                              {onlineService.isHost &&
                                onlineSuggestions.length > 0 && (
                                  <div className="w-full bg-blue-900/30 border border-blue-500/50 rounded-lg p-2 mb-4 animate-pulse">
                                    <div className="flex justify-between items-center text-[10px] text-blue-400 font-black uppercase mb-2">
                                      <span>
                                        {
                                          onlineSuggestions.filter(
                                            (s) => s.status === "pending",
                                          ).length
                                        }{" "}
                                        NEUE VORSCHLÄGE
                                      </span>
                                      <button
                                        onClick={() =>
                                          onlineService.clearSuggestions()
                                        }
                                        className="text-neutral-500 hover:text-white"
                                      >
                                        CLEAR
                                      </button>
                                    </div>
                                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                                      {onlineSuggestions.map((s, idx) => (
                                        <div
                                          key={`${s.id}_${idx}`}
                                          className="flex items-center justify-between bg-black/40 p-2 rounded border border-white/5"
                                        >
                                          <div className="flex flex-col min-w-0">
                                            <span className="text-white text-xs font-bold truncate">
                                              {s.level.name}
                                            </span>
                                            <span className="text-[8px] text-neutral-500 uppercase">
                                              VON {s.playerName}
                                            </span>
                                          </div>
                                          <div className="flex gap-2 shrink-0">
                                            {s.status === "pending" ? (
                                              <>
                                                <button
                                                  onClick={() =>
                                                    onlineService.handleSuggestion(
                                                      s.id,
                                                      "accept",
                                                    )
                                                  }
                                                  className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white hover:bg-green-500"
                                                >
                                                  ✓
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    onlineService.handleSuggestion(
                                                      s.id,
                                                      "decline",
                                                    )
                                                  }
                                                  className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white hover:bg-red-500"
                                                >
                                                  ✕
                                                </button>
                                              </>
                                            ) : (
                                              <span
                                                className={`text-[8px] font-black ${s.status === "accepted" ? "text-green-500" : "text-red-500"}`}
                                              >
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
                                    onClick={() =>
                                      setShowSuggestionMenu(!showSuggestionMenu)
                                    }
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-arcade text-[10px] border-b-4 border-blue-900 active:translate-y-1 active:border-b-0"
                                  >
                                    {t.suggestLevel || "LEVEL VORSCHLAGEN"} (
                                    {
                                      onlineSuggestions.filter(
                                        (s) =>
                                          s.playerId ===
                                          onlineService.localPlayer?.id,
                                      ).length
                                    }
                                    /5)
                                  </button>

                                  {showSuggestionMenu && (
                                    <div className="mt-2 p-4 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl">
                                      <div className="text-white font-bold mb-4 text-center">
                                        {t.yourLevels || "DEINE LEVEL"}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                        {customLevels
                                          .filter((l) => l.isVerified)
                                          .map((l, idx) => (
                                            <button
                                              key={`${l.id}_${idx}`}
                                              onClick={() => {
                                                onlineService.suggestLevel(l);
                                                setShowSuggestionMenu(false);
                                              }}
                                              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-600 text-left text-xs text-white truncate"
                                            >
                                              {l.name}
                                            </button>
                                          ))}
                                        {customLevels.filter(
                                          (l) => l.isVerified,
                                        ).length === 0 && (
                                          <div className="col-span-2 text-center text-neutral-500 py-4 text-[10px]">
                                            Keine veröffentlichten Level
                                            gefunden.
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {onlineSuggestions.filter(
                                    (s) =>
                                      s.playerId ===
                                      onlineService.localPlayer?.id,
                                  ).length > 0 && (
                                    <div className="mt-2 text-[8px] text-neutral-500 font-bold uppercase text-center">
                                      DEINE VORSCHLÄGE:{" "}
                                      {onlineSuggestions
                                        .filter(
                                          (s) =>
                                            s.playerId ===
                                            onlineService.localPlayer?.id,
                                        )
                                        .map((s, idx) => (
                                          <span
                                            key={`${s.id}_${idx}`}
                                            className={`ml-2 ${s.status === "accepted" ? "text-green-500" : s.status === "declined" ? "text-red-500" : "text-blue-400"}`}
                                          >
                                            {s.level.name}
                                          </span>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="text-white font-bold text-xl flex flex-col items-center gap-2">
                                <div className="w-48 aspect-video bg-black border border-neutral-700 rounded overflow-hidden shadow-lg relative">
                                  {gameState.customLevelsQueue &&
                                    gameState.customLevelsQueue.length > 0 && (
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
                                                key={`${sl.id || ""}_${i}`}
                                                className="truncate px-1 bg-white/10 rounded"
                                              >
                                                {i + 1}. {sl.name}
                                              </div>
                                            ))}
                                          {gameState.customLevelsQueue.length >
                                            4 && (
                                            <div>
                                              +{" "}
                                              {gameState.customLevelsQueue
                                                .length - 4}{" "}
                                              {t.more || "MORE"}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                                <span className="text-center text-sm md:text-base">
                                  {!gameState.customLevelsQueue ||
                                  gameState.customLevelsQueue.length === 0
                                    ? t.noLevelSelected || "NO LEVEL SELECTED"
                                    : gameState.customLevelsQueue.length > 1
                                      ? `${gameState.customLevelsQueue.length} ${t.levels} SELECTED`
                                      : gameState.customLevelsQueue[0].name}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="w-full md:w-80 flex flex-col gap-4">
                          <Chat
                            messages={chatMessages}
                            onSendMessage={(text) => {
                              onlineService.sendChatMessage(text);
                              const newCount =
                                (gameState.chatMessagesSent || 0) + 1;
                              setGameState((p) => ({
                                ...p,
                                chatMessagesSent: newCount,
                              }));
                              checkAchievements({ chatMessagesSent: newCount });
                            }}
                            isHost={gameState.isHost || false}
                            lang={lang}
                            unlockedAchievements={
                              gameState.unlockedAchievements
                            }
                          />

                          {/* Quick Chat Pings */}
                          <div className="grid grid-cols-3 gap-1 bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
                            {PINGS.map((ping) => (
                              <button
                                key={ping}
                                onClick={() =>
                                  onlineService.sendChatMessage(ping)
                                }
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
                                  ? t.startGame || "START GAME"
                                  : onlinePlayers.find(
                                        (p) =>
                                          p.id ===
                                          onlineService.localPlayer?.id,
                                      )?.ready
                                    ? t.unready || "UNREADY"
                                    : t.ready || "READY"
                              }
                              onClick={() => {
                                if (gameState.isHost) {
                                  if (
                                    gameState.onlineMode !== "editor" &&
                                    (!gameState.customLevelsQueue ||
                                      gameState.customLevelsQueue.length === 0)
                                  ) {
                                    setOnlineError(
                                      "PLEASE SELECT LEVEL(S) FIRST!",
                                    );
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
                                      : gameState.onlineMode === "editor"
                                        ? 1
                                        : 2;

                                  if (onlinePlayers.length < requiredPlayers) {
                                    setOnlineError(
                                      `ERROR: Need at least ${requiredPlayers} players!`,
                                    );
                                    setTimeout(() => setOnlineError(""), 2000);
                                    return;
                                  }

                                  if (gameState.onlineMode === "brawler") {
                                    const occupiedTeams = new Set(
                                      onlinePlayers
                                        .filter(
                                          (p) =>
                                            p.team !== undefined &&
                                            p.team !== null,
                                        )
                                        .map((p) => p.team),
                                    );
                                    if (occupiedTeams.size < 2) {
                                      setOnlineError(
                                        "ERROR: At least two teams must be occupied!",
                                      );
                                      setTimeout(
                                        () => setOnlineError(""),
                                        3000,
                                      );
                                      return;
                                    }
                                  }

                                  if (onlinePlayers.every((p) => p.ready)) {
                                    lastStartTimeRef.current = Date.now();
                                    setOnlineResults([]);
                                    setOnlineFinishTimer(null);
                                    onlineService.startGame();
                                  } else {
                                    setOnlineError(
                                      "Not all players are ready!",
                                    );
                                    setTimeout(() => setOnlineError(""), 2000);
                                  }
                                } else {
                                  const localP = onlinePlayers.find(
                                    (p) =>
                                      p.id === onlineService.localPlayer?.id,
                                  );
                                  if (localP)
                                    onlineService.setReady(!localP.ready);
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
                              index={gameState.isHost ? 5 : 2}
                              label={t.back}
                              danger
                              onClick={() => {
                                const isEditor =
                                  gameState.onlineMode === "editor";
                                if (onlineService.isHost) {
                                  onlineService.closeLobby();
                                } else {
                                  onlineService.disconnect();
                                }
                                setGameState((p) => ({
                                  ...p,
                                  status: isEditor
                                    ? "editor_type_select"
                                    : "online_menu",
                                }));
                              }}
                              isSelected={
                                gameState.isHost
                                  ? menuSelection === 5
                                  : menuSelection === 2
                              }
                              onHover={setMenuSelection}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Customization Menu */}
                {gameState.status === "customizing" && (
                  <motion.div
                    key="customizing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30"
                  >
                    <h2 className="text-2xl mb-4 text-white">{t.customize}</h2>

                    {/* Character Preview (Live Canvas) */}
                    <div className="w-56 h-56 bg-neutral-900 border-2 border-neutral-700 mb-6 flex items-center justify-center relative overflow-hidden">
                      <CharacterPreview
                        customization={customization}
                        scale={8}
                      />
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
                        onChange={(v: number) =>
                          setExactRGB(1, "color", "r", v)
                        }
                        isSelected={menuSelection === 0}
                        onHover={setMenuSelection}
                      />
                      <SliderRow
                        label="GREEN"
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
                        label="BLUE"
                        value={hexToRgb(customization.color).b}
                        index={2}
                        colorClass="bg-blue-500"
                        onChange={(v: number) =>
                          setExactRGB(1, "color", "b", v)
                        }
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
                          {getLockReason("trail", customization.trailColor)}
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
                        {t.adjustControls ||
                          "ARROWS TO ADJUST • ENTER TO CYCLE"}
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
                          {getLockReason("eyes", customization.eyes)}
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
                          {getLockReason("accessory", customization.accessory)}
                        </div>
                        {!isUnlocked("accessory", customization.accessory) && (
                          <div className="absolute right-4 top-3 text-red-500">
                            🔒
                          </div>
                        )}
                      </div>

                      {/* Mastery Reward Button */}
                      {(() => {
                        const speedClearsStored = localStorage.getItem(
                          "ragecube_gd_speed_clears",
                        );
                        let master = false;
                        if (speedClearsStored) {
                          try {
                            const speedClears = JSON.parse(speedClearsStored);
                            const allLevels = GD_LEVELS.map((l) => l.id);
                            master = allLevels.every((id) => {
                              const clears = speedClears[id] || [];
                              return (
                                clears.includes(1) &&
                                clears.includes(1.25) &&
                                clears.includes(1.5)
                              );
                            });
                          } catch (e) {}
                        }

                        if (!master) return null;

                        return (
                          <div className="mt-2 border-t border-cyan-900 pt-2 animate-fade-in">
                            <MenuButton
                              index={15}
                              label={`ENDLESS ROTATION: ${customization.continuousRotation ? "ON" : "OFF"}`}
                              onClick={() => {
                                setCustomization((prev) => ({
                                  ...prev,
                                  continuousRotation: !prev.continuousRotation,
                                }));
                              }}
                              isSelected={menuSelection === 15}
                              onHover={setMenuSelection}
                            />
                            <div className="text-[8px] text-cyan-400 text-center uppercase mt-1 px-4 italic font-bold">
                              ★ RAGE RUN MASTER UNLOCKED ★
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex gap-4 w-full max-w-[500px] mt-2">
                      <MenuButton
                        index={9}
                        label="🎲 RANDOM"
                        onClick={() => {
                          const randomColor =
                            "#" +
                            Math.floor(Math.random() * 16777215)
                              .toString(16)
                              .padStart(6, "0");
                          const eyesPool = EYE_OPTIONS.filter((opt) =>
                            isUnlocked("eyes", opt),
                          );
                          const accPool = ACC_OPTIONS.filter(
                            (opt) =>
                              isUnlocked("accessory", opt) && opt !== "unicorn",
                          );
                          const trailPool = TRAIL_PRESETS.filter((opt) =>
                            isUnlocked("trail", opt.val),
                          );

                          const randomEyes =
                            eyesPool[
                              Math.floor(Math.random() * eyesPool.length)
                            ] || "normal";
                          const randomAcc =
                            accPool[
                              Math.floor(Math.random() * accPool.length)
                            ] || "none";
                          const randomTrail =
                            trailPool[
                              Math.floor(Math.random() * trailPool.length)
                            ]?.val || randomColor;

                          setCustomization((prev) => ({
                            ...prev,
                            color: randomColor,
                            eyes: randomEyes,
                            accessory: randomAcc,
                            trailColor: randomTrail,
                          }));
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
                  </motion.div>
                )}

                {/* ... (Other Menus remain similar but condensed in existing code) ... */}
                {/* Pause Menu */}
                {gameState.status === "paused" && (
                  <div
                    key="paused"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50"
                  >
                    <h2 className="text-4xl text-white mb-8">{t.paused}</h2>
                    <div className="flex flex-col gap-2 w-72">
                      {(() => {
                        const buttons = [];

                        buttons.push({
                          label: t.resume || "RESUME",
                          onClick: () =>
                            setGameState((p) => ({
                              ...p,
                              status:
                                p.previousStatus ||
                                (p.customLevelsQueue
                                  ? "random_run"
                                  : "playing"),
                            })),
                        });

                        const isBuildBattle = gameState.previousStatus === "build_battle_playing";

                        if (isBuildBattle && !onlineService.lobbyCode) {
                          buttons.push({
                            label: "P1 AUFGEBEN",
                            danger: true,
                            onClick: () => {
                              setGameState((p) => ({
                                ...p,
                                status: p.previousStatus || "playing",
                              }));
                              setBuildBattleSurrenders((prev) => ({ ...prev, P1: true }));
                            },
                          });
                          buttons.push({
                            label: "P2 AUFGEBEN",
                            danger: true,
                            onClick: () => {
                              setGameState((p) => ({
                                ...p,
                                status: p.previousStatus || "playing",
                              }));
                              setBuildBattleSurrenders((prev) => ({ ...prev, P2: true }));
                            },
                          });
                        }

                        if (!isBuildBattle) {
                          if (
                            (!onlineService.lobbyCode || onlineService.isHost) &&
                            gameState.customLevelsQueue &&
                            gameState.customLevelsQueue.length > 1
                          ) {
                            if (
                              gameState.currentLevelIndex <
                              gameState.customLevelsQueue.length - 1
                            ) {
                              buttons.push({
                                label:
                                  gameState.previousStatus === "vs_playing" ||
                                  gameState.previousStatus === "brawler_playing"
                                    ? "LEVEL SKIPPEN"
                                    : t.nextLevelBtn || "NEXT LEVEL",
                                onClick: handleNextLevel,
                              });
                            }

                            if (
                              gameState.previousStatus === "vs_playing" ||
                              gameState.previousStatus === "brawler_playing"
                            ) {
                              buttons.push({
                                label: "LEVEL WIEDERHOLEN",
                                onClick: handleRetry,
                              });

                              buttons.push({
                                label: "NEUSTART",
                                onClick: () => {
                                  setGameState((p) => ({
                                    ...p,
                                    currentLevelIndex: 0,
                                  }));
                                  handleRetry();
                                },
                              });
                            }
                          }

                          if (
                            !(
                              gameState.previousStatus === "vs_playing" ||
                              gameState.previousStatus === "brawler_playing"
                            ) ||
                            !onlineService.lobbyCode
                          ) {
                            // Only add standard RETRY if not already added by custom logic above
                            if (
                              !(
                                gameState.previousStatus === "vs_playing" ||
                                gameState.previousStatus === "brawler_playing"
                              )
                            ) {
                              buttons.push({
                                label: t.retry || "RETRY",
                                onClick: handleRetry,
                              });
                            }
                          }
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
                              if (isBuildBattle) {
                                setBuildBattleSurrenders((prev) => ({ ...prev, [playerName]: true }));
                              } else {
                                // Locally we treat it as finished with poor stats
                                handleWin("GAVE UP");
                              }
                            },
                          });
                          if (isBuildBattle && onlineService.isHost) {
                            buttons.push({
                              label: "RUNDE BEENDEN",
                              danger: true,
                              onClick: () => {
                                onlineService.sendEvent("force_end_round", {
                                  name: playerName,
                                });
                                setGameState((p) => ({
                                  ...p,
                                  status: p.previousStatus || "playing",
                                }));
                                handleWin("EVERYONE_FINISHED");
                              },
                            });
                          }
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
                        } else {
                          // Back to Lobby / Selection for local modes
                          const isLocalMulti =
                            gameState.previousStatus === "vs_playing" ||
                            gameState.previousStatus === "brawler_playing" ||
                            gameState.previousStatus === "build_battle_playing";
                          const isStory =
                            gameState.previousStatus === "playing" ||
                            gameState.previousStatus === "random_run";

                          if (isLocalMulti || isStory) {
                            buttons.push({
                              label: t.backToLobby || "ZURÜCK ZUR LOBBY",
                              onClick: () => {
                                setGameState((p) => {
                                  let nextStatus: Status = "menu";
                                  if (p.previousStatus === "brawler_playing")
                                    nextStatus = "brawler_setup";
                                  else if (p.previousStatus === "vs_playing")
                                    nextStatus = "vs_setup";
                                  else if (
                                    p.previousStatus === "build_battle_playing"
                                  )
                                    nextStatus = "build_battle_setup";
                                  else if (
                                    p.previousStatus === "playing" ||
                                    p.previousStatus === "random_run"
                                  )
                                    nextStatus = "difficulty_select";

                                  return {
                                    ...p,
                                    status: nextStatus,
                                  };
                                });
                              },
                            });
                          }
                        }

                        if (!isBuildBattle) {
                          buttons.push({
                            label: t.settings,
                            onClick: () => {
                              setGameState((p) => ({
                                ...p,
                                status: "settings",
                                previousStatus: "paused",
                              }));
                              setMenuSelection(0);
                            },
                          });
                        }

                        buttons.push({
                          label: t.quit,
                          danger: true,
                          onClick: () => {
                            if (onlineService.lobbyCode) {
                              onlineService.disconnect();
                            }
                            setGameState((p) => ({
                              ...p,
                              status: p.geometryDashMode
                                ? "geometry_dash_menu"
                                : "menu",
                              geometryDashMode: false,
                            }));
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
                  <div
                    key="won_screen"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/80 backdrop-blur-md z-40"
                  >
                    {gameState.status === "vs_won" ||
                    gameState.status === "brawler_won" ? (
                      <>
                        <h2 className="text-5xl text-white font-bold mb-4 animate-bounce">
                          {gameState.winner
                            ? t.playerWin(gameState.winner)
                            : ""}
                        </h2>
                        <div className="text-xl mb-8">
                          TIME: {gameState.time}s
                        </div>
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
                                  setGameState((p) => ({
                                    ...p,
                                    status: "menu",
                                  }));
                                }}
                                isSelected={menuSelection === 2}
                                onHover={setMenuSelection}
                              />
                            </>
                          ) : onlineService.lobbyCode ? (
                            <>
                              <MenuButton
                                index={0}
                                label={t.backToLobby}
                                onClick={() => {
                                  if (onlineService.isHost) {
                                    onlineService.returnToLobby();
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
                                  onlineService.disconnect();
                                  setGameState((p) => ({
                                    ...p,
                                    status: "menu",
                                  }));
                                }}
                                isSelected={menuSelection === 1}
                                onHover={setMenuSelection}
                              />
                            </>
                          ) : (
                            <>
                              <MenuButton
                                index={0}
                                label={
                                  lang === Language.DE
                                    ? "NOCHMAL SPIELEN"
                                    : lang === Language.ES
                                      ? "VOLVER A JUGAR"
                                      : "PLAY AGAIN"
                                }
                                onClick={() => {
                                  handleRetry();
                                }}
                                isSelected={menuSelection === 0}
                                onHover={setMenuSelection}
                              />
                              <MenuButton
                                index={1}
                                label={
                                  lang === Language.DE
                                    ? "ZURÜCK ZUR LOBBY"
                                    : lang === Language.ES
                                      ? "VOLVER A LA LOBBY"
                                      : "BACK TO LOBBY"
                                }
                                onClick={() => {
                                  setGameState((p) => ({
                                    ...p,
                                    status:
                                      gameState.status === "brawler_won"
                                        ? "brawler_setup"
                                        : "vs_setup",
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
                                  setGameState((p) => ({
                                    ...p,
                                    status: "menu",
                                  }));
                                }}
                                isSelected={menuSelection === 2}
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
                                if (
                                  e.key === "Enter" &&
                                  playerName.length > 0
                                ) {
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
                            {((gameState.customLevelsQueue &&
                              gameState.currentLevelIndex <
                                gameState.customLevelsQueue.length - 1) ||
                              (!gameState.customLevelsQueue &&
                                selectedDifficultySet &&
                                gameState.currentLevelIndex <
                                  selectedDifficultySet.length - 1)) && (
                              <MenuButton
                                index={0}
                                label={t.nextLevelBtn}
                                onClick={handleNextLevel}
                                isSelected={menuSelection === 0}
                                onHover={setMenuSelection}
                              />
                            )}
                            <MenuButton
                              index={1}
                              label={t.mainMenu}
                              danger
                              onClick={() =>
                                setGameState((prev) => ({
                                  ...prev,
                                  status: prev.geometryDashMode
                                    ? "geometry_dash_menu"
                                    : "menu",
                                  geometryDashMode: false,
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

                {/* Build Battle Won / Round Ended Screen overlay */}
                {gameState.status === "build_battle_won" && (
                  <motion.div
                    key="build_battle_won_screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-950/80 backdrop-blur-md z-40"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="bg-neutral-950 p-8 border-2 border-yellow-500 rounded-3xl flex flex-col items-center w-full max-w-md shadow-[0_0_50px_rgba(234,179,8,0.25)]"
                    >
                      <div className="text-5xl mb-4 animate-bounce">
                        {gameState.winner && gameState.winner.includes("NIEMAND") ? "🏳️" : "👑"}
                      </div>

                      <h2 className="text-2xl text-yellow-400 font-extrabold font-arcade mb-2 text-center uppercase tracking-wider">
                        {gameState.winner
                          ? gameState.winner.includes("NIEMAND")
                            ? gameState.winner.includes("AUFGEBEN")
                              ? "MATCH AUFGEGEBEN!"
                              : gameState.winner
                            : `${gameState.winner} GEWINNT!`
                          : "ZIEL ERREICHT!"}
                      </h2>

                      <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-6">
                        RUNDE {buildBattleRound} BEENDET
                      </div>

                      <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 mb-4 flex flex-col gap-3">
                        <div className="text-[9px] text-yellow-500/80 font-arcade uppercase tracking-wider text-center border-b border-neutral-800/80 pb-2">
                          PUNKTESTAND
                        </div>
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded bg-cyan-400" />
                            <span className="text-neutral-200 text-xs font-arcade uppercase">
                              SPIELER 1
                            </span>
                          </div>
                          <span className="text-cyan-400 text-lg font-bold font-arcade">
                            {buildBattleScores.P1}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded bg-amber-400" />
                            <span className="text-neutral-200 text-xs font-arcade uppercase">
                              SPIELER 2
                            </span>
                          </div>
                          <span className="text-amber-400 text-lg font-bold font-arcade">
                            {buildBattleScores.P2}
                          </span>
                        </div>
                      </div>

                      {lastBuildBattleRoundStats && (
                        <div className="w-full bg-neutral-950/80 border border-neutral-900/60 rounded-2xl p-3.5 mb-6 flex flex-col gap-2 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]">
                          <div className="text-[8px] text-yellow-500 font-arcade uppercase tracking-wider text-center border-b border-neutral-900 pb-1.5 mb-1">
                            Runden-Statistik & Ränge
                          </div>
                          <div className="text-[9px] text-neutral-300 leading-relaxed font-arcade flex flex-col gap-2">
                            {/* Round Winner */}
                            <div className="flex justify-between items-center text-neutral-400">
                              <span>🏆 Rundensieg (+1 Pkt):</span>
                              <span className="font-bold">
                                {lastBuildBattleRoundStats.winner &&
                                !lastBuildBattleRoundStats.winner.startsWith("NIEMAND") &&
                                lastBuildBattleRoundStats.winner !==
                                  "EVERYONE_FINISHED" ? (
                                  <span
                                    className={
                                      lastBuildBattleRoundStats.winner.includes(
                                        "1",
                                      ) ||
                                      lastBuildBattleRoundStats.winner === "P1"
                                        ? "text-cyan-400"
                                        : "text-amber-400"
                                    }
                                  >
                                    {lastBuildBattleRoundStats.winner}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">{lastBuildBattleRoundStats.winner}</span>
                                )}
                              </span>
                            </div>

                            {/* Coins P1 */}
                            <div className="flex justify-between items-center text-neutral-400">
                              <span className="flex items-center gap-1">
                                🪙 P1 Münzen gerettet:
                              </span>
                              <span className="text-cyan-400 font-bold font-mono">
                                {lastBuildBattleRoundStats.p1Coins}{" "}
                                <span className="text-[7px] text-neutral-500 font-normal">
                                  ({lastBuildBattleRoundStats.p1Coins} Pkt)
                                </span>
                              </span>
                            </div>

                            {/* Coins P2 */}
                            <div className="flex justify-between items-center text-neutral-400">
                              <span className="flex items-center gap-1">
                                🪙 P2 Münzen gerettet:
                              </span>
                              <span className="text-amber-400 font-bold font-mono">
                                {lastBuildBattleRoundStats.p2Coins}{" "}
                                <span className="text-[7px] text-neutral-500 font-normal">
                                  ({lastBuildBattleRoundStats.p2Coins} Pkt)
                                </span>
                              </span>
                            </div>

                            {/* Block Kills */}
                            {((lastBuildBattleRoundStats.p1Kills || 0) > 0 ||
                              (lastBuildBattleRoundStats.p2Kills || 0) > 0) && (
                              <div className="flex flex-col gap-1.5 border-t border-neutral-900/30 pt-1.5 mt-0.5">
                                {(lastBuildBattleRoundStats.p1Kills || 0) >
                                  0 && (
                                  <div className="flex justify-between items-center text-neutral-400">
                                    <span className="flex items-center gap-1">
                                      💥 P1 Block-Kill Bonus:
                                    </span>
                                    <span className="text-cyan-400 font-bold font-mono">
                                      +1 Pkt
                                    </span>
                                  </div>
                                )}
                                {(lastBuildBattleRoundStats.p2Kills || 0) >
                                  0 && (
                                  <div className="flex justify-between items-center text-neutral-400">
                                    <span className="flex items-center gap-1">
                                      💥 P2 Block-Kill Bonus:
                                    </span>
                                    <span className="text-amber-400 font-bold font-mono">
                                      +1 Pkt
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Total Added */}
                            <div className="flex justify-between items-center border-t border-neutral-900 pt-2 text-neutral-200 mt-1 uppercase text-[7px] tracking-wider font-extrabold">
                              <span>Rundengewinn:</span>
                              <div className="flex gap-2.5">
                                <span className="text-cyan-400 font-mono font-bold">
                                  P1: +{lastBuildBattleRoundStats.p1ScoreAdded}
                                </span>
                                <span className="text-amber-400 font-mono font-bold">
                                  P2: +{lastBuildBattleRoundStats.p2ScoreAdded}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {(() => {
                        const matchWinner =
                          buildBattleScores.P1 >= buildBattleTargetPointsConfig
                            ? customization.name || "Spieler 1"
                            : buildBattleScores.P2 >=
                                buildBattleTargetPointsConfig
                              ? customizationP2.name || "Spieler 2"
                              : null;
                        return (
                          <>
                            {matchWinner && (
                              <div className="w-full text-center p-3 bg-green-950/60 border border-green-500/30 rounded-2xl mb-3 animate-pulse">
                                <span className="text-[10px] font-arcade text-green-400 font-bold block uppercase tracking-wider mb-1">
                                  🏆 MATCH ENTSCHIEDEN! 🏆
                                </span>
                                <span className="text-[11px] font-bold text-white block">
                                  {matchWinner} gewinnt das Match (
                                  {buildBattleTargetPointsConfig} Punkte)!
                                </span>
                              </div>
                            )}

                            <div className="flex flex-col gap-2 w-full">
                              {matchWinner ? (
                                <button
                                  onClick={() => {
                                    setBuildBattleScores({ P1: 0, P2: 0 });
                                    setBuildBattleRound(1);
                                    setBuildBattleVotes({ P1: null, P2: null });
                                    setBuildBattleVoteSelection({
                                      P1: 0,
                                      P2: 1,
                                    });
                                    setBuildBattleVoteTimer(null);
                                    setGameState((p) => ({
                                      ...p,
                                      status: "build_battle_vote",
                                    }));
                                    showToast(
                                      "Neues Match & Abstimmung gestartet!",
                                    );
                                  }}
                                  className="py-3 px-6 bg-green-500 hover:bg-green-400 text-neutral-950 font-black rounded-xl text-xs tracking-wider uppercase transition-all font-arcade border-b-4 border-green-700 active:translate-y-px active:border-b-0 text-center animate-bounce animate-pulse"
                                >
                                  MATCH NEUSTARTEN
                                </button>
                              ) : (
                                <div
                                  className="relative overflow-hidden w-full bg-neutral-900 rounded-xl border-2 border-yellow-500/50 flex flex-col justify-center cursor-pointer mb-2"
                                  onClick={() => {
                                    const newItems = get8UniqueBuildBattleItems(
                                      buildBattleAllowedItems,
                                    );
                                    setBuildBattleItems(newItems);
                                    setBuildBattlePhase("select");
                                    setBuildBattlePhaseTimer(
                                      buildBattleSelectTimerConfig,
                                    );
                                    setBuildTurn(0);
                                    setBuildBattleRound((p) => p + 1);
                                    setBuildBattlePlacedThisRound({});
                                    setBuildBattleSelection({ P1: 0, P2: 1 });
                                    setBuildBattleConfirmed({
                                      P1: false,
                                      P2: false,
                                    });
                                    setBuildBattleSurrenders({});
                                    setBuildBattleRotation({
                                      P1: false,
                                      P2: false,
                                    });
                                    setBuildBattleCursors({
                                      P1: { x: 480, y: 270 },
                                      P2: { x: 510, y: 270 },
                                    });
                                    setResetTrigger((p) => p + 1);
                                    setRespawnTrigger((p) => p + 1);
                                    setGameState((p) => ({
                                      ...p,
                                      status: "build_battle_playing",
                                    }));
                                    showToast(
                                      `Start Runde ${buildBattleRound + 1}!`,
                                    );
                                  }}
                                >
                                  <motion.div
                                    className="absolute left-0 top-0 bottom-0 bg-yellow-500/30"
                                    initial={{ width: "100%" }}
                                    animate={{ width: "0%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                  />
                                  <div className="relative z-10 flex flex-col items-center justify-center p-2.5 text-center drop-shadow-md">
                                    <span className="text-[9px] sm:text-[10px] text-yellow-400 uppercase font-arcade tracking-widest font-bold leading-normal">
                                      NÄCHSTE RUNDE IN KÜRZE...
                                    </span>
                                    <span className="text-[7px] text-yellow-500/80 uppercase font-arcade tracking-widest mt-1">
                                      (KLICKEN ZUM ÜBERSPRINGEN)
                                    </span>
                                  </div>
                                </div>
                              )}

                              <button
                                onClick={() => {
                                  setGameState((p) => ({
                                    ...p,
                                    status: "build_battle_setup",
                                  }));
                                }}
                                className="py-2.5 px-6 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold rounded-xl text-[10px] tracking-wider uppercase transition-all font-arcade text-center"
                              >
                                LEVEL-MENÜ
                              </button>

                              <button
                                onClick={() => {
                                  setGameState((p) => ({
                                    ...p,
                                    status: "menu",
                                  }));
                                }}
                                className="py-2.5 px-6 bg-red-950/25 hover:bg-red-900/40 border border-red-900/30 text-red-400 font-bold rounded-xl text-[10px] tracking-wider uppercase transition-all font-arcade text-center"
                              >
                                HAUPTMENÜ
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </motion.div>
                  </motion.div>
                )}

                {/* Online Summary Screen */}
                {gameState.status === "online_summary" && (
                  <div
                    key="online_summary"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 p-4 overflow-y-auto pt-20 pb-10"
                  >
                    <h2 className="text-4xl text-cyan-400 font-arcade mb-2 tracking-widest">
                      {t.gameResults || "SPIEL-ERGEBNISSE"}
                    </h2>

                    {/* Podium / Träppchen */}
                    {onlineResults.length > 0 && (
                      <div className="flex items-end justify-center gap-4 mb-8 mt-4 h-40">
                        {/* 2nd Place */}
                        {onlineResults[1] && (
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-neutral-400 mb-1 truncate max-w-[80px]">
                              {onlineResults[1].name}
                            </div>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "60px" }}
                              className="w-16 bg-neutral-600 border-x-2 border-t-2 border-neutral-500 flex items-center justify-center font-arcade text-white text-xl"
                            >
                              2
                            </motion.div>
                          </div>
                        )}
                        {/* 1st Place */}
                        {onlineResults[0] && (
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-yellow-400 font-bold mb-1 truncate max-w-[100px]">
                              {onlineResults[0].name}
                            </div>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "90px" }}
                              transition={{ delay: 0.2 }}
                              className="w-20 bg-yellow-600 border-x-2 border-t-2 border-yellow-500 flex items-center justify-center font-arcade text-white text-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                            >
                              1
                            </motion.div>
                          </div>
                        )}
                        {/* 3rd Place */}
                        {onlineResults[2] && (
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-neutral-400 mb-1 truncate max-w-[80px]">
                              {onlineResults[2].name}
                            </div>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "40px" }}
                              transition={{ delay: 0.4 }}
                              className="w-16 bg-orange-800 border-x-2 border-t-2 border-orange-700 flex items-center justify-center font-arcade text-white text-lg"
                            >
                              3
                            </motion.div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="w-full max-w-2xl bg-neutral-900 border-2 border-neutral-700 p-6 rounded-lg shadow-2xl custom-scrollbar overflow-y-auto max-h-[70vh]">
                      <table className="w-full text-left font-mono">
                        <thead>
                          <tr className="text-neutral-500 border-b border-neutral-800 text-xs">
                            <th className="pb-2">PLATZ</th>
                            <th className="pb-2">SPIELER</th>
                            <th className="pb-2">ZEIT</th>
                            <th className="pb-2">TODE</th>
                            <th className="pb-2">PUNKTE</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {onlineResults.map((res, i) => (
                            <tr
                              key={`${res.id}_${i}`}
                              className={`border-b border-neutral-800/50 ${res.id === onlineService.localPlayer?.id ? "bg-cyan-900/20" : ""}`}
                            >
                              <td className="py-3 font-arcade text-yellow-500">
                                {i + 1}
                              </td>
                              <td className="py-3 font-bold text-white">
                                {res.name}{" "}
                                {res.id === onlineService.localPlayer?.id
                                  ? "(DU)"
                                  : ""}
                              </td>
                              <td className="py-3 text-cyan-300">
                                {res.time === 999 ? "-" : `${res.time}s`}
                              </td>
                              <td className="py-3 text-red-500">
                                {res.deaths}
                              </td>
                              <td className="py-3 text-green-400">
                                {res.score}
                              </td>
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
                                  if (
                                    onlineService.lobbyCode &&
                                    onlineService.isHost
                                  ) {
                                    let targetIdx = gameState.currentLevelIndex;
                                    // If we were at the end of a queue, restart from the beginning
                                    if (
                                      gameState.customLevelsQueue &&
                                      gameState.currentLevelIndex >=
                                        gameState.customLevelsQueue.length - 1
                                    ) {
                                      targetIdx = 0;
                                    }

                                    const targetLevel =
                                      gameState.customLevelsQueue &&
                                      gameState.customLevelsQueue.length > 0
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
                                        targetIdx,
                                      );
                                    }
                                    lastStartTimeRef.current = Date.now();
                                    onlineService.startGame();

                                    // Immediately transition host to playing state
                                    setGameState((p) => ({
                                      ...p,
                                      status:
                                        p.onlineMode === "brawler"
                                          ? "brawler_playing"
                                          : "vs_playing",
                                      levelTime: 0,
                                      levelDeaths: 0,
                                      collectedCoins: [],
                                      blocksPlaced: 0,
                                    }));
                                    setRespawnTrigger((p) => p + 1);
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
                                  setGameState((p) => ({
                                    ...p,
                                    status: "menu",
                                  }));
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
                                  setGameState((p) => ({
                                    ...p,
                                    status: "menu",
                                  }))
                                }
                                isSelected={menuSelection === 2}
                                onHover={setMenuSelection}
                              />
                            </>
                          ) : (
                            <>
                              <MenuButton
                                index={0}
                                label={
                                  lang === Language.DE
                                    ? "NOCHMAL SPIELEN"
                                    : lang === Language.ES
                                      ? "VOLVER A JUGAR"
                                      : "PLAY AGAIN"
                                }
                                onClick={() => {
                                  handleRetry();
                                }}
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
                                  setGameState((p) => ({
                                    ...p,
                                    status: "menu",
                                  }))
                                }
                                isSelected={menuSelection === 2}
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
                  <motion.div
                    key="shop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-30"
                  >
                    <ShopView
                      t={t}
                      customization={customization}
                      setCustomization={setCustomization}
                      shopTab={shopTab}
                      setShopTab={setShopTab}
                      hoveredShopItem={hoveredShopItem}
                      setHoveredShopItem={setHoveredShopItem}
                      gameState={gameState}
                      onBack={() =>
                        setGameState((p) => ({ ...p, status: "menu" }))
                      }
                      CharacterPreview={CharacterPreview}
                      SHOP_ITEMS={SHOP_ITEMS}
                      ACHIEVEMENTS_LIST={ACHIEVEMENTS_LIST}
                    />
                  </motion.div>
                )}

                {/* Geometry Dash Style Menu */}
                {gameState.status === "geometry_dash_menu" &&
                  (() => {
                    const gdLevelsList = GD_LEVELS;
                    const currentLevel =
                      gdLevelsList[gdSelectedLevelIndex] || GD_LEVELS[0];

                    return (
                      <motion.div
                        key="geometry_dash_menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex flex-col items-center justify-between p-8 bg-neutral-950 font-sans text-white z-40 overflow-hidden"
                      >
                        {/* Neon Grid Background */}
                        <div className="absolute inset-0 z-[-1] opacity-25">
                          <div className="w-full h-full bg-[linear-gradient(to_right,#00ffcc_1px,transparent_1px),linear-gradient(to_bottom,#00ffcc_1px,transparent_1px)] bg-[size:40px_40px] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/20 via-transparent to-emerald-950/20 pointer-events-none"></div>

                        {/* Header */}
                        <div className="flex flex-col items-center mt-4">
                          <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-cyan-400 to-blue-500 font-extrabold tracking-widest uppercase drop-shadow-[0_4px_10px_rgba(0,255,160,0.5)] animate-pulse">
                            RAGE RUN
                          </h1>
                          <span className="text-[10px] text-cyan-400 font-mono tracking-[0.4em] uppercase mt-2">
                            - SECRET EXTRA MODE -
                          </span>
                        </div>

                        {/* Level Display Selector */}
                        <div className="flex flex-col items-center justify-center w-full max-w-xl bg-black/60 border border-cyan-500/30 p-6 rounded-lg backdrop-blur-md">
                          <h2 className="text-xl font-black text-yellow-400 uppercase tracking-widest mb-4">
                            {currentLevel.name}
                          </h2>

                          {/* Selector Arrow controls */}
                          <div className="flex items-center justify-between w-full max-w-sm mb-4">
                            <button
                              onClick={() => {
                                try {
                                  audio.playSfx("secret");
                                } catch (e) {}
                                setGdSelectedLevelIndex((p) =>
                                  p > 0 ? p - 1 : gdLevelsList.length - 1,
                                );
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-cyan-600/30 border border-cyan-400 hover:bg-cyan-500/50 rounded-full text-white font-bold transition-all hover:scale-110 active:scale-95"
                            >
                              ◀
                            </button>

                            <div className="flex flex-col items-center">
                              <span className="text-xs text-neutral-400 font-mono uppercase">
                                LEVEL {gdSelectedLevelIndex + 1} OF{" "}
                                {gdLevelsList.length}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-black uppercase mt-1 tracking-wider">
                                STYLE: AUTO-SCROLL
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                try {
                                  audio.playSfx("secret");
                                } catch (e) {}
                                setGdSelectedLevelIndex((p) =>
                                  p < gdLevelsList.length - 1 ? p + 1 : 0,
                                );
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-cyan-600/30 border border-cyan-400 hover:bg-cyan-500/50 rounded-full text-white font-bold transition-all hover:scale-110 active:scale-95"
                            >
                              ▶
                            </button>
                          </div>

                          {/* Level details / coins */}
                          <div className="text-xs text-neutral-400 text-center font-mono">
                            COINS TO GRAB:{" "}
                            {currentLevel.entities.filter(
                              (e) => e.type === "coin",
                            ).length || 0}{" "}
                            ✨
                          </div>
                          {gameState.playedLevelIds.includes(
                            currentLevel.id,
                          ) && (
                            <div className="mt-2 text-sm text-green-400 font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                              ✅ COMPLETED
                              {(() => {
                                const stored = localStorage.getItem(
                                  "ragecube_gd_speed_clears",
                                );
                                if (!stored) return null;
                                const clears =
                                  JSON.parse(stored)[currentLevel.id] || [];
                                return (
                                  <div className="flex gap-1">
                                    {clears.includes(1) && (
                                      <span className="text-blue-400">★</span>
                                    )}
                                    {clears.includes(1.25) && (
                                      <span className="text-orange-400">★</span>
                                    )}
                                    {clears.includes(1.5) && (
                                      <span className="text-red-500">★</span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                          {(() => {
                            const storedScores = localStorage.getItem(
                              "ragecube_highscores",
                            );
                            if (storedScores) {
                              try {
                                const parsed = JSON.parse(storedScores);
                                const s = parsed[currentLevel.id];
                                if (s !== undefined) {
                                  return (
                                    <div className="mt-1 text-[10px] text-yellow-400 font-mono tracking-widest">
                                      HIGHSCORE: {s}
                                    </div>
                                  );
                                }
                              } catch (e) {}
                            }
                            return null;
                          })()}
                        </div>

                        {/* All Levels Grid Overview with Completion and Highscores */}
                        <div className="w-full max-w-4xl px-4 mt-2 mb-2">
                          <div className="text-center font-black uppercase tracking-widest text-cyan-400 text-[10px] mb-2">
                            LEVEL-ÜBERSICHT & HIGHSCORES
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-[140px] overflow-y-auto pr-1">
                            {gdLevelsList.map((lvl, idx) => {
                              const completed =
                                gameState.playedLevelIds.includes(lvl.id);
                              let speedClears: number[] = [];
                              try {
                                const stored = localStorage.getItem(
                                  "ragecube_gd_speed_clears",
                                );
                                if (stored)
                                  speedClears =
                                    JSON.parse(stored)[lvl.id] || [];
                              } catch (e) {}

                              let highscore: number | undefined;
                              try {
                                const stored = localStorage.getItem(
                                  "ragecube_highscores",
                                );
                                if (stored) {
                                  const parsed = JSON.parse(stored);
                                  highscore = parsed[lvl.id];
                                }
                              } catch (e) {}
                              const isSelected = gdSelectedLevelIndex === idx;
                              return (
                                <div
                                  key={`${lvl.id || ""}_${idx}`}
                                  onClick={() => {
                                    try {
                                      audio.playSfx("secret");
                                    } catch (e) {}
                                    setGdSelectedLevelIndex(idx);
                                  }}
                                  className={`p-2 rounded border cursor-pointer transition-all flex flex-col items-center justify-between text-center min-h-[55px] select-none relative ${
                                    isSelected
                                      ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                                      : "bg-black/40 border-neutral-800 hover:border-cyan-700 hover:bg-black/60"
                                  }`}
                                >
                                  <div className="text-[9px] font-black text-neutral-300 tracking-wider">
                                    {idx + 1}. {lvl.name}
                                  </div>
                                  <div className="absolute top-0 right-1 flex gap-0.5 mt-0.5">
                                    {speedClears.includes(1) && (
                                      <span className="text-blue-400 text-[8px]">
                                        ★
                                      </span>
                                    )}
                                    {speedClears.includes(1.25) && (
                                      <span className="text-orange-400 text-[8px]">
                                        ★
                                      </span>
                                    )}
                                    {speedClears.includes(1.5) && (
                                      <span className="text-red-500 text-[8px]">
                                        ★
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-center gap-0.5 mt-1">
                                    {completed ? (
                                      <span className="text-[8px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                                        ✅ COMPLETED
                                      </span>
                                    ) : (
                                      <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">
                                        UNFINISHED
                                      </span>
                                    )}
                                    {highscore !== undefined && (
                                      <span className="text-[8px] text-yellow-500 font-mono font-bold leading-none">
                                        🪙 {highscore}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Visual Character / Cube display bouncing with rotation angle */}
                        <div className="my-4 flex items-center justify-center relative">
                          <div className="absolute -inset-10 blur-2xl bg-cyan-500/20 rounded-full -z-10"></div>
                          <div className="w-24 h-24 animate-bounce duration-700">
                            <div className="w-full h-full rotate-[15deg] transition-transform duration-300">
                              <CharacterPreview
                                customization={customization}
                                scale={6}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row items-center gap-4 mb-2">
                          <button
                            onClick={() =>
                              setGameState((p) => ({ ...p, gdSpeedMode: 1 }))
                            }
                            className={`px-4 py-2 font-black uppercase tracking-widest text-[10px] border rounded transition-all ${
                              (gameState.gdSpeedMode || 1) === 1
                                ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#22d3ee]"
                                : "text-cyan-600 border-cyan-900 hover:border-cyan-600"
                            }`}
                          >
                            NORMAL (1x)
                          </button>
                          <button
                            onClick={() =>
                              setGameState((p) => ({ ...p, gdSpeedMode: 1.25 }))
                            }
                            className={`px-4 py-2 font-black uppercase tracking-widest text-[10px] border rounded transition-all ${
                              (gameState.gdSpeedMode || 1) === 1.25
                                ? "bg-orange-500 text-black border-orange-400 shadow-[0_0_15px_#f97316]"
                                : "text-orange-600 border-orange-900 hover:border-orange-600"
                            }`}
                          >
                            SCHNELL (1.25x)
                          </button>
                          <button
                            onClick={() =>
                              setGameState((p) => ({ ...p, gdSpeedMode: 1.5 }))
                            }
                            className={`px-4 py-2 font-black uppercase tracking-widest text-[10px] border rounded transition-all ${
                              (gameState.gdSpeedMode || 1) === 1.5
                                ? "bg-red-500 text-white border-red-400 shadow-[0_0_15px_#ef4444]"
                                : "text-red-700 border-red-900 hover:border-red-700"
                            }`}
                          >
                            VERRÜCKT (1.5x)
                          </button>
                        </div>

                        {/* Play Button Row */}
                        <div className="flex flex-col items-center gap-6 mb-4">
                          <button
                            onClick={() => {
                              try {
                                audio.playSfx("secret");
                              } catch (e) {}
                              setLevel(currentLevel);
                              setGameState((prev) => ({
                                ...prev,
                                status: "random_run",
                                geometryDashMode: true,
                                currentLevelIndex: gdSelectedLevelIndex,
                                customLevelsQueue: GD_LEVELS,
                                deaths: 0,
                                levelDeaths: 0,
                                time: 0,
                                levelTime: 0,
                                score: 0,
                              }));
                              setRespawnTrigger((p) => p + 1);
                            }}
                            className="w-28 h-28 rounded-full bg-yellow-400 hover:bg-yellow-300 border-4 border-white shadow-[0_0_35px_rgba(234,179,8,0.7)] hover:scale-110 active:scale-95 transition-all transform flex items-center justify-center cursor-pointer group"
                          >
                            <div className="w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-l-[25px] border-l-emerald-600 ml-1.5 group-hover:border-l-emerald-500 transition-colors"></div>
                          </button>

                          <button
                            onClick={() => {
                              try {
                                audio.playSfx("secret");
                              } catch (e) {}
                              setGameState((p) => ({ ...p, status: "menu" }));
                            }}
                            className="px-6 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 font-black text-xs uppercase tracking-widest text-red-400 rounded transition-all active:scale-95"
                          >
                            ◀ BACK TO MAIN
                          </button>
                        </div>
                      </motion.div>
                    );
                  })()}

                {/* Settings Menu */}
                {gameState.status === "settings" && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-30"
                  >
                    <SettingsMenu
                      t={t}
                      settings={settings}
                      setSettings={setSettings}
                      lang={lang}
                      menuSelection={menuSelection}
                      setMenuSelection={setMenuSelection}
                      onBack={() =>
                        setGameState((p) => ({
                          ...p,
                          status: p.previousStatus || "menu",
                        }))
                      }
                      onKeybindings={() => {
                        setGameState((p) => ({ ...p, status: "keybindings" }));
                        setMenuSelection(0);
                      }}
                      FPS_OPTIONS={FPS_OPTIONS}
                      UI_SCALE_OPTIONS={UI_SCALE_OPTIONS}
                      RESOLUTION_OPTIONS={RESOLUTION_OPTIONS}
                      setPlayerName={setPlayerName}
                      MenuButton={MenuButton}
                      SettingsSlider={SettingsSlider}
                    />
                  </motion.div>
                )}

                {/* Keybindings Menu */}
                {gameState.status === "keybindings" && (
                  <motion.div
                    key="keybindings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white z-30 overflow-y-auto custom-scrollbar py-10"
                  >
                    <h2 className="text-3xl mb-4 text-rage-red uppercase">
                      {t.keybindings}
                    </h2>
                    <div className="text-center text-sm text-neutral-400 mb-8 max-w-md">
                      {t.keybindingsDesc}
                    </div>

                    <div className="flex gap-8 mb-8">
                      {/* Player 1 */}
                      <div className="w-64 space-y-1">
                        <h3 className="text-xl text-troll-green mb-2 text-center uppercase">
                          {t.player1}
                        </h3>
                        {["up", "down", "left", "right", "action", "dash"].map(
                          (action, i) => {
                            const isEditing =
                              editingKey?.player === 1 &&
                              editingKey.action === action;
                            const bindings =
                              settings.keybindingsP1?.[
                                action as keyof Keybindings
                              ] || [];
                            const keyBinds = bindings.filter(
                              (k) => k !== "GP_None",
                            );
                            const displayBinds = keyBinds
                              .map((k) =>
                                k
                                  .replace("Arrow", "")
                                  .replace("Key", "")
                                  .replace("Digit", "")
                                  .replace("ControlRight", "R-CTRL")
                                  .replace("ControlLeft", "L-CTRL")
                                  .toUpperCase(),
                              )
                              .join(" / ");

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
                                      {displayBinds || "NONE"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>

                      {/* Player 2 */}
                      <div className="w-64 space-y-1">
                        <h3 className="text-xl text-troll-green mb-2 text-center uppercase">
                          {t.player2}
                        </h3>
                        {["up", "down", "left", "right", "action", "dash"].map(
                          (action, i) => {
                            const idx = i + 6;
                            const isEditing =
                              editingKey?.player === 2 &&
                              editingKey.action === action;
                            const bindings =
                              settings.keybindingsP2?.[
                                action as keyof Keybindings
                              ] || [];
                            const keyBinds = bindings.filter(
                              (k) => k !== "GP_None",
                            );
                            const displayBinds = keyBinds
                              .map((k) =>
                                k
                                  .replace("Arrow", "")
                                  .replace("Key", "")
                                  .replace("Digit", "")
                                  .replace("ControlRight", "R-CTRL")
                                  .replace("ControlLeft", "L-CTRL")
                                  .toUpperCase(),
                              )
                              .join(" / ");

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
                                      {displayBinds || "NONE"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
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
                  </motion.div>
                )}

                {/* Highscores Menu (Per Level) */}
                {gameState.status === "highscores" && (
                  <motion.div
                    key="highscores"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white z-30"
                  >
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
                              : [
                                  "builtin",
                                  "beginner",
                                  "advanced",
                                  "expert",
                                  "god",
                                  "custom",
                                ];
                          const currentIdx = sources.indexOf(levelSource);
                          let nextIdx = (currentIdx + 1) % sources.length;
                          const newSource = sources[nextIdx];
                          if (
                            newSource === "custom" &&
                            customLevels.length === 0
                          ) {
                            nextIdx = (nextIdx + 1) % sources.length;
                          }
                          setLevelSource(sources[nextIdx]);
                          setHighscoreLevelIndex(0);
                        }}
                        className={`text-sm font-bold text-blue-400 hover:underline cursor-pointer uppercase tracking-widest`}
                      >
                        {(() => {
                          if (levelSource === "beginner")
                            return t.beginner || "BEGINNER";
                          if (levelSource === "advanced")
                            return t.advanced || "ADVANCED";
                          if (levelSource === "expert")
                            return t.expert || "EXPERT";
                          if (levelSource === "god") return t.god || "JUMP GOD";
                          if (levelSource === "brawler")
                            return t.brawlerLevels || "BRAWLER";
                          if (levelSource === "custom")
                            return t.customLevelsLabel || "OWN LEVELS";
                          if (levelSource === "builtin")
                            return t.fullRun || "FULL RUN";
                          return levelSource.toUpperCase();
                        })()}
                      </button>
                    </div>

                    {levelSource !== "builtin" && (
                      <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="w-48 aspect-video bg-black border border-neutral-700 rounded overflow-hidden shadow-lg">
                          {(() => {
                            let activeList: LevelData[] = [];
                            if (levelSource === "beginner")
                              activeList = INITIAL_LEVELS;
                            else if (levelSource === "advanced")
                              activeList = ADVANCED_LEVELS;
                            else if (levelSource === "expert")
                              activeList = EXPERT_LEVELS;
                            else if (levelSource === "god")
                              activeList = GOD_LEVELS;
                            else if (levelSource === "brawler")
                              activeList = BRAWLER_LEVELS;
                            else if (levelSource === "custom")
                              activeList = customLevels;

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
                            return (
                              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">
                                NO PREVIEW
                              </div>
                            );
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
                              if (levelSource === "beginner")
                                activeList = INITIAL_LEVELS;
                              else if (levelSource === "advanced")
                                activeList = ADVANCED_LEVELS;
                              else if (levelSource === "expert")
                                activeList = EXPERT_LEVELS;
                              else if (levelSource === "god")
                                activeList = GOD_LEVELS;
                              else if (levelSource === "brawler")
                                activeList = BRAWLER_LEVELS;
                              else if (levelSource === "custom")
                                activeList = customLevels;

                              const idx = Math.min(
                                Math.max(0, highscoreLevelIndex),
                                Math.max(0, activeList.length - 1),
                              );
                              const currentLevel = activeList[idx];

                              return (
                                <>
                                  <div className="text-xs text-neutral-400 font-mono tracking-tighter">
                                    {t.level || "LEVEL"} {idx + 1} /{" "}
                                    {activeList.length}
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
                              if (levelSource === "beginner")
                                activeList = INITIAL_LEVELS;
                              else if (levelSource === "advanced")
                                activeList = ADVANCED_LEVELS;
                              else if (levelSource === "expert")
                                activeList = EXPERT_LEVELS;
                              else if (levelSource === "god")
                                activeList = GOD_LEVELS;
                              else if (levelSource === "brawler")
                                activeList = BRAWLER_LEVELS;
                              else if (levelSource === "custom")
                                activeList = customLevels;

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
                        <button
                          className="text-3xl hover:text-white text-neutral-500 transition-colors p-2"
                          onClick={() => {
                            setHighscoreLevelIndex((p) => Math.max(0, p - 1));
                          }}
                        >
                          ◀
                        </button>
                        <div className="text-center w-64">
                          <div className="text-white font-bold text-xl text-yellow-500 animate-pulse uppercase tracking-widest truncate">
                            {(() => {
                              if (highscoreLevelIndex === 0)
                                return t.fullRun || "FULL STORY RUN";
                              const cat =
                                storyCategories[highscoreLevelIndex - 1];
                              return cat ? `${cat.name} RUN` : "STORY RUN";
                            })()}
                          </div>
                        </div>
                        <button
                          className="text-3xl hover:text-white text-neutral-500 transition-colors p-2"
                          onClick={() => {
                            setHighscoreLevelIndex((p) =>
                              Math.min(storyCategories.length, p + 1),
                            );
                          }}
                        >
                          ▶
                        </button>
                      </div>
                    )}

                    <div className="w-80 space-y-2 mb-8 h-64 overflow-y-auto custom-scrollbar bg-neutral-900/50 rounded-lg p-2 border border-neutral-800">
                      {(() => {
                        let activeList: LevelData[] = [];
                        if (levelSource === "beginner")
                          activeList = INITIAL_LEVELS;
                        else if (levelSource === "advanced")
                          activeList = ADVANCED_LEVELS;
                        else if (levelSource === "expert")
                          activeList = EXPERT_LEVELS;
                        else if (levelSource === "god") activeList = GOD_LEVELS;
                        else if (levelSource === "brawler")
                          activeList = BRAWLER_LEVELS;
                        else if (levelSource === "custom")
                          activeList = customLevels;
                        else if (levelSource === "builtin")
                          activeList = INITIAL_LEVELS; // Just for fallback

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
                            ? highscoreLevelIndex === 0
                              ? "STORY_MODE"
                              : storyCategories[highscoreLevelIndex - 1]
                                  ?.name || "STORY_MODE"
                            : activeList[idx]?.id;

                        if (!currentId)
                          return (
                            <p className="text-center text-neutral-500 mt-10">
                              ERROR
                            </p>
                          );

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
                              <span className="text-neutral-400">
                                {h.time}s • {h.deaths}☠
                              </span>
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Global Toast */}
              <AnimatePresence>
                {toastMessage && (
                  <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      transition: { duration: 0.2 },
                    }}
                    className="fixed bottom-6 right-6 bg-neutral-950/95 border border-neutral-800 text-white px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[250] flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-rage-red animate-pulse" />
                    <span className="font-medium text-sm tracking-tight">
                      {toastMessage}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Achievement Toast */}
              {achievementToast && (
                <div className="fixed bottom-4 right-4 bg-neutral-900 border-2 border-yellow-500 text-white p-4 rounded-xl z-[200] animate-in slide-in-from-right-10 fade-in duration-300 flex items-center gap-4 max-w-sm pointer-events-none will-change-transform">
                  <div className="text-4xl transform transition-transform duration-300">
                    {achievementToast.icon}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-1">
                      {t.achievementUnlocked || "ACHIEVEMENT UNLOCKED"}
                    </div>
                    <div className="font-bold text-sm text-yellow-100">
                      {t.achievements_data?.[
                        achievementToast.id as keyof typeof t.achievements_data
                      ]?.title || achievementToast.title}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {t.achievements_data?.[
                        achievementToast.id as keyof typeof t.achievements_data
                      ]?.desc || achievementToast.description}
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
                    const isBuildBattle =
                      gameState.status === "build_battle_setup" ||
                      gameState.onlineMode === "build_battle";

                    const process = (list: LevelData[]) => {
                      if (isVS) return filterVSLevels(list);
                      if (isBrawler) return filterBrawlerLevels(list);
                      return list;
                    };

                    if (isBuildBattle) {
                      return [
                        {
                          name: "Build Battle",
                          levels: process(BUILD_BATTLE_LEVELS),
                        },
                      ];
                    }

                    if (gameState.onlineMode === "editor") {
                      return [
                        {
                          name: t.customLevels || "Custom Levels",
                          levels: process(customLevels),
                        },
                      ];
                    }

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
                        setGameState((p) => ({
                          ...p,
                          customLevelsQueue: selectedLevels,
                          currentLevelIndex: 0,
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
                          gameState.finishTimerEnabled,
                        );
                      } else {
                        // Local mode: if multiple levels, start a queue
                        setLevel(selectedLevels[0]);
                        setGameState((p) => ({
                          ...p,
                          customLevelsQueue:
                            selectedLevels.length > 1
                              ? selectedLevels
                              : undefined,
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
                        } else if (gameState.status === "build_battle_setup") {
                          setBuildBattleVotes({ P1: null, P2: null });
                          setBuildBattleVoteSelection({ P1: 0, P2: 1 });
                          setBuildBattleVoteTimer(null);
                          setGameState((p) => ({
                            ...p,
                            status: "build_battle_vote",
                          }));
                        }
                      }
                    }
                  }}
                  t={t}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-neutral-500 text-xs hidden md:block text-center opacity-0 pointer-events-none">
        Rage Cube v7.0
      </div>
    </>
  );
};

export default App;
