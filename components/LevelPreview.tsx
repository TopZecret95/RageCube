import React, { useEffect, useRef } from 'react';
import { LevelData } from '../types';

interface LevelPreviewProps {
  level: LevelData;
  width?: number;
  height?: number;
  className?: string;
}

const LevelPreview: React.FC<LevelPreviewProps> = ({ level, width = 120, height = 80, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    if (!level.entities || level.entities.length === 0) {
        // Draw placeholder if no entities
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NO DATA', width / 2, height / 2);
        return;
    }

    // Find bounds
    let minX = level.start.x;
    let minY = level.start.y;
    let maxX = level.start.x;
    let maxY = level.start.y;

    level.entities.forEach(e => {
      minX = Math.min(minX, e.x);
      minY = Math.min(minY, e.y);
      maxX = Math.max(maxX, e.x + e.w);
      maxY = Math.max(maxY, e.y + e.h);
    });

    if (level.startP2) {
        minX = Math.min(minX, level.startP2.x);
        minY = Math.min(minY, level.startP2.y);
        maxX = Math.max(maxX, level.startP2.x);
        maxY = Math.max(maxY, level.startP2.y);
    }

    // Add some padding
    const padding = 40;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const levelWidth = maxX - minX;
    const levelHeight = maxY - minY;

    const scale = Math.min(width / levelWidth, height / levelHeight);
    const offsetX = (width - levelWidth * scale) / 2 - minX * scale;
    const offsetY = (height - levelHeight * scale) / 2 - minY * scale;

    // Draw entities
    level.entities.forEach(e => {
      switch (e.type) {
        case 'wall': ctx.fillStyle = '#444'; break;
        case 'hazard': ctx.fillStyle = '#ff0044'; break;
        case 'goal': ctx.fillStyle = '#00ff88'; break;
        case 'bounce': ctx.fillStyle = '#ffaa00'; break;
        case 'coin': ctx.fillStyle = '#ffff00'; break;
        case 'ice': ctx.fillStyle = '#00ffff'; break;
        case 'slime': ctx.fillStyle = '#00ff00'; break;
        case 'trampoline': ctx.fillStyle = '#ff00ff'; break;
        case 'teleport': ctx.fillStyle = '#8800ff'; break;
        case 'checkpoint': ctx.fillStyle = '#ffffff'; break;
        case 'invisible_hazard': ctx.fillStyle = '#330011'; break;
        case 'troll_wall': ctx.fillStyle = '#222222'; break;
        case 'fake': ctx.fillStyle = '#333333'; break;
        case 'fake_goal': ctx.fillStyle = '#004422'; break;
        default: ctx.fillStyle = '#666';
      }
      ctx.fillRect(e.x * scale + offsetX, e.y * scale + offsetY, Math.max(1, e.w * scale), Math.max(1, e.h * scale));
    });

    // Draw player start
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(level.start.x * scale + offsetX, level.start.y * scale + offsetY, Math.max(2, 10 * scale), Math.max(2, 10 * scale));
    
    if (level.startP2) {
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(level.startP2.x * scale + offsetX, level.startP2.y * scale + offsetY, Math.max(2, 10 * scale), Math.max(2, 10 * scale));
    }

  }, [level, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      className={`border border-neutral-800 rounded bg-black shadow-inner image-pixelated ${className}`}
    />
  );
};

export default LevelPreview;
