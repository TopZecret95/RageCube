import express from "express";
import { createServer } from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const SCORES_FILE = path.join(DATA_DIR, "highscores.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Load high scores from file
let highScores = new Map();
try {
  if (fs.existsSync(SCORES_FILE)) {
    const data = fs.readFileSync(SCORES_FILE, "utf-8");
    const parsed = JSON.parse(data);
    highScores = new Map(Object.entries(parsed));
    console.log("[Server] High scores loaded from disk");
  }
} catch (err) {
  console.error("[Server] Failed to load high scores:", err);
}

function saveHighScores() {
  try {
    const obj = Object.fromEntries(highScores);
    fs.writeFileSync(SCORES_FILE, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.error("[Server] Failed to save high scores:", err);
  }
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Lobby management
  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.on("submit-score", (data) => {
      const { levelId, entry } = data;
      if (!highScores.has(levelId)) {
        highScores.set(levelId, []);
      }
      const scores = highScores.get(levelId);
      scores.push({ ...entry, id: Math.random().toString(36).substring(2, 15) });
      scores.sort((a, b) => a.time - b.time);
      if (scores.length > 50) scores.pop();
      console.log(`[Socket] Score submitted for level ${levelId}`);
      saveHighScores();
    });

    socket.on("get-scores", (levelId, callback) => {
      const scores = highScores.get(levelId) || [];
      callback(scores);
    });

    socket.on("create-lobby", (data, callback) => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const room = {
        id: code,
        hostId: data.player.id,
        mode: data.mode,
        status: 'lobby',
        players: new Map([[data.player.id, { ...data.player, isHost: true }]]),
        level: data.level || null,
        levelQueue: data.levelQueue || [],
        suggestions: [], 
        teamMode: data.teamMode || 'solo',
        hazardMode: data.hazardMode || 'normal',
        levelIndex: data.levelIndex || 0,
        vsCollision: data.vsCollision !== undefined ? data.vsCollision : true,
        powerups: data.powerups || {},
        finishTimerEnabled: true,
        messages: []
      };
      rooms.set(code, room);
      socket.join(code);
      socket.data.lobbyCode = code;
      socket.data.playerId = data.player.id;
      console.log(`[Socket] Lobby created: ${code}`);
      callback({ code, room: { ...room, players: Array.from(room.players.values()) } });
    });

    socket.on("join-lobby", (data, callback) => {
      const room = rooms.get(data.code);
      if (room) {
        room.players.set(data.player.id, { ...data.player, isHost: false });
        socket.join(data.code);
        socket.data.lobbyCode = data.code;
        socket.data.playerId = data.player.id;
        io.to(data.code).emit("room-update", { ...room, players: Array.from(room.players.values()) });
        callback({ success: true, room: { ...room, players: Array.from(room.players.values()) } });
      } else {
        callback({ success: false, message: "Room not found" });
      }
    });

    socket.on("update-room", (data) => {
      const room = rooms.get(data.code);
      if (room) {
        if (room.hostId === data.playerId) {
          // Host can update anything
          const { players, ...rest } = data.updates;
          Object.assign(room, rest);
          
          if (players && Array.isArray(players)) {
            players.forEach((p: any) => {
              room.players.set(p.id, { ...p });
            });
          }
        } else if (data.updates.players && Array.isArray(data.updates.players)) {
          // Non-host can only update their own player data (e.g. ready status)
          const player = room.players.get(data.playerId);
          if (player) {
            const updatedPlayerData = data.updates.players.find((p: any) => p.id === data.playerId);
            if (updatedPlayerData) {
              Object.assign(player, updatedPlayerData);
            }
          }
        }
        io.to(data.code).emit("room-update", { 
          ...room, 
          players: Array.from(room.players.values()) 
        });
      }
    });

    socket.on("player-sync", (data) => {
      const room = rooms.get(data.code);
      if (room) {
        const player = room.players.get(data.playerId);
        if (player) {
          player.state = data.state;
          socket.to(data.code).emit("player-synced", { id: data.playerId, state: data.state });
        }
      }
    });

    socket.on("send-event", (data) => {
      socket.to(data.code).emit("game-event", data);
    });

    socket.on("suggest-level", (data) => {
      const room = rooms.get(data.code);
      if (room) {
        // Player can suggest up to 5 levels
        const playerSuggestions = room.suggestions.filter((s: any) => s.playerId === data.playerId);
        if (playerSuggestions.length < 5) {
          const suggestion = {
            id: Math.random().toString(36).substring(2, 11),
            playerId: data.playerId,
            playerName: data.playerName,
            level: data.level,
            status: 'pending'
          };
          room.suggestions.push(suggestion);
          io.to(data.code).emit("room-update", { ...room, players: Array.from(room.players.values()) });
        }
      }
    });

    socket.on("handle-suggestion", (data) => {
      const room = rooms.get(data.code);
      if (room && room.hostId === data.hostId) {
        const index = room.suggestions.findIndex((s: any) => s.id === data.suggestionId);
        if (index !== -1) {
          if (data.action === 'accept') {
            room.suggestions[index].status = 'accepted';
            // Add to queue if not already there
            if (!room.levelQueue.find((l: any) => l.id === room.suggestions[index].level.id)) {
              room.levelQueue.push(room.suggestions[index].level);
            }
          } else {
            room.suggestions[index].status = 'declined';
          }
          io.to(data.code).emit("room-update", { ...room, players: Array.from(room.players.values()) });
        }
      }
    });

    socket.on("clear-suggestions", (data) => {
      const room = rooms.get(data.code);
      if (room && room.hostId === data.hostId) {
        room.suggestions = room.suggestions.filter((s: any) => s.status === 'pending');
        io.to(data.code).emit("room-update", { ...room, players: Array.from(room.players.values()) });
      }
    });

    socket.on("kick-player", (data) => {
      const room = rooms.get(data.code);
      if (room && room.hostId === data.hostId) {
        // Find the target socket using a more robust way
        const targetSocket = Array.from(io.sockets.sockets.values()).find(s => 
          s.data.playerId === data.targetId && s.data.lobbyCode === data.code
        );
        
        if (targetSocket) {
          console.log(`[Socket] Player ${data.targetId} kicked from lobby ${data.code}`);
          
          // 1. Remove them from the room FIRST to block any subsequent broad broadcasts
          targetSocket.leave(data.code);
          
          // 2. Send specific kicked update to the target only
          targetSocket.emit("room-update", { 
            ...room, // Send full room info one last time but with kicked status
            status: 'kicked',
            players: Array.from(room.players.values())
          });
          
          // 3. Clear identifying data so disconnect doesn't double-process
          delete targetSocket.data.lobbyCode;
          delete targetSocket.data.playerId;
        }
        
        // 4. Remove from list and notify others
        room.players.delete(data.targetId);
        io.to(data.code).emit("room-update", { 
          ...room, 
          players: Array.from(room.players.values()) 
        });
      }
    });

    socket.on("send-chat", (data) => {
      const room = rooms.get(data.code);
      if (room) {
        const msg = {
          id: Math.random().toString(36).substring(2, 15),
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: Date.now(),
          type: data.type || 'chat'
        };
        room.messages.push(msg);
        if (room.messages.length > 100) room.messages.shift();
        io.to(data.code).emit("chat-update", room.messages);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
      
      const { lobbyCode, playerId } = socket.data;
      if (lobbyCode && playerId) {
        const room = rooms.get(lobbyCode);
        if (room) {
          room.players.delete(playerId);
          if (room.hostId === playerId) {
            console.log(`[Socket] Host left, closing lobby: ${lobbyCode}`);
            io.to(lobbyCode).emit("room-update", { ...room, status: 'closed', players: [] });
            rooms.delete(lobbyCode);
          } else {
            console.log(`[Socket] Player ${playerId} left lobby: ${lobbyCode}`);
            io.to(lobbyCode).emit("room-update", { ...room, players: Array.from(room.players.values()) });
          }
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Use a regex to match all routes for SPA fallback in Express 5
    app.get(/^(?!\/socket\.io).*$/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server running on port ${PORT}`);
  });
}

startServer();
