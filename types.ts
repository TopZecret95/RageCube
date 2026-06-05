
export enum Language {
  EN = 'EN',
  DE = 'DE',
  ES = 'ES'
}

export interface Vector2 {
  x: number;
  y: number;
}

export type EntityType = 'wall' | 'hazard' | 'goal' | 'fake' | 'bounce' | 'coin' | 'fake_goal' | 'invisible_hazard' | 'troll_wall' | 'ice' | 'trampoline' | 'slime' | 'teleport' | 'powerup_build' | 'powerup_hook' | 'powerup_double_jump' | 'checkpoint' | 'powerup_remover' | 'walkthrough_wall' | 'ghost_hazard' | 'powerup_slow_mo' | 'powerup_xray' | 'fake_ice' | 'fake_slime' | 'powerup_ice_block' | 'powerup_slime_block' | 'powerup_fireball' | 'powerup_teleport' | 'powerup_triple_jump' | 'powerup_bomb' | 'powerup_shield' | 'powerup_steal' | 'powerup_slow' | 'powerup_melee' | 'powerup_shrink' | 'powerup_grow' | 'powerup_dash' | 'powerup_spawner' | 'moving_platform_h' | 'moving_platform_v' | 'fragile' | 'gravity_reverse' | 'gravity_zero' | 'block_dash' | 'block_shrink' | 'block_grow' | 'block_gravity' | 'laser' | 'laser_cannon' | 'toggle_switch';

export interface Entity {
  x: number;
  y: number;
  w: number;
  h: number;
  type: EntityType;
  id?: string; // For tracking collected coins
  movingH?: boolean;
  movingV?: boolean;
  fragile?: boolean;
  opacity?: number;
  shake?: boolean;
  moveRange?: number;
  moveSpeed?: number;
  dx?: number;
  dy?: number;
  baseX?: number;
  baseY?: number;
}

export type LevelAbility = 'none' | 'build' | 'double_jump' | 'hook';

export interface LevelData {
  id: string;
  name: string;
  start: Vector2;
  startP2?: Vector2;
  width?: number;
  height?: number;
  entities: Entity[];
  message?: string;
  isCustom?: boolean; // Flag for editor levels
  isBrawler?: boolean; // Flag for brawler levels
  isVerified?: boolean; // Flag: true = released/playable, false = draft
  allowedAbility?: LevelAbility; // New: Ability restriction per level
  autoScroll?: boolean; // New: Auto-scrolling level
  autoScrollSpeed?: number; // New: Auto-scrolling speed
  lastPlayed?: number; // Timestamp for sorting
}

export type EyeType = 'normal' | 'angry' | 'cyclops' | 'derp' | 'anime' | 'dead' | 'sunglasses' | 'pirate' | 'rich' | 'glowing' | 'ninja' | 'tired' | 'laser' | 'kawaii' | 'monocle' | 'masked' | 'alien' | 'cyborg' | 'stars' | 'hearts' | 'hypno' | 'googly' | 'void_eyes' | 'evil';
export type AccessoryType = 'none' | 'crown' | 'horns' | 'headband' | 'cowboy' | 'viking' | 'halo' | 'headphones' | 'tophat' | 'cap' | 'propeller' | 'cat_ears' | 'demon_horns' | 'builder_hat' | 'wizard_hat' | 'bunny_ears' | 'pirate_hat' | 'party_hat' | 'sombrero' | 'ushanka' | 'fedora' | 'chef' | 'police' | 'pumpkin' | 'unicorn' | 'secret_crown' | 'rainbow_horn' | 'ghost_sheet' | 'coffee_cup';

export const EYE_OPTIONS: EyeType[] = [
  "normal", "angry", "cyclops", "derp", "anime", "dead", "sunglasses", "pirate", "rich", "glowing", "ninja", "tired", "laser", "kawaii", "monocle", "masked", "alien", "cyborg", "stars", "hearts", "hypno", "googly", "void_eyes", "evil",
];
export const ACC_OPTIONS: AccessoryType[] = [
  "none", "crown", "horns", "headband", "cowboy", "viking", "halo", "headphones", "tophat", "cap", "propeller", "cat_ears", "demon_horns", "builder_hat", "wizard_hat", "bunny_ears", "pirate_hat", "party_hat", "sombrero", "ushanka", "fedora", "chef", "police", "pumpkin", "unicorn", "secret_crown", "rainbow_horn", "ghost_sheet", "coffee_cup",
];
export const TRAIL_PRESETS = [
  { name: "RAGE RED", val: "#ff0044" },
  { name: "TOXIC GREEN", val: "#00ff88" },
  { name: "ICE BLUE", val: "#00ccff" },
  { name: "GOLD", val: "#fbbf24" },
  { name: "VOID PURPLE", val: "#9c27b0" },
  { name: "FIRE", val: "#ff4400" },
  { name: "RAINBOW", val: "rainbow" },
];
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 255, g: 0, b: 68 };
};

export interface PlayerCustomization {
  color: string;
  eyes: EyeType;
  accessory: AccessoryType;
  trailColor: string;
  coins?: number;
  unlockedTrails?: string[];
  unlockedDeathAnims?: string[];
  unlockedEyes?: string[];
  unlockedAccessories?: string[];
  unlockedDeathSounds?: string[];
  deathAnim?: string;
  deathSound?: string;
  trailType?: string;
  brawlerClass?: "standard" | "fighter" | "dasher" | "jumper" | "tank" | "ninja" | "heavy" | "vampire";
  continuousRotation?: boolean;
}

export interface Keybindings {
  up: string[];
  down: string[];
  left: string[];
  right: string[];
  action: string[];
  dash: string[];
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  deathVolume?: number;
  fpsCap: number; // 0 = Unlimited
  uiScale?: number; // 1 = 100%, 0.8 = 80%, etc.
  showGhost?: boolean;
  screenShake?: number; // 0 to 1, default 1
  resolutionScale?: number; // 1 = 1x, 2 = 2x, 4 = 4K etc
  editorEdgeScroll?: boolean;
  editorScrollSpeed?: number;
  favoriteSkins?: string[];
  favoriteTrails?: string[];
  playerName?: string;
  opponentOpacity?: number;
  invertXOnGravityReverse?: boolean;
  invertYOnGravityReverse?: boolean;
  keybindingsP1?: Keybindings;
  keybindingsP2?: Keybindings;
}

export interface HighScore {
  levelId: string;
  name: string;
  score: number;
  time?: number; // Added time
  deaths?: number; // Added deaths
  date: string;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  condition: (stats: any) => boolean;
  reward?: string; // Description of what it unlocks
  rewardType?: 'eyes' | 'accessory' | 'trail' | 'emoji';
  rewardId?: string;
}

export type Status = 'intro' | 'menu' | 'customizing' | 'shop' | 'playing' | 'paused' | 'dead' | 'won' | 'generating' | 'settings' | 'keybindings' | 'highscores' | 'editor' | 'editor_type_select' | 'tutorial' | 'random_run' | 'testing' | 'brawler_testing' | 'custom_level_select' | 'achievements' | 'vs_setup' | 'vs_playing' | 'vs_won' | 'difficulty_select' | 'brawler_setup' | 'brawler_powerup_setup' | 'brawler_playing' | 'brawler_won' | 'online_menu' | 'online_lobby' | 'online_playing' | 'online_won' | 'book' | 'geometry_dash_menu' | 'geometry_dash_play' | 'build_battle_setup' | 'build_battle_playing' | 'build_battle_won';

export interface GameState {
  status: Status;
  previousStatus?: Status;
  geometryDashMode?: boolean;
  gdSpeedMode?: number;
  currentLevelIndex: number;
  deaths: number; // Total session deaths
  levelDeaths: number; // Deaths in current level for score calc
  time: number; // Total run time
  levelTime: number; // Time in current level
  score: number;
  levelStartScore: number; // Snapshot of score at level start for resets
  lastRoast: string;
  collectedCoins: string[]; // IDs of collected coins
  customLevelsQueue?: LevelData[]; // For Random Run
  blocksPlaced: number; // Track for achievements
  totalJumps: number; // Track for achievements
  hooksUsed: number; // Track for achievements
  unlockedAchievements: string[];
  winner?: string; // For VS mode
  onlineMode?: 'brawler' | 'vs' | 'editor' | 'build_battle';
  lobbyCode?: string;
  isHost?: boolean;
  chatMessagesSent?: number;
  onlineWins?: number;
  levelsPlayedCount?: number;
  playedLevelIds?: string[];
  totalBlocksPlaced?: number;
  totalCoinsCollected?: number;
  flawlessLevelsCount?: number;
  brawlerLevelsPlayedCount?: number;
  editorTime?: number;
  collisionEnabled?: boolean;
  finishTimerEnabled?: boolean;
  isSpectating?: boolean;
  spectateTargetId?: string;
  storyCategoryName?: string;
  editorLevelType?: 'normal' | 'brawler';
}

export type KeyState = {
  [key: string]: boolean;
};

export interface GhostFrame {
  x: number;
  y: number;
  facing: number;
}

export interface GhostRun {
  levelId: string;
  frames: GhostFrame[];
  time: number;
  customization: PlayerCustomization;
}

export type SortMode = 'date' | 'name' | 'played';

export type BrawlerTeamMode = 'FFA' | 'TEAMS';
export type BrawlerHazardMode = 'none' | 'collapsing_platforms';

export interface BrawlerSettings {
  teamMode: BrawlerTeamMode;
  hazardMode: BrawlerHazardMode;
  powerups: Record<string, number>;
}