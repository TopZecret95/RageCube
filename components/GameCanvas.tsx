import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  Vector2,
  LevelData,
  Entity,
  PlayerCustomization,
  EntityType,
  LevelAbility,
  GameSettings,
  Language,
  GhostFrame,
  GhostRun,
  Keybindings,
  BrawlerTeamMode,
  BrawlerHazardMode,
} from "../types";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRAVITY,
  FRICTION,
  ICE_FRICTION,
  SLIME_FRICTION,
  MOVE_ACCEL,
  MAX_SPEED,
  JUMP_FORCE,
  TRAMPOLINE_FORCE,
  SLIME_JUMP_FORCE,
  COLORS,
  WALL_JUMP_FORCE,
  WALL_SLIDE_SPEED,
  TILE_SIZE,
  HOOK_SPEED,
  HOOK_PULL_FORCE,
  MAX_JUMPS,
  TRANSLATIONS,
  HOOK_RANGE,
  HOOK_COOLDOWN,
  SLIME_WALL_SLIDE_SPEED,
} from "../constants";
import { audio } from "../services/audioService";

import { onlineService, OnlinePlayer } from "../services/onlineService";
import { drawPlayerEyes } from "./renderers/playerEyesRender";
import { drawPlayerAccessories } from "./renderers/playerAccessoriesRender";
import { drawProjectiles, drawBombs, drawExplosions } from "./renderers/projectilesRender";
import { getBrawlerStats, getBrawlerLives } from "../utils/brawlerStats";

import {
  GameCanvasProps,
  TempBlock,
  Projectile,
  Bomb,
  Explosion,
  Particle,
  PlayerState,
} from "./GameCanvasTypes";

const SLOW_MO_FACTOR = 0.4; // 40% speed
const SLOW_MO_DURATION = 300; // 5 seconds at 60fps

const getFusedPowerupType = (holding: string, picked: string): string => {
  if (holding === picked) {
    if (holding === "powerup_grow") return "powerup_titan";
    if (holding === "powerup_slow") return "powerup_blizzard";
    if (holding === "powerup_shield") return "powerup_thunder_shield";
    if (holding === "powerup_bomb") return "powerup_nuke_bomb";
    if (holding === "powerup_fireball") return "powerup_meteor_rain";
    if (holding === "powerup_melee") return "powerup_golden_sword";
    if (holding === "powerup_dash") return "powerup_teleport_dash";
    if (holding === "powerup_teleport") return "powerup_teleport_all";
    if (holding === "powerup_triple_jump") return "powerup_gravity_boots";
    if (holding === "powerup_steal") return "powerup_black_hole";
    if (holding === "powerup_ice_block") return "powerup_glacier";
    if (holding === "powerup_slime_block") return "powerup_trampoline";
    if (holding === "powerup_build") return "powerup_fortress";
    if (holding === "powerup_hook") return "powerup_voltage_hook";
    if (holding === "powerup_shrink") return "powerup_nano_spy";
    return holding;
  }

  // Cross-fusions
  if ((holding === "powerup_grow" && picked === "powerup_shrink") || (holding === "powerup_shrink" && picked === "powerup_grow")) {
    return "powerup_quantum_shift";
  }

  const isOpenOffensive = (type: string) => type === "powerup_fireball" || type === "powerup_bomb" || type === "powerup_melee";
  if ((holding === "powerup_shield" && isOpenOffensive(picked)) || (picked === "powerup_shield" && isOpenOffensive(holding))) {
    return "powerup_fire_shield";
  }

  if ((holding === "powerup_dash" && picked === "powerup_fireball") || (holding === "powerup_fireball" && picked === "powerup_dash")) {
    return "powerup_lodestar";
  }

  if ((holding === "powerup_melee" && picked === "powerup_ice_block") || (holding === "powerup_ice_block" && picked === "powerup_melee")) {
    return "powerup_frost_mourne";
  }

  if ((holding === "powerup_bomb" && picked === "powerup_slime_block") || (holding === "powerup_slime_block" && picked === "powerup_bomb")) {
    return "powerup_sticky_bomb";
  }

  if ((holding === "powerup_shield" && picked === "powerup_triple_jump") || (holding === "powerup_triple_jump" && picked === "powerup_shield")) {
    return "powerup_angel_wings";
  }

  if ((holding === "powerup_teleport" && picked === "powerup_steal") || (holding === "powerup_steal" && picked === "powerup_teleport")) {
    return "powerup_trickster";
  }

  return "powerup_chaos_orb";
};

const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  customization,
  customizationP2,
  onDie,
  onWin,
  onCoin,
  onBlockPlace,
  onJump,
  onHook,
  collectedCoins,
  paused,
  respawnTrigger,
  resetTrigger,
  gameMode,
  fpsCap,
  settings,
  brawlerPowerups,
  brawlerTeamMode,
  brawlerTeam1,
  brawlerTeam2,
  brawlerHazardMode,
  brawlerSuddenDeath,
  brawlerComboPowerups = false,
  vsCollision = true,
  isOnline,
  onlinePing,
  onlinePlayers,
  lang,
  isSpectating,
  spectateTargetId,
  opponentOpacity = 0.5,
  status,
  geometryDashMode = false,
  gdSpeedMode = 1,
  levelDeaths = 0,
  suppressCountdown = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef<{ [key: string]: boolean }>({});

  // Game State Refs
  const players = useRef<PlayerState[]>([]);
  const tempBlocks = useRef<TempBlock[]>([]);
  const dynamicPowerups = useRef<Entity[]>([]);
  const projectiles = useRef<Projectile[]>([]);
  const bombs = useRef<Bomb[]>([]);
  const explosions = useRef<Explosion[]>([]);
  const particles = useRef<Particle[]>([]);
  const cameraRef = useRef({ x: 0, y: 0 });
  const cameraZoom = useRef(1.0);
  const levelRef = useRef(level);
  const gluedBFSMapRef = useRef<{
    time: number;
    dt: number;
    connections: Map<string, any>;
  }>({
    time: -1,
    dt: -1,
    connections: new Map(),
  });
  useEffect(() => {
    levelRef.current = level;
  }, [level]);
  const cameraVel = useRef({ x: 0, y: 0 });
  const [spectateTargetIdx, setSpectateTargetIdx] = useState(0);

  useEffect(() => {
    const handleSpectatorKeys = (e: KeyboardEvent) => {
      const liveLocalPlayer = players.current.find((p) => p.isLocal);
      const isSpectatingNowLocal =
        isOnline &&
        (liveLocalPlayer
          ? liveLocalPlayer.finished
          : isSpectating ||
            (players.current.length > 0 && status.includes("playing")));
      if (!isSpectatingNowLocal) return;

      const activePlayers = players.current.filter((p) => !p.finished);
      if (activePlayers.length === 0) return;

      const keys = [
        "KeyA",
        "ArrowLeft",
        "KeyD",
        "ArrowRight",
        "KeyW",
        "ArrowUp",
        "KeyS",
        "ArrowDown",
      ];

      if (!keys.includes(e.code)) return;

      if (
        e.code === "KeyD" ||
        e.code === "ArrowRight" ||
        e.code === "KeyW" ||
        e.code === "ArrowUp"
      ) {
        setSpectateTargetIdx((prev) => (prev + 1) % activePlayers.length);
      } else {
        setSpectateTargetIdx(
          (prev) => (prev - 1 + activePlayers.length) % activePlayers.length,
        );
      }
    };

    window.addEventListener("keydown", handleSpectatorKeys);
    return () => window.removeEventListener("keydown", handleSpectatorKeys);
  }, [isSpectating, isOnline]);
  const collectedPowerups = useRef<string[]>([]); // Track collected powerup IDs to hide them

  const currentRespawnPos = useRef<Vector2>(
    level?.start ? { ...level.start } : { x: 0, y: 0 },
  ); // Checkpoint tracking
  const currentRespawnPosP2 = useRef<Vector2>(
    level?.startP2
      ? { ...level.startP2 }
      : level?.start
        ? { ...level.start }
        : { x: 0, y: 0 },
  ); // Checkpoint tracking for P2
  const gameTimeRef = useRef(0);
  const roundTimerRef = useRef(0);
  const fragileStates = useRef<Record<string, { touchedAt: number }>>({});
  const collapsingStates = useRef<Record<string, { touchedAt: number }>>({});
  const lastHazardTriggerTime = useRef(0);
  const lastPowerupSpawnTime = useRef(0);

  // Time Manipulation
  const timeScaleRef = useRef(1.0);
  const lastDrawTime = useRef(0);
  const slowMoTimerRef = useRef(0);
  const xrayTimerRef = useRef(0);

  // Building State
  const blockDims = useRef({ w: TILE_SIZE, h: TILE_SIZE });
  const mouseRef = useRef({ x: 0, y: 0 });

  // UI State
  const resetPlayerSize = (p: PlayerState) => {
    p.isShrunk = false;
    p.isPermanentlyShrunk = false;
    p.shrinkTimer = 0;
    p.isGrown = false;
    p.isPermanentlyGrown = false;
    p.growTimer = 0;
    p.w = 20;
    p.h = 20;
    p.collectedPowerupIds = [];
    p.hasStartedMove = false;
    p.moveStartTime = 0;
    p.scrollX = 0;
    if (p.gravityFlipped) {
      p.gravityFlipped = false;
      p.gravity = GRAVITY;
    }
    // Clear blocks placed by this player
    tempBlocks.current = tempBlocks.current.filter(
      (b) => b.ownerIndex !== p.playerIndex,
    );
  };

  const abilityMessageRef = useRef<string | null>(null);

  // Screen Shake
  const shakeIntensity = useRef(0);

  // Ghost Run State
  const recordedFrames = useRef<GhostFrame[]>([]);
  const [ghostRun, setGhostRun] = useState<GhostRun | null>(null);

  const [startCountdown, setStartCountdown] = useState<number | null>(null);
  const isStartingRef = useRef(false);

  // Web Worker for Physics
  const physicsWorker = useRef<Worker | null>(null);
  const workerReady = useRef(false);

  useEffect(() => {
    // Only initialize worker if enabled in settings or if we want to offload anyway
    // Removed because physics is processed locally, avoiding dual execution latency
  }, []);

  useEffect(() => {
    if (suppressCountdown) {
      setStartCountdown(null);
      isStartingRef.current = false;
    } else if (gameMode === "vs" || gameMode === "brawler" || isOnline) {
      setStartCountdown(3);
      isStartingRef.current = true;
    } else {
      setStartCountdown(null);
      isStartingRef.current = false;
    }
  }, [level.id, gameMode, isOnline, suppressCountdown]);

  useEffect(() => {
    if (startCountdown === null) {
      return;
    }
    if (startCountdown > 0) {
      isStartingRef.current = true; // Ensure it's true while counting down
      const t = setTimeout(() => setStartCountdown(startCountdown - 1), 1000);
      return () => clearTimeout(t);
    } else if (startCountdown === 0) {
      isStartingRef.current = false;
      levelStartTime.current = Date.now();
      hasStartedMoving.current = true;
      const t = setTimeout(() => setStartCountdown(null), 1000);
      return () => clearTimeout(t);
    }
  }, [startCountdown]);

  const brawlerSpawnPoints = useRef<
    { x: number; y: number; lastUsed: number }[]
  >([]);

  useEffect(() => {
    brawlerSpawnPoints.current = [];
  }, [level.id, gameMode]);

  const getBrawlerSpawnPoints = () => {
    const spawns: { x: number; y: number; lastUsed: number }[] = [];
    levelRef.current.entities.forEach((e) => {
      if (
        e.type === "wall" ||
        e.type === "ice" ||
        e.type === "slime" ||
        e.type === "fragile"
      ) {
        const playerBox = { x: e.x + 2, y: e.y - 22, w: e.w - 4, h: 20 };
        const clear = !levelRef.current.entities.some(
          (other) =>
            (other.type === "wall" ||
              other.type === "ice" ||
              other.type === "slime" ||
              other.type === "hazard") &&
            other !== e &&
            other.x < playerBox.x + playerBox.w &&
            other.x + other.w > playerBox.x &&
            other.y < playerBox.y + playerBox.h &&
            other.y + other.h > playerBox.y,
        );
        if (clear) {
          const numSpawns = Math.max(1, Math.floor(e.w / 40));
          for (let i = 0; i < numSpawns; i++) {
            const spawnX =
              e.x + (e.w / numSpawns) * i + e.w / numSpawns / 2 - 10;
            spawns.push({ x: spawnX, y: e.y - 20, lastUsed: 0 });
          }
        }
      }
    });
    if (spawns.length === 0) {
      spawns.push({
        x: level.start?.x || 0,
        y: level.start?.y || 0,
        lastUsed: 0,
      });
    }
    return spawns;
  };

  const getSpawnPos = (pIdx: number, team: number) => {
    // For multiplayer (online or local vs/brawler with multiple players), always start at the same point
    // to ensure everyone has the same distance to the goal, as requested.
    if (
      isOnline ||
      gameMode === "vs" ||
      (gameMode === "brawler" && players.current.length > 1)
    ) {
      return { ...currentRespawnPos.current };
    }

    if (gameMode === "brawler") {
      if (brawlerSpawnPoints.current.length === 0) {
        brawlerSpawnPoints.current = getBrawlerSpawnPoints();
      }
      const now = Date.now();
      let available = brawlerSpawnPoints.current.filter(
        (p) => now - p.lastUsed > 2000,
      );
      if (available.length === 0) available = brawlerSpawnPoints.current;

      const idx = Math.floor(Math.random() * available.length);
      const pt = available[idx];
      pt.lastUsed = now;
      return { x: pt.x, y: pt.y };
    }

    if (team === 0) return { ...currentRespawnPos.current };
    return {
      x: currentRespawnPosP2.current.x,
      y: currentRespawnPosP2.current.y,
    };
  };

  const ghostFrameIndex = useRef(0);
  const hasStartedMoving = useRef(false);
  const scrollWallX = useRef(0);
  const levelStartTime = useRef(Date.now());

  useEffect(() => {
    levelStartTime.current = Date.now();
  }, [level.id]);
  const collectedCoinsRef = useRef<string[]>(collectedCoins);

  useEffect(() => {
    collectedCoinsRef.current = collectedCoins;
  }, [collectedCoins]);

  const spawnParticles = useCallback(
    (x: number, y: number, color: string, count: number, type: string) => {
      const isDeath =
        count === 20 &&
        [
          "normal",
          "blood",
          "confetti",
          "firework",
          "electric",
          "ghost",
          "freeze",
          "blackhole",
          "bubble",
          "dust",
        ].includes(type);

      if (isDeath) {
        if (type === "normal") return;
        particles.current.push({
          x,
          y,
          vx: 0,
          vy: 0,
          life: 1,
          size: 20,
          color,
          type,
          isDeathAnim: true,
          startTime: Date.now(),
        });
        return;
      }

      for (let i = 0; i < count; i++) {
        let vx, vy, life, size;
        let pColor = color;
        if (type === "dust") {
          vx = (Math.random() - 0.5) * 4;
          vy = -Math.random() * 2;
          life = 0.5 + Math.random() * 0.5;
          size = Math.random() * 4 + 2;
        } else if (type === "spark" || type === "blood") {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
          life = 0.8 + Math.random() * 0.4;
          size = Math.random() * 3 + 1;
        } else if (type === "electric") {
          vx = (Math.random() - 0.5) * 10;
          vy = (Math.random() - 0.5) * 10;
          life = 0.3 + Math.random() * 0.3;
          size = Math.random() * 2 + 1;
          pColor = "#00ffff";
        } else if (type === "ghost") {
          vx = (Math.random() - 0.5) * 2;
          vy = -Math.random() * 4;
          life = 1.0 + Math.random() * 1.0;
          size = Math.random() * 10 + 5;
          pColor = "rgba(255, 255, 255, 0.5)";
        } else if (type === "freeze") {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 1;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
          life = 1.0 + Math.random() * 0.5;
          size = Math.random() * 5 + 3;
          pColor = "#88ccff";
        } else if (type === "blackhole") {
          vx = (Math.random() - 0.5) * 1;
          vy = (Math.random() - 0.5) * 1;
          life = 1.5;
          size = 15 * (1 - i / count);
          pColor = "black";
        } else if (type === "bubble") {
          vx = (Math.random() - 0.5) * 3;
          vy = -Math.random() * 5;
          life = 1.0 + Math.random() * 0.5;
          size = Math.random() * 6 + 2;
          pColor = "rgba(100, 200, 255, 0.6)";
        } else if (type === "confetti") {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 8 + 3;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
          life = 1.0 + Math.random() * 0.8;
          size = Math.random() * 4 + 2;
          const colors = [
            "#ef4444",
            "#3b82f6",
            "#22c55e",
            "#eab308",
            "#a855f7",
          ];
          pColor = colors[Math.floor(Math.random() * colors.length)];
        } else if (type === "firework") {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 10 + 4;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
          life = 0.6 + Math.random() * 0.4;
          size = Math.random() * 5 + 2;
        } else {
          // coin
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 1.5 + 0.5;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
          life = 0.5 + Math.random() * 0.3;
          size = Math.random() * 1.5 + 1.0;
        }

        particles.current.push({
          x,
          y,
          vx,
          vy,
          life,
          size,
          color: pColor,
          type,
        });
      }
    },
    [],
  );

  const healVampire = useCallback(
    (killerName?: string) => {
      if (!killerName || gameMode !== "brawler") return;
      const killer = players.current.find((p) => p.name === killerName);
      if (!killer || killer.finished || killer.brawlerClass !== "vampire")
        return;
      const stats = getBrawlerStats(killer.brawlerClass, gameMode);
      if (killer.lives !== undefined && killer.lives < stats.lives) {
        killer.lives++;
        spawnParticles(
          killer.pos.x + killer.w / 2,
          killer.pos.y + killer.h / 2,
          "#ff0000",
          30,
          "blood",
        );
      }
    },
    [gameMode, spawnParticles],
  );

  const triggerWin = useCallback(
    (winnerName?: string, isLocalFinish: boolean = true) => {
      const livesStats: Record<string, number> = {};
      const broughtCoins: Record<string, string[]> = {};
      players.current.forEach((p) => {
        if (gameMode === "brawler") {
          if (p.lives !== undefined) livesStats[p.name] = p.lives;
        } else {
          livesStats[p.name] = p.deaths || 0;
        }
        if (p.finished && !p.dead && p.collectedCoinIds && p.collectedCoinIds.length > 0) {
          broughtCoins[p.name] = [...p.collectedCoinIds];
        }
      });
      const exactTime = (Date.now() - levelStartTime.current) / 1000;
      onWin(winnerName, livesStats, exactTime, isLocalFinish, broughtCoins);
    },
    [onWin, gameMode],
  );

  const checkBuildBattleWinCondition = useCallback(() => {
    const allPlayers = players.current;
    if (allPlayers.length === 0) return false;

    const alivePlayers = allPlayers.filter(p => !p.dead && !p.finished);
    
    // If there is still someone alive and not finished, the round continues!
    if (alivePlayers.length > 0) return false;

    // Okay, everyone is either dead or reached the goal.
    const goalReachPlayers = allPlayers.filter(p => p.finished && !p.dead);
    // Sort by finishTime if available to get the first to finish
    goalReachPlayers.sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0));
    
    if (goalReachPlayers.length === 0) {
       // Everyone died. Nobody reached the goal. No points.
       triggerWin(undefined);
       return true;
    }

    if (goalReachPlayers.length === allPlayers.length) {
       // Everyone reached the goal! The level is too easy! No points!
       triggerWin("EVERYONE_FINISHED"); // Special flag
       return true;
    }

    // Otherwise, whoever finished FIRST gets the win!
    triggerWin(goalReachPlayers[0].name);
    return true;
  }, [triggerWin]);

  const checkBrawlerWinCondition = useCallback(() => {
    const allPlayers = players.current;
    if (allPlayers.length === 0) return false;

    const alivePlayers = allPlayers.filter(
      (pl) => (pl.lives ?? 0) > 0 && !pl.finished,
    );
    const remainingTeams = new Set(alivePlayers.map((pl) => pl.team));

    // Get initial teams count
    const initialTeams = new Set(allPlayers.map((pl) => pl.team));
    const initialTeamCount = initialTeams.size;

    // The round should end if only one team (or zero for a draw) remains
    const onlyOneTeamLeft = remainingTeams.size <= 1;
    const onlyOnePlayerLeft = alivePlayers.length <= 1;

    // End if only one team remains (standard)
    // OR if there was only one team to begin with, end when only one player remains
    const shouldEnd =
      (initialTeamCount > 1 && onlyOneTeamLeft) ||
      (initialTeamCount === 1 && onlyOnePlayerLeft && allPlayers.length > 1);

    if (shouldEnd) {
      const winnerName =
        remainingTeams.size === 1
          ? alivePlayers.length > 1 && brawlerTeamMode === "TEAMS"
            ? `TEAM ${(Array.from(remainingTeams)[0] as number) + 1}`
            : alivePlayers[0].name
          : "DRAW";

      triggerWin(winnerName);
      return true;
    }
    return false;
  }, [triggerWin, brawlerTeamMode]);

  const getTeamColor = (team: number) => {
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
    return teamColors[team % teamColors.length];
  };

  const initPlayers = (isRespawn = false) => {
    if (level.autoScroll || geometryDashMode) {
      if (level.start) currentRespawnPos.current = { ...level.start };
      cameraRef.current.x = Math.max(
        0,
        currentRespawnPos.current.x - GAME_WIDTH / 2 + 15,
      );
      cameraRef.current.y = 0;
      scrollWallX.current = cameraRef.current.x;
      hasStartedMoving.current = geometryDashMode ? true : false;
    }

    // Capture existing metrics if it is a respawn
    const coinsMap = new Map<string, string[]>();
    const deathsMap = new Map<string, number>();
    if (isRespawn && players.current && players.current.length > 0) {
      players.current.forEach((p) => {
        const key = p.onlineId || p.name || p.playerIndex.toString();
        if (p.collectedCoinIds) {
          coinsMap.set(key, [...p.collectedCoinIds]);
        }
        if (p.deaths !== undefined) {
          deathsMap.set(key, p.deaths);
        }
      });
    }

    const common = {
      pos: { ...currentRespawnPos.current }, // Use dynamic respawn pos
      vel: { x: 0, y: 0 },
      w: 20,
      h: 20,
      facing: 1,
      isGrounded: false,
      wasGrounded: false,
      isWallSliding: false,
      wallDir: 0,
      canJump: true,
      trail: [],
      finished: false,
      dead: false,
      gravity: GRAVITY,
      teleportCooldown: 0,
      teleportMaxCooldown: 120, // 2 seconds
      surfaceType: "none" as const,
      wallSurfaceType: "none" as const,
      wallStickTimer: 0,
      wallCoyoteTimer: 0,
      lastWallDir: 0,
      jumpCount: 0,
      hookActive: false,
      hookPos: null,
      hookCooldown: 0,
      hookDuration: 0,
      oneTimeBuild: false,
      oneTimeHook: false,
      oneTimeDoubleJump: false,
      oneTimeTripleJump: false,
      tripleJumpActive: false,
      shieldTimer: 0,
      slowTimer: 0,
      meleeActive: false,
      meleeTimer: 0,
      platformDelta: { x: 0, y: 0 },
      lastPlatformVel: { x: 0, y: 0 },
      collectedPowerupIds: [],
      collectedCoinIds: [],
      hasStartedMove: false,
      moveStartTime: 0,
      dashCooldown: 0,
      dashTimer: 0,
      dashDirection: { x: 0, y: 0 },
      isShrunk: false,
      isPermanentlyShrunk: false,
      shrinkTimer: 0,
      isGrown: false,
      isPermanentlyGrown: false,
      growTimer: 0,
      gravityFlipped: false,
      ghostOverlapIndices: [],
      respawnTimer: 0,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      rotationAngle: 0,
    };

    const defaultP1Controls: Keybindings = {
      up: ["KeyW"],
      left: ["KeyA"],
      right: ["KeyD"],
      down: ["KeyS"],
      action: ["KeyQ"],
      dash: ["KeyF", "GP_B1"],
    };
    const defaultP2Controls: Keybindings = {
      up: ["ArrowUp"],
      left: ["ArrowLeft"],
      right: ["ArrowRight"],
      down: ["ArrowDown"],
      action: ["ControlRight", "ControlLeft", "Numpad0", "Digit0"],
      dash: ["ShiftRight", "GP_B1"],
    };
    const defaultSingleControls: Keybindings = {
      up: ["ArrowUp", "KeyW", "Space"],
      left: ["ArrowLeft", "KeyA"],
      right: ["ArrowRight", "KeyD"],
      down: ["ArrowDown", "KeyS"],
      action: ["KeyQ", "ControlRight", "ControlLeft", "Numpad0", "Digit0"],
      dash: ["KeyE", "ShiftRight"],
    };

    const p1Controls = settings.keybindingsP1 || defaultP1Controls;
    const p2Controls = settings.keybindingsP2 || defaultP2Controls;
    const singleControls = settings.keybindingsP1 || defaultSingleControls;

    const getTeam = (idx: number, op?: any) => {
      if (gameMode !== "brawler") return idx;
      if (op && typeof op.team === "number") return op.team;
      if (idx === 0 && typeof brawlerTeam1 === "number") return brawlerTeam1;
      if (idx === 1 && typeof brawlerTeam2 === "number") return brawlerTeam2;
      return idx; // fallback
    };

    if (isOnline && onlinePlayers) {
      players.current = onlinePlayers.map((op, idx) => {
        const isLocal = op.id === onlineService.localPlayer?.id;
        const team = getTeam(idx, op);
        const teamColor = getTeamColor(team);
        return {
          ...JSON.parse(JSON.stringify(common)),
          pos:
            idx === 0
              ? { ...currentRespawnPos.current }
              : {
                  x: currentRespawnPosP2.current.x,
                  y: currentRespawnPosP2.current.y,
                },
          controls: isLocal
            ? singleControls
            : { up: [], left: [], right: [], down: [], action: [] },
          color: op.customization.color || teamColor,
          trailColor: op.customization.trailColor || teamColor,
          eyes: op.customization.eyes,
          accessory: op.customization.accessory,
          deathAnim: op.customization.deathAnim || "normal",
          deathSound: op.customization.deathSound || "default",
          trailType: op.customization.trailType || "normal",
          brawlerClass: op.customization.brawlerClass || "standard",
          continuousRotation: op.customization.continuousRotation,
          name: op.name || `Player ${idx + 1}`,
          playerIndex: idx,
          team: team,
          lives:
            gameMode === "brawler"
              ? getBrawlerLives(op.customization.brawlerClass, gameMode)
              : undefined,
          deaths: 0,
          inventory: null,
          oneTimeDoubleJump: gameMode === "brawler" ? true : false,
          onlineId: op.id,
          isLocal,
        };
      });
    } else if (gameMode === "vs" || gameMode === "brawler") {
      const p2Config = customizationP2 || {
        color: "#00ff88",
        trailColor: "#00ff88",
        eyes: "normal",
        accessory: "none",
        deathAnim: "normal",
        deathSound: "default",
        trailType: "normal",
      };
      players.current = [
        {
          ...JSON.parse(JSON.stringify(common)),
          pos: getSpawnPos(0, getTeam(0)),
          controls: p1Controls,
          color: customization?.color || getTeamColor(getTeam(0)) || "#ffffff",
          trailColor:
            customization?.trailColor || getTeamColor(getTeam(0)) || "#ffffff",
          eyes: customization?.eyes || "normal",
          accessory: customization?.accessory || "none",
          deathAnim: customization?.deathAnim || "normal",
          deathSound: customization?.deathSound || "default",
          trailType: customization?.trailType || "normal",
          brawlerClass: customization?.brawlerClass || "standard",
          continuousRotation: customization?.continuousRotation,
          name: "P1",
          playerIndex: 0,
          team: getTeam(0),
          lives:
            gameMode === "brawler"
              ? getBrawlerLives(customization?.brawlerClass, gameMode)
              : undefined,
          deaths: 0,
          inventory: null,
          isLocal: true,
          oneTimeDoubleJump: gameMode === "brawler" ? true : false,
        },
        {
          ...JSON.parse(JSON.stringify(common)),
          pos: getSpawnPos(1, getTeam(1)),
          controls: p2Controls,
          color: p2Config.color || getTeamColor(getTeam(1)),
          trailColor: p2Config.trailColor || getTeamColor(getTeam(1)),
          eyes: p2Config.eyes || "normal",
          accessory: p2Config.accessory || "none",
          deathAnim: (p2Config as any).deathAnim || "normal",
          deathSound: (p2Config as any).deathSound || "default",
          trailType: (p2Config as any).trailType || "normal",
          brawlerClass: (p2Config as any).brawlerClass || "standard",
          continuousRotation: (p2Config as any).continuousRotation,
          name: "P2",
          playerIndex: 1,
          team: getTeam(1),
          lives:
            gameMode === "brawler"
              ? getBrawlerLives((p2Config as any).brawlerClass, gameMode)
              : undefined,
          deaths: 0,
          inventory: null,
          isLocal: false,
          oneTimeDoubleJump: gameMode === "brawler" ? true : false,
        },
      ];
    } else {
      players.current = [
        {
          ...JSON.parse(JSON.stringify(common)),
          controls: singleControls,
          color: customization?.color || "#ffffff",
          trailColor: customization?.trailColor || "#ffffff",
          eyes: customization?.eyes || "normal",
          accessory: customization?.accessory || "none",
          deathAnim: customization?.deathAnim || "normal",
          deathSound: customization?.deathSound || "default",
          trailType: customization?.trailType || "normal",
          brawlerClass: customization?.brawlerClass || "standard",
          continuousRotation: customization?.continuousRotation,
          name: "P1",
          playerIndex: 0,
          inventory: null,
          isLocal: true,
        },
      ];
    }

    // Allow players to overlap at spawn so they don't immediately collide if starting at the same point
    players.current.forEach((p) => {
      p.ghostOverlapIndices = players.current
        .filter((other) => other.playerIndex !== p.playerIndex)
        .map((other) => other.playerIndex);
    });

    // Restore captured metrics
    if (isRespawn) {
      players.current.forEach((p) => {
        const key = p.onlineId || p.name || p.playerIndex.toString();
        if (coinsMap.has(key)) {
          p.collectedCoinIds = geometryDashMode ? [] : (coinsMap.get(key) || []);
        }
        if (deathsMap.has(key)) {
          p.deaths = deathsMap.get(key) || 0;
        }
      });
    }

    if (geometryDashMode) {
      hasStartedMoving.current = true;
      players.current.forEach((p) => {
        p.hasStartedMove = true;
        const scrollSpeed = 260;
        const startWallX = Math.max(0, p.pos.x - GAME_WIDTH / 2 + 15);
        p.moveStartTime = Date.now() - (startWallX / scrollSpeed) * 1000;
        p.scrollX = startWallX;
        p.vel.x = scrollSpeed / 60;
      });
    }

    console.log("initPlayers called, players.current:", players.current);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "r" &&
        !paused &&
        (gameMode === "story" ||
          gameMode === "random_run" ||
          gameMode === "testing")
      ) {
        onDie(); // Trigger restart logic
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paused, gameMode, onDie]);

  // Online Sync Listeners
  useEffect(() => {
    if (!isOnline) return;

    onlineService.onSync = (id, state) => {
      const p = players.current.find((p) => p.onlineId === id);
      if (p) {
        // Ignore older syncs to prevent jitter from fallback Firestore updates
        if (p.lastSyncTime && state.timestamp < p.lastSyncTime) return;

        // Store target for interpolation
        if (state.pos) {
          p.targetPos = { x: state.pos.x, y: state.pos.y };
        }
        if (state.vel) {
          p.vel.x = state.vel.x;
          p.vel.y = state.vel.y;
        }
        p.lastSyncTime = state.timestamp;

        if (state.facing !== undefined) p.facing = state.facing;
        if (state.isGrounded !== undefined) p.isGrounded = state.isGrounded;
        if (state.isWallSliding !== undefined)
          p.isWallSliding = state.isWallSliding;
        if (state.wallDir !== undefined) p.wallDir = state.wallDir;
        if (state.moveStartTime !== undefined)
          p.moveStartTime = state.moveStartTime;

        if (state.health !== undefined) p.lives = state.health;
        if (state.finished !== undefined) p.finished = state.finished;
        if (state.inventory !== undefined) p.inventory = state.inventory as any;
        if (state.hookActive !== undefined) p.hookActive = state.hookActive;
        if (state.hookPos !== undefined) p.hookPos = state.hookPos;
        if (state.oneTimeBuild !== undefined)
          p.oneTimeBuild = state.oneTimeBuild;
        if (state.oneTimeHook !== undefined) p.oneTimeHook = state.oneTimeHook;
      }
    };

    onlineService.onEvent = (id, event, data) => {
      if (event === "die") {
        const p = players.current.find((p) => p.onlineId === id);
        if (p) {
          audio.playDie(p.deathSound);
          resetPlayerSize(p);
          // Handle death visually
          p.pos = getSpawnPos(p.playerIndex, p.team);
          p.vel = { x: 0, y: 0 };
          p.targetPos = { ...p.pos }; // Reset target pos to prevent interpolation back to death location
        }
        if (data && data.killerName) {
          healVampire(data.killerName);
        }
      } else if (event === "win") {
        const p = players.current.find((p) => p.onlineId === id);
        if (p) {
          p.finished = true;
          if (gameMode === "brawler") {
            checkBrawlerWinCondition();
          } else {
            triggerWin(p.name, false);
          }
        }
      } else if (event === "lose") {
        const p = players.current.find((p) => p.onlineId === id);
        if (p) {
          p.finished = true;
        }
        if (gameMode === "brawler") {
          checkBrawlerWinCondition();
        } else {
          const otherPlayer = players.current.find((p) => p.onlineId !== id);
          if (otherPlayer) {
            triggerWin(otherPlayer.name, false);
          }
        }
        if (data && data.killerName) {
          healVampire(data.killerName);
        }
      } else if (event === "bounced_on") {
        if (data && data.killerName) {
          healVampire(data.killerName);
        }
        if (data.targetId === onlineService.localPlayer?.id) {
          const localP = players.current.find(
            (p) => p.onlineId === onlineService.localPlayer?.id,
          );
          if (localP && localP.lives !== undefined) {
            localP.lives--;
            if (localP.lives <= 0) {
              checkBrawlerWinCondition();
              onlineService.sendEvent("lose", { killerName: data.killerName });
            } else {
              localP.pos =
                localP.playerIndex === 0
                  ? { ...currentRespawnPos.current }
                  : {
                      x:
                        currentRespawnPosP2.current.x +
                        (localP.playerIndex - 1) * 16,
                      y: currentRespawnPosP2.current.y,
                    };
              localP.vel = { x: 0, y: 0 };
              resetPlayerSize(localP);
              shakeIntensity.current = 10;
              audio.playDie(localP.deathSound);
              onlineService.sendEvent("die", { killerName: data.killerName });
            }
          }
        }
      } else if (event === "powerup_collected") {
        const p = players.current.find((pl) => pl.onlineId === id);
        if (p && data.id && !p.collectedPowerupIds.includes(data.id)) {
          p.collectedPowerupIds.push(data.id);
        }
      } else if (event === "coin_collected") {
        const p = players.current.find((pl) => pl.onlineId === id);
        if (p && data.coinId) {
          if (!p.collectedCoinIds) p.collectedCoinIds = []; // safe guard
          if (!p.collectedCoinIds.includes(data.coinId)) {
            p.collectedCoinIds.push(data.coinId);
          }
        }
      } else if (event === "powerup_spawned") {
        dynamicPowerups.current.push(data);
      } else if (event === "powerup_used") {
        const p = players.current.find((p) => p.onlineId === id);
        if (p) {
          const enemies = players.current.filter(
            (op) =>
              op.onlineId !== id &&
              (p.team === undefined ||
                op.team === undefined ||
                p.team !== op.team),
          );

          if (data.type === "powerup_steal") {
            const targetId = data.targetId;
            const victim = targetId
              ? enemies.find((e) => e.onlineId === targetId)
              : enemies.find((e) => e.inventory);
            if (victim) {
              p.inventory = victim.inventory;
              victim.inventory = null;
            }
          } else if (data.type === "powerup_slow") {
            enemies.forEach((opponent) => {
              opponent.slowTimer = 240;
            });
          } else if (data.type === "powerup_shield") {
            p.shieldTimer = 180;
          } else if (data.type === "powerup_ice_block") {
            p.iceTimer = 120;
          } else if (data.type === "powerup_slime_block") {
            p.slimeTimer = 120;
          } else if (data.type === "powerup_fireball") {
            p.fireballActive = true;
          } else if (data.type === "powerup_teleport") {
            p.pos = getSpawnPos(p.playerIndex, p.team);
            p.vel = { x: 0, y: 0 };
          } else if (data.type === "powerup_triple_jump") {
            p.tripleJumpActive = true;
          } else if (data.type === "powerup_bomb") {
            p.bombActive = true;
          } else if (data.type === "powerup_melee") {
            p.meleeActive = true;
            p.meleeTimer = 15;
            if (data.hit) {
              enemies.forEach((opponent) => {
                const hitBoxW = gameMode === "brawler" ? 60 : 20;
                const hitBox = {
                  x: p.pos.x + (p.facing === 1 ? 20 : -hitBoxW),
                  y: p.pos.y,
                  w: hitBoxW,
                  h: 20,
                };
                const opBox = {
                  x: opponent.pos.x,
                  y: opponent.pos.y,
                  w: opponent.w,
                  h: opponent.h,
                };
                if (
                  checkCollision(hitBox, opBox) &&
                  opponent.shieldTimer <= 0
                ) {
                  if (gameMode === "brawler" && opponent.lives !== undefined) {
                    if (opponent.onlineId === onlineService.localPlayer?.id) {
                      opponent.lives--;
                      if (opponent.lives <= 0) {
                        opponent.finished = true;
                        checkBrawlerWinCondition();
                        onlineService.sendEvent("lose", null);
                      } else {
                        opponent.pos = getSpawnPos(
                          opponent.playerIndex,
                          opponent.team,
                        );
                        opponent.vel = { x: 0, y: 0 };
                        resetPlayerSize(opponent);
                        shakeIntensity.current = 20;
                        audio.playDie(opponent.deathSound);
                        onlineService.sendEvent("die", null);
                      }
                    }
                  } else {
                    opponent.vel.x = p.facing * 15;
                    opponent.vel.y = -5;
                    if (opponent.onlineId === onlineService.localPlayer?.id) {
                      shakeIntensity.current = 15;
                    }
                  }
                }
              });
            }
          } else if (data.type === "powerup_shrink") {
            if (!p.isShrunk) {
              p.isShrunk = true;
              p.isPermanentlyShrunk = false;
              p.isGrown = false;
              p.isPermanentlyGrown = false;
              p.w = 10;
              p.h = 10;
              p.pos.y += 10;
            }
            p.shrinkTimer = 480;
            p.growTimer = 0;
          } else if (data.type === "powerup_grow") {
            enemies.forEach((opponent) => {
              if (opponent.shieldTimer <= 0) {
                if (!opponent.isGrown) {
                  opponent.isGrown = true;
                  opponent.isPermanentlyGrown = false;
                  if (opponent.isShrunk) {
                    opponent.isShrunk = false;
                    opponent.isPermanentlyShrunk = false;
                    opponent.w = 40;
                    opponent.h = 40;
                    opponent.pos.y -= 30;
                  } else {
                    opponent.w = 40;
                    opponent.h = 40;
                    opponent.pos.y -= 20;
                  }
                }
                opponent.growTimer = 480;
                opponent.shrinkTimer = 0;
              }
            });
          } else if (data.type === "powerup_dash") {
            p.dashTimer = 10;
            p.dashCooldown = 60;
            p.dashDirection = { x: p.facing, y: 0 };
            audio.playJump();
            spawnParticles(
              p.pos.x + p.w / 2,
              p.pos.y + p.h / 2,
              p.color,
              10,
              "spark",
            );
          } else if (data.type === "powerup_dash_hit") {
            const target = data.targetId
              ? players.current.find((op) => op.onlineId === data.targetId)
              : null;
            if (
              target &&
              target.shieldTimer <= 0 &&
              (p.team === undefined ||
                target.team === undefined ||
                p.team !== target.team)
            ) {
              const pStats = getBrawlerStats(p.brawlerClass, gameMode);
              const oStats = getBrawlerStats(target.brawlerClass, gameMode);

              const targetMultiplier = oStats.kbTaken * pStats.kbDealt;
              target.vel.x =
                (data.direction !== undefined
                  ? data.direction
                  : p.dashDirection.x) *
                43 *
                targetMultiplier;
              target.vel.y = -10 * targetMultiplier;
              if (target.onlineId === onlineService.localPlayer?.id) {
                shakeIntensity.current = 10;
              }
            }
          }
        }
      } else if (event === "bomb") {
        bombs.current.push(data);
      } else if (event === "projectile") {
        projectiles.current.push(data);
      } else if (event === "block") {
        tempBlocks.current.push(data);
      } else if (event === "block_updated") {
        const block = levelRef.current.entities.find(
          (e) => e.x === data.x && e.y === data.y,
        );
        if (block) block.type = data.type;
        const tBlock = tempBlocks.current.find(
          (e) => e.x === data.x && e.y === data.y,
        );
        if (tBlock) tBlock.type = data.type;
      } else if (event === "hazard_trigger") {
        if (data.id) {
          collapsingStates.current[data.id] = {
            touchedAt: data.time || Date.now() % 10000000,
          };
        }
      }
    };

    return () => {
      onlineService.onSync = undefined;
      onlineService.onEvent = undefined;
    };
  }, [isOnline]);

  // Sync players list with onlinePlayers
  useEffect(() => {
    if (!isOnline || !onlinePlayers) return;

    const currentIds = players.current.map((p) => p.onlineId);
    const newIds = onlinePlayers.map((p) => p.id);

    // Remove disconnected players
    players.current = players.current.filter((p) =>
      newIds.includes(p.onlineId!),
    );

    // Add new players
    onlinePlayers.forEach((op, idx) => {
      const p = players.current.find((pl) => pl.onlineId === op.id);
      const isLocal = op.id === onlineService.localPlayer?.id;

      if (p) {
        // Update isLocal status for existing players to handle race conditions
        p.isLocal = isLocal;
        p.name = op.name;
        p.customization = op.customization;
        if (isLocal)
          p.controls = settings.keybindingsP1 || {
            up: ["ArrowUp", "KeyW", "Space"],
            left: ["ArrowLeft", "KeyA"],
            right: ["ArrowRight", "KeyD"],
            down: ["ArrowDown", "KeyS"],
            action: [
              "KeyQ",
              "KeyE",
              "ControlRight",
              "ControlLeft",
              "Numpad0",
              "Digit0",
            ],
            dash: ["KeyF", "ShiftRight"],
          };
      } else {
        const defaultSingleControls: Keybindings = {
          up: ["ArrowUp", "KeyW", "Space"],
          left: ["ArrowLeft", "KeyA"],
          right: ["ArrowRight", "KeyD"],
          down: ["ArrowDown", "KeyS"],
          action: [
            "KeyQ",
            "KeyE",
            "ControlRight",
            "ControlLeft",
            "Numpad0",
            "Digit0",
          ],
          dash: ["KeyF", "ShiftRight"],
        };
        const singleControls = settings.keybindingsP1 || defaultSingleControls;

        const getTeam = (idxVal: number, opVal?: any) => {
          if (gameMode !== "brawler") return idxVal;
          if (opVal && typeof opVal.team === "number") return opVal.team;
          return idxVal;
        };

        const getTeamColor = (teamValue: number) => {
          if (gameMode !== "brawler") return null;
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
          return teamColors[teamValue % teamColors.length];
        };

        const team = getTeam(idx, op);
        const teamColor = getTeamColor(team);

        players.current.push({
          pos: getSpawnPos(idx, team),
          vel: { x: 0, y: 0 },
          w: 20,
          h: 20,
          facing: 1,
          isGrounded: false,
          isWallSliding: false,
          wallDir: 0,
          lives:
            gameMode === "brawler"
              ? getBrawlerLives(op.customization.brawlerClass)
              : undefined,
          deaths: 0,
          finished: false,
          inventory: null,
          controls: isLocal
            ? singleControls
            : { up: [], left: [], right: [], down: [], action: [] },
          customization: op.customization,
          onlineId: op.id,
          isLocal,
          targetPos: { x: 0, y: 0 },
          targetVel: { x: 0, y: 0 },
          name: op.name,
          playerIndex: idx,
          team: team,
          color: op.customization.color || "#ffffff",
          trailColor: op.customization.trailColor || "#ffffff",
          oneTimeDoubleJump: gameMode === "brawler" ? true : false,
          collectedPowerupIds: [],
        });
      }
    });
  }, [onlinePlayers, isOnline, settings.keybindingsP1, gameMode]);

  // Full Level Reset
  useEffect(() => {
    setGhostRun(null);
    // Reset respawn point when level changes
    if (level) {
      currentRespawnPos.current = level.start
        ? { ...level.start }
        : { x: 0, y: 0 };
      currentRespawnPosP2.current = level.startP2
        ? { ...level.startP2 }
        : level.start
          ? { ...level.start }
          : { x: 0, y: 0 };

      // Load Ghost
      const isGhostDisabled =
        isOnline || gameMode === "vs" || gameMode === "brawler";
      const savedGhost =
        settings.showGhost && !isGhostDisabled
          ? localStorage.getItem(`ghost_${level.id}`)
          : null;
      if (savedGhost) {
        try {
          const parsed = JSON.parse(savedGhost);
          if (parsed && parsed.frames) {
            setGhostRun(parsed);
          } else {
            setGhostRun(null);
          }
        } catch (e) {
          console.error("Failed to load ghost", e);
        }
      } else {
        setGhostRun(null);
      }
      recordedFrames.current = [
        {
          x: currentRespawnPos.current.x,
          y: currentRespawnPos.current.y,
          facing: 1,
        },
      ];
      ghostFrameIndex.current = 0;
      hasStartedMoving.current = false;
      roundTimerRef.current = 0;
    }

    initPlayers(false);
    shakeIntensity.current = 0;
    tempBlocks.current = [];
    collectedPowerups.current = [];
    dynamicPowerups.current = [];
    const nowSync = isOnline ? Date.now() % 10000000 : 0;
    lastPowerupSpawnTime.current = nowSync;
    blockDims.current = { w: TILE_SIZE, h: TILE_SIZE };
    slowMoTimerRef.current = 0;
    xrayTimerRef.current = 0;
    timeScaleRef.current = 1.0;
    lastHazardTriggerTime.current = nowSync;

    // Ability Toast
    const ability = level.allowedAbility || "none";
    let msg = "";
    if (ability === "build") msg = TRANSLATIONS[lang].abBuild;
    else if (ability === "double_jump") msg = TRANSLATIONS[lang].abDoubleJump;
    else if (ability === "hook") msg = TRANSLATIONS[lang].abHook;

    if (msg) {
      abilityMessageRef.current = msg;
      setTimeout(() => { abilityMessageRef.current = null; }, 3000);
    }
  }, [level.id, gameMode, lang, isOnline, settings.showGhost]);

  // Instant Respawn Handling
  useEffect(() => {
    if (respawnTrigger > 0) {
      initPlayers(true);
      players.current.forEach(resetPlayerSize);
      // Keep collected powerups that are one-time? No, reset them.
      // But we keep coins.
      // Reset ability powerups logic:
      collectedPowerups.current = []; // Reset on death to allow collecting again
      tempBlocks.current = []; // Clear built blocks on death
      dynamicPowerups.current = []; // Clear dynamic powerups
      projectiles.current = []; // Clear projectiles
      shakeIntensity.current = 20;
      slowMoTimerRef.current = 0;
      xrayTimerRef.current = 0;
      timeScaleRef.current = 1.0;
      collapsingStates.current = {};
      const nowSync = isOnline ? Date.now() % 10000000 : 0;
      lastHazardTriggerTime.current = nowSync;
    }
  }, [respawnTrigger]);

  // Full Level Reset (Ghost Reset)
  useEffect(() => {
    if (resetTrigger > 0) {
      // Reset Ghost for the new attempt
      ghostFrameIndex.current = 0;
      hasStartedMoving.current = false;
      recordedFrames.current = [
        {
          x: currentRespawnPos.current.x,
          y: currentRespawnPos.current.y,
          facing: 1,
        },
      ];
    }
  }, [resetTrigger]);

  const triggerJump = (p: PlayerState) => {
    if (!p || p.finished) return;
    const allowed = level.allowedAbility || "none";
    const isBuildBattle = level.id.startsWith("build");
    const canDoubleJumpGlobal =
      (allowed === "double_jump" && !isBuildBattle) || gameMode === "brawler";
    const isJumperClass = gameMode === "brawler" && p.brawlerClass === "jumper";

    if (!p.isGrounded && !p.isWallSliding && p.wallCoyoteTimer <= 0) {
      const maxJumpsAllowed = isJumperClass ? 3 : MAX_JUMPS;
      const hasCharges = p.jumpCount < maxJumpsAllowed;
      const force = p.gravity < 0 ? -JUMP_FORCE : JUMP_FORCE;
      const spawnY = p.gravity < 0 ? p.pos.y : p.pos.y + p.h;

      const executeMidAirJump = () => {
        p.vel.y = force;
        p.jumpCount++;
        p.canJump = false; // consume jump so it doesn't immediately jump again if key is held
        p.jumpBufferTimer = 0; // consume buffer timer
        audio.playJump();
        if (onJump) onJump();
        spawnParticles(p.pos.x + p.w / 2, spawnY, "#ffffff", 5, "dust");
      };

      if (canDoubleJumpGlobal && hasCharges) {
        executeMidAirJump();
      } else if (p.oneTimeDoubleJump && !canDoubleJumpGlobal) {
        p.oneTimeDoubleJump = false;
        executeMidAirJump();
      } else if (p.oneTimeTripleJump && p.jumpCount < 3) {
        p.oneTimeTripleJump = false;
        p.tripleJumpActive = true;
        executeMidAirJump();
      } else if (p.tripleJumpActive && p.jumpCount < 3) {
        p.tripleJumpActive = false;
        executeMidAirJump();
      }
    }
  };

  const triggerDash = (p: PlayerState) => {
    if (!p || p.finished || gameMode !== "brawler") return;

    // Check if the class explicitly has dash capability.
    // "Dash soll explizit für die einzelnen Klassen die Dash benutzen verfügbar sein"
    // Standard class shouldn't have dash.
    if (p.dashCooldown > 0) return;
    if (p.brawlerClass === "standard") return; // explicitly disabling for standard if desired. Or we could disable powerup_dash across the board, but the stats determine dash ability.

    const stats = getBrawlerStats(p.brawlerClass, gameMode);
    p.dashTimer = 10;
    p.dashCooldown = stats.dashCooldownBase;
    p.dashDirection = { x: p.facing, y: 0 };
    audio.playJump();
    spawnParticles(p.pos.x + p.w / 2, p.pos.y + p.h / 2, p.color, 10, "spark");
    if (isOnline) {
      onlineService.sendEvent("player_dashed", { id: p.onlineId });
    }
  };

  const triggerAction = (p: PlayerState) => {
    if (!p || p.finished) return;
    if (!p.inventory) return;
    const type = p.inventory as string;
    p.inventory = null;

    if (type === "powerup_titan") {
      p.isGrown = true;
      p.isPermanentlyGrown = false;
      p.isShrunk = false;
      p.isPermanentlyShrunk = false;
      p.w = 60;
      p.h = 60;
      p.pos.y -= 40;
      p.growTimer = 600;
      p.shieldTimer = 300;
      audio.playPowerup();
      spawnParticles(p.pos.x + 30, p.pos.y + 30, "#ef4444", 20, "spark");
      shakeIntensity.current = 15;
      return;
    }
    if (type === "powerup_blizzard") {
      audio.playPowerup();
      players.current.forEach((op) => {
        if (op.name !== p.name) {
          op.slowTimer = 480;
          op.vel.x = 0;
          spawnParticles(op.pos.x + op.w / 2, op.pos.y + op.h / 2, "#38bdf8", 15, "spark");
        }
      });
      shakeIntensity.current = 10;
      return;
    }
    if (type === "powerup_thunder_shield") {
      p.shieldTimer = 360;
      audio.playPowerup();
      players.current.forEach((op) => {
        if (op.name !== p.name) {
          const dx = op.pos.x - p.pos.x;
          const dy = op.pos.y - p.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            op.vel.x = (dx > 0 ? 1 : -1) * 22;
            op.vel.y = -10;
            spawnParticles(op.pos.x + op.w / 2, op.pos.y + op.h / 2, "#eab308", 15, "spark");
          }
        }
      });
      shakeIntensity.current = 15;
      return;
    }
    if (type === "powerup_nuke_bomb") {
      audio.playPowerup();
      for (let i = -1; i <= 1; i++) {
        const bomb = {
          x: p.pos.x + 5 + i * 25,
          y: p.pos.y + 5,
          w: 16,
          h: 16,
          timer: 40 + Math.abs(i) * 20,
          owner: p.name,
          active: true,
        };
        bombs.current.push(bomb);
        if (isOnline && p.onlineId === onlineService.localPlayer?.id) {
          onlineService.sendEvent("bomb", bomb);
        }
      }
      shakeIntensity.current = 10;
      return;
    }
    if (type === "powerup_meteor_rain") {
      audio.playPowerup();
      const angles = [-0.3, 0, 0.3];
      angles.forEach((angle) => {
        const proj = {
          x: p.pos.x + (p.facing === 1 ? 20 : -10),
          y: p.pos.y + 5 + angle * 10,
          w: 12,
          h: 12,
          velX: p.facing * 10 * Math.cos(angle),
          velY: 10 * Math.sin(angle),
          owner: p.name,
          active: true,
        };
        projectiles.current.push(proj);
        if (isOnline && p.onlineId === onlineService.localPlayer?.id) {
          onlineService.sendEvent("projectile", proj);
        }
      });
      shakeIntensity.current = 8;
      return;
    }
    if (type === "powerup_golden_sword") {
      p.meleeActive = true;
      p.meleeTimer = 30;
      audio.playPowerup();
      players.current.forEach((op) => {
        if (op.name !== p.name) {
          const hitBox = {
            x: p.pos.x + (p.facing === 1 ? 20 : -140),
            y: p.pos.y - 30,
            w: 140,
            h: 80,
          };
          const opBox = { x: op.pos.x, y: op.pos.y, w: op.w, h: op.h };
          if (checkCollision(hitBox, opBox) && op.shieldTimer <= 0) {
            op.vel.x = p.facing * 30;
            op.vel.y = -12;
            spawnParticles(op.pos.x + op.w / 2, op.pos.y + op.h / 2, "#facc15", 25, "spark");
          }
        }
      });
      shakeIntensity.current = 25;
      return;
    }
    if (type === "powerup_teleport_dash") {
      p.pos.x += p.facing * 240;
      p.vel = { x: p.facing * 12, y: 0 };
      audio.playPowerup();
      shakeIntensity.current = 12;
      spawnParticles(p.pos.x + p.w / 2, p.pos.y + p.h / 2, "#a855f7", 12, "spark");
      return;
    }
    if (type === "powerup_teleport_all") {
      const opponent = players.current.find((op) => op.name !== p.name);
      if (opponent) {
        audio.playPowerup();
        const tempX = p.pos.x;
        const tempY = p.pos.y;
        p.pos.x = opponent.pos.x;
        p.pos.y = opponent.pos.y;
        opponent.pos.x = tempX;
        opponent.pos.y = tempY;
        spawnParticles(p.pos.x + p.w / 2, p.pos.y + p.h / 2, "#ec4899", 15, "spark");
        spawnParticles(opponent.pos.x + opponent.w / 2, opponent.pos.y + opponent.h / 2, "#ec4899", 15, "spark");
        shakeIntensity.current = 15;
      }
      return;
    }
    if (type === "powerup_gravity_boots") {
      audio.playPowerup();
      p.oneTimeTripleJump = true;
      p.tripleJumpActive = true;
      p.jumpCount = 0;
      spawnParticles(p.pos.x + p.w / 2, p.pos.y + p.h / 2, "#10b981", 12, "spark");
      return;
    }
    if (type === "powerup_black_hole") {
      audio.playPowerup();
      players.current.forEach((op) => {
        if (op.name !== p.name) {
          const dx = p.pos.x - op.pos.x;
          const dy = p.pos.y - op.pos.y;
          op.vel.x += (dx > 0 ? 1 : -1) * 12;
          op.vel.y -= 5;
          if (op.inventory) {
            p.inventory = op.inventory;
            op.inventory = null;
          }
          spawnParticles(op.pos.x + op.w / 2, op.pos.y + op.h / 2, "#1e1b4b", 15, "spark");
        }
      });
      shakeIntensity.current = 15;
      return;
    }
    if (type === "powerup_glacier") {
      audio.playPowerup();
      for (let i = -1; i <= 1; i++) {
        const newBlock = {
          x: p.pos.x + i * TILE_SIZE,
          y: p.pos.y + p.h,
          w: TILE_SIZE,
          h: TILE_SIZE,
          type: "ice" as const,
          expires: Date.now() + 15000,
        };
        tempBlocks.current.push(newBlock);
        if (isOnline && p.onlineId === onlineService.localPlayer?.id) {
          onlineService.sendEvent("block", newBlock);
        }
      }
      return;
    }
    if (type === "powerup_trampoline") {
      audio.playPowerup();
      for (let i = -1; i <= 1; i++) {
        const newBlock = {
          x: p.pos.x + i * TILE_SIZE,
          y: p.pos.y + p.h,
          w: TILE_SIZE,
          h: TILE_SIZE,
          type: "slime" as const,
          expires: Date.now() + 15000,
         };
        tempBlocks.current.push(newBlock);
        if (isOnline && p.onlineId === onlineService.localPlayer?.id) {
          onlineService.sendEvent("block", newBlock);
        }
      }
      return;
    }
    if (type === "powerup_fortress") {
      audio.playPowerup();
      for (let i = 0; i < 3; i++) {
        const newBlock = {
          x: p.pos.x + p.facing * TILE_SIZE,
          y: p.pos.y - i * TILE_SIZE,
          w: TILE_SIZE,
          h: TILE_SIZE,
          type: "wall" as const,
          expires: Date.now() + 15000,
        };
        tempBlocks.current.push(newBlock);
        if (isOnline && p.onlineId === onlineService.localPlayer?.id) {
          onlineService.sendEvent("block", newBlock);
        }
      }
      return;
    }
    if (type === "powerup_voltage_hook") {
      audio.playPowerup();
      p.oneTimeHook = true;
      p.hookActive = true;
      spawnParticles(p.pos.x + p.w / 2, p.pos.y + p.h / 2, "#14b8a6", 12, "spark");
      return;
    }
    if (type === "powerup_nano_spy") {
      audio.playPowerup();
      p.isShrunk = true;
      p.isPermanentlyShrunk = false;
      p.isGrown = false;
      p.w = 6;
      p.h = 6;
      p.shrinkTimer = 600;
      spawnParticles(p.pos.x + 3, p.pos.y + 3, "#f43f5e", 10, "spark");
      return;
    }
    if (type === "powerup_quantum_shift") {
      audio.playPowerup();
      p.shieldTimer = 360;
      p.isShrunk = true;
      p.w = 8;
      p.h = 8;
      p.shrinkTimer = 360;
      spawnParticles(p.pos.x + p.w / 2, p.pos.y + p.h / 2, "#6366f1", 15, "spark");
      return;
    }
    if (type === "powerup_fire_shield") {
      audio.playPowerup();
      p.shieldTimer = 360;
      const proj = {
        x: p.pos.x + (p.facing === 1 ? 20 : -10),
        y: p.pos.y + 5,
        w: 12,
        h: 12,
        velX: p.facing * 11,
        velY: 0,
        owner: p.name,
        active: true,
      };
      projectiles.current.push(proj);
      return;
    }
    if (type === "powerup_lodestar") {
      audio.playPowerup();
      p.dashTimer = 22;
      p.dashCooldown = 15;
      p.dashDirection = { x: p.facing, y: 0 };
      const bomb = {
        x: p.pos.x - p.facing * 15,
        y: p.pos.y,
        w: 12,
        h: 12,
        timer: 25,
        owner: p.name,
        active: true,
      };
      bombs.current.push(bomb);
      return;
    }
    if (type === "powerup_frost_mourne") {
      audio.playPowerup();
      p.meleeActive = true;
      p.meleeTimer = 20;
      players.current.forEach((op) => {
        if (op.name !== p.name) {
          const hitBox = { x: p.pos.x - 40, y: p.pos.y - 10, w: 100, h: 40 };
          if (checkCollision(hitBox, { x: op.pos.x, y: op.pos.y, w: op.w, h: op.h })) {
            op.slowTimer = 360;
            op.vel.x = p.facing * 8;
            op.vel.y = -3;
            spawnParticles(op.pos.x + op.w / 2, op.pos.y + op.h / 2, "#06b6d4", 18, "spark");
          }
        }
      });
      return;
    }
    if (type === "powerup_sticky_bomb") {
      audio.playPowerup();
      const bomb = {
        x: p.pos.x + 5,
        y: p.pos.y + 5,
        w: 12,
        h: 12,
        timer: 40,
        owner: p.name,
        active: true,
      };
      bombs.current.push(bomb);
      return;
    }
    if (type === "powerup_angel_wings") {
      audio.playPowerup();
      p.shieldTimer = 240;
      p.oneTimeTripleJump = true;
      p.jumpCount = 0;
      spawnParticles(p.pos.x + p.w / 2, p.pos.y + p.h / 2, "#f472b6", 18, "spark");
      return;
    }
    if (type === "powerup_trickster") {
      audio.playPowerup();
      const op = players.current.find((op) => op.name !== p.name);
      if (op) {
        const tempX = p.pos.x;
        const tempY = p.pos.y;
        p.pos.x = op.pos.x;
        p.pos.y = op.pos.y;
        op.pos.x = tempX;
        op.pos.y = tempY;
        if (op.inventory) {
          p.inventory = op.inventory;
          op.inventory = null;
        }
        spawnParticles(p.pos.x + p.w / 2, p.pos.y + p.h / 2, "#fb7185", 15, "spark");
        spawnParticles(op.pos.x + op.w / 2, op.pos.y + op.h / 2, "#fb7185", 15, "spark");
      }
      return;
    }
    if (type === "powerup_chaos_orb") {
      audio.playPowerup();
      const proj = {
        x: p.pos.x + (p.facing === 1 ? 20 : -10),
        y: p.pos.y + 5,
        w: 12,
        h: 12,
        velX: p.facing * 12,
        velY: 2,
        owner: p.name,
        active: true,
      };
      projectiles.current.push(proj);
      return;
    }

    if (type === "powerup_ice_block" || type === "powerup_slime_block") {
      const checkRect = {
        x: p.pos.x + p.w / 4,
        y: p.pos.y + p.h,
        w: p.w / 2,
        h: 5,
      };
      const blockBelow =
        levelRef.current.entities.find(
          (e) =>
            (e.type === "wall" || e.type === "ice" || e.type === "slime") &&
            checkCollision(checkRect, e),
        ) ||
        tempBlocks.current.find(
          (e) =>
            (e.type === "wall" || e.type === "ice" || e.type === "slime") &&
            checkCollision(checkRect, e),
        );
      if (blockBelow) {
        blockBelow.type = type === "powerup_ice_block" ? "ice" : "slime";
        if (isOnline && p.onlineId === onlineService.localPlayer?.id) {
          onlineService.sendEvent("block_updated", {
            x: blockBelow.x,
            y: blockBelow.y,
            type: blockBelow.type,
          });
        }
      } else {
        const newBlock = {
          x: p.pos.x,
          y: p.pos.y + p.h,
          w: TILE_SIZE,
          h: TILE_SIZE,
          type:
            type === "powerup_ice_block"
              ? ("ice" as const)
              : ("slime" as const),
          expires: Date.now() + 10000,
        };
        tempBlocks.current.push(newBlock);
        if (isOnline && p.onlineId === onlineService.localPlayer?.id) {
          onlineService.sendEvent("block", newBlock);
        }
      }
    } else if (type === "powerup_fireball") {
      const proj = {
        x: p.pos.x + (p.facing === 1 ? 20 : -10),
        y: p.pos.y + 5,
        w: 10,
        h: 10,
        velX: p.facing * 8,
        velY: 0,
        owner: p.name,
        active: true,
      };
      projectiles.current.push(proj);
      if (isOnline && p.onlineId === onlineService.localPlayer?.id) {
        onlineService.sendEvent("projectile", proj);
      }
    } else if (type === "powerup_teleport") {
      p.pos = getSpawnPos(p.playerIndex, p.team);
      p.vel = { x: 0, y: 0 };
      shakeIntensity.current = 10;
    } else if (type === "powerup_triple_jump") {
      p.oneTimeTripleJump = true;
    } else if (type === "powerup_bomb") {
      const bomb = {
        x: p.pos.x + 5,
        y: p.pos.y + 5,
        w: 10,
        h: 10,
        timer: 120, // 2 seconds
        owner: p.name,
        active: true,
      };
      bombs.current.push(bomb);
      if (isOnline && p.onlineId === onlineService.localPlayer?.id) {
        onlineService.sendEvent("bomb", bomb);
      }
    } else if (type === "powerup_shield") {
      p.shieldTimer = 180;
      if (isOnline)
        onlineService.sendEvent("powerup_used", {
          type: "powerup_shield",
        });
    } else if (type === "powerup_steal") {
      const opponent = players.current.find((op) => op.name !== p.name);
      if (opponent && opponent.inventory) {
        p.inventory = opponent.inventory;
        opponent.inventory = null;
      }
      if (isOnline)
        onlineService.sendEvent("powerup_used", {
          type: "powerup_steal",
        });
    } else if (type === "powerup_slow") {
      const opponent = players.current.find((op) => op.name !== p.name);
      if (opponent) {
        opponent.slowTimer = 240;
      }
      if (isOnline)
        onlineService.sendEvent("powerup_used", { type: "powerup_slow" });
    } else if (type === "powerup_melee") {
      p.meleeActive = true;
      p.meleeTimer = 15;
      const opponent = players.current.find((op) => op.name !== p.name);
      let hit = false;
      if (opponent) {
        const hitBoxW = gameMode === "brawler" ? 60 : 20;
        const hitBox = {
          x: p.pos.x + (p.facing === 1 ? 20 : -hitBoxW),
          y: p.pos.y,
          w: hitBoxW,
          h: 20,
        };
        const opBox = {
          x: opponent.pos.x,
          y: opponent.pos.y,
          w: opponent.w,
          h: opponent.h,
        };
        if (checkCollision(hitBox, opBox) && opponent.shieldTimer <= 0) {
          hit = true;
          if (!isOnline) {
            if (gameMode === "brawler" && opponent.lives !== undefined) {
              opponent.lives--;
              if (opponent.lives <= 0) {
                opponent.finished = true;
                checkBrawlerWinCondition();
              } else {
                opponent.pos = getSpawnPos(opponent.playerIndex, opponent.team);
                opponent.vel = { x: 0, y: 0 };
                resetPlayerSize(opponent);
              }
              shakeIntensity.current = 20;
              audio.playDie(opponent.deathSound);
            } else {
              opponent.vel.x = p.facing * 15;
              opponent.vel.y = -5;
              shakeIntensity.current = 15;
            }
          }
        }
      }
      if (isOnline)
        onlineService.sendEvent("powerup_used", {
          type: "powerup_melee",
          hit,
        });
    } else if (type === "powerup_shrink") {
      if (!p.isShrunk) {
        p.isShrunk = true;
        p.isPermanentlyShrunk = false;
        p.isGrown = false;
        p.isPermanentlyGrown = false;
        p.w = 10;
        p.h = 10;
        p.pos.y += 10;
      }
      p.shrinkTimer = 480;
      p.growTimer = 0;
      if (isOnline)
        onlineService.sendEvent("powerup_used", {
          type: "powerup_shrink",
        });
    } else if (type === "powerup_grow") {
      const opponent = players.current.find((op) => op.name !== p.name);
      if (opponent && opponent.shieldTimer <= 0) {
        if (!opponent.isGrown) {
          opponent.isGrown = true;
          opponent.isPermanentlyGrown = false;
          if (opponent.isShrunk) {
            opponent.isShrunk = false;
            opponent.isPermanentlyShrunk = false;
            opponent.w = 40;
            opponent.h = 40;
            opponent.pos.y -= 30;
          } else {
            opponent.w = 40;
            opponent.h = 40;
            opponent.pos.y -= 20;
          }
        }
        opponent.growTimer = 480;
        opponent.shrinkTimer = 0;
      }
      if (isOnline)
        onlineService.sendEvent("powerup_used", { type: "powerup_grow" });
    } else if (type === "powerup_dash") {
      if (p.dashCooldown === 0) {
        p.dashTimer = 10;
        p.dashCooldown = 60;
        p.dashDirection = { x: p.facing, y: 0 };
        audio.playJump();
        spawnParticles(
          p.pos.x + p.w / 2,
          p.pos.y + p.h / 2,
          p.color,
          10,
          "spark",
        );
      }
      if (isOnline)
        onlineService.sendEvent("powerup_used", { type: "powerup_dash" });
    }
  };

  // Input Listeners (Keyboard + Wheel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling with arrows/space
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].indexOf(
          e.code,
        ) > -1
      ) {
        e.preventDefault();
      }

      // We record the key press so holding arrows during countdown works instantly on GO.
      keys.current[e.code] = true;

      // However, we prevent any action triggers (like jumping or using powerups)
      // or starting the ghost timer if the game is still counting down or paused.
      if (isStartingRef.current || paused) return;

      if (e.repeat) return; // Prevent auto-repeat multi-triggering double jumps or actions

      if (e.code === "KeyR") {
        blockDims.current = { w: TILE_SIZE, h: TILE_SIZE };
      }

      hasStartedMoving.current = true;

      // Handle Jump Input (Double Jump logic needs to happen on press)
      players.current.forEach((p) => {
        if (!p) return;
        const isLocal =
          !isOnline || p.onlineId === onlineService.localPlayer?.id;
        if (!isLocal) return;

        // Track movement start
        if (!p.hasStartedMove) {
          const controlKeys = [
            ...p.controls.up,
            ...p.controls.left,
            ...p.controls.right,
            ...p.controls.down,
            ...(p.controls.action || []),
            ...(p.controls.dash || []),
          ];
          if (controlKeys.includes(e.code)) {
            p.hasStartedMove = true;
            const scrollSpeed = level.autoScrollSpeed || 150;
            const startWallX = level.autoScroll
              ? Math.max(0, p.pos.x - GAME_WIDTH / 2 + 15)
              : 0;
            p.moveStartTime = Date.now() - (startWallX / scrollSpeed) * 1000;
            p.scrollX = startWallX;
          }
        }

        let isJumpKey = p.controls.up.includes(e.code);
        if (p.gravity < 0 && settings?.invertYOnGravityReverse) {
          isJumpKey = p.controls.down.includes(e.code);
        }

        if (isJumpKey) {
          p.jumpBufferTimer = 6;
          triggerJump(p);
        }

        // Handle Action Input (Activate Inventory)
        if (p.controls.action?.includes(e.code) && p.inventory) {
          triggerAction(p);
        }

        // Handle Dash Input
        if (p.controls.dash?.includes(e.code)) {
          triggerDash(p);
        }
      });
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.current[e.code]) {
        keys.current[e.code] = false;
        if (isStartingRef.current || paused) return;
        players.current.forEach((p) => {
          if (!p) return;
          let isJumpKey = p.controls.up.includes(e.code);
          if (p.gravity < 0 && settings?.invertYOnGravityReverse) {
            isJumpKey = p.controls.down.includes(e.code);
          }
          if (isJumpKey) p.canJump = true; // allow release and re-press
        });
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (paused || isStartingRef.current || gameMode === "brawler") return;
      // Only allow block resizing if ability is build OR one time build is active
      const ability = level.allowedAbility || "none";
      const p =
        players.current.find(
          (pl) => !isOnline || pl.onlineId === onlineService.localPlayer?.id,
        ) || players.current[0];
      if (ability !== "build" && !p.oneTimeBuild) return;

      e.preventDefault();
      const step = 10;
      const minSize = 10;
      const maxSize = 200;

      if (e.shiftKey) {
        const delta = e.deltaY < 0 ? step : -step;
        blockDims.current.w = Math.max(
          minSize,
          Math.min(maxSize, blockDims.current.w + delta),
        );
      } else if (e.ctrlKey) {
        const delta = e.deltaY < 0 ? step : -step;
        blockDims.current.h = Math.max(
          minSize,
          Math.min(maxSize, blockDims.current.h + delta),
        );
      } else {
        if (Math.abs(e.deltaY) > 10) {
          const { w, h } = blockDims.current;
          blockDims.current = { w: h, h: w };
        }
      }
    };

    const handleMouseJumpDown = (e: MouseEvent | TouchEvent) => {
      if (e.target && (e.target as HTMLElement).closest('button, a')) return;
      if (geometryDashMode) {
        keys.current["Click"] = true;
        
        if (isStartingRef.current || paused) return;
        hasStartedMoving.current = true;
        
        players.current.forEach((p) => {
          if (!p) return;
          const isLocal = !isOnline || p.onlineId === onlineService.localPlayer?.id;
          if (!isLocal) return;
          
          if (!p.hasStartedMove) {
            p.hasStartedMove = true;
            const scrollSpeed = level.autoScrollSpeed || 150;
            const startWallX = level.autoScroll ? Math.max(0, p.pos.x - GAME_WIDTH / 2 + 15) : 0;
            p.moveStartTime = Date.now() - (startWallX / scrollSpeed) * 1000;
            p.scrollX = startWallX;
          }
          
          p.jumpBufferTimer = 6;
          triggerJump(p);
        });
      }
    };
    const handleMouseJumpUp = () => {
      if (geometryDashMode) {
        keys.current["Click"] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousedown", handleMouseJumpDown);
    window.addEventListener("mouseup", handleMouseJumpUp);
    window.addEventListener("touchstart", handleMouseJumpDown);
    window.addEventListener("touchend", handleMouseJumpUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousedown", handleMouseJumpDown);
      window.removeEventListener("mouseup", handleMouseJumpUp);
      window.removeEventListener("touchstart", handleMouseJumpDown);
      window.removeEventListener("touchend", handleMouseJumpUp);
    };
  }, [paused, gameMode, level.allowedAbility]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;

    const screenX = (e.clientX - rect.left) * scaleX;
    const screenY = (e.clientY - rect.top) * scaleY;

    const cx = cameraRef.current.x + GAME_WIDTH / 2;
    const cy = cameraRef.current.y + GAME_HEIGHT / 2;
    const zoom = cameraZoom.current || 1.0;

    // Determine raw pos for hook, snapped for build
    mouseRef.current = {
      x: (screenX - GAME_WIDTH / 2) / zoom + cx,
      y: (screenY - GAME_HEIGHT / 2) / zoom + cy,
    }; // Raw for hook
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (paused || isStartingRef.current) return;
    hasStartedMoving.current = true;

    const pLocal = players.current.find(
      (pl) => !isOnline || pl.onlineId === onlineService.localPlayer?.id,
    );
    if (pLocal && !pLocal.hasStartedMove) {
      pLocal.hasStartedMove = true;
      const scrollSpeed = level.autoScrollSpeed || 150;
      const startWallX = level.autoScroll
        ? Math.max(0, pLocal.pos.x - GAME_WIDTH / 2 + 15)
        : 0;
      pLocal.moveStartTime = Date.now() - (startWallX / scrollSpeed) * 1000;
      pLocal.scrollX = startWallX;
    }

    if (gameMode === "brawler") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;

    const screenX = (e.clientX - rect.left) * scaleX;
    const screenY = (e.clientY - rect.top) * scaleY;

    const cx = cameraRef.current.x + GAME_WIDTH / 2;
    const cy = cameraRef.current.y + GAME_HEIGHT / 2;
    const zoom = cameraZoom.current || 1.0;

    const worldX = (screenX - GAME_WIDTH / 2) / zoom + cx;
    const worldY = (screenY - GAME_HEIGHT / 2) / zoom + cy;

    const allowed = level.allowedAbility || "none";
    const p =
      players.current.find(
        (pl) => !isOnline || pl.onlineId === onlineService.localPlayer?.id,
      ) || players.current[0];

    // Build Ability
    if (allowed === "build" || p.oneTimeBuild) {
      const rawX = worldX;
      const rawY = worldY;
      const x = Math.floor(rawX / TILE_SIZE) * TILE_SIZE;
      const y = Math.floor(rawY / TILE_SIZE) * TILE_SIZE;
      const { w, h } = blockDims.current;

      const newBlockRect = { x, y, w, h };
      const playerOverlap = players.current.some((pl) => {
        const playerRect = { x: pl.pos.x, y: pl.pos.y, w: 20, h: 20 };
        return (
          playerRect.x < newBlockRect.x + newBlockRect.w &&
          playerRect.x + playerRect.w > newBlockRect.x &&
          playerRect.y < newBlockRect.y + newBlockRect.h &&
          playerRect.y + playerRect.h > newBlockRect.y
        );
      });

      if (playerOverlap) {
        audio.playDie();
        players.current.forEach((pl) => {
          const playerRect = { x: pl.pos.x, y: pl.pos.y, w: pl.w, h: pl.h };
          if (
            playerRect.x < newBlockRect.x + newBlockRect.w &&
            playerRect.x + playerRect.w > newBlockRect.x &&
            playerRect.y < newBlockRect.y + newBlockRect.h &&
            playerRect.y + playerRect.h > newBlockRect.y
          ) {
            resetPlayerSize(pl);
          }
        });
        return;
      }

      // If using One-Time ability, the block is permanent (expires far in future)
      // If using Global ability, the block is temporary (500ms)
      const isOneTime = p.oneTimeBuild;

      const newBlock: TempBlock = {
        x,
        y,
        w,
        h,
        type: "wall" as const,
        expires: isOneTime ? Number.MAX_SAFE_INTEGER : Date.now() + 500,
        ownerIndex: p.playerIndex,
      };
      tempBlocks.current.push(newBlock);
      if (isOnline && p.onlineId === onlineService.localPlayer?.id) {
        onlineService.sendEvent("block", newBlock);
      }

      onBlockPlace();
      audio.playBuild();

      // Consume one-time use if global is not set
      if (allowed !== "build") {
        p.oneTimeBuild = false;
      }
      return; // Don't try to hook if we just built
    }

    // Hook Ability
    if (allowed === "hook" || p.oneTimeHook) {
      // Cooldown check
      if (p.hookCooldown > 0) return;

      // Fire Hook
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Raycast
      const dx = mx - (p.pos.x + 10);
      const dy = my - (p.pos.y + 10);
      const dist = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
      const dirX = dx / dist;
      const dirY = dy / dist;

      let rayX = p.pos.x + 10;
      let rayY = p.pos.y + 10;

      // Simplified Raycast: Step 10px until collision or max dist
      let hit: Vector2 | null = null;
      const steps = HOOK_RANGE / 10;

      for (let i = 0; i < steps; i++) {
        rayX += dirX * 10;
        rayY += dirY * 10;

        // Check collisions
        const colliders = [...levelRef.current.entities, ...tempBlocks.current];
        const hitEntity = colliders.find(
          (ent) =>
            ["wall", "ice", "slime"].includes(ent.type) && // Only hook onto solids
            rayX >= ent.x &&
            rayX <= ent.x + ent.w &&
            rayY >= ent.y &&
            rayY <= ent.y + ent.h,
        );

        if (hitEntity) {
          hit = { x: rayX, y: rayY };
          break;
        }
      }

      if (hit) {
        p.hookActive = true;
        p.hookPos = hit;
        p.hookCooldown = HOOK_COOLDOWN; // Apply cooldown
        p.hookDuration = 0; // Reset duration on hit
        audio.playBuild(); // Use build sound as hook hit sound
        if (onHook) onHook();

        // Consume one-time use if global is not set
        if (allowed !== "hook") {
          p.oneTimeHook = false;
        }
      } else {
        // Miss logic?
      }
    }
  };

  const handleMouseUp = () => {
    const p =
      players.current.find(
        (pl) => !isOnline || pl.onlineId === onlineService.localPlayer?.id,
      ) || players.current[0];
    if (p.hookActive) {
      p.hookActive = false;
      p.hookPos = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Improved Collision Detection with "Generous Hitboxes" for Hazards
  const checkCollision = (
    rect1: { x: number; y: number; w: number; h: number },
    rect2: { x: number; y: number; w: number; h: number; type?: EntityType },
  ) => {
    let r2x = rect2.x;
    let r2y = rect2.y;
    let r2w = rect2.w;
    let r2h = rect2.h;

    // Shrink hazard hitboxes to make the game feel fairer
    // Same for ghost hazards (to prevent cheap feel if they were real)
    if (rect2.type === "hazard" || rect2.type === "ghost_hazard") {
      const padding = 6;
      r2x += padding;
      r2y += padding;
      r2w = Math.max(0, r2w - padding * 2);
      r2h = Math.max(0, r2h - padding * 2);
    }

    // Shrink teleport hitboxes so player needs to be more "inside" to teleport
    if (rect2.type === "teleport") {
      const padding = 8;
      r2x += padding;
      r2y += padding;
      r2w = Math.max(0, r2w - padding * 2);
      r2h = Math.max(0, r2h - padding * 2);
    }

    // Powerup Slow Mo / General powerups - generous hitboxes are fine or standard
    if (rect2.type === "walkthrough_wall") {
      // Technically collision logic is called, but we handle the type logic elsewhere
      // But for checkCollision itself, we return standard overlap
    }

    return (
      rect1.x < r2x + r2w &&
      rect1.x + rect1.w > r2x &&
      rect1.y < r2y + r2h &&
      rect1.y + rect1.h > r2y
    );
  };

  useEffect(() => {
    // Add global mouse up listener for hook release
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const resScale = useMemo(() => {
    let scale = settings.resolutionScale || 1080;
    if (scale < 10) {
      if (scale === 1) return 720;
      if (scale === 3) return 1440;
      if (scale === 4) return 2160;
      return 1080;
    }
    return scale;
  }, [settings.resolutionScale]);

  const dpr = resScale / GAME_HEIGHT;
  const canvasWidth = GAME_WIDTH * dpr;
  const canvasHeight = GAME_HEIGHT * dpr;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Enable high-resolution rendering - only set width/height if they actually changed
    // to avoid clearing the canvas unnecessarily
    if (canvas.width !== canvasWidth) canvas.width = canvasWidth;
    if (canvas.height !== canvasHeight) canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    let animationFrameId: number;

    const levelCoinIds = levelRef.current.entities
      .filter((e) => e.type === "coin")
      .map((e) => e.id!);
    const teleporters = levelRef.current.entities.filter((e) => e.type === "teleport");

    // Game Loop Logic
    let lastTime = performance.now();
    let accumulator = 0;
    const PHYSICS_STEP = 1000 / 60;

    const getGluedRoot = (entityCheck: Entity, time: number, dt: number): Entity | null => {
      const currentEntities = [...(levelRef.current?.entities || []), ...tempBlocks.current];
      if (currentEntities.length === 0) return null;

      if (gluedBFSMapRef.current.time !== time || gluedBFSMapRef.current.dt !== dt) {
        gluedBFSMapRef.current.time = time;
        gluedBFSMapRef.current.dt = dt;
        gluedBFSMapRef.current.connections.clear();

        const connections = gluedBFSMapRef.current.connections;
        const queue: { ent: Entity; root: Entity }[] = [];

        const isAdjacent = (e1: Entity, e2: Entity) => {
          const pad = 2; // tolerating adjacent positions within 2px
          const w1 = e1.w || 30;
          const h1 = e1.h || 30;
          const w2 = e2.w || 30;
          const h2 = e2.h || 30;
          return (
            e1.x < e2.x + w2 + pad &&
            e1.x + w1 > e2.x - pad &&
            e1.y < e2.y + h2 + pad &&
            e1.y + h1 > e2.y - pad
          );
        };

        // Identify moving platforms as root engines
        for (const ent of currentEntities) {
          const isRoot =
            ent.type === "moving_platform_h" ||
            ent.movingH ||
            ent.type === "moving_platform_v" ||
            ent.movingV ||
            (ent.type as any) === "orbit";

          if (isRoot) {
            const id = ent.id || `${ent.x}_${ent.y}`;
            queue.push({ ent, root: ent });
            connections.set(id, ent);
          }
        }

        let head = 0;
        while (head < queue.length) {
          const { ent, root } = queue[head++];

          for (const neighbor of currentEntities) {
            const neighId = neighbor.id || `${neighbor.x}_${neighbor.y}`;
            if (connections.has(neighId)) continue;

            const hasGlue = ent.type === "glue" || neighbor.type === "glue";
            if (hasGlue && isAdjacent(ent, neighbor)) {
              connections.set(neighId, root);
              queue.push({ ent: neighbor, root });
            }
          }
        }
      }

      const id = entityCheck.id || `${entityCheck.x}_${entityCheck.y}`;
      return gluedBFSMapRef.current.connections.get(id) || null;
    };

    const getDynamicEntity = (e: Entity, time: number, dt: number) => {
      const gluedRoot = getGluedRoot(e, time, dt);
      // Only copy if it's dynamic
      const isDynamic = e.type === "moving_platform_h" || 
                        e.movingH || 
                        e.type === "moving_platform_v" || 
                        e.movingV || 
                        (e.type as any) === "orbit" ||
                        e.type === "fragile" || 
                        e.fragile ||
                        collapsingStates.current[e.id || `${e.x}_${e.y}`] ||
                        !!gluedRoot;

      if (!isDynamic) return e;

      if (gluedRoot) {
        const speed = gluedRoot.moveSpeed ?? 0.002;
        const range = gluedRoot.moveRange ?? 100;
        let rootX = gluedRoot.x;
        let rootY = gluedRoot.y;
        let rdx = 0;
        let rdy = 0;

        if (gluedRoot.type === "moving_platform_h" || gluedRoot.movingH) {
          const offset = Math.sin(time * speed) * range;
          const prevOffset = Math.sin((time - 16.66 * dt) * speed) * range;
          rootX = gluedRoot.x + offset;
          rdx = offset - prevOffset;
        } else if (gluedRoot.type === "moving_platform_v" || gluedRoot.movingV) {
          const offset = Math.sin(time * speed) * range;
          const prevOffset = Math.sin((time - 16.66 * dt) * speed) * range;
          rootY = gluedRoot.y + offset;
          rdy = offset - prevOffset;
        } else if ((gluedRoot.type as any) === "orbit") {
          const oSpeed = gluedRoot.moveSpeed ?? 0.0025;
          const oRange = gluedRoot.moveRange ?? 80;
          const angle = time * oSpeed;
          const prevAngle = (time - 16.66 * dt) * oSpeed;
          const offsetX = Math.cos(angle) * oRange;
          const offsetY = Math.sin(angle) * oRange;
          const prevOffsetX = Math.cos(prevAngle) * oRange;
          const prevOffsetY = Math.sin(prevAngle) * oRange;
          rootX = gluedRoot.x + offsetX;
          rootY = gluedRoot.y + offsetY;
          rdx = offsetX - prevOffsetX;
          rdy = offsetY - prevOffsetY;
        }

        const offsetX = rootX - gluedRoot.x;
        const offsetY = rootY - gluedRoot.y;

        return {
          ...e,
          x: e.x + offsetX,
          y: e.y + offsetY,
          dx: rdx,
          dy: rdy,
          baseX: e.x,
          baseY: e.y,
        };
      }

      const speed = e.moveSpeed ?? 0.002;
      const range = e.moveRange ?? 100;
      let updated = { ...e, baseX: e.x, baseY: e.y };

      if (e.type === "moving_platform_h" || e.movingH) {
        const offset = Math.sin(time * speed) * range;
        const prevOffset = Math.sin((time - 16.66 * dt) * speed) * range;
        updated = { ...updated, x: e.x + offset, dx: offset - prevOffset };
      } else if (e.type === "moving_platform_v" || e.movingV) {
        const offset = Math.sin(time * speed) * range;
        const prevOffset = Math.sin((time - 16.66 * dt) * speed) * range;
        updated = { ...updated, y: e.y + offset, dy: offset - prevOffset };
      } else if ((e.type as any) === "orbit") {
        const oSpeed = e.moveSpeed ?? 0.0025;
        const oRange = e.moveRange ?? 80;
        const angle = time * oSpeed;
        const prevAngle = (time - 16.66 * dt) * oSpeed;
        const offsetX = Math.cos(angle) * oRange;
        const offsetY = Math.sin(angle) * oRange;
        const prevOffsetX = Math.cos(prevAngle) * oRange;
        const prevOffsetY = Math.sin(prevAngle) * oRange;
        updated = {
          ...updated,
          x: e.x + offsetX,
          y: e.y + offsetY,
          dx: offsetX - prevOffsetX,
          dy: offsetY - prevOffsetY
        };
      }

      if (e.type === "fragile" || e.fragile) {
        const id = e.id || `${e.x}_${e.y}`;
        const state = fragileStates.current[id];
        if (state) {
          const elapsed = time - state.touchedAt;

          // 0 - 1000ms: Fading out, solid
          if (elapsed < 1000) {
            const opacity = 1 - elapsed / 1000;
            return { ...updated, shake: true, opacity };
          }

          // 1000ms - 2000ms: Invisible, not solid
          if (elapsed < 2000) {
            return dt === 0 ? { ...updated, opacity: 0 } : null;
          }

          // 2000ms - 3000ms: Fading in, not solid
          if (elapsed < 3000) {
            const opacity = (elapsed - 2000) / 1000;
            return dt === 0 ? { ...updated, opacity } : null;
          }

          // 3000ms+: Back to normal
          delete fragileStates.current[id];
        }
      }

      if (
        gameMode === "brawler" &&
        brawlerHazardMode === "collapsing_platforms"
      ) {
        const id = e.id || `${e.x}_${e.y}`;
        const state = collapsingStates.current[id];
        if (state) {
          const elapsed = time - state.touchedAt;
          if (elapsed > 3000) {
            // Disappear after 3 seconds
            return null;
          } else {
            // Shaking before disappearance
            updated = { ...updated, shake: true };
          }
        }
      }

      return updated;
    };

    const updateCamera = () => {
      // Camera Logic
      let targetCameraX = 0;
      let targetCameraY = 0;

      const maxCamX = Math.max(0, (levelRef.current.width || GAME_WIDTH) - GAME_WIDTH);
      const maxCamY = Math.max(0, (levelRef.current.height || GAME_HEIGHT) - GAME_HEIGHT);

      const allFinished = players.current.every((p) => p.finished);

      const liveLocalPlayer = players.current.find((p) => p.isLocal);
      const isSpectatingNowLocal =
        isOnline &&
        (liveLocalPlayer
          ? liveLocalPlayer.finished
          : isSpectating ||
            (players.current.length > 0 && status.includes("playing")));

      // Calculate scrollWallX for the followed player so it can be used for drawing
      let followedPlayer: PlayerState | undefined = liveLocalPlayer;
      if (isSpectatingNowLocal) {
        const activePlayers = players.current.filter((p) => !p.finished);
        if (activePlayers.length > 0) {
          followedPlayer =
            activePlayers[spectateTargetIdx % activePlayers.length];
        }
      }

      const dt = timeScaleRef.current; // Time Delta Factor

      if (
        (level.autoScroll || geometryDashMode) &&
        followedPlayer &&
        followedPlayer.hasStartedMove &&
        !followedPlayer.finished
      ) {
        scrollWallX.current = followedPlayer.scrollX || 0;
      } else if (
        (level.autoScroll || geometryDashMode) &&
        (!followedPlayer || !followedPlayer.hasStartedMove)
      ) {
        scrollWallX.current = cameraRef.current.x; // Stay where it was initialized, instead of resetting to 0
      }

      const isLocalBuildBattle = !isOnline && status === "build_battle_playing";

      if (isLocalBuildBattle && players.current.length >= 2) {
        const p1 = players.current[0];
        const p2 = players.current[1];
        if (p1 && p2) {
          let minX = Math.min(p1.pos.x, p2.pos.x);
          let maxX = Math.max(p1.pos.x + p1.w, p2.pos.x + p2.w);
          let minY = Math.min(p1.pos.y, p2.pos.y);
          let maxY = Math.max(p1.pos.y + p1.h, p2.pos.y + p2.h);

          const buildPreviewEntities = levelRef.current.entities.filter(e => (e as any).isBuildPreview);

          if (buildPreviewEntities.length > 0) {
            minX = Math.min(minX, ...buildPreviewEntities.map(e => e.x));
            maxX = Math.max(maxX, ...buildPreviewEntities.map(e => e.x + (e.w || 30)));
            minY = Math.min(minY, ...buildPreviewEntities.map(e => e.y));
            maxY = Math.max(maxY, ...buildPreviewEntities.map(e => e.y + (e.h || 30)));
          }

          const dx = maxX - minX;
          const dy = maxY - minY;

          // Compute target zoom based on the distance with a padding of 160
          const zx = GAME_WIDTH / (dx + 160);
          const zy = GAME_HEIGHT / (dy + 160);
          const targetZoom = Math.max(0.2, Math.min(1.0, Math.min(zx, zy)));

          // Smoothly interpolate zoom
          cameraZoom.current += (targetZoom - cameraZoom.current) * 0.1;

          // Target center is the midpoint of the bounding box
          const cx = minX + dx / 2;
          const cy = minY + dy / 2;

          // Bound center so that the camera frame doesn't show beyond level boundaries
          const levelW = levelRef.current.width || GAME_WIDTH;
          const levelH = levelRef.current.height || GAME_HEIGHT;

          const halfVisWidth = GAME_WIDTH / (2 * cameraZoom.current);
          const halfVisHeight = GAME_HEIGHT / (2 * cameraZoom.current);

          let centerX = cx;
          let centerY = cy;

          if (halfVisWidth * 2 > levelW) {
            centerX = levelW / 2;
          } else {
            centerX = Math.max(halfVisWidth, Math.min(centerX, levelW - halfVisWidth));
          }

          if (halfVisHeight * 2 > levelH) {
            centerY = levelH / 2;
          } else {
            centerY = Math.max(halfVisHeight, Math.min(centerY, levelH - halfVisHeight));
          }

          // Top-left coordinate of the camera:
          targetCameraX = centerX - GAME_WIDTH / 2;
          targetCameraY = centerY - GAME_HEIGHT / 2;
        } else {
          cameraZoom.current += (1.0 - cameraZoom.current) * 0.1;
          let totalX = 0;
          let totalY = 0;
          let activeCount = 0;
          players.current.forEach((p) => {
            if (p.lives > 0 || gameMode !== "brawler") {
              totalX += p.pos.x;
              totalY += p.pos.y;
              activeCount++;
            }
          });
          if (activeCount > 0) {
            targetCameraX = totalX / activeCount - GAME_WIDTH / 2 + 15;
            targetCameraY = totalY / activeCount - GAME_HEIGHT / 2 + 15;
          }
        }
      } else {
        cameraZoom.current += (1.0 - cameraZoom.current) * 0.1;

        if (isSpectatingNowLocal) {
          if (followedPlayer) {
            targetCameraX = followedPlayer.pos.x - GAME_WIDTH / 2 + 15;
            targetCameraY = followedPlayer.pos.y - GAME_HEIGHT / 2 + 15;
          } else {
            const localP = players.current.find(
              (p) => p.onlineId === onlineService.localPlayer?.id,
            );
            if (localP) {
              targetCameraX = localP.pos.x - GAME_WIDTH / 2 + 15;
              targetCameraY = localP.pos.y - GAME_HEIGHT / 2 + 15;
            }
          }
        } else {
          let totalX = 0;
          let totalY = 0;
          let activeCount = 0;
          players.current.forEach((p) => {
            if (p.lives > 0 || gameMode !== "brawler") {
              totalX += p.pos.x;
              totalY += p.pos.y;
              activeCount++;
            }
          });
          if (activeCount > 0) {
            targetCameraX = totalX / activeCount - GAME_WIDTH / 2 + 15;
            targetCameraY = totalY / activeCount - GAME_HEIGHT / 2 + 15;
          }
        }
      }

      if (!isLocalBuildBattle) {
        targetCameraX = Math.max(0, Math.min(targetCameraX, maxCamX));
        targetCameraY = Math.max(0, Math.min(targetCameraY, maxCamY));
      }

      // In auto-scroll mode, camera normally sits at the wall (left bound) for the player.
      // However, spectators should follow their target smoothly.
      const oldCamX = cameraRef.current.x;
      const oldCamY = cameraRef.current.y;
      
      if ((level.autoScroll || geometryDashMode) && !isSpectatingNowLocal) {
        cameraRef.current.x = scrollWallX.current;
      } else {
        // Smoothly transition both in normal levels and when spectating auto-scroll levels
        cameraRef.current.x += (targetCameraX - cameraRef.current.x) * 0.1;
      }
      cameraRef.current.y += (targetCameraY - cameraRef.current.y) * 0.1;

      cameraVel.current.x = cameraRef.current.x - oldCamX;
      cameraVel.current.y = cameraRef.current.y - oldCamY;
    };

    const updatePhysics = () => {
      // Start game on any key press if not already started
      if (!hasStartedMoving.current && !isStartingRef.current) {
        const anyKeyPressed = Object.values(keys.current).some(
          (v) => v === true,
        );
        if (anyKeyPressed) {
          hasStartedMoving.current = true;
        }
      }

      const now = Date.now();
      tempBlocks.current = tempBlocks.current.filter((b) => b.expires > now);

      // Update Particles
      particles.current.forEach((p) => {
        if (p.isDeathAnim) {
          const deathElapsed = Date.now() - (p.startTime || Date.now());
          p.life = 1 - deathElapsed / 500;
          return;
        }
        const pdt = timeScaleRef.current;
        p.x += p.vx * pdt;
        p.y += p.vy * pdt;
        if (p.type === "dust") {
          p.vy += 0.05 * pdt; // Light gravity for dust
        } else {
          p.vy += 0.15 * pdt; // Gravity for sparks/coins
        }
        p.life -= (p.type === "dust" ? 0.03 : 0.02) * pdt;
      });
      particles.current = particles.current.filter((p) => p.life > 0);

      const collectPowerup = (id: string, p: PlayerState) => {
        if (!p.collectedPowerupIds.includes(id)) {
          p.collectedPowerupIds.push(id);
          if (p.onlineId === onlineService.localPlayer?.id) {
            if (isOnline) onlineService.sendEvent("powerup_collected", { id });
          }
        }
      };

      // Manage Slow Mo Timer
      if (slowMoTimerRef.current > 0) {
        slowMoTimerRef.current--;
        timeScaleRef.current = SLOW_MO_FACTOR;
      } else {
        timeScaleRef.current = 1.0;
      }

      // Manage X-Ray Timer
      if (xrayTimerRef.current > 0) {
        xrayTimerRef.current--;
      }

      const dt = timeScaleRef.current; // Time Delta Factor

      // Use a globally synchronized time for moving platforms in multiplayer
      // Date.now() is roughly synced across clients via NTP.
      // We use a large modulo to prevent precision issues with Math.sin over long periods.
      const syncTime = Date.now() % 10000000;
      const effectiveTime = isOnline ? syncTime : gameTimeRef.current;

      if (isOnline) {
        gameTimeRef.current = syncTime;
      } else {
        gameTimeRef.current += 16.66 * dt;
      }

      if (gameMode === "brawler" && hasStartedMoving.current) {
        roundTimerRef.current += dt;
      }

      // Collapsing Platforms Timer Logic
      if (
        gameMode === "brawler" &&
        brawlerHazardMode === "collapsing_platforms" &&
        hasStartedMoving.current
      ) {
        if (effectiveTime - lastHazardTriggerTime.current > 7000) {
          lastHazardTriggerTime.current = effectiveTime;

          const candidates = levelRef.current.entities.filter(
            (e) =>
              (e.type === "wall" || e.type === "ice" || e.type === "slime") &&
              !collapsingStates.current[e.id || `${e.x}_${e.y}`],
          );

          if (candidates.length > 0) {
            if (!isOnline || onlineService.isHost) {
              const randomIndex = Math.floor(Math.random() * candidates.length);
              const chosen = candidates[randomIndex];
              const id = chosen.id || `${chosen.x}_${chosen.y}`;
              collapsingStates.current[id] = { touchedAt: effectiveTime };

              if (isOnline) {
                onlineService.sendEvent("hazard_trigger", {
                  id,
                  time: effectiveTime,
                });
              }
            }
          }
        }
      }

      const fakeTypes = ["walkthrough_wall", "troll_wall", "fake_goal", "fake_ice", "fake_slime", "ghost_hazard", "fake"];

      const collidableEntities = [
        ...levelRef.current.entities,
        ...tempBlocks.current,
        ...dynamicPowerups.current,
      ]
        .filter((e) => !(geometryDashMode && fakeTypes.includes(e.type)))
        .map((e) => getDynamicEntity(e, effectiveTime, isOnline ? 1.0 : dt))
        .filter(Boolean) as (Entity & { dx?: number; dy?: number })[];

      if (shakeIntensity.current > 0) {
        shakeIntensity.current *= 0.9;
        if (shakeIntensity.current < 0.5) shakeIntensity.current = 0;
      }

      const collectedInLevelCount = levelCoinIds.filter((id) =>
        collectedCoinsRef.current.includes(id),
      ).length;
      const isGoalUnlocked =
        gameMode === "brawler"
          ? true
          : collectedInLevelCount === levelCoinIds.length;

      // Spawn dynamic powerups in Brawler mode
      const isHost = !isOnline || onlineService.isHost;
      if (
        gameMode === "brawler" &&
        isHost &&
        effectiveTime - lastPowerupSpawnTime.current > 5000 &&
        dynamicPowerups.current.length < 20
      ) {
        lastPowerupSpawnTime.current = effectiveTime;
        // Determine powerup type based on weights
        let selectedType: EntityType | null = null;
        let shouldSpawn = true;

        if (brawlerPowerups) {
          const totalWeight = (
            Object.values(brawlerPowerups) as number[]
          ).reduce((sum, weight) => sum + weight, 0);
          if (totalWeight > 0) {
            let randomWeight = Math.random() * totalWeight;
            for (const [type, weight] of Object.entries(brawlerPowerups) as [
              string,
              number,
            ][]) {
              randomWeight -= weight;
              if (randomWeight <= 0) {
                selectedType = type as EntityType;
                break;
              }
            }
          } else {
            shouldSpawn = false;
          }
        }

        if (shouldSpawn) {
          if (!selectedType) {
            const types: EntityType[] = [
              "powerup_ice_block",
              "powerup_slime_block",
              "powerup_fireball",
              "powerup_teleport",
              "powerup_triple_jump",
              "powerup_bomb",
              "powerup_shield",
              "powerup_steal",
              "powerup_slow",
              "powerup_melee",
              "powerup_shrink",
              "powerup_grow",
              "powerup_dash",
            ];
            selectedType = types[Math.floor(Math.random() * types.length)];
          }

          const spawners = levelRef.current.entities.filter(
            (e) => e.type === "powerup_spawner",
          );
          if (spawners.length > 0) {
            const spawner =
              spawners[Math.floor(Math.random() * spawners.length)];
            const spawnX = spawner.x + spawner.w / 2 - 10;
            const spawnY = spawner.y + spawner.h / 2 - 10;
            const rect = { x: spawnX, y: spawnY, w: 20, h: 20 };
            const isFree = !dynamicPowerups.current.some((e) =>
              checkCollision(rect, e),
            );
            if (isFree) {
              const id = `dyn_${Date.now()}_${Math.random()}`;
              const powerup = {
                x: spawnX,
                y: spawnY,
                w: 20,
                h: 20,
                type: selectedType,
                id,
              };
              dynamicPowerups.current.push(powerup);
              if (isOnline) onlineService.sendEvent("powerup_spawned", powerup);
            }
          } else {
            const solidBlocks = levelRef.current.entities.filter((e) =>
              ["wall", "ice", "slime"].includes(e.type),
            );
            if (solidBlocks.length > 0) {
              const block =
                solidBlocks[Math.floor(Math.random() * solidBlocks.length)];
              const spawnX = block.x + block.w / 2 - 10;
              const spawnY = block.y - 20;
              const rect = { x: spawnX, y: spawnY, w: 20, h: 20 };
              const isFree =
                !levelRef.current.entities.some((e) => checkCollision(rect, e)) &&
                !dynamicPowerups.current.some((e) => checkCollision(rect, e));
              if (isFree) {
                const id = `dyn_${Date.now()}_${Math.random()}`;
                const powerup = {
                  x: spawnX,
                  y: spawnY,
                  w: 20,
                  h: 20,
                  type: selectedType,
                  id,
                };
                dynamicPowerups.current.push(powerup);
                if (isOnline)
                  onlineService.sendEvent("powerup_spawned", powerup);
              }
            }
          }
        }
      }

      players.current.forEach((p, idx) => {
        if (!p) return;

        // --- Powerup Timer Decrements (Always run for all players to sync visuals) ---
        if (p.finished) {
          p.vel = { x: 0, y: 0 }; // Zero velocity to stop visual rendering jitter
          // For finished players, we still want to interpolate their positions if they are remote
          const isLocal =
            !isOnline || p.onlineId === onlineService.localPlayer?.id;
          if (!isLocal && p.targetPos) {
            const dist = Math.sqrt(
              Math.pow(p.targetPos.x - p.pos.x, 2) +
                Math.pow(p.targetPos.y - p.pos.y, 2),
            );
            if (dist > 100) {
              p.pos.x = p.targetPos.x;
              p.pos.y = p.targetPos.y;
            } else {
              const dtInSeconds = (16.66 / 1000) * dt;
              const lerpFactor = 1.0 - Math.exp(-25 * dtInSeconds);
              p.pos.x += (p.targetPos.x - p.pos.x) * lerpFactor;
              p.pos.y += (p.targetPos.y - p.pos.y) * lerpFactor;
            }
          }
          return;
        }

        if (p.shieldTimer > 0) p.shieldTimer--;
        if (p.slowTimer > 0) p.slowTimer--;
        if (p.iceTimer > 0) p.iceTimer--;
        if (p.slimeTimer > 0) p.slimeTimer--;
        if (p.shrinkTimer > 0) {
          p.shrinkTimer--;
          if (p.shrinkTimer <= 0) resetPlayerSize(p);
        }
        if (p.growTimer > 0) {
          p.growTimer--;
          if (p.growTimer <= 0) resetPlayerSize(p);
        }
        if (p.meleeTimer > 0) {
          p.meleeTimer--;
          if (p.meleeTimer <= 0) p.meleeActive = false;
        }

        if (isNaN(p.pos.x) || isNaN(p.pos.y)) {
          console.error("Player position is NaN!", p);
        }

        // After Y-collision loop
        if (p.wasGrounded && !p.isGrounded && p.vel.y * p.gravity >= 0) {
          p.coyoteTimer = 6; // ~100ms at 60fps
        }

        // Track landing
        if (p.isGrounded && !p.wasGrounded) {
          const spawnY = p.gravity < 0 ? p.pos.y : p.pos.y + p.h;
          spawnParticles(p.pos.x + p.w / 2, spawnY, "#ffffff", 8, "dust");
        }
        p.wasGrounded = p.isGrounded;

        const isLocal =
          !isOnline || p.onlineId === onlineService.localPlayer?.id;

        // --- Gamepad Support ---
        // We check keyboard array directly:
        const checkAction = (action: keyof Keybindings) => {
          if (!isLocal || paused || isStartingRef.current) return false;
          const bindings = p.controls[action] || [];
          return bindings.some((code) => keys.current[code]);
        };

        let pressingLeft = geometryDashMode ? false : checkAction("left");
        let pressingRight = geometryDashMode ? true : checkAction("right");
        let pressingJump = geometryDashMode
          ? (checkAction("up") || checkAction("action") || checkAction("dash") || keys.current["Space"] || keys.current["ArrowUp"] || keys.current["KeyW"] || keys.current["Click"])
          : checkAction("up");
        let pressingDown = geometryDashMode ? false : checkAction("down");
        const pressingAction = geometryDashMode ? false : checkAction("action");
        const pressingDash = geometryDashMode ? false : checkAction("dash");

        if (isLocal && !p.hasStartedMove && !paused && !isStartingRef.current) {
          if (
            pressingLeft ||
            pressingRight ||
            pressingJump ||
            pressingDown ||
            pressingAction ||
            pressingDash
          ) {
            p.hasStartedMove = true;
            const scrollSpeed = level.autoScrollSpeed || 150;
            const startWallX = level.autoScroll
              ? Math.max(0, p.pos.x - GAME_WIDTH / 2 + 15)
              : 0;
            p.moveStartTime = Date.now() - (startWallX / scrollSpeed) * 1000;
            p.scrollX = startWallX;
          }
        }

        // --- Remote Player Interpolation ---
        if (!isLocal) {
          if (p.targetPos) {
            // Smoothly interpolate current position towards target
            // We use a slightly more robust lerp that doesn't rely on extrapolating the target every frame
            // which can cause drift if velocity is slightly off.

            const dist = Math.sqrt(
              Math.pow(p.targetPos.x - p.pos.x, 2) +
                Math.pow(p.targetPos.y - p.pos.y, 2),
            );

            // If distance is huge (e.g. teleport or respawn), just snap
            if (dist > 100) {
              p.pos.x = p.targetPos.x;
              p.pos.y = p.targetPos.y;
            } else {
              // Standard lerp for smooth movement
              const dtInSeconds = (16.66 / 1000) * dt;
              const lerpFactor = 1.0 - Math.exp(-25 * dtInSeconds); // Responsive lerp for real-time tracking

              // Move current position towards target
              p.pos.x += (p.targetPos.x - p.pos.x) * lerpFactor;
              p.pos.y += (p.targetPos.y - p.pos.y) * lerpFactor;

              // Also apply velocity prediction to the current position to keep it moving between syncs
              // This is standard dead reckoning, and makes movement look beautifully smooth!
              p.pos.x += p.vel.x * dt;
              p.pos.y += p.vel.y * dt;
            }
          }

          // Update facing based on velocity
          if (Math.abs(p.vel.x) > 0.1) p.facing = p.vel.x > 0 ? 1 : -1;

          // Update trail
          p.trail.push({ x: p.pos.x, y: p.pos.y, w: p.w, h: p.h });
          if (p.trail.length > 10) p.trail.shift();

          return; // Skip physics for remote players
        }

        // --- Local Player Physics ---
        if (p.teleportCooldown > 0) p.teleportCooldown--;
        if (p.hookCooldown > 0) p.hookCooldown--;
        if (p.wallStickTimer > 0) p.wallStickTimer--;
        if (p.wallCoyoteTimer > 0) p.wallCoyoteTimer--;

        // Ability Cooldowns
        if (p.dashCooldown > 0) p.dashCooldown--;
        if (p.dashTimer > 0) {
          p.dashTimer--;
          p.vel.x = p.dashDirection.x * 15 * dt;
          p.vel.y = p.dashDirection.y * 15 * dt;
        }

        // Apply platform movement from previous frame if grounded
        if (p.isGrounded) {
          p.pos.x += p.platformDelta.x;
          p.pos.y += p.platformDelta.y;
        }
        p.platformDelta = { x: 0, y: 0 };

        if (p.gravity < 0) {
          if (settings?.invertXOnGravityReverse) {
            const temp = pressingLeft;
            pressingLeft = pressingRight;
            pressingRight = temp;
          }
          if (settings?.invertYOnGravityReverse) {
            const temp = pressingJump;
            pressingJump = pressingDown;
            pressingDown = temp;
          }
        }

        if (isLocal) {
          if (!pressingJump) {
            p.canJump = true;
          } else {
            // Autojump: if holding jump, keep the buffer alive while on ground or wall-sliding
            if (p.isGrounded || p.isWallSliding) {
              p.jumpBufferTimer = Math.max(p.jumpBufferTimer, 6);
              p.canJump = true;
            }
          }
        }

        if (pressingLeft) p.facing = -1;
        if (pressingRight) p.facing = 1;

        // Size Logic (Shrink / Grow)
        if (p.shrinkTimer > 0) {
          p.shrinkTimer--;
          if (p.shrinkTimer === 0) {
            // Try to grow back to normal
            const growRect = { x: p.pos.x, y: p.pos.y - 10, w: 20, h: 20 };
            const canGrow = !collidableEntities.some(
              (e) =>
                ![
                  "coin",
                  "checkpoint",
                  "powerup_remover",
                  "walkthrough_wall",
                  "fake_goal",
                  "fake_ice",
                  "fake_slime",
                  "ghost_hazard",
                  "gravity_reverse",
                  "gravity_zero",
                ].includes(e.type) &&
                !e.type.startsWith("powerup_") &&
                !e.type.startsWith("block_") &&
                checkCollision(growRect, e),
            );
            if (canGrow) {
              p.isShrunk = false;
              p.w = 20;
              p.h = 20;
              p.pos.y -= 10;
            } else {
              p.shrinkTimer = 1; // Keep shrunk until there's space
            }
          }
        } else if (p.growTimer > 0) {
          p.growTimer--;
          if (p.growTimer === 0) {
            // Try to shrink back to normal
            p.isGrown = false;
            p.w = 20;
            p.h = 20;
            p.pos.y += 20;
          }
        } else {
          // Revert manual shrink if we aren't permanently shrunk by a block
          if (p.isShrunk && !p.isPermanentlyShrunk) {
            const growRect = { x: p.pos.x, y: p.pos.y - 10, w: 20, h: 20 };
            const canGrow = !collidableEntities.some(
              (e) =>
                ![
                  "coin",
                  "checkpoint",
                  "powerup_remover",
                  "walkthrough_wall",
                  "fake_goal",
                  "fake_ice",
                  "fake_slime",
                  "ghost_hazard",
                  "gravity_reverse",
                  "gravity_zero",
                ].includes(e.type) &&
                !e.type.startsWith("powerup_") &&
                !e.type.startsWith("block_") &&
                checkCollision(growRect, e),
            );
            if (canGrow) {
              p.isShrunk = false;
              p.w = 20;
              p.h = 20;
              p.pos.y -= 10;
            }
          }
        }

        // Tick timers
        if (p.coyoteTimer > 0) p.coyoteTimer -= dt;
        if (p.jumpBufferTimer > 0) p.jumpBufferTimer -= dt;

        // Tick Geometry Dash rotation angle
        if (geometryDashMode || (p as any).continuousRotation) {
          if (!p.isGrounded || (p as any).continuousRotation) {
            p.rotationAngle = ((p.rotationAngle || 0) + 8.5 * dt) % 360;
          } else {
            const currentAngle = p.rotationAngle || 0;
            const targetAngle = Math.round(currentAngle / 90) * 90;
            p.rotationAngle = targetAngle % 360;
          }
        } else {
          p.rotationAngle = 0;
        }

        // Hook Physics override
        p.gravity = p.gravityFlipped ? -GRAVITY : GRAVITY;
        collidableEntities.forEach((entity) => {
          if ((entity.type as any) === "fan") {
            const windH = 185;
            const inWindX = p.pos.x + p.w > entity.x && p.pos.x < entity.x + entity.w;
            const inWindY = p.pos.y + p.h > entity.y - windH && p.pos.y < entity.y;
            if (inWindX && inWindY) {
              const distFrac = 1.0 - (entity.y - p.pos.y) / windH; // Stronger closer to the fan
              const pushForce = 0.88 * Math.max(0.25, distFrac);
              p.vel.y -= pushForce * (p.gravity < 0 ? -1 : 1);
            }
          }

          if (
            entity.type === "gravity_reverse" ||
            entity.type === "gravity_zero" ||
            entity.type.startsWith("block_")
          ) {
            if (
              checkCollision({ x: p.pos.x, y: p.pos.y, w: p.w, h: p.h }, entity)
            ) {
              if (entity.type === "gravity_reverse")
                p.gravity = (p.gravityFlipped ? -GRAVITY : GRAVITY) * 1.8;
              if (entity.type === "gravity_zero")
                p.gravity = (p.gravityFlipped ? -GRAVITY : GRAVITY) * 0.1;

              if (entity.type === "block_dash" && p.dashCooldown === 0) {
                p.dashTimer = 10;
                p.dashCooldown = 60;
                p.dashDirection = { x: p.facing, y: 0 };
                audio.playJump();
                spawnParticles(
                  p.pos.x + p.w / 2,
                  p.pos.y + p.h / 2,
                  p.color,
                  10,
                  "spark",
                );
              }
              if (entity.type === "block_shrink") {
                if (!p.isShrunk) {
                  p.isShrunk = true;
                  p.isPermanentlyShrunk = true;
                  p.isGrown = false;
                  p.isPermanentlyGrown = false;
                  p.w = 10;
                  p.h = 10;
                  p.pos.y += 10;
                }
              }
              if (entity.type === "block_grow") {
                if (!p.isGrown) {
                  p.isGrown = true;
                  p.isPermanentlyGrown = true;
                  if (p.isShrunk) {
                    p.isShrunk = false;
                    p.isPermanentlyShrunk = false;
                    p.w = 40;
                    p.h = 40;
                    p.pos.y -= 30;
                  } else {
                    p.w = 40;
                    p.h = 40;
                    p.pos.y -= 20;
                  }
                }
              }
              if (entity.type === "block_gravity" && p.teleportCooldown === 0) {
                p.gravityFlipped = !p.gravityFlipped;
                p.teleportCooldown = 30;
                audio.playBuild();
              }
            }
          }
        });

        const stats = getBrawlerStats(p.brawlerClass, gameMode);

        if (p.hookActive && p.hookPos) {
          // Check hook duration (1 second limit)
          p.hookDuration++;
          if (p.hookDuration > 60) {
            p.hookActive = false;
            p.hookPos = null;
          } else {
            const dx = p.hookPos.x - (p.pos.x + 10);
            const dy = p.hookPos.y - (p.pos.y + 10);
            const dist = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
            const dirX = dx / dist;
            const dirY = dy / dist;

            // Hook Force scaled by dt
            p.vel.x += dirX * HOOK_PULL_FORCE * dt;
            p.vel.y += dirY * HOOK_PULL_FORCE * dt;

            // Drag while hooking (not scaled as much to prevent floatiness)
            p.vel.x *= 0.95;
            p.vel.y *= 0.95;

            p.jumpCount = 0; // Hook resets jumps
            p.tripleJumpActive = false;
          }
        } else {
          // Normal Movement
          if (geometryDashMode) {
            let speedMul = 1.0;
            if (p.surfaceType === "ice" || p.wallSurfaceType === "ice") speedMul = 1.5;
            if (p.surfaceType === "slime" || p.wallSurfaceType === "slime") speedMul = 0.7;
            p.vel.x = ((260 * speedMul) / 60) * dt;
          } else {
            let moveX = 0;
            const currentMaxSpeed =
              MAX_SPEED *
              (slowMoTimerRef.current > 0 ? 1.0 : 1.0) *
              (p.slowTimer > 0 ? 0.5 : 1.0) *
              stats.speedMul;

            // Only allow player to accelerate if they are not currently being knocked back (exceeding max speed)
            if (Math.abs(p.vel.x) <= currentMaxSpeed * 1.5) {
              const currentAccel =
                MOVE_ACCEL * (p.slowTimer > 0 ? 0.5 : 1.0) * stats.speedMul;
              if (pressingLeft) moveX -= currentAccel;
              if (pressingRight) moveX += currentAccel;
            }

            p.vel.x += moveX * dt; // Apply acceleration with time scaling
          }

          p.vel.y += p.gravity * stats.gravityMul * dt; // Apply gravity with time scaling

          // Wall Slide Logic
          if (p.isWallSliding) {
            if (p.wallSurfaceType === "slime") {
              // Slime Sticky Logic: If pushing INTO wall, stop.
              const pushingInto =
                (p.wallDir === 1 && pressingRight) ||
                (p.wallDir === -1 && pressingLeft);
              if (pushingInto) {
                p.vel.y = 0; // Stick completely
              } else {
                if (p.vel.y > SLIME_WALL_SLIDE_SPEED * dt)
                  p.vel.y = SLIME_WALL_SLIDE_SPEED * dt;
              }
            } else {
              // Standard slide
              if (p.vel.y > WALL_SLIDE_SPEED * dt)
                p.vel.y = WALL_SLIDE_SPEED * dt;
            }
          }
        }

        // Jump Logic (Ground / Wall)
        const canCoyoteJump = p.isGrounded || p.coyoteTimer > 0;
        if (p.jumpBufferTimer > 0 && p.canJump) {
          if (canCoyoteJump) {
            let force = JUMP_FORCE * stats.jumpMul;
            if (p.surfaceType === "slime")
              force = SLIME_JUMP_FORCE * Math.pow(stats.jumpMul, 0.5);
            if (p.gravity < 0) force = -force;

            // Adjusted jump force during slow mo
            const jumpBoost = force * (slowMoTimerRef.current > 0 ? 0.62 : 1);
            p.vel.y = jumpBoost + p.lastPlatformVel.y;
            p.vel.x += p.lastPlatformVel.x;

            p.isGrounded = false;
            p.coyoteTimer = 0;
            p.jumpBufferTimer = 0;
            p.canJump = false; // Require release
            p.jumpCount = 1; // Used 1 jump
            audio.playJump();
            if (onJump) onJump();
            const spawnY = p.gravity < 0 ? p.pos.y : p.pos.y + p.h;
            spawnParticles(p.pos.x + p.w / 2, spawnY, "#ffffff", 5, "dust");
          } else if (p.isWallSliding || p.wallCoyoteTimer > 0) {
            const jumpDir = p.isWallSliding ? p.wallDir : p.lastWallDir;
            if (jumpDir !== 0) {
              // Adjusted jump force during slow mo
              p.vel.y =
                WALL_JUMP_FORCE.y *
                (slowMoTimerRef.current > 0 ? 0.62 : 1) *
                stats.jumpMul;
              p.vel.x =
                -jumpDir *
                WALL_JUMP_FORCE.x *
                (slowMoTimerRef.current > 0 ? 0.8 : 1);
              p.isWallSliding = false;
              p.wallCoyoteTimer = 0;
              p.jumpBufferTimer = 0;
              p.canJump = false;
              p.jumpCount = 1;
              audio.playJump();
              if (onJump) onJump();
              spawnParticles(
                p.pos.x + (jumpDir === 1 ? p.w : 0),
                p.pos.y + p.h / 2,
                "#ffffff",
                5,
                "dust",
              );
            }
          }
        }

        // X Collision
        p.pos.x += p.vel.x; // Velocity effectively represents "movement per frame" now

        let playerRect = { x: p.pos.x, y: p.pos.y, w: p.w, h: p.h };
        // Use a small vertical inset for X-collision to prevent being "pushed off"
        // when standing on top of moving platforms due to sub-pixel overlaps.
        let playerRectX = { x: p.pos.x, y: p.pos.y + 2, w: p.w, h: p.h - 4 };
        p.isWallSliding = false;
        p.wallDir = 0;
        p.wallSurfaceType = "none";

        for (const entity of collidableEntities) {
          // Identify generated powerup ID (simple coord based or unique ID if generated properly)
          const powerupId =
            entity.id || `${entity.x}_${entity.y}_${entity.type}`;

          const isCollectedByMe = p.collectedPowerupIds.includes(powerupId);

          if (
            (entity.type === "coin" &&
              (players.current.length > 1 || gameMode === "vs"
                ? p.collectedCoinIds.includes(entity.id || "0")
                : collectedCoinsRef.current.includes(entity.id || ""))) ||
            (isCollectedByMe && entity.type.startsWith("powerup_"))
          ) {
            continue;
          }

          if (checkCollision(playerRectX, entity)) {
            // Pass-through entities
            if (
              !geometryDashMode && (
                entity.type === "walkthrough_wall" ||
                entity.type === "troll_wall" ||
                entity.type === "fake_goal" ||
                entity.type === "fake_ice" ||
                entity.type === "fake_slime"
              )
            )
              continue; // Do nothing, just pass
            if (entity.type === "ghost_hazard") continue; // Do nothing, just pass
            if (entity.type.startsWith("powerup_")) {
              // Powerups are handled below, but we explicitly return here to prevent solid collision
              // However, we need to let the logic fall through to the collection check below
              // Actually, the collection logic is inside this block.
              // So we just need to ensure we don't hit the "Solid Collision" block at the end.
            }

            if (entity.type === "powerup_remover") {
              // Remove abilities
              if (
                p.oneTimeBuild ||
                p.oneTimeHook ||
                p.oneTimeDoubleJump ||
                p.oneTimeTripleJump ||
                p.tripleJumpActive ||
                p.isShrunk ||
                p.isGrown
              ) {
                p.oneTimeBuild = false;
                p.oneTimeHook = false;
                p.oneTimeDoubleJump = false;
                p.oneTimeTripleJump = false;
                p.tripleJumpActive = false;

                if (p.isShrunk) {
                  p.isShrunk = false;
                  p.isPermanentlyShrunk = false;
                  p.w = 20;
                  p.h = 20;
                  p.pos.y -= 10;
                }
                if (p.isGrown) {
                  p.isGrown = false;
                  p.isPermanentlyGrown = false;
                  p.w = 20;
                  p.h = 20;
                  p.pos.y += 20;
                }

                shakeIntensity.current = 2; // Small shake feedback
              }
              continue; // Pass through
            }

            if (entity.type === "coin") {
              if (gameMode === "brawler") continue; // No coins in Brawler mode
              const coinId = entity.id || "0";

              if (!p.collectedCoinIds.includes(coinId)) {
                p.collectedCoinIds.push(coinId);
              }

              const isMulti = players.current.length > 1 || gameMode === "vs";

              audio.playCoin();
              spawnParticles(
                entity.x + entity.w / 2,
                entity.y + entity.h / 2,
                isMulti ? p.color : COLORS.COIN,
                4,
                isMulti ? "spark" : "coin",
              );

              if (gameMode === "vs") {
                if (isOnline) {
                  onlineService.sendEvent("coin_collected", { coinId });
                }
              } else {
                onCoin(coinId);
                shakeIntensity.current = 5;
              }
              continue;
            }
            if (entity.type === "checkpoint") {
              if (level.autoScroll || geometryDashMode) continue; // Disable checkpoints in auto-scroll levels
              // Check if this checkpoint is new
              if (
                currentRespawnPos.current.x !== entity.x ||
                currentRespawnPos.current.y !== entity.y
              ) {
                currentRespawnPos.current = { x: entity.x, y: entity.y };
                shakeIntensity.current = 5;
                audio.playBuild(); // Use build sound as checkpoint unlock
              }
              continue;
            }
            if (entity.type.startsWith("powerup_")) {
              if (gameMode === "brawler") {
                if (!p.inventory) {
                  p.inventory = entity.type as EntityType;
                  collectPowerup(powerupId, p);
                  dynamicPowerups.current = dynamicPowerups.current.filter(
                    (e) => e.id !== powerupId,
                  );
                  audio.playCoin();
                } else if (brawlerComboPowerups) {
                  const fused = getFusedPowerupType(p.inventory, entity.type);
                  p.inventory = fused as EntityType;
                  collectPowerup(powerupId, p);
                  dynamicPowerups.current = dynamicPowerups.current.filter(
                    (e) => e.id !== powerupId,
                  );
                  audio.playPowerup();
                  shakeIntensity.current = 10;
                }
                continue;
              }
            }

            if (entity.type === "powerup_build") {
              p.oneTimeBuild = true;
              collectPowerup(powerupId, p);
              audio.playCoin();
              continue;
            }
            if (entity.type === "powerup_hook") {
              p.oneTimeHook = true;
              collectPowerup(powerupId, p);
              audio.playCoin();
              continue;
            }
            if (entity.type === "powerup_double_jump") {
              p.oneTimeDoubleJump = true;
              collectPowerup(powerupId, p);
              audio.playCoin();
              continue;
            }
            if (entity.type === "powerup_triple_jump") {
              p.oneTimeTripleJump = true;
              collectPowerup(powerupId, p);
              audio.playCoin();
              continue;
            }
            if (entity.type === "powerup_slow_mo") {
              slowMoTimerRef.current = 180; // Assuming SLOW_MO_DURATION or hardcode
              collectPowerup(powerupId, p);
              audio.playCoin(); // Or a specific slow mo sound
              continue;
            }
            if (entity.type === "powerup_xray") {
              xrayTimerRef.current = 180; // 3 seconds at 60fps
              collectPowerup(powerupId, p);
              audio.playCoin();
              continue;
            }

            if (entity.type === "hazard") {
              if (p.shieldTimer > 0) continue; // Ignore hazard completely if shielded
              if (isOnline && p.onlineId !== onlineService.localPlayer?.id)
                continue; // Only process for local player
              if (
                level?.id === "tutorial" &&
                gameMode !== "vs" &&
                gameMode !== "brawler"
              ) {
                p.vel.y = -10;
                shakeIntensity.current = 5;
              } else if (gameMode === "vs") {
                // In VS mode, respawn at start (or checkpoint if we implemented per-player checkpoints, but VS uses shared level start typically)
                // But using currentRespawnPos allows VS checkpoints too if needed.
                p.deaths = (p.deaths || 0) + 1;
                spawnParticles(
                  p.pos.x + p.w / 2,
                  p.pos.y + p.h / 2,
                  p.color,
                  20,
                  "blood",
                );
                
                if (status === "build_battle_playing") {
                  p.dead = true;
                  p.finished = true;
                  p.vel = { x: 0, y: 0 };
                  shakeIntensity.current = 10;
                  audio.playDie(p.deathSound);
                  checkBuildBattleWinCondition();
                } else {
                  p.pos = { ...currentRespawnPos.current };
                  p.ghostOverlapIndices = players.current
                    .filter((op) => op.playerIndex !== p.playerIndex)
                    .map((op) => op.playerIndex);
                  p.vel = { x: 0, y: 0 };
                  p.respawnTimer = Date.now();
                  resetPlayerSize(p);
                  shakeIntensity.current = 10;
                  audio.playDie(p.deathSound);
                }
                if (isOnline) onlineService.sendEvent("die", null);
              } else if (gameMode === "brawler") {
                if (p.lives !== undefined) {
                  p.lives--;
                  spawnParticles(
                    p.pos.x + p.w / 2,
                    p.pos.y + p.h / 2,
                    p.color,
                    20,
                    "blood",
                  );
                  if (p.lives <= 0) {
                    p.finished = true;
                    checkBrawlerWinCondition();
                    if (isOnline) onlineService.sendEvent("lose", null);
                  } else {
                    p.pos = getSpawnPos(p.playerIndex, p.team || 0);
                    p.ghostOverlapIndices = players.current
                      .filter((op) => op.playerIndex !== p.playerIndex)
                      .map((op) => op.playerIndex);
                    p.vel = { x: 0, y: 0 };
                    p.respawnTimer = Date.now();
                    resetPlayerSize(p);
                    shakeIntensity.current = 10;
                    audio.playDie(p.deathSound);
                    if (isOnline) onlineService.sendEvent("die", null);
                  }
                }
              } else {
                spawnParticles(
                  p.pos.x + p.w / 2,
                  p.pos.y + p.h / 2,
                  p.color,
                  20,
                  "blood",
                );
                p.pos = { ...currentRespawnPos.current };
                p.ghostOverlapIndices = players.current
                  .filter((op) => op.playerIndex !== p.playerIndex)
                  .map((op) => op.playerIndex);
                p.vel = { x: 0, y: 0 };
                p.respawnTimer = Date.now();
                resetPlayerSize(p);
                onDie();
                if (isOnline) onlineService.sendEvent("die", null);
              }
              break;
            }
            if (
              entity.type === "goal" &&
              (gameMode === "vs"
                ? p.collectedCoinIds.length === levelCoinIds.length
                : isGoalUnlocked)
            ) {
              if (isOnline && p.onlineId !== onlineService.localPlayer?.id)
                continue; // Only process for local player

              if (!p.finished) {
                // Save Ghost if it's the local player and a better time
                if (idx === 0 && gameMode === "story") {
                  const currentTime =
                    recordedFrames.current.length * (16.67 / 1000);
                  const existingGhost = localStorage.getItem(
                    `ghost_${level.id}`,
                  );
                  let shouldSave = true;
                  if (existingGhost) {
                    try {
                      const parsed = JSON.parse(existingGhost);
                      if (parsed.time <= currentTime) shouldSave = false;
                    } catch (e) {
                      shouldSave = true;
                    }
                  }

                  if (shouldSave) {
                    const newGhost: GhostRun = {
                      levelId: level.id,
                      frames: [...recordedFrames.current],
                      time: currentTime,
                      customization: customization,
                    };
                    localStorage.setItem(
                      `ghost_${level.id}`,
                      JSON.stringify(newGhost),
                    );
                  }
                }

                p.finished = true;
                if (!p.finishTime) p.finishTime = Date.now();
                if (status === "build_battle_playing") checkBuildBattleWinCondition();
                else triggerWin(p.name);

                if (isOnline) onlineService.sendEvent("win", null);
              }
              break;
            }
            if (entity.type === "bounce") {
              p.vel.x *= -1.5;
              shakeIntensity.current = 5;
              continue;
            }
            if (entity.type === "teleport") {
              if (p.teleportCooldown <= 0) {
                // Correctly find the index in the current list of teleporters
                const myIdx = teleporters.findIndex(
                  (t) =>
                    (t.id && t.id === entity.id) ||
                    (t.x === entity.x && t.y === entity.y),
                );
                if (myIdx !== -1 && teleporters.length > 1) {
                  const nextTp = teleporters[(myIdx + 1) % teleporters.length];
                  p.pos.x = nextTp.x + (nextTp.w - p.w) / 2;
                  p.pos.y = nextTp.y + (nextTp.h - p.h) / 2;
                  playerRectX.x = p.pos.x;
                  playerRectX.y = p.pos.y + 2;
                  p.teleportCooldown = p.teleportMaxCooldown;
                  shakeIntensity.current = 5;

                  // Cancel hook on teleport
                  p.hookActive = false;
                  p.hookPos = null;
                }
              }
              continue;
            }

            // Solid Collision
            if (
              entity.type.startsWith("powerup_") ||
              entity.type.startsWith("block_")
            )
              continue; // Powerups and blocks are pass-through
            if (
              entity.type === "gravity_reverse" ||
              entity.type === "gravity_zero"
            )
              continue;

            // If the player is landing on top of a solid block (or bottom of a ceiling block under inverted gravity),
            // skip the X-collision check for this block so they can safely land rather than dying/snapping horizontally.
            // This is crucial for GD mode where hitting a wall side is fatal.
            // Tolerances increased for GD mode to avoid the ice-block/slide death bug.
            const tolerance = geometryDashMode ? 18 : 10;
            const isLanding = p.isGrounded || (p.gravity >= 0 && p.vel.y >= -3) || (p.gravity < 0 && p.vel.y <= 3);
            if (isLanding) {
              if (p.gravity >= 0) {
                const prevFeet = p.pos.y + p.h;
                if (prevFeet <= entity.y + tolerance) {
                  continue; 
                }
              } else {
                const prevHead = p.pos.y;
                if (prevHead >= entity.y + entity.h - tolerance) {
                  continue; 
                }
              }
            }

            if (geometryDashMode) {
              spawnParticles(
                p.pos.x + p.w / 2,
                p.pos.y + p.h / 2,
                p.color,
                20,
                "blood",
              );
              p.pos = { ...currentRespawnPos.current };
              p.ghostOverlapIndices = players.current
                .filter((op) => op.playerIndex !== p.playerIndex)
                .map((op) => op.playerIndex);
              p.vel = { x: 0, y: 0 };
              p.respawnTimer = Date.now();
              resetPlayerSize(p);
              p.deaths = (p.deaths || 0) + 1;
              onDie();
              audio.playDie(p.deathSound);
              break;
            }

            if (p.vel.x > 0) {
              p.pos.x = entity.x - playerRect.w;
              p.wallDir = 1;
            } else if (p.vel.x < 0) {
              p.pos.x = entity.x + entity.w;
              p.wallDir = -1;
            }
            p.vel.x = 0;
            // Wall sliding check (Detection Phase)
            // Adjusted to allow 0 velocity (sticking) to still register as sliding
            if (!p.isGrounded && entity.type !== "ice") {
              p.isWallSliding = true;
              p.wallSurfaceType = entity.type; // Capture specific wall type
              p.jumpCount = 0; // Reset jumps on wall
              p.tripleJumpActive = false;
              p.wallCoyoteTimer = 12; // Grant grace period (e.g. 12 frames)
              p.lastWallDir = p.wallDir; // Remember direction

              // Check if player is pressing away from wall
              let isPressingLeft = p.controls.left.some((k) => keys.current[k]);
              let isPressingRight = p.controls.right.some(
                (k) => keys.current[k],
              );

              if (p.gravity < 0 && settings?.invertXOnGravityReverse) {
                const temp = isPressingLeft;
                isPressingLeft = isPressingRight;
                isPressingRight = temp;
              }

              const isPressingAway =
                (p.wallDir === 1 && isPressingLeft) ||
                (p.wallDir === -1 && isPressingRight);

              if (isPressingAway) {
                p.isWallSliding = false;
                p.wallCoyoteTimer = 0; // Instantly detach so they get a normal double jump instead of a diagonal wall jump!
              }
            }
          }
        }

        // Friction Application (Placeholder - actually applied after Y collision for correct dominant surface)
        // Note: We apply friction later based on dominant surface now.

        // Clamp speed
        const currentMaxSpeed =
          MAX_SPEED *
          (slowMoTimerRef.current > 0 ? 1.0 : 1.0) *
          (p.slowTimer > 0 ? 0.5 : 1.0);
        if (Math.abs(p.vel.x) <= currentMaxSpeed) {
          p.vel.x = Math.max(
            Math.min(p.vel.x, currentMaxSpeed),
            -currentMaxSpeed,
          );
        }

        // Final safety check for NaN
        if (isNaN(p.pos.x) || isNaN(p.pos.y)) {
          console.error("NaN position detected for player", p.name, p.pos);
          p.pos = { ...currentRespawnPos.current };
          p.vel = { x: 0, y: 0 };
        }

        // Record Ghost Frame (only for local player in single player story mode)
        const isGhostDisabled =
          isOnline || gameMode === "vs" || gameMode === "brawler";
        if (
          idx === 0 &&
          !paused &&
          !p.finished &&
          hasStartedMoving.current &&
          !isGhostDisabled
        ) {
          recordedFrames.current.push({
            x: p.pos.x,
            y: p.pos.y,
            facing: p.facing,
          });
        }

        // Y Collision
        p.pos.y += p.vel.y;
        playerRect.x = p.pos.x;
        playerRect.y = p.pos.y;
        p.isGrounded = false;

        let foundGround = false;
        let maxGroundOverlap = 0;
        let dominantSurface: EntityType | "none" = "none";

        for (const entity of collidableEntities) {
          // Identify generated powerup ID
          const powerupId =
            entity.id || `${entity.x}_${entity.y}_${entity.type}`;

          const isCollectedByMe = p.collectedPowerupIds.includes(powerupId);

          if (
            (entity.type === "coin" &&
              (players.current.length > 1 || gameMode === "vs"
                ? p.collectedCoinIds.includes(entity.id || "0")
                : collectedCoinsRef.current.includes(entity.id || ""))) ||
            (isCollectedByMe && entity.type.startsWith("powerup_"))
          ) {
            continue;
          }

          if (checkCollision(playerRect, entity)) {
            if (
              !geometryDashMode && (
                entity.type === "walkthrough_wall" ||
                entity.type === "troll_wall" ||
                entity.type === "fake_goal" ||
                entity.type === "fake_ice" ||
                entity.type === "fake_slime"
              )
            )
              continue; // Do nothing
            if (entity.type === "ghost_hazard") continue; // Do nothing
            if (entity.type.startsWith("powerup_")) {
              // Allow collection logic to run (it's handled in X-axis check mainly, but let's ensure consistency)
              // Actually, powerups are collected in X-axis check. If we missed it there (e.g. falling onto it), we should collect here too.
              // But wait, the collection logic is duplicated?
              // The collection logic is present in both X and Y loops in the original code.
              // We just need to ensure we don't treat it as solid.
            }

            if (entity.type === "powerup_remover") {
              // Remove abilities
              if (
                p.oneTimeBuild ||
                p.oneTimeHook ||
                p.oneTimeDoubleJump ||
                p.oneTimeTripleJump ||
                p.tripleJumpActive ||
                p.isShrunk ||
                p.isGrown
              ) {
                p.oneTimeBuild = false;
                p.oneTimeHook = false;
                p.oneTimeDoubleJump = false;
                p.oneTimeTripleJump = false;
                p.tripleJumpActive = false;

                if (p.isShrunk) {
                  p.isShrunk = false;
                  p.isPermanentlyShrunk = false;
                  p.w = 20;
                  p.h = 20;
                  p.pos.y -= 10;
                }
                if (p.isGrown) {
                  p.isGrown = false;
                  p.isPermanentlyGrown = false;
                  p.w = 20;
                  p.h = 20;
                  p.pos.y += 20;
                }

                shakeIntensity.current = 2; // Small shake feedback
              }
              continue; // Pass through
            }

            if (entity.type === "coin") {
              if (gameMode === "brawler") continue;
              const coinId = entity.id || "0";

              if (!p.collectedCoinIds.includes(coinId)) {
                p.collectedCoinIds.push(coinId);
              }

              const isMulti = players.current.length > 1 || gameMode === "vs";

              audio.playCoin();
              spawnParticles(
                entity.x + entity.w / 2,
                entity.y + entity.h / 2,
                isMulti ? p.color : COLORS.COIN,
                4,
                isMulti ? "spark" : "coin",
              );

              if (gameMode === "vs") {
                if (isOnline) {
                  onlineService.sendEvent("coin_collected", { coinId });
                }
              } else {
                onCoin(coinId);
              }
              continue;
            }
            if (entity.type === "checkpoint") {
              if (level.autoScroll || geometryDashMode) continue;
              if (
                currentRespawnPos.current.x !== entity.x ||
                currentRespawnPos.current.y !== entity.y
              ) {
                currentRespawnPos.current = { x: entity.x, y: entity.y };
                shakeIntensity.current = 5;
                audio.playBuild();
                spawnParticles(
                  entity.x + entity.w / 2,
                  entity.y + entity.h / 2,
                  "#00ff00",
                  15,
                  "spark",
                );
              }
              continue;
            }
            if (entity.type.startsWith("powerup_")) {
              if (gameMode === "brawler") {
                if (!p.inventory) {
                  p.inventory = entity.type as EntityType;
                  collectPowerup(powerupId, p);
                  dynamicPowerups.current = dynamicPowerups.current.filter(
                    (e) => e.id !== powerupId,
                  );
                  audio.playCoin();
                } else if (brawlerComboPowerups) {
                  const fused = getFusedPowerupType(p.inventory, entity.type);
                  p.inventory = fused as EntityType;
                  collectPowerup(powerupId, p);
                  dynamicPowerups.current = dynamicPowerups.current.filter(
                    (e) => e.id !== powerupId,
                  );
                  audio.playPowerup();
                  shakeIntensity.current = 10;
                }
                continue;
              }
            }

            if (entity.type === "powerup_build") {
              p.oneTimeBuild = true;
              collectPowerup(powerupId, p);
              audio.playCoin();
              continue;
            }
            if (entity.type === "powerup_hook") {
              p.oneTimeHook = true;
              collectPowerup(powerupId, p);
              audio.playCoin();
              continue;
            }
            if (entity.type === "powerup_double_jump") {
              p.oneTimeDoubleJump = true;
              collectPowerup(powerupId, p);
              audio.playCoin();
              continue;
            }
            if (entity.type === "powerup_triple_jump") {
              p.oneTimeTripleJump = true;
              collectPowerup(powerupId, p);
              audio.playCoin();
              continue;
            }
            if (entity.type === "powerup_slow_mo") {
              slowMoTimerRef.current = 180;
              collectPowerup(powerupId, p);
              audio.playCoin();
              continue;
            }
            if (entity.type === "powerup_xray") {
              xrayTimerRef.current = 180; // 3 seconds at 60fps
              collectPowerup(powerupId, p);
              audio.playCoin();
              continue;
            }

            if (entity.type === "hazard") {
              if (p.shieldTimer > 0) continue; // Ignore hazard completely if shielded
              if (isOnline && p.onlineId !== onlineService.localPlayer?.id)
                continue; // Only process for local player
              if (
                level?.id === "tutorial" &&
                gameMode !== "vs" &&
                gameMode !== "brawler"
              ) {
                p.vel.y = -10;
                shakeIntensity.current = 5;
              } else if (gameMode === "vs") {
                p.deaths = (p.deaths || 0) + 1;
                spawnParticles(
                  p.pos.x + p.w / 2,
                  p.pos.y + p.h / 2,
                  p.color,
                  20,
                  "blood",
                );
                
                if (status === "build_battle_playing") {
                  p.dead = true;
                  p.finished = true;
                  p.vel = { x: 0, y: 0 };
                  shakeIntensity.current = 10;
                  audio.playDie(p.deathSound);
                  checkBuildBattleWinCondition();
                } else {
                  p.pos = { ...currentRespawnPos.current };
                  p.ghostOverlapIndices = players.current
                    .filter((op) => op.playerIndex !== p.playerIndex)
                    .map((op) => op.playerIndex);
                  p.vel = { x: 0, y: 0 };
                  p.respawnTimer = Date.now();
                  resetPlayerSize(p);
                  shakeIntensity.current = 10;
                  audio.playDie(p.deathSound);
                }
                if (isOnline) onlineService.sendEvent("die", null);
              } else if (gameMode === "brawler") {
                if (p.lives !== undefined) {
                  p.lives--;
                  spawnParticles(
                    p.pos.x + p.w / 2,
                    p.pos.y + p.h / 2,
                    p.color,
                    20,
                    "blood",
                  );
                  if (p.lives <= 0) {
                    p.finished = true;
                    checkBrawlerWinCondition();
                    if (isOnline) onlineService.sendEvent("lose", null);
                  } else {
                    p.pos = getSpawnPos(p.playerIndex, p.team || 0);
                    p.ghostOverlapIndices = players.current
                      .filter((op) => op.playerIndex !== p.playerIndex)
                      .map((op) => op.playerIndex);
                    p.vel = { x: 0, y: 0 };
                    p.respawnTimer = Date.now();
                    resetPlayerSize(p);
                    shakeIntensity.current = 10;
                    audio.playDie(p.deathSound);
                    if (isOnline) onlineService.sendEvent("die", null);
                  }
                }
              } else {
                spawnParticles(
                  p.pos.x + p.w / 2,
                  p.pos.y + p.h / 2,
                  p.color,
                  20,
                  "blood",
                );
                p.pos = { ...currentRespawnPos.current };
                p.ghostOverlapIndices = players.current
                  .filter((op) => op.playerIndex !== p.playerIndex)
                  .map((op) => op.playerIndex);
                p.vel = { x: 0, y: 0 };
                p.respawnTimer = Date.now();
                resetPlayerSize(p);
                onDie();
                if (isOnline) onlineService.sendEvent("die", null);
              }
              break;
            }
            if (
              entity.type === "goal" &&
              (gameMode === "vs"
                ? p.collectedCoinIds.length === levelCoinIds.length
                : isGoalUnlocked)
            ) {
              if (isOnline && p.onlineId !== onlineService.localPlayer?.id)
                continue; // Only process for local player

              if (!p.finished) {
                // Save Ghost if it's the local player and a better time
                if (idx === 0 && gameMode === "story") {
                  const currentTime =
                    recordedFrames.current.length * (16.67 / 1000);
                  const existingGhost = localStorage.getItem(
                    `ghost_${level.id}`,
                  );
                  let shouldSave = true;
                  if (existingGhost) {
                    try {
                      const parsed = JSON.parse(existingGhost);
                      if (parsed.time <= currentTime) shouldSave = false;
                    } catch (e) {
                      shouldSave = true;
                    }
                  }

                  if (shouldSave) {
                    const newGhost: GhostRun = {
                      levelId: level.id,
                      frames: [...recordedFrames.current],
                      time: currentTime,
                      customization: customization,
                    };
                    localStorage.setItem(
                      `ghost_${level.id}`,
                      JSON.stringify(newGhost),
                    );
                  }
                }

                p.finished = true;
                if (!p.finishTime) p.finishTime = Date.now();
                if (status === "build_battle_playing") checkBuildBattleWinCondition();
                else triggerWin(p.name);

                if (isOnline) onlineService.sendEvent("win", null);
              }
              break;
            }
            if (entity.type === "bounce") {
              p.vel.y = (p.gravity < 0 ? -JUMP_FORCE : JUMP_FORCE) * 1.5;
              shakeIntensity.current = 5;
              continue;
            }
            if (entity.type === "trampoline") {
              p.vel.y = p.gravity < 0 ? -TRAMPOLINE_FORCE : TRAMPOLINE_FORCE;
              p.pos.y =
                p.gravity < 0 ? entity.y + entity.h + 0.1 : entity.y - 20.1;
              p.isGrounded = false;
              p.jumpCount = 0; // Reset jumps
              p.tripleJumpActive = false;
              shakeIntensity.current = 5;
              audio.playJump();
              if (onJump) onJump();
              continue;
            }
            if (entity.type === "teleport") {
              if (p.teleportCooldown <= 0) {
                // Correctly find the index in the current list of teleporters
                const myIdx = teleporters.findIndex(
                  (t) =>
                    (t.id && t.id === entity.id) ||
                    (t.x === entity.x && t.y === entity.y),
                );
                if (myIdx !== -1 && teleporters.length > 1) {
                  const nextTp = teleporters[(myIdx + 1) % teleporters.length];
                  p.pos.x = nextTp.x + (nextTp.w - p.w) / 2;
                  p.pos.y = nextTp.y + (nextTp.h - p.h) / 2;
                  playerRect.x = p.pos.x;
                  playerRect.y = p.pos.y;
                  p.teleportCooldown = p.teleportMaxCooldown;
                  shakeIntensity.current = 5;
                  p.hookActive = false;
                  p.hookPos = null;
                }
              }
              continue;
            }

            // Solid Collision
            if (
              entity.type.startsWith("powerup_") ||
              entity.type.startsWith("block_")
            )
              continue; // Powerups and blocks are pass-through
            if (
              entity.type === "gravity_reverse" ||
              entity.type === "gravity_zero"
            )
              continue;

            const relVelY = p.vel.y - (entity.dy || 0);
            const isFalling =
              (p.gravity >= 0 && relVelY >= 0) ||
              (p.gravity < 0 && relVelY <= 0);
            const isJumping =
              (p.gravity >= 0 && relVelY < 0) || (p.gravity < 0 && relVelY > 0);

            // For moving platforms, we need to be more careful about which side we snap to.
            // If the player's feet were above the platform's top in the previous state,
            // we should treat it as a floor collision even if the platform caught up to the player.
            const playerFeet = p.pos.y + playerRect.h;
            const prevPlayerFeet =
              playerFeet - p.vel.y - (p.isGrounded ? p.platformDelta.y : 0);
            const platformTop = entity.y;
            const prevPlatformTop = platformTop - (entity.dy || 0);

            const wasAbove = prevPlayerFeet <= prevPlatformTop + 5; // 5px margin

            // Only treat as a "landing" if we were on the correct side in the previous frame.
            // This prevents "teleporting" through blocks from below in low gravity.
            const sideCorrect =
              (p.gravity >= 0 && wasAbove) || (p.gravity < 0 && !wasAbove);

            if (
              (isFalling && sideCorrect) ||
              (wasAbove &&
                (entity.movingV || entity.type === "moving_platform_v"))
            ) {
              // Physics Resolution
              if (p.gravity >= 0) {
                p.pos.y = entity.y - playerRect.h;
              } else {
                p.pos.y = entity.y + entity.h;
              }
              p.isGrounded = true;
              p.jumpCount = 0; // Reset jumps
              p.tripleJumpActive = false;
              foundGround = true;
              if (Math.abs(p.vel.y) > 10) shakeIntensity.current = 3;
              p.hookActive = false;
              p.hookPos = null;

              // Dominant Surface Logic
              const pLeft = p.pos.x;
              const pRight = p.pos.x + 20;
              const eLeft = entity.x;
              const eRight = entity.x + entity.w;
              // Calculate overlap width
              const overlap = Math.max(
                0,
                Math.min(pRight, eRight) - Math.max(pLeft, eLeft),
              );

              if (overlap > maxGroundOverlap) {
                maxGroundOverlap = overlap;
                dominantSurface = entity.type;

                if ((entity as any).dx || (entity as any).dy) {
                  p.platformDelta = {
                    x: (entity as any).dx || 0,
                    y: (entity as any).dy || 0,
                  };
                  p.lastPlatformVel = { ...p.platformDelta };
                } else {
                  p.lastPlatformVel = { x: 0, y: 0 };
                }

                if (entity.type === "fragile" || entity.fragile) {
                  const id =
                    entity.id ||
                    `${(entity as any).baseX ?? entity.x}_${(entity as any).baseY ?? entity.y}`;
                  if (!fragileStates.current[id]) {
                    fragileStates.current[id] = { touchedAt: effectiveTime };
                  }
                }
              }
            } else if (isJumping && !sideCorrect) {
              if (p.gravity >= 0) {
                p.pos.y = entity.y + entity.h;
              } else {
                p.pos.y = entity.y - playerRect.h;
              }
              // Ceiling hit
              p.hookActive = false;
              p.hookPos = null;
            }
            p.vel.y = 0;
          }
        }

        if (foundGround) {
          p.surfaceType = dominantSurface;
        } else {
          p.surfaceType = "none";
        }

        // Apply friction based on dominant surface
        let groundFriction = FRICTION;
        if (foundGround) {
          if (p.surfaceType === "ice") groundFriction = ICE_FRICTION;
          if (p.surfaceType === "slime") groundFriction = SLIME_FRICTION;
        }
        if (geometryDashMode) {
          let speedMul = 1.0;
          if (p.surfaceType === "ice" || p.wallSurfaceType === "ice") speedMul = 1.5;
          if (p.surfaceType === "slime" || p.wallSurfaceType === "slime") speedMul = 0.7;
          p.vel.x = ((260 * speedMul) / 60) * dt;
        } else {
          p.vel.x *= groundFriction;
        }

        // Player-to-Player Collision (Brawler Mode or VS Mode with Collision)
        if (gameMode === "brawler" || (gameMode === "vs" && vsCollision)) {
          if (!isOnline || p.onlineId === onlineService.localPlayer?.id) {
            players.current.forEach((otherP) => {
              if (p === otherP || otherP.finished || p.finished) return;

              // Team Check: No friendly fire
              if (
                gameMode === "brawler" &&
                p.team !== undefined &&
                otherP.team !== undefined &&
                p.team === otherP.team
              )
                return;

              const otherRect = {
                x: otherP.pos.x,
                y: otherP.pos.y,
                w: otherP.w,
                h: otherP.h,
              };

              if (checkCollision(playerRect, otherRect)) {
                const now = Date.now();
                const pIsActive =
                  p.hasStartedMove && now - p.moveStartTime >= 2000;
                const otherIsActive =
                  otherP.hasStartedMove && now - otherP.moveStartTime >= 2000;

                const isGhost =
                  !pIsActive ||
                  !otherIsActive ||
                  (p.respawnTimer && now - p.respawnTimer < 2000) ||
                  (otherP.respawnTimer && now - otherP.respawnTimer < 2000);

                if (
                  p.ghostOverlapIndices?.includes(otherP.playerIndex) ||
                  isGhost
                )
                  return;

                if (gameMode === "brawler" && p.dashTimer > 0) {
                  // Dash knockback
                  p.dashTimer = 0;
                  p.vel.x = 0;
                  p.vel.y = 0;
                  const pStats = getBrawlerStats(p.brawlerClass, gameMode);
                  const oStats = getBrawlerStats(otherP.brawlerClass, gameMode);

                  if (!isOnline) {
                    const targetMultiplier = oStats.kbTaken * pStats.kbDealt;
                    otherP.vel.x = p.dashDirection.x * 43 * targetMultiplier;
                    otherP.vel.y = -10 * targetMultiplier;
                  } else {
                    onlineService.sendEvent("powerup_used", {
                      type: "powerup_dash_hit",
                      targetId: otherP.onlineId,
                      direction: p.dashDirection.x,
                    });
                  }
                  shakeIntensity.current = 10;
                } else if (
                  p.vel.y > 0 &&
                  p.pos.y + p.h - p.vel.y <= otherP.pos.y + otherP.h / 2
                ) {
                  // Bounce off head
                  p.vel.y = -JUMP_FORCE * 0.8;
                  p.jumpCount = 0;
                  p.tripleJumpActive = false;

                  if (gameMode === "brawler") {
                    if (!isOnline && otherP.lives !== undefined) {
                      otherP.lives--;
                      healVampire(p.name);

                      // Check Win Condition (Team aware)
                      if (!checkBrawlerWinCondition()) {
                        otherP.pos =
                          otherP.playerIndex === 0
                            ? { ...currentRespawnPos.current }
                            : {
                                x: currentRespawnPosP2.current.x,
                                y: currentRespawnPosP2.current.y,
                              };
                        otherP.vel = { x: 0, y: 0 };
                        resetPlayerSize(otherP);

                        // Give invincible overlap on respawn against the person who killed them?
                        // Or against everyone? Let's just give it against everyone so they don't immediately get stuck
                        otherP.ghostOverlapIndices = players.current
                          .filter((op) => op.playerIndex !== otherP.playerIndex)
                          .map((op) => op.playerIndex);
                        otherP.respawnTimer = Date.now();

                        shakeIntensity.current = 10;
                        audio.playDie(otherP.deathSound);
                      }
                    } else if (isOnline && otherP.lives !== undefined) {
                      onlineService.sendEvent("bounced_on", {
                        targetId: otherP.onlineId,
                        killerName: p.name,
                      });
                    }
                  }
                } else {
                  // Horizontal push
                  if (p.pos.x < otherP.pos.x) {
                    p.vel.x -= 2;
                    if (!isOnline) otherP.vel.x += 2;
                  } else {
                    p.vel.x += 2;
                    if (!isOnline) otherP.vel.x -= 2;
                  }
                }
              } else {
                if (p.ghostOverlapIndices?.includes(otherP.playerIndex)) {
                  p.ghostOverlapIndices = p.ghostOverlapIndices.filter(
                    (i) => i !== otherP.playerIndex,
                  );
                }
              }
            });
          }
        }

        const SUDDEN_DEATH_START = 1800 * 2; // Wait 1800 frames = 30 seconds
        const LAVA_SPEED = 0.2 / 3;
        const currentLevelHeight = levelRef.current.height || GAME_HEIGHT;
        let lavaY = currentLevelHeight + 100;
        if (
          gameMode === "brawler" &&
          brawlerSuddenDeath &&
          roundTimerRef.current > 1800
        ) {
          lavaY = Math.max(
            0,
            currentLevelHeight - (roundTimerRef.current - 1800) * LAVA_SPEED,
          );
        }

        // Handle Geometry Dash auto-scroll
        if (p.hasStartedMove && (level.autoScroll || geometryDashMode)) {
          let currentScrollSpeed = geometryDashMode ? 260 : (level.autoScrollSpeed || 150);
          
          if (geometryDashMode) {
             if (p.surfaceType === "ice" || p.wallSurfaceType === "ice") currentScrollSpeed *= 1.5;
             if (p.surfaceType === "slime" || p.wallSurfaceType === "slime") currentScrollSpeed *= 0.7;
          }
          
          const dtInSeconds = (1 / 60) * dt; 
          p.scrollX = (p.scrollX || 0) + currentScrollSpeed * dtInSeconds;
        }

        // Keep players from running off the right edge in auto-scroll
        if ((level.autoScroll || geometryDashMode) && p.hasStartedMove) {
          const maxRight = (p.scrollX || 0) + GAME_WIDTH - p.w;
          if (p.pos.x > maxRight) {
            p.pos.x = maxRight;
            if (p.vel.x > 0) p.vel.x = 0;
          }
        }

        const pWallX = (level.autoScroll || geometryDashMode) && p.hasStartedMove ? (p.scrollX || 0) : 0;

        const dieTop =
          (p.gravityFlipped && p.pos.y + p.h < 0) ||
          (!p.gravityFlipped && p.pos.y < -2500) ||
          ((level.autoScroll || geometryDashMode) && p.pos.y + p.h < cameraRef.current.y - 50);

        const dieBottom =
          (!p.gravityFlipped && p.pos.y > currentLevelHeight) ||
          (p.gravityFlipped && p.pos.y > currentLevelHeight + 2500) ||
          (gameMode === "brawler" &&
            brawlerSuddenDeath &&
            p.pos.y + p.h > lavaY) ||
          ((level.autoScroll || geometryDashMode) &&
            p.pos.y > cameraRef.current.y + GAME_HEIGHT + 50);

        const dieLeftRight =
          (level.autoScroll || geometryDashMode) && p.hasStartedMove && p.pos.x < pWallX + 10;

        if (dieTop || dieBottom || dieLeftRight) {
          if (isOnline && p.onlineId !== onlineService.localPlayer?.id) return;

          if (level.autoScroll || geometryDashMode) {
            if (level.start) currentRespawnPos.current = { ...level.start };
            // On death, reset this player's wall
            p.hasStartedMove = geometryDashMode ? true : false;
            p.moveStartTime = Date.now();
          }

          if (
            level?.id === "tutorial" &&
            gameMode !== "vs" &&
            gameMode !== "brawler"
          ) {
            p.pos = { ...currentRespawnPos.current };
            p.vel = { x: 0, y: 0 };
            resetPlayerSize(p);
          } else if (gameMode === "vs") {
            p.deaths = (p.deaths || 0) + 1;
            spawnParticles(
              p.pos.x + p.w / 2,
              p.pos.y + p.h / 2,
              p.color,
              20,
              "blood",
            );
            
            if (status === "build_battle_playing") {
              p.dead = true;
              p.finished = true;
              p.vel = { x: 0, y: 0 };
              shakeIntensity.current = 10;
              audio.playDie(p.deathSound);
              checkBuildBattleWinCondition();
            } else {
              p.pos = { ...currentRespawnPos.current };
              p.ghostOverlapIndices = players.current
                .filter((op) => op.playerIndex !== p.playerIndex)
                .map((op) => op.playerIndex);
              p.respawnTimer = Date.now();
              p.vel = { x: 0, y: 0 };
              resetPlayerSize(p);
              shakeIntensity.current = 10;
              audio.playDie(p.deathSound);
            }
            if (isOnline) onlineService.sendEvent("die", null);
          } else if (gameMode === "brawler") {
            if (p.lives !== undefined) {
              p.lives--;
              spawnParticles(
                p.pos.x + p.w / 2,
                p.pos.y + p.h / 2,
                p.color,
                20,
                "blood",
              );
              if (p.lives <= 0) {
                p.finished = true;
                checkBrawlerWinCondition();
                if (isOnline) onlineService.sendEvent("lose", null);
              } else {
                p.pos = getSpawnPos(p.playerIndex, p.team || 0);
                p.ghostOverlapIndices = players.current
                  .filter((op) => op.playerIndex !== p.playerIndex)
                  .map((op) => op.playerIndex);
                p.respawnTimer = Date.now();
                p.vel = { x: 0, y: 0 };
                resetPlayerSize(p);
                shakeIntensity.current = 10;
                audio.playDie(p.deathSound);
                if (isOnline) onlineService.sendEvent("die", null);
              }
            }
          } else {
            p.deaths = (p.deaths || 0) + 1;
            spawnParticles(
              p.pos.x + p.w / 2,
              p.pos.y + p.h / 2,
              p.color,
              20,
              "blood",
            );
            p.pos = { ...currentRespawnPos.current };
            p.ghostOverlapIndices = players.current
              .filter((op) => op.playerIndex !== p.playerIndex)
              .map((op) => op.playerIndex);
            p.respawnTimer = Date.now();
            p.vel = { x: 0, y: 0 };
            resetPlayerSize(p);
            p.deaths = (p.deaths || 0) + 1;
            onDie();
            if (isOnline) onlineService.sendEvent("die", null);
          }
        }
      });

      // Update Projectiles
      projectiles.current.forEach((proj) => {
        if (!proj.active) return;
        proj.x += proj.velX * dt;
        proj.y += proj.velY * dt;

        // Check collision with walls
        const projRect = { x: proj.x, y: proj.y, w: proj.w, h: proj.h };
        const hitWall = [...levelRef.current.entities, ...tempBlocks.current].some(
          (e) =>
            (e.type === "wall" || e.type === "ice" || e.type === "slime") &&
            checkCollision(projRect, e),
        );
        if (hitWall) {
          proj.active = false;
          return;
        }

        // Check collision with players
        players.current.forEach((p) => {
          if (!p || p.name === proj.owner || p.finished || p.shieldTimer > 0)
            return;
          if (isOnline && p.onlineId !== onlineService.localPlayer?.id) return; // Only process hits on local player

          const pRect = { x: p.pos.x, y: p.pos.y, w: 20, h: 20 };
          if (checkCollision(projRect, pRect)) {
            proj.active = false;
            if (gameMode === "brawler" && p.lives !== undefined) {
              p.lives--;
              if (p.lives <= 0) {
                p.finished = true;
                checkBrawlerWinCondition();
                if (isOnline)
                  onlineService.sendEvent("lose", { killerName: proj.owner });
                else healVampire(proj.owner);
              } else {
                p.pos = getSpawnPos(p.playerIndex, p.team || 0);
                p.ghostOverlapIndices = players.current
                  .filter((op) => op.playerIndex !== p.playerIndex)
                  .map((op) => op.playerIndex);
                p.vel = { x: 0, y: 0 };
                resetPlayerSize(p);
                shakeIntensity.current = 10;
                audio.playDie(p.deathSound);
                if (isOnline)
                  onlineService.sendEvent("die", { killerName: proj.owner });
                else healVampire(proj.owner);
              }
            } else {
              p.deaths = (p.deaths || 0) + 1;
              spawnParticles(
                p.pos.x + p.w / 2,
                p.pos.y + p.h / 2,
                p.color,
                20,
                (p.deathAnim as any) || "normal",
              );
              p.pos = getSpawnPos(p.playerIndex, p.team || 0);
              p.ghostOverlapIndices = players.current
                .filter((op) => op.playerIndex !== p.playerIndex)
                .map((op) => op.playerIndex);
              p.vel = { x: 0, y: 0 };
              resetPlayerSize(p);
              p.collectedPowerupIds = [];
              shakeIntensity.current = 10;
              audio.playDie(p.deathSound);
              if (isOnline)
                onlineService.sendEvent("die", { killerName: proj.owner });
            }
          }
        });
      });
      const levelW = levelRef.current.width || GAME_WIDTH;
      const levelH = levelRef.current.height || GAME_HEIGHT;
      projectiles.current = projectiles.current.filter(
        (p) =>
          p.active &&
          p.x > -100 &&
          p.x < levelW + 100 &&
          p.y > -100 &&
          p.y < levelH + 100,
      );

      // Update Bombs
      bombs.current.forEach((bomb) => {
        if (!bomb.active) return;
        bomb.timer -= dt;
        if (bomb.timer <= 0) {
          bomb.active = false;
          // Explode
          explosions.current.push({
            x: bomb.x + bomb.w / 2,
            y: bomb.y + bomb.h / 2,
            radius: 80,
            timer: 30,
            maxTimer: 30,
          });
          shakeIntensity.current = 15;
          audio.playDie(); // Use die sound for explosion

          // Kill players in radius
          players.current.forEach((p) => {
            if (!p || p.finished || p.shieldTimer > 0) return;
            if (isOnline && p.onlineId !== onlineService.localPlayer?.id)
              return; // Only process hits on local player

            const dx = p.pos.x + 10 - (bomb.x + bomb.w / 2);
            const dy = p.pos.y + 10 - (bomb.y + bomb.h / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              if (gameMode === "brawler" && p.lives !== undefined) {
                p.lives--;
                if (p.lives <= 0) {
                  p.finished = true;
                  checkBrawlerWinCondition();
                  if (isOnline)
                    onlineService.sendEvent("lose", { killerName: bomb.owner });
                  else healVampire(bomb.owner);
                } else {
                  p.pos = getSpawnPos(p.playerIndex, p.team);
                  p.vel = { x: 0, y: 0 };
                  if (isOnline)
                    onlineService.sendEvent("die", { killerName: bomb.owner });
                  else healVampire(bomb.owner);
                }
              } else {
                p.pos = { ...currentRespawnPos.current };
                p.vel = { x: 0, y: 0 };
                if (isOnline)
                  onlineService.sendEvent("die", { killerName: bomb.owner });
              }
            }
          });
        }
      });
      bombs.current = bombs.current.filter((b) => b.active);

      // Update Explosions
      explosions.current.forEach((exp) => {
        exp.timer -= dt;
      });
      explosions.current = explosions.current.filter((e) => e.timer > 0);

      updateCamera();

      // Online Sync
      if (isOnline) {
        const localP = players.current.find(
          (p) => p.onlineId === onlineService.localPlayer?.id,
        );
        if (localP) {
          const syncData: any = {
            pos: { x: localP.pos.x, y: localP.pos.y },
            vel: { x: localP.vel.x, y: localP.vel.y },
            facing: localP.facing,
            isGrounded: localP.isGrounded,
            isWallSliding: localP.isWallSliding,
            wallDir: localP.wallDir,
            finished: localP.finished,
            hasStartedMove: localP.hasStartedMove,
            moveStartTime: localP.moveStartTime,
            hookActive: localP.hookActive,
            hookPos: localP.hookPos,
            oneTimeBuild: localP.oneTimeBuild,
            oneTimeHook: localP.oneTimeHook,
          };
          if (localP.lives !== undefined) syncData.health = localP.lives;
          if (localP.inventory !== undefined)
            syncData.inventory = localP.inventory;

          onlineService.sendSync(syncData);
        }
      }
    };

    const draw = (alpha: number) => {
      const liveLocalPlayer = players.current.find((pl) => pl.isLocal);
      const isSpectatingNowLocal =
        isOnline &&
        (liveLocalPlayer
          ? liveLocalPlayer.finished
          : isSpectating ||
            (players.current.length > 0 && status.includes("playing")));

      ctx.fillStyle = COLORS.BG;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.save();
      
      const visualAlpha = typeof alpha === "number" ? alpha : 0;

      // Enable camera interpolation always to align player and world elements with sub-frame precision.
      // Disabling visualAlpha for the camera in auto-scroll/GD mode introduces sub-frame judder/stutter.
      const useCamAlpha = visualAlpha;

      let finalTranslateX = -(cameraRef.current.x + cameraVel.current.x * useCamAlpha);
      let finalTranslateY = -(cameraRef.current.y + cameraVel.current.y * useCamAlpha);

      const isBuildBattle = level.id.startsWith("build") || status === "build_battle_playing";
      const shakeMult = isBuildBattle ? 0 : (settings.screenShake ?? 1);

      const zoom = cameraZoom.current || 1.0;
      if (zoom !== 1.0) {
        ctx.translate(GAME_WIDTH / 2, GAME_HEIGHT / 2);
        ctx.scale(zoom, zoom);
        const cx = (cameraRef.current.x + cameraVel.current.x * useCamAlpha) + GAME_WIDTH / 2;
        const cy = (cameraRef.current.y + cameraVel.current.y * useCamAlpha) + GAME_HEIGHT / 2;
        let targetX = -cx;
        let targetY = -cy;
        if (shakeIntensity.current > 0 && shakeMult > 0) {
          targetX += ((Math.random() - 0.5) * shakeIntensity.current * shakeMult) / zoom;
          targetY += ((Math.random() - 0.5) * shakeIntensity.current * shakeMult) / zoom;
        }
        ctx.translate(targetX, targetY);
      } else {
        if (shakeIntensity.current > 0 && shakeMult > 0) {
          finalTranslateX +=
            (Math.random() - 0.5) * shakeIntensity.current * shakeMult;
          finalTranslateY +=
            (Math.random() - 0.5) * shakeIntensity.current * shakeMult;
        }
        ctx.translate(Math.round(finalTranslateX), Math.round(finalTranslateY));
      }

      const collectedInLevelCount = levelCoinIds.filter((id) =>
        collectedCoinsRef.current.includes(id),
      ).length;
      const isGoalUnlocked =
        gameMode === "brawler"
          ? true
          : collectedInLevelCount === levelCoinIds.length;

      // Draw Teleport Connections (Lines) first so they are behind blocks
      if (teleporters.length > 1) {
        ctx.save();
        ctx.strokeStyle = COLORS.TELEPORT;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.3; // Faint lines

        ctx.beginPath();
        teleporters.forEach((tp, i) => {
          const nextTp = teleporters[(i + 1) % teleporters.length];
          const startX = tp.x + tp.w / 2;
          const startY = tp.y + tp.h / 2;
          const endX = nextTp.x + nextTp.w / 2;
          const endY = nextTp.y + nextTp.h / 2;

          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
        });
        ctx.stroke();
        ctx.restore();
      }

      // Draw Logical Shadows for 3D effect
      const fakeTypesRender = ["walkthrough_wall", "troll_wall", "fake_goal", "fake_ice", "fake_slime", "ghost_hazard", "fake"];
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      [...levelRef.current.entities, ...tempBlocks.current]
        .filter((e) => !(geometryDashMode && fakeTypesRender.includes(e.type)))
        .forEach((baseEnt) => {
        const ent = getDynamicEntity(baseEnt, gameTimeRef.current, 0);
        if (!ent) return;
        const isSolid =
          ent.type === "wall" ||
          ent.type === "ice" ||
          ent.type === "slime" ||
          ent.type === "troll_wall" ||
          ent.type === "walkthrough_wall" ||
          ent.type === "fake_ice" ||
          ent.type === "fake_slime" ||
          ent.type === "moving_platform_h" ||
          ent.type === "moving_platform_v" ||
          ent.type === "fragile";

        if (isSolid) {
          // Draw a subtle drop shadow
          ctx.rect(ent.x + 6, ent.y + 6, ent.w, ent.h);
        }
      });
      ctx.fill();

      // Draw Level Entities
      [...levelRef.current.entities, ...dynamicPowerups.current]
        .filter((e) => !(geometryDashMode && fakeTypesRender.includes(e.type)))
        .forEach((baseEnt) => {
        const ent = getDynamicEntity(baseEnt, gameTimeRef.current, 0);
        if (!ent) return; // Skip if fragile block is broken

        const powerupId = ent.id || `${ent.x}_${ent.y}_${ent.type}`;

        const localPlayer = players.current.find(
          (p) => !isOnline || p.onlineId === onlineService.localPlayer?.id,
        );

        if (ent.type === "coin") {
          if (gameMode === "brawler") return; // Don't render coins in Brawler mode
          // In multiplayer, coins remain visible for everyone
          if (players.current.length <= 1 && !isOnline && gameMode !== "vs") {
            if (collectedCoinsRef.current.includes(ent.id || "")) return;
          }
        }

        if (ent.type.startsWith("powerup_")) {
          const localPlayer = players.current.find(
            (p) => !isOnline || p.onlineId === onlineService.localPlayer?.id,
          );
          // If we have multiple local players (local VS/Brawler), check if ALL local players collected it
          const allLocalCollected = isOnline
            ? (localPlayer?.collectedPowerupIds.includes(powerupId) ?? false)
            : players.current.every((p) =>
                p.collectedPowerupIds.includes(powerupId),
              );

          if (allLocalCollected) return;
        }

        // X-Ray Effect Logic
        const isFake = !geometryDashMode && (
          ent.type === "walkthrough_wall" ||
          ent.type === "ghost_hazard" ||
          ent.type === "troll_wall" ||
          ent.type === "fake_goal" ||
          ent.type === "fake_ice" ||
          ent.type === "fake_slime"
        );
        const isXrayActive = xrayTimerRef.current > 0;

        const isP1Cursor = (ent as any).isP1Cursor;
        const isP2Cursor = (ent as any).isP2Cursor;

        let alpha = ent.opacity ?? 1.0;
        if (isP1Cursor || isP2Cursor) {
           alpha = 0.5 + Math.sin(Date.now() / 200) * 0.2;
        }

        if (isFake && isXrayActive) {
          ctx.strokeStyle = "#facc15"; // Yellow outline for revealed fakes
          ctx.lineWidth = 2;
        }
        ctx.globalAlpha = alpha;

        let drawX = ent.x;
        let drawY = ent.y;
        if ((ent as any).shake) {
          drawX += (Math.random() - 0.5) * 4;
          drawY += (Math.random() - 0.5) * 4;
        }

        let skipDefaultFill = false;

        if (ent.type === "bomb") {
          skipDefaultFill = true;
          // Dark background base
          ctx.fillStyle = "#1f2937";
          ctx.fillRect(drawX, drawY, ent.w, ent.h);
          ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
          ctx.lineWidth = 1;
          ctx.strokeRect(drawX, drawY, ent.w, ent.h);

          // DRAW A BOMB
          const cx = drawX + ent.w / 2;
          const cy = drawY + ent.h / 2;
          const r = Math.min(ent.w, ent.h) * 0.35;

          // Fuse
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy - r);
          ctx.quadraticCurveTo(cx + 4, cy - r - 6, cx + 8, cy - r - 8);
          ctx.stroke();

          // Spark
          ctx.fillStyle = "#f97316";
          ctx.beginPath();
          ctx.arc(cx + 8, cy - r - 8, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.arc(cx + 8, cy - r - 8, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Bomb body
          ctx.fillStyle = "#111827";
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#374151";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Red outline warning
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (ent.type === "glue") {
          skipDefaultFill = true;
          // semi-transparent sticky lime base
          ctx.fillStyle = "rgba(132, 204, 22, 0.25)";
          ctx.fillRect(drawX, drawY, ent.w, ent.h);

          // Slimy borders
          ctx.strokeStyle = "rgba(163, 230, 53, 0.8)";
          ctx.lineWidth = 2;
          ctx.strokeRect(drawX + 1, drawY + 1, ent.w - 2, ent.h - 2);

          // Internal sticky lines / gooey pattern
          ctx.strokeStyle = "rgba(132, 204, 22, 0.5)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(drawX + 3, drawY + 3);
          ctx.lineTo(drawX + ent.w - 3, drawY + ent.h - 3);
          ctx.moveTo(drawX + ent.w - 3, drawY + 3);
          ctx.lineTo(drawX + 3, drawY + ent.h - 3);
          ctx.stroke();

          // Sticky gel bubbles
          ctx.fillStyle = "rgba(190, 242, 100, 0.9)";
          ctx.beginPath();
          ctx.arc(drawX + ent.w * 0.35, drawY + ent.h * 0.45, 3, 0, Math.PI * 2);
          ctx.arc(drawX + ent.w * 0.65, drawY + ent.h * 0.65, 2, 0, Math.PI * 2);
          ctx.arc(drawX + ent.w * 0.5, drawY + ent.h * 0.25, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if ((ent.type as any) === "fan") {
          skipDefaultFill = true;
          // Draw metal box
          ctx.fillStyle = "#4b5563"; 
          ctx.fillRect(drawX, drawY, ent.w, ent.h);
          ctx.fillStyle = "#1f2937"; // Inner grate
          ctx.fillRect(drawX + 4, drawY + 4, ent.w - 8, ent.h - 8);

          // Draw rotating fan blades
          const bladesAngle = (Date.now() / 60) % (Math.PI * 2);
          ctx.strokeStyle = "#9ca3af";
          ctx.lineWidth = 3;
          ctx.beginPath();
          const cx = drawX + ent.w / 2;
          const cy = drawY + ent.h / 2;
          for (let b = 0; b < 4; b++) {
            const angle = bladesAngle + (b * Math.PI) / 2;
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * 10, cy + Math.sin(angle) * 10);
          }
          ctx.stroke();

          // Beautiful rising updraft waves
          ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
          ctx.lineWidth = 1.5;
          const time = Date.now();
          for (let lineX = 8; lineX < ent.w; lineX += 16) {
            const lineOffset = (lineX * 17) % 100;
            const animProgress = ((time * 0.12 + lineOffset) % 180);
            const lineY = drawY - animProgress;
            if (lineY > drawY - 180) {
              ctx.beginPath();
              ctx.moveTo(drawX + lineX, lineY);
              ctx.lineTo(drawX + lineX + Math.sin(time / 200 + lineX) * 3, lineY - 15);
              ctx.stroke();
            }
          }
        } else if ((ent.type as any) === "orbit") {
          // Draw pivot anchor cable connects to the original baseX/baseY
          const bx = (ent as any).baseX ?? ent.x;
          const by = (ent as any).baseY ?? ent.y;
          ctx.strokeStyle = "rgba(163, 163, 163, 0.5)"; // Dashed pivot cable
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(bx + ent.w / 2, by + ent.h / 2);
          ctx.lineTo(drawX + ent.w / 2, drawY + ent.h / 2);
          ctx.stroke();
          ctx.setLineDash([]); // Reset line dash

          // Draw base anchor peg
          ctx.fillStyle = "#78716c";
          ctx.beginPath();
          ctx.arc(bx + ent.w / 2, by + ent.h / 2, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#06b6d4"; // Neon cyan fill color for the platform itself
        } else if (
          ent.type === "wall" ||
          ent.type === "walkthrough_wall" ||
          ent.type === "troll_wall"
        ) {
          ctx.fillStyle = COLORS.WALL;
        } else if (ent.type === "hazard" || ent.type === "ghost_hazard") {
          ctx.fillStyle = COLORS.HAZARD;
        } else if (ent.type === "goal" || ent.type === "fake_goal") {
          ctx.fillStyle = isGoalUnlocked ? COLORS.GOAL : COLORS.GOAL_LOCKED;
        } else if (ent.type === "bounce") {
          ctx.fillStyle = COLORS.BOUNCE;
        } else if (ent.type === "coin") {
          ctx.fillStyle = COLORS.COIN;
        } else if (ent.type === "ice" || ent.type === "fake_ice") {
          ctx.fillStyle = COLORS.ICE;
        } else if (ent.type === "trampoline") {
          ctx.fillStyle = COLORS.TRAMPOLINE;
        } else if (ent.type === "slime" || ent.type === "fake_slime") {
          ctx.fillStyle = COLORS.SLIME;
        } else if (ent.type === "teleport") {
          ctx.fillStyle = COLORS.TELEPORT;
        } else if (ent.type === "powerup_build") {
          ctx.fillStyle = COLORS.POWERUP_BUILD;
        } else if (ent.type === "powerup_hook") {
          ctx.fillStyle = COLORS.POWERUP_HOOK;
        } else if (ent.type === "powerup_double_jump") {
          ctx.fillStyle = COLORS.POWERUP_DJ;
        } else if (ent.type === "powerup_triple_jump") {
          ctx.fillStyle = "#ff00ff"; // Magenta for triple jump
        } else if (ent.type === "powerup_slow_mo") {
          ctx.fillStyle = COLORS.POWERUP_SLOW_MO;
        } else if (ent.type === "powerup_xray") {
          ctx.fillStyle = COLORS.POWERUP_XRAY;
        } else if (ent.type === "powerup_ice_block") {
          ctx.fillStyle = COLORS.ICE;
        } else if (ent.type === "powerup_slime_block") {
          ctx.fillStyle = COLORS.SLIME;
        } else if (ent.type === "powerup_fireball") {
          ctx.fillStyle = "#ff4500";
        } else if (ent.type === "powerup_bomb") {
          ctx.fillStyle = "#333333";
        } else if (ent.type === "powerup_shield") {
          ctx.fillStyle = "#ffd700"; // Gold
        } else if (ent.type === "powerup_steal") {
          ctx.fillStyle = "#8a2be2"; // Purple
        } else if (ent.type === "powerup_slow") {
          ctx.fillStyle = "#00ffff"; // Cyan
        } else if (ent.type === "powerup_melee") {
          ctx.fillStyle = "#ff0000"; // Red
        } else if (ent.type === "powerup_shrink") {
          ctx.fillStyle = "#10b981"; // Emerald
        } else if (ent.type === "powerup_grow") {
          ctx.fillStyle = "#ef4444"; // Red-500
        } else if (ent.type === "powerup_dash") {
          ctx.fillStyle = "#f59e0b"; // Amber
        } else if (ent.type === "powerup_teleport") {
          ctx.fillStyle = COLORS.TELEPORT;
        } else if (ent.type === "block_dash") {
          ctx.fillStyle = "#f59e0b";
        } else if (ent.type === "block_shrink") {
          ctx.fillStyle = "#10b981";
        } else if (ent.type === "block_grow") {
          ctx.fillStyle = "#ef4444";
        } else if (ent.type === "block_gravity") {
          ctx.fillStyle = "#8b5cf6";
        } else if (ent.type === "gravity_reverse" || (ent as any).type === "grav_up") {
          ctx.fillStyle = "rgba(168, 85, 247, 0.4)"; // Purple semi-transparent
        } else if (ent.type === "gravity_zero" || (ent as any).type === "grav_down") {
          ctx.fillStyle = "rgba(14, 165, 233, 0.4)"; // Blue semi-transparent
        } else if (ent.type === "fragile" || ent.fragile) {
          ctx.fillStyle = "#d6d3d1"; // Stone
        } else if (
          ent.type === "moving_platform_h" ||
          ent.type === "moving_platform_v" ||
          ent.movingH ||
          ent.movingV
        ) {
          ctx.fillStyle = "#f97316"; // Orange
        } else if (ent.type === "powerup_spawner") {
          if (gameMode === "brawler") return; // Invisible in game
          ctx.fillStyle = "#ff00ff";
        } else if (ent.type === "checkpoint") {
          // Check if active
          const isActive =
            currentRespawnPos.current.x === ent.x &&
            currentRespawnPos.current.y === ent.y;
          ctx.fillStyle = isActive ? "#00ff00" : COLORS.CHECKPOINT;
        } else if (ent.type === "powerup_remover") {
          ctx.fillStyle = COLORS.REMOVE_ABILITY;
        } else {
          ctx.fillStyle = "#fff";
        }

        if (ent.type === "coin") {
          if (players.current.length > 1 || gameMode === "vs" || isOnline) {
            const coinId = ent.id || "0";
            const collectors = players.current.filter(
              (p) =>
                p && p.collectedCoinIds && p.collectedCoinIds.includes(coinId),
            );
            const radius = ent.w / 2;
            const cx = drawX + radius;
            const cy = drawY + ent.h / 2;

            // Always draw the gold coin body as requested ("don't disappear")
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.COIN;
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1;
            ctx.stroke();

            // If someone has collected it, draw colored indicators on top
            if (collectors.length > 0) {
              const angleSlice = (Math.PI * 2) / collectors.length;
              collectors.forEach((p, i) => {
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, radius, i * angleSlice, (i + 1) * angleSlice);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.7;
                ctx.fill();
                ctx.globalAlpha = 1.0;
              });

              // Inner small gold circle to still look like a coin
              ctx.beginPath();
              ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
              ctx.fillStyle = COLORS.COIN;
              ctx.fill();
            }

            // If the LOCAL player has collected it, ghost the whole coin for them
            const hasLocalCollected = players.current
              .find(
                (p) =>
                  !isOnline || p.onlineId === onlineService.localPlayer?.id,
              )
              ?.collectedCoinIds.includes(coinId);
            if (hasLocalCollected) {
              ctx.fillStyle = "rgba(0,0,0,0.5)";
              ctx.beginPath();
              ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            ctx.beginPath();
            ctx.arc(
              drawX + ent.w / 2,
              drawY + ent.h / 2,
              ent.w / 2,
              0,
              Math.PI * 2,
            );
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        } else if (ent.type === "hazard" || ent.type === "ghost_hazard") {
          const cx = drawX + ent.w / 2;
          const cy = drawY + ent.h / 2;
          // Slightly reduced visual size to match tighter hitbox
          const r = Math.min(ent.w, ent.h) / 2 - 2;

          const frame = Math.floor(Date.now() / 400) % 3;
          const pulse = Math.sin(Date.now() / 300) * 0.5 + 0.5;

          ctx.save();
          ctx.translate(cx, cy);

          // Rotate the entire entity to simulate spinning
          ctx.rotate(Date.now() / 1000);

          // 1. Das Zentrum: quadratischer Kern (tiefrot/schwarz)
          const coreSize = r * 1.0;
          ctx.fillStyle = "#110000";
          ctx.fillRect(-coreSize / 2, -coreSize / 2, coreSize, coreSize);

          // Hellrotes pulsierendes Licht
          ctx.fillStyle = `rgba(255, 36, 0, ${0.3 + pulse * 0.7})`;
          const lightSize = coreSize * 0.5;
          ctx.fillRect(-lightSize / 2, -lightSize / 2, lightSize, lightSize);

          // 2. Die Zähne (Fliessende / Smouthe Animation)
          const numTeeth = 16;
          const bladeColor = "#FF2400";
          ctx.fillStyle = bladeColor;

          const animPhase = Date.now() / 250;

          for (let i = 0; i < numTeeth; i++) {
            ctx.rotate((Math.PI * 2) / numTeeth);

            const isMain = i % 2 === 0;
            // Pulsierende Werte sanft mit Sinus interpolieren
            const toothPulse = Math.sin(animPhase + (isMain ? 0 : Math.PI));
            // Wert von 0 bis 1 für einfachere Berechnungen
            const normalizedPulse = (toothPulse + 1) / 2;

            const tipExt = isMain
              ? r + 2 + toothPulse * 1.5
              : coreSize / 2 + normalizedPulse * (r + 4 - coreSize / 2);

            const toothHalfWidth = isMain
              ? r * 0.15 + toothPulse * r * 0.05
              : r * 0.12 * normalizedPulse;

            if (tipExt > coreSize / 2) {
              ctx.beginPath();
              ctx.moveTo(coreSize / 2 - 1, -toothHalfWidth);
              ctx.lineTo(tipExt, 0);
              ctx.lineTo(coreSize / 2 - 1, toothHalfWidth);
              ctx.fill();
            }
          }

          ctx.restore();

          if (isFake && isXrayActive) {
            ctx.strokeRect(drawX, drawY, ent.w, ent.h);
          }
        } else if (ent.type === "powerup_remover") {
          // Semi-transparent
          ctx.globalAlpha = alpha * 0.5;
          ctx.fillRect(drawX, drawY, ent.w, ent.h);
          ctx.globalAlpha = alpha;
          // Draw X inside
          ctx.strokeStyle = "rgba(0,0,0,0.5)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(drawX, drawY);
          ctx.lineTo(drawX + ent.w, drawY + ent.h);
          ctx.moveTo(drawX + ent.w, drawY);
          ctx.lineTo(drawX, drawY + ent.h);
          ctx.stroke();
        } else if (!skipDefaultFill) {
          if (ent.type === "gravity_reverse" || ent.type === "gravity_zero" || (ent as any).type === "grav_up" || (ent as any).type === "grav_down") {
            // Fill the area with the semi-transparent fillStyle
            ctx.fillRect(drawX, drawY, ent.w, ent.h);
            // Draw a solid border around the area
            ctx.strokeStyle = (ent.type === "gravity_reverse" || (ent as any).type === "grav_up") ? "#a855f7" : "#0ea5e9";
            ctx.lineWidth = 2;
            ctx.strokeRect(drawX, drawY, ent.w, ent.h);
          } else {
            ctx.fillRect(drawX, drawY, ent.w, ent.h);
          }

          if (isFake && isXrayActive) {
            ctx.strokeRect(drawX, drawY, ent.w, ent.h);
          }

          if (isP1Cursor || isP2Cursor) {
            ctx.strokeStyle = isP1Cursor ? "#06b6d4" : "#f59e0b";
            ctx.lineWidth = 4;
            ctx.strokeRect(drawX, drawY, ent.w, ent.h);
            const label = isP1Cursor ? "P1" : "P2";
            ctx.fillStyle = isP1Cursor ? "#06b6d4" : "#f59e0b";
            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = "center";
            ctx.fillText(label, drawX + ent.w / 2, drawY - 5);
          }

          const isHoveredP1 = (ent as any).isHoveredByModifierP1;
          const isHoveredP2 = (ent as any).isHoveredByModifierP2;
          if (isHoveredP1 || isHoveredP2) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = isHoveredP1 ? "#06b6d4" : "#f59e0b";
            // Draw animated dashed outline
            const dashOffset = (Date.now() / 40) % 24;
            ctx.setLineDash([6, 6]);
            ctx.lineDashOffset = -dashOffset;
            ctx.strokeRect(drawX - 2, drawY - 2, ent.w + 4, ent.h + 4);
            ctx.setLineDash([]); // Reset immediately
            
            // Draw small "UPGRADE?" label above block
            ctx.fillStyle = isHoveredP1 ? "#06b6d4" : "#f59e0b";
            ctx.font = '7px "Press Start 2P"';
            ctx.textAlign = "center";
            ctx.fillText("UPGRADE!", drawX + ent.w / 2, drawY - 9);
          }

          if (ent.type === "teleport") {
            ctx.strokeStyle = "rgba(255,255,255,0.8)";
            ctx.lineWidth = 2;
            ctx.strokeRect(drawX + 2, drawY + 2, ent.w - 4, ent.h - 4);

            // Draw Order Number
            const tpIndex = teleporters.indexOf(ent);
            if (tpIndex !== -1) {
              ctx.fillStyle = "white";
              ctx.font = '6px "Press Start 2P", monospace';
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(
                `${tpIndex + 1}`,
                drawX + ent.w / 2,
                drawY + ent.h / 2,
              );
              ctx.textAlign = "left"; // reset
              ctx.textBaseline = "alphabetic"; // reset
            }
          }
          if (ent.type === "checkpoint") {
            // Draw simple visual marker (inner box)
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(drawX, drawY, ent.w, ent.h);

            // Draw "CP" text
            ctx.fillStyle = "black";
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("CP", drawX + ent.w / 2, drawY + ent.h / 2);
            ctx.textAlign = "left"; // reset
            ctx.textBaseline = "alphabetic"; // reset
          }
          if (ent.type === "goal") {
            const finishers =
              gameMode === "vs"
                ? players.current.filter(
                    (p) =>
                      p &&
                      p.collectedCoinIds &&
                      p.collectedCoinIds.length === levelCoinIds.length,
                  )
                : [];

            if (gameMode === "vs" && finishers.length > 0) {
              const cx = drawX + ent.w / 2;
              const cy = drawY + ent.h / 2;
              const radius = Math.min(ent.w, ent.h) / 2;

              // Draw a nice subtle glow if the local player is a finisher
              const localFinisher = finishers.find((p) => p.playerIndex === 0);
              if (localFinisher) {
                ctx.save();
                ctx.shadowColor = localFinisher.color;
                ctx.shadowBlur = 15;
                ctx.strokeStyle = "white";
                ctx.lineWidth = 3;
                ctx.strokeRect(drawX - 2, drawY - 2, ent.w + 4, ent.h + 4);
                ctx.restore();
              }

              const totalPlayers = players.current.length;
              const angleStep = (Math.PI * 2) / totalPlayers;

              // Draw slices based on total players, coloring only those who finished
              finishers.forEach((p) => {
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(
                  cx,
                  cy,
                  radius,
                  p.playerIndex * angleStep,
                  (p.playerIndex + 1) * angleStep,
                );
                ctx.fillStyle = p.color;
                ctx.fill();
              });

              // Overlay a small white circle in middle for "core" goal look
              ctx.beginPath();
              ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
              ctx.fillStyle = "white";
              ctx.fill();

              ctx.strokeStyle = "white";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(cx, cy, radius, 0, Math.PI * 2);
              ctx.stroke();
            }

            const localHasGoal =
              gameMode === "vs"
                ? finishers.some((p) => p.playerIndex === 0)
                : isGoalUnlocked;

            if (!localHasGoal) {
              ctx.strokeStyle = "rgba(0,0,0,0.6)";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(drawX, drawY);
              ctx.lineTo(drawX + ent.w, drawY + ent.h);
              ctx.moveTo(drawX + ent.w, drawY);
              ctx.lineTo(drawX, drawY + ent.h);
              ctx.stroke();
            }
          }
          if (ent.type === "fragile" || ent.fragile) {
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(drawX + 5, drawY + 5);
            ctx.lineTo(drawX + ent.w - 5, drawY + ent.h - 5);
            ctx.moveTo(drawX + ent.w - 5, drawY + 5);
            ctx.lineTo(drawX + 5, drawY + ent.h - 5);
            ctx.stroke();
          }
          if (ent.type === "gravity_reverse" || (ent as any).type === "grav_up") {
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.beginPath();
            const centerX = drawX + ent.w / 2;
            const centerY = drawY + ent.h / 2;
            const size = 16;
            ctx.moveTo(centerX, centerY + size / 2);
            ctx.lineTo(centerX + size / 2, centerY - size / 2);
            ctx.lineTo(centerX - size / 2, centerY - size / 2);
            ctx.fill();
          }
          if (ent.type === "gravity_zero" || (ent as any).type === "grav_down") {
            ctx.strokeStyle = "rgba(255,255,255,0.7)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            const centerX = drawX + ent.w / 2;
            const centerY = drawY + ent.h / 2;
            const radius = 6;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Draw Powerups with special effects
        if (
          (ent.type.startsWith("powerup_") && ent.type !== "powerup_remover") ||
          ent.type.startsWith("block_")
        ) {
          const time = Date.now() / 200;
          const floatY =
            gameMode === "brawler" ? Math.sin(time + ent.x) * 3 : 0;

          ctx.save();
          ctx.translate(drawX + ent.w / 2, drawY + ent.h / 2 + floatY);

          // Glowing aura for the emoji
          ctx.shadowColor = ctx.fillStyle as string;
          ctx.shadowBlur = 15;

          // Text/Icon - using a standard UI sans-serif font of elegant size so symbols fit beautifully
          ctx.fillStyle = "white";
          ctx.font = "bold 18px 'Inter', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          let letter = "❓";
          if (ent.type === "powerup_build") letter = "🧱";
          if (ent.type === "powerup_hook") letter = "🪝";
          if (ent.type === "powerup_double_jump") letter = "⇈";
          if (ent.type === "powerup_triple_jump") letter = "🚀";
          if (ent.type === "powerup_slow_mo") letter = "⏱️";
          if (ent.type === "powerup_xray") letter = "👁️";
          if (ent.type === "powerup_ice_block") letter = "🧊";
          if (ent.type === "powerup_slime_block") letter = "🧪";
          if (ent.type === "powerup_fireball") letter = "🔥";
          if (ent.type === "powerup_teleport") letter = "🌀";
          if (ent.type === "powerup_bomb") letter = "💣";
          if (ent.type === "powerup_shield") letter = "🛡️";
          if (ent.type === "powerup_steal") letter = "🧲";
          if (ent.type === "powerup_slow") letter = "🐌";
          if (ent.type === "powerup_melee") letter = "🥊";
          if (ent.type === "powerup_shrink") letter = "🤏";
          if (ent.type === "powerup_grow") letter = "🍄";
          if (ent.type === "powerup_dash") letter = "⚡";
          if (ent.type === "block_dash") letter = "⚡";
          if (ent.type === "block_shrink") letter = "🤏";
          if (ent.type === "block_grow") letter = "💪";
          if (ent.type === "block_gravity") letter = "⇅";

          ctx.fillText(letter, 0, 0);
          ctx.restore();
        }
        ctx.globalAlpha = 1.0;
      });

      // Draw Projectiles
      drawProjectiles(ctx, projectiles.current);

      // Draw Bombs
      drawBombs(ctx, bombs.current);

      // Draw Explosions
      drawExplosions(ctx, explosions.current);

      // Draw Temp Blocks
      tempBlocks.current.forEach((block) => {
        // If permanent, don't fade out visually
        if (block.expires > Date.now() + 100000) {
          ctx.fillStyle = COLORS.TEMP_BLOCK;
          ctx.globalAlpha = 1.0;
        } else {
          const timeLeft = block.expires - Date.now();
          ctx.fillStyle = COLORS.TEMP_BLOCK;
          ctx.globalAlpha = Math.max(0, timeLeft / 500);
        }
        ctx.fillRect(block.x, block.y, block.w, block.h);
        ctx.globalAlpha = 1.0;
      });

      // Draw Ghost
      const isGhostDisabled =
        isOnline || gameMode === "vs" || gameMode === "brawler";
      if (
        settings.showGhost &&
        !isGhostDisabled &&
        ghostRun &&
        ghostRun.levelId === level.id &&
        ghostRun.frames &&
        ghostFrameIndex.current < ghostRun.frames.length
      ) {
        const frame = ghostRun.frames[ghostFrameIndex.current];
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.filter = "grayscale(100%)";

        // Draw Ghost Body
        ctx.fillStyle = ghostRun.customization?.color || "#ffffff";
        ctx.fillRect(frame.x, frame.y, 20, 20);

        // Draw Ghost Eyes
        ctx.fillStyle = "white";
        const eyes = ghostRun.customization?.eyes || "normal";
        const fx = frame.x;
        const fy = frame.y;
        const fw = 20;
        if (eyes === "cyclops") {
          ctx.fillRect(fx + fw / 2 - 4, fy + 4, 8, 8);
          ctx.fillStyle = "black";
          ctx.fillRect(fx + fw / 2 - 1, fy + 6, 2, 2);
        } else if (eyes === "anime") {
          ctx.fillRect(fx + 1, fy + 3, 6, 8);
          ctx.fillRect(fx + fw - 7, fy + 3, 6, 8);
          ctx.fillStyle = "black";
          ctx.fillRect(fx + 2, fy + 4, 2, 4);
          ctx.fillRect(fx + fw - 6, fy + 4, 2, 4);
        } else if (eyes === "dead") {
          ctx.strokeStyle = "white";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(fx + 2, fy + 4);
          ctx.lineTo(fx + 6, fy + 8);
          ctx.moveTo(fx + 6, fy + 4);
          ctx.lineTo(fx + 2, fy + 8);
          ctx.moveTo(fx + fw - 6, fy + 4);
          ctx.lineTo(fx + fw - 2, fy + 8);
          ctx.moveTo(fx + fw - 2, fy + 4);
          ctx.lineTo(fx + fw - 6, fy + 8);
          ctx.stroke();
        } else if (eyes === "sunglasses") {
          ctx.fillStyle = "black";
          ctx.fillRect(fx, fy + 4, fw, 4);
        } else {
          let ly = 4,
            ry = 4;
          if (eyes === "derp") ry = 8;
          ctx.fillRect(fx + 4, fy + ly, 4, 4);
          ctx.fillRect(fx + fw - 8, fy + ry, 4, 4);
        }

        // Draw Ghost Accessory
        const acc = ghostRun.customization?.accessory || "none";
        if (acc === "crown") {
          ctx.fillStyle = "gold";
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(fx, fy - 10);
          ctx.lineTo(fx + 5, fy - 5);
          ctx.lineTo(fx + 10, fy - 12);
          ctx.lineTo(fx + 15, fy - 5);
          ctx.lineTo(fx + fw, fy - 10);
          ctx.lineTo(fx + fw, fy);
          ctx.fill();
        } else if (acc === "horns") {
          ctx.fillStyle = "#a00";
          ctx.beginPath();
          ctx.moveTo(fx + 2, fy);
          ctx.lineTo(fx - 2, fy - 8);
          ctx.lineTo(fx + 6, fy);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(fx + fw - 6, fy);
          ctx.lineTo(fx + fw + 2, fy - 8);
          ctx.lineTo(fx + fw - 2, fy);
          ctx.fill();
        } else if (acc === "headband") {
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(fx, fy + 2, fw, 4);
          ctx.fillRect(fx - 2, fy + 3, 2, 2);
          ctx.fillRect(fx + fw, fy + 3, 2, 2);
        } else if (acc === "cowboy") {
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(fx - 4, fy - 4, fw + 8, 4);
          ctx.fillRect(fx + 2, fy - 12, fw - 4, 8);
        } else if (acc === "viking") {
          ctx.fillStyle = "#aaa";
          ctx.beginPath();
          ctx.arc(fx + fw / 2, fy, fw / 2, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.moveTo(fx, fy - 4);
          ctx.lineTo(fx - 4, fy - 10);
          ctx.lineTo(fx + 2, fy - 6);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(fx + fw, fy - 4);
          ctx.lineTo(fx + fw + 4, fy - 10);
          ctx.lineTo(fx + fw - 2, fy - 6);
          ctx.fill();
        } else if (acc === "halo") {
          ctx.strokeStyle = "gold";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(fx + fw / 2, fy - 8, 8, 3, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (acc === "headphones") {
          ctx.fillStyle = "#333";
          ctx.fillRect(fx - 2, fy + 4, 4, 10);
          ctx.fillRect(fx + fw - 2, fy + 4, 4, 10);
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(fx + fw / 2, fy + 4, fw / 2 + 2, Math.PI, 0);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Draw Sudden Death Lava
      if (
        gameMode === "brawler" &&
        brawlerSuddenDeath &&
        roundTimerRef.current > 1800
      ) {
        const time = performance.now() / 200;
        const currentLevelWidth = levelRef.current.width || GAME_WIDTH;
        const currentLevelHeight = levelRef.current.height || GAME_HEIGHT;
        const lavaY = Math.max(
          0,
          currentLevelHeight - (roundTimerRef.current - 1800) * (0.2 / 3),
        );
        ctx.fillStyle = "rgba(255, 60, 0, 0.8)";
        ctx.fillRect(0, lavaY, currentLevelWidth, currentLevelHeight - lavaY);
        ctx.fillStyle = "rgba(255, 60, 0, 0.5)";
        ctx.beginPath();
        for (let x = 0; x <= currentLevelWidth; x += 20) {
          ctx.lineTo(x, lavaY - 5 + Math.sin(x / 30 + time) * 10);
        }
        ctx.lineTo(currentLevelWidth, currentLevelHeight);
        ctx.lineTo(0, currentLevelHeight);
        ctx.fill();

        ctx.save();
        const fade = Math.min(1, (roundTimerRef.current - 1800) / 120);
        // Put text on screen-space or world-space? It's currently in world-space because we haven't done restore() yet.
        // It makes sense to center it on the camera.
        ctx.fillStyle = `rgba(255, 0, 0, ${fade})`;
        ctx.font = '64px "Press Start 2P", monospace';
        ctx.textAlign = "center";
        const textX = -finalTranslateX + GAME_WIDTH / 2;
        const textY = -finalTranslateY + 80 + Math.sin(time) * 5;
        ctx.fillText("SUDDEN DEATH", textX, textY);
        ctx.strokeStyle = `rgba(0, 0, 0, ${fade})`;
        ctx.lineWidth = 4;
        ctx.strokeText("SUDDEN DEATH", textX, textY);
        ctx.restore();
      }

      if (level.autoScroll && !geometryDashMode) {
        const h = levelRef.current.height
          ? Math.max(levelRef.current.height, GAME_HEIGHT)
          : GAME_HEIGHT;
        ctx.fillStyle = "rgba(255, 0, 0, 0.8)"; // Red wall of death
        ctx.fillRect(Math.round(scrollWallX.current), -1000, 10, h + 2000);
      }

      // Draw Players
      const activePlayers = players.current.filter((pl) => !pl.finished);

      players.current.forEach((p, i) => {
        if (!p) return;

        const isLocalPlayer =
          !isOnline ||
          p.onlineId === onlineService.localPlayer?.id ||
          p.isLocal;
        const isBeingSpectated =
          isSpectatingNowLocal &&
          spectateTargetIdx < activePlayers.length &&
          activePlayers[spectateTargetIdx] === p;
        const shouldBeTransparent =
          (gameMode === "vs" || isOnline) &&
          !isLocalPlayer &&
          !isBeingSpectated;

        ctx.save();
        if (shouldBeTransparent) {
          ctx.globalAlpha = opponentOpacity;
        } else {
          ctx.globalAlpha = 1.0;
        }

        // Hook Rope
        if (p.hookActive && p.hookPos) {
          ctx.strokeStyle = COLORS.HOOK_ROPE;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.pos.x + 10, p.pos.y + 10);
          ctx.lineTo(p.hookPos.x, p.hookPos.y);
          ctx.stroke();

          // Anchor point
          ctx.fillStyle = "white";
          ctx.fillRect(p.hookPos.x - 2, p.hookPos.y - 2, 4, 4);
        }

        // Trail
        if (p.trailColor === "rainbow") {
          // Rainbow effect
        }

        if (p.dead) {
          p.trail = [];
        } else {
          p.trail.push({ x: p.pos.x, y: p.pos.y, w: p.w, h: p.h });
          if (p.trail.length > 8) p.trail.shift();
          p.trail.forEach((pos, i) => {
            if (p.color && p.color.toLowerCase() === "#ffffff") {
              return; // No trail for ghost mode
            }
            if (p.color === "#130009") {
              ctx.fillStyle =
                (Math.floor(Date.now() / 100) + i) % 2 === 0
                  ? "#ffff00"
                  : "#000000";
            } else if (
              p.slowTimer > 0 &&
              Math.floor(Date.now() / 150) % 2 === 0
            ) {
              ctx.fillStyle = "#00ffff";
            } else if (p.trailColor === "rainbow") {
              ctx.fillStyle = `hsl(${Date.now() / 5 + i * 20}, 100%, 50%)`;
            } else {
              ctx.fillStyle = p.trailColor || "#ffffff";
            }

            const currentAlpha = ctx.globalAlpha;
            ctx.globalAlpha = shouldBeTransparent ? opponentOpacity * 0.4 : 0.4;
            const sizeW = pos.w * (i / 8);
            const sizeH = pos.h * (i / 8);

            if (p.trailType === "stardust") {
              ctx.beginPath();
              ctx.arc(
                pos.x + pos.w / 2,
                pos.y + pos.h / 2,
                sizeW / 2,
                0,
                Math.PI * 2,
              );
              ctx.fill();
              if (i % 2 === 0) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(
                  pos.x + pos.w / 2 + (Math.random() * 10 - 5),
                  pos.y + pos.h / 2 + (Math.random() * 10 - 5),
                  2,
                  2,
                );
              }
            } else if (p.trailType === "pixel-fire") {
              ctx.fillRect(
                pos.x + (pos.w - sizeW) / 2 + (Math.random() * 4 - 2),
                pos.y + (pos.h - sizeH) / 2 + (8 - i),
                sizeW,
                sizeH,
              );
              ctx.fillStyle = "#ffaa00";
              ctx.globalAlpha = 0.6;
              ctx.fillRect(
                pos.x + (pos.w - sizeW) / 2 + (Math.random() * 6 - 3),
                pos.y + (pos.h - sizeH) / 2 + (10 - i),
                sizeW * 0.5,
                sizeH * 0.5,
              );
            } else if (p.trailType === "slime") {
              ctx.beginPath();
              ctx.arc(
                pos.x + pos.w / 2,
                pos.y + pos.h / 2 + (8 - i),
                sizeW / 2,
                0,
                Math.PI * 2,
              );
              ctx.fill();
              ctx.beginPath();
              ctx.arc(
                pos.x + pos.w / 2 - 2,
                pos.y + pos.h / 2 + (8 - i) + 4,
                sizeW / 3,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            } else if (p.trailType === "rainbow-pulse") {
              ctx.fillStyle = `hsl(${Date.now() / 5 + i * 20}, 80%, 60%)`;
              ctx.globalAlpha = 0.4 * (i / 8);
              ctx.fillRect(
                pos.x + (pos.w - sizeW) / 2,
                pos.y + (pos.h - sizeH) / 2,
                sizeW,
                sizeH,
              );
            } else if (p.trailType === "ghostly") {
              ctx.fillStyle = "white";
              ctx.globalAlpha =
                (0.2 - (8 - i) * 0.02) * Math.abs(Math.sin(Date.now() / 500));
              ctx.beginPath();
              ctx.moveTo(pos.x, pos.y);
              ctx.lineTo(pos.x + pos.w, pos.y);
              ctx.lineTo(pos.x + pos.w / 2, pos.y + pos.h * 2);
              ctx.fill();
            } else if (p.trailType === "bubble-trail") {
              ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(
                pos.x + pos.w / 2,
                pos.y + pos.h / 2 + Math.sin(Date.now() / 200 + i) * 10,
                sizeW / 2,
                0,
                Math.PI * 2,
              );
              ctx.stroke();
            } else if (p.trailType === "spark-trail") {
              ctx.fillStyle = "#ffff00";
              ctx.globalAlpha = 0.8;
              if (Math.random() > 0.5) {
                ctx.fillRect(
                  pos.x + Math.random() * pos.w,
                  pos.y + Math.random() * pos.h,
                  2,
                  2,
                );
              }
            } else if (p.trailType === "shadow-trail") {
              ctx.fillStyle = "black";
              ctx.globalAlpha = (8 - i) * 0.05;
              ctx.fillRect(pos.x - 2, pos.y - 2, pos.w + 4, pos.h + 4);
            } else if (p.trailType === "neon-trail") {
              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 2;
              ctx.strokeRect(
                pos.x + (pos.w - sizeW) / 2,
                pos.y + (pos.h - sizeH) / 2,
                sizeW,
                sizeH,
              );
            } else if (p.trailType === "matrix_trail") {
              ctx.fillStyle = "#00ff00";
              ctx.font = `8px monospace`;
              ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), pos.x + pos.w / 2 - sizeW/2, pos.y + pos.h / 2 + sizeH/2);
            } else {
              ctx.fillRect(
                pos.x + (pos.w - sizeW) / 2,
                pos.y + (pos.h - sizeH) / 2,
                sizeW,
                sizeH,
              );
            }
            ctx.globalAlpha = currentAlpha;
          });
        }

        // Teleport Cooldown Indicator (Shrinking Ring)
        if (p.teleportCooldown > 0) {
          const ratio = p.teleportCooldown / p.teleportMaxCooldown;
          const maxRadius = 30;
          const currentRadius = 10 + (maxRadius - 10) * ratio;

          ctx.strokeStyle = p.trailColor === "rainbow" ? "white" : p.trailColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.pos.x + 10, p.pos.y + 10, currentRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Hook Cooldown Indicator (Small dot below player)
        if (p.hookCooldown > 0) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          const w = 20;
          const ratio = p.hookCooldown / HOOK_COOLDOWN;
          ctx.fillRect(p.pos.x, p.pos.y + 25, w * (1 - ratio), 2);
        }

        let w = p.w,
          h = p.h;
        let offX = 0,
          offY = 0;
        if (Math.abs(p.vel.y) > 2) {
          h = p.h * 1.4;
          w = p.w * 0.7;
          offX = p.w * 0.15;
          offY = -p.h * 0.2;
        }
        if (Math.abs(p.vel.x) > 4) {
          h = p.h * 0.7;
          w = p.w * 1.4;
          offX = -p.w * 0.2;
          offY = p.h * 0.15;
        }

        const visualAlpha = typeof alpha === "number" ? alpha : 0;
        const px = p.pos.x + offX + p.vel.x * visualAlpha;
        const py = p.pos.y + offY + p.vel.y * visualAlpha;

        if (geometryDashMode && p.rotationAngle) {
          ctx.translate(px + w / 2, py + h / 2);
          ctx.rotate((p.rotationAngle * Math.PI) / 180);
          ctx.translate(-(px + w / 2), -(py + h / 2));
        }

        // Spectator Highlight
        if (isSpectatingNowLocal) {
          if (activePlayers.length > 0) {
            const currentTarget =
              activePlayers[spectateTargetIdx % activePlayers.length];
            if (currentTarget && currentTarget.onlineId === p.onlineId) {
              ctx.save();
              const pulse = Math.sin(Date.now() / 300) * 5;
              ctx.strokeStyle = "cyan";
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(px + w / 2, py + h / 2, 25 + pulse, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();
            }
          }
        }

        // Body color
        if (p.dead) {
          ctx.fillStyle = "#3f3f46"; // dark slate gray
        } else if (p.color && p.color.toLowerCase() === "#ffffff") {
          ctx.fillStyle = "rgba(0,0,0,0)";
        } else if (p.color === "#130009") {
          const time = Date.now() / 500;
          const grad = ctx.createLinearGradient(
            px + Math.cos(time) * w,
            py + Math.sin(time) * h,
            px + w + Math.cos(time + Math.PI) * w,
            py + h + Math.sin(time + Math.PI) * h,
          );
          grad.addColorStop(0, "#ffff00"); // Yellow
          grad.addColorStop(0.5, "#000000"); // Black
          grad.addColorStop(1, "#ffff00"); // Yellow
          ctx.fillStyle = grad;
        } else if (p.color && p.color.toLowerCase() === "#ff0080") {
          // Rainbow special
          ctx.fillStyle = `hsl(${(Date.now() / 5) % 360}, 100%, 50%)`;
        } else if (p.slowTimer > 0) {
          ctx.fillStyle =
            Math.floor(Date.now() / 150) % 2 === 0
              ? "#00ffff"
              : p.color || "#ffffff";
        } else {
          ctx.fillStyle = p.color || "#ffffff";
        }

        // Ghosting effect if in ghost state (respawn)
        const now = Date.now();
        const isGhostEffect = p.respawnTimer && now - p.respawnTimer < 2000;
        const currentAlpha = ctx.globalAlpha;
        if (isGhostEffect) {
          ctx.globalAlpha *= 0.5;
        }

        // NaN check
        if (isNaN(px) || isNaN(py)) {
          ctx.fillStyle = "red";
          ctx.fillRect(50, 160, 40, 40);
          ctx.fillStyle = "white";
          ctx.fillText("NAN POSITION DETECTED", 50, 155);
        } else {
          ctx.save();
          if (p.gravityFlipped) {
            ctx.translate(px + w / 2, py + h / 2);
            ctx.scale(1, -1);
            ctx.translate(-(px + w / 2), -(py + h / 2));
          }
          if (p.dead || (p.color && p.color.toLowerCase() !== "#ffffff")) {
            ctx.fillRect(px, py, w, h);
            // Border for visibility
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, w, h);
          }
          ctx.restore();
          ctx.globalAlpha = currentAlpha;
        }

        // Shield Visual (Glowing golden dome)
        if (p.shieldTimer > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(px + w / 2, py + h / 2, 25, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 215, 0, 0.3)"; // Gold with transparency
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#ffd700";
          ctx.shadowColor = "#ffd700";
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.restore();
        }

        // Melee Attack Visual
        if (p.meleeActive) {
          ctx.save();
          ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
          const hitBoxW = gameMode === "brawler" ? 60 : 20;
          const hitBoxH = 20;
          const hitBoxX = p.pos.x + (p.facing === 1 ? 20 : -hitBoxW);
          const hitBoxY = p.pos.y;
          ctx.fillRect(hitBoxX, hitBoxY, hitBoxW, hitBoxH);
          ctx.restore();
        }

        // Ability Indicator (Above head)
        const hasOneTime =
          p.oneTimeBuild ||
          p.oneTimeHook ||
          p.oneTimeDoubleJump ||
          p.oneTimeTripleJump ||
          p.tripleJumpActive;
        if ((hasOneTime || p.inventory) && gameMode !== "brawler") {
          let indColor = "#fff";
          let letter = "❓";

          if (p.inventory) {
            if (p.inventory === "powerup_build") {
              indColor = COLORS.POWERUP_BUILD;
              letter = "🧱";
            }
            if (p.inventory === "powerup_hook") {
              indColor = COLORS.POWERUP_HOOK;
              letter = "🪝";
            }
            if (p.inventory === "powerup_slow_mo") {
              indColor = COLORS.POWERUP_SLOW_MO;
              letter = "⏱️";
            }
            if (p.inventory === "powerup_xray") {
              indColor = COLORS.POWERUP_XRAY;
              letter = "👁️";
            }
            if (p.inventory === "powerup_ice_block") {
              indColor = COLORS.ICE;
              letter = "🧊";
            }
            if (p.inventory === "powerup_slime_block") {
              indColor = COLORS.SLIME;
              letter = "🧪";
            }
            if (p.inventory === "powerup_fireball") {
              indColor = "#ff4500";
              letter = "🔥";
            }
            if (p.inventory === "powerup_bomb") {
              indColor = "#333333";
              letter = "💣";
            }
            if (p.inventory === "powerup_shield") {
              indColor = "#ffd700";
              letter = "🛡️";
            }
            if (p.inventory === "powerup_steal") {
              indColor = "#8a2be2";
              letter = "🧲";
            }
            if (p.inventory === "powerup_slow") {
              indColor = "#00ffff";
              letter = "🐌";
            }
            if (p.inventory === "powerup_melee") {
              indColor = "#ff0000";
              letter = "🥊";
            }
            if (p.inventory === "powerup_shrink") {
              indColor = "#10b981";
              letter = "🤏";
            }
            if (p.inventory === "powerup_grow") {
              indColor = "#ef4444";
              letter = "🍄";
            }
            if (p.inventory === "powerup_dash") {
              indColor = "#f59e0b";
              letter = "💨";
            }
            if (p.inventory === "powerup_teleport") {
              indColor = COLORS.TELEPORT;
              letter = "🌀";
            }
            if (p.inventory === "powerup_triple_jump") {
              indColor = "#ff00ff";
              letter = "🚀";
            }
            // Fused powerups above head support
            if (p.inventory === "powerup_titan") {
              indColor = "#fbbf24";
              letter = "🍄";
            }
            if (p.inventory === "powerup_blizzard") {
              indColor = "#a5f3fc";
              letter = "❄️";
            }
            if (p.inventory === "powerup_thunder_shield") {
              indColor = "#eab308";
              letter = "⚡";
            }
            if (p.inventory === "powerup_nuke_bomb") {
              indColor = "#ef4444";
              letter = "💥";
            }
            if (p.inventory === "powerup_meteor_rain") {
              indColor = "#f97316";
              letter = "☄️";
            }
            if (p.inventory === "powerup_golden_sword") {
              indColor = "#facc15";
              letter = "⚔️";
            }
            if (p.inventory === "powerup_teleport_dash") {
              indColor = "#a855f7";
              letter = "🌌";
            }
            if (p.inventory === "powerup_teleport_all") {
              indColor = "#6366f1";
              letter = "🌀";
            }
            if (p.inventory === "powerup_gravity_boots") {
              indColor = "#f43f5e";
              letter = "🥾";
            }
            if (p.inventory === "powerup_black_hole") {
              indColor = "#d946ef";
              letter = "🕳️";
            }
            if (p.inventory === "powerup_glacier") {
              indColor = "#06b6d4";
              letter = "🏔️";
            }
            if (p.inventory === "powerup_trampoline") {
              indColor = "#ec4899";
              letter = "🤸";
            }
            if (p.inventory === "powerup_fortress") {
              indColor = "#64748b";
              letter = "🏰";
            }
            if (p.inventory === "powerup_voltage_hook") {
              indColor = "#0d9488";
              letter = "🪝";
            }
            if (p.inventory === "powerup_nano_spy") {
              indColor = "#10b981";
              letter = "🐜";
            }
            if (p.inventory === "powerup_quantum_shift") {
              indColor = "#3b82f6";
              letter = "✨";
            }
            if (p.inventory === "powerup_fire_shield") {
              indColor = "#ea580c";
              letter = "🔥";
            }
            if (p.inventory === "powerup_lodestar") {
              indColor = "#e11d48";
              letter = "💫";
            }
            if (p.inventory === "powerup_frost_mourne") {
              indColor = "#38bdf8";
              letter = "❄️";
            }
            if (p.inventory === "powerup_sticky_bomb") {
              indColor = "#84cc16";
              letter = "🟢";
            }
            if (p.inventory === "powerup_angel_wings") {
              indColor = "#f8fafc";
              letter = "🪽";
            }
            if (p.inventory === "powerup_trickster") {
              indColor = "#d946ef";
              letter = "🃏";
            }
            if (p.inventory === "powerup_chaos_orb") {
              indColor = "#ec4899";
              letter = "🔮";
            }
          } else {
            if (p.oneTimeBuild) {
              indColor = COLORS.POWERUP_BUILD;
              letter = "🧱";
            } else if (p.oneTimeHook) {
              indColor = COLORS.POWERUP_HOOK;
              letter = "🪝";
            } else if (p.oneTimeDoubleJump) {
              indColor = COLORS.POWERUP_DJ;
              letter = "👟";
            } else if (p.oneTimeTripleJump || p.tripleJumpActive) {
              indColor = "#ff00ff";
              letter = "🚀";
            }
          }

          ctx.shadowColor = indColor;
          ctx.shadowBlur = 10;
          ctx.fillStyle = "white";
          ctx.font = '18px "Press Start 2P", monospace';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(letter, px + w / 2, py - 16);
          ctx.shadowBlur = 0;
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
        }

        if (gameMode === "vs" || gameMode === "brawler") {
          ctx.fillStyle = p.color || "white";
          ctx.font = '8px "Press Start 2P", monospace';
          const nameOffset =
            gameMode !== "brawler" && (p.inventory || hasOneTime) ? 22 : 8;
          const displayName =
            p.color === "#130009"
              ? "ADMIN"
              : p.color && p.color.toLowerCase() === "#ff0080"
                ? "MAGIC"
                : p.color && p.color.toLowerCase() === "#ffffff"
                  ? "GHOST"
                  : p.name;

          if (gameMode === "brawler") {
            const tCol = getTeamColor(p.team || 0);
            ctx.fillStyle = tCol || "white";
          }

          ctx.fillText(displayName, px, py - nameOffset);
        }

        drawPlayerEyes(ctx, px, py, w, h, p);

        drawPlayerAccessories(ctx, px, py, w, h, p);
        ctx.restore(); // Matches player entry ctx.save()
      });

      // Draw HUD UI
      ctx.restore(); // Restore camera translation to screen space

      // Draw off-screen indicators for local players
      players.current.forEach((p) => {
        if (!p.isLocal || !p.pos) return;

        const zoom = cameraZoom.current || 1.0;
        const cx = cameraRef.current.x + GAME_WIDTH / 2;
        const cy = cameraRef.current.y + GAME_HEIGHT / 2;
        const visW = GAME_WIDTH / zoom;
        const visH = GAME_HEIGHT / zoom;
        const leftX = cx - visW / 2;
        const topY = cy - visH / 2;

        const isOffLeft = p.pos.x + p.w < leftX;
        const isOffRight = p.pos.x > leftX + visW;
        const isOffTop = p.pos.y + p.h < topY;
        const isOffBottom = p.pos.y > topY + visH;

        if (isOffLeft || isOffRight || isOffTop || isOffBottom) {
          const screenX = (p.pos.x + p.w / 2 - cx) * zoom + GAME_WIDTH / 2;
          const screenY = (p.pos.y + p.h / 2 - cy) * zoom + GAME_HEIGHT / 2;

          const margin = 30;
          let targetX = Math.max(
            margin,
            Math.min(GAME_WIDTH - margin, screenX),
          );
          let targetY = Math.max(
            margin,
            Math.min(GAME_HEIGHT - margin, screenY),
          );

          const dx = screenX - targetX;
          const dy = screenY - targetY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const scale = Math.min(2.5, 0.5 + dist / 400);

          ctx.save();
          ctx.translate(targetX, targetY);

          const angle = Math.atan2(dy, dx);
          ctx.rotate(angle);

          ctx.beginPath();
          ctx.moveTo(10 * scale, 0);
          ctx.lineTo(-6 * scale, 8 * scale);
          ctx.lineTo(-6 * scale, -8 * scale);
          ctx.closePath();

          ctx.fillStyle = p.color || "#ffffff";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "rgba(0,0,0,0.5)";
          ctx.stroke();

          ctx.restore();
        }
      });

      if (gameMode === "brawler" || gameMode === "vs" || gameMode === "story") {
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textBaseline = "top";

        const isGhostDisabled =
          isOnline || gameMode === "vs" || gameMode === "brawler";
        if (
          settings.showGhost &&
          !isGhostDisabled &&
          ghostRun &&
          ghostRun.levelId === level.id &&
          gameMode === "story"
        ) {
          ctx.save();
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.textAlign = "right";
          ctx.fillText(
            `Ghost: ${ghostRun.time.toFixed(2)}s`,
            GAME_WIDTH - 20,
            20,
          );
          ctx.restore();
        }

        const hudT = TRANSLATIONS[lang];
        const totalCoinsAtLevel =
          gameMode === "vs" || gameMode === "story" || gameMode === "random_run" || geometryDashMode
            ? levelRef.current.entities.filter((e) => e.type === "coin").length
            : 0;

        const hudPadding = 10;
        const availableWidth = GAME_WIDTH - hudPadding * 2;
        const playerSlotWidth =
          availableWidth / Math.max(1, players.current.length);

        players.current.forEach((p, i) => {
          const isLocal2P = !isOnline && players.current.length === 2;
          const isP2 = isLocal2P && i === 1;

          let startX = hudPadding + i * playerSlotWidth;
          if (isP2) {
            startX = GAME_WIDTH - hudPadding;
            ctx.textAlign = "right";
          } else {
            ctx.textAlign = "left";
          }

          // Use player color for name (Character color)
          ctx.fillStyle = p.color;

          ctx.font = '10px "Press Start 2P", monospace';

          if (gameMode === "brawler") {
            ctx.fillText(`${p.name} ♥ ${p.lives}`, startX, 10);
          } else {
            ctx.fillText(`${p.name}`, startX, 10);
          }

          ctx.save();
          ctx.font = '6px "Press Start 2P", monospace';
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          let nextY = 24;

          if (
            totalCoinsAtLevel > 0 &&
            (gameMode === "vs" || gameMode === "story" || gameMode === "random_run" || geometryDashMode)
          ) {
            ctx.fillStyle =
              p.collectedCoinIds.length === totalCoinsAtLevel
                ? "#4ade80"
                : "#fbbf24";
            ctx.fillText(
              `${hudT.coins}: ${p.collectedCoinIds.length}/${totalCoinsAtLevel}${p.collectedCoinIds.length === totalCoinsAtLevel ? " ✔" : ""}`,
              startX,
              nextY,
            );
            nextY += 10;
          }

          // Death counter
          ctx.fillStyle = "#ef4444"; // red-500
          const displayDeaths = geometryDashMode && p.isLocal ? levelDeaths : (p.deaths || 0);
          ctx.fillText(`${hudT.deaths}: ${displayDeaths}`, startX, nextY);
          ctx.restore();

          // Powerup HUD for Local Player only to save space in horizontal layout
          if (p.isLocal) {
            const hasOneTime =
              p.oneTimeBuild ||
              p.oneTimeHook ||
              (p.oneTimeDoubleJump && gameMode !== "brawler") ||
              p.oneTimeTripleJump ||
              p.tripleJumpActive;

            if (p.inventory || hasOneTime) {
              let puName = "";
              if (p.inventory) {
                if (p.inventory === "powerup_build") puName = hudT.puBuild;
                else if (p.inventory === "powerup_hook") puName = hudT.puHook;
                else if (p.inventory === "powerup_slow_mo") puName = hudT.puSlowMo;
                else if (p.inventory === "powerup_xray") puName = hudT.puXray;
                else if (p.inventory === "powerup_ice_block") puName = hudT.puIce;
                else if (p.inventory === "powerup_slime_block")
                  puName = hudT.puSlime;
                else if (p.inventory === "powerup_fireball")
                  puName = hudT.puFireball;
                else if (p.inventory === "powerup_bomb") puName = hudT.puBomb;
                else if (p.inventory === "powerup_shield") puName = hudT.puShield;
                else if (p.inventory === "powerup_steal") puName = hudT.puSteal;
                else if (p.inventory === "powerup_slow") puName = hudT.puSlow;
                else if (p.inventory === "powerup_melee") puName = hudT.puMelee;
                else if (p.inventory === "powerup_shrink") puName = hudT.puShrink;
                else if (p.inventory === "powerup_grow") puName = hudT.puGrow;
                else if (p.inventory === "powerup_dash") puName = hudT.puDash;
                else if (p.inventory === "powerup_teleport")
                  puName = hudT.puTeleport;
                else if (p.inventory === "powerup_triple_jump")
                  puName = hudT.puTripleJump;
                else if (p.inventory === "powerup_titan") puName = lang === "de" ? "⭐ TITAN-KOLOSS" : "⭐ TITAN BEAST";
                else if (p.inventory === "powerup_blizzard") puName = lang === "de" ? "⭐ BLIZZARD-STURM" : "⭐ BLIZZARD STORM";
                else if (p.inventory === "powerup_thunder_shield") puName = lang === "de" ? "⭐ BLITZSCHILD" : "⭐ THUNDER SHIELD";
                else if (p.inventory === "powerup_nuke_bomb") puName = lang === "de" ? "⭐ NUKE-BOMBE" : "⭐ NUKE CLUSTER BOMB";
                else if (p.inventory === "powerup_meteor_rain") puName = lang === "de" ? "⭐ METEORSTURM" : "⭐ METEOR SHOWER";
                else if (p.inventory === "powerup_golden_sword") puName = lang === "de" ? "⭐ SEELENFRESSER" : "⭐ EXCALIBUR BLOCK";
                else if (p.inventory === "powerup_teleport_dash") puName = lang === "de" ? "⭐ WARP-SPRINT" : "⭐ WARP DASH";
                else if (p.inventory === "powerup_teleport_all") puName = lang === "de" ? "⭐ WELTEN-SWAP" : "⭐ WORMHOLE SWAP";
                else if (p.inventory === "powerup_gravity_boots") puName = lang === "de" ? "⭐ SCHWERKRAFT-STIEFEL" : "⭐ GRAVITY BOOTS";
                else if (p.inventory === "powerup_black_hole") puName = lang === "de" ? "⭐ SCHWARZES LOCH" : "⭐ BLACK HOLE";
                else if (p.inventory === "powerup_glacier") puName = lang === "de" ? "⭐ GLETSCHER-WALL" : "⭐ GLACIER WALL";
                else if (p.inventory === "powerup_trampoline") puName = lang === "de" ? "⭐ MEGA-TRAMPOLIN" : "⭐ MEGA TRAMPOLINE";
                else if (p.inventory === "powerup_fortress") puName = lang === "de" ? "⭐ FESTUNGS-WALL" : "⭐ FORTRESS BLOCK";
                else if (p.inventory === "powerup_voltage_hook") puName = lang === "de" ? "⭐ ELEKTRO-GREIFER" : "⭐ VOLTAGE GRAPPLE";
                else if (p.inventory === "powerup_nano_spy") puName = lang === "de" ? "⭐ NANOSPION" : "⭐ NANO SPY";
                else if (p.inventory === "powerup_quantum_shift") puName = lang === "de" ? "⭐ QUANTEN-SHIFT" : "⭐ QUANTUM SHIFT";
                else if (p.inventory === "powerup_fire_shield") puName = lang === "de" ? "⭐ INFERNOSCHILD" : "⭐ HELLFIRE SHIELD";
                else if (p.inventory === "powerup_lodestar") puName = lang === "de" ? "⭐ LEUCHTSPURSAG-DASH" : "⭐ LODESTAR DASH";
                else if (p.inventory === "powerup_frost_mourne") puName = lang === "de" ? "⭐ FROSTMOURNE-KLINGE" : "⭐ FROST MOURNE CORE";
                else if (p.inventory === "powerup_sticky_bomb") puName = lang === "de" ? "⭐ SCHLEIMBOMBE" : "⭐ STICKY SLIME BOMB";
                else if (p.inventory === "powerup_angel_wings") puName = lang === "de" ? "⭐ ENGELSFLÜGEL" : "⭐ ANGEL WINGS FLY";
                else if (p.inventory === "powerup_trickster") puName = lang === "de" ? "⭐ TRICKSTER-SWAP" : "⭐ TRICKSTER SWAP";
                else if (p.inventory === "powerup_chaos_orb") puName = lang === "de" ? "⭐ CHAOS-ORB" : "⭐ CHAOS ORB PROJ";
              } else {
                if (p.oneTimeBuild) puName = hudT.puBuild;
                else if (p.oneTimeHook) puName = hudT.puHook;
                else if (p.oneTimeDoubleJump && gameMode !== "brawler")
                  puName = hudT.puDoubleJump;
                else if (p.oneTimeTripleJump || p.tripleJumpActive)
                  puName = hudT.puTripleJump;
              }

              if (puName !== "") {
                ctx.save();
                ctx.font = '8px "Press Start 2P", monospace';
                ctx.fillStyle = "#fbbf24";
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.fillText(
                  `${hudT.powerup}: ${puName}`,
                  startX,
                  gameMode === "story" ? 44 : 75,
                );
                ctx.restore();
              }
            }
          }
        });

        ctx.textAlign = "left"; // Reset
        ctx.textBaseline = "alphabetic"; // Reset
      }

      // Draw Ping Indicator
      if (isOnline && onlinePing !== undefined) {
        ctx.save();
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = "right";
        ctx.fillStyle =
          onlinePing < 50
            ? "#4ade80"
            : onlinePing < 150
              ? "#facc15"
              : "#ef4444";
        ctx.fillText(
          `Ping: ${onlinePing}ms`,
          GAME_WIDTH - 10,
          GAME_HEIGHT - 10,
        );
        ctx.restore();
      }

      // Draw Ability Toast
      if (abilityMessageRef.current) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 100, GAME_WIDTH, 60);
        ctx.fillStyle = "#fbbf24"; // Amber
        ctx.textAlign = "center";
        ctx.font = '24px "Press Start 2P", monospace';
        ctx.fillText(abilityMessageRef.current, GAME_WIDTH / 2, 140);
        ctx.textAlign = "left"; // Reset
      }

      // Draw Slow Mo Effect (Logic only, no more overlay)
      if (slowMoTimerRef.current > 0) {
        // No more blue tint or vignette
      }

      // Draw Particles
      ctx.save();
      const pZoom = cameraZoom.current || 1.0;
      if (pZoom !== 1.0) {
        ctx.translate(GAME_WIDTH / 2, GAME_HEIGHT / 2);
        ctx.scale(pZoom, pZoom);
        const cx = (cameraRef.current.x + cameraVel.current.x * useCamAlpha) + GAME_WIDTH / 2;
        const cy = (cameraRef.current.y + cameraVel.current.y * useCamAlpha) + GAME_HEIGHT / 2;
        ctx.translate(-cx, -cy);
      } else {
        ctx.translate(finalTranslateX, finalTranslateY);
      }

      particles.current.forEach((p) => {
        if (p.isDeathAnim) {
          const anim = p.type;
          const CX = p.x;
          const CY = p.y;
          const scale = 1;
          const P_SIZE = 20 * scale;
          const progress = (1 - p.life) * 30; // 0 to 30

          ctx.globalAlpha = 1.0;

          if (anim === "normal") {
            ctx.fillStyle = "red";
            for (let i = 0; i < 10; i++) {
              const r = 5 * scale;
              ctx.beginPath();
              ctx.arc(
                CX + (Math.cos(i) * r * progress) / 10,
                CY + (Math.sin(i) * r * progress) / 10 - 5 * scale,
                2 * scale,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            }
          } else if (anim === "blood") {
            ctx.fillStyle = "#aa0000";
            const baseAngle = -Math.PI / 3; // up-right
            for (let i = 0; i < 15; i++) {
              // simple pseudo randomness based on index
              const angleOffset = Math.sin(i * 12.34) * 0.5;
              const speedMult = 0.5 + Math.abs(Math.cos(i * 43.21)) * 1.5;
              const dist = progress * 1.5 * speedMult * scale;
              const gravity = progress * progress * 0.1 * scale;

              ctx.beginPath();
              ctx.arc(
                CX + Math.cos(baseAngle + angleOffset) * dist,
                CY +
                  Math.sin(baseAngle + angleOffset) * dist +
                  gravity -
                  5 * scale,
                (1.5 + Math.abs(Math.sin(i)) * 1.5) * scale,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            }
          } else if (anim === "confetti") {
            for (let i = 0; i < 10; i++) {
              ctx.fillStyle = `hsl(${i * 40}, 80%, 60%)`;
              ctx.fillRect(
                CX + (Math.cos(i) * 10 * scale * progress) / 10,
                CY + (Math.sin(i) * 10 * scale * progress) / 10 - 5 * scale,
                3 * scale,
                3 * scale,
              );
            }
          } else if (anim === "firework") {
            ctx.fillStyle = "yellow";
            ctx.shadowBlur = 10 * scale;
            ctx.shadowColor = "yellow";
            for (let i = 0; i < 8; i++) {
              ctx.beginPath();
              ctx.arc(
                CX + (Math.cos((i * Math.PI) / 4) * 12 * scale * progress) / 10,
                CY +
                  (Math.sin((i * Math.PI) / 4) * 12 * scale * progress) / 10 -
                  5 * scale,
                1.5 * scale,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            }
            ctx.shadowBlur = 0;
          } else if (anim === "dust") {
            ctx.fillStyle = "#aaa";
            for (let i = 0; i < 6; i++) {
              ctx.beginPath();
              ctx.arc(
                CX + (i - 3) * 4 * scale,
                CY - 5 * scale - progress * scale,
                3 * scale,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            }
          } else if (anim === "electric") {
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 2 * scale;
            for (let i = 0; i < 5; i++) {
              ctx.beginPath();
              ctx.moveTo(
                CX + (Math.random() - 0.5) * 20 * scale,
                CY + (Math.random() - 0.5) * 20 * scale - 5 * scale,
              );
              ctx.lineTo(
                CX + (Math.random() - 0.5) * 20 * scale,
                CY + (Math.random() - 0.5) * 20 * scale - 5 * scale,
              );
              ctx.stroke();
            }
          } else if (anim === "ghost") {
            ctx.fillStyle = "rgba(255, 255, 255, " + (1 - progress / 30) + ")";
            ctx.fillRect(
              CX - P_SIZE / 2,
              CY - P_SIZE / 2 - progress * scale,
              P_SIZE,
              P_SIZE,
            );
          } else if (anim === "freeze") {
            ctx.fillStyle = "#88ccff";
            for (let i = 0; i < 8; i++) {
              const rot = (i * Math.PI) / 4;
              ctx.save();
              ctx.translate(CX, CY - 5 * scale);
              ctx.rotate(rot);
              ctx.fillRect(
                (5 * scale * progress) / 10,
                -1 * scale,
                5 * scale,
                2 * scale,
              );
              ctx.restore();
            }
          } else if (anim === "blackhole") {
            ctx.fillStyle = "black";
            ctx.strokeStyle = "purple";
            ctx.lineWidth = 2 * scale;
            const radius = Math.max(0, 15 * scale - progress * scale);
            ctx.beginPath();
            ctx.arc(CX, CY - 5 * scale, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (anim === "bubble") {
            ctx.strokeStyle = "rgba(100, 200, 255, 0.8)";
            ctx.lineWidth = 1 * scale;
            for (let i = 0; i < 5; i++) {
              ctx.beginPath();
              ctx.arc(
                CX + Math.sin(i + progress * 0.5) * 10 * scale,
                CY - 5 * scale - (i * 5 + progress * 2) * scale,
                4 * scale,
                0,
                Math.PI * 2,
              );
              ctx.stroke();
            }
          }
          return;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        if (p.type === "dust") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "spark" || p.type === "blood") {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else if (p.type === "confetti") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.x + p.y) * 0.1); // Fake rotation
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2);
          ctx.restore();
        } else if (p.type === "firework") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = p.life * 0.5;
          ctx.fillStyle = "#ffffff";
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // coin
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          // Add a little shine
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = p.life * 0.5;
          ctx.fillRect(
            p.x - p.size / 4,
            p.y - p.size / 4,
            p.size / 2,
            p.size / 2,
          );
        }
      });
      ctx.globalAlpha = 1.0;

      ctx.restore(); // Restore back to screen space for countdown

      // Spectator Overlay (rendered clean and small at the very top edge of the screen)
      if (isSpectatingNowLocal) {
        const t = TRANSLATIONS[lang];
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, GAME_WIDTH, 48);

        ctx.fillStyle = "#22d3ee"; // Cyan
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = "center";
        ctx.shadowColor = "cyan";
        ctx.shadowBlur = 4;
        ctx.fillText(t.spectatorMode, GAME_WIDTH / 2, 16);
        ctx.shadowBlur = 0;

        const activePlayers = players.current.filter((p) => !p.finished);
        ctx.fillStyle = "white";
        if (activePlayers.length > 0) {
          const target =
            activePlayers[spectateTargetIdx % activePlayers.length];
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.fillText(
            t.watching + target.name.toUpperCase(),
            GAME_WIDTH / 2,
            30,
          );
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillText(t.switchSpectatorHint, GAME_WIDTH / 2, 40);
        } else {
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.fillText(
            lang === "de" ? "ALLE SPIELER IM ZIEL" : "ALL PLAYERS FINISHED",
            GAME_WIDTH / 2,
            30,
          );
        }
        ctx.restore();
      }

      // Draw Start Countdown Overlay
      if (startCountdown !== null && startCountdown > 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.font = '100px "Press Start 2P", monospace';
        ctx.fillStyle = "#22d3ee"; // cyan-400
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "#0891b2";
        ctx.shadowBlur = 20;
        ctx.fillText(
          startCountdown.toString(),
          GAME_WIDTH / 2,
          GAME_HEIGHT / 2,
        );
        ctx.shadowBlur = 0; // reset
      } else if (startCountdown === 0) {
        ctx.font = '100px "Press Start 2P", monospace';
        ctx.fillStyle = "#4ade80"; // green-400
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "#16a34a";
        ctx.shadowBlur = 20;
        ctx.fillText("GO!", GAME_WIDTH / 2, GAME_HEIGHT / 2);
        ctx.shadowBlur = 0; // reset
      }
    };

    const loop = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(loop);
      let frameTime = timestamp - lastTime;
      lastTime = timestamp;
      
      if (geometryDashMode) {
        frameTime *= gdSpeedMode;
      }
      
      accumulator += frameTime;
      if (accumulator > 200) accumulator = 200;
      while (accumulator >= PHYSICS_STEP) {
        if (!paused || (isOnline && isSpectating)) {
          updatePhysics();
          // Advance Ghost inside physics loop to match recording frequency
          if (
            ghostRun &&
            ghostRun.levelId === level.id &&
            ghostRun.frames &&
            ghostFrameIndex.current < ghostRun.frames.length - 1 &&
            hasStartedMoving.current
          ) {
            ghostFrameIndex.current++;
          }
        } else {
          if (status === "build_battle_playing") {
            updateCamera();
          }
        }
        accumulator -= PHYSICS_STEP;
      }
      
      if (fpsCap > 0 && timestamp - lastDrawTime.current < (1000 / fpsCap) - 1.5) {
        return;
      }
      lastDrawTime.current = timestamp;

      draw(accumulator / PHYSICS_STEP);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    level.id, // Only restart if the level ID itself changes, not the whole level object
    paused,
    respawnTrigger,
    gameMode,
    fpsCap,
    settings.resolutionScale,
    canvasWidth,
    canvasHeight,
    ghostRun,
    startCountdown,
    isSpectating,
    spectateTargetIdx,
    status,
    isOnline,
    lang,
  ]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onContextMenu={handleContextMenu}
      className={`w-full h-full bg-black shadow-2xl rounded-sm ${(level.allowedAbility === "build" || level.allowedAbility === "hook" || (players.current[0] && (players.current[0].oneTimeBuild || players.current[0].oneTimeHook))) && !paused && gameMode !== "brawler" ? "cursor-crosshair" : "cursor-default"}`}
    />
  );
};

export default React.memo(GameCanvas, (prevProps, nextProps) => {
  return (
    prevProps.level === nextProps.level &&
    prevProps.status === nextProps.status &&
    prevProps.customization === nextProps.customization &&
    prevProps.customizationP2 === nextProps.customizationP2 &&
    prevProps.settings === nextProps.settings &&
    prevProps.gdSpeedMode === nextProps.gdSpeedMode &&
    prevProps.collectedCoins.length === nextProps.collectedCoins.length &&
    prevProps.paused === nextProps.paused &&
    prevProps.geometryDashMode === nextProps.geometryDashMode &&
    prevProps.isSpectating === nextProps.isSpectating &&
    prevProps.spectateTargetId === nextProps.spectateTargetId &&
    prevProps.opponentOpacity === nextProps.opponentOpacity &&
    prevProps.levelDeaths === nextProps.levelDeaths
  );
});
