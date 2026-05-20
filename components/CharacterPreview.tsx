
import React, { useEffect, useRef } from "react";
import { PlayerCustomization } from "../types";

export const CharacterPreview = React.memo(
  ({
    customization,
    scale = 4,
  }: {
    customization: PlayerCustomization;
    scale?: number;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const triggerDeathRef = useRef<boolean>(false);
    const isVisibleRef = useRef<boolean>(true);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const observer = new IntersectionObserver(
        (entries) => {
          isVisibleRef.current = entries[0].isIntersecting;
        },
        { threshold: 0 }
      );
      observer.observe(canvas);

      const animationStartTime = Date.now();
      let animationId: number;
      let deathStartTime = 0;
      let lastRender = 0;

      const render = () => {
        animationId = requestAnimationFrame(render);
        if (!isVisibleRef.current) return;
        const now = Date.now();
        if (now - lastRender < 16) return; // Smooth 60 FPS preview
        lastRender = now;

        const frame = (now - animationStartTime) / 16.666; // Normalize to equivalent of 60 FPS for existing formulas
        
        // Clear background
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const CX = canvas.width / 2;
        const CY = canvas.height * 0.65;
        const P_SIZE = 20 * scale;

        if (triggerDeathRef.current) {
            triggerDeathRef.current = false;
            deathStartTime = now;
        }

        // Draw deathAnim preview
        const deathElapsed = now - deathStartTime;
        const isDying = deathElapsed <= 500 && deathStartTime > 0;
        if (isDying) {
          ctx.globalAlpha = 1.0;
          const anim = customization.deathAnim || "normal";
          const progress = (deathElapsed / 500) * 30;
          
          if (anim === "normal") {
             ctx.fillStyle = "red";
             for(let i=0; i<10; i++) {
                const r = 5 * scale;
                ctx.beginPath();
                ctx.arc(CX + Math.cos(i) * r * progress/10, CY + Math.sin(i) * r * progress/10 - 5 * scale, 2*scale, 0, Math.PI*2);
                ctx.fill();
             }
          } else if (anim === "blood") {
             ctx.fillStyle = "#aa0000";
             const baseAngle = -Math.PI / 3; // up-right
             for(let i=0; i<15; i++) {
                const angleOffset = Math.sin(i * 12.34) * 0.5;
                const speedMult = 0.5 + Math.abs(Math.cos(i * 43.21)) * 1.5;
                const dist = progress * 1.5 * speedMult * scale;
                const gravity = (progress * progress) * 0.1 * scale;

                ctx.beginPath();
                ctx.arc(
                  CX + Math.cos(baseAngle + angleOffset) * dist,
                  CY + Math.sin(baseAngle + angleOffset) * dist + gravity - 5 * scale,
                  (1.5 + Math.abs(Math.sin(i)) * 1.5) * scale,
                  0,
                  Math.PI*2
                );
                ctx.fill();
             }
          } else if (anim === "confetti") {
             for(let i=0; i<10; i++) {
                ctx.fillStyle = `hsl(${i * 40}, 80%, 60%)`;
                ctx.fillRect(CX + Math.cos(i) * 10 * scale * progress/10, CY + Math.sin(i) * 10 * scale * progress/10 - 5 * scale, 3*scale, 3*scale);
             }
          } else if (anim === "firework") {
            ctx.fillStyle = "yellow";
            if (scale > 2) {
              ctx.shadowBlur = 10 * scale;
              ctx.shadowColor = "yellow";
            }
            for(let i=0; i<8; i++) {
               ctx.beginPath();
               ctx.arc(CX + Math.cos(i*Math.PI/4) * 12 * scale * progress/10, CY + Math.sin(i*Math.PI/4) * 12 * scale * progress/10 - 5 * scale, 1.5*scale, 0, Math.PI*2);
               ctx.fill();
            }
            ctx.shadowBlur = 0;
          } else if (anim === "dust") {
            ctx.fillStyle = "#aaa";
            for(let i=0; i<6; i++) {
               ctx.beginPath();
               ctx.arc(CX + (i-3) * 4 * scale, CY - 5 * scale - progress * scale, 3*scale, 0, Math.PI*2);
               ctx.fill();
            }
          } else if (anim === "electric") {
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 2 * scale;
            for(let i=0; i<5; i++) {
               ctx.beginPath();
               ctx.moveTo(CX + (Math.random()-0.5)*20*scale, CY + (Math.random()-0.5)*20*scale - 5*scale);
               ctx.lineTo(CX + (Math.random()-0.5)*20*scale, CY + (Math.random()-0.5)*20*scale - 5*scale);
               ctx.stroke();
            }
          } else if (anim === "ghost") {
            ctx.fillStyle = "rgba(255, 255, 255, " + (1 - progress / 30) + ")";
            ctx.fillRect(CX - P_SIZE/2, CY - P_SIZE/2 - progress * scale, P_SIZE, P_SIZE);
          } else if (anim === "freeze") {
            ctx.fillStyle = "#88ccff";
            for(let i=0; i<8; i++) {
               const rot = (i * Math.PI) / 4;
               ctx.save();
               ctx.translate(CX, CY - 5*scale);
               ctx.rotate(rot);
               ctx.fillRect(5 * scale * progress/10, -1*scale, 5*scale, 2*scale);
               ctx.restore();
            }
          } else if (anim === "blackhole") {
            ctx.fillStyle = "black";
            ctx.strokeStyle = "purple";
            ctx.lineWidth = 2 * scale;
            const radius = Math.max(0, 15 * scale - progress * scale);
            ctx.beginPath();
            ctx.arc(CX, CY - 5*scale, radius, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
          } else if (anim === "bubble") {
            ctx.strokeStyle = "rgba(100, 200, 255, 0.8)";
            ctx.lineWidth = 1 * scale;
            for(let i=0; i<5; i++) {
               ctx.beginPath();
               ctx.arc(CX + Math.sin(i+frame/5)*10*scale, CY - 5*scale - (i*5 + progress*2)*scale, 4*scale, 0, Math.PI*2);
               ctx.stroke();
            }
          }
          
          return;
        }

        // Draw Trail (with alpha fading)
        for (let i = 2; i >= 0; i--) {
          if (customization.color.toLowerCase() === "#ffffff") {
            continue; // No trail for ghost mode
          }
          if (customization.color === "#130009") {
             ctx.fillStyle = (Math.floor(now / 100) + i) % 2 === 0 ? "#ffff00" : "#000000";
          } else if (customization.trailColor === "rainbow") {
            ctx.fillStyle = `hsl(${frame * 5 + i * 40}, 100%, 50%)`;
          } else {
            ctx.fillStyle = customization.trailColor;
          }
          ctx.globalAlpha = 0.3 - i * 0.1;
          const offset = (i + 1) * 2 * scale;
          const size = P_SIZE - i * 1 * scale;
          
          const trailBounceOffset = Math.sin((now - (i + 1) * 60) / 200) * 5 * scale;
          ctx.save();
          ctx.translate(0, trailBounceOffset);
          
          if (customization.trailType === "stardust") {
            ctx.beginPath();
            ctx.arc(CX - offset, CY, size / 2, 0, Math.PI * 2);
            ctx.fill();
            if (frame % 10 === 0) {
              ctx.fillStyle = "white";
              ctx.fillRect(CX - offset + (Math.random()*10 - 5), CY + (Math.random()*10 - 5), 2*scale, 2*scale);
            }
          } else if (customization.trailType === "pixel-fire") {
            ctx.fillRect(CX - offset - size/2, CY - size/2 - (5 - i) * scale, size, size);
            ctx.fillStyle = "#ffaa00";
            ctx.globalAlpha *= 0.8;
            ctx.fillRect(CX - offset - size/4, CY - size/4 - (8 - i) * scale, size/2, size/2);
          } else if (customization.trailType === "slime") {
            ctx.beginPath();
            ctx.arc(CX - offset, CY + (5 - i) * scale, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(CX - offset - 4*scale, CY + (8 - i) * scale, size/3, 0, Math.PI*2);
            ctx.fill();
          } else if (customization.trailType === "rainbow-pulse") {
            ctx.fillStyle = `hsl(${(frame * 10 + i * 60) % 360}, 80%, 60%)`;
            ctx.globalAlpha = 0.4;
            ctx.fillRect(CX - offset - size/2, CY - size/2, size, size);
          } else if (customization.trailType === "ghostly") {
            ctx.fillStyle = "white";
            ctx.globalAlpha = (0.2 - i * 0.05) * Math.sin(frame/5);
            ctx.beginPath();
            ctx.moveTo(CX - offset - size/2, CY - size/2);
            ctx.lineTo(CX - offset + size/2, CY - size/2);
            ctx.lineTo(CX - offset, CY + size);
            ctx.fill();
          } else if (customization.trailType === "bubble-trail") {
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.arc(CX - offset, CY + Math.sin(frame/10 + i)*5*scale, size/4, 0, Math.PI*2);
            ctx.stroke();
          } else if (customization.trailType === "spark-trail") {
            ctx.fillStyle = "#ffff00";
            if (frame % 5 === 0) {
              ctx.fillRect(CX - offset + (Math.random()-0.5)*10*scale, CY + (Math.random()-0.5)*10*scale, 2*scale, 2*scale);
            }
          } else if (customization.trailType === "shadow-trail") {
            ctx.fillStyle = "black";
            ctx.globalAlpha = 0.5 - i * 0.1;
            ctx.fillRect(CX - offset - (size+4*scale)/2, CY - (size+4*scale)/2, size+4*scale, size+4*scale);
          } else if (customization.trailType === "neon-trail") {
            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 2*scale;
            if (scale > 2) {
              ctx.shadowBlur = 5*scale;
              ctx.shadowColor = "#00ff00";
            }
            ctx.strokeRect(CX - offset - size/2, CY - size/2, size, size);
            ctx.shadowBlur = 0;
          } else if (customization.trailType === "matrix_trail") {
            ctx.fillStyle = "#00ff00";
            ctx.font = `${8 * scale}px monospace`;
            ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), CX - offset, CY);
          } else {
            ctx.fillRect(CX - size / 2 - offset, CY - size / 2, size, size);
          }
          ctx.restore();
        }
        ctx.globalAlpha = 1.0;

        // Draw Player Body
        // Animation factors for dancing
        const bounceOffset = Math.sin(now / 200) * 5 * scale;
        const scaleFactor = 1 + Math.sin(now / 150) * 0.05;
        
        ctx.save();
        ctx.translate(CX, CY);
        ctx.scale(scaleFactor, scaleFactor);
        ctx.translate(-CX, -CY);

        const px = CX - P_SIZE / 2;
        const py = CY - P_SIZE / 2 + bounceOffset;
        const w = P_SIZE;

        if (customization.color.toLowerCase() === "#ffffff") {
          ctx.fillStyle = "rgba(0,0,0,0)";
        } else if (customization.color === "#130009") {
          const time = now / 500;
          const grad = ctx.createLinearGradient(
            px + Math.cos(time) * w,
            py + Math.sin(time) * w,
            px + w + Math.cos(time + Math.PI) * w,
            py + w + Math.sin(time + Math.PI) * w
          );
          grad.addColorStop(0, "#ffff00");
          grad.addColorStop(0.5, "#000000");
          grad.addColorStop(1, "#ffff00");
          ctx.fillStyle = grad;
        } else if (customization.color.toLowerCase() === "#ff0080") {
          ctx.fillStyle = `hsl(${frame * 2 % 360}, 100%, 50%)`;
        } else {
          ctx.fillStyle = customization.color;
        }
        ctx.fillRect(px, py, w, w);

        // Draw Eyes
        ctx.fillStyle = "white";
        const eyes = customization.eyes;
        switch (eyes) {
          case "cyclops":
            ctx.fillRect(px + w / 2 - 4 * scale, py + 4 * scale, 8 * scale, 8 * scale);
            ctx.fillStyle = "black";
            ctx.fillRect(px + w / 2 - 1 * scale, py + 6 * scale, 2 * scale, 2 * scale);
            break;
          case "anime":
            ctx.fillRect(px + 1 * scale, py + 3 * scale, 6 * scale, 8 * scale);
            ctx.fillRect(px + w - 7 * scale, py + 3 * scale, 6 * scale, 8 * scale);
            ctx.fillStyle = "black";
            ctx.fillRect(px + 2 * scale, py + 4 * scale, 3 * scale, 4 * scale);
            ctx.fillRect(px + w - 5 * scale, py + 4 * scale, 3 * scale, 4 * scale);
            break;
          case "dead":
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(px + 2 * scale, py + 4 * scale); ctx.lineTo(px + 6 * scale, py + 8 * scale);
            ctx.moveTo(px + 6 * scale, py + 4 * scale); ctx.lineTo(px + 2 * scale, py + 8 * scale);
            ctx.moveTo(px + w - 6 * scale, py + 4 * scale); ctx.lineTo(px + w - 2 * scale, py + 8 * scale);
            ctx.moveTo(px + w - 2 * scale, py + 4 * scale); ctx.lineTo(px + w - 6 * scale, py + 8 * scale);
            ctx.stroke();
            break;
          case "sunglasses":
            ctx.fillStyle = "black";
            ctx.fillRect(px, py + 4 * scale, w, 4 * scale);
            break;
          case "alien":
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.ellipse(px + 6 * scale, py + 6 * scale, 4 * scale, 7 * scale, -Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(px + w - 6 * scale, py + 6 * scale, 4 * scale, 7 * scale, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "cyborg":
            ctx.fillStyle = "white";
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillStyle = "red";
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            break;
          case "stars":
          case "hearts":
          case "hypno":
            ctx.fillStyle = eyes === "stars" ? "yellow" : eyes === "hearts" ? "red" : "magenta";
            ctx.font = `${10 * scale}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const sym = eyes === "stars" ? "★" : eyes === "hearts" ? "♥" : "🌀";
            ctx.fillText(sym, px + 5 * scale, py + 6 * scale);
            ctx.fillText(sym, px + w - 5 * scale, py + 6 * scale);
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
            break;
          case "googly":
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(px + 6 * scale, py + 6 * scale, 4 * scale, 0, Math.PI * 2);
            ctx.arc(px + w - 6 * scale, py + 6 * scale, 4 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.beginPath();
            const ox = Math.sin(frame / 10) * 1.5 * scale;
            const oy = Math.cos(frame / 10) * 1.5 * scale;
            ctx.arc(px + 6 * scale + ox, py + 6 * scale + oy, 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + w - 6 * scale - ox, py + 6 * scale + oy, 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "void_eyes":
            ctx.fillStyle = "#000";
            ctx.fillRect(px + 2 * scale, py + 2 * scale, w - 4 * scale, 8 * scale);
            ctx.fillStyle = "#fff";
            ctx.fillRect(px + 5 * scale, py + 4 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w - 7 * scale, py + 4 * scale, 2 * scale, 2 * scale);
            break;
          case "pirate":
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillStyle = "black";
            ctx.fillRect(px + w - 10 * scale, py + 2 * scale, 8 * scale, 8 * scale);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1 * scale;
            ctx.beginPath(); ctx.moveTo(px, py + 2 * scale); ctx.lineTo(px + w, py + 10 * scale); ctx.stroke();
            break;
          case "rich":
            ctx.fillStyle = "#22c55e";
            ctx.font = `${12 * scale}px Arial`;
            ctx.textAlign = "center";
            ctx.fillText("$", px + 6 * scale, py + 11 * scale);
            ctx.fillText("$", px + w - 6 * scale, py + 11 * scale);
            ctx.textAlign = "left";
            break;
          case "glowing":
          case "laser":
            ctx.fillStyle = eyes === "laser" ? "#ff0000" : "#00ffff";
            if (scale > 2) {
              ctx.shadowBlur = 10 * scale;
              ctx.shadowColor = ctx.fillStyle;
            }
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.shadowBlur = 0;
            break;
          case "ninja":
            ctx.fillStyle = "#111";
            ctx.fillRect(px, py + 2 * scale, w, 10 * scale);
            ctx.fillStyle = "white";
            ctx.fillRect(px + 2 * scale, py + 4 * scale, 6 * scale, 6 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 6 * scale, 6 * scale);
            ctx.fillStyle = "black";
            ctx.fillRect(px + 4 * scale, py + 6 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w - 6 * scale, py + 6 * scale, 2 * scale, 2 * scale);
            break;
          case "tired":
            ctx.fillStyle = "#aaa";
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillStyle = "#444";
            ctx.fillRect(px + 2 * scale, py + 8 * scale, 8 * scale, 2 * scale);
            ctx.fillRect(px + w - 10 * scale, py + 8 * scale, 8 * scale, 2 * scale);
            break;
          case "kawaii":
            ctx.fillStyle = "white";
            ctx.fillRect(px + 1 * scale, py + 3 * scale, 6 * scale, 8 * scale);
            ctx.fillRect(px + w - 7 * scale, py + 3 * scale, 6 * scale, 8 * scale);
            ctx.fillStyle = "pink";
            ctx.fillRect(px + 2 * scale, py + 5 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w - 4 * scale, py + 5 * scale, 2 * scale, 2 * scale);
            break;
          case "monocle":
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.strokeStyle = "gold";
            ctx.lineWidth = 1 * scale;
            ctx.strokeRect(px + w - 10 * scale, py + 2 * scale, 8 * scale, 8 * scale);
            ctx.beginPath(); ctx.moveTo(px + w - 2 * scale, py + 10 * scale); ctx.lineTo(px + w + 4 * scale, py + 14 * scale); ctx.stroke();
            break;
          case "masked":
            ctx.fillStyle = "#333";
            ctx.fillRect(px - 2 * scale, py + 2 * scale, w + 4 * scale, 8 * scale);
            ctx.fillStyle = "white";
            ctx.fillRect(px + 2 * scale, py + 4 * scale, 6 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 6 * scale, 4 * scale);
            break;
          case "derp":
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 8 * scale, 4 * scale, 4 * scale);
            break;
          case "evil":
            const evilPulse = 10 + Math.sin(frame / 5) * 5;
            ctx.fillStyle = "#ff0000"; 
            if (scale > 2) {
              ctx.shadowBlur = evilPulse * scale;
              ctx.shadowColor = "#ff0000";
            }
            // Left eye - slanted
            ctx.beginPath();
            ctx.moveTo(px + 3 * scale, py + 3 * scale);
            ctx.lineTo(px + 9 * scale, py + 6 * scale);
            ctx.lineTo(px + 8 * scale, py + 9 * scale);
            ctx.lineTo(px + 2 * scale, py + 6 * scale);
            ctx.closePath();
            ctx.fill();
            // Right eye - slanted
            ctx.beginPath();
            ctx.moveTo(px + w - 3 * scale, py + 3 * scale);
            ctx.lineTo(px + w - 9 * scale, py + 6 * scale);
            ctx.lineTo(px + w - 8 * scale, py + 9 * scale);
            ctx.lineTo(px + w - 2 * scale, py + 6 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            // Pupils
            ctx.fillStyle = "black";
            ctx.fillRect(px + 5 * scale, py + 6 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w - 7 * scale, py + 6 * scale, 2 * scale, 2 * scale);
            break;
          case "angry":
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillStyle = customization.color;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + w, py + 6 * scale); ctx.lineTo(px + w, py); ctx.fill();
            break;
          default:
            ctx.fillRect(px + 4 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            ctx.fillRect(px + w - 8 * scale, py + 4 * scale, 4 * scale, 4 * scale);
            break;
        }

        // Draw Accessories
        const acc = customization.accessory;
        if (customization.color.toLowerCase() !== "#ffffff") {
          switch (acc) {
            case "crown":
            ctx.fillStyle = "gold";
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 10 * scale); ctx.lineTo(px + 5 * scale, py - 5 * scale); ctx.lineTo(px + 10 * scale, py - 12 * scale); ctx.lineTo(px + 15 * scale, py - 5 * scale); ctx.lineTo(px + w, py - 10 * scale); ctx.lineTo(px + w, py); ctx.fill();
            break;
          case "horns":
            ctx.fillStyle = "#a00";
            ctx.beginPath(); ctx.moveTo(px + 2 * scale, py); ctx.lineTo(px - 2 * scale, py - 8 * scale); ctx.lineTo(px + 6 * scale, py); ctx.fill();
            ctx.beginPath(); ctx.moveTo(px + w - 6 * scale, py); ctx.lineTo(px + w + 2 * scale, py - 8 * scale); ctx.lineTo(px + w - 2 * scale, py); ctx.fill();
            break;
          case "headband":
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(px, py + 2 * scale, w, 4 * scale);
            ctx.fillRect(px - 2 * scale, py + 3 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w, py + 3 * scale, 2 * scale, 2 * scale);
            break;
          case "cowboy":
            ctx.fillStyle = "#8B4513";
            ctx.fillRect(px - 4 * scale, py - 4 * scale, w + 8 * scale, 4 * scale);
            ctx.fillRect(px + 2 * scale, py - 12 * scale, w - 4 * scale, 8 * scale);
            break;
          case "viking":
            ctx.fillStyle = "#aaa";
            ctx.beginPath(); ctx.arc(px + w / 2, py, w / 2, Math.PI, 0); ctx.fill();
            ctx.fillStyle = "white";
            ctx.beginPath(); ctx.moveTo(px, py - 4 * scale); ctx.lineTo(px - 4 * scale, py - 10 * scale); ctx.lineTo(px + 2 * scale, py - 6 * scale); ctx.fill();
            ctx.beginPath(); ctx.moveTo(px + w, py - 4 * scale); ctx.lineTo(px + w + 4 * scale, py - 10 * scale); ctx.lineTo(px + w - 2 * scale, py - 6 * scale); ctx.fill();
            break;
          case "halo":
            ctx.strokeStyle = "gold";
            ctx.lineWidth = 2 * scale;
            ctx.beginPath(); ctx.ellipse(px + w / 2, py - 12 * scale, 8 * scale, 3 * scale, 0, 0, Math.PI * 2); ctx.stroke();
            break;
          case "headphones":
            ctx.fillStyle = "#333";
            ctx.fillRect(px - 2 * scale, py + 4 * scale, 2 * scale, 12 * scale);
            ctx.fillRect(px + w, py + 4 * scale, 2 * scale, 12 * scale);
            ctx.beginPath(); ctx.arc(px + w / 2, py + 4 * scale, w / 2 + 2 * scale, Math.PI, 0); ctx.stroke();
            break;
          case "tophat":
            ctx.fillStyle = "#111";
            ctx.fillRect(px - 4 * scale, py - 4 * scale, w + 8 * scale, 4 * scale);
            ctx.fillRect(px + 2 * scale, py - 18 * scale, w - 4 * scale, 14 * scale);
            ctx.fillStyle = "#f00";
            ctx.fillRect(px + 2 * scale, py - 6 * scale, w - 4 * scale, 3 * scale);
            break;
          case "cap":
            ctx.fillStyle = "#3b82f6";
            ctx.beginPath(); ctx.arc(px + w / 2, py, w / 2, Math.PI, 0); ctx.fill();
            ctx.fillRect(px + w / 2, py - 4 * scale, w / 2 + 6 * scale, 4 * scale);
            break;
          case "propeller":
            ctx.fillStyle = "#facc15";
            ctx.beginPath(); ctx.arc(px + w / 2, py, w / 2, Math.PI, 0); ctx.fill();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1 * scale;
            ctx.beginPath(); ctx.moveTo(px + w / 2, py - 10 * scale); ctx.lineTo(px + w / 2, py - 16 * scale); ctx.stroke();
            ctx.fillStyle = "silver";
            const propX = Math.cos(frame / 5) * 8 * scale;
            ctx.fillRect(px + w / 2 - propX, py - 18 * scale, propX * 2, 2 * scale);
            break;
          case "cat_ears":
            ctx.fillStyle = customization.color;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 6 * scale, py); ctx.lineTo(px, py - 8 * scale); ctx.fill();
            ctx.beginPath(); ctx.moveTo(px + w, py); ctx.lineTo(px + w - 6 * scale, py); ctx.lineTo(px + w, py - 8 * scale); ctx.fill();
            break;
          case "demon_horns":
            ctx.fillStyle = "#000";
            ctx.beginPath(); ctx.moveTo(px + 2 * scale, py); ctx.quadraticCurveTo(px - 10 * scale, py - 15 * scale, px - 2 * scale, py - 20 * scale); ctx.quadraticCurveTo(px - 2 * scale, py - 10 * scale, px + 6 * scale, py); ctx.fill();
            ctx.beginPath(); ctx.moveTo(px + w - 2 * scale, py); ctx.quadraticCurveTo(px + w + 10 * scale, py - 15 * scale, px + w + 2 * scale, py - 20 * scale); ctx.quadraticCurveTo(px + w + 2 * scale, py - 10 * scale, px + w - 6 * scale, py); ctx.fill();
            break;
          case "builder_hat":
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath(); ctx.arc(px + w / 2, py, w / 2 + 2 * scale, Math.PI, 0); ctx.fill();
            ctx.fillRect(px - 2 * scale, py - 2 * scale, w + 4 * scale, 3 * scale);
            break;
          case "wizard_hat":
            ctx.fillStyle = "#7c3aed";
            ctx.beginPath(); ctx.moveTo(px - 4 * scale, py); ctx.lineTo(px + w / 2, py - 24 * scale); ctx.lineTo(px + w + 4 * scale, py); ctx.fill();
            ctx.fillStyle = "white";
            ctx.fillRect(px + w / 2 - 1 * scale, py - 10 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w / 2 + 3 * scale, py - 16 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(px + w / 2 - 5 * scale, py - 18 * scale, 2 * scale, 2 * scale);
            break;
          case "bunny_ears":
            ctx.fillStyle = "white";
            ctx.fillRect(px + 2 * scale, py - 12 * scale, 5 * scale, 12 * scale);
            ctx.fillRect(px + w - 7 * scale, py - 12 * scale, 5 * scale, 12 * scale);
            ctx.fillStyle = "pink";
            ctx.fillRect(px + 3 * scale, py - 10 * scale, 3 * scale, 8 * scale);
            ctx.fillRect(px + w - 6 * scale, py - 10 * scale, 3 * scale, 8 * scale);
            break;
          case "pirate_hat":
            ctx.fillStyle = "black";
            ctx.beginPath(); ctx.moveTo(px - 6 * scale, py); ctx.quadraticCurveTo(px + w / 2, py - 15 * scale, px + w + 6 * scale, py); ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = `bold ${6 * scale}px sans-serif`;
            ctx.fillText("X", px + w / 2 - 3 * scale, py - 4 * scale);
            break;
          case "party_hat":
            ctx.fillStyle = `hsl(${frame * 2 % 360}, 70%, 60%)`;
            ctx.beginPath(); ctx.moveTo(px + 2 * scale, py); ctx.lineTo(px + w / 2, py - 16 * scale); ctx.lineTo(px + w - 2 * scale, py); ctx.fill();
            ctx.fillStyle = "red"; ctx.beginPath(); ctx.arc(px + w / 2, py - 16 * scale, 3 * scale, 0, Math.PI * 2); ctx.fill();
            break;
          case "sombrero":
            ctx.fillStyle = "#eab308";
            ctx.fillRect(px - 8 * scale, py - 4 * scale, w + 16 * scale, 4 * scale);
            ctx.fillRect(px + 2 * scale, py - 12 * scale, w - 4 * scale, 8 * scale);
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(px + 2 * scale, py - 6 * scale, w - 4 * scale, 2 * scale);
            break;
          case "ushanka":
            ctx.fillStyle = "#52525b";
            ctx.fillRect(px, py - 8 * scale, w, 8 * scale);
            ctx.fillRect(px - 2 * scale, py - 2 * scale, 4 * scale, 10 * scale);
            ctx.fillRect(px + w - 2 * scale, py - 2 * scale, 4 * scale, 10 * scale);
            break;
          case "fedora":
            ctx.fillStyle = "#27272a";
            ctx.fillRect(px - 4 * scale, py - 2 * scale, w + 8 * scale, 2 * scale);
            ctx.fillRect(px + 2 * scale, py - 10 * scale, w - 4 * scale, 8 * scale);
            break;
          case "chef":
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(px + 5 * scale, py - 10 * scale, 6 * scale, 0, Math.PI * 2);
            ctx.arc(px + w - 5 * scale, py - 10 * scale, 6 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(px + 2 * scale, py - 6 * scale, w - 4 * scale, 6 * scale);
            break;
          case "police":
            ctx.fillStyle = "#1e3a8a";
            ctx.fillRect(px, py - 8 * scale, w, 8 * scale);
            ctx.fillStyle = "gold";
            ctx.fillRect(px + w / 2 - 2 * scale, py - 6 * scale, 4 * scale, 4 * scale);
            break;
          case "pumpkin":
            ctx.fillStyle = "#f97316";
            ctx.fillRect(px, py - 12 * scale, w, 12 * scale);
            ctx.fillStyle = "#22c55e";
            ctx.fillRect(px + w / 2 - 2 * scale, py - 16 * scale, 4 * scale, 4 * scale);
            break;
          case "secret_crown":
            ctx.fillStyle = "#111"; // Hacker crown
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px, py - 10 * scale);
            ctx.lineTo(px + 5 * scale, py - 5 * scale);
            ctx.lineTo(px + 10 * scale, py - 12 * scale);
            ctx.lineTo(px + 15 * scale, py - 5 * scale);
            ctx.lineTo(px + w, py - 10 * scale);
            ctx.lineTo(px + w, py);
            ctx.fill();
            break;
          case "rainbow_horn":
            ctx.fillStyle = `hsl(${(Date.now() / 10) % 360}, 100%, 50%)`;
            ctx.beginPath();
            ctx.moveTo(px + w / 2 - 4 * scale, py);
            ctx.lineTo(px + w / 2, py - 20 * scale);
            ctx.lineTo(px + w / 2 + 4 * scale, py);
            ctx.fill();
            break;
          case "ghost_sheet":
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.beginPath();
            ctx.arc(px + w / 2, py + 4 * scale, w / 2 + 2 * scale, Math.PI, 0);
            ctx.lineTo(px + w + 2 * scale, py + w + 2 * scale);
            ctx.lineTo(px - 2 * scale, py + w + 2 * scale);
            ctx.fill();
            break;
          case "coffee_cup":
            ctx.fillStyle = "#fff";
            ctx.fillRect(px + w / 2 - 6 * scale, py - 14 * scale, 12 * scale, 14 * scale);
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.arc(px + w / 2 + 6 * scale, py - 7 * scale, 4 * scale, -Math.PI / 2, Math.PI / 2);
            ctx.stroke();
            ctx.fillStyle = "#4a2c0f"; // Coffee brown
            ctx.fillRect(px + w / 2 - 5 * scale, py - 13 * scale, 10 * scale, 2 * scale);
            break;
          case "unicorn":
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.moveTo(px + w / 2 - 4 * scale, py);
            ctx.lineTo(px + w / 2, py - 20 * scale);
            ctx.lineTo(px + w / 2 + 4 * scale, py);
            ctx.fill();
            ctx.strokeStyle = `hsl(${(Date.now() / 2) % 360}, 100%, 70%)`;
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(px + w / 2 - 2 * scale, py - 5 * scale);
            ctx.lineTo(px + w / 2 + 2 * scale, py - 5 * scale);
            ctx.moveTo(px + w / 2 - 1.5 * scale, py - 10 * scale);
            ctx.lineTo(px + w / 2 + 1.5 * scale, py - 10 * scale);
            ctx.moveTo(px + w / 2 - 1 * scale, py - 15 * scale);
            ctx.lineTo(px + w / 2 + 1 * scale, py - 15 * scale);
            ctx.stroke();
            break;
          }
        }
        
        ctx.restore();
      };
      render();
      return () => {
         cancelAnimationFrame(animationId);
         observer.disconnect();
      };
    }, [customization, scale]);

    return (
      <canvas
        ref={canvasRef}
        onClick={() => {
          triggerDeathRef.current = true;
          import('../services/audioService').then(m => m.audio.playDie(customization.deathSound));
        }}
        width={96 * scale}
        height={96 * scale}
        className="w-full h-full object-contain block image-pixelated cursor-pointer"
      />
    );
  }
);

export default CharacterPreview;
