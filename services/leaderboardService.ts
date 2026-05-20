import { GhostRun } from '../types';
import { io, Socket } from 'socket.io-client';

export interface LeaderboardEntry {
  id: string;
  levelId: string;
  name: string;
  score: number;
  time: number;
  deaths: number;
  date: string;
  userId: string;
  ghostData?: GhostRun;
}

class LeaderboardService {
  private socket: Socket;

  constructor() {
    this.socket = io(window.location.origin, { secure: true });
  }

  public async submitScore(levelId: string, name: string, score: number, time: number, deaths: number, ghostData?: GhostRun) {
    const entry = {
      levelId,
      name,
      score,
      time,
      deaths,
      date: new Date().toISOString(),
      userId: 'local-user', // No auth, just local ID
      ghostData: ghostData || null
    };

    this.socket.emit("submit-score", { levelId, entry });
  }

  public async getTopScores(levelId: string, limitCount: number = 10): Promise<LeaderboardEntry[]> {
    return new Promise((resolve) => {
      this.socket.emit("get-scores", levelId, (scores: LeaderboardEntry[]) => {
        resolve(scores.slice(0, limitCount));
      });
    });
  }

  public async getWorldRecordGhost(levelId: string): Promise<GhostRun | null> {
    const scores = await this.getTopScores(levelId, 5);
    for (const s of scores) {
      if (s.ghostData) return s.ghostData;
    }
    return null;
  }
}

export const leaderboardService = new LeaderboardService();
