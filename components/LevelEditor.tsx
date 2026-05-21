import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  LevelData,
  Entity,
  EntityType,
  Vector2,
  LevelAbility,
  GameSettings,
} from "../types";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  TILE_SIZE,
  COLORS,
  TRANSLATIONS,
} from "../constants";

interface LevelEditorProps {
  onSave: (level: LevelData) => void;
  onExit: () => void;
  onTest: (
    level: LevelData,
    history?: Entity[][],
    historyIndex?: number,
  ) => void;
  lang: string;
  initialLevel?: LevelData | null;
  isVerified?: boolean;
  initialHistory?: Entity[][];
  initialHistoryIndex?: number;
  showToast?: (msg: string) => void;
  settings?: GameSettings;
  onSettingsChange?: (settings: GameSettings) => void;
  externalLevelSync?: LevelData;
  onLevelChange?: (level: LevelData) => void;
}

const allTools = [
  { id: "select", label: "SELECT (0)", color: "#00ffff" },
  { id: "wall", label: "WALL (1)", color: COLORS.WALL },
  { id: "walkthrough_wall", label: "FAKE WALL", color: COLORS.WALL },
  { id: "hazard", label: "HAZARD (2)", color: COLORS.HAZARD },
  { id: "ghost_hazard", label: "FAKE HAZ", color: COLORS.HAZARD },
  { id: "coin", label: "COIN (3)", color: COLORS.COIN },
  { id: "goal", label: "GOAL (4)", color: COLORS.GOAL },
  { id: "fake_goal", label: "FAKE GOAL", color: COLORS.GOAL },
  { id: "start", label: "SPAWN P1", color: "#00ffff" },
  { id: "startP2", label: "SPAWN P2", color: "#00ff88" },
  { id: "ice", label: "ICE (6)", color: COLORS.ICE },
  { id: "fake_ice", label: "FAKE ICE", color: COLORS.ICE },
  { id: "trampoline", label: "TRAMP (7)", color: COLORS.TRAMPOLINE },
  { id: "slime", label: "SLIME (8)", color: COLORS.SLIME },
  { id: "fake_slime", label: "FAKE SLIME", color: COLORS.SLIME },
  { id: "teleport", label: "TELE (9)", color: COLORS.TELEPORT },
  { id: "powerup_build", label: "P-BUILD", color: COLORS.POWERUP_BUILD },
  { id: "powerup_hook", label: "P-HOOK", color: COLORS.POWERUP_HOOK },
  { id: "powerup_double_jump", label: "P-JUMP", color: COLORS.POWERUP_DJ },
  { id: "powerup_slow_mo", label: "P-TIME", color: COLORS.POWERUP_SLOW_MO },
  { id: "powerup_xray", label: "P-XRAY", color: COLORS.POWERUP_XRAY },
  { id: "block_dash", label: "DASH", color: "#f59e0b" },
  { id: "block_shrink", label: "SHRINK", color: "#10b981" },
  { id: "block_grow", label: "GROW", color: "#ef4444" },
  { id: "block_gravity", label: "GRAV REV", color: "#8b5cf6" },
  { id: "powerup_remover", label: "NO-PWR", color: COLORS.REMOVE_ABILITY },
  { id: "powerup_spawner", label: "P-SPAWN", color: "#ff00ff" },
  { id: "checkpoint", label: "CHECKPT (C)", color: COLORS.CHECKPOINT },
  { id: "gravity_reverse", label: "GRAV AREA STRONG", color: "#c084fc" },
  { id: "gravity_zero", label: "GRAV AREA LOW", color: "#38bdf8" },
  { id: "eraser", label: "ERASER (E)", color: "#ffffff" },
];

const RADIAL_CATEGORIES = [
  {
    name: "Auswahl", // 0
    tools: ["select"],
    color: "#ffffff",
  },
  {
    name: "Normal", // 1
    tools: ["wall", "ice", "slime", "trampoline", "hazard", "teleport"],
    color: "#00ffff",
  },
  {
    name: "Schein", // 2
    tools: ["walkthrough_wall", "fake_ice", "fake_slime", "ghost_hazard", "fake_goal"],
    color: "#ff00ff",
  },
  {
    name: "Extras", // 3
    tools: [
      "coin",
      "goal",
      "checkpoint",
      "start",
      "startP2",
      "gravity_reverse",
      "gravity_zero",
    ],
    color: "#ff0055",
  },
  {
    name: "Powerup", // 4
    tools: [
      "powerup_double_jump",
      "powerup_hook",
      "powerup_build",
      "powerup_slow_mo",
      "powerup_xray",
      "powerup_remover",
    ],
    color: "#ffff00",
  },
  {
    name: "Spezial", // 5
    tools: ["block_grow", "block_shrink", "block_gravity", "block_dash"],
    color: "#c084fc",
  },
  {
    name: "Radierer", // 6
    tools: ["eraser"],
    color: "#ffffff",
  },
];

const BRAWLER_RADIAL_CATEGORIES = [
  {
    name: "Auswahl",
    tools: ["select"],
    color: "#ffffff",
  },
  {
    name: "Werkzeuge",
    tools: ["start", "startP2"],
    color: "#ffffff",
  },
  {
    name: "Radierer",
    tools: ["eraser"],
    color: "#ffffff",
  },
  {
    name: "Blöcke",
    tools: [
      "wall",
      "hazard",
      "ice",
      "trampoline",
      "slime",
      "gravity_reverse",
      "gravity_zero",
    ],
    color: "#00ffff",
  },
  {
    name: "Extras",
    tools: ["block_dash", "block_shrink", "block_grow", "powerup_spawner"],
    color: "#ffff00",
  },
];

const HoldButton = ({ onClick, className, children }: any) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onClickRef = useRef(onClick);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  const startHold = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    onClickRef.current();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        onClickRef.current();
      }, 50);
    }, 400);
  };

  const endHold = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => {
      endHold();
    };
  }, []);

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      className={className}
    >
      {children}
    </button>
  );
};

const SmoothSlider = ({
  label,
  value,
  min,
  max,
  onChange,
  active,
  onActivate,
  className,
}: any) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const [localValue, setLocalValue] = useState(value);
  const isDragging = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!isDragging.current) {
      setLocalValue(value);
    }
  }, [value]);

  const handleSlide = useCallback(
    (clientX: number, commit = false) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.min(
        1,
        Math.max(0, (clientX - rect.left) / rect.width),
      );
      const newValue = Math.round(min + percentage * (max - min));
      setLocalValue(newValue);
      onChangeRef.current(newValue, commit);
    },
    [min, max],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onActivate) onActivate();
    e.preventDefault();
    isDragging.current = true;
    handleSlide(e.clientX, false);

    const moveHandler = (moveEvent: MouseEvent) => {
      handleSlide(moveEvent.clientX, false);
    };

    const upHandler = (upEvent: MouseEvent) => {
      isDragging.current = false;
      handleSlide(upEvent.clientX, true);
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseup", upHandler);
    };

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("mouseup", upHandler);
  };

  const pct = Math.max(0, Math.min(1, (localValue - min) / (max - min)));
  return (
    <div
      className={`flex flex-col gap-1 ${className !== undefined ? className : "mb-2"} ${active ? "bg-neutral-800 border-white/20" : "hover:bg-neutral-800/50 border-transparent"} p-1.5 border rounded transition-colors cursor-pointer group/slider`}
      onMouseDown={handleMouseDown}
    >
      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono select-none">
        <span
          className={
            active
              ? "text-yellow-400 font-bold"
              : "group-hover/slider:text-neutral-200"
          }
        >
          {label}
        </span>
        <div className="flex items-center gap-1">
          <HoldButton
            onClick={() => {
              const newValue = Math.max(min, localValue - 1);
              setLocalValue(newValue);
              onChange(newValue, true);
            }}
            className="w-4 h-4 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-sm text-[10px] leading-none active:scale-95"
          >
            -
          </HoldButton>
          <input
            type="number"
            value={localValue}
            onChange={(e) => {
              const val = parseInt(e.target.value) || min;
              setLocalValue(val);
              onChange(val, true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`bg-transparent text-center w-10 outline-none border-b border-transparent focus:border-white ${active ? "text-yellow-400" : ""}`}
          />
          <HoldButton
            onClick={() => {
              const newValue = Math.min(max, localValue + 1);
              setLocalValue(newValue);
              onChange(newValue, true);
            }}
            className="w-4 h-4 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-sm text-[10px] leading-none active:scale-95"
          >
            +
          </HoldButton>
        </div>
      </div>
      <div
        ref={sliderRef}
        className="h-3 mt-1 bg-black border border-neutral-700 rounded relative overflow-hidden pointer-events-none"
      >
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-75 ${active ? "bg-yellow-500" : "bg-neutral-500 group-hover/slider:bg-neutral-400"}`}
          style={{ width: `${pct * 100}%` }}
        ></div>
        <div
          className="absolute top-0 w-1 h-full bg-white opacity-50"
          style={{ left: `${pct * 100}%`, transform: "translateX(-50%)" }}
        ></div>
      </div>
    </div>
  );
};

const PropertyEditor = ({
  selectedEntityIndices,
  entities,
  popupPos,
  activeProperty,
  tools,
  handleUpdateSelected,
  handleDeleteSelected,
  setSelectedEntityIndices,
  setActiveProperty,
  setIsDraggingPopup,
  setDragOffset,
  generateStableId,
  tools_trans,
  levelWidth,
  levelHeight,
  setLevelWidth,
  setLevelHeight,
  handleTooltipEnter,
  handleTooltipMove,
  handleTooltipLeave,
}: any) => {
  if (selectedEntityIndices.length === 0 || !popupPos) return null;
  const lastIdx = selectedEntityIndices[selectedEntityIndices.length - 1];
  const ent = entities[lastIdx];
  const isMulti = selectedEntityIndices.length > 1;

  const handlePopupMouseDown = (e: React.MouseEvent) => {
    setIsDraggingPopup(true);
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    let scaleX = 1;
    let scaleY = 1;
    let rectLeft = 0;
    let rectTop = 0;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      scaleX = levelWidth / rect.width;
      scaleY = levelHeight / rect.height;
      rectLeft = rect.left;
      rectTop = rect.top;
    }
    setDragOffset({
      x: (e.clientX - rectLeft) * scaleX - popupPos.x,
      y: (e.clientY - rectTop) * scaleY - popupPos.y,
    });
    e.stopPropagation();
  };

  return (
    <div
      className="absolute z-50 bg-neutral-900 border border-neutral-600 shadow-2xl rounded p-3 flex flex-col gap-2 w-60 animate-fade-in backdrop-blur-sm select-none"
      style={{
        left: `${(popupPos.x / levelWidth) * 100}%`,
        top: `${(popupPos.y / levelHeight) * 100}%`,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="flex justify-between items-center border-b border-neutral-700 pb-2 mb-1 cursor-move"
        onMouseDown={handlePopupMouseDown}
      >
        <span className="text-cyan-400 font-bold text-xs font-arcade">
          {isMulti
            ? `EDIT ${selectedEntityIndices.length} BLOCKS`
            : "EDIT BLOCK"}
        </span>
        <button
          onClick={() => setSelectedEntityIndices([])}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-neutral-500 hover:text-white px-2 cursor-pointer"
        >
          x
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {!isMulti && (
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="text-[10px] whitespace-nowrap text-neutral-500 font-bold uppercase tracking-widest shrink-0">
              {tools_trans?.typeLabel || "TYPE"}:
            </div>
            <select
              value={ent.type}
              onChange={(e) =>
                handleUpdateSelected({ type: e.target.value as EntityType })
              }
              className="bg-black text-white border border-neutral-700 rounded p-1 w-full text-[10px] outline-none focus:border-cyan-500 overflow-hidden text-ellipsis"
            >
              {tools
                .filter(
                  (t: any) =>
                    t.id !== "select" && t.id !== "eraser" && t.id !== "start",
                )
                .map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {tools_trans?.blockNames?.[t.id] || t.label}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="flex flex-wrap gap-1 bg-black/50 p-1 rounded border border-neutral-800">
          <button
            className={`flex-1 py-1 px-1 rounded-[2px] text-[9px] font-bold transition-colors ${ent.movingH ? "bg-cyan-600 text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"}`}
            onClick={() =>
              handleUpdateSelected({ movingH: !ent.movingH, movingV: false })
            }
            onMouseEnter={(e) => handleTooltipEnter(e, tools_trans?.ttHMove || "Horizontal Move")}
            onMouseMove={handleTooltipMove}
            onMouseLeave={handleTooltipLeave}
          >
            X-MOVE
          </button>
          <button
            className={`flex-1 py-1 px-1 rounded-[2px] text-[9px] font-bold transition-colors ${ent.movingV ? "bg-cyan-600 text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"}`}
            onClick={() =>
              handleUpdateSelected({ movingV: !ent.movingV, movingH: false })
            }
            onMouseEnter={(e) => handleTooltipEnter(e, tools_trans?.ttVMove || "Vertical Move")}
            onMouseMove={handleTooltipMove}
            onMouseLeave={handleTooltipLeave}
          >
            Y-MOVE
          </button>
          <button
            className={`flex-1 py-1 px-1 rounded-[2px] text-[9px] font-bold transition-colors ${ent.fragile ? "bg-red-600 text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"}`}
            onClick={() => {
              const updates: Partial<Entity> = { fragile: !ent.fragile };
              if (!ent.fragile && !ent.id) updates.id = generateStableId();
              handleUpdateSelected(updates);
            }}
            onMouseEnter={(e) => handleTooltipEnter(e, tools_trans?.ttFragile || "Fragile Block (breaks on touch)")}
            onMouseMove={handleTooltipMove}
            onMouseLeave={handleTooltipLeave}
          >
            FRAGILE
          </button>
        </div>

        {(ent.movingH || ent.movingV) && (
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/50 border border-neutral-800 border-t-0 -mt-2.5 rounded-b pt-2">
            <SmoothSlider
              label="RNG"
              value={ent.moveRange ?? 100}
              min={10}
              max={500}
              onChange={(v: number, commit: boolean) =>
                handleUpdateSelected({ moveRange: v }, commit)
              }
              className="mb-0"
            />
            <SmoothSlider
              label="SPD"
              value={Math.round((ent.moveSpeed ?? 0.002) * 10000)}
              min={1}
              max={100}
              onChange={(v: number, commit: boolean) =>
                handleUpdateSelected({ moveSpeed: v / 10000 }, commit)
              }
              className="mb-0"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <SmoothSlider
            label="W"
            value={ent.w}
            min={10}
            max={600}
            onChange={(v: number, commit: boolean) =>
              handleUpdateSelected({ w: v }, commit)
            }
            active={activeProperty === "w"}
            onActivate={() => setActiveProperty("w")}
            className="mb-0"
          />
          <SmoothSlider
            label="H"
            value={ent.h}
            min={10}
            max={600}
            onChange={(v: number, commit: boolean) =>
              handleUpdateSelected({ h: v }, commit)
            }
            active={activeProperty === "h"}
            onActivate={() => setActiveProperty("h")}
            className="mb-0"
          />
          {!isMulti && (
            <>
              <SmoothSlider
                label="X"
                value={ent.x}
                min={0}
                max={levelWidth}
                onChange={(v: number, commit: boolean) =>
                  handleUpdateSelected({ x: v }, commit)
                }
                active={activeProperty === "x"}
                onActivate={() => setActiveProperty("x")}
                className="mb-0"
              />
              <SmoothSlider
                label="Y"
                value={ent.y}
                min={0}
                max={levelHeight}
                onChange={(v: number, commit: boolean) =>
                  handleUpdateSelected({ y: v }, commit)
                }
                active={activeProperty === "y"}
                onActivate={() => setActiveProperty("y")}
                className="mb-0"
              />
            </>
          )}
        </div>
        <div className="text-[8px] text-neutral-600 text-center mt-0 uppercase tracking-tighter">
          {tools_trans?.editorHint || "CLICK LABEL + WASD TO ADJUST"}
        </div>
      </div>
      <button
        onClick={handleDeleteSelected}
        className="mt-2 bg-red-900/30 border border-red-900 hover:bg-red-800 hover:text-white text-red-400 p-1.5 rounded text-[10px] font-bold transition-colors uppercase tracking-widest"
      >
        {tools_trans?.delete || "DELETE"}
      </button>
    </div>
  );
};

const LevelEditor: React.FC<LevelEditorProps> = ({
  onSave,
  onExit,
  onTest,
  lang,
  initialLevel,
  isVerified = false,
  initialHistory,
  initialHistoryIndex,
  showToast,
  settings,
  onSettingsChange,
  externalLevelSync,
  onLevelChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);

  useEffect(() => {
    const scrollLoop = () => {
      if (
        settings?.editorEdgeScroll !== false &&
        mousePosRef.current &&
        scrollContainerRef.current
      ) {
        const { x, y } = mousePosRef.current;
        const rect = scrollContainerRef.current.getBoundingClientRect();

        const edgeSize = 120;
        const scrollSpeed = 25;

        // Check if mouse is near edges
        if (
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom
        ) {
          let dx = 0;
          let dy = 0;

          if (x < rect.left + edgeSize) {
            const factor = 1 - (x - rect.left) / edgeSize;
            dx = -scrollSpeed * Math.max(0, Math.min(1.5, factor));
          } else if (x > rect.right - edgeSize) {
            const factor = 1 - (rect.right - x) / edgeSize;
            dx = scrollSpeed * Math.max(0, Math.min(1.5, factor));
          }

          if (y < rect.top + edgeSize) {
            const factor = 1 - (y - rect.top) / edgeSize;
            dy = -scrollSpeed * Math.max(0, Math.min(1.5, factor));
          } else if (y > rect.bottom - edgeSize) {
            const factor = 1 - (rect.bottom - y) / edgeSize;
            dy = scrollSpeed * Math.max(0, Math.min(1.5, factor));
          }

          if (dx !== 0 || dy !== 0) {
            scrollContainerRef.current.scrollBy(dx, dy);
          }
        }
      }
      scrollAnimationRef.current = requestAnimationFrame(scrollLoop);
    };
    scrollAnimationRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (scrollAnimationRef.current)
        cancelAnimationFrame(scrollAnimationRef.current);
    };
  }, [settings?.editorEdgeScroll]);

  const [radialMenuPos, setRadialMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [hoveredRadialTool, setHoveredRadialTool] = useState<
    EntityType | "start" | "startP2" | "eraser" | "select" | null
  >(null);
  const [activeRadialCategory, setActiveRadialCategory] = useState<
    number | null
  >(null);

  const [levelName, setLevelName] = useState(
    initialLevel?.name || "My Custom Level",
  );
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // History State
  const [history, setHistory] = useState<Entity[][]>(
    initialHistory || [initialLevel?.entities || []],
  );
  const [historyIndex, setHistoryIndex] = useState(initialHistoryIndex ?? 0);

  // Initialize entities from history if available, else from level
  const [entities, setEntities] = useState<Entity[]>(
    initialHistory &&
      initialHistoryIndex !== undefined &&
      initialHistory[initialHistoryIndex]
      ? initialHistory[initialHistoryIndex]
      : initialLevel?.entities || [],
  );

  const [startPos, setStartPos] = useState<Vector2>(
    initialLevel?.start || { x: 50, y: 450 },
  );
  const [startPosP2, setStartPosP2] = useState<Vector2>(
    initialLevel?.startP2 || { x: GAME_WIDTH - 70, y: 450 },
  );
  const [levelWidth, setLevelWidth] = useState<number>(
    initialLevel?.isBrawler ? GAME_WIDTH : initialLevel?.width || GAME_WIDTH,
  );
  const [levelHeight, setLevelHeight] = useState<number>(
    initialLevel?.isBrawler ? GAME_HEIGHT : initialLevel?.height || GAME_HEIGHT,
  );
  const [isBrawler, setIsBrawler] = useState<boolean>(
    initialLevel?.isBrawler || false,
  );
  const [selectedTool, setSelectedTool] = useState<
    EntityType | "start" | "startP2" | "eraser" | "select"
  >("wall");
  const [prevTool, setPrevTool] = useState<
    EntityType | "start" | "startP2" | "eraser" | "select"
  >("wall");
  const [allowedAbility, setAllowedAbility] = useState<LevelAbility>(
    initialLevel?.allowedAbility || "none"
  );
  const [autoScroll, setAutoScroll] = useState<boolean>(
    initialLevel?.autoScroll || false,
  );
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(
    initialLevel?.autoScrollSpeed || 150,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [rightClickDragging, setRightClickDragging] = useState(false);
  const [isDraggingEntities, setIsDraggingEntities] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialDragPositions, setInitialDragPositions] = useState<
    { x: number; y: number }[]
  >([]);
  const [clipboard, setClipboard] = useState<Entity[]>([]);
  const [hasChanged, setHasChanged] = useState(false);

  // QoL States
  const [showGrid, setShowGrid] = useState(true);
  const [symmetryEnabled, setSymmetryEnabled] = useState(false);
  const [hoveredEntityIndex, setHoveredEntityIndex] = useState<number | null>(
    null,
  );
  const [lastPlacedGridPos, setLastPlacedGridPos] = useState<Vector2 | null>(
    null,
  );

  const [selectedEntityIndices, setSelectedEntityIndices] = useState<number[]>(
    [],
  );

  const [radialScale, setRadialScale] = useState<number>(0.75);

  const entitiesRef = useRef(entities);
  const selectedIndicesRef = useRef(selectedEntityIndices);
  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);
  useEffect(() => {
    selectedIndicesRef.current = selectedEntityIndices;
  }, [selectedEntityIndices]);
  // Active Property for Keyboard Control ('w', 'h', 'x', 'y')
  const [activeProperty, setActiveProperty] = useState<string | null>(null);
  const lastExternalSyncString = useRef<string | null>(null);
  const recentSentSyncs = useRef<string[]>([]);

  useEffect(() => {
    if (externalLevelSync) {
      const incomingString = JSON.stringify({
        entities: externalLevelSync.entities,
        start: externalLevelSync.start,
        startP2: externalLevelSync.startP2,
        width: externalLevelSync.width || GAME_WIDTH,
        height: externalLevelSync.height || GAME_HEIGHT,
        isBrawler: externalLevelSync.isBrawler || false,
        allowedAbility: externalLevelSync.allowedAbility || "none",
        autoScroll: externalLevelSync.autoScroll || false,
        autoScrollSpeed: externalLevelSync.autoScrollSpeed || 2,
        name: externalLevelSync.name || levelName
      });
      
      // If we recently sent this exact state, ignore it to prevent rollback from delayed network echo
      if (recentSentSyncs.current.includes(incomingString)) {
        return;
      }

      setEntities(externalLevelSync.entities);
      setStartPos(externalLevelSync.start);
      if (externalLevelSync.startP2) setStartPosP2(externalLevelSync.startP2);
      setLevelWidth(externalLevelSync.width || GAME_WIDTH);
      setLevelHeight(externalLevelSync.height || GAME_HEIGHT);
      setIsBrawler(externalLevelSync.isBrawler || false);
      setAllowedAbility(externalLevelSync.allowedAbility || "none");
      setAutoScroll(externalLevelSync.autoScroll || false);
      setAutoScrollSpeed(externalLevelSync.autoScrollSpeed || 2);
    }
  }, [externalLevelSync]);

  // Popup Position State
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isDraggingPopup, setIsDraggingPopup] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [globalTooltip, setGlobalTooltip] = useState<{
    text: string;
    clientX: number;
    clientY: number;
  } | null>(null);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const editorRootRef = useRef<HTMLDivElement>(null);

  const handleTooltipEnter = (e: React.MouseEvent, text: string) => {
    e.persist?.();
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => {
      setGlobalTooltip({ text, clientX, clientY });
    }, 2000);
  };
  const handleTooltipMove = (e: React.MouseEvent) => {
    if (globalTooltip) {
      setGlobalTooltip((prev) => prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : null);
    }
  };
  const handleTooltipLeave = () => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setGlobalTooltip(null);
  };

  useEffect(() => {
    if (selectedEntityIndices.length > 0 && !isDraggingPopup) {
      const lastIdx = selectedEntityIndices[selectedEntityIndices.length - 1];
      const ent = entities[lastIdx];
      // Initial position
      const initialX = Math.max(
        10,
        Math.min(ent.x + ent.w + 10, levelWidth - 250),
      );
      const initialY = Math.max(50, Math.min(ent.y - 10, levelHeight - 350));
      if (!popupPos) setPopupPos({ x: initialX, y: initialY });
    } else if (selectedEntityIndices.length === 0) {
      setPopupPos(null);
    }
  }, [selectedEntityIndices]);

  const t =
    TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS["EN"];

  useEffect(() => {
    if (hoveredRadialTool) {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = setTimeout(() => {
        const text = t.blockNames?.[hoveredRadialTool] || tools.find((tool) => tool.id === hoveredRadialTool)?.label.split(" (")[0];
        if (text && mousePosRef.current) {
          setGlobalTooltip({ text, clientX: mousePosRef.current.x, clientY: mousePosRef.current.y });
        }
      }, 2000);
    } else {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      setGlobalTooltip(null);
    }
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, [hoveredRadialTool, t.blockNames]);

  useEffect(() => {
    if (!radialMenuPos) {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      setGlobalTooltip(null);
    }
  }, [radialMenuPos]);

  // Helper to push new state to history
  const pushHistory = useCallback(
    (newEntities: Entity[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newEntities);
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
      setEntities(newEntities);
      setHasChanged(true);
    },
    [historyIndex],
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEntities(history[newIndex]);
      setSelectedEntityIndices([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEntities(history[newIndex]);
      setSelectedEntityIndices([]);
    }
  };

  // Safe exit function with warning
  const handleExitRequest = useCallback(() => {
    // Always show confirmation modal regardless of changes
    setShowExitConfirmation(true);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleCopy = () => {
      if (selectedEntityIndices.length > 0) {
        const toCopy = selectedEntityIndices.map((idx) => ({
          ...entities[idx],
        }));
        setClipboard(toCopy);
        if (showToast) showToast(`Copied ${toCopy.length} items`);
      }
    };

    const handlePaste = () => {
      if (clipboard.length > 0) {
        // Offset pasted items slightly
        const pasted = clipboard.map((ent) => ({
          ...ent,
          id: ent.id
            ? `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            : undefined,
          x: ent.x + TILE_SIZE,
          y: ent.y + TILE_SIZE,
        }));

        // Coin Limit Check
        const pasteCoins = pasted.filter((e) => e.type === "coin").length;
        const currentCoins = entities.filter((e) => e.type === "coin").length;
        if (currentCoins + pasteCoins > 13) {
          if (showToast)
            showToast(t.maxCoinsReached || "Max 13 coins per level!");
          return;
        }

        const newEntities = [...entities, ...pasted];
        pushHistory(newEntities);

        // Select the newly pasted items
        const newIndices = pasted.map((_, i) => entities.length + i);
        setSelectedEntityIndices(newIndices);
        if (showToast) showToast(`Pasted ${pasted.length} items`);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "SELECT"
      )
        return;

      if (showExitConfirmation) {
        if (e.code === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setShowExitConfirmation(false);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.code === "KeyC") {
        e.preventDefault();
        handleCopy();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyV") {
        e.preventDefault();
        handlePaste();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyX") {
        e.preventDefault();
        handleCopy();
        handleDeleteSelected();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyY") {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (selectedEntityIndices.length > 0 && activeProperty) {
        let delta = 0;
        const speed = e.shiftKey ? 10 : 1;

        if (["ArrowLeft", "KeyA", "ArrowDown", "KeyS"].includes(e.code))
          delta = -1 * speed;
        else if (["ArrowRight", "KeyD", "ArrowUp", "KeyW"].includes(e.code))
          delta = 1 * speed;

        if (delta !== 0) {
          e.preventDefault();
          e.stopPropagation();
          const updated = [...entities];
          selectedEntityIndices.forEach((idx) => {
            const ent = updated[idx];
            const newVal =
              (ent[activeProperty as keyof Entity] as number) + delta;
            let validated = newVal;
            if (activeProperty === "w" || activeProperty === "h") {
              validated = Math.max(10, newVal);
            } else if (activeProperty === "x") {
              const w = ent.w || 30;
              validated = Math.max(0, Math.min(levelWidth - w, newVal));
            } else if (activeProperty === "y") {
              const h = ent.h || 30;
              validated = Math.max(0, Math.min(levelHeight - h, newVal));
            }
            updated[idx] = { ...ent, [activeProperty]: validated };
          });
          pushHistory(updated);
          return;
        }
      }

      switch (e.code) {
        case "Digit1":
          setSelectedTool("wall");
          break;
        case "Digit2":
          setSelectedTool("eraser");
          break;
        case "Digit3":
          setSelectedTool("start");
          break;
        case "Digit4":
          setSelectedTool("hazard");
          break;
        case "Digit5":
          setSelectedTool("coin");
          break;
        case "Digit6":
          setSelectedTool("goal");
          break;
        case "Digit7":
          setSelectedTool("ice");
          break;
        case "Digit8":
          setSelectedTool("trampoline");
          break;
        case "Digit9":
          setSelectedTool("slime");
          break;
        case "KeyV":
        case "KeyS":
          if (!e.ctrlKey && !e.metaKey) setSelectedTool("select");
          break;
        case "KeyG":
          setShowGrid((prev) => !prev);
          break;
        case "KeyY":
        case "KeyZ":
          if (!e.ctrlKey && !e.metaKey && isBrawler)
            setSymmetryEnabled((prev) => !prev);
          break;
        case "KeyC":
          if (!e.ctrlKey && !e.metaKey) setSelectedTool("checkpoint");
          break;
        case "KeyE":
          if (selectedTool === "eraser") {
            setSelectedTool(prevTool);
          } else {
            setPrevTool(selectedTool);
            setSelectedTool("eraser");
          }
          break;
        case "Delete":
        case "Backspace":
          if (selectedEntityIndices.length > 0) handleDeleteSelected();
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          if (selectedEntityIndices.length > 0) {
            setSelectedEntityIndices([]);
            setActiveProperty(null);
          } else {
            // If nothing selected, try to exit
            handleExitRequest();
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedEntityIndices,
    activeProperty,
    entities,
    history,
    historyIndex,
    handleExitRequest,
    showExitConfirmation,
  ]);

  useEffect(() => {
    if (selectedTool !== "select") {
      setSelectedEntityIndices([]);
      setActiveProperty(null);
    }
  }, [selectedTool]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, levelWidth, levelHeight);

    if (showGrid) {
      ctx.strokeStyle = COLORS.GRID;
      ctx.lineWidth = 1;
      for (let x = 0; x <= levelWidth; x += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, levelHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= levelHeight; y += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(levelWidth, y);
        ctx.stroke();
      }
    }

    // Calculate Teleporters for visualization
    const teleporters = entities.filter((e) => e.type === "teleport");

    // Draw Teleport Connections (Lines)
    if (teleporters.length > 1) {
      ctx.save();
      ctx.strokeStyle = COLORS.TELEPORT;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.globalAlpha = 0.5; // Slightly clearer in Editor

      ctx.beginPath();
      teleporters.forEach((tp, i) => {
        const nextTp = teleporters[(i + 1) % teleporters.length];
        const startX = tp.x + tp.w / 2;
        const startY = tp.y + tp.h / 2;
        const endX = nextTp.x + nextTp.w / 2;
        const endY = nextTp.y + nextTp.h / 2;

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Shadow pass for editor
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    entities.forEach((ent) => {
      const isSolid =
        ent.type === "wall" ||
        ent.type === "ice" ||
        ent.type === "slime" ||
        ent.type === "troll_wall" ||
        ent.type === "walkthrough_wall" ||
        ent.type === "fake_ice" ||
        ent.type === "fake_slime" ||
        ent.type === "moving_platform_h" ||
        ent.type === "moving_platform_v" ||
        ent.type === "fragile";
      if (isSolid) {
        ctx.rect(ent.x + 6, ent.y + 6, ent.w, ent.h);
      }
    });
    ctx.fill();

    entities.forEach((ent, index) => {
      // Editor specific rendering for fake items
      const isGhost =
        ent.type === "walkthrough_wall" ||
        ent.type === "ghost_hazard" ||
        ent.type === "fake_ice" ||
        ent.type === "fake_slime" ||
        ent.type === "fake_goal";

      if (isGhost) ctx.globalAlpha = 0.5;

      const isMoving =
        ent.type === "moving_platform_h" ||
        ent.type === "moving_platform_v" ||
        ent.movingH ||
        ent.movingV;
      const isFragile = ent.type === "fragile" || ent.fragile;

      if (ent.type === "wall" || ent.type === "walkthrough_wall")
        ctx.fillStyle = COLORS.WALL;
      else if (ent.type === "hazard" || ent.type === "ghost_hazard")
        ctx.fillStyle = COLORS.HAZARD;
      else if (ent.type === "goal" || ent.type === "fake_goal")
        ctx.fillStyle = COLORS.GOAL;
      else if (ent.type === "coin") ctx.fillStyle = COLORS.COIN;
      else if (ent.type === "ice" || ent.type === "fake_ice")
        ctx.fillStyle = COLORS.ICE;
      else if (ent.type === "trampoline") ctx.fillStyle = COLORS.TRAMPOLINE;
      else if (ent.type === "slime" || ent.type === "fake_slime")
        ctx.fillStyle = COLORS.SLIME;
      else if (ent.type === "teleport") ctx.fillStyle = COLORS.TELEPORT;
      else if (ent.type === "powerup_build")
        ctx.fillStyle = COLORS.POWERUP_BUILD;
      else if (ent.type === "powerup_hook") ctx.fillStyle = COLORS.POWERUP_HOOK;
      else if (ent.type === "powerup_double_jump")
        ctx.fillStyle = COLORS.POWERUP_DJ;
      else if (ent.type === "powerup_slow_mo")
        ctx.fillStyle = COLORS.POWERUP_SLOW_MO;
      else if (ent.type === "powerup_xray") ctx.fillStyle = COLORS.POWERUP_XRAY;
      else if (ent.type === "block_dash")
        ctx.fillStyle = "#f59e0b"; // amber-500
      else if (ent.type === "block_shrink")
        ctx.fillStyle = "#10b981"; // emerald-500
      else if (ent.type === "block_grow")
        ctx.fillStyle = "#ef4444"; // red-500
      else if (ent.type === "block_gravity")
        ctx.fillStyle = "#8b5cf6"; // violet-500
      else if (ent.type === "powerup_spawner") ctx.fillStyle = "#ff00ff";
      else if (ent.type === "checkpoint") ctx.fillStyle = COLORS.CHECKPOINT;
      else if (ent.type === "powerup_remover")
        ctx.fillStyle = COLORS.REMOVE_ABILITY;
      else if (isMoving) ctx.fillStyle = "#f97316";
      else if (isFragile) ctx.fillStyle = "#d6d3d1";
      else if (ent.type === "gravity_reverse") ctx.fillStyle = "#a855f7";
      else if (ent.type === "gravity_zero") ctx.fillStyle = "#0ea5e9";
      else ctx.fillStyle = "#fff";

      if (ent.type === "coin") {
        ctx.beginPath();
        ctx.arc(
          ent.x + ent.w / 2,
          ent.y + ent.h / 2,
          ent.w / 2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else if (ent.type === "powerup_remover") {
        ctx.globalAlpha = 0.5;
        ctx.fillRect(ent.x, ent.y, ent.w, ent.h);
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ent.x, ent.y);
        ctx.lineTo(ent.x + ent.w, ent.y + ent.h);
        ctx.moveTo(ent.x + ent.w, ent.y);
        ctx.lineTo(ent.x, ent.y + ent.h);
        ctx.stroke();
      } else {
        if (ent.type === "gravity_reverse" || ent.type === "gravity_zero") {
          ctx.strokeStyle = ctx.fillStyle as string;
          ctx.lineWidth = 2;
          ctx.strokeRect(ent.x, ent.y, ent.w, ent.h);
        } else {
          ctx.fillRect(ent.x, ent.y, ent.w, ent.h);
        }

        // Ghost Visual Indicator in Editor
        if (isGhost) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
          ctx.lineWidth = 2;
          ctx.strokeRect(ent.x, ent.y, ent.w, ent.h);
          ctx.globalAlpha = 1.0; // Reset
        }

        if (ent.type === "teleport") {
          ctx.strokeStyle = "white";
          ctx.strokeRect(ent.x + 5, ent.y + 5, ent.w - 10, ent.h - 10);

          // Draw Order Number
          const tpIndex = teleporters.indexOf(ent);
          if (tpIndex !== -1) {
            ctx.fillStyle = "white";
            ctx.font = "bold 12px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              `${tpIndex + 1}`,
              ent.x + ent.w / 2,
              ent.y + ent.h / 2,
            );
            ctx.textAlign = "left"; // reset
            ctx.textBaseline = "alphabetic"; // reset
          }
        }
        if (isFragile) {
          ctx.strokeStyle = "rgba(0,0,0,0.3)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ent.x + 5, ent.y + 5);
          ctx.lineTo(ent.x + ent.w - 5, ent.y + ent.h - 5);
          ctx.moveTo(ent.x + ent.w - 5, ent.y + 5);
          ctx.lineTo(ent.x + 5, ent.y + ent.h - 5);
          ctx.stroke();
        }
        if (ent.type === "gravity_reverse") {
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.beginPath();
          const centerX = ent.x + ent.w / 2;
          const centerY = ent.y + ent.h / 2;
          const size = 16;
          ctx.moveTo(centerX, centerY + size / 2);
          ctx.lineTo(centerX + size / 2, centerY - size / 2);
          ctx.lineTo(centerX - size / 2, centerY - size / 2);
          ctx.fill();
        }
        if (ent.type === "gravity_zero") {
          ctx.strokeStyle = "rgba(255,255,255,0.5)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          const centerX = ent.x + ent.w / 2;
          const centerY = ent.y + ent.h / 2;
          const radius = 6;
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (ent.type === "checkpoint") {
          ctx.strokeStyle = "rgba(0,0,0,0.5)";
          ctx.lineWidth = 2;
          ctx.strokeRect(ent.x, ent.y, ent.w, ent.h);
          ctx.fillStyle = "black";
          ctx.font = "10px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("CP", ent.x + ent.w / 2, ent.y + ent.h / 2);
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
        }
        if (ent.type.startsWith("powerup_") || ent.type.startsWith("block_")) {
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          ctx.lineWidth = 2;
          ctx.strokeRect(ent.x + 2, ent.y + 2, ent.w - 4, ent.h - 4);
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.font = "10px monospace";
          ctx.textAlign = "center";
          let letter = "?";
          if (ent.type === "powerup_build") letter = "B";
          if (ent.type === "powerup_hook") letter = "H";
          if (ent.type === "powerup_double_jump") letter = "J";
          if (ent.type === "powerup_slow_mo") letter = "T";
          if (ent.type === "powerup_xray") letter = "X";
          if (ent.type === "block_dash") letter = "D";
          if (ent.type === "block_shrink") letter = "S";
          if (ent.type === "block_grow") letter = "G";
          if (ent.type === "block_gravity") letter = "V";
          ctx.fillText(letter, ent.x + ent.w / 2, ent.y + ent.h / 2 + 3);
          ctx.textAlign = "left";
        }
      }

      if (
        selectedEntityIndices.includes(index) ||
        hoveredEntityIndex === index
      ) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth =
          hoveredEntityIndex === index && !selectedEntityIndices.includes(index)
            ? 1
            : 2;
        ctx.strokeRect(ent.x - 2, ent.y - 2, ent.w + 4, ent.h + 4);

        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(ent.x - 2, ent.y - 2, ent.w + 4, ent.h + 4);
        ctx.setLineDash([]);
      }
    });

    ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
    ctx.fillRect(startPos.x, startPos.y, 20, 20);
    ctx.fillStyle = "#fff";
    ctx.font = "10px monospace";
    ctx.fillText(
      isBrawler ? "SPAWN P1" : "START",
      startPos.x - 5,
      startPos.y - 5,
    );

    if (isBrawler) {
      ctx.fillStyle = "rgba(0, 255, 136, 0.5)";
      ctx.fillRect(startPosP2.x, startPosP2.y, 20, 20);
      ctx.fillStyle = "#fff";
      ctx.font = "10px monospace";
      ctx.fillText("SPAWN P2", startPosP2.x - 5, startPosP2.y - 5);
    }
  }, [
    entities,
    startPos,
    startPosP2,
    isBrawler,
    selectedEntityIndices,
    levelWidth,
    levelHeight,
    showGrid,
  ]);

  useEffect(() => {
    draw();
  }, [draw, levelWidth, levelHeight, showGrid]);

  const generateStableId = () => {
    return `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleInteraction = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = levelWidth / rect.width;
    const scaleY = levelHeight / rect.height;

    let x = (e.clientX - rect.left) * scaleX;
    let y = (e.clientY - rect.top) * scaleY;

    // Right Click to erase
    const isRightClick = e.button === 2 || e.nativeEvent.which === 3;

    // Eyedropper (Alt + Click)
    if (e.altKey && e.type === "mousedown") {
      for (let i = entities.length - 1; i >= 0; i--) {
        const ent = entities[i];
        if (
          x >= ent.x &&
          x <= ent.x + ent.w &&
          y >= ent.y &&
          y <= ent.y + ent.h
        ) {
          setSelectedTool(ent.type as any);
          if (showToast) showToast(`Picked: ${ent.type}`);
          return;
        }
      }
    }

    if (selectedTool === "select" && !isRightClick) {
      if (e.type === "mousedown") {
        let foundIndex = -1;
        for (let i = entities.length - 1; i >= 0; i--) {
          const ent = entities[i];
          if (
            x >= ent.x &&
            x <= ent.x + ent.w &&
            y >= ent.y &&
            y <= ent.y + ent.h
          ) {
            foundIndex = i;
            break;
          }
        }

        if (foundIndex !== -1) {
          if (e.ctrlKey || e.metaKey) {
            if (selectedEntityIndices.includes(foundIndex)) {
              setSelectedEntityIndices(
                selectedEntityIndices.filter((idx) => idx !== foundIndex),
              );
            } else {
              setSelectedEntityIndices([...selectedEntityIndices, foundIndex]);
            }
          } else {
            if (!selectedEntityIndices.includes(foundIndex)) {
              setSelectedEntityIndices([foundIndex]);
            }
            // Start dragging
            setIsDraggingEntities(true);
            setDragStartPos({ x, y });
            setInitialDragPositions(
              selectedEntityIndices.includes(foundIndex)
                ? selectedEntityIndices.map((idx) => ({
                    x: entities[idx].x,
                    y: entities[idx].y,
                  }))
                : [{ x: entities[foundIndex].x, y: entities[foundIndex].y }],
            );
          }
        } else {
          if (!(e.ctrlKey || e.metaKey)) {
            setSelectedEntityIndices([]);
          }
        }
        setActiveProperty(null);
      }
      return;
    }

    // Drawing straight lines with Shift
    if (e.shiftKey && isDragging && dragStartPos) {
      const dx = Math.abs(x - dragStartPos.x);
      const dy = Math.abs(y - dragStartPos.y);
      if (dx > dy) y = dragStartPos.y;
      else x = dragStartPos.x;
    }

    // Determine tool dimensions first for centering in free mode
    let w = TILE_SIZE,
      h = TILE_SIZE;
    if (selectedTool === "goal" || selectedTool === "fake_goal") {
      w = 30;
      h = 30;
    } else if (selectedTool === "coin") {
      w = 20;
      h = 20;
    } else if (selectedTool === "teleport") {
      w = 29;
      h = 29;
    } else if (
      selectedTool.startsWith("powerup") ||
      selectedTool.startsWith("block_") ||
      selectedTool === "checkpoint" ||
      selectedTool === "powerup_remover"
    ) {
      w = 30;
      h = 30;
    }

    const gridX = showGrid ? Math.floor(x / TILE_SIZE) * TILE_SIZE : x - w / 2;
    const gridY = showGrid ? Math.floor(y / TILE_SIZE) * TILE_SIZE : y - h / 2;

    const distToLast = lastPlacedGridPos ? Math.hypot(lastPlacedGridPos.x - gridX, lastPlacedGridPos.y - gridY) : 0;
    if (
      lastPlacedGridPos &&
      (showGrid
        ? Math.abs(lastPlacedGridPos.x - gridX) < 1 && Math.abs(lastPlacedGridPos.y - gridY) < 1
        : distToLast < 15) &&
      e.type === "mousemove" &&
      selectedTool !== "eraser" &&
      !isRightClick
    ) {
      return;
    }

    if (gridX < 0 || gridX >= levelWidth || gridY < 0 || gridY >= levelHeight)
      return;

    if (selectedTool === "start") {
      setStartPos({
        x: showGrid ? gridX + (TILE_SIZE - 20) / 2 : x - 10,
        y: showGrid ? gridY + (TILE_SIZE - 20) / 2 : y - 10,
      });
      setHasChanged(true);
    } else if (selectedTool === "startP2") {
      setStartPosP2({
        x: showGrid ? gridX + (TILE_SIZE - 20) / 2 : x - 10,
        y: showGrid ? gridY + (TILE_SIZE - 20) / 2 : y - 10,
      });
      setHasChanged(true);
    } else if (selectedTool === "eraser" || isRightClick) {
      const newEntities = entities.filter(
        (ent) =>
          !(x >= ent.x && x < ent.x + ent.w && y >= ent.y && y < ent.y + ent.h),
      );
      if (newEntities.length !== entities.length) {
        let finalEntities = newEntities;
        // Symmetry Erase
        if (symmetryEnabled) {
          const mirrorX = levelWidth - x;
          finalEntities = newEntities.filter(
            (ent) =>
              !(
                mirrorX >= ent.x &&
                mirrorX < ent.x + ent.w &&
                y >= ent.y &&
                y < ent.y + ent.h
              ),
          );
        }
        setEntities(finalEntities);
        setHasChanged(true);
      }
    } else {
      const isGravityTool =
        selectedTool === "gravity_reverse" || selectedTool === "gravity_zero";

      // For gravity tools, we only replace if there's already a gravity tool of the SAME type at this spot.
      // For other tools, we only replace if there's a non-gravity block at this spot.
      const existingIndex = entities.findIndex((ent) => {
        if (isGravityTool) {
          if (showGrid) {
            return ent.x === gridX && ent.y === gridY && ent.type === selectedTool;
          } else {
            // Distance check for free mode
            const dist = Math.hypot(ent.x - gridX, ent.y - gridY);
            return dist < 5 && ent.type === selectedTool;
          }
        } else {
          const entIsGravity =
            ent.type === "gravity_reverse" || ent.type === "gravity_zero";
          if (showGrid) {
            return (
              ent.x >= gridX &&
              ent.x < gridX + TILE_SIZE &&
              ent.y >= gridY &&
              ent.y < gridY + TILE_SIZE &&
              !entIsGravity
            );
          } else {
            // Overlap check for free mode
            // We only consider it the "same block" to prevent painting over it
            // if the distance is very small (less than 15 pixels).
            const dist = Math.hypot(ent.x - gridX, ent.y - gridY);
            return dist < 15 && !entIsGravity;
          }
        }
      });

      // Coin Limit Check
      if (selectedTool === "coin") {
        const coinCount = entities.filter((e) => e.type === "coin").length;
        const isReplacingCoin =
          existingIndex !== -1 && entities[existingIndex].type === "coin";
        if (!isReplacingCoin && coinCount >= 13) {
          if (showToast)
            showToast(t.maxCoinsReached || "Max 13 coins per level!");
          return;
        }
      }

      // We remove the redeclaration of w and h here because they are defined at the top of handleInteraction
      // and we update them there based on the tool.

      if (existingIndex !== -1) {
        if (entities[existingIndex].type !== selectedTool) {
          // If free movement is on, we might want to allow subtle overlaps or just replace if very close
          const updatedEntities = [...entities];
          updatedEntities[existingIndex] = {
            x:
              selectedTool === "coin"
                ? gridX + (showGrid ? 5 : 0)
                : selectedTool === "teleport"
                  ? gridX + (showGrid ? 0.5 : 0)
                  : gridX,
            y:
              selectedTool === "coin"
                ? gridY + (showGrid ? 5 : 0)
                : selectedTool === "teleport"
                  ? gridY + (showGrid ? 0.5 : 0)
                  : gridY,
            w,
            h,
            type: selectedTool as EntityType,
            id:
              selectedTool === "coin" ||
              selectedTool === "fragile" ||
              selectedTool.startsWith("powerup") ||
              selectedTool.startsWith("moving_platform")
                ? generateStableId()
                : undefined,
          };

          if (symmetryEnabled) {
            const mirrorX = levelWidth - (updatedEntities[existingIndex].x + w);
            const mirroredEntity = {
              ...updatedEntities[existingIndex],
              x: mirrorX,
            };
            updatedEntities.push(mirroredEntity);
          }

          setEntities(updatedEntities);
          setHasChanged(true);
          setLastPlacedGridPos({ x: gridX, y: gridY });
        }
      } else {
        const newEntity = {
          x:
            selectedTool === "coin"
              ? gridX + (showGrid ? 5 : 0)
              : selectedTool === "teleport"
                ? gridX + (showGrid ? 0.5 : 0)
                : gridX,
          y:
            selectedTool === "coin"
              ? gridY + (showGrid ? 5 : 0)
              : selectedTool === "teleport"
                ? gridY + (showGrid ? 0.5 : 0)
                : gridY,
          w,
          h,
          type: selectedTool as EntityType,
          id:
            selectedTool === "coin" ||
            selectedTool === "fragile" ||
            selectedTool.startsWith("powerup") ||
            selectedTool.startsWith("moving_platform")
              ? generateStableId()
              : undefined,
        };

        let newEntities = [...entities, newEntity];
        if (symmetryEnabled) {
          const mirrorX = levelWidth - (newEntity.x + w);
          const mirroredEntity = { ...newEntity, x: mirrorX };
          newEntities.push(mirroredEntity);
        }
        setEntities(newEntities);
        setHasChanged(true);
        setLastPlacedGridPos({ x: gridX, y: gridY });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      setRadialMenuPos({ x: e.clientX, y: e.clientY });
      setHoveredRadialTool(null);
      setActiveRadialCategory(null);
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    setDragStartPos({ x: 0, y: 0 }); // Initial value, will be set in handleInteraction

    // Set drag start for lines
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = levelWidth / rect.width;
      const scaleY = levelHeight / rect.height;
      setDragStartPos({
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      });
    }

    handleInteraction(e);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    if (isDragging) handleInteraction(e);

    if (isDraggingEntities && selectedEntityIndices.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = levelWidth / rect.width;
      const scaleY = levelHeight / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const dx = x - dragStartPos.x;
      const dy = y - dragStartPos.y;

      // Snap to 5px if grid is on, or just free move if grid is off
      const snapDx = showGrid ? Math.round(dx / 5) * 5 : dx;
      const snapDy = showGrid ? Math.round(dy / 5) * 5 : dy;

      const updated = [...entities];
      selectedEntityIndices.forEach((idx, i) => {
        if (updated[idx]) {
          const w = updated[idx].w || 30;
          const h = updated[idx].h || 30;
          let newX = initialDragPositions[i].x + snapDx;
          let newY = initialDragPositions[i].y + snapDy;
          newX = Math.max(0, Math.min(newX, levelWidth - w));
          newY = Math.max(0, Math.min(newY, levelHeight - h));
          updated[idx] = {
            ...updated[idx],
            x: newX,
            y: newY,
          };
        }
      });
      setEntities(updated);
      setHasChanged(true);
    }

    if (isDraggingPopup && popupPos) {
      const canvas = canvasRef.current;
      let scaleX = 1;
      let scaleY = 1;
      let rectLeft = 0;
      let rectTop = 0;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        scaleX = levelWidth / rect.width;
        scaleY = levelHeight / rect.height;
        rectLeft = rect.left;
        rectTop = rect.top;
      }
      // Ensure it stays within bounds
      const newX = Math.min(
        Math.max(0, (e.clientX - rectLeft) * scaleX - dragOffset.x),
        levelWidth - 240,
      );
      const newY = Math.min(
        Math.max(0, (e.clientY - rectTop) * scaleY - dragOffset.y),
        levelHeight - 300,
      );
      setPopupPos({ x: newX, y: newY });
    }
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (radialMenuPos && (e.button === 2 || e.button === 0)) {
      if (hoveredRadialTool) {
        setSelectedTool(hoveredRadialTool as any);
      } else if (activeRadialCategory !== null) {
        const toolsList = RADIAL_CATEGORIES[activeRadialCategory].tools;
        if (toolsList.length === 1) {
          setSelectedTool(toolsList[0] as any);
        }
      }
      setRadialMenuPos(null);
      setHoveredRadialTool(null);
    }

    if (isDraggingEntities || isDragging || rightClickDragging) {
      if (entities !== history[historyIndex]) {
        pushHistory(entities);
      }
    }
    if (isDraggingEntities) {
      setIsDraggingEntities(false);
    }

    setIsDragging(false);
    setRightClickDragging(false);
    setIsDraggingPopup(false);
    setLastPlacedGridPos(null);
  };

  const handleMouseLeaveRoot = (e: React.MouseEvent) => {
    mousePosRef.current = null;
    handleMouseUp(e);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // If horizontal scrolling (deltaX) or shiftKey is pressed (often used for horizontal scroll)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      const container = e.currentTarget.parentElement?.parentElement;
      if (container) {
        container.scrollLeft += e.deltaX || (e.shiftKey ? e.deltaY : 0);
      }
      return;
    }

    // Scroll through tools vertically
    const currentToolIndex = tools.findIndex((t) => t.id === selectedTool);
    if (currentToolIndex === -1) return;

    let nextIndex;
    if (e.deltaY > 0) {
      nextIndex = (currentToolIndex + 1) % tools.length;
    } else if (e.deltaY < 0) {
      nextIndex = (currentToolIndex - 1 + tools.length) % tools.length;
    } else {
      return;
    }
    setSelectedTool(tools[nextIndex].id as any);
  };

  const handleUpdateSelected = useCallback(
    (updates: Partial<Entity>, commit = true) => {
      const currentIndices = selectedIndicesRef.current;
      if (currentIndices.length === 0) return;

      // Coin Limit Check
      if (updates.type === "coin") {
        const coinCount = entitiesRef.current.filter(
          (e) => e.type === "coin",
        ).length;
        const alreadyCoins = currentIndices.filter(
          (idx) => entitiesRef.current[idx].type === "coin",
        ).length;
        if (coinCount - alreadyCoins + currentIndices.length > 13) {
          if (showToast)
            showToast(t.maxCoinsReached || "Max 13 coins per level!");
          return;
        }
      }

      if (commit) {
        const currentEntities = entitiesRef.current;
        const updated = [...currentEntities];
        currentIndices.forEach((idx) => {
          if (updated[idx]) {
            let ent = { ...updated[idx], ...updates };
            if (updates.x !== undefined) {
              const w = ent.w || 30;
              ent.x = Math.max(0, Math.min(ent.x, levelWidth - w));
            }
            if (updates.y !== undefined) {
              const h = ent.h || 30;
              ent.y = Math.max(0, Math.min(ent.y, levelHeight - h));
            }
            updated[idx] = ent;
          }
        });
        pushHistory(updated);
      } else {
        setEntities((prev) => {
          const updated = [...prev];
          currentIndices.forEach((idx) => {
            if (updated[idx]) {
              let ent = { ...updated[idx], ...updates };
              if (updates.x !== undefined) {
                const w = ent.w || 30;
                ent.x = Math.max(0, Math.min(ent.x, levelWidth - w));
              }
              if (updates.y !== undefined) {
                const h = ent.h || 30;
                ent.y = Math.max(0, Math.min(ent.y, levelHeight - h));
              }
              updated[idx] = ent;
            }
          });
          return updated;
        });
        setHasChanged(true);
      }
    },
    [pushHistory],
  );

  const handleDeleteSelected = () => {
    if (selectedEntityIndices.length === 0) return;
    const updated = entities.filter(
      (_, i) => !selectedEntityIndices.includes(i),
    );
    pushHistory(updated);
    setSelectedEntityIndices([]);
    setActiveProperty(null);
  };

  const getCurrentLevelData = useCallback((): LevelData => ({
    id: initialLevel?.id || `custom_${Date.now()}`,
    name: levelName,
    start: startPos,
    ...(isBrawler ? { startP2: startPosP2 } : {}),
    width: levelWidth,
    height: levelHeight,
    entities: entities,
    isCustom: true,
    isBrawler: isBrawler,
    allowedAbility: allowedAbility,
    autoScroll: autoScroll,
    autoScrollSpeed: autoScrollSpeed,
  }), [initialLevel?.id, levelName, startPos, isBrawler, startPosP2, levelWidth, levelHeight, entities, allowedAbility, autoScroll, autoScrollSpeed]);

  // Throttle syncing to prevent lag
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncTime = useRef<number>(0);

  useEffect(() => {
    if (onLevelChange) {
       const currentDataString = JSON.stringify({
         entities, start: startPos, startP2: startPosP2, width: levelWidth, height: levelHeight, isBrawler, allowedAbility, autoScroll, autoScrollSpeed, name: levelName
       });
       
       if (currentDataString !== lastExternalSyncString.current) {
          lastExternalSyncString.current = currentDataString;
          // Keep a ring buffer of recent syncs to prevent bouncing back to an old state
          recentSentSyncs.current.unshift(currentDataString);
          if (recentSentSyncs.current.length > 20) {
            recentSentSyncs.current.pop();
          }

          const performSync = () => {
            onLevelChange(getCurrentLevelData());
            lastSyncTime.current = Date.now();
          };

          const now = Date.now();
          const remains = 150 - (now - lastSyncTime.current);

          if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = null;
          }

          if (remains <= 0) {
            performSync();
          } else {
            syncTimeoutRef.current = setTimeout(performSync, remains);
          }
       }
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [entities, startPos, startPosP2, levelWidth, levelHeight, isBrawler, allowedAbility, autoScroll, autoScrollSpeed, levelName, onLevelChange, getCurrentLevelData]);

  const handleTest = () => {
    if (!isBrawler && entities.filter((e) => e.type === "goal").length === 0) {
      if (showToast) showToast("Level needs a GOAL!");
      else alert("Level needs a GOAL!");
      return;
    }
    
    // Immediately flush any throttled/pending level sync synchronously
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    if (onLevelChange) {
      onLevelChange(getCurrentLevelData());
    }

    onTest(getCurrentLevelData(), history, historyIndex);
  };

  // Renamed to RELEASE: Requires Verification (unless Brawler)
  const handleRelease = () => {
    const t = (TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS["EN"]) as any;
    if (levelName.length < 3) {
      if (showToast) showToast(t.nameTooShort || "Name too short (min 3)!");
      else alert(t.nameTooShort || "Name too short (min 3)!");
      return;
    }
    if (!isBrawler && !isVerified && hasChanged) {
      if (showToast)
        showToast(
          (t as any).editorUnverified ||
            "You must beat your level to verify it before releasing!",
        );
      else
        alert(
          (t as any).editorUnverified ||
            "You must beat your level to verify it before releasing!",
        );
      return;
    }
    onSave({ ...getCurrentLevelData(), isVerified: true });
  };

  // New: SAVE DRAFT: No Verification Required
  const handleSaveDraft = () => {
    const t = (TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS["EN"]) as any;
    if (levelName.length < 3) {
      if (showToast) showToast(t.nameTooShort || "Name too short (min 3)!");
      else alert(t.nameTooShort || "Name too short (min 3)!");
      return;
    }
    onSave({ ...getCurrentLevelData(), isVerified: false });
  };

  const canRelease = isBrawler || (isVerified && !hasChanged);

  const tools = isBrawler
    ? allTools.filter((t) =>
        [
          "select",
          "wall",
          "hazard",
          "start",
          "startP2",
          "ice",
          "trampoline",
          "slime",
          "powerup_spawner",
          "gravity_reverse",
          "gravity_zero",
          "block_dash",
          "block_shrink",
          "block_grow",
          "eraser",
        ].includes(t.id),
      )
    : allTools.filter((t) => !["startP2", "powerup_spawner"].includes(t.id));

  const currentCategories = isBrawler
    ? BRAWLER_RADIAL_CATEGORIES
    : RADIAL_CATEGORIES;

  const handleMouseMoveRadial = (e: React.MouseEvent) => {
    if (!radialMenuPos) return;
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    e.stopPropagation();
    const dx = e.clientX - radialMenuPos.x;
    const dy = e.clientY - radialMenuPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;
    const centerThreshold = 70 * radialScale;
    const ringThreshold = 230 * radialScale;

    if (distance <= centerThreshold) {
      setActiveRadialCategory(null);
      setHoveredRadialTool(null);
    } else {
      let catIndex = activeRadialCategory;
      if (distance < ringThreshold && !hoveredRadialTool) {
        const normalizedAngle =
          (angle + Math.PI / currentCategories.length) % (Math.PI * 2);
        catIndex = Math.floor(
          normalizedAngle / ((Math.PI * 2) / currentCategories.length),
        );
        setActiveRadialCategory(catIndex);
        setHoveredRadialTool(null);
      } else {
        if (catIndex === null) {
          const normalizedAngle =
            (angle + Math.PI / currentCategories.length) % (Math.PI * 2);
          catIndex = Math.floor(
            normalizedAngle / ((Math.PI * 2) / currentCategories.length),
          );
          setActiveRadialCategory(catIndex);
        }
        const toolsList = currentCategories[catIndex].tools;
        const catCenterAngle =
          catIndex * ((Math.PI * 2) / currentCategories.length);
        let relAngle = angle - catCenterAngle;
        if (relAngle > Math.PI) relAngle -= Math.PI * 2;
        if (relAngle < -Math.PI) relAngle += Math.PI * 2;

        const spread = Math.PI * 0.8;
        const startAngle = -spread / 2;
        const endAngle = spread / 2;

        let toolIdx = 0;
        if (toolsList.length > 0) {
          if (relAngle <= startAngle) {
            toolIdx = 0;
          } else if (relAngle >= endAngle) {
            toolIdx = toolsList.length - 1;
          } else {
            const percent = (relAngle - startAngle) / spread;
            toolIdx = Math.floor(percent * toolsList.length);
            toolIdx = Math.max(0, Math.min(toolsList.length - 1, toolIdx));
          }
        }

        // Only set tool if enough distance and more than one tool
        if (distance >= ringThreshold && toolsList.length > 1) {
          setHoveredRadialTool(toolsList[toolIdx] as any);
        } else {
          setHoveredRadialTool(null);
        }
      }
    }
  };

  const handleMouseUpRadial = (e: React.MouseEvent) => {
    if (e.button === 2 || e.button === 0) {
      if (hoveredRadialTool) {
        setSelectedTool(hoveredRadialTool as any);
      } else if (activeRadialCategory !== null) {
        const toolsList = currentCategories[activeRadialCategory].tools;
        if (toolsList.length === 1) {
          setSelectedTool(toolsList[0] as any);
        }
      }
      setRadialMenuPos(null);
      setHoveredRadialTool(null);
    }
  };

  const modalText = {
    // Changed title slightly to reflect that it's a general confirmation now, though maintaining original style
    title:
      lang === "DE"
        ? "LEVEL EDITOR VERLASSEN"
        : lang === "ES"
          ? "SALIR DEL EDITOR"
          : "EXIT EDITOR",
    desc:
      lang === "DE"
        ? "Möchtest du das Level speichern?"
        : lang === "ES"
          ? "¿Quieres guardar el nivel?"
          : "Do you want to save the level?",
    save: t.editorSaveDraft,
    discard:
      lang === "DE"
        ? "NICHT SPEICHERN & BEENDEN"
        : lang === "ES"
          ? "NO GUARDAR & SALIR"
          : "DISCARD & EXIT",
    cancel: t.back,
  };

  return (
    <div
      ref={editorRootRef}
      className="absolute inset-0 bg-neutral-900 flex flex-col z-50 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeaveRoot}
    >
      {globalTooltip && editorRootRef.current && (
        <div
          className="absolute z-[9999] px-2 py-1 bg-black/90 text-white font-arcade text-[10px] sm:text-[12px] border border-neutral-600 rounded pointer-events-none whitespace-nowrap shadow-xl"
          style={{
            left: globalTooltip.clientX - editorRootRef.current.getBoundingClientRect().left,
            top: globalTooltip.clientY - editorRootRef.current.getBoundingClientRect().top - 30,
            transform: 'translateX(-50%)' // Center horizontally, above cursor
          }}
        >
          {globalTooltip.text}
        </div>
      )}
      {radialMenuPos && (
        <div
          className="fixed inset-0 z-[100]"
          onContextMenu={(e) => e.preventDefault()}
          onMouseUp={handleMouseUpRadial}
          onMouseMove={handleMouseMoveRadial}
        >
          <div
            className="absolute transition-opacity duration-200"
            style={{ left: radialMenuPos.x, top: radialMenuPos.y, opacity: 1 }}
          >
            {/* Render Categories (Inner Ring) */}
            {currentCategories.map((cat, idx) => {
              const angle = idx * ((Math.PI * 2) / currentCategories.length);
              const radius = 150 * radialScale;
              const tx = Math.cos(angle) * radius;
              const ty = Math.sin(angle) * radius;
              const isHovered = activeRadialCategory === idx;
              const baseSize = 140 * radialScale;

              let catName =
                t.radialCategories?.[cat.name as keyof typeof t.radialCategories] ||
                cat.name;

              return (
                <div
                  key={cat.name}
                  className={`absolute flex flex-col items-center justify-center rounded-full transition-all
                           ${isHovered ? "z-20 bg-[#151515] shadow-[0_0_30px_rgba(0,0,0,0.6)]" : "z-10 bg-[#0a0a0a] opacity-90"}`}
                  style={{
                    width: `${baseSize}px`,
                    height: `${baseSize}px`,
                    marginLeft: `-${baseSize / 2}px`,
                    marginTop: `-${baseSize / 2}px`,
                    transform: `translate(${tx}px, ${ty}px) scale(${isHovered ? 1.25 : 1})`,
                    border: `${isHovered ? "4px" : "1px"} solid ${isHovered ? cat.color : "#333"}`,
                  }}
                >
                  <span
                    className="text-center font-bold tracking-tighter"
                    style={{
                      color: cat.color,
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: `${10 * radialScale}px`,
                      textShadow: "0 0 10px rgba(0,0,0,1)",
                    }}
                  >
                    {catName.toUpperCase()}
                  </span>
                </div>
              );
            })}

            {/* Render Tools for Active Category (Outer Ring) */}
            {activeRadialCategory !== null &&
              currentCategories[activeRadialCategory].tools.length > 1 &&
              currentCategories[activeRadialCategory].tools.map((tId, idx, toolsList) => {
                const catCenterAngle =
                  activeRadialCategory * ((Math.PI * 2) / currentCategories.length);
                const spread = Math.PI * 0.8;
                const startAngle = catCenterAngle - spread / 2;
                const angleOffset = spread / toolsList.length;
                const angle = startAngle + (idx + 0.5) * angleOffset;

                const radius = 350 * radialScale;
                const tx = Math.cos(angle) * radius;
                const ty = Math.sin(angle) * radius;
                const tool = allTools.find((t) => t.id === tId);
                const isHovered = hoveredRadialTool === tId;
                const toolSize = 110 * radialScale;

                const displayValue =
                  t.blockNames?.[tId as keyof typeof t.blockNames] ||
                  tool?.label.split(" (")[0] ||
                  "";

                return (
                  <div
                    key={tId}
                    title={
                      t.blockNames?.[tId as keyof typeof t.blockNames] ||
                      tool?.label.split(" (")[0]
                    }
                    className={`absolute z-10 flex items-center justify-center rounded-full font-bold transition-all p-2 text-center
                          ${isHovered ? "z-30 border-2 border-white bg-neutral-700 text-white shadow-[0_0_20px_rgba(255,255,255,0.4)]" : "z-10 border border-neutral-600 bg-neutral-900 opacity-90 text-neutral-400"}`}
                    style={{
                      width: `${toolSize}px`,
                      height: `${toolSize}px`,
                      marginLeft: `-${toolSize / 2}px`,
                      marginTop: `-${toolSize / 2}px`,
                      transform: `translate(${tx}px, ${ty}px) scale(${isHovered ? 1.25 : 1})`,
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: `${9 * radialScale}px`,
                      lineHeight: "1.2",
                      backgroundColor:
                        isHovered && tool && tool.color ? tool.color : undefined,
                      color:
                        isHovered &&
                        tool &&
                        tool.color &&
                        ["#ffff00", "#00ff88", "#00ffff", "#ffffff"].includes(
                          tool.color.toLowerCase(),
                        )
                          ? "#000"
                          : undefined,
                    }}
                  >
                    {displayValue.toUpperCase()}
                  </div>
                );
              })}
            {/* Center Dot Area */}
            {(() => {
              let displayLabel = "";
              let displayColor = "#fff";

              if (hoveredRadialTool) {
                const tool = allTools.find((t) => t.id === hoveredRadialTool);
                displayLabel =
                  t.blockNames?.[hoveredRadialTool as keyof typeof t.blockNames] ||
                  tool?.label.split(" (")[0] ||
                  hoveredRadialTool;
                displayColor = tool?.color || "#fff";
              } else if (activeRadialCategory !== null) {
                const cat = currentCategories[activeRadialCategory];
                displayLabel =
                  t.radialCategories?.[cat.name as keyof typeof t.radialCategories] ||
                  cat.name;
                displayColor = cat.color;
              }

              const centerSize = 128 * radialScale;

              return (
                <div
                  className="absolute z-50 flex items-center justify-center rounded-full border-2 border-neutral-600 bg-[#0a0a0a] pointer-events-none shadow-[0_0_20px_rgba(0,0,0,1)]"
                  style={{
                    width: `${centerSize}px`,
                    height: `${centerSize}px`,
                    marginLeft: `-${centerSize / 2}px`,
                    marginTop: `-${centerSize / 2}px`,
                  }}
                >
                  {displayLabel ? (
                    <span
                      className="break-words px-2 text-center font-bold leading-normal tracking-tighter"
                      style={{
                        color: displayColor,
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: `${16 * radialScale}px`,
                        textShadow: "0 0 5px rgba(0,0,0,0.5)",
                      }}
                    >
                      {displayLabel.toUpperCase()}
                    </span>
                  ) : (
                    <div
                      className="rounded-full bg-neutral-700 shadow-inner"
                      style={{
                        width: `${16 * radialScale}px`,
                        height: `${16 * radialScale}px`,
                      }}
                    />
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    <div className="bg-neutral-900 border-b border-neutral-700 p-2 flex flex-col gap-2 select-none relative z-[60] shadow-xl">
      {/* Row 1: Level Identity & Main Settings */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={levelName}
            onChange={(e) => {
              const val = e.target.value;
              let filtered = val.replace(/[^a-zA-Z0-9_.:\-!?|~*# ]/g, '');
              
              let spaceCounter = 0;
              filtered = filtered.split('').filter(char => {
                if (char === ' ') {
                  spaceCounter++;
                  return spaceCounter <= 2;
                }
                return true;
              }).join('');

              filtered = filtered.slice(0, 15);
              setLevelName(filtered);
            }}
            placeholder={t.levelName}
            className="h-9 w-48 bg-black text-white border border-neutral-700 px-3 outline-none font-arcade text-[10px] focus:border-blue-500 transition-colors"
          />

          <div className="h-9 flex items-center gap-2 bg-black border border-neutral-700 px-3 rounded-sm">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">TYPE:</span>
            <span className="text-cyan-400 text-[10px] font-bold font-arcade uppercase">
              {isBrawler ? (t.editorTypeBrawler || "BRAWLER ARENA") : (t.editorTypeNormal || "NORMAL LEVEL")}
            </span>
          </div>

          {!isBrawler && (
            <div className="h-9 flex items-center gap-2 bg-black border border-neutral-700 px-3 rounded-sm">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">
                {t.ability}:
              </span>
              <select
                value={allowedAbility}
                onChange={(e) => {
                  setAllowedAbility(e.target.value as LevelAbility);
                  setHasChanged(true);
                }}
                className="bg-transparent text-yellow-400 text-[10px] font-bold font-arcade outline-none cursor-pointer"
              >
                <option value="none">{t.abNone || "KEINE"}</option>
                <option value="double_jump">{t.abDoubleJump || "DOPPELSPRUNG"}</option>
                <option value="build">{t.abBuild || "BLOCKBAUER"}</option>
                <option value="hook">{t.abHook || "GREIFHAKEN"}</option>
              </select>
            </div>
          )}

          {!isBrawler && (
            <div className="h-9 flex items-center gap-2 bg-black border border-neutral-700 px-3 rounded-sm">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight whitespace-nowrap">
                {lang === "DE" ? "LÄNGE:" : "LENGTH:"}
              </span>
              <div className="flex items-center gap-1.5">
                <HoldButton
                  onClick={() => {
                    setLevelWidth((prev: number) => {
                      const next = Math.max(GAME_WIDTH, prev - 30);
                      if (next !== prev) setHasChanged(true);
                      return next;
                    });
                  }}
                  className="w-5 h-5 flex items-center justify-center bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-yellow-500 hover:border-yellow-900/50 rounded-sm text-[14px] leading-none transition-all active:scale-95"
                >
                  -
                </HoldButton>
                <input
                  type="number"
                  min={GAME_WIDTH}
                  max={GAME_WIDTH * 5}
                  step="30"
                  value={levelWidth}
                  onChange={(e) => {
                    const newWidth = Math.min(
                      GAME_WIDTH * 5,
                      Math.max(
                        GAME_WIDTH,
                        parseInt(e.target.value) || GAME_WIDTH,
                      ),
                    );
                    setLevelWidth(newWidth);
                    setHasChanged(true);
                    const filteredEntities = entities.filter(
                      (ent) => ent.x < newWidth,
                    );
                    if (filteredEntities.length !== entities.length) {
                      pushHistory(filteredEntities);
                    }
                  }}
                  className="w-20 bg-transparent text-yellow-500 font-arcade text-center outline-none text-[10px] font-bold"
                />
                <HoldButton
                  onClick={() => {
                    setLevelWidth((prev: number) => {
                      const next = Math.min(GAME_WIDTH * 5, prev + 30);
                      if (next !== prev) setHasChanged(true);
                      return next;
                    });
                  }}
                  className="w-5 h-5 flex items-center justify-center bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-yellow-500 hover:border-yellow-900/50 rounded-sm text-[14px] leading-none transition-all active:scale-95"
                >
                  +
                </HoldButton>
              </div>
            </div>
          )}

          {/* Auto Scroll UI moved to Row 1 Header */}
          {levelWidth > GAME_WIDTH && (
            <div className="flex flex-col gap-0.5 items-center justify-center">
              <button
                onClick={() => {
                  setAutoScroll(!autoScroll);
                  setHasChanged(true);
                }}
                className={`h-6 min-w-[90px] px-2 text-[8px] font-arcade border transition-all rounded-sm ${autoScroll ? "bg-purple-900/60 border-purple-400 text-purple-100 shadow-inner" : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-300"}`}
                onMouseEnter={(e) => handleTooltipEnter(e, t.ttAutoScroll || "Auto-Scroll Mode")}
                onMouseMove={handleTooltipMove}
                onMouseLeave={handleTooltipLeave}
              >
                {t.scrollMode}: {autoScroll ? t.onLabel : t.offLabel}
              </button>
              {autoScroll && (
                <div className="h-5 flex items-center gap-1 bg-purple-950/20 border border-purple-900/40 px-1.5 rounded-sm">
                  <span className="text-[6px] text-purple-400 font-bold uppercase">SPD:</span>
                  <div className="flex items-center gap-0.5">
                    <button 
                      onClick={() => {
                        const newSpeed = Math.max(10, autoScrollSpeed - 10);
                        setAutoScrollSpeed(newSpeed);
                        setHasChanged(true);
                      }}
                      className="w-3.5 h-3.5 flex items-center justify-center bg-purple-900/30 border border-purple-800/40 text-purple-300 hover:text-white rounded-[1px] text-[8px] leading-none transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={10}
                      max={350}
                      step={10}
                      value={autoScrollSpeed}
                      onChange={(e) => {
                        setAutoScrollSpeed(
                          Math.max(
                            10,
                            Math.min(350, parseInt(e.target.value) || 150),
                          ),
                        );
                        setHasChanged(true);
                      }}
                      className="w-12 bg-transparent text-purple-100 font-arcade text-center outline-none text-[8px] font-bold pr-0.5"
                    />
                    <button 
                      onClick={() => {
                        const newSpeed = Math.min(350, autoScrollSpeed + 10);
                        setAutoScrollSpeed(newSpeed);
                        setHasChanged(true);
                      }}
                      className="w-3.5 h-3.5 flex items-center justify-center bg-purple-900/30 border border-purple-800/40 text-purple-300 hover:text-white rounded-[1px] text-[8px] leading-none transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value as any)}
            className="h-9 bg-neutral-900 text-white border border-neutral-600 px-4 text-[10px] font-arcade focus:border-rage-red outline-none cursor-pointer appearance-none text-center font-bold tracking-wider rounded-sm shadow-inner"
            style={{
              color: tools.find((tool) => tool.id === selectedTool)?.color,
              borderColor: tools.find((tool) => tool.id === selectedTool)?.color,
              minWidth: "160px",
            }}
          >
            <optgroup label={t.tools || "TOOLS"}>
              {tools
                .filter(
                  (tool) =>
                    tool.id === "select" ||
                    tool.id === "eraser" ||
                    tool.id === "start" ||
                    tool.id === "startP2" ||
                    tool.id === "goal" ||
                    tool.id === "checkpoint",
                )
                .map((tool) => (
                  <option
                    key={tool.id}
                    value={tool.id}
                    className="bg-neutral-800 text-white font-bold"
                  >
                    {tool.id === "start" && isBrawler
                      ? "SPAWN P1 (3)"
                      : t.blockNames?.[tool.id] || tool.label}
                  </option>
                ))}
            </optgroup>
            <optgroup
              label={
                lang === "DE" ? "BLÖCKE" : lang === "ES" ? "BLOQUES" : "BLOCKS"
              }
            >
              {tools
                .filter((tool) =>
                  [
                    "wall",
                    "hazard",
                    "coin",
                    "ice",
                    "trampoline",
                    "slime",
                    "teleport",
                    "gravity_reverse",
                    "gravity_zero",
                  ].includes(tool.id),
                )
                .map((tool) => (
                  <option
                    key={tool.id}
                    value={tool.id}
                    className="bg-neutral-800 text-white font-bold"
                  >
                    {t.blockNames?.[tool.id] || tool.label}
                  </option>
                ))}
            </optgroup>
            <optgroup
              label={
                lang === "DE"
                  ? "SCHEINBLÖCKE"
                  : lang === "ES"
                    ? "BLOQUES FALSOS"
                    : "FAKE BLOCKS"
              }
            >
              {tools
                .filter((tool) =>
                  [
                    "walkthrough_wall",
                    "ghost_hazard",
                    "fake_ice",
                    "fake_slime",
                    "fake_goal",
                  ].includes(tool.id),
                )
                .map((tool) => (
                  <option
                    key={tool.id}
                    value={tool.id}
                    className="bg-neutral-800 text-white font-bold"
                  >
                    {t.blockNames?.[tool.id] || tool.label}
                  </option>
                ))}
            </optgroup>
            <optgroup
              label={
                lang === "DE"
                  ? "EXTRAS"
                  : lang === "ES"
                    ? "EXTRAS"
                    : "POWERUPS & ABILITIES"
              }
            >
              {tools
                .filter(
                  (tool) =>
                    tool.id.startsWith("powerup_") || tool.id.startsWith("block_"),
                )
                .map((tool) => (
                  <option
                    key={tool.id}
                    value={tool.id}
                    className="bg-neutral-800 text-white font-bold"
                  >
                    {t.blockNames?.[tool.id] || tool.label}
                  </option>
                ))}
            </optgroup>
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-9 px-3 text-[10px] font-arcade border transition-all rounded-sm flex items-center gap-2 ${showAdvanced ? "bg-blue-900 border-blue-400 text-blue-100" : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white"}`}
            onMouseEnter={(e) => handleTooltipEnter(e, t.ttAdvanced || "Advanced Editor Settings")}
            onMouseMove={handleTooltipMove}
            onMouseLeave={handleTooltipLeave}
          >
            <span>{showAdvanced ? "▼" : "▲"}</span>
            {lang === "DE" ? "OPTIONEN" : "OPTIONS"}
          </button>
        </div>
      </div>

      {/* Row 2: Advanced View Options & Specific Tools (Conditional) */}
      {(showAdvanced || (levelWidth > GAME_WIDTH) || isBrawler) && (
        <div className="flex flex-wrap items-center gap-3 py-1 border-t border-neutral-800/50 animate-in fade-in slide-in-from-top-1 duration-200">
          {showAdvanced && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`h-9 px-3 text-[10px] font-arcade border transition-all rounded-sm ${showGrid ? "bg-neutral-700 border-neutral-400 text-white shadow-inner" : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-300"}`}
                onMouseEnter={(e) => handleTooltipEnter(e, t.ttGrid || "Toggle Grid (G)")}
                onMouseMove={handleTooltipMove}
                onMouseLeave={handleTooltipLeave}
              >
                {t.gridLabel}: {showGrid ? t.onLabel : t.offLabel}
              </button>

              <button
                onClick={() => {
                  if (onSettingsChange && settings) {
                    onSettingsChange({
                      ...settings,
                      editorEdgeScroll: !settings.editorEdgeScroll,
                    });
                  }
                }}
                className={`h-9 px-3 text-[10px] font-arcade border transition-all rounded-sm ${settings?.editorEdgeScroll ? "bg-red-900/50 border-red-500 text-red-100" : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-300"}`}
                onMouseEnter={(e) => handleTooltipEnter(e, t.ttEdgeScroll || "Editor Edge Scroll")}
                onMouseMove={handleTooltipMove}
                onMouseLeave={handleTooltipLeave}
              >
                {t.editorEdgeScroll}: {settings?.editorEdgeScroll ? t.onLabel : t.offLabel}
              </button>
              
              <div className="h-9 flex flex-col justify-center bg-black/40 border border-neutral-700 px-3 min-w-[140px] rounded-sm">
                <label className="text-[7px] text-neutral-500 uppercase font-bold tracking-tight flex justify-between mb-0.5">
                  <span>RADIAL SCALE</span>
                  <span className="text-neutral-300">{(radialScale * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1.5"
                  step="0.05"
                  value={radialScale}
                  onChange={(e) => setRadialScale(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 h-1 cursor-pointer bg-neutral-800 rounded-lg appearance-none"
                />
              </div>
            </div>
          )}

          {isBrawler && (
            <button
              onClick={() => setSymmetryEnabled(!symmetryEnabled)}
              className={`h-9 px-3 text-[10px] font-arcade border transition-all rounded-sm ${symmetryEnabled ? "bg-cyan-900 border-cyan-400 text-cyan-200 shadow-inner" : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-300"}`}
              onMouseEnter={(e) => handleTooltipEnter(e, t.ttSymmetry || "Auto-Symmetry (S)")}
              onMouseMove={handleTooltipMove}
              onMouseLeave={handleTooltipLeave}
            >
              {t.symmetry}: {symmetryEnabled ? t.onLabel : t.offLabel}
            </button>
          )}
        </div>
      )}
    </div>

        {/* History & Primary Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-t border-neutral-800 bg-neutral-900/50 px-2 rounded-b-lg">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`h-9 px-5 border text-[10px] font-arcade transition-all rounded-sm flex items-center justify-center gap-2 ${historyIndex <= 0 ? "bg-neutral-800 border-neutral-700 text-neutral-600 shadow-inner" : "bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600 active:scale-95"}`}
            >
              UNDO
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`h-9 px-5 border text-[10px] font-arcade transition-all rounded-sm flex items-center justify-center gap-2 ${historyIndex >= history.length - 1 ? "bg-neutral-800 border-neutral-700 text-neutral-600 shadow-inner" : "bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600 active:scale-95"}`}
            >
              REDO
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              className="h-9 px-5 bg-blue-700 hover:bg-blue-600 text-white text-[10px] font-arcade border border-blue-400 shadow-[0_2px_0_#1e3a8a] active:translate-y-[1px] active:shadow-none transition-all rounded-sm uppercase tracking-wider"
              onMouseEnter={(e) => handleTooltipEnter(e, t.ttTest || "Test your level")}
              onMouseMove={handleTooltipMove}
              onMouseLeave={handleTooltipLeave}
            >
              {t.editorTest}
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="h-9 px-5 bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-arcade border border-amber-500 shadow-[0_2px_0_#92400e] active:translate-y-[1px] active:shadow-none transition-all rounded-sm uppercase tracking-wider"
              onMouseEnter={(e) => handleTooltipEnter(e, t.ttSaveDraft || "Save draft without verifying")}
              onMouseMove={handleTooltipMove}
              onMouseLeave={handleTooltipLeave}
            >
              {t.editorSaveDraft}
            </button>

            <div className="relative group">
              <button
                type="button"
                onClick={handleRelease}
                disabled={!canRelease}
                className={`h-9 px-5 text-[10px] font-arcade border transition-all rounded-sm uppercase tracking-wider ${canRelease ? "bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-400 shadow-[0_2px_0_#064e3b] active:translate-y-[1px] active:shadow-none" : "bg-neutral-800 border-neutral-700 text-neutral-600 cursor-not-allowed opacity-50 shadow-inner"}`}
                onMouseEnter={(e) => handleTooltipEnter(e, canRelease ? (t.ttPublish || "Publish online!") : (t.ttReachGoal || "Reach Goal to verify & publish"))}
                onMouseMove={handleTooltipMove}
                onMouseLeave={handleTooltipLeave}
              >
                {t.editorRelease}
              </button>
            </div>

            <button
              type="button"
              onClick={handleExitRequest}
              className="h-9 px-5 bg-rose-900 hover:bg-rose-800 text-rose-100 text-[10px] font-arcade border border-rose-700 shadow-[0_2px_0_#4c0519] active:translate-y-[1px] active:shadow-none transition-all rounded-sm uppercase tracking-wider"
              onMouseEnter={(e) => handleTooltipEnter(e, t.ttExit || "Exit Editor")}
              onMouseMove={handleTooltipMove}
              onMouseLeave={handleTooltipLeave}
            >
              {t.editorExit}
            </button>
          </div>
        </div>
      <div className="flex-1 bg-neutral-950 flex items-center justify-center p-2 min-h-0 min-w-0 relative">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#333 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
        <div
          ref={scrollContainerRef}
          className="w-full h-full border-2 border-neutral-700 shadow-2xl bg-black relative overflow-auto custom-scrollbar flex items-start justify-start"
          onContextMenu={(e) => e.preventDefault()}
          onMouseMove={(e) => {
            // Updated in root handleMouseMove
          }}
          onMouseLeave={() => {
            // Keep mouse pos for scrolling even if slightly off container
          }}
        >
          <div
            className="relative h-full flex-shrink-0 min-w-min"
            style={{ aspectRatio: `${levelWidth} / ${levelHeight}` }}
          >
            <canvas
              ref={canvasRef}
              width={levelWidth}
              height={levelHeight}
              onMouseDown={handleMouseDown}
              onWheel={handleWheel}
              className={`w-full h-full block ${selectedTool === "select" ? "cursor-default" : "cursor-crosshair"}`}
              style={{ objectFit: "fill" }}
            />
            <PropertyEditor
              selectedEntityIndices={selectedEntityIndices}
              entities={entities}
              popupPos={popupPos}
              activeProperty={activeProperty}
              tools={tools}
              handleUpdateSelected={handleUpdateSelected}
              handleDeleteSelected={handleDeleteSelected}
              setSelectedEntityIndices={setSelectedEntityIndices}
              setActiveProperty={setActiveProperty}
              setIsDraggingPopup={setIsDraggingPopup}
              setDragOffset={setDragOffset}
              generateStableId={generateStableId}
              tools_trans={t}
              levelWidth={levelWidth}
              levelHeight={levelHeight}
              handleTooltipEnter={handleTooltipEnter}
              handleTooltipMove={handleTooltipMove}
              handleTooltipLeave={handleTooltipLeave}
            />
          </div>
        </div>
      </div>
      <div className="bg-neutral-900 text-white font-arcade text-[8px] md:text-[9px] flex justify-center items-center py-1 border-t border-neutral-800 shrink-0 select-none px-4 gap-8">
        <div className="flex gap-4">
          <span>
            <span className="text-yellow-400">1-9:</span> {t.tools}
          </span>
          <span>
            <span className="text-yellow-400">E:</span> {t.eraser}
          </span>
          <span>
            <span className="text-yellow-400">R:</span> {t.rect}
          </span>
          <span>
            <span className="text-yellow-400">V/S:</span> {t.select}
          </span>
          <span>
            <span className="text-yellow-400">G:</span> {t.grid}
          </span>
          <span>
            <span className="text-yellow-400">Z/Y:</span> {t.symmetry}
          </span>
        </div>
        <div className="flex gap-4 opacity-70">
          <span>
            <span className="text-cyan-400">SHIFT:</span> {t.lines}
          </span>
          <span>
            <span className="text-cyan-400">
              {t.altLabel}+{t.clickLabel || "CLICK"}:
            </span>{" "}
            {t.pick}
          </span>
          <span>
            <span className="text-cyan-400">
              RIGHT-{t.clickLabel || "CLICK"}:
            </span>{" "}
            {t.eraser}
          </span>
          <span>
            <span className="text-cyan-400">{t.wheelLabel}:</span>{" "}
            {t.scrollTools}
          </span>
          <span>
            <span className="text-cyan-400">{t.ctrlLabel}+Z/Y:</span>{" "}
            {t.undoRedo}
          </span>
        </div>
      </div>

      {showExitConfirmation && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-neutral-900 border-2 border-neutral-600 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 max-w-sm w-full flex flex-col items-center gap-4">
            <h2 className="text-xl font-arcade text-yellow-400 text-center leading-relaxed">
              {modalText.title}
            </h2>
            <p className="text-neutral-300 text-center font-mono text-xs mb-2">
              {modalText.desc}
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleSaveDraft}
                className="w-full py-3 bg-yellow-700 hover:bg-yellow-600 text-white font-bold font-arcade text-xs border border-yellow-500 transition-colors shadow-lg"
              >
                {modalText.save} & EXIT
              </button>
              <button
                onClick={onExit}
                className="w-full py-3 bg-red-900/50 hover:bg-red-900 text-red-200 hover:text-white font-bold font-arcade text-xs border border-red-800 transition-colors"
              >
                {modalText.discard}
              </button>
              <button
                onClick={() => setShowExitConfirmation(false)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-bold font-arcade text-xs border border-neutral-600 transition-colors mt-2"
              >
                {modalText.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelEditor;
