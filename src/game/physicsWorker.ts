import { PlayerState, Entity } from "../../components/GameCanvasTypes";
import { updatePlayerPhysics } from "./physicsEngine";

interface WorkerState {
  player1: PlayerState | null;
  player2: PlayerState | null;
  entities: Entity[];
  dt: number;
}

let state: WorkerState = {
  player1: null,
  player2: null,
  entities: [],
  dt: 1000 / 60,
};

self.onmessage = (e) => {
  const { type, data } = e.data;

  switch (type) {
    case "init":
      state = { ...state, ...data };
      self.postMessage({ type: "ready" });
      break;
    case "updateInputs":
      if (state.player1) state.player1.keys = data.p1Keys;
      if (state.player2) state.player2.keys = data.p2Keys;
      
      // Run internal physics steps
      if (state.player1) {
        updatePlayerPhysics(state.player1, state.entities, state.dt);
      }
      if (state.player2) {
        updatePlayerPhysics(state.player2, state.entities, state.dt);
      }

      // Send back updated positions
      self.postMessage({
        type: "physicsUpdate",
        data: {
          player1: state.player1 ? { pos: state.player1.pos, vel: state.player1.vel } : null,
          player2: state.player2 ? { pos: state.player2.pos, vel: state.player2.vel } : null,
        },
      });
      break;
    case "syncState":
      state = { ...state, ...data };
      break;
  }
};
