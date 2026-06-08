import {
  Vector2,
  LevelData,
  Entity,
  PlayerCustomization,
  EntityType,
  GameSettings,
  Language,
  BrawlerTeamMode,
  BrawlerHazardMode,
} from "../types";
import { OnlinePlayer } from "../services/onlineService";

export interface GameCanvasProps {
  level: LevelData;
  customization: PlayerCustomization;
  customizationP2?: PlayerCustomization; // New Prop for VS Mode
  onDie: () => void;
  onWin: (winner?: string, lives?: Record<string, number>) => void;
  onCoin: (id: string) => void;
  onBlockPlace: () => void;
  onJump?: () => void;
  onHook?: () => void;
  collectedCoins: string[];
  paused: boolean;
  respawnTrigger: number;
  resetTrigger: number;
  gameMode: "story" | "vs" | "brawler";
  fpsCap: number;
  settings: GameSettings;
  brawlerPowerups?: Record<string, number>;
  brawlerTeamMode?: BrawlerTeamMode;
  brawlerTeam1?: number;
  brawlerTeam2?: number;
  brawlerHazardMode?: BrawlerHazardMode;
  brawlerSuddenDeath?: boolean;
  brawlerComboPowerups?: boolean;
  vsCollision?: boolean;
  isOnline?: boolean;
  onlinePing?: number;
  onlinePlayers?: OnlinePlayer[];
  lang: Language;
  isSpectating?: boolean;
  spectateTargetId?: string;
  opponentOpacity?: number;
  status?: string;
  geometryDashMode?: boolean;
  gdSpeedMode?: number;
  levelDeaths?: number;
  suppressCountdown?: boolean;
}

export interface TempBlock extends Entity {
  expires: number;
  ownerIndex?: number;
}

export interface Projectile {
  x: number;
  y: number;
  w: number;
  h: number;
  velX: number;
  velY: number;
  owner: string;
  active: boolean;
}

export interface Bomb {
  x: number;
  y: number;
  w: number;
  h: number;
  timer: number;
  owner: string;
  active: boolean;
}

export interface Explosion {
  x: number;
  y: number;
  radius: number;
  timer: number;
  maxTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
  type: string;
  isDeathAnim?: boolean;
  startTime?: number;
}

export interface PlayerState {
  pos: Vector2;
  vel: Vector2;
  w: number;
  h: number;
  facing: number;
  isGrounded: boolean;
  wasGrounded: boolean;
  isWallSliding: boolean;
  wallDir: number;
  canJump: boolean;
  trail: { x: number; y: number; w: number; h: number }[];
  controls: {
    up: string[];
    left: string[];
    right: string[];
    down: string[];
    action?: string[];
  };
  color: string;
  trailColor: string;
  eyes: string;
  accessory: string;
  deathAnim: string;
  deathSound: string;
  trailType: string;
  brawlerClass?: string;
  name: string;
  playerIndex: number;
  team?: number;
  lives?: number;
  deaths?: number;
  inventory?: EntityType | null;
  collectedCoinIds: string[];
  finished: boolean;
  gravity: number;
  teleportCooldown: number;
  teleportMaxCooldown: number;
  surfaceType: EntityType | "none";
  wallSurfaceType: EntityType | "none"; // Separate tracker for wall interactions
  wallStickTimer: number; // For sticky wall mechanics
  wallCoyoteTimer: number; // Grace period for wall jumps
  lastWallDir: number; // Remember last wall direction for coyote jump
  // Ability States
  jumpCount: number; // For Double Jump
  hookActive: boolean;
  hookPos: Vector2 | null;
  hookCooldown: number;
  hookDuration: number; // Track how long hook is held

  // One-Time Abilities
  oneTimeBuild: boolean;
  oneTimeHook: boolean;
  oneTimeDoubleJump: boolean;
  oneTimeTripleJump: boolean;
  tripleJumpActive: boolean;

  // New Brawler Powerups
  shieldTimer: number;
  slowTimer: number;
  iceTimer: number;
  slimeTimer: number;
  fireballActive: boolean;
  bombActive: boolean;
  meleeActive: boolean;
  meleeTimer: number;
  onlineId?: string;
  targetPos?: Vector2; // For interpolation
  lastSyncTime?: number;
  platformDelta: Vector2;
  lastPlatformVel: Vector2;
  collectedPowerupIds: string[];
  hasStartedMove: boolean;
  moveStartTime: number;
  scrollX?: number; // Add scrollX
  // New Abilities
  dashCooldown: number;
  dashTimer: number;
  dashDirection: Vector2;
  isShrunk: boolean;
  isPermanentlyShrunk: boolean;
  shrinkTimer: number;
  isGrown: boolean;
  isPermanentlyGrown: boolean;
  growTimer: number;
  gravityFlipped: boolean;
  ghostOverlapIndices?: number[];
  respawnTimer?: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  isLocal?: boolean;
  rotationAngle?: number;
}
