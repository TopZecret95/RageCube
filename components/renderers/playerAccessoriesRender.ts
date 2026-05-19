import { PlayerState } from "../GameCanvasTypes";

export function drawPlayerAccessories(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  w: number,
  h: number,
  p: PlayerState
) {
  ctx.save();
  if (p.gravityFlipped) {
    ctx.translate(px + w / 2, py + h / 2);
    ctx.scale(1, -1);
    ctx.translate(-(px + w / 2), -(py + h / 2));
  }

  if (p.color && p.color.toLowerCase() !== "#ffffff") {
    // Accessories
    if (p.accessory === "crown") {
      ctx.fillStyle = "gold";
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py - 10);
      ctx.lineTo(px + 5, py - 5);
      ctx.lineTo(px + 10, py - 12);
      ctx.lineTo(px + 15, py - 5);
      ctx.lineTo(px + w, py - 10);
      ctx.lineTo(px + w, py);
      ctx.fill();
    } else if (p.accessory === "horns") {
      ctx.fillStyle = "#a00";
      ctx.beginPath();
      ctx.moveTo(px + 2, py);
      ctx.lineTo(px - 2, py - 8);
      ctx.lineTo(px + 6, py);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px + w - 6, py);
      ctx.lineTo(px + w + 2, py - 8);
      ctx.lineTo(px + w - 2, py);
      ctx.fill();
    } else if (p.accessory === "headband") {
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(px, py + 2, w, 4);
      // Knots
      ctx.fillRect(px - 2, py + 3, 2, 2);
      ctx.fillRect(px + w, py + 3, 2, 2);
    } else if (p.accessory === "cowboy") {
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(px - 4, py - 4, w + 8, 4); // Brim
      ctx.fillRect(px + 2, py - 12, w - 4, 8); // Top
    } else if (p.accessory === "viking") {
      ctx.fillStyle = "#aaa";
      ctx.beginPath();
      ctx.arc(px + w / 2, py, w / 2, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "white"; // Horns
      ctx.beginPath();
      ctx.moveTo(px, py - 4);
      ctx.lineTo(px - 4, py - 10);
      ctx.lineTo(px + 2, py - 6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px + w, py - 4);
      ctx.lineTo(px + w + 4, py - 10);
      ctx.lineTo(px + w - 2, py - 6);
      ctx.fill();
    } else if (p.accessory === "halo") {
      ctx.strokeStyle = "gold";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(px + w / 2, py - 8, 8, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.accessory === "headphones") {
      ctx.fillStyle = "#333";
      ctx.fillRect(px - 2, py + 4, 4, 10);
      ctx.fillRect(px + w - 2, py + 4, 4, 10);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px + w / 2, py + 4, w / 2 + 2, Math.PI, 0);
      ctx.stroke();
    } else if (p.accessory === "tophat") {
      ctx.fillStyle = "#111";
      ctx.fillRect(px - 4, py - 4, w + 8, 4);
      ctx.fillRect(px + 2, py - 18, w - 4, 14);
      ctx.fillStyle = "#f00";
      ctx.fillRect(px + 2, py - 6, w - 4, 3);
    } else if (p.accessory === "cap") {
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(px + w / 2, py, w / 2, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(px + w / 2, py - 4, w / 2 + 6, 4);
    } else if (p.accessory === "propeller") {
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(px + w / 2, py, w / 2, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + w / 2, py - 10);
      ctx.lineTo(px + w / 2, py - 16);
      ctx.stroke();
      ctx.fillStyle = "silver";
      const propX = Math.cos(Date.now() / 50) * 8;
      ctx.fillRect(px + w / 2 - propX, py - 18, propX * 2, 2);
    } else if (p.accessory === "cat_ears") {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 6, py);
      ctx.lineTo(px, py - 8);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px + w, py);
      ctx.lineTo(px + w - 6, py);
      ctx.lineTo(px + w, py - 8);
      ctx.fill();
    } else if (p.accessory === "demon_horns") {
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(px + 2, py);
      ctx.quadraticCurveTo(px - 10, py - 15, px - 2, py - 20);
      ctx.quadraticCurveTo(px - 2, py - 10, px + 6, py);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px + w - 2, py);
      ctx.quadraticCurveTo(px + w + 10, py - 15, px + w + 2, py - 20);
      ctx.quadraticCurveTo(px + w + 2, py - 10, px + w - 6, py);
      ctx.fill();
    } else if (p.accessory === "builder_hat") {
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(px + w / 2, py, w / 2 + 2, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(px - 2, py - 2, w + 4, 3);
    } else if (p.accessory === "wizard_hat") {
      ctx.fillStyle = "#7c3aed";
      ctx.beginPath();
      ctx.moveTo(px - 4, py);
      ctx.lineTo(px + w / 2, py - 24);
      ctx.lineTo(px + w + 4, py);
      ctx.fill();
    } else if (p.accessory === "bunny_ears") {
      ctx.fillStyle = "white";
      ctx.fillRect(px + 2, py - 12, 5, 12);
      ctx.fillRect(px + w - 7, py - 12, 5, 12);
      ctx.fillStyle = "pink";
      ctx.fillRect(px + 3, py - 10, 3, 8);
      ctx.fillRect(px + w - 6, py - 10, 3, 8);
    } else if (p.accessory === "pirate_hat") {
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.moveTo(px - 6, py);
      ctx.quadraticCurveTo(px + w / 2, py - 15, px + w + 6, py);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 6px sans-serif";
      ctx.fillText("X", px + w / 2 - 3, py - 4);
    } else if (p.accessory === "party_hat") {
      ctx.fillStyle = `hsl(${(Date.now() / 10) % 360}, 70%, 60%)`;
      ctx.beginPath();
      ctx.moveTo(px + 2, py);
      ctx.lineTo(px + w / 2, py - 16);
      ctx.lineTo(px + w - 2, py);
      ctx.fill();
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(px + w / 2, py - 16, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.accessory === "sombrero") {
      ctx.fillStyle = "#eab308";
      ctx.fillRect(px - 8, py - 4, w + 16, 4);
      ctx.fillRect(px + 2, py - 12, w - 4, 8);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(px + 2, py - 6, w - 4, 2);
    } else if (p.accessory === "ushanka") {
      ctx.fillStyle = "#52525b";
      ctx.fillRect(px, py - 8, w, 8);
      ctx.fillRect(px - 2, py - 2, 4, 10);
      ctx.fillRect(px + w - 2, py - 2, 4, 10);
      ctx.fillStyle = "#3f3f46";
      ctx.fillRect(px + 2, py - 6, w - 4, 4);
    } else if (p.accessory === "fedora") {
      ctx.fillStyle = "#27272a";
      ctx.fillRect(px - 4, py - 2, w + 8, 2);
      ctx.fillRect(px + 2, py - 10, w - 4, 8);
      ctx.fillStyle = "#000";
      ctx.fillRect(px + 2, py - 4, w - 4, 2);
    } else if (p.accessory === "chef") {
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(px + 5, py - 10, 6, 0, Math.PI * 2);
      ctx.arc(px + w - 5, py - 10, 6, 0, Math.PI * 2);
      ctx.arc(px + w / 2, py - 14, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(px + 2, py - 6, w - 4, 6);
    } else if (p.accessory === "police") {
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(px, py - 8, w, 8);
      ctx.fillStyle = "#000";
      ctx.fillRect(px - 2, py - 2, w + 4, 2);
      ctx.fillStyle = "gold";
      ctx.fillRect(px + w / 2 - 2, py - 6, 4, 4);
    } else if (p.accessory === "pumpkin") {
      ctx.fillStyle = "#f97316";
      ctx.fillRect(px, py - 12, w, 12);
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(px + w / 2 - 2, py - 16, 4, 4);
      ctx.fillStyle = "#000";
      ctx.fillRect(px + 4, py - 8, 3, 3);
      ctx.fillRect(px + w - 7, py - 8, 3, 3);
      ctx.fillRect(px + 4, py - 4, w - 8, 2);
    } else if (p.accessory === "unicorn") {
      // The Rainbow Secret Hat (Unicorn)
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.moveTo(px + w / 2 - 4, py);
      ctx.lineTo(px + w / 2, py - 20);
      ctx.lineTo(px + w / 2 + 4, py);
      ctx.fill();
      // Spirals
      ctx.strokeStyle = `hsl(${(Date.now() / 2) % 360}, 100%, 70%)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + w / 2 - 2, py - 5);
      ctx.lineTo(px + w / 2 + 2, py - 5);
      ctx.moveTo(px + w / 2 - 1.5, py - 10);
      ctx.lineTo(px + w / 2 + 1.5, py - 10);
      ctx.moveTo(px + w / 2 - 1, py - 15);
      ctx.lineTo(px + w / 2 + 1, py - 15);
      ctx.stroke();
    }
  }
  ctx.restore();
}
