import { PlayerState } from "../GameCanvasTypes";

export function drawPlayerEyes(
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

  ctx.fillStyle = "white";
  if (p.eyes === "cyclops") {
    ctx.fillRect(px + w / 2 - 4, py + 4, 8, 8);
    ctx.fillStyle = "black";
    ctx.fillRect(px + w / 2 - 1, py + 6, 2, 2);
  } else if (p.eyes === "anime") {
    ctx.fillRect(px + 1, py + 3, 6, 8);
    ctx.fillRect(px + w - 7, py + 3, 6, 8);
    ctx.fillStyle = "black";
    ctx.fillRect(px + 2, py + 4, 2, 4);
    ctx.fillRect(px + w - 6, py + 4, 2, 4);
  } else if (p.eyes === "dead") {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 2, py + 4);
    ctx.lineTo(px + 6, py + 8);
    ctx.moveTo(px + 6, py + 4);
    ctx.lineTo(px + 2, py + 8);
    ctx.moveTo(px + w - 6, py + 4);
    ctx.lineTo(px + w - 2, py + 8);
    ctx.moveTo(px + w - 2, py + 4);
    ctx.lineTo(px + w - 6, py + 8);
    ctx.stroke();
  } else if (p.eyes === "sunglasses") {
    ctx.fillStyle = "black";
    ctx.fillRect(px, py + 4, w, 4);
  } else if (p.eyes === "alien") {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.ellipse(px + 4, py + 5, 3, 5, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + w - 4, py + 5, 3, 5, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.eyes === "cyborg") {
    ctx.fillStyle = "white";
    ctx.fillRect(px + 4, py + 4, 4, 4);
    ctx.fillStyle = "red";
    ctx.fillRect(px + w - 8, py + 4, 4, 4);
    ctx.fillStyle = "darkred";
    ctx.fillRect(px + w - 7, py + 5, 2, 2);
  } else if (
    p.eyes === "stars" ||
    p.eyes === "hearts" ||
    p.eyes === "hypno"
  ) {
    ctx.fillStyle =
      p.eyes === "stars" ? "yellow" : p.eyes === "hearts" ? "red" : "magenta";
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const sym =
      p.eyes === "stars" ? "★" : p.eyes === "hearts" ? "♥" : "🌀";
    ctx.fillText(sym, px + 6, py + 6);
    ctx.fillText(sym, px + w - 6, py + 6);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  } else if (p.eyes === "googly") {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(px + 6, py + 6, 4, 0, Math.PI * 2);
    ctx.arc(px + w - 6, py + 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.beginPath();
    const ox = Math.sin(Date.now() / 100) * 1.5;
    const oy = Math.cos(Date.now() / 100) * 1.5;
    ctx.arc(px + 6 + ox, py + 6 + oy, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    const ox2 = Math.sin(Date.now() / 150) * 1.5;
    const oy2 = Math.cos(Date.now() / 150) * 1.5;
    ctx.arc(px + w - 6 + ox2, py + 6 + oy2, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.eyes === "pirate") {
    ctx.fillRect(px + 4, py + 4, 4, 4);
    ctx.fillStyle = "black";
    ctx.fillRect(px + w - 10, py + 2, 8, 8);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py + 2);
    ctx.lineTo(px + w, py + 10);
    ctx.stroke();
  } else if (p.eyes === "rich") {
    ctx.fillStyle = "#22c55e";
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.textAlign = "center";
    ctx.fillText("$", px + 6, py + 11);
    ctx.fillText("$", px + w - 6, py + 11);
    ctx.textAlign = "left";
  } else if (p.eyes === "glowing" || p.eyes === "laser") {
    ctx.fillStyle = p.eyes === "laser" ? "#ff0000" : "#00ffff";
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillRect(px + 4, py + 4, 4, 4);
    ctx.fillRect(px + w - 8, py + 4, 4, 4);
    ctx.shadowBlur = 0;
  } else if (p.eyes === "ninja") {
    ctx.fillStyle = "#111";
    ctx.fillRect(px, py + 2, w, 10);
    ctx.fillStyle = "white";
    ctx.fillRect(px + 2, py + 4, 6, 6);
    ctx.fillRect(px + w - 8, py + 4, 6, 6);
    ctx.fillStyle = "black";
    ctx.fillRect(px + 4, py + 6, 2, 2);
    ctx.fillRect(px + w - 6, py + 6, 2, 2);
  } else if (p.eyes === "tired") {
    ctx.fillStyle = "#aaa";
    ctx.fillRect(px + 4, py + 4, 4, 4);
    ctx.fillRect(px + w - 8, py + 4, 4, 4);
    ctx.fillStyle = "#444";
    ctx.fillRect(px + 2, py + 8, 8, 2);
    ctx.fillRect(px + w - 10, py + 8, 8, 2);
  } else if (p.eyes === "kawaii") {
    ctx.fillStyle = "white";
    ctx.fillRect(px + 1, py + 3, 6, 8);
    ctx.fillRect(px + w - 7, py + 3, 6, 8);
    ctx.fillStyle = "pink";
    ctx.fillRect(px + 2, py + 5, 2, 2);
    ctx.fillRect(px + w - 4, py + 5, 2, 2);
  } else if (p.eyes === "monocle") {
    ctx.fillRect(px + 4, py + 4, 4, 4);
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + w - 10, py + 2, 8, 8);
    ctx.beginPath();
    ctx.moveTo(px + w - 2, py + 10);
    ctx.lineTo(px + w + 4, py + 14);
    ctx.stroke();
  } else if (p.eyes === "void_eyes") {
    ctx.fillStyle = "#000";
    ctx.fillRect(px + 2, py + 2, w - 4, 8);
    ctx.fillStyle = "#fff";
    ctx.fillRect(px + 5, py + 4, 2, 2);
    ctx.fillRect(px + w - 7, py + 4, 2, 2);
  } else if (p.eyes === "evil") {
    const evilPulse = 10 + Math.sin(Date.now() / 150) * 5;
    ctx.fillStyle = "#ff0000";
    ctx.shadowBlur = evilPulse;
    ctx.shadowColor = "#ff0000";
    // Left eye
    ctx.beginPath();
    ctx.moveTo(px + 3, py + 3);
    ctx.lineTo(px + 9, py + 6);
    ctx.lineTo(px + 8, py + 9);
    ctx.lineTo(px + 2, py + 6);
    ctx.closePath();
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.moveTo(px + w - 3, py + 3);
    ctx.lineTo(px + w - 9, py + 6);
    ctx.lineTo(px + w - 8, py + 9);
    ctx.lineTo(px + w - 2, py + 6);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Pupils
    ctx.fillStyle = "black";
    ctx.fillRect(px + 5, py + 6, 2, 2);
    ctx.fillRect(px + w - 7, py + 6, 2, 2);
  } else if (p.eyes === "masked") {
    ctx.fillStyle = "#333";
    ctx.fillRect(px - 2, py + 2, w + 4, 8);
    ctx.fillStyle = "white";
    ctx.fillRect(px + 2, py + 4, 6, 4);
    ctx.fillRect(px + w - 8, py + 4, 6, 4);
  } else {
    let ly = 4, ry = 4;
    if (p.eyes === "derp") ry = 8;
    ctx.fillRect(px + 4, py + ly, 4, 4);
    ctx.fillRect(px + w - 8, py + ry, 4, 4);
    if (p.eyes === "angry") {
      ctx.fillStyle =
        p.slowTimer > 0 && Math.floor(Date.now() / 150) % 2 === 0
          ? "#00ffff"
          : p.color || "#ffffff";
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + w, py + 6);
      ctx.lineTo(px + w, py);
      ctx.fill();
    }
  }
  ctx.restore();
}
