import { PlayerCustomization, LevelData } from '../types';
import Peer, { DataConnection } from 'peerjs';
import { io, Socket } from 'socket.io-client';

export type OnlinePlayer = {
  id: string;
  name: string;
  customization: PlayerCustomization;
  isHost: boolean;
  ready: boolean;
  team?: number;
  lastSync?: number;
  state?: SyncState;
};

export type SyncState = {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  facing: number;
  isGrounded: boolean;
  isWallSliding: boolean;
  wallDir: number;
  health?: number;
  isDead?: boolean;
  score?: number;
  finished?: boolean;
  inventory?: string | null;
  hookActive?: boolean;
  hookPos?: { x: number; y: number };
  oneTimeBuild?: boolean;
  oneTimeHook?: boolean;
  moveStartTime?: number;
  timestamp: number;
};

export type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  type: 'chat' | 'system';
};

export type VoteType = 'next' | 'repeat' | 'return' | 'skip' | 'restart' | 'kick';
export interface VoteData {
  type: VoteType;
  votes: Record<string, 'yes' | 'no'>;
  endTime: number;
  targetId?: string; // For kick votes
}

class OnlineService {
  public isHost: boolean = false;
  public lobbyCode: string = '';
  public localPlayer: OnlinePlayer | null = null;
  public players: Map<string, OnlinePlayer> = new Map();
  public currentMode: 'brawler' | 'vs' = 'brawler';
  public currentLevel: LevelData | undefined;
  public levelQueue: LevelData[] = [];
  public suggestions: any[] = []; // New: Store suggestions
  public finishTimerEnabled: boolean = true;
  public isPaused: boolean = false;
  public hostId: string | null = null;
  public messages: ChatMessage[] = [];
  public currentVote: VoteData | null = null;
  private lastStatus: string | null = null;
  
  private socket: Socket | null = null;
  
  private peer: Peer | null = null;
  private peerConnections: Map<string, DataConnection> = new Map();
  private pendingConnections: Set<string> = new Set();
  private lastSocketSync = 0;
  private processedEvents: Set<string> = new Set();
  
  public ping: number = 0;
  private pingInterval: any = null;
  private lastPingSent: number = 0;
  private heartbeatInterval: any = null;
  private peerOpen = false;
  private reconnectTimer: any = null;
  private reconnectCount: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  
  public onLobbyUpdate?: (players: OnlinePlayer[], level?: LevelData, mode?: 'brawler' | 'vs', levelQueue?: LevelData[], teamMode?: string, hazardMode?: string, levelIndex?: number, vsCollision?: boolean, powerups?: Record<string, number>, suddenDeath?: boolean, suggestions?: any[], finishTimerEnabled?: boolean) => void;
  public onGameStart?: (mode?: 'brawler' | 'vs', level?: LevelData, levelQueue?: LevelData[], teamMode?: string, hazardMode?: string, levelIndex?: number, vsCollision?: boolean) => void;
  public onStatusChange?: (status: string) => void;
  public onSync?: (id: string, state: SyncState) => void;
  public onEvent?: (id: string, event: string, data?: any) => void;
  public onAppEvent?: (id: string, event: string, data?: any) => void;
  public onChatUpdate?: (messages: ChatMessage[]) => void;
  public onVoteUpdate?: (vote: VoteData | null) => void;
  public onDisconnect?: () => void;
  public onError?: (message: string) => void;

  private joinTime: number = 0;

  constructor() {
    // Initialize socket connection
    this.socket = io(window.location.origin, { secure: true });
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("room-update", (data) => {
      this.currentMode = data.mode;
      this.currentLevel = data.level;
      this.levelQueue = data.levelQueue || [];
      this.suggestions = data.suggestions || [];
      this.finishTimerEnabled = data.finishTimerEnabled !== undefined ? data.finishTimerEnabled : true;
      this.isPaused = data.isPaused !== undefined ? data.isPaused : false;
      this.hostId = data.hostId;

      if (this.localPlayer && data.hostId === this.localPlayer.id) {
        this.isHost = true;
      }

      // Update players map
      this.players.clear();
      data.players.forEach((p: OnlinePlayer) => {
        this.players.set(p.id, p);
        if (p.id !== this.localPlayer?.id && p.state && this.onSync) {
          this.onSync(p.id, p.state);
        }
      });

      if (data.status === 'playing' && this.lastStatus !== 'playing' && this.onGameStart) {
        this.onGameStart(data.mode, data.level, data.levelQueue, data.teamMode, data.hazardMode, data.levelIndex, data.vsCollision);
      }

      if (data.status !== this.lastStatus && this.onStatusChange) {
        this.onStatusChange(data.status);
        // If we are kicked or lobby closed, we might have been disconnected in the callback
        if (data.status === 'kicked' || data.status === 'closed') return;
      }

      this.currentVote = data.vote || null;
      if (this.onVoteUpdate) {
        this.onVoteUpdate(this.currentVote);
      }

      this.lastStatus = data.status;

      if (this.onLobbyUpdate) {
        this.onLobbyUpdate(Array.from(this.players.values()), this.currentLevel, this.currentMode, this.levelQueue, data.teamMode, data.hazardMode, data.levelIndex, data.vsCollision, data.powerups, data.suddenDeath, this.suggestions, this.finishTimerEnabled);
      }

      // P2P connection management
      data.players.forEach((p: OnlinePlayer) => {
        if (p.id !== this.localPlayer?.id && !this.peerConnections.has(p.id)) {
          if (this.peer && !this.peer.disconnected && !this.peer.destroyed) {
            // Small delay to ensure the other peer has registered their ID
            setTimeout(() => this.connectToPeer(p.id), 1000);
          }
        }
      });
    });

    this.socket.on("player-synced", (data) => {
      if (data.id !== this.localPlayer?.id && this.onSync) {
        this.onSync(data.id, data.state);
      }
    });

    this.socket.on("game-event", (data) => {
      if (data.senderId !== this.localPlayer?.id) {
        if (data.eventId && this.trackEvent(data.eventId)) return;
        if (this.onEvent) this.onEvent(data.senderId, data.type, data.data);
        if (this.onAppEvent) this.onAppEvent(data.senderId, data.type, data.data);
      }
    });

    this.socket.on("chat-update", (messages) => {
      this.messages = messages;
      if (this.onChatUpdate) {
        this.onChatUpdate(this.messages);
      }
    });

    this.socket.on("disconnect", () => {
      if (this.onDisconnect) this.onDisconnect();
    });
  }

  public async createLobby(localPlayer: OnlinePlayer, mode: 'brawler' | 'vs', initialSettings?: { level?: any, levelQueue?: any[], teamMode?: string, hazardMode?: string, vsCollision?: boolean, powerups?: any }): Promise<string> {
    this.joinTime = Date.now();
    this.isHost = true;
    this.localPlayer = localPlayer;
    this.currentMode = mode;
    
    return new Promise((resolve, reject) => {
      this.socket?.emit("create-lobby", { player: localPlayer, mode, ...initialSettings }, (response: any) => {
        this.lobbyCode = response.code;
        this.hostId = localPlayer.id;
        this.initPeer(localPlayer.id);
        resolve(this.lobbyCode);
      });
    });
  }

  public async joinLobby(code: string, localPlayer: OnlinePlayer): Promise<void> {
    this.joinTime = Date.now();
    this.isHost = false;
    this.localPlayer = localPlayer;
    this.lobbyCode = code;

    return new Promise((resolve, reject) => {
      this.socket?.emit("join-lobby", { code, player: localPlayer }, (response: any) => {
        if (response.success) {
          this.hostId = response.room.hostId;
          this.initPeer(localPlayer.id);
          resolve();
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  private initPeer(id: string) {
    if (this.peer) {
      this.peer.destroy();
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    const peerId = `aistudio-brawler-${id}`;
    this.peer = new Peer(peerId, {
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      secure: true,
      debug: 1,
      pingInterval: 5000,
      config: {
        'iceServers': [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    this.peer.on('open', (peerId) => {
      console.log('[PeerJS] My peer ID is: ' + peerId);
      this.peerOpen = true;
      this.reconnectCount = 0;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      for (const p of this.players.values()) {
        if (p.id !== this.localPlayer?.id) {
          this.connectToPeer(p.id);
        }
      }
      this.startHeartbeat();
    });

    this.peer.on('disconnected', () => {
      console.log('[PeerJS] Disconnected from signaling server');
      this.peerOpen = false;
      
      if (this.reconnectCount < this.MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectCount), 30000);
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.reconnectCount++;
          if (this.peer && !this.peer.destroyed) {
            this.peer.reconnect();
          }
        }, delay);
      }
    });

    this.peer.on('error', (err: any) => {
      if (err.type === 'lost-connection') return;
      console.error('[PeerJS] error:', err.type, err);
      if (err.type === 'server-error' || err.type === 'socket-error' || err.type === 'network') {
        this.peerOpen = false;
      }
    });

    this.peer.on('connection', (conn) => {
      this.setupConnection(conn);
    });
  }

  private connectToPeer(hostId: string, retryCount = 0) {
    if (!this.peer || this.peer.destroyed || this.peer.disconnected) return;
    if (this.peerConnections.has(hostId)) return;
    if (this.pendingConnections.has(hostId) && retryCount === 0) return;
    
    this.pendingConnections.add(hostId);
    const hostPeerId = `aistudio-brawler-${hostId}`;
    console.log(`[PeerJS] Connecting to: ${hostPeerId} (Attempt ${retryCount + 1})`);
    
    const conn = this.peer.connect(hostPeerId, { reliable: false });
    
    // Add a timeout for the connection attempt
    const timeout = setTimeout(() => {
      if (!conn.open && retryCount < 3) {
        console.log(`[PeerJS] Connection timeout to ${hostPeerId}, retrying...`);
        conn.close();
        this.pendingConnections.delete(hostId);
        this.connectToPeer(hostId, retryCount + 1);
      } else if (!conn.open) {
        this.pendingConnections.delete(hostId);
      }
    }, 3000);

    conn.on('open', () => {
      clearTimeout(timeout);
      this.pendingConnections.delete(hostId);
      this.setupConnection(conn);
    });

    conn.on('error', (err) => {
      clearTimeout(timeout);
      this.pendingConnections.delete(hostId);
      console.warn(`[PeerJS] Connection error to ${hostPeerId}:`, err);
      if (retryCount < 3) {
        setTimeout(() => this.connectToPeer(hostId, retryCount + 1), 2000);
      }
    });
  }

  private trackEvent(eventId: string): boolean {
    if (!eventId) return false;
    if (this.processedEvents.has(eventId)) return true;
    this.processedEvents.add(eventId);
    if (this.processedEvents.size > 1000) {
      const firstItem = this.processedEvents.values().next().value;
      if (firstItem) this.processedEvents.delete(firstItem);
    }
    return false;
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      for (const conn of this.peerConnections.values()) {
        if (conn.open) {
          try { conn.send({ type: 'heartbeat' }); } catch (e) {}
        }
      }
    }, 5000);

    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      this.lastPingSent = Date.now();
      for (const conn of this.peerConnections.values()) {
        if (conn.open) {
          try { conn.send({ type: 'ping', time: this.lastPingSent }); } catch (e) {}
        }
      }
    }, 2000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) { clearInterval(this.heartbeatInterval); this.heartbeatInterval = null; }
    if (this.pingInterval) { clearInterval(this.pingInterval); this.pingInterval = null; }
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      const originalId = conn.peer.replace('aistudio-brawler-', '');
      if (this.peerConnections.has(originalId)) {
        const existingConn = this.peerConnections.get(originalId)!;
        if (existingConn.connectionId < conn.connectionId) {
          conn.close();
          return;
        } else {
          existingConn.close();
        }
      }
      this.peerConnections.set(originalId, conn);
    });

    conn.on('data', (data: any) => {
      if (data.type === 'heartbeat') return;
      if (data.type === 'ping') {
        try { conn.send({ type: 'pong', time: data.time }); } catch (e) {}
        return;
      }
      if (data.type === 'pong') {
        this.ping = Date.now() - data.time;
        return;
      }
      if (data.type === 'sync' && this.onSync) {
        const originalId = conn.peer.replace('aistudio-brawler-', '');
        this.onSync(originalId, data.state);
      } else if (data.type === 'event') {
        if (data.eventId && this.trackEvent(data.eventId)) return;
        const originalId = conn.peer.replace('aistudio-brawler-', '');
        if (this.onEvent) this.onEvent(originalId, data.event, data.data);
        if (this.onAppEvent) this.onAppEvent(originalId, data.event, data.data);
      }
    });

    conn.on('close', () => {
      const originalId = conn.peer.replace('aistudio-brawler-', '');
      if (this.peerConnections.get(originalId) === conn) {
        this.peerConnections.delete(originalId);
      }
    });

    conn.on('error', (err) => {
      const originalId = conn.peer.replace('aistudio-brawler-', '');
      if (this.peerConnections.get(originalId) === conn) {
        this.peerConnections.delete(originalId);
      }
    });
  }

  private lastSync = 0;
  private SYNC_INTERVAL = 30;

  public async sendSync(state: Omit<SyncState, 'timestamp'>) {
    if (!this.localPlayer || !this.lobbyCode) return;
    
    const now = Date.now();
    if (now - this.lastSync < this.SYNC_INTERVAL) return;
    this.lastSync = now;
    
    const fullState = { ...state, timestamp: now };

    let connectedToAll = true;
    for (const p of this.players.values()) {
      if (p.id !== this.localPlayer.id) {
        const conn = this.peerConnections.get(p.id);
        if (conn && conn.open) {
          try { conn.send({ type: 'sync', state: fullState }); } catch (e) { connectedToAll = false; }
        } else {
          connectedToAll = false;
        }
      }
    }

    const socketSyncInterval = connectedToAll ? 1000 : 200;
    if (!connectedToAll || now - this.lastSocketSync > socketSyncInterval) {
      this.lastSocketSync = now;
      this.socket?.emit("player-sync", { code: this.lobbyCode, playerId: this.localPlayer.id, state: fullState });
    }
  }

  public async sendEvent(type: string, data?: any) {
    if (!this.localPlayer || !this.lobbyCode) return;
    
    const eventId = Math.random().toString(36).substring(2, 15);
    this.trackEvent(eventId);
    
    if (this.peerConnections.size > 0) {
      for (const conn of this.peerConnections.values()) {
        if (conn.open) {
          conn.send({ type: 'event', event: type, data: data || {}, eventId });
        }
      }
    }

    this.socket?.emit("send-event", { code: this.lobbyCode, senderId: this.localPlayer.id, type, data: data || {}, eventId });
  }

  public async setReady(ready: boolean) {
    if (!this.localPlayer || !this.lobbyCode) return;
    this.localPlayer.ready = ready;
    this.socket?.emit("update-room", { code: this.lobbyCode, playerId: this.localPlayer.id, updates: { players: Array.from(this.players.values()).map(p => p.id === this.localPlayer?.id ? { ...p, ready } : p) } });
  }

  public async suggestLevel(level: LevelData) {
    if (!this.localPlayer || !this.lobbyCode) return;
    this.socket?.emit("suggest-level", { 
      code: this.lobbyCode, 
      playerId: this.localPlayer.id, 
      playerName: this.localPlayer.name,
      level 
    });
  }

  public async handleSuggestion(suggestionId: string, action: 'accept' | 'decline') {
    if (!this.isHost || !this.lobbyCode || !this.localPlayer) return;
    this.socket?.emit("handle-suggestion", { 
      code: this.lobbyCode, 
      hostId: this.localPlayer.id, 
      suggestionId, 
      action 
    });
  }

  public async clearSuggestions() {
    if (!this.isHost || !this.lobbyCode || !this.localPlayer) return;
    this.socket?.emit("clear-suggestions", { 
      code: this.lobbyCode, 
      hostId: this.localPlayer.id 
    });
  }

  public async toggleFinishTimer() {
    if (!this.isHost || !this.lobbyCode || !this.localPlayer) return;
    this.socket?.emit("update-room", { 
      code: this.lobbyCode, 
      playerId: this.localPlayer.id, 
      updates: { finishTimerEnabled: !this.finishTimerEnabled } 
    });
  }

  public async updateLocalPlayer(player: OnlinePlayer) {
    this.localPlayer = player;
    if (this.lobbyCode) {
      this.socket?.emit("update-room", { code: this.lobbyCode, playerId: this.localPlayer.id, updates: { players: Array.from(this.players.values()).map(p => p.id === player.id ? player : p) } });
    }
  }

  public async startGame() {
    if (this.isHost && this.lobbyCode) {
      this.socket?.emit("update-room", { code: this.lobbyCode, playerId: this.localPlayer?.id, updates: { status: 'playing' } });
    }
  }

  public async finishGame() {
    if (this.isHost && this.lobbyCode) {
      this.socket?.emit("update-room", { code: this.lobbyCode, playerId: this.localPlayer?.id, updates: { status: 'summary' } });
    }
  }

  public async returnToLobby() {
    if (this.isHost && this.lobbyCode) {
      this.socket?.emit("update-room", { code: this.lobbyCode, playerId: this.localPlayer?.id, updates: { status: 'lobby' } });
    }
  }

  public async closeLobby() {
    if (this.isHost && this.lobbyCode) {
      this.socket?.emit("update-room", { code: this.lobbyCode, playerId: this.localPlayer?.id, updates: { status: 'closed' } });
      this.disconnect();
    }
  }

  public async broadcastLobbyState(mode?: 'brawler' | 'vs', level?: LevelData, levelQueue?: LevelData[], teamMode?: string, hazardMode?: string, status?: string, levelIndex?: number, vsCollision?: boolean, vote?: VoteData | null, powerups?: Record<string, number>, suddenDeath?: boolean, finishTimerEnabled?: boolean, isPaused?: boolean) {
    if (this.isHost && this.lobbyCode) {
      const updates: any = {};
      if (mode) updates.mode = mode;
      if (level) updates.level = level;
      if (levelQueue) updates.levelQueue = levelQueue;
      if (teamMode) updates.teamMode = teamMode;
      if (hazardMode) updates.hazardMode = hazardMode;
      if (status) updates.status = status;
      if (levelIndex !== undefined) updates.levelIndex = levelIndex;
      if (vsCollision !== undefined) updates.vsCollision = vsCollision;
      if (vote !== undefined) updates.vote = vote;
      if (powerups !== undefined) updates.powerups = powerups;
      if (suddenDeath !== undefined) updates.suddenDeath = suddenDeath;
      if (finishTimerEnabled !== undefined) updates.finishTimerEnabled = finishTimerEnabled;
      if (isPaused !== undefined) updates.isPaused = isPaused;
      this.socket?.emit("update-room", { code: this.lobbyCode, playerId: this.localPlayer?.id, updates });
    }
  }

  public initiateVote(type: VoteType, targetId?: string) {
    if (this.lobbyCode) {
      if (this.isHost) {
        const vote: VoteData = {
          type,
          votes: { [this.localPlayer!.id]: 'yes' }, // Initiator automatically votes yes
          endTime: Date.now() + 15000, // 15 second vote
          targetId
        };
        this.currentVote = vote;
        if (this.onVoteUpdate) this.onVoteUpdate(vote);
        this.broadcastLobbyState(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, vote);
      } else {
        this.sendEvent('request_vote', { type, targetId });
      }
    }
  }

  public togglePause() {
    if (this.isHost && this.lobbyCode) {
      this.broadcastLobbyState(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, !this.isPaused);
    }
  }

  public kickPlayer(targetId: string) {
    if (this.isHost && this.lobbyCode && this.localPlayer) {
      this.socket?.emit("kick-player", { 
        code: this.lobbyCode, 
        targetId, 
        hostId: this.localPlayer.id 
      });
      // Also broadcast a system message
      const targetName = this.players.get(targetId)?.name || "Unknown Player";
      this.socket?.emit("send-chat", {
        code: this.lobbyCode,
        message: {
          id: Math.random().toString(),
          text: `${targetName} was kicked from the lobby.`,
          senderId: "system",
          senderName: "SYSTEM",
          timestamp: Date.now(),
          type: "system"
        }
      });
    }
  }

  public castVote(choice: 'yes' | 'no') {
    if (this.lobbyCode && this.localPlayer) {
      if (this.isHost) {
        this.handleCastVote(this.localPlayer.id, choice);
      } else {
        this.sendEvent('cast_vote', { choice });
      }
    }
  }

  public handleCastVote(senderId: string, choice: 'yes' | 'no') {
    if (this.isHost && this.currentVote) {
      const updatedVotes = { ...this.currentVote.votes, [senderId]: choice };
      const updatedVote = { ...this.currentVote, votes: updatedVotes };
      this.broadcastLobbyState(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, updatedVote);
      
      this.currentVote = updatedVote; // apply locally immediately
      if (this.onVoteUpdate) this.onVoteUpdate(this.currentVote);
    }
  }

  public clearVote() {
    if (this.isHost && this.lobbyCode) {
      this.broadcastLobbyState(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, null);
    }
  }

  public async reconnectPeer() {
    if (this.localPlayer) {
      if (this.peer) this.peer.destroy();
      this.initPeer(this.localPlayer.id);
    }
  }

  public async sendChatMessage(text: string, type: 'chat' | 'system' = 'chat') {
    if (!this.localPlayer || !this.lobbyCode || !text.trim()) return;
    this.socket?.emit("send-chat", { code: this.lobbyCode, text: text.trim(), senderId: this.localPlayer.id, senderName: this.localPlayer.name, type });
  }

  public async disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    this.reconnectCount = 0;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = io(window.location.origin);
      this.setupSocketListeners();
    }
    
    this.lobbyCode = '';
    this.localPlayer = null;
    this.isHost = false;
    this.hostId = null;
    this.players.clear();
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.peerConnections.clear();
  }
}

export const onlineService = new OnlineService();
