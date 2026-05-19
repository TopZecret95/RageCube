import { Projectile, Bomb, Explosion } from "../GameCanvasTypes";

export function drawProjectiles(
  ctx: CanvasRenderingContext2D,
  projectiles: Projectile[]
) {
  projectiles.forEach((proj) => {
    if (!proj.active) return;
    ctx.fillStyle = "#ff4500";
    ctx.beginPath();
    ctx.arc(
      proj.x + proj.w / 2,
      proj.y + proj.h / 2,
      proj.w / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

export function drawBombs(
  ctx: CanvasRenderingContext2D,
  bombs: Bomb[]
) {
  bombs.forEach((bomb) => {
    if (!bomb.active) return;
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(
      bomb.x + bomb.w / 2,
      bomb.y + bomb.h / 2,
      bomb.w / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Fuse
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bomb.x + bomb.w / 2, bomb.y);
    ctx.lineTo(bomb.x + bomb.w / 2, bomb.y - 5);
    ctx.stroke();
    // Spark
    if (Math.random() > 0.5) {
      ctx.fillStyle = "#ff0";
      ctx.fillRect(bomb.x + bomb.w / 2 - 2, bomb.y - 7, 4, 4);
    }
  });
}

export function drawExplosions(
  ctx: CanvasRenderingContext2D,
  explosions: Explosion[]
) {
  explosions.forEach((exp) => {
    const alpha = exp.timer / exp.maxTimer;
    ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y, exp.radius * (1 - alpha * 0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.stroke();
  });
}
