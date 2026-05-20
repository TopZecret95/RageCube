
import { Vector2, LevelData, Entity, EntityType, GameSettings } from '../types';
import { PlayerState, TempBlock, Projectile, Bomb, Explosion } from '../../components/GameCanvasTypes';

export const GRAVITY = 0.6;
export const MOVE_ACCEL = 0.8;
export const MAX_SPEED = 6;
export const JUMP_FORCE = -11;
export const HOOK_PULL_FORCE = 0.6;
export const SLOW_MO_FACTOR = 0.4;
export const WALL_SLIDE_SPEED = 2;
export const SLIME_WALL_SLIDE_SPEED = 0.5;
export const SLIME_JUMP_FORCE = -8;
export const WALL_JUMP_FORCE = { x: 8, y: -9 };
export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 600;

export const checkCollision = (rect1: { x: number; y: number; w: number; h: number }, rect2: { x: number; y: number; w: number; h: number }) => {
  return (
    rect1.x < rect2.x + rect2.w &&
    rect1.x + rect1.w > rect2.x &&
    rect1.y < rect2.y + rect2.h &&
    rect1.y + rect1.h > rect2.y
  );
};

export const getDynamicEntity = (e: Entity, time: number, dt: number): Entity & { dx?: number, dy?: number } => {
  if (e.type === "moving_platform") {
    const period = e.period || 4000;
    const rangeX = e.rangeX || 200;
    const rangeY = e.rangeY || 0;
    const phase = (time / period) * Math.PI * 2 + (e.phase || 0);
    
    const prevPhase = ((time - 16.66) / period) * Math.PI * 2 + (e.phase || 0);
    
    const nextX = e.x + Math.sin(phase) * rangeX;
    const nextY = e.y + Math.cos(phase) * rangeY;
    
    const prevX = e.x + Math.sin(prevPhase) * rangeX;
    const prevY = e.y + Math.cos(prevPhase) * rangeY;
    
    return {
      ...e,
      x: nextX,
      y: nextY,
      dx: (nextX - prevX),
      dy: (nextY - prevY)
    };
  }
  return e;
};

export interface PhysicsState {
    players: PlayerState[];
    level: LevelData;
    tempBlocks: TempBlock[];
    projectiles: Projectile[];
    bombs: Bomb[];
    explosions: Explosion[];
    gameTime: number;
    timeScale: number;
    gameMode: string;
    settings: GameSettings;
}

// More comprehensive physics functions will go here...
export const updatePlayerPhysics = (p: PlayerState, entities: Entity[], dt: number) => {
  if (p.finished) return;

  const currentMaxSpeed = MAX_SPEED;
  const currentAccel = MOVE_ACCEL;
  
  // X Movement
  if (p.keys.left) p.vel.x -= currentAccel;
  if (p.keys.right) p.vel.x += currentAccel;
  
  // Friction
  if (!p.keys.left && !p.keys.right) {
    p.vel.x *= 0.8;
  } else {
    p.vel.x *= 0.9;
  }
  
  // Cap speed
  if (p.vel.x > currentMaxSpeed) p.vel.x = currentMaxSpeed;
  if (p.vel.x < -currentMaxSpeed) p.vel.x = -currentMaxSpeed;
  
  // Gravity
  p.vel.y += GRAVITY;
  
  // Update positions
  p.pos.x += p.vel.x;
  p.pos.y += p.vel.y;
  
  // Simple World Collision (Floor)
  if (p.pos.y > GAME_HEIGHT - p.h - 50) {
    p.pos.y = GAME_HEIGHT - p.h - 50;
    p.vel.y = 0;
    p.onGround = true;
  } else {
    p.onGround = false;
  }
  
  // Jump logic
  if (p.keys.up && p.onGround) {
    p.vel.y = JUMP_FORCE;
    p.onGround = false;
  }

  // Horizontal bounds
  if (p.pos.x < 0) p.pos.x = 0;
  if (p.pos.x > GAME_WIDTH - p.w) p.pos.x = GAME_WIDTH - p.w;
};
