import { LevelData, Entity, EntityType, Vector2, LevelAbility } from "../types";

const ENTITY_TYPE_MAP: EntityType[] = [
  'wall', 'hazard', 'goal', 'fake', 'bounce', 'coin', 'fake_goal', 'invisible_hazard', 
  'troll_wall', 'ice', 'trampoline', 'slime', 'teleport', 'powerup_build', 'powerup_hook', 
  'powerup_double_jump', 'checkpoint', 'powerup_remover', 'walkthrough_wall', 'ghost_hazard', 
  'powerup_slow_mo', 'powerup_xray', 'fake_ice', 'fake_slime', 'powerup_ice_block', 
  'powerup_slime_block', 'powerup_fireball', 'powerup_teleport', 'powerup_triple_jump', 
  'powerup_bomb', 'powerup_shield', 'powerup_steal', 'powerup_slow', 'powerup_melee', 
  'powerup_shrink', 'powerup_grow', 'powerup_dash', 'powerup_spawner', 'moving_platform_h', 
  'moving_platform_v', 'fragile', 'gravity_reverse', 'gravity_zero', 'block_dash', 
  'block_shrink', 'block_grow', 'block_gravity'
];

const ABILITY_MAP: LevelAbility[] = ['none', 'build', 'double_jump', 'hook'];

/**
 * Compact format for Entity:
 * [typeIndex, x, y, w, h, flags, moveRange, moveSpeed, id, opacity]
 * flags bitmask:
 * 1: movingH
 * 2: movingV
 * 4: fragile
 * 8: shake
 */
export const compressLevel = (level: LevelData): string => {
  const entities = level.entities.map(e => {
    const typeIdx = ENTITY_TYPE_MAP.indexOf(e.type);
    let flags = 0;
    if (e.movingH) flags |= 1;
    if (e.movingV) flags |= 2;
    if (e.fragile) flags |= 4;
    if (e.shake) flags |= 8;

    const arr: any[] = [typeIdx, Math.round(e.x), Math.round(e.y), Math.round(e.w), Math.round(e.h)];
    
    if (flags > 0 || e.moveRange !== undefined || e.moveSpeed !== undefined || e.id || e.opacity !== undefined) {
      arr.push(flags);
      arr.push(e.moveRange ?? 100);
      arr.push(e.moveSpeed !== undefined ? Math.round(e.moveSpeed * 10000) : 20); // Scale float to int
      arr.push(e.id || "");
      arr.push(e.opacity !== undefined ? Math.round(e.opacity * 100) : 100);
    }

    return arr;
  });

  const compactData = {
    v: 1, // version
    n: level.name,
    s: [Math.round(level.start.x), Math.round(level.start.y)],
    s2: level.startP2 ? [Math.round(level.startP2.x), Math.round(level.startP2.y)] : undefined,
    dim: [level.width || 960, level.height || 540],
    e: entities,
    m: level.message,
    a: ABILITY_MAP.indexOf(level.allowedAbility || 'none'),
    sc: level.autoScroll ? 1 : 0,
    ss: level.autoScrollSpeed || 150,
    ib: level.isBrawler ? 1 : 0
  };

  return JSON.stringify(compactData);
};

const mapSingleLevel = (data: any): LevelData => {
  // Check if it's already a standard LevelData
  if (data.entities && Array.isArray(data.entities)) {
    return data as LevelData;
  }

  // Decompress from compact format
  const entities: Entity[] = (data.e || []).map((arr: any[]) => {
    const [typeIdx, x, y, w, h, flags, mr, ms, id, op] = arr;
    
    const e: Entity = {
      type: ENTITY_TYPE_MAP[typeIdx] || 'wall',
      x: x,
      y: y,
      w: w,
      h: h
    };

    if (flags !== undefined) {
      if (flags & 1) e.movingH = true;
      if (flags & 2) e.movingV = true;
      if (flags & 4) e.fragile = true;
      if (flags & 8) e.shake = true;
    }
    if (mr !== undefined) e.moveRange = mr;
    if (ms !== undefined) e.moveSpeed = ms / 10000;
    if (id) e.id = id;
    if (op !== undefined) e.opacity = op / 100;

    return e;
  });

  return {
    id: data.id || `decompressed_${Date.now()}_${Math.random()}`,
    name: data.n || data.name || "Imported Level",
    start: { x: (data.s?.[0] ?? data.start?.x ?? 50), y: (data.s?.[1] ?? data.start?.y ?? 450) },
    startP2: data.s2 ? { x: data.s2[0], y: data.s2[1] } : (data.startP2 ? data.startP2 : undefined),
    width: data.dim?.[0] || data.width || 960,
    height: data.dim?.[1] || data.height || 540,
    entities,
    message: data.m || data.message,
    allowedAbility: data.a !== undefined ? ABILITY_MAP[data.a] : (data.allowedAbility || 'none'),
    autoScroll: data.sc === 1 || !!data.autoScroll,
    autoScrollSpeed: data.ss || data.autoScrollSpeed || 150,
    isBrawler: data.ib === 1 || !!data.isBrawler
  };
};

export const decompressLevel = (compressedJson: string): LevelData | LevelData[] => {
  const data = JSON.parse(compressedJson);
  
  if (Array.isArray(data)) {
    return data.map(item => mapSingleLevel(item));
  }
  
  return mapSingleLevel(data);
};
