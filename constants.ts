





import { Language, LevelData, Achievement, Entity } from './types';
import { decompressLevel } from './services/compressionService';

// Physics
export const GRAVITY = 0.9;
export const FRICTION = 0.82;
export const ICE_FRICTION = 0.98;
export const SLIME_FRICTION = 0.4;
export const MOVE_ACCEL = 1.0;
export const MAX_SPEED = 8.0;
export const JUMP_FORCE = -15.0;
export const TRAMPOLINE_FORCE = -22;
export const SLIME_JUMP_FORCE = -10;
export const WALL_JUMP_FORCE = { x: 8, y: -13 };
export const WALL_SLIDE_SPEED = 4;
export const SLIME_WALL_SLIDE_SPEED = 1;

// Abilities
export const HOOK_SPEED = 20;
export const HOOK_PULL_FORCE = 1.5;
export const MAX_JUMPS = 2; 
export const HOOK_RANGE = 400; 
export const HOOK_COOLDOWN = 60; 

// Dimensions
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const TILE_SIZE = 30;

// Colors
export const COLORS = {
  WALL: '#404040',
  HAZARD: '#ff0044', 
  GOAL: '#00ff88',
  GOAL_LOCKED: '#2f4f3e', 
  BOUNCE: '#00ccff',
  COIN: '#fbbf24',
  TEMP_BLOCK: '#ffffff', 
  BG: '#0a0a0a',
  GRID: '#1a1a1a',
  ICE: '#a5f3fc',      
  TRAMPOLINE: '#ec4899', 
  SLIME: '#84cc16',    
  TELEPORT: '#8b5cf6',  
  HOOK_ROPE: '#ffffff',
  POWERUP_BUILD: '#00bcd4', // Cyan
  POWERUP_HOOK: '#607d8b',  // Blue Grey
  POWERUP_DJ: '#9c27b0',    // Purple
  POWERUP_SLOW_MO: '#3b82f6', // Bright Blue
  POWERUP_XRAY: '#facc15',    // Yellow
  CHECKPOINT: '#2dd4bf',    // Teal
  REMOVE_ABILITY: '#dc2626', // Reddish for remover
};

// Translations
export const TRANSLATIONS = {
  [Language.EN]: {
    start: "STORY MODE",
    tutorial: "TUTORIAL",
    editor: "LEVEL EDITOR",
    randomRun: "RANDOM RUN",
    startRun: "START RUN",
    customLevels: "CUSTOM LEVELS",
    customize: "CUSTOMIZE",
    shop: "SHOP",
    buy: "BUY",
    equipped: "EQUIPPED",
    equip: "EQUIP",
    totalCoins: "TOTAL COINS",
    random: "RANDOM",
    owned: "OWNED",
    locked: "LOCKED",
    achievementReward: "ACHIEVEMENT REWARD",
    player1: "PLAYER 1 (WASD)",
    player2: "PLAYER 2 (ARROWS)",
    movingH: "MOVING HORIZONTAL",
    movingV: "MOVING VERTICAL",
    moveRange: "MOVE RANGE",
    moveSpeed: "MOVE SPEED",
    fragileBlock: "FRAGILE BLOCK",
    width: "WIDTH (W)",
    height: "HEIGHT (H)",
    xPos: "X POS (X)",
    yPos: "Y POS (Y)",
    editorHint: "CLICK LABEL + WASD/ARROWS TO ADJUST",
    gridLabel: "GRID",
    typeLabel: "TYPE",
    wheelLabel: "WHEEL",
    ctrlLabel: "CTRL",
    clickLabel: "CLICK",
    altLabel: "ALT",
    onLabel: "ON",
    offLabel: "OFF",
    class: "CLASS",
    settings: "SETTINGS",
    editorEdgeScroll: "EDITOR EDGE SCROLL",
    credits: "CREDITS",
    howToPlay: "HOW TO PLAY",
    onlineBrawl: "ONLINE BRAWL",
    brawlerSettings: "MATCH SETTINGS",
    practice: "PRACTICE",
    quickCustomizer: "QUICK CUSTOMIZER",
    colorLabel: "COLOR",
    eyesLabel: "EYES",
    accLabel: "ACCESSORY",
    trailLabel: "TRAIL",
    customLabel: "CUSTOM",
    offLabelShort: "OFF",
    back: "BACK",
    music: "MUSIC",
    sfx: "SFX",
    controls: "CONTROLS",
    jump: "JUMP",
    move: "MOVE",
    dash: "DASH",
    restart: "RESTART",
    pause: "PAUSE",
    interact: "INTERACT",
    tutorialTitle: "MASTER THE LAVA",
    tutorialDesc: "A quick guide to surviving the neon chaos.",
    tutorialMoveRow: "ARROW KEYS / WASD",
    tutorialJumpRow: "SPACE / W / UP",
    tutorialDashRow: "SHIFT / CLICK",
    tutorialHookRow: "MOUSE CLICK",
    designedBy: "DESIGNED & DEVELOPED BY",
    specialThanks: "SPECIAL THANKS TO ALL PLAYERS",
    version: "VERSION",
    trails: "TRAILS",
    deathAnims: "DEATH ANIMATIONS",
    deathSounds: "DEATH SOUNDS",
    deathSoundDesc: "Equip a custom sound effect to assert dominance when you fall!",
    soundsTab: "SOUNDS",
    eyesTab: "EYES",
    hatsTab: "HATS & ACCESSORIES",
    uiSize: "UI SIZE",
    playerNameLabel: "PLAYER NAME",
    opponentOpacity: "OPPONENT OPACITY",
    spectatorMode: "SPECTATOR MODE",
    watching: "WATCHING: ",
    switchSpectatorHint: "WASD / ARROW KEYS TO SWITCH PLAYERS",
    maxFps: "MAX FPS",
    unlimited: "UNLIMITED",
    clickOrArrowsToChange: "CLICK OR ARROWS TO CHANGE",
    keybindings: "KEYBINDINGS",
    keybindingsDesc: "CLICK AN ACTION TO REBIND. ESC TO CLEAR.",
    storyLevels: "STORY LEVELS",
    playAll: "PLAY ALL",
    customLevelsLabel: "OWN LEVELS",
    changeSourceHint: "USE UP/DOWN TO CHANGE SOURCE",
    audioFixBtn: "AUDIO FIX",
    collisionLabel: "COLLISION",
    levelMenuBtn: "LEVEL MENU",
    powerupsBtn: "POWERUPS",
    host: "HOST",
    kick: "KICK",
    kickedMessage: "You were kicked from the lobby.",
    ready: "READY",
    notReady: "NOT READY",
    unready: "UNREADY",
    selectedLevels: "SELECTED LEVEL(S)",
    activeQueue: "ACTIVE QUEUE",
    more: "MORE",
    noLevelSelected: "NO LEVEL SELECTED",
    startGame: "START GAME",
    lobby: "LOBBY",
    codeLengthError: "CODE MUST BE 4 CHARACTERS",
    levels: "LEVELS",
    selected: "SELECTED",
    voteRunning: "VOTE IN PROGRESS!",
    nextLevelVote: "NEXT LEVEL?",
    retryLevelVote: "RETRY LEVEL?",
    yesVote: "F1: YES",
    noVote: "F2: NO",
    playersVoted: "PLAYERS VOTED",
    achievementUnlocked: "ACHIEVEMENT UNLOCKED",
    pressKey: "PRESS KEY...",
    none: "NONE",
    up: "UP / JUMP",
    down: "DOWN",
    left: "LEFT",
    right: "RIGHT",
    action: "ACTION",
    highscores: "HIGHSCORES",
    gameResults: "GAME RESULTS",
    achievements: "ACHIEVEMENTS",
    vsMode: "VS RACE (2P)",
    buildBattleMode: "BUILD-BATTLE (2P)",
    brawlerMode: "BRAWLER (2P)",
    book: "BOOK / WIKI",
    generate: "AI CHAOS MODE",
    deaths: "DEATHS",
    score: "SCORE",
    time: "TIME",
    won: "STAGE CLEARED",
    loading: "AI IS COOKING...",
    retry: "R: RETRY",
    next: "NEXT LEVEL",
    control: "ARROWS/WASD Move, SPACE Jump",
    paused: "PAUSED",
    resume: "RESUME",
    backToLobby: "BACK TO LOBBY",
    giveUp: "GIVE UP",
    quit: "QUIT TO MENU",
    fixAudio: "FIX AUDIO",
    play: "PLAY",
    totalScore: "TOTAL SCORE",
    enterName: "ENTER NAME",
    save: "SAVE SCORE",
    gameOver: "GAME OVER",
    troll: "Speed is key.",
    color: "COLOR",
    hat: "HAT",
    eyes: "EYES",
    trail: "TRAIL",
    coins: "COINS",
    ghostRun: "GHOST RUN",
    editorTools: "1:Wall 2:Haz 3:Coin 4:Goal 5:Start 6:Ice 7:Tramp 8:Slime 9:Tele",
    editorRelease: "RELEASE",
    editorSaveDraft: "SAVE DRAFT",
    editorTest: "TEST LEVEL",
    editorVerified: "VERIFIED!",
    editorUnverified: "BEAT TO RELEASE",
    nameTooShort: "Name must be at least 3 characters",
    nameTooManySpaces: "Maximum 2 spaces allowed",
    editorLoad: "LOAD",
    editorClear: "CLEAR",
    editorClearConfirm: "Are you sure? This will delete everything in the level.",
    editorExit: "EXIT",
    scrollMode: "SCROLL",
    scrollSpeed: "SPD",
    autoScroll: "AUTO-SCROLL",
    levelName: "Level Name",
    noCustomLevels: "No custom levels found! Build some in the Editor first.",
    delete: "DELETE",
    edit: "EDIT",
    playLevel: "PLAY LEVEL",
    testing: "TESTING MODE - Reach Goal to Verify",
    prevLevel: "< PREV",
    nextLevel: "NEXT >",
    vsTitle: "VS RACE MODE",
    playerWin: (name: string) => `${name.toUpperCase()} WINS!`,
    p1Win: "PLAYER 1 WINS!",
    p2Win: "PLAYER 2 WINS!",
    vsControls: "P1: WASD | P2: ARROWS | NO BUILDING!",
    export: "EXPORT JSON",
    import: "IMPORT JSON",
    confirmClear: "Are you sure? Unsaved changes will be lost.",
    deleteConfirm: "Delete this level permanently?",
    importSuccess: "Level imported successfully!",
    importError: "Invalid level file.",
    ability: "ABILITY",
    abNone: "NONE",
    abBuild: "BUILDER",
    abDoubleJump: "DOUBLE JUMP",
    abHook: "GRAPPLING HOOK",
    tools: "TOOLS",
    eraser: "ERASER",
    rect: "RECT",
    select: "SELECT",
    grid: "GRID",
    symmetry: "SYMMETRY",
    lines: "LINES",
    pick: "PICK",
    scrollTools: "SCROLL TOOLS",
    undoRedo: "UNDO/REDO",
    sort: "SORT",
    sortDate: "DATE",
    sortName: "NAME",
    sortPlayed: "PLAYED",
    editorTypeTitle: "CHOOSE EDITOR TYPE",
    editorTypeNormal: "NORMAL LEVEL",
    editorTypeBrawler: "BRAWLER ARENA",
    editorTypeNormalDesc: "Classic objective-based levels. Focus on platforming and reaching the goal.",
    editorTypeBrawlerDesc: "Arena-based combat levels. Focus on space, symmetry, and hazard placement.",
    draft: "DRAFT",
    lockedItem: "LOCKED: ",
    confirm: "SURE?",
    powerup: "POWERUP",
    puBuild: "Builder",
    puHook: "Hook",
    puSlowMo: "Slow-Mo",
    puXray: "X-Ray",
    puIce: "Ice Block",
    puSlime: "Slime Block",
    puFireball: "Fireball",
    puBomb: "Bomb",
    puShield: "Shield",
    puSteal: "Steal",
    puSlow: "Slow",
    puMelee: "Melee",
    puTeleport: "Teleport",
    puTripleJump: "Triple Jump",
    puDoubleJump: "Double Jump",
    puShrink: "Shrink",
    puGrow: "Grow",
    puDash: "Dash",
    localMultiplayer: "LOCAL MULTIPLAYER",
    multiplayer: "MULTIPLAYER",
    onlineMultiplayer: "ONLINE MULTIPLAYER",
    enterLobbyCode: "ENTER LOBBY CODE",
    nameRequired: "NAME IS REQUIRED TO JOIN OR CREATE A LOBBY",
    joinLobby: "JOIN LOBBY",
    createBrawlerLobby: "CREATE BRAWLER LOBBY",
    createVsLobby: "CREATE VS LOBBY",
    join: "JOIN",
    cancel: "CANCEL",
    levelSelection: "LEVEL SELECTION",
    selectLevelDesc: "Choose one or more levels for your session",
    selectionStatus: "Selection Status",
    levelsSelected: "Levels selected",
    startSession: "START SESSION",
    startLevel: "START LEVEL",
    lockedReason: "LOCKED",
    deleteLevelConfirm: "DELETE LEVEL?",
    deleteLevelDesc: "This action cannot be undone.",
    selectDifficulty: "SELECT DIFFICULTY",
    beginner: "BEGINNER",
    advanced: "ADVANCED",
    expert: "EXPERT",
    god: "JUMP GOD",
    player1Arrows: "PLAYER 1 (WASD)",
    player2Wasd: "PLAYER 2 (ARROWS)",
    red: "RED",
    green: "GREEN",
    blue: "BLUE",
    bodyColor: "BODY COLOR",
    trailColor: "TRAIL COLOR",
    style: "STYLE",
    openLevelMenu: "OPEN LEVEL MENU",
    levelMenu: "LEVEL MENU",
    brawlerLevels: "BRAWLER LEVELS",
    noLevels: "NO LEVELS",
    powerupSettings: "POWERUP SETTINGS",
    startBrawl: "START BRAWL",
    unlocked: "UNLOCKED",
    reward: "REWARD",
    brawler2p: "BRAWLER (2P)",
    mode: "MODE",
    selectedLevel: "SELECTED LEVEL",
    fixConnection: "Fix Connection",
    adjustControls: "ARROWS to adjust • ENTER to cycle",
    nextLevelBtn: "NEXT LEVEL",
    backToSelection: "BACK TO SELECTION",
    mainMenu: "MAIN MENU",
    arrowsToChange: "ARROWS TO CHANGE",
    fullRun: "FULL RUN (1-10)",
    noRecords: "NO RECORDS",
    maxCoinsReached: "Max 13 coins per level!",
    need2Players: "Need at least 2 players!",
    notAllReady: "Not all players are ready!",
    codeMust4Chars: "Code must be 4 characters",
    wsToSwitch: "W/S to Switch",
    custom: "CUSTOM",
    rank: "RANK",
    name: "NAME",
    level: "LEVEL",
    wikiTitle: "WIKI & KNOWLEDGE",
    wikiSubtitle: "THE ENCYCLOPEDIA OF DEATH",
    wikiTabAll: "ALL",
    wikiTabBlocks: "BLOCKS",
    wikiTabPowerups: "POWERUPS",
    wikiTabMechanics: "MECHANICS",
    wikiTypeBlock: "BLOCK",
    wikiTypePowerup: "POWERUP",
    wikiTypeMechanic: "SPECIAL / MECHANIC",
    wikiItems: {
      wall: { name: "Wall", desc: "A solid wall. Cannot be passed through." },
      hazard: { name: "Hazard (Red Field)", desc: "Don't touch this, or you die immediately!" },
      goal: { name: "Goal", desc: "Reach this field to finish the level." },
      coin: { name: "Coin", desc: "Collect them to buy cool customizations in the shop." },
      bounce: { name: "Bouncer", desc: "Bounces you away when you touch it." },
      ice: { name: "Ice", desc: "Very slippery. You'll slide without much control." },
      slime: { name: "Slime", desc: "Sticky. Allows you to wall jump." },
      trampoline: { name: "Trampoline", desc: "Catapults you high into the air when you land on it." },
      teleport: { name: "Teleporter", desc: "Teleports you to a connected target." },
      moving_platform: { name: "Moving Platform", desc: "Moves horizontally or vertically." },
      fragile: { name: "Fragile", desc: "Crumbles shortly after you step on it." },
      checkpoint: { name: "Checkpoint", desc: "Saves your progress. If you die, you start here." },
      invisible_hazard: { name: "Invisible Hazard", desc: "Deadly, but invisible until you're close..." },
      powerup_double_jump: { name: "Double Jump Module", desc: "After collecting, you can jump once more in mid-air!" },
      powerup_triple_jump: { name: "Triple Jump", desc: "Allows up to 3 jumps in mid-air!" },
      powerup_hook: { name: "Hook Module", desc: "Press special action (Right Click) to pull yourself to walls." },
      powerup_dash: { name: "Dash Module", desc: "Press action key for a quick burst in facing direction." },
      powerup_xray: { name: "X-Ray Scanner", desc: "Makes invisible hazards and fake walls visible." },
      powerup_shield: { name: "Shield", desc: "Protects you from the next deadly hit." },
      powerup_fireball: { name: "Fireball", desc: "Shoot fireballs to kill other players in multiplayer." },
      powerup_shrink: { name: "Shrink Mushroom", desc: "Makes you extremely small to fit through tight gaps." },
      powerup_grow: { name: "Growth Mushroom", desc: "Makes you huge, allowing for more massive jumps." },
      powerup_slow_mo: { name: "Slow-Mo", desc: "Slows down time to help you dodge hazards." },
      powerup_build: { name: "Build Blocks", desc: "Allows you to place your own level blocks." },
      fake: { name: "Fake Wall", desc: "Looks like a normal wall, but you fall right through!" },
      fake_goal: { name: "Fake Goal", desc: "A deceptive goal that often leads to doom." },
      troll_wall: { name: "Troll Wall", desc: "Looks like harmless background, but suddenly becomes solid." },
      gravity_reverse: { name: "Gravity Reverser", desc: "Literally turns the world upside down." },
      gravity_zero: { name: "Anti-Gravity", desc: "You float uncontrollably in the air." }
    },
    achievements_data: {
      first_blood: { title: "FIRST BLOOD", desc: "Die for the first time." },
      meat_grinder: { title: "MEAT GRINDER", desc: "Die 100 times in total." },
      speed_demon: { title: "SPEED DEMON", desc: "Beat a level in under 10 seconds." },
      architect: { title: "ARCHITECT", desc: "Place 50 blocks in a single run." },
      pacifist: { title: "PACIFIST", desc: "Beat a level without placing blocks." },
      masochist: { title: "MASOCHIST", desc: "Die 50 times in a single level and win." },
      builder: { title: "MASTER BUILDER", desc: "Place 100 blocks total." },
      social: { title: "SOCIAL BUTTERFLY", desc: "Play a VS Mode match." },
      rich: { title: "RICH", desc: "Collect 100 coins total." },
      marathon: { title: "MARATHON", desc: "Play for 10 minutes total." },
      sniper: { title: "SNIPER", desc: "Beat a level with 0 deaths." },
      batman: { title: "BATMAN", desc: "Use the grappling hook 50 times." },
      bunny: { title: "BUNNY HOP", desc: "Jump 1000 times total." },
      editor_god: { title: "EDITOR GOD", desc: "Verify a custom level." },
      slow_poke: { title: "SLOW POKE", desc: "Take over 60 seconds to beat a level." },
      completionist: { title: "COMPLETIONIST", desc: "Unlock all other achievements." },
      secret_admin: { title: "HACKER", desc: "Hint: The hex code for pure darkness with a touch of magenta. (#130009)" },
      secret_rainbow: { title: "RAINBOW", desc: "Hint: The brightest neon pink possible! (#ff0080)" },
      secret_ghost: { title: "GHOST", desc: "Hint: As bright and pale as a ghost! (#ffffff)" },
      secret_coffee: { title: "COFFEE BREAK", desc: "Hint: A hot beverage as a hex code. (#c0ffee)" },
      secret_matrix: { title: "THE MATRIX", desc: "Hint: Pure hacker green! (#00ff00)" },
      secret_void: { title: "THE VOID", desc: "Hint: The absolute absence of light. (#000000)" },
      chatty: { title: "CHATTY", desc: "Send 50 chat messages." },
      winner: { title: "WINNER", desc: "Win 10 online matches." },
      rage: { title: "RAGE", desc: "Die 500 times in total." },
      explorer: { title: "EXPLORER", desc: "Play 20 different levels." },
      speedster: { title: "SPEEDSTER", desc: "Beat a level in under 5 seconds." },
      builder_pro: { title: "BUILDER PRO", desc: "Place 500 blocks in total." },
      rich_king: { title: "RICH KING", desc: "Collect 500 coins in total." },
      marathon_pro: { title: "MARATHON PRO", desc: "Play for 60 minutes in total." },
      sniper_pro: { title: "SNIPER PRO", desc: "Beat 10 levels with 0 deaths." },
      jump_king: { title: "JUMP KING", desc: "Jump 5000 times in total." },
      hook_master: { title: "HOOK MASTER", desc: "Use the grappling hook 200 times." },
      lucky: { title: "LUCKY SEVEN", desc: "Win a level with a timer ending in .777!" },
      noob: { title: "GETTING STARTED", desc: "Complete 10 levels in total." },
      pro: { title: "VETERAN", desc: "Complete 50 levels in total." },
      demon: { title: "BRAWL DEMON", desc: "Win 5 online matches." },
      cat: { title: "PURRFECT", desc: "Complete 30 levels in total." },
      pilot: { title: "PILOT", desc: "Jump 10,000 times in total." },
      night_owl: { title: "NIGHT OWL", desc: "Play for 120 minutes total." },
      stealth: { title: "SHADOW", desc: "Complete 5 levels without dying." },
      hardcore: { title: "GODLIKE", desc: "Beat a JUMP GOD level." },
      sea_dog: { title: "SEA DOG", desc: "Play 15 Brawler matches." },
      worker: { title: "HARD WORK", desc: "Spend 30 minutes in the Editor." },
      laser_eyes: { title: "LASER VISION", desc: "Win 50 online matches." },
      kawaii_eyes: { title: "KAWAII", desc: "Collect 500 coins." },
      monocle_eyes: { title: "GENTLEMAN", desc: "Win 10 online matches." },
      masked_eyes: { title: "ANONYMOUS", desc: "Play 20 different custom levels." },
      wizard_hat: { title: "WIZARD", desc: "Spend 2 hours in the Editor." },
      bunny_ears: { title: "HOPPER", desc: "Jump 5,000 times total." },
      pirate_hat: { title: "CORSAIR", desc: "Win 5 brawler matches in a row." },
      party_hat: { title: "PARTY TIME", desc: "Play for 60 minutes." }
    },
    eye_names: {
      normal: "Normal",
      angry: "Angry",
      cyclops: "Cyclops",
      derp: "Derp",
      anime: "Anime",
      dead: "Dead",
      sunglasses: "Sunglasses",
      pirate: "Pirate",
      rich: "Rich",
      glowing: "Glowing",
      ninja: "Ninja",
      tired: "Tired",
      laser: "Laser",
      kawaii: "Kawaii",
      monocle: "Gentleman",
      masked: "Masked",
      alien: "Alien",
      cyborg: "Cyborg",
      stars: "Stars",
      hearts: "Hearts",
      hypno: "Hypno",
      googly: "Googly",
      void_eyes: "Void Eyes",
      evil: "Evil Eyes"
    },
    acc_names: {
      none: "None",
      crown: "Crown",
      horns: "Horns",
      headband: "Headband",
      cowboy: "Cowboy",
      viking: "Viking",
      halo: "Halo",
      headphones: "Headphones",
      tophat: "Top Hat",
      cap: "Cap",
      propeller: "Propeller Hat",
      cat_ears: "Cat Ears",
      demon_horns: "Demon Horns",
      builder_hat: "Builder Hat",
      wizard_hat: "Wizard Hat",
      bunny_ears: "Bunny Ears",
      pirate_hat: "Pirate Hat",
      party_hat: "Party Hat",
      sombrero: "Sombrero",
      ushanka: "Ushanka",
      fedora: "Fedora",
      chef: "Chef Hat",
      police: "Police Hat",
      pumpkin: "Pumpkin",
      unicorn: "Unicorn",
      secret_crown: "Secret Crown",
      rainbow_horn: "Rainbow Horn",
      ghost_sheet: "Ghost Sheet",
      coffee_cup: "Coffee Cup"
    },
    shopItemNames: {
      normal: "Standard",
      blood: "Blood Pop",
      confetti: "Confetti Party",
      firework: "Glow Burst",
      dust: "Poof Cloud",
      electric: "Volt Burst",
      ghost: "Soul Release",
      freeze: "Ice Shatter",
      blackhole: "Void Collapse",
      bubble: "Bubble Pop",
      "trail_normal": "Standard",
      "trail_pixel-fire": "Flame Trail",
      "trail_stardust": "Galaxy Dust",
      "trail_slime": "Ooze Trail",
      "trail_rainbow-pulse": "RGB Flow",
      "trail_ghostly": "Phantom Vapor",
      "trail_bubble-trail": "Deep Sea",
      "trail_spark-trail": "Electric Spark",
      "trail_shadow-trail": "Dark Void",
      "trail_neon-trail": "Cyber Neon"
    },
    brawlerClasses: {
      standard: { pos: "+ Balanced Stats", neg: "- No Specialization" },
      fighter: { pos: "+ Strong Overall Stats", neg: "- Much longer Dash CD" },
      dasher: { pos: "+ Very Short Dash CD", neg: "- Less HP" },
      jumper: { pos: "+ True Triple Jump", neg: "- Less HP" },
      tank: { pos: "+ More HP & Resistance", neg: "- Very Slow" },
      ninja: { pos: "+ Very Fast & High", neg: "- Very Low HP" },
      heavy: { pos: "+ Massive Knockback", neg: "- Slow & Massive" },
      vampire: { pos: "+ Heals on Kill", neg: "- Extremely Low HP" }
    },
    blockNames: {
      select: "SELECT",
      wall: "WALL",
      walkthrough_wall: "F-WALL",
      hazard: "HAZARD",
      ghost_hazard: "F-HAZARD",
      coin: "COIN",
      goal: "GOAL",
      fake_goal: "F-GOAL",
      start: "SPAWN P1",
      startP2: "SPAWN P2",
      ice: "ICE",
      fake_ice: "F-ICE",
      trampoline: "BOUNCE",
      slime: "SLIME",
      fake_slime: "F-SLIME",
      teleport: "TELE",
      powerup_build: "P-BUILD",
      powerup_hook: "P-HOOK",
      powerup_double_jump: "P-JUMP",
      powerup_slow_mo: "P-TIME",
      powerup_xray: "P-XRAY",
      block_dash: "DASH",
      block_shrink: "SHRINK",
      block_grow: "GROW",
      block_gravity: "GRAV REV",
      powerup_remover: "NO-PWR",
      powerup_spawner: "P-SPAWN",
      checkpoint: "CHECKPT",
      gravity_reverse: "Grav-Area strong",
      gravity_zero: "Grav-Area low",
      rectangle: "RECT",
      eraser: "ERASER"
    },
    radialCategories: {
      Normal: "NORMAL",
      Blöcke: "BLOCKS",
      Schein: "FAKE-BLOCKS",
      Werkzeuge: "TOOLS",
      Powerup: "POWER",
      Extras: "EXTRA",
      Auswahl: "SELECT",
      Radierer: "ERASER",
      Spezial: "SPECIAL"
    },
    kickPlayer: "KICK PLAYER",

    reallyStartVote: "DO YOU REALLY WANT TO START THIS VOTE?",
    voteKickFor: "KICK {name}?",
    noPlayersToKick: "NO OTHER PLAYERS IN LOBBY",
    ttHMove: "Horizontal Move",
    ttVMove: "Vertical Move",
    ttFragile: "Fragile Block (breaks on touch)",
    ttAutoScroll: "Auto-Scroll Mode",
    ttAdvanced: "Advanced Editor Settings",
    ttGrid: "Toggle Grid (G)",
    ttEdgeScroll: "Editor Edge Scroll",
    ttSymmetry: "Auto-Symmetry (S)",
    ttTest: "Test your level",
    ttSaveDraft: "Save draft without verifying",
    ttPublish: "Publish online!",
    ttReachGoal: "Reach Goal to verify & publish",
    ttExit: "Exit Editor",
    bbSettingsBtn: "⚙️ RULES & PRESETS...",
    bbModalTitle: "⚙️ BUILD-BATTLE RULES & BLOCKS",
    bbClose: "CLOSE ✖",
    bbRegelTuning: "⏱️ GAME TIME & SCORE LIMIT",
    bbSelectPhase: "Phase: Block Selection",
    bbBuildPhase: "Phase: Build & Place",
    bbWinConditions: "Win Conditions (Points)",
    bbPoints: "Pts",
    bbOwnPresets: "💾 OWN PRESETS",
    bbLimitReached: "[Limit reached]",
    bbPresetPlaceholder: "Preset name...",
    bbPresetLimitPlaceholder: "Limit of 5 reached!",
    bbSave: "SAVE",
    bbNoPresets: "No custom presets saved.",
    bbLaden: "LOAD",
    bbAuswahlLabel: "Selection",
    bbBauLabel: "Build",
    bbSiegeLabel: "Wins",
    bbBlocksLabel: "Blocks",
    bbBlockSelectionPool: "🧱 BLOCK SELECTION POOL",
    bbAlleAn: "ALL ON",
    bbStandard: "DEFAULT",
    bbSaveAndClose: "✔ SAVE & CLOSE SETTINGS",
    bbCatWalls: "🧱 Walls & Platforms",
    bbCatHazards: "⚠️ Hazards & Traps",
    bbCatPhysics: "🌌 Physics & Mechanics",
    bbCatPowerups: "⚡ Power-Ups",
    bbCatModifiers: "🪄 Modifiers",
    bbBtnAlle: "ALL",
    bbBtnAus: "OFF",
    toastAllOn: "All blocks enabled!",
    toastDefault: "Standard pool (8 blocks) enabled!",
    toastMin8: "At least 8 blocks must be active!",
    toastMin8Keep: "At least 8 blocks must remain active!",
    toastEnterName: "Please enter a name!",
    toastNameExists: "Name already exists!",
    toastSaved: "saved!",
    toastLoaded: "loaded!",
    toastDeleted: "Preset deleted!",
    toastMax5Reached: "Maximum of 5 presets allowed! Please delete one first.",
    bbSelectTimeRemaining: "Remaining selection time",
    bbItemSelectTitle: "SELECT ITEM",
    bbSecret: "SECRET",
    bbTaken: "TAKEN!",
    bbByP1: "BY P1",
    bbByP2: "BY P2",
    bbPlaced: "PLACED",
    bbControlsP1: "WASD MOVE\nE ROTATE\nSPACE PLACE",
    bbControlsP2: "ARROWS MOVE\nCTRL ROTATE\nENTER PLACE",
    bbPlayer1: "PLAYER 1",
    bbPlayer2: "PLAYER 2",
    bbSelectControlsP1: "[A] / [D] SELECT\nSPACE CONFIRM",
    bbSelectControlsP2: "[←] / [→] SELECT\nENTER CONFIRM",
    bbCancel: "CANCEL"
  },
  [Language.DE]: {
    start: "STORY-MODUS",
    tutorial: "TUTORIAL",
    editor: "LEVEL-EDITOR",
    randomRun: "ZUFALLS-LAUF",
    startRun: "LAUF STARTEN",
    customLevels: "EIGENE LEVEL",
    customize: "ANPASSEN",
    shop: "SHOP",
    buy: "KAUFEN",
    equipped: "AUSGERÜSTET",
    equip: "AUSRÜSTEN",
    totalCoins: "MÜNZEN GESAMT",
    random: "ZUFALL",
    owned: "BESITZT",
    locked: "GESPERRT",
    achievementReward: "ERFOLG-BELOHNUNG",
    player1: "SPIELER 1 (WASD)",
    player2: "SPIELER 2 (PFEILE)",
    movingH: "HORIZ. BEWEGUNG",
    movingV: "VERT. BEWEGUNG",
    moveRange: "REICHWEITE",
    moveSpeed: "SPEED",
    fragileBlock: "ZERBRECHL. BLOCK",
    width: "BREITE (W)",
    height: "HÖHE (H)",
    xPos: "X POS (X)",
    yPos: "Y POS (Y)",
    editorHint: "LABEL KLICKEN + PFEILE/WASD",
    gridLabel: "RASTER",
    typeLabel: "TYP",
    wheelLabel: "RAD",
    ctrlLabel: "STRG",
    clickLabel: "KLICK",
    altLabel: "ALT",
    onLabel: "AN",
    offLabel: "AUS",
    class: "KLASSE",
    settings: "EINSTELLUNGEN",
    editorEdgeScroll: "EDITOR RAND-SCROLLEN",
    credits: "CREDITS",
    howToPlay: "ANLEITUNG",
    onlineBrawl: "ONLINE BRAWL",
    brawlerSettings: "MATCH-EINSTELL.",
    practice: "ÜBUNG",
    quickCustomizer: "SCHNELL-MODUS",
    colorLabel: "FARBE",
    eyesLabel: "AUGEN",
    accLabel: "ACCESSOIRE",
    trailLabel: "SPUR",
    customLabel: "EIGEN",
    offLabelShort: "AUS",
    back: "ZURÜCK",
    music: "MUSIK",
    sfx: "EFFEKTE",
    controls: "STEUERUNG",
    jump: "SPRUNG",
    move: "BEWEGEN",
    dash: "DASH",
    restart: "NEUSTART",
    pause: "PAUSE",
    interact: "INTERAGIEREN",
    tutorialTitle: "MEISTERE DIE LAVA",
    tutorialDesc: "Überlebe das Neon-Chaos.",
    tutorialMoveRow: "PFEILTASTEN / WASD",
    tutorialJumpRow: "LEER / W / HOCH",
    tutorialDashRow: "SHIFT / KLICK",
    tutorialHookRow: "MAUSKLICK",
    designedBy: "DESIGN & ENTWICKLUN VON",
    specialThanks: "DANKE AN ALLE SPIELER",
    version: "VERSION",
    trails: "SPUREN",
    deathAnims: "TODES-ANIMATIONEN",
    deathSounds: "TODES-SOUNDS",
    deathSoundDesc: "Rüste einen benutzerdefinierten Soundeffekt aus, um beim Fallen Dominanz zu zeigen!",
    soundsTab: "SOUNDS",
    eyesTab: "AUGEN",
    hatsTab: "HÜTE & MEHR",
    changeSourceHint: "HOCH/RUNTER FÜR QUELLE",
    uiSize: "UI GRÖSSE",
    playerNameLabel: "SPIELERNAME",
    opponentOpacity: "GEGNER TRANSPARENZ",
    spectatorMode: "ZUSCHAUER-MODUS",
    watching: "BETRACHTE: ",
    switchSpectatorHint: "WASD / PFEILTASTEN ZUM WECHSELN",
    maxFps: "MAX FPS",
    unlimited: "UNBEGRENZT",
    clickOrArrowsToChange: "KLICK ODER PFEILE ZUM ÄNDERN",
    keybindings: "TASTENBELEGUNG",
    keybindingsDesc: "KLICKEN ZUM ÄNDERN. ESC ZUM LÖSCHEN.",
    storyLevels: "STORY-LEVEL",
    playAll: "ALLE SPIELEN",
    customLevelsLabel: "EIGENE LEVEL",
    audioFixBtn: "AUDIO FIX",
    collisionLabel: "KOLLISION",
    levelMenuBtn: "LEVEL-MENÜ",
    powerupsBtn: "POWERUPS",
    host: "HOST",
    kick: "KICKEN",
    kickedMessage: "Du wurdest aus der Lobby gekickt.",
    ready: "BEREIT",
    notReady: "NICHT BEREIT",
    unready: "NICHT BEREIT",
    selectedLevels: "AUSGEWÄHLTE(S) LEVEL",
    activeQueue: "AKTIVE WARTESCHLANGE",
    more: "MEHR",
    noLevelSelected: "KEIN LEVEL AUSGEWÄHLT",
    startGame: "SPIEL STARTEN",
    lobby: "LOBBY",
    codeLengthError: "CODE MUSS 4 ZEICHEN LANG SEIN",
    levels: "LEVEL",
    selected: "AUSGEWÄHLT",
    voteRunning: "ABSTIMMUNG LÄUFT!",
    nextLevelVote: "NÄCHSTES LEVEL?",
    retryLevelVote: "LEVEL WIEDERHOLEN?",
    yesVote: "F1: JA",
    noVote: "F2: NEIN",
    playersVoted: "SPIELER HABEN ABGESTIMMT",
    achievementUnlocked: "ERFOLG FREIGESCHALTET",
    pressKey: "TASTE DRÜCKEN...",
    none: "KEINE",
    up: "HOCH / SPRUNG",
    down: "RUNTER",
    left: "LINKS",
    right: "RECHTS",
    action: "AKTION",
    highscores: "BESTENLISTE",
    gameResults: "SPIEL-ERGEBNISSE",
    achievements: "ERFOLGE",
    vsMode: "VS RENNEN (2P)",
    buildBattleMode: "BUILD-BATTLE (2P)",
    brawlerMode: "KAMPF (2P)",
    book: "BUCH / WIKI",
    generate: "KI CHAOS MODUS",
    deaths: "TODE",
    score: "PUNKTE",
    time: "ZEIT",
    won: "LEVEL GESCHAFFT",
    loading: "KI KOCHT...",
    retry: "R: NEUSTART",
    next: "NÄCHSTES LEVEL",
    control: "PFEILE/WASD bewegen, LEER springen",
    paused: "PAUSE",
    resume: "WEITER",
    backToLobby: "ZURÜCK ZUR LOBBY",
    giveUp: "AUFGEBEN",
    quit: "ZUM MENÜ BEENDEN",
    fixAudio: "AUDIO FIXEN",
    play: "SPIELEN",
    totalScore: "GESAMTPUNKTZAHL",
    enterName: "NAME EINGEBEN",
    save: "SPEICHERN",
    gameOver: "GAME OVER",
    troll: "Geschwindigkeit ist alles.",
    color: "FARBE",
    hat: "HUT",
    eyes: "AUGEN",
    trail: "SPUR",
    coins: "MÜNZEN",
    ghostRun: "GEIST-LAUF",
    editorTools: "1:Wand 2:Gefahr 3:Münze 4:Ziel 5:Start 6:Eis 7:Tramp 8:Schleim 9:Tele",
    editorRelease: "VERÖFFENTLICHEN",
    editorSaveDraft: "ENTWURF SPEICHERN",
    editorTest: "LEVEL TESTEN",
    editorVerified: "VERIFIZIERT!",
    editorUnverified: "ZIEL ERREICHEN ZUM VERÖFFENTLICHEN",
    nameTooShort: "Name muss mindestens 3 Zeichen lang sein",
    nameTooManySpaces: "Maximal 2 Leerzeichen erlaubt",
    editorLoad: "LADEN",
    editorClear: "LÖSCHEN",
    editorClearConfirm: "Bist du sicher? Das wird alles im Level löschen.",
    editorExit: "BEENDEN",
    scrollMode: "SCROLL",
    scrollSpeed: "TEMPO",
    autoScroll: "AUTO-SCROLL",
    levelName: "Level-Name",
    noCustomLevels: "Keine eigenen Level gefunden! Erstelle erst welche im Editor.",
    delete: "LÖSCHEN",
    edit: "EDITIEREN",
    playLevel: "LEVEL SPIELEN",
    testing: "TEST-MODUS - Erreiche das Ziel zur Verifizierung",
    prevLevel: "< ZURÜCK",
    nextLevel: "WEITER >",
    vsTitle: "VS RENN-MODUS",
    playerWin: (name: string) => `${name.toUpperCase()} GEWINNT!`,
    p1Win: "SPIELER 1 GEWINNT!",
    p2Win: "SPIELER 2 GEWINNT!",
    vsControls: "P1: WASD | P2: PFEILE | KEIN BAUEN!",
    export: "JSON EXPORT",
    import: "JSON IMPORT",
    confirmClear: "Bist du sicher? Ungespeicherte Änderungen gehen verloren.",
    deleteConfirm: "Level permanent löschen?",
    importSuccess: "Level erfolgreich importiert!",
    importError: "Ungültige Datei.",
    ability: "FÄHIGKEIT",
    abNone: "KEINE",
    abBuild: "BAUER",
    abDoubleJump: "DOPPELSPRUNG",
    abHook: "GREIFHAKEN",
    tools: "WERKZEUGE",
    eraser: "RADIERER",
    rect: "RECHTECK",
    select: "AUSWAHL",
    grid: "RASTER",
    symmetry: "SYMMETRIE",
    lines: "LINIEN",
    pick: "AUSWÄHLEN",
    scrollTools: "SCROLL-WERKZEUGE",
    undoRedo: "RÜCKGÄNGIG/WIEDERHOLEN",
    sort: "SORTIEREN",
    sortDate: "DATUM",
    sortName: "NAME",
    sortPlayed: "GESPIELT",
    editorTypeTitle: "EDITORTYP WÄHLEN",
    editorTypeNormal: "NORMALES LEVEL",
    editorTypeBrawler: "BRAWLER ARENA",
    editorTypeNormalDesc: "Klassische Level mit Ziel. Fokus auf Jump'n'Run und Geschicklichkeit.",
    editorTypeBrawlerDesc: "Arena-basierte Kampf-Level. Fokus auf Platz, Symmetrie und Gefahren.",
    draft: "ENTWURF",
    lockedItem: "GESPERRT: ",
    confirm: "SICHER?",
    powerup: "POWERUP",
    puBuild: "Bauer",
    puHook: "Haken",
    puSlowMo: "Zeitlupe",
    puXray: "Röntgen",
    puIce: "Eisblock",
    puSlime: "Schleimblock",
    puFireball: "Feuerball",
    puBomb: "Bombe",
    puShield: "Schild",
    puSteal: "Stehlen",
    puSlow: "Verlangsamen",
    puMelee: "Nahkampf",
    puTeleport: "Teleport",
    puTripleJump: "Dreifachsprung",
    puDoubleJump: "Doppelsprung",
    puShrink: "Schrumpfen",
    puGrow: "Wachsen",
    puDash: "Dash",
    localMultiplayer: "LOKALER MULTIPLAYER",
    multiplayer: "MULTIPLAYER",
    onlineMultiplayer: "ONLINE MULTIPLAYER",
    enterLobbyCode: "LOBBY-CODE EINGEBEN",
    nameRequired: "NAME ERFORDERLICH ZUM BEITRETEN ODER ERSTELLEN",
    joinLobby: "LOBBY BEITRETEN",
    createBrawlerLobby: "BRAWLER LOBBY ERSTELLEN",
    createVsLobby: "VS LOBBY ERSTELLEN",
    join: "BEITRETEN",
    cancel: "ABBRECHEN",
    levelSelection: "LEVEL-AUSWAHL",
    selectLevelDesc: "Wähle ein oder mehrere Level für deine Session",
    selectionStatus: "Auswahl-Status",
    levelsSelected: "Level ausgewählt",
    startSession: "SESSION STARTEN",
    startLevel: "LEVEL STARTEN",
    lockedReason: "GESPERRT",
    deleteLevelConfirm: "LEVEL LÖSCHEN?",
    deleteLevelDesc: "Diese Aktion kann nicht rückgängig gemacht werden.",
    selectDifficulty: "SCHWIERIGKEITSGRAD WÄHLEN",
    beginner: "ANFÄNGER",
    advanced: "FORTGESCHRITTEN",
    expert: "EXPERTE",
    god: "SPRUNG-GOTT",
    player1Arrows: "SPIELER 1 (WASD)",
    player2Wasd: "SPIELER 2 (PFEILE)",
    red: "ROT",
    green: "GRÜN",
    blue: "BLAU",
    bodyColor: "KÖRPERFARBE",
    trailColor: "SPURFARBE",
    style: "STIL",
    openLevelMenu: "LEVEL-MENÜ ÖFFNEN",
    levelMenu: "LEVEL-MENÜ",
    brawlerLevels: "BRAWLER LEVEL",
    noLevels: "KEINE LEVEL",
    powerupSettings: "POWERUP EINSTELLUNGEN",
    startBrawl: "BRAWL STARTEN",
    unlocked: "FREIGESCHALTET",
    reward: "BELOHNUNG",
    brawler2p: "BRAWLER (2P)",
    mode: "MODUS",
    selectedLevel: "AUSGEWÄHLTES LEVEL",
    fixConnection: "Verbindung fixen",
    adjustControls: "PFEILE zum Anpassen • ENTER zum Wechseln",
    nextLevelBtn: "NÄCHSTES LEVEL",
    backToSelection: "ZURÜCK ZUR AUSWAHL",
    mainMenu: "HAUPTMENÜ",
    arrowsToChange: "PFEILE ZUM ÄNDERN",
    need2Players: "Mindestens 2 Spieler erforderlich!",
    notAllReady: "Nicht alle Spieler sind bereit!",
    codeMust4Chars: "Code muss 4 Zeichen lang sein",
    wsToSwitch: "W/S zum Wechseln",
    fullRun: "VOLLER LAUF (1-10)",
    noRecords: "KEINE REKORDE",
    maxCoinsReached: "Max. 13 Münzen pro Level!",
    custom: "INDIVIDUELL",
    rank: "RANG",
    name: "NAME",
    level: "LEVEL",
    wikiTitle: "WIKI & WISSEN",
    wikiSubtitle: "DIE ENZYKLOPÄDIE DES TODES",
    wikiTabAll: "ALLE",
    wikiTabBlocks: "BLÖCKE",
    wikiTabPowerups: "POWERUPS",
    wikiTabMechanics: "MECHANIKEN",
    wikiTypeBlock: "BLOCK",
    wikiTypePowerup: "POWERUP",
    wikiTypeMechanic: "SPEZIAL / MECHANIK",
    wikiItems: {
      wall: { name: "Wand", desc: "Eine solide Wand. Kann nicht durchquert werden." },
      hazard: { name: "Gefahr (Rotes Feld)", desc: "Berühre dies nicht, sonst stirbst du sofort!" },
      goal: { name: "Ziel", desc: "Erreiche dieses Feld, um das Level zu beenden." },
      coin: { name: "Münze", desc: "Sammle sie, um im Shop coole Anpassungen zu kaufen." },
      bounce: { name: "Bouncer", desc: "Lässt dich wegspricken, wenn du ihn berührst." },
      ice: { name: "Eis", desc: "Sehr rutschig. Du schlitterst weiter ohne viel Kontrolle." },
      slime: { name: "Schleim", desc: "Klebrig. Erlaubt dir, an der Wand hochzuspringen (Wall Jump)." },
      trampoline: { name: "Trampolin", desc: "Katapultiert dich hoch in die Luft, wenn du darauf landest." },
      teleport: { name: "Teleporter", desc: "Teleportiert dich zu einem verbundenen Ziel." },
      moving_platform: { name: "Bewegliche Plattform", desc: "Bewegt sich horizontal oder vertikal." },
      fragile: { name: "Zerbrechlich", desc: "Zerfällt kurz nachdem du darauf getreten bist." },
      checkpoint: { name: "Checkpoint", desc: "Speichert deinen Fortschritt. Stirbst du, startest du hier." },
      invisible_hazard: { name: "Unsichtbare Gefahr", desc: "Tödlich, aber unsichtbar bis du fast dort bist..." },
      powerup_double_jump: { name: "Doppelsprung-Modul", desc: "Nach dem Einsammeln kannst du ein weiteres Mal in der Luft springen!" },
      powerup_triple_jump: { name: "Dreifach-Sprung", desc: "Ermöglicht bis zu 3 Sprünge in der Luft!" },
      powerup_hook: { name: "Greifhaken-Modul", desc: "Drücke die Aktionstaste (Rechtsklick), um dich an Wände zu ziehen." },
      powerup_dash: { name: "Dash-Modul", desc: "Drücke Aktion für einen schnellen Sprint in Blickrichtung." },
      powerup_xray: { name: "X-Ray Scanner", desc: "Macht unsichtbare Gefahren und falsche Wände sichtbar." },
      powerup_shield: { name: "Schild", desc: "Schützt dich vor dem nächsten tödlichen Treffer." },
      powerup_fireball: { name: "Feuerball", desc: "Schieß Feuerbälle, um andere Spieler in Multiplayer zu töten." },
      powerup_shrink: { name: "Schrumpfpilz", desc: "Macht dich extrem klein, um durch enge Lücken zu passen." },
      powerup_grow: { name: "Wachstumspilz", desc: "Macht dich riesig, wodurch du massivere Sprünge ausführen kannst." },
      powerup_slow_mo: { name: "Zeitlupe", desc: "Verlangsamt die Zeit, damit du Gefahren leichter ausweichen kannst." },
      powerup_build: { name: "Baublöcke", desc: "Erlaubt dir, eigene Level-Blöcke zu platzieren." },
      fake: { name: "Falsche Wand", desc: "Sieht aus wie eine normale Wand, aber du fällst einfach durch!" },
      fake_goal: { name: "Falsches Ziel", desc: "Täuschend echtes Ziel, welches dich oft ins Verderben führt." },
      troll_wall: { name: "Troll-Wand", desc: "Sieht aus wie ein harmloser Hintergrund (schwarz), wird aber plötzlich hart." },
      gravity_reverse: { name: "Schwerkraft-Umkehrer", desc: "Dreht die Welt wortwörtlich auf den Kopf." },
      gravity_zero: { name: "Anti-Schwerkraft", desc: "Du schwebst unkontrollierbar in der Luft." }
    },
    achievements_data: {
      first_blood: { title: "ERSTES BLUT", desc: "Stirb zum ersten Mal." },
      meat_grinder: { title: "FLEISCHWOLF", desc: "Stirb insgesamt 100 Mal." },
      speed_demon: { title: "GESCHWINDIGKEITS-DÄMON", desc: "Schaffe ein Level in unter 10 Sekunden." },
      architect: { title: "ARCHITEKT", desc: "Platziere 50 Blöcke in einem Lauf." },
      pacifist: { title: "PAZIFIST", desc: "Schaffe ein Level ohne Blöcke zu platzieren." },
      masochist: { title: "MASOCHIST", desc: "Stirb 50 Mal in einem Level und gewinne." },
      builder: { title: "MEISTERBAUER", desc: "Platziere insgesamt 100 Blöcke." },
      social: { title: "GESELLIG", desc: "Spiele ein VS-Modus Match." },
      rich: { title: "REICH", desc: "Sammle insgesamt 100 Münzen." },
      marathon: { title: "MARATHON", desc: "Spiele insgesamt 10 Minuten." },
      sniper: { title: "SCHARFSCHÜTZE", desc: "Schaffe ein Level ohne zu sterben." },
      batman: { title: "BATMAN", desc: "Benutze den Greifhaken 50 Mal." },
      bunny: { title: "BUNNY HOP", desc: "Springe insgesamt 1000 Mal." },
      editor_god: { title: "EDITOR-GOTT", desc: "Verifiziere ein eigenes Level." },
      slow_poke: { title: "SCHLAFMÜTZE", desc: "Brauche über 60 Sekunden für ein Level." },
      completionist: { title: "KOMPLETTIERER", desc: "Schalte alle anderen Errungenschaften frei." },
      secret_admin: { title: "HACKER", desc: "Tipp: Dunkelheit mit einem Hauch Magenta. (#130009)" },
      secret_rainbow: { title: "REGENBOGEN", desc: "Tipp: Das hellste grelle Neonpink! (#ff0080)" },
      secret_ghost: { title: "GEIST", desc: "Tipp: Strahlend weiß wie ein Gespenst! (#ffffff)" },
      secret_coffee: { title: "KAFFEEPAUSE", desc: "Tipp: Ein beliebtes Heißgetränk als Hex-Code. (#c0ffee)" },
      secret_matrix: { title: "DIE MATRIX", desc: "Tipp: Entdecke das klassische Hacker-Grün! (#00ff00)" },
      secret_void: { title: "DIE LEERE", desc: "Tipp: Die absolute Abwesenheit von Licht. (#000000)" },
      chatty: { title: "QUASSELSTRIPPE", desc: "Sende 50 Chat-Nachrichten." },
      winner: { title: "GEWINNER", desc: "Gewinne 10 Online-Matches." },
      rage: { title: "RAGE", desc: "Stirb insgesamt 500 Mal." },
      explorer: { title: "ENTDECKER", desc: "Spiele 20 verschiedene Level." },
      speedster: { title: "FLITZER", desc: "Schaffe ein Level in unter 5 Sekunden." },
      builder_pro: { title: "BAUMEISTER-PROFI", desc: "Platziere insgesamt 500 Blöcke." },
      rich_king: { title: "MÜNZ-KÖNIG", desc: "Sammle insgesamt 500 Münzen." },
      marathon_pro: { title: "MARATHON-PROFI", desc: "Spiele insgesamt 60 Minuten." },
      sniper_pro: { title: "SCHARFSCHÜTZEN-PROFI", desc: "Schaffe 10 Level ohne zu sterben." },
      jump_king: { title: "SPRUNG-KÖNIG", desc: "Springe insgesamt 5000 Mal." },
      hook_master: { title: "HAKEN-MEISTER", desc: "Benutze den Greifhaken 200 Mal." },
      lucky: { title: "GLÜCKS-SIEBEN", desc: "Gewinne ein Level mit .777 auf dem Timer!" },
      noob: { title: "ALLER ANFANG...", desc: "Schaffe insgesamt 10 Level." },
      pro: { title: "VETERAN", desc: "Schaffe insgesamt 50 Level." },
      demon: { title: "BRAWL-DÄMON", desc: "Gewinne 5 Online-Matches." },
      cat: { title: "PURRFECT", desc: "Schaffe insgesamt 30 Level." },
      pilot: { title: "PILOT", desc: "Springe insgesamt 10.000 Mal." },
      night_owl: { title: "NACHTEULE", desc: "Spiele insgesamt 120 Minuten." },
      stealth: { title: "SCHATTEN", desc: "Schaffe 5 Level ohne zu sterben." },
      hardcore: { title: "GÖTTLICH", desc: "Schaffe ein SPRUNG-GOTT Level." },
      sea_dog: { title: "SEEBÄR", desc: "Spiele 15 Brawler-Matches." },
      worker: { title: "HARTE ARBEIT", desc: "Verbringe 30 Minuten im Editor." },
      laser_eyes: { title: "LASER-BLICK", desc: "Gewinne 50 Online-Matches." },
      kawaii_eyes: { title: "KAWAII", desc: "Sammle insgesamt 500 Münzen." },
      monocle_eyes: { title: "EDELMANN", desc: "Gewinne 10 Online-Matches." },
      masked_eyes: { title: "ANONYM", desc: "Spiele 20 verschiedene eigene Level." },
      wizard_hat: { title: "MAGIER", desc: "Verbringe 2 Stunden im Editor." },
      bunny_ears: { title: "HASENPRANKEN", desc: "Springe insgesamt 5000 Mal." },
      pirate_hat: { title: "PIRATENKAPITÄN", desc: "Gewinne 5 Brawler-Matches in Folge." },
      party_hat: { title: "PARTY-KÖNIG", desc: "Spiele insgesamt 60 Minuten." }
    },
    eye_names: {
      normal: "Normal",
      angry: "Wütend",
      cyclops: "Zyklop",
      derp: "Derp",
      anime: "Anime",
      dead: "Tot",
      sunglasses: "Sonnenbrille",
      pirate: "Pirat",
      rich: "Reich",
      glowing: "Leuchtend",
      ninja: "Ninja",
      tired: "Müde",
      laser: "Laser",
      kawaii: "Kawaii",
      monocle: "Edelmann",
      masked: "Maskiert",
      alien: "Alien",
      cyborg: "Cyborg",
      stars: "Sterne",
      hearts: "Herzen",
      hypno: "Hypno",
      googly: "Kuller",
      void_eyes: "Leeren-Augen",
      evil: "Böse Augen"
    },
    acc_names: {
      none: "Keines",
      crown: "Krone",
      horns: "Hörner",
      headband: "Stirnband",
      cowboy: "Cowboyhut",
      viking: "Wikingerhelm",
      halo: "Heiligenschein",
      headphones: "Kopfhörer",
      tophat: "Zylinder",
      cap: "Kappe",
      propeller: "Propellerhut",
      cat_ears: "Katzenohren",
      demon_horns: "Dämonenhörner",
      builder_hat: "Bauarbeiterhelm",
      wizard_hat: "Zauberhut",
      bunny_ears: "Hasenohren",
      pirate_hat: "Piratenhut",
      party_hat: "Partyhut",
      sombrero: "Sombrero",
      ushanka: "Ushanka",
      fedora: "Hut",
      chef: "Kochmütze",
      police: "Polizeimütze",
      pumpkin: "Kürbiskopf",
      unicorn: "Einhorn",
      secret_crown: "Geheime Krone",
      rainbow_horn: "Regenbogenhorn",
      ghost_sheet: "Geisterlaken",
      coffee_cup: "Kaffeetasse"
    },
    shopItemNames: {
      normal: "Standard",
      blood: "Blut-Splash",
      confetti: "Konfetti-Party",
      firework: "Leucht-Explosion",
      dust: "Staubwolke",
      electric: "Blitz-Entladung",
      ghost: "Seelen-Freisetzung",
      freeze: "Eis-Splitter",
      blackhole: "Leeren-Kollaps",
      bubble: "Blasen-Zerplatzen",
      "trail_normal": "Standard",
      "trail_pixel-fire": "Flammen-Spur",
      "trail_stardust": "Sternenstaub",
      "trail_slime": "Schleim-Spur",
      "trail_rainbow-pulse": "RGB-Fluss",
      "trail_ghostly": "Phantom-Dampf",
      "trail_bubble-trail": "Tiefsee",
      "trail_spark-trail": "Elektrischer Funke",
      "trail_shadow-trail": "Dunkle Leere",
      "trail_neon-trail": "Cyber-Neon"
    },
    brawlerClasses: {
      standard: { pos: "+ Ausgeglichene Stats", neg: "- Keine Spezialisierung" },
      fighter: { pos: "+ Starke Gesamt-Stats", neg: "- Viel längerer Dash CD" },
      dasher: { pos: "+ Sehr kurzer Dash CD", neg: "- Weniger Leben" },
      jumper: { pos: "+ Echter Triple Jump", neg: "- Weniger Leben" },
      tank: { pos: "+ Mehr Leben & Resistenz", neg: "- Sehr langsam" },
      ninja: { pos: "+ Sehr schnell & hoch", neg: "- Sehr wenig Leben" },
      heavy: { pos: "+ Gewaltiger Knockback", neg: "- Langsam & Massiv" },
      vampire: { pos: "+ Heilt bei Kill", neg: "- Extrem wenig Leben" }
    },
    blockNames: {
      select: "AUSWAHL",
      wall: "WAND",
      walkthrough_wall: "F-WAND",
      hazard: "GEFAHR",
      ghost_hazard: "F-GEFAHR",
      coin: "MÜNZE",
      goal: "ZIEL",
      fake_goal: "F-ZIEL",
      start: "SPAWN P1",
      startP2: "SPAWN P2",
      ice: "EIS",
      fake_ice: "F-EIS",
      trampoline: "TRAMPOLIN",
      slime: "SCHLEIM",
      fake_slime: "F-SLIME",
      teleport: "TELEPORT",
      powerup_build: "P-BAUEN",
      powerup_hook: "P-HAKEN",
      powerup_double_jump: "P-SPRUNG",
      powerup_slow_mo: "P-ZEIT",
      powerup_xray: "P-RÖNTGEN",
      block_dash: "DASH",
      block_shrink: "SCHRUMPF",
      block_grow: "WACHSTUM",
      block_gravity: "GRAV UMKEHR",
      powerup_remover: "KEIN-PWR",
      powerup_spawner: "P-SPAWN",
      checkpoint: "CHECKPOINT",
      gravity_reverse: "Grav-Area stark",
      gravity_zero: "Grav-Area niedrig",
      rectangle: "RECHTECK",
      eraser: "RADIERER"
    },
    radialCategories: {
      Normal: "NORMAL",
      Blöcke: "BLÖCKE",
      Schein: "FAKE-BLÖCKE",
      Werkzeuge: "WERKZEUGE",
      Powerup: "POWERUP",
      Extras: "EXTRAS",
      Auswahl: "AUSWAHL",
      Radierer: "RADIERER",
      Spezial: "SPEZIALBLÖCKE"
    },
    kickPlayer: "SPIELER KICKEN",
    reallyStartVote: "MÖCHTEST DU DIESE ABSTIMMUNG STARTEN?",
    voteKickFor: "{name} KICKEN?",
    noPlayersToKick: "KEINE ANDEREN SPIELER IN DER LOBBY",
    ttHMove: "Horizontale Bewegung",
    ttVMove: "Vertikale Bewegung",
    ttFragile: "Brüchiger Block (zerbricht bei Berührung)",
    ttAutoScroll: "Auto-Scroll-Modus",
    ttAdvanced: "Erweiterte Editor-Optionen",
    ttGrid: "Raster umschalten (G)",
    ttEdgeScroll: "Editor-Rand-Scrollen",
    ttSymmetry: "Auto-Symmetrie (S)",
    ttTest: "Level testen",
    ttSaveDraft: "Entwurf speichern (ohne Test)",
    ttPublish: "Online veröffentlichen!",
    ttReachGoal: "Ziel erreichen zum Veröffentlichen",
    ttExit: "Editor beenden",
    bbSettingsBtn: "⚙️ REGELN & VOREINSTELLUNGEN ANPASSEN...",
    bbModalTitle: "⚙️ BUILD-BATTLE REGELN & BLÖCKE",
    bbClose: "SCHLIESSEN ✖",
    bbRegelTuning: "⏱️ SPIELZEIT & PUNKTELIMIT",
    bbSelectPhase: "Phase: Block-Auswahl",
    bbBuildPhase: "Phase: Bauen & Platzieren",
    bbWinConditions: "Siegbedingungen (Punkte)",
    bbPoints: "Pkt",
    bbOwnPresets: "💾 EIGENE VOREINSTELLUNGEN",
    bbLimitReached: "★ Limit erreicht",
    bbPresetPlaceholder: "Name der Speicherung...",
    bbPresetLimitPlaceholder: "Limit von 5 erreicht!",
    bbSave: "SPEICHERN",
    bbNoPresets: "Keine eigenen Voreinstellungen gespeichert.",
    bbLaden: "LADEN",
    bbAuswahlLabel: "Auswahl",
    bbBauLabel: "Bau",
    bbSiegeLabel: "Siege",
    bbBlocksLabel: "Blöcke",
    bbBlockSelectionPool: "🧱 ERLAUBTE BLÖCKE (POOL)",
    bbAlleAn: "ALLE AN",
    bbStandard: "STANDARD",
    bbSaveAndClose: "✔ EINSTELLUNGEN SPEICHERN & SCHLIESSEN",
    bbCatWalls: "🧱 Wände & Plattformen",
    bbCatHazards: "⚠️ Fallen & Gefahren",
    bbCatPhysics: "🌌 Physik & Mechanik",
    bbCatPowerups: "⚡ Power-ups",
    bbCatModifiers: "🪄 Modifikatoren",
    bbBtnAlle: "ALLE",
    bbBtnAus: "AUS",
    toastAllOn: "Alle Blöcke aktiviert!",
    toastDefault: "Standard-Pool (8 Blöcke) aktiviert!",
    toastMin8: "Mindestens 8 Blöcke müssen aktiv sein!",
    toastMin8Keep: "Mindestens 8 Blöcke müssen aktiv bleiben!",
    toastEnterName: "Bitte gib einen Namen ein!",
    toastNameExists: "Name existiert bereits!",
    toastSaved: "gespeichert!",
    toastLoaded: "geladen!",
    toastDeleted: "Preset gelöscht!",
    toastMax5Reached: "Maximal 5 Voreinstellungen erlaubt! Bitte lösche zuerst eine.",
    bbSelectTimeRemaining: "Auswahlzeit verbleibend",
    bbItemSelectTitle: "ITEM AUSWÄHLEN",
    bbSecret: "GEHEIM",
    bbTaken: "WEG!",
    bbByP1: "VON P1",
    bbByP2: "VON P2",
    bbPlaced: "PLATZIERT",
    bbControlsP1: "WASD BEWEGEN\nE DREHEN\nSPACE PLATZIEREN",
    bbControlsP2: "PFEILE BEWEGEN\nSTRG DREHEN\nENTER PLATZIEREN",
    bbPlayer1: "SPIELER 1",
    bbPlayer2: "SPIELER 2",
    bbSelectControlsP1: "[A] / [D] WÄHLEN\nSPACE BESTÄTIGEN",
    bbSelectControlsP2: "[←] / [→] WÄHLEN\nENTER BESTÄTIGEN",
    bbCancel: "ABBRECHEN"
  },
  [Language.ES]: {
    start: "MODO HISTORIA",
    tutorial: "TUTORIAL",
    editor: "EDITOR DE NIVELES",
    randomRun: "CARRERA ALEATORIA",
    startRun: "INICIAR CARRERA",
    customLevels: "NIVELES PROPIOS",
    customize: "PERSONALIZAR",
    shop: "TIENDA",
    buy: "COMPRAR",
    equipped: "EQUIPADO",
    equip: "EQUIPAR",
    totalCoins: "TOTAL DE MONEDAS",
    random: "AZAR",
    owned: "PROPIEDAD",
    locked: "BLOQUEADO",
    achievementReward: "RECOMPENSA DE LOGRO",
    player1: "JUGADOR 1 (WASD)",
    player2: "JUGADOR 2 (FLECHAS)",
    movingH: "MOVIMIENTO HORIZONTAL",
    movingV: "MOVIMIENTO VERTICAL",
    moveRange: "RANGO DE MOVIMIENTO",
    moveSpeed: "VELOCIDAD",
    fragileBlock: "BLOQUE FRÁGIL",
    width: "ANCHO (W)",
    height: "ALTO (H)",
    xPos: "POS X (X)",
    yPos: "POS Y (Y)",
    editorHint: "CLICK LABEL + WASD/FLECHAS PARA AJUSTAR",
    gridLabel: "REJILLA",
    typeLabel: "TIPO",
    wheelLabel: "RUEDA",
    ctrlLabel: "CTRL",
    clickLabel: "CLIC",
    altLabel: "ALT",
    onLabel: "SÍ",
    offLabel: "NO",
    class: "CLASE",
    settings: "AJUSTES",
    editorEdgeScroll: "DESPLAZAMIENTO DEL BORDE EN EDITOR",
    credits: "CRÉDITOS",
    howToPlay: "CÓMO JUGAR",
    onlineBrawl: "PELEA ONLINE",
    brawlerSettings: "AJUSTES DE PARTIDA",
    practice: "PRÁCTICA",
    quickCustomizer: "PERSONALIZADOR RÁPIDO",
    colorLabel: "COLOR",
    eyesLabel: "OJOS",
    accLabel: "ACCESORIO",
    trailLabel: "ESTELA",
    customLabel: "PROP.",
    offLabelShort: "NO",
    back: "VOLVER",
    music: "MÚSICA",
    sfx: "EFECTOS",
    controls: "CONTROLES",
    jump: "SALTAR",
    move: "MOVER",
    dash: "ESQUIVAR",
    restart: "REINICIAR",
    pause: "PAUSE",
    interact: "INTERACTUAR",
    tutorialTitle: "DOMINA LA LAVA",
    tutorialDesc: "Una guía rápida para sobrevivir al caos de neón.",
    tutorialMoveRow: "FLECHAS / WASD",
    tutorialJumpRow: "ESPACIO / W / ARRIBA",
    tutorialDashRow: "SHIFT / CLIC",
    tutorialHookRow: "CLIC DEL RATÓN",
    designedBy: "DISEÑADO Y DESARROLLADO POR",
    specialThanks: "GRACIAS ESPECIALES A TODOS LOS JUGADORES",
    version: "VERSIÓN",
    trails: "ESTELAS",
    deathAnims: "ANIMACIONES DE MUERTE",
    deathSounds: "SONIDOS DE MUERTE",
    deathSoundDesc: "¡Equipa un efecto de sonido personalizado para afirmar tu dominio al caer!",
    soundsTab: "SONIDOS",
    eyesTab: "OJOS",
    hatsTab: "SOMBREROS Y ACCESORIOS",
    uiSize: "TAMAÑO DE UI",
    maxFps: "FPS MÁXIMOS",
    unlimited: "ILIMITADO",
    clickOrArrowsToChange: "CLIC O FLECHAS PARA CAMBIAR",
    keybindings: "CONTROLES",
    keybindingsDesc: "Selecciona una acción y presiona una tecla o botón para reasignarla.",
    storyLevels: "NIVELES DE HISTORIA",
    playAll: "JUGAR TODO",
    customLevelsLabel: "NIVELES PROPIOS",
    changeSourceHint: "FLECHAS PARA CAMBIAR LA FUENTE",
    audioFixBtn: "ARREGLAR AUDIO",
    collisionLabel: "COLISIÓN",
    levelMenuBtn: "MENÚ DE NIVELES",
    powerupsBtn: "POWERUPS",
    host: "HOST",
    ready: "LISTO",
    notReady: "NO LISTO",
    unready: "NO LISTO",
    selectedLevels: "NIVELES SELECCIONADOS",
    activeQueue: "COLA ACTIVA",
    more: "MÁS",
    noLevelSelected: "NINGÚN NIVEL SELECCIONADO",
    startGame: "INICIAR JUEGO",
    lobby: "SALA",
    codeLengthError: "EL CÓDIGO DEBE TENER 4 CARACTERES",
    levels: "NIVELES",
    selected: "SELECCIONADOS",
    voteRunning: "¡VOTACIÓN EN CURSO!",
    nextLevelVote: "¿SIGUIENTE NIVEL?",
    retryLevelVote: "¿REPETIR NIVEL?",
    yesVote: "F1: SÍ",
    noVote: "F2: NO",
    playersVoted: "JUGADORES HAN VOTADO",
    achievementUnlocked: "LOGRO DESBLOQUEADO",
    pressKey: "PULSA UNA TECLA...",
    none: "NINGUNO",
    up: "ARRIBA / SALT.",
    down: "ABAJO",
    left: "IZQUIERDA",
    right: "DERECHA",
    action: "ACCIÓN",
    highscores: "PUNTUACIONES",
    achievements: "LOGROS",
    vsMode: "CARRERA VS (2P)",
    buildBattleMode: "BATALLA CONSTRUC. (2P)",
    brawlerMode: "PELEA (2P)",
    book: "LIBRO / WIKI",
    generate: "MODO CAOS IA",
    deaths: "MUERTES",
    score: "PUNTOS",
    time: "TIEMPO",
    won: "NIVEL COMPLETADO",
    loading: "IA COCINANDO...",
    retry: "R: REINTENTAR",
    next: "SIGUIENTE NIVEL",
    control: "FLECHAS/WASD mover, ESPACIO saltar",
    paused: "PAUSA",
    resume: "CONTINUAR",
    backToLobby: "VOLVER A LA LOBBY",
    giveUp: "RENDIRSE",
    quit: "SALIR AL MENÚ",
    fixAudio: "ARREGLAR AUDIO",
    play: "JUGAR",
    totalScore: "PUNTUACIÓN TOTAL",
    enterName: "INTRODUCE NOMBRE",
    save: "GUARDAR",
    gameOver: "JUEGO TERMINADO",
    troll: "La velocidad es clave.",
    color: "COLOR",
    hat: "SOMBRERO",
    eyes: "OJOS",
    trail: "RASTRO",
    coins: "MONEDAS",
    ghostRun: "GHOST RUN",
    editorTools: "1:Muro 2:Pel 3:Moneda 4:Meta 5:Inicio 6:Hielo 7:Tramp 8:Slime 9:Tele",
    editorRelease: "PUBLICAR",
    editorSaveDraft: "BORRADOR",
    editorTest: "PROBAR",
    editorVerified: "VERIFICADO!",
    editorUnverified: "COMPLETAR PARA PUBLICAR",
    nameTooShort: "El nombre debe tener al menos 3 caracteres",
    nameTooManySpaces: "Máximo 2 espacios permitidos",
    editorLoad: "CARGAR",
    editorClear: "BORRAR TODO",
    editorClearConfirm: "¿Estás seguro? Se borrará todo el nivel.",
    editorExit: "SALIR",
    scrollMode: "DESPLAZ.",
    scrollSpeed: "VEL.",
    autoScroll: "AUTO-SCROLL",
    levelName: "Nombre del Nivel",
    noCustomLevels: "¡No se encontraron niveles! Crea algunos en el editor.",
    delete: "ELIMINAR",
    edit: "EDITAR",
    playLevel: "JUGAR NIVEL",
    testing: "MODO PRUEBA - Llega a la meta",
    prevLevel: "< ANTERIOR",
    nextLevel: "SIGUIENTE >",
    vsTitle: "MODO CARRERA VS",
    playerWin: (name: string) => `¡${name.toUpperCase()} GANA!`,
    p1Win: "¡JUGADOR 1 GANA!",
    p2Win: "¡JUGADOR 2 GANA!",
    vsControls: "P1: WASD | P2: FLECHAS | ¡SIN CONSTRUIR!",
    export: "EXPORTAR JSON",
    import: "IMPORTAR JSON",
    confirmClear: "¿Estás seguro? Se perderán los cambios.",
    deleteConfirm: "¿Borrar nivel permanentemente?",
    importSuccess: "¡Nivel importado!",
    importError: "Archivo inválido.",
    ability: "HABILIDAD",
    abNone: "NINGUNA",
    abBuild: "CONSTRUCTOR",
    abDoubleJump: "DOBLE SALTO",
    abHook: "GANCHO",
    tools: "HERRAMIENTAS",
    eraser: "BORRADOR",
    rect: "RECTÁNGULO",
    select: "SELECCIONAR",
    grid: "REJILLA",
    symmetry: "SIMETRÍA",
    lines: "LÍNEAS",
    pick: "COGER",
    scrollTools: "SCROLL HERRAM.",
    undoRedo: "DESHACER/REHACER",
    sort: "ORDENAR",
    sortDate: "FECHA",
    sortName: "NOMBRE",
    sortPlayed: "JUGADO",
    editorTypeTitle: "ELEGIR TIPO DE EDITOR",
    editorTypeNormal: "NIVEL NORMAL",
    editorTypeBrawler: "ARENA BRAWLER",
    editorTypeNormalDesc: "Niveles clásicos basados en objetivos. Enfoque en plataformas y llegar a la meta.",
    editorTypeBrawlerDesc: "Niveles de combate basados en arena. Enfoque en el espacio, la simetría y la colocación de peligros.",
    draft: "BORRADOR",
    lockedItem: "BLOQUEADO: ",
    confirm: "¿SEGURO?",
    powerup: "POWERUP",
    puBuild: "Constructor",
    puHook: "Gancho",
    puSlowMo: "Cámara Lenta",
    puXray: "Rayos-X",
    puIce: "Bloque de Hielo",
    puSlime: "Bloque de Limo",
    puFireball: "Bola de Fuego",
    puBomb: "Bomba",
    puShield: "Escudo",
    puSteal: "Robar",
    puSlow: "Ralentizar",
    puMelee: "Cuerpo a Cuerpo",
    puTeleport: "Teletransporte",
    puTripleJump: "Triple Salto",
    puDoubleJump: "Doble Salto",
    puShrink: "Encoger",
    puGrow: "Crecer",
    puDash: "Dash",
    localMultiplayer: "MULTIJUGADOR LOCAL",
    multiplayer: "MULTIJUGADOR",
    onlineMultiplayer: "ONLINE MULTIPLAYER",
    enterLobbyCode: "INTRODUCE CÓDIGO DE SALA",
    nameRequired: "SE REQUIERE NOMBRE PARA UNIRSE O CREAR",
    joinLobby: "UNIRSE A SALA",
    createBrawlerLobby: "CREAR SALA BRAWLER",
    createVsLobby: "CREAR SALA VS",
    join: "UNIRSE",
    cancel: "CANCELAR",
    levelSelection: "SELECCIÓN DE NIVEL",
    selectLevelDesc: "Elige uno o más niveles para tu sesión",
    selectionStatus: "Estado de Selección",
    levelsSelected: "Niveles seleccionados",
    startSession: "INICIAR SESIÓN",
    startLevel: "INICIAR NIVEL",
    lockedReason: "BLOQUEADO",
    deleteLevelConfirm: "¿ELIMINAR NIVEL?",
    deleteLevelDesc: "Esta acción no se puede deshacer.",
    selectDifficulty: "SELECCIONAR DIFICULTAD",
    beginner: "PRINCIPIANTE",
    advanced: "AVANZADO",
    expert: "EXPERTO",
    god: "DIOS DEL SALTO",
    player1Arrows: "JUGADOR 1 (WASD)",
    player2Wasd: "JUGADOR 2 (FLECHAS)",
    red: "ROJO",
    green: "VERDE",
    blue: "AZUL",
    bodyColor: "COLOR DEL CUERPO",
    trailColor: "COLOR DE ESTELA",
    style: "ESTILO",
    openLevelMenu: "ABRIR MENÚ DE NIVELES",
    levelMenu: "MENÚ DE NIVELES",
    brawlerLevels: "NIVELES BRAWLER",
    noLevels: "SIN NIVELES",
    powerupSettings: "AJUSTES DE POWERUP",
    startBrawl: "INICIAR PELEA",
    unlocked: "DESBLOQUEADO",
    reward: "RECOMPENSA",
    brawler2p: "PELEA (2P)",
    mode: "MODO",
    selectedLevel: "NIVEL SELECCIONADO",
    fixConnection: "Arreglar Conexión",
    adjustControls: "FLECHAS para ajustar • ENTER para cambiar",
    nextLevelBtn: "SIGUIENTE NIVEL",
    backToSelection: "VOLVER A SELECCIÓN",
    mainMenu: "MENÚ PRINCIPAL",
    arrowsToChange: "FLECHAS PARA CAMBIAR",
    need2Players: "¡Se necesitan al menos 2 jugadores!",
    notAllReady: "¡No todos los jugadores están listos!",
    codeMust4Chars: "El código debe ser de 4 caracteres",
    wsToSwitch: "W/S para cambiar",
    fullRun: "CARRERA COMPLETA (1-10)",
    noRecords: "SIN REGISTROS",
    maxCoinsReached: "¡Máximo 13 monedas por nivel!",
    custom: "PERSONALIZADO",
    rank: "RANGO",
    name: "NOMBRE",
    level: "NIVEL",
    wikiTitle: "WIKI Y CONOCIMIENTO",
    wikiSubtitle: "LA ENCICLOPEDIA DE LA MUERTE",
    wikiTabAll: "TODO",
    wikiTabBlocks: "BLOQUES",
    wikiTabPowerups: "POWERUPS",
    wikiTabMechanics: "MECÁNICAS",
    wikiTypeBlock: "BLOQUE",
    wikiTypePowerup: "POWERUP",
    wikiTypeMechanic: "ESPECIAL / MECÁNICA",
    wikiItems: {
      wall: { name: "Muro", desc: "Un muro sólido. No se puede atravesar." },
      hazard: { name: "Peligro (Campo Rojo)", desc: "¡No toques esto o morirás al instante!" },
      goal: { name: "Meta", desc: "Llega a este campo para terminar el nivel." },
      coin: { name: "Moneda", desc: "Recógelas para comprar personalizaciones en la tienda." },
      bounce: { name: "Rebotador", desc: "Te hace rebotar cuando lo tocas." },
      ice: { name: "Hielo", desc: "Muy resbaladizo. Te deslizarás sin mucho control." },
      slime: { name: "Slime", desc: "Pegajoso. Te permite hacer saltos de pared." },
      trampoline: { name: "Trampolín", desc: "Te catapulta alto en el aire al aterrizar en él." },
      teleport: { name: "Teleport", desc: "Te teletransporta a un objetivo conectado." },
      moving_platform: { name: "Plataforma Móvil", desc: "Se mueve horizontal o verticalmente." },
      fragile: { name: "Frágil", desc: "Se desmorona poco después de pisarlo." },
      checkpoint: { name: "Punto de Control", desc: "Guarda tu progreso. Si mueres, empiezas aquí." },
      invisible_hazard: { name: "Peligro Invisible", desc: "Mortal, pero invisible hasta que estás cerca..." },
      powerup_double_jump: { name: "Módulo Doble Salto", desc: "¡Tras recogerlo, puedes saltar una vez más en el aire!" },
      powerup_triple_jump: { name: "Triple Salto", desc: "¡Permite hasta 3 saltos en el aire!" },
      powerup_hook: { name: "Módulo de Gancho", desc: "Pulsa acción (Clic Derecho) para atraerte a los muros." },
      powerup_dash: { name: "Módulo de Dash", desc: "Pulsa acción para un impulso rápido." },
      powerup_xray: { name: "Escáner X-Ray", desc: "Hace visibles los peligros invisibles y muros falsos." },
      powerup_shield: { name: "Escudo", desc: "Te protege del próximo golpe mortal." },
      powerup_fireball: { name: "Bola de Fuego", desc: "Dispara bolas de fuego para matar a otros jugadores." },
      powerup_shrink: { name: "Champiñón Encogedor", desc: "Te hace extremadamente pequeño para pasar por huecos estrechos." },
      powerup_grow: { name: "Champiñón Gigante", desc: "Te hace enorme, permitiendo saltos más masivos." },
      powerup_slow_mo: { name: "Cámara Lenta", desc: "Ralentiza el tiempo para esquivar peligros más fácilmente." },
      powerup_build: { name: "Bloques de Construcción", desc: "Te permite colocar tus propios bloques de nivel." },
      fake: { name: "Muro Falso", desc: "¡Parece un muro normal, pero lo atraviesas!" },
      fake_goal: { name: "Meta Falsa", desc: "Una meta engañosa que a menudo lleva a la perdición." },
      troll_wall: { name: "Muro Troll", desc: "Parece fondo inofensivo, pero de repente se vuelve sólido." },
      gravity_reverse: { name: "Inversor de Gravedad", desc: "Literalmente pone el mundo boca abajo." },
      gravity_zero: { name: "Gravedad Cero", desc: "Flotas sin control en el aire." }
    },
    achievements_data: {
      first_blood: { title: "PRIMERA SANGRE", desc: "Muere por primera vez." },
      meat_grinder: { title: "PICADORA DE CARNE", desc: "Muere 100 veces en total." },
      speed_demon: { title: "DEMONIO DE LA VELOCIDAD", desc: "Completa un nivel en menos de 10 segundos." },
      architect: { title: "ARQUITECTO", desc: "Coloca 50 bloques en una sola carrera." },
      pacifist: { title: "PACIFISTA", desc: "Completa un nivel sin colocar bloques." },
      masochist: { title: "MASOQUISTA", desc: "Muere 50 veces en un nivel y gana." },
      builder: { title: "MAESTRO CONSTRUCTOR", desc: "Coloca 100 bloques en total." },
      social: { title: "MARIPOSA SOCIAL", desc: "Juega una partida en modo VS." },
      rich: { title: "RICO", desc: "Recoge 100 monedas en total." },
      marathon: { title: "MARATÓN", desc: "Juega durante 10 minutos en total." },
      sniper: { title: "FRANCOTIRADOR", desc: "Completa un nivel con 0 muertes." },
      batman: { title: "BATMAN", desc: "Usa el gancho 50 veces." },
      bunny: { title: "SALTO DE CONEJO", desc: "Salta 1000 veces en total." },
      editor_god: { title: "DIOS DEL EDITOR", desc: "Verifica un nivel personalizado." },
      slow_poke: { title: "LENTORRO", desc: "Tarda más de 60 segundos en completar un nivel." },
      completionist: { title: "PERFECCIONISTA", desc: "Desbloquea todos los demás logros." },
      secret_admin: { title: "HACKER", desc: "Pista: La oscuridad con un toque de magenta. (#130009)" },
      secret_rainbow: { title: "ARCOÍRIS", desc: "Pista: ¡El rosa neón más brillante! (#ff0080)" },
      secret_ghost: { title: "FANTASMA", desc: "Pista: ¡Blanco y pálido como un fantasma! (#ffffff)" },
      secret_coffee: { title: "HORA DEL CAFÉ", desc: "Pista: Una bebida caliente como código hexadecimal. (#c0ffee)" },
      secret_matrix: { title: "MATRIX", desc: "Pista: ¡El color verde puro de los hackers! (#00ff00)" },
      secret_void: { title: "EL VACÍO", desc: "Pista: La absoluta ausencia de luz. (#000000)" },
      chatty: { title: "CHARLATÁN", desc: "Envía 50 mensajes de chat." },
      winner: { title: "GANADOR", desc: "Gana 10 partidas online." },
      rage: { title: "RAGE", desc: "Muere 500 veces en total." },
      explorer: { title: "EXPLORADOR", desc: "Juega 20 niveles diferentes." },
      speedster: { title: "VELOCISTA", desc: "Completa un nivel en menos de 5 segundos." },
      builder_pro: { title: "CONSTRUCTOR PRO", desc: "Coloca 500 bloques en total." },
      rich_king: { title: "REY RICO", desc: "Recoge 500 monedas en total." },
      marathon_pro: { title: "MARATÓN PRO", desc: "Juega durante 60 minutos en total." },
      sniper_pro: { title: "FRANCOTIRADOR PRO", desc: "Completa 10 niveles con 0 muertes." },
      jump_king: { title: "REY DEL SALTO", desc: "Salta 5000 veces en total." },
      hook_master: { title: "MAESTRO DEL GANCHO", desc: "Usa el gancho 200 veces." },
      lucky: { title: "SIETE DE LA SUERTE", desc: "¡Gana un nivel con el temporizador terminando en .777!" },
      noob: { title: "EMPEZANDO", desc: "Completa 10 niveles en total." },
      pro: { title: "VETERANO", desc: "Completa 50 niveles en total." },
      demon: { title: "DEMONIO DEL BRAWL", desc: "Gana 5 partidas online." },
      cat: { title: "PURRFECTO", desc: "Completa 30 niveles en total." },
      pilot: { title: "PILOTO", desc: "Salta 10.000 veces en total." },
      night_owl: { title: "BÚHO NOCTURNO", desc: "Juega durante 120 minutos en total." },
      stealth: { title: "SOMBRA", desc: "Completa 5 niveles sin morir." },
      hardcore: { title: "COMO UN DIOS", desc: "Completa un nivel DIOS DEL SALTO." },
      sea_dog: { title: "PERRO DE MAR", desc: "Juega 15 partidas Brawler." },
      worker: { title: "TRABAJO DURO", desc: "Pasa 30 minutos en el Editor." },
      laser_eyes: { title: "VISIÓN LÁSER", desc: "Gana 50 partidas online." },
      kawaii_eyes: { title: "KAWAII", desc: "Recoge 500 monedas en total." },
      monocle_eyes: { title: "CABALLERO", desc: "Gana 10 partidas online." },
      masked_eyes: { title: "ANÓNIMO", desc: "Juega 20 niveles personalizados." },
      wizard_hat: { title: "MAGO", desc: "Pasa 2 horas en el Editor." },
      bunny_ears: { title: "SALTADOR", desc: "Salta 5000 veces en total." },
      pirate_hat: { title: "PIRATA", desc: "Gana 5 partidas brawler seguidas." },
      party_hat: { title: "FIESTA", desc: "Juega durante 60 minutos." }
    },
    eye_names: {
      normal: "Normal",
      angry: "Enojado",
      cyclops: "Cíclope",
      derp: "Derp",
      anime: "Anime",
      dead: "Muerto",
      sunglasses: "Gafas de sol",
      pirate: "Pirata",
      rich: "Rico",
      glowing: "Brillante",
      ninja: "Ninja",
      tired: "Cansado",
      laser: "Láser",
      kawaii: "Kawaii",
      monocle: "Caballero",
      masked: "Enmascarado",
      alien: "Alien",
      cyborg: "Cyborg",
      stars: "Estrellas",
      hearts: "Corazones",
      hypno: "Hipno",
      googly: "Ojos saltones",
      void_eyes: "Ojos del Vacío"
    },
    acc_names: {
      none: "Ninguno",
      crown: "Corona",
      horns: "Cuernos",
      headband: "Diadema",
      cowboy: "Vaquero",
      viking: "Vikingo",
      halo: "Halo",
      headphones: "Auriculares",
      tophat: "Chistera",
      cap: "Gorra",
      propeller: "Gorra con hélice",
      cat_ears: "Orejas de gato",
      demon_horns: "Cuernos de demonio",
      builder_hat: "Casco de obrero",
      wizard_hat: "Sombrero de mago",
      bunny_ears: "Orejas de conejo",
      pirate_hat: "Sombrero pirata",
      party_hat: "Gorrito de fiesta",
      sombrero: "Sombrero",
      ushanka: "Ushanka",
      fedora: "Sombrero",
      chef: "Gorro de cocinero",
      police: "Gorra de policía",
      pumpkin: "Cabeza de calabaza",
      unicorn: "Unicornio",
      secret_crown: "Corona Secreta",
      rainbow_horn: "Cuerno Arcoíris",
      ghost_sheet: "Sábana Fantasma",
      coffee_cup: "Taza de Café"
    },
    shopItemNames: {
      normal: "Estándar",
      blood: "Explosión de Sangre",
      confetti: "Fiesta de Confeti",
      firework: "Estallido Brillante",
      dust: "Nube de Polvo",
      electric: "Descarga Eléctrica",
      ghost: "Liberación de Alma",
      freeze: "Fragmentos de Hielo",
      blackhole: "Colapso del Vacío",
      bubble: "Explosión de Burbuja",
      "trail_normal": "Estándar",
      "trail_pixel-fire": "Rastro de Fuego",
      "trail_stardust": "Polvo de Galaxia",
      "trail_slime": "Rastro de Limo",
      "trail_rainbow-pulse": "Flujo RGB",
      "trail_ghostly": "Vapor Fantasmal",
      "trail_bubble-trail": "Mar Profundo",
      "trail_spark-trail": "Chispa Eléctrica",
      "trail_shadow-trail": "Vacío Oscuro",
      "trail_neon-trail": "Neón Cyber"
    },
    brawlerClasses: {
      standard: { pos: "+ Estadísticas Balanceadas", neg: "- Sin Especialización" },
      fighter: { pos: "+ Mejores Stats Globales", neg: "- Enfriamiento Dash muy largo" },
      dasher: { pos: "+ Enfriamiento de Dash Muy Corto", neg: "- Menos Vida" },
      jumper: { pos: "+ Triple Salto Real", neg: "- Menos Vida" },
      tank: { pos: "+ Más Vida y Resistencia", neg: "- Muy Lento" },
      ninja: { pos: "+ Muy Rápido y Alto", neg: "- Vida Muy Baja" },
      heavy: { pos: "+ Retroceso Masivo", neg: "- Lento y Masivo" },
    vampire: { pos: "+ Cura al Matar", neg: "- Vida Extremadamente Baja" }
    },
    kickPlayer: "EXPULSAR JUGADOR",
    reallyStartVote: "¿RECIENTEMENTE QUIERES INICIAR ESTA VOTACIÓN?",
    voteKickFor: "¿EXPULSAR A {name}?",
    noPlayersToKick: "NO HAY OTROS JUGADORES EN LA SALA",
    ttHMove: "Movimiento Horizontal",
    ttVMove: "Movimiento Vertical",
    ttFragile: "Bloque Frágil (se rompe al tocar)",
    ttAutoScroll: "Modo Auto-Scroll",
    ttAdvanced: "Opciones Avanzadas del Editor",
    ttGrid: "Alternar Cuadrícula (G)",
    ttEdgeScroll: "Desplazamiento de Borde del Editor",
    ttSymmetry: "Auto-Simetría (S)",
    ttTest: "Prueba tu nivel",
    ttSaveDraft: "Guardar borrador sin verificar",
    ttPublish: "¡Publicar en línea!",
    ttReachGoal: "Llega a la meta para publicar",
    ttExit: "Salir del Editor",
    bbSettingsBtn: "⚙️ REGLAS Y CONFS. PERSONALIZADAS...",
    bbModalTitle: "⚙️ BUILD-BATTLE REGLAS Y BLOQUES",
    bbClose: "CERRAR ✖",
    bbRegelTuning: "⏱️ TIEMPO DE JUEGO Y LÍMITE DE PUNTOS",
    bbSelectPhase: "Fase: Selección de bloques",
    bbBuildPhase: "Fase: Construcción y Colocación",
    bbWinConditions: "Condiciones de victoria (Puntos)",
    bbPoints: "Ptos",
    bbOwnPresets: "💾 PREAJUSTES PROPIOS",
    bbLimitReached: "[Límite alcanzado]",
    bbPresetPlaceholder: "Nombre del preajuste...",
    bbPresetLimitPlaceholder: "¡Límite de 5 alcanzado!",
    bbSave: "GUARDAR",
    bbNoPresets: "No hay preajustes guardados.",
    bbLaden: "CARGAR",
    bbAuswahlLabel: "Selección",
    bbBauLabel: "Construc.",
    bbSiegeLabel: "Victorias",
    bbBlocksLabel: "Bloques",
    bbBlockSelectionPool: "🧱 POOL DE SELECCIÓN DE BLOQUES",
    bbAlleAn: "TODO SÍ",
    bbStandard: "ESTÁNDAR",
    bbSaveAndClose: "✔ GUARDAR Y CERRAR CONFIGURACIONES",
    bbCatWalls: "🧱 Paredes y Plataformas",
    bbCatHazards: "⚠️ Peligros y Trampas",
    bbCatPhysics: "🌌 Física y Mecánica",
    bbCatPowerups: "⚡ Potenciadores",
    bbCatModifiers: "🪄 Modificadores",
    bbBtnAlle: "TODOS",
    bbBtnAus: "SÍ NO",
    toastAllOn: "¡Todos los bloques activados!",
    toastDefault: "¡Pool estándar (8 bloques) activado!",
    toastMin8: "¡Al menos 8 bloques deben estar activos!",
    toastMin8Keep: "¡Al menos 8 bloques deben permanecer activos!",
    toastEnterName: "¡Por favor, introduce un nombre!",
    toastNameExists: "¡El nombre ya existe!",
    toastSaved: "¡guardado!",
    toastLoaded: "¡cargado!",
    toastDeleted: "¡Preajuste eliminado!",
    toastMax5Reached: "¡Máximo de 5 preajustes permitidos! Por favor, elimina uno primero.",
    bbSelectTimeRemaining: "Tiempo de selección restante",
    bbItemSelectTitle: "SELECCIONAR OBJETO",
    bbSecret: "SECRETO",
    bbTaken: "¡TOMADO!",
    bbByP1: "POR P1",
    bbByP2: "POR P2",
    bbPlaced: "COLOCADO",
    bbControlsP1: "WASD MOVER\nE ROTAR\nESPACIO COLOCAR",
    bbControlsP2: "FLECHAS MOVER\nCTRL ROTAR\nENTER COLOCAR",
    bbPlayer1: "JUGADOR 1",
    bbPlayer2: "JUGADOR 2",
    bbSelectControlsP1: "[A] / [D] SELECC.\nESPACIO CONFIRMAR",
    bbSelectControlsP2: "[←] / [→] SELECC.\nENTER CONFIRMAR",
    bbCancel: "CANCELAR",
    blockNames: {
      select: "SELECCIONAR",
      wall: "PARED",
      walkthrough_wall: "PARED FALSA",
      hazard: "PELIGRO",
      ghost_hazard: "PELIGRO FANT",
      coin: "MONEDA",
      goal: "META",
      fake_goal: "META FALSA",
      start: "INICIO",
      startP2: "SPAWN P2",
      ice: "HIELO",
      fake_ice: "HIELO FALSO",
      trampoline: "TRAMPOLÍN",
      slime: "LIMO",
      fake_slime: "LIMO FALSO",
      teleport: "TELE",
      powerup_build: "P-CONSTR",
      powerup_hook: "P-GANCHO",
      powerup_double_jump: "P-SALTO",
      powerup_slow_mo: "P-TIEMPO",
      powerup_xray: "P-RAYOSX",
      block_dash: "DASH",
      block_shrink: "ENCOGER",
      block_grow: "CRECER",
      block_gravity: "GRAV INV",
      powerup_remover: "SIN-PWR",
      powerup_spawner: "P-SPAWN",
      checkpoint: "CHECKPOINT",
      gravity_reverse: "Grav-Area fuerte",
      gravity_zero: "Grav-Area baja",
      rectangle: "RECTÁNGULO",
      eraser: "BORRADOR"
    },
    radialCategories: {
      Normal: "NORMAL",
      Blöcke: "BLOQUES",
      Schein: "FALSO",
      Werkzeuge: "HERRAM.",
      Powerup: "PODER",
      Extras: "EXTRA",
      Auswahl: "SELECC.",
      Spezial: "ESPECIAL"
    }
  }
};

export const STANDARD_EMOJIS = ['😀', '😂', '😎', '🤔', '👍', '🔥', '🎮', '🚀'];
export const SPECIAL_EMOJIS = [
  { id: 'chatty', emoji: '💬', achievementId: 'chatty' },
  { id: 'winner', emoji: '🏆', achievementId: 'winner' },
  { id: 'rage', emoji: '😡', achievementId: 'rage' },
  { id: 'explorer', emoji: '🗺️', achievementId: 'explorer' },
  { id: 'speedster', emoji: '⚡', achievementId: 'speedster' },
  { id: 'builder_pro', emoji: '🏗️', achievementId: 'builder_pro' },
  { id: 'rich_king', emoji: '💰', achievementId: 'rich_king' },
  { id: 'marathon_pro', emoji: '🕒', achievementId: 'marathon_pro' },
  { id: 'sniper_pro', emoji: '🎯', achievementId: 'sniper_pro' },
  { id: 'jump_king', emoji: '👟', achievementId: 'jump_king' },
  { id: 'hook_master', emoji: '🪝', achievementId: 'hook_master' },
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first_blood', icon: '🩸', title: 'first_blood', description: 'first_blood', condition: (stats) => stats.totalDeaths >= 1 },
  { id: 'meat_grinder', icon: '💀', title: 'meat_grinder', description: 'meat_grinder', condition: (stats) => stats.totalDeaths >= 100 },
  { id: 'speed_demon', icon: '⚡', title: 'speed_demon', description: 'speed_demon', condition: (stats) => stats.levelTime <= 10 && stats.won },
  { id: 'architect', icon: '🏗️', title: 'architect', description: 'architect', condition: (stats) => stats.blocksPlaced >= 50 },
  { id: 'pacifist', icon: '🕊️', title: 'pacifist', description: 'pacifist', condition: (stats) => stats.won && stats.blocksPlaced === 0 && stats.levelId !== 'tutorial' },
  { id: 'masochist', icon: '😈', title: 'masochist', description: 'masochist', condition: (stats) => stats.won && stats.levelDeaths >= 50 },
  
  // NEW ACHIEVEMENTS
  { id: 'builder', icon: '🔨', title: 'builder', description: 'builder', condition: (stats) => stats.blocksPlaced >= 100, reward: 'Cowboy Hat', rewardType: 'accessory', rewardId: 'cowboy' },
  { id: 'social', icon: '🤝', title: 'social', description: 'social', condition: (stats) => stats.mode === 'vs', reward: 'Viking Helm', rewardType: 'accessory', rewardId: 'viking' },
  { id: 'rich', icon: '💰', title: 'rich', description: 'rich', condition: (stats) => (stats.collectedCoinsCount || 0) >= 100, reward: 'Sunglasses', rewardType: 'eyes', rewardId: 'sunglasses' },
  { id: 'marathon', icon: '🏃', title: 'marathon', description: 'marathon', condition: (stats) => stats.time >= 600, reward: 'Anime Eyes', rewardType: 'eyes', rewardId: 'anime' },
  { id: 'sniper', icon: '🎯', title: 'sniper', description: 'sniper', condition: (stats) => stats.won && stats.levelDeaths === 0 && stats.levelId !== 'tutorial', reward: 'Dead Eyes', rewardType: 'eyes', rewardId: 'dead' },
  { id: 'batman', icon: '🦇', title: 'batman', description: 'batman', condition: (stats) => stats.hooksUsed >= 50, reward: 'Headphones', rewardType: 'accessory', rewardId: 'headphones' },
  { id: 'bunny', icon: '🐇', title: 'bunny', description: 'bunny', condition: (stats) => stats.totalJumps >= 1000, reward: 'Fire Trail', rewardType: 'trail', rewardId: '#ff4400' },
  { id: 'editor_god', icon: '👑', title: 'editor_god', description: 'editor_god', condition: (stats) => stats.verifiedLevel === true, reward: 'Rainbow Trail', rewardType: 'trail', rewardId: 'rainbow' },
  { id: 'slow_poke', icon: '🐢', title: 'slow_poke', description: 'slow_poke', condition: (stats) => stats.won && stats.levelTime > 60, reward: 'Halo', rewardType: 'accessory', rewardId: 'halo' },
  { id: 'completionist', icon: '🌟', title: 'completionist', description: 'completionist', condition: (stats) => stats.unlockedCount >= 15, reward: 'Cyclops Eye', rewardType: 'eyes', rewardId: 'cyclops' },
  { id: 'secret_admin', icon: '🕵️', title: 'secret_admin', description: 'secret_admin', condition: (stats) => stats.adminDesignUnlocked === true, reward: 'Hacker Crown', rewardType: 'accessory', rewardId: 'secret_crown' },
  { id: 'secret_rainbow', icon: '🌈', title: 'secret_rainbow', description: 'secret_rainbow', condition: (stats) => stats.rainbowDesignUnlocked === true, reward: 'Rainbow Horn', rewardType: 'accessory', rewardId: 'rainbow_horn' },
  { id: 'secret_ghost', icon: '👻', title: 'secret_ghost', description: 'secret_ghost', condition: (stats) => stats.ghostDesignUnlocked === true, reward: 'Ghost Sheet', rewardType: 'accessory', rewardId: 'ghost_sheet' },
  { id: 'secret_coffee', icon: '☕', title: 'secret_coffee', description: 'secret_coffee', condition: (stats) => stats.coffeeDesignUnlocked === true, reward: 'Coffee Cup', rewardType: 'accessory', rewardId: 'coffee_cup' },
  { id: 'secret_matrix', icon: '💻', title: 'secret_matrix', description: 'secret_matrix', condition: (stats) => stats.matrixDesignUnlocked === true, reward: 'Matrix Code', rewardType: 'trail', rewardId: 'matrix_trail' },
  { id: 'secret_void', icon: '🌌', title: 'secret_void', description: 'secret_void', condition: (stats) => stats.voidDesignUnlocked === true, reward: 'Void Eyes', rewardType: 'eyes', rewardId: 'void_eyes' },

  // EMOJI ACHIEVEMENTS
  { id: 'chatty', icon: '💬', title: 'chatty', description: 'chatty', condition: (stats) => (stats.chatMessagesSent || 0) >= 50, reward: '💬 Emoji', rewardType: 'emoji', rewardId: '💬' },
  { id: 'winner', icon: '🏆', title: 'winner', description: 'winner', condition: (stats) => (stats.onlineWins || 0) >= 10, reward: '🏆 Emoji', rewardType: 'emoji', rewardId: '🏆' },
  { id: 'rage', icon: '😡', title: 'rage', description: 'rage', condition: (stats) => stats.totalDeaths >= 500, reward: '😡 Emoji', rewardType: 'emoji', rewardId: '😡' },
  { id: 'explorer', icon: '🗺️', title: 'explorer', description: 'explorer', condition: (stats) => (stats.levelsPlayedCount || 0) >= 20, reward: '🗺️ Emoji', rewardType: 'emoji', rewardId: '🗺️' },
  { id: 'speedster', icon: '⚡', title: 'speedster', description: 'speedster', condition: (stats) => stats.levelTime <= 5 && stats.won, reward: '⚡ Emoji', rewardType: 'emoji', rewardId: '⚡' },
  { id: 'builder_pro', icon: '🏗️', title: 'builder_pro', description: 'builder_pro', condition: (stats) => (stats.totalBlocksPlaced || 0) >= 500, reward: '🏗️ Emoji', rewardType: 'emoji', rewardId: '🏗️' },
  { id: 'rich_king', icon: '👑', title: 'rich_king', description: 'rich_king', condition: (stats) => (stats.totalCoinsCollected || 0) >= 500, reward: '💰 Emoji', rewardType: 'emoji', rewardId: '💰' },
  { id: 'marathon_pro', icon: '🕒', title: 'marathon_pro', description: 'marathon_pro', condition: (stats) => stats.time >= 3600, reward: '🕒 Emoji', rewardType: 'emoji', rewardId: '🕒' },
  { id: 'sniper_pro', icon: '🎯', title: 'sniper_pro', description: 'sniper_pro', condition: (stats) => (stats.flawlessLevelsCount || 0) >= 10, reward: '🎯 Emoji', rewardType: 'emoji', rewardId: '🎯' },
  { id: 'jump_king', icon: '👟', title: 'jump_king', description: 'jump_king', condition: (stats) => stats.totalJumps >= 5000, reward: '👟 Emoji', rewardType: 'emoji', rewardId: '👟' },
  { id: 'hook_master', icon: '🪝', title: 'hook_master', description: 'hook_master', condition: (stats) => stats.hooksUsed >= 200, reward: '🪝 Emoji', rewardType: 'emoji', rewardId: '🪝' },
  { id: 'lucky', icon: '🎰', title: 'lucky', description: 'lucky', condition: (stats) => stats.won && Math.floor(stats.levelTime * 1000) % 1000 === 777, reward: 'Rich Eyes', rewardType: 'eyes', rewardId: 'rich' },
  { id: 'noob', icon: '🧢', title: 'noob', description: 'noob', condition: (stats) => (stats.levelsPlayedCount || 0) >= 10, reward: 'Cap', rewardType: 'accessory', rewardId: 'cap' },
  { id: 'pro', icon: '🎩', title: 'pro', description: 'pro', condition: (stats) => (stats.levelsPlayedCount || 0) >= 50, reward: 'Top Hat', rewardType: 'accessory', rewardId: 'tophat' },
  { id: 'demon', icon: '😈', title: 'demon', description: 'demon', condition: (stats) => (stats.onlineWins || 0) >= 5, reward: 'Demon Horns', rewardType: 'accessory', rewardId: 'demon_horns' },
  { id: 'cat', icon: '🐱', title: 'cat', description: 'cat', condition: (stats) => (stats.levelsPlayedCount || 0) >= 30, reward: 'Cat Ears', rewardType: 'accessory', rewardId: 'cat_ears' },
  { id: 'pilot', icon: '🚁', title: 'pilot', description: 'pilot', condition: (stats) => stats.totalJumps >= 10000, reward: 'Propeller Hat', rewardType: 'accessory', rewardId: 'propeller' },
  { id: 'night_owl', icon: '🦉', title: 'night_owl', description: 'night_owl', condition: (stats) => stats.time >= 7200, reward: 'Tired Eyes', rewardType: 'eyes', rewardId: 'tired' },
  { id: 'stealth', icon: '🥷', title: 'stealth', description: 'stealth', condition: (stats) => (stats.flawlessLevelsCount || 0) >= 5, reward: 'Ninja Mask', rewardType: 'eyes', rewardId: 'ninja' },
  { id: 'hardcore', icon: '🔥', title: 'hardcore', description: 'hardcore', condition: (stats) => stats.won && stats.difficulty === 'god', reward: 'Glowing Eyes', rewardType: 'eyes', rewardId: 'glowing' },
  { id: 'sea_dog', icon: '🏴‍☠️', title: 'sea_dog', description: 'sea_dog', condition: (stats) => (stats.brawlerLevelsPlayedCount || 0) >= 15, reward: 'Pirate Eye', rewardType: 'eyes', rewardId: 'pirate' },
  { id: 'worker', icon: '👷', title: 'worker', description: 'worker', condition: (stats) => (stats.editorTime || 0) >= 1800, reward: 'Builder Hat', rewardType: 'accessory', rewardId: 'builder_hat' },
  { id: 'laser_eyes', icon: '🔴', title: 'laser_eyes', description: 'laser_eyes', condition: (stats) => (stats.onlineWins || 0) >= 50, reward: 'Laser Eyes', rewardType: 'eyes', rewardId: 'laser' },
  { id: 'kawaii_eyes', icon: '🥺', title: 'kawaii_eyes', description: 'kawaii_eyes', condition: (stats) => (stats.coins || 0) >= 500, reward: 'Kawaii Eyes', rewardType: 'eyes', rewardId: 'kawaii' },
  { id: 'monocle_eyes', icon: '🧐', title: 'monocle_eyes', description: 'monocle_eyes', condition: (stats) => (stats.onlineWins || 0) >= 10, reward: 'Monocle', rewardType: 'eyes', rewardId: 'monocle' },
  { id: 'masked_eyes', icon: '🎭', title: 'masked_eyes', description: 'masked_eyes', condition: (stats) => (stats.customLevelsPlayed || 0) >= 20, reward: 'Masked', rewardType: 'eyes', rewardId: 'masked' },
  { id: 'wizard_hat', icon: '🧙', title: 'wizard_hat', description: 'wizard_hat', condition: (stats) => (stats.editorTime || 0) >= 7200, reward: 'Wizard Hat', rewardType: 'accessory', rewardId: 'wizard_hat' },
  { id: 'bunny_ears', icon: '🐰', title: 'bunny_ears', description: 'bunny_ears', condition: (stats) => stats.totalJumps >= 5000, reward: 'Bunny Ears', rewardType: 'accessory', rewardId: 'bunny_ears' },
  { id: 'pirate_hat', icon: '🎩', title: 'pirate_hat', description: 'pirate_hat', condition: (stats) => (stats.brawlerWinStreak || 0) >= 5, reward: 'Pirate Hat', rewardType: 'accessory', rewardId: 'pirate_hat' },
  { id: 'party_hat', icon: '🥳', title: 'party_hat', description: 'party_hat', condition: (stats) => stats.time >= 3600, reward: 'Party Hat', rewardType: 'accessory', rewardId: 'party_hat' }
];

// Procedural Level Generator
const generateLevelSequence = (count: number, difficulty: 'adv' | 'exp' | 'god', startIdx: number): LevelData[] => {
  const levels: LevelData[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = `${difficulty}_${startIdx + i}`;
    const entities: Entity[] = [
      { x: 0, y: 0, w: 960, h: 30, type: 'wall' }, 
      { x: 0, y: 510, w: 960, h: 30, type: difficulty === 'god' ? 'hazard' : 'wall' },
      { x: 0, y: 0, w: 30, h: 540, type: 'wall' }, 
      { x: 930, y: 0, w: 30, h: 540, type: 'wall' },
      { x: 50, y: 470, w: 40, h: 30, type: 'wall' } // Start Block
    ];

    // Simple procedural generation patterns
    const pattern = i % 4; 
    let goalX = 880, goalY = 450;

    if (pattern === 0) { // Stairs
       for(let j=0; j<6; j++) {
          entities.push({ x: 150 + j*120, y: 400 - j*50, w: 60, h: 20, type: 'wall' });
          if(difficulty === 'exp' || difficulty === 'god') entities.push({ x: 170 + j*120, y: 430 - j*50, w: 20, h: 20, type: 'hazard' });
       }
       goalY = 100;
    } else if (pattern === 1) { // Gaps
       for(let j=0; j<4; j++) {
          entities.push({ x: 200 + j*180, y: 350, w: 40, h: 200, type: 'wall' });
          if (difficulty === 'god') entities.push({ x: 290 + j*180, y: 300, w: 20, h: 20, type: 'hazard' });
       }
       goalX = 880; goalY = 300;
    } else if (pattern === 2) { // Tunnel
       entities.push({ x: 200, y: 200, w: 600, h: 20, type: 'wall' });
       entities.push({ x: 200, y: 350, w: 600, h: 20, type: 'wall' });
       if (difficulty !== 'adv') entities.push({ x: 400, y: 330, w: 20, h: 20, type: 'hazard' });
       goalX = 850; goalY = 250;
    } else { // Vertical
       entities.push({ x: 300, y: 100, w: 30, h: 440, type: difficulty === 'god' ? 'slime' : 'wall' });
       entities.push({ x: 600, y: 0, w: 30, h: 440, type: difficulty === 'god' ? 'slime' : 'wall' });
       goalX = 800; goalY = 450;
    }

    // Add Goal & Coin
    entities.push({ x: goalX, y: goalY, w: 30, h: 30, type: 'goal' });
    entities.push({ x: goalX - 50, y: goalY, w: 20, h: 20, type: 'coin', id: `c_${id}` });

    levels.push({
      id: id,
      name: `${difficulty.toUpperCase()} ${startIdx + i}`,
      start: { x: 50, y: 450 },
      entities: entities,
      allowedAbility: difficulty === 'adv' ? 'build' : difficulty === 'exp' ? 'double_jump' : 'none'
    });
  }
  return levels;
};

// --- ADVANCED GENERATOR (Custom for replacement) ---
const generateAdvancedLevels = (): LevelData[] => {
  const levels: LevelData[] = [];
  const count = 10;

  for (let i = 0; i < count; i++) {
     const id = `adv_gen_${i}`;
     const startX = 60;
     const startY = 400;
     const entities: Entity[] = [
       // Borders
       { x: 0, y: 0, w: GAME_WIDTH, h: 30, type: 'wall' }, 
       { x: 0, y: 0, w: 30, h: GAME_HEIGHT, type: 'wall' }, 
       { x: GAME_WIDTH - 30, y: 0, w: 30, h: GAME_HEIGHT, type: 'wall' },
       { x: 0, y: GAME_HEIGHT - 30, w: GAME_WIDTH, h: 30, type: 'hazard' }, // Floor is Lava
       // Start Platform (Always 2 blocks wide minimum under start)
       { x: startX - 20, y: startY + 20, w: 80, h: 30, type: 'wall' } 
     ];

     const theme = i === 6 ? 8 : (i >= 9 ? i : (i < 6 ? (i % 5) : (5 + (i - 6) % 3))); // 0-4: Original, 5-7: New, 8: Lvl 7, 9-14: Lvl 10-15
     const abilityRoll = Math.random();
     let allowedAbility: any = abilityRoll < 0.3 ? 'double_jump' : abilityRoll < 0.6 ? 'build' : 'hook';
     
     // Force abilities for specific themes that require them
     if (theme === 6) allowedAbility = 'hook'; 
     if (theme === 8) allowedAbility = 'build'; // Level 7 requires building
     if (theme === 9) allowedAbility = null; // Level 10: Pure skill, no ability
     if (theme === 10) allowedAbility = 'hook'; // Level 11: Ice Cavern requires hook
     if (theme === 11) allowedAbility = null; // Level 12: Lava Moat, no ability
     if (theme === 12) allowedAbility = 'build'; // Level 13: The Barricade requires building
     if (theme === 13) allowedAbility = 'double_jump'; // Level 14: Trampoline City requires double jump
     if (theme === 14) allowedAbility = null; // Level 15: The Final Ascend, no ability
     
     let goalX = 850, goalY = 400;

     if (theme === 0) { // Precision Jumping
        for (let j = 0; j < 6; j++) {
           const type = Math.random() > 0.8 ? 'ice' : 'wall'; // Reduced ice chance from 0.7 to 0.8
           const h = Math.random() > 0.8 ? 150 : 30;
           entities.push({ x: 200 + j * 110, y: 350 - (j % 2) * 100, w: 40, h: h, type });
           // Reduced hazard spawn on pillars
           if (h === 30 && Math.random() > 0.6) entities.push({ x: 210 + j * 110, y: 350 - (j % 2) * 100 - 30, w: 20, h: 20, type: 'hazard' });
        }
        goalY = 100;
     } else if (theme === 1) { // Troll
        // Fake floor
        entities.push({ x: 200, y: 420, w: 600, h: 30, type: 'troll_wall' });
        entities.push({ x: 200, y: 450, w: 600, h: 30, type: 'hazard' }); // Death below fake floor
        // Safe islands
        entities.push({ x: 350, y: 300, w: 50, h: 20, type: 'wall' });
        entities.push({ x: 550, y: 300, w: 50, h: 20, type: 'wall' });
        // Fake Goal - Moved out of immediate path or removed
        if (Math.random() > 0.5) {
             entities.push({ x: 560, y: 250, w: 40, h: 40, type: 'ghost_hazard' }); 
        }
        
        goalX = 880; goalY = 200;
     } else if (theme === 2) { // Theme 2: The Tower (Redesigned)
        // Central Tower
        entities.push({ x: 400, y: 150, w: 160, h: 390, type: 'wall' });
        
        // Platforms left
        entities.push({ x: 250, y: 350, w: 60, h: 20, type: 'wall' });
        entities.push({ x: 150, y: 250, w: 60, h: 20, type: 'wall' });
        
        // Crossing on top
        entities.push({ x: 350, y: 100, w: 260, h: 20, type: 'troll_wall' }); // Fake bridge!
        entities.push({ x: 420, y: 150, w: 120, h: 20, type: 'wall' }); // Real top of tower (inside)
        
        // Tunnel through tower (Safe route)
        entities.push({ x: 400, y: 250, w: 160, h: 20, type: 'wall' }); 

        // Platforms right
        entities.push({ x: 650, y: 250, w: 60, h: 20, type: 'ice' });
        entities.push({ x: 750, y: 350, w: 60, h: 20, type: 'wall' });

        goalX = 850; goalY = 400;
     } else if (theme === 3) { // Theme 3: Bounce Parkour (Redesigned)
        // Safe start
        entities.push({ x: 150, y: 400, w: 100, h: 20, type: 'wall' });
        
        // Trampolines
        entities.push({ x: 350, y: 480, w: 60, h: 10, type: 'trampoline' });
        entities.push({ x: 550, y: 400, w: 60, h: 10, type: 'trampoline' });
        entities.push({ x: 750, y: 300, w: 60, h: 10, type: 'trampoline' });
        
        // Obstacles (walls hanging from ceiling)
        entities.push({ x: 450, y: 0, w: 30, h: 250, type: 'wall' });
        entities.push({ x: 650, y: 0, w: 30, h: 150, type: 'wall' });
        
        // Goal platform high
        entities.push({ x: 850, y: 150, w: 80, h: 20, type: 'wall' });
        
        goalX = 870; goalY = 100;
     } else if (theme === 4) { // Mix / Teleport
        entities.push({ x: 200, y: 300, w: 29, h: 29, type: 'teleport' });
        entities.push({ x: 700, y: 100, w: 29, h: 29, type: 'teleport' });
        
        // Box in the destination
        entities.push({ x: 650, y: 80, w: 10, h: 100, type: 'wall' });
        entities.push({ x: 750, y: 80, w: 10, h: 100, type: 'wall' });
        entities.push({ x: 650, y: 180, w: 110, h: 10, type: 'wall' });
        
        goalX = 880; goalY = 400;
     } else if (theme === 5) { // Theme 5: Slime Climb (Improved)
        entities.push({ x: 200, y: 100, w: 30, h: 440, type: 'slime' });
        entities.push({ x: 400, y: 0, w: 30, h: 440, type: 'slime' });
        entities.push({ x: 600, y: 100, w: 30, h: 440, type: 'slime' });
        entities.push({ x: 800, y: 0, w: 30, h: 440, type: 'slime' });
        // More intermediate platforms to make it beatable
        for (let j = 0; j < 6; j++) {
            entities.push({ x: 150 + j * 130, y: 450 - (j % 3) * 150, w: 50, h: 20, type: 'wall' });
        }
        goalX = 900; goalY = 100;
     } else if (theme === 6) { // Theme 6: Hook Precision
        for (let j = 0; j < 5; j++) {
            entities.push({ x: 200 + j * 150, y: 50, w: 40, h: 40, type: 'wall' });
            // Hazards below, but with some safe spots
            if (j % 2 === 0) {
                entities.push({ x: 200 + j * 150, y: 400, w: 100, h: 20, type: 'wall' });
            } else {
                entities.push({ x: 200 + j * 150, y: 400, w: 100, h: 20, type: 'hazard' });
            }
        }
        entities.push({ x: 850, y: 100, w: 80, h: 20, type: 'wall' });
        goalX = 880; goalY = 50;
     } else if (theme === 8) { // Special Theme 8: The Zig Zag (Completely New for Level 7)
        // A series of vertical walls with small gaps, requiring building or precise jumping
        for (let j = 0; j < 5; j++) {
            const x = 200 + j * 160;
            entities.push({ x: x, y: 0, w: 20, h: 300, type: 'wall' });
            entities.push({ x: x, y: 400, w: 20, h: 140, type: 'wall' });
            // Small buildable gap
            entities.push({ x: x - 40, y: 350, w: 40, h: 10, type: 'ice' });
        }
        goalX = 880; goalY = 250;
     } else if (theme === 9) { // Theme 9: The Sky Bridge (Level 10)
        // High altitude, tiny platforms, NO ability
        for (let j = 0; j < 8; j++) {
            const x = 150 + j * 90;
            const y = 250 + Math.sin(j * 1.5) * 50;
            entities.push({ x, y, w: 40, h: 20, type: 'wall' });
            // Add hazards in between
            if (j > 0 && j < 7) {
                entities.push({ x: x - 45, y: y + 80, w: 20, h: 20, type: 'hazard' });
            }
        }
        goalX = 850; goalY = 200;
     } else if (theme === 10) { // Theme 10: Ice Cavern (Level 11)
        // Slippery ice platforms, hook needed to cross large gaps
        entities.push({ x: 150, y: 300, w: 100, h: 20, type: 'ice' });
        entities.push({ x: 400, y: 100, w: 40, h: 40, type: 'wall' }); // Grapple point
        entities.push({ x: 400, y: 400, w: 100, h: 20, type: 'hazard' });
        entities.push({ x: 650, y: 300, w: 100, h: 20, type: 'ice' });
        entities.push({ x: 800, y: 150, w: 40, h: 40, type: 'wall' }); // Grapple point
        goalX = 900; goalY = 300;
     } else if (theme === 11) { // Theme 11: Lava Moat (Level 12)
        // Huge lava pits, precise jumps on small pillars, no ability
        entities.push({ x: 150, y: 450, w: 700, h: 30, type: 'hazard' });
        for (let j = 0; j < 5; j++) {
            entities.push({ x: 250 + j * 130, y: 350 - (j % 2) * 50, w: 30, h: 100 + (j % 2) * 50, type: 'wall' });
        }
        goalX = 880; goalY = 250;
     } else if (theme === 12) { // Theme 12: The Barricade (Level 13)
        // Tall walls blocking the path, must build over them
        for (let j = 0; j < 4; j++) {
            entities.push({ x: 250 + j * 180, y: 150, w: 20, h: 350, type: 'wall' });
            entities.push({ x: 250 + j * 180, y: 0, w: 20, h: 50, type: 'hazard' });
        }
        goalX = 880; goalY = 400;
     } else if (theme === 13) { // Theme 13: Trampoline City (Level 14)
        // Trampolines over hazards, use double jump to steer
        for (let j = 0; j < 5; j++) {
            entities.push({ x: 200 + j * 140, y: 400, w: 40, h: 10, type: 'trampoline' });
            entities.push({ x: 200 + j * 140, y: 450, w: 100, h: 30, type: 'hazard' });
            // Ceiling hazards to prevent jumping too high
            entities.push({ x: 200 + j * 140, y: 0, w: 40, h: 150, type: 'hazard' });
        }
        goalX = 880; goalY = 350;
     } else if (theme === 14) { // Theme 14: The Final Ascend (Level 15)
        // Hardcore platforming, no abilities. Slime, ice, trampolines, hazards.
        entities.push({ x: 150, y: 350, w: 40, h: 10, type: 'trampoline' });
        entities.push({ x: 250, y: 200, w: 20, h: 200, type: 'slime' });
        entities.push({ x: 350, y: 180, w: 40, h: 20, type: 'ice' });
        entities.push({ x: 500, y: 300, w: 40, h: 10, type: 'trampoline' });
        entities.push({ x: 620, y: 150, w: 20, h: 200, type: 'slime' });
        entities.push({ x: 740, y: 120, w: 40, h: 20, type: 'wall' });
        entities.push({ x: 850, y: 100, w: 40, h: 20, type: 'wall' });
        
        // Hazards everywhere below
        entities.push({ x: 150, y: 450, w: 750, h: 30, type: 'hazard' });
        goalX = 860; goalY = 50;
     } else { // Theme 7: The Gauntlet
        for (let j = 0; j < 6; j++) {
            const gapY = 150 + (j % 2) * 100; // Larger gaps
            entities.push({ x: 150 + j * 120, y: 0, w: 30, h: gapY, type: 'wall' });
            entities.push({ x: 150 + j * 120, y: gapY + 120, w: 30, h: GAME_HEIGHT - gapY - 120, type: 'wall' });
            // Fewer hazards
            if (j % 2 === 0) {
                entities.push({ x: 150 + j * 120, y: gapY - 30, w: 30, h: 30, type: 'hazard' });
            }
        }
        goalX = 900; goalY = 250;
     }
     
     // Ensure goal exists
     entities.push({ x: goalX, y: goalY, w: 30, h: 30, type: 'goal' });
     entities.push({ x: goalX - 50, y: goalY + 10, w: 20, h: 20, type: 'coin', id: `c_${id}` });

     levels.push({
        id,
        name: `ADVANCED ${i + 1}`,
        start: { x: startX, y: startY },
        entities,
        allowedAbility
     });
  }

  return levels;
};


export const BRAWLER_LEVELS: LevelData[] = [
  {
    id: 'brawl1', name: 'Brawler 1: The Pit', start: { x: 200, y: 100 }, startP2: { x: 760, y: 100 }, allowedAbility: 'double_jump',
    entities: [
      { x: 150, y: 400, w: 660, h: 30, type: 'wall' },
      { x: 300, y: 250, w: 360, h: 30, type: 'wall' }
    ]
  },
  {
    id: 'brawl2', name: 'Brawler 2: Twin Peaks', start: { x: 100, y: 100 }, startP2: { x: 860, y: 100 }, allowedAbility: 'double_jump',
    entities: [
      { x: 50, y: 300, w: 200, h: 30, type: 'wall' },
      { x: 710, y: 300, w: 200, h: 30, type: 'wall' },
      { x: 380, y: 450, w: 200, h: 30, type: 'wall' },
      { x: 430, y: 200, w: 100, h: 30, type: 'bounce' }
    ]
  },
  {
    id: 'brawl3', name: 'Brawler 3: Ice Rink', start: { x: 480, y: 50 }, startP2: { x: 480, y: 400 }, allowedAbility: 'double_jump',
    entities: [
      { x: 200, y: 500, w: 560, h: 30, type: 'ice' },
      { x: 100, y: 280, w: 150, h: 30, type: 'ice' },
      { x: 710, y: 280, w: 150, h: 30, type: 'ice' }
    ]
  },
  {
    id: 'brawl4', name: 'Brawler 4: Slime Time', start: { x: 100, y: 400 }, startP2: { x: 860, y: 400 }, allowedAbility: 'double_jump',
    entities: [
      { x: 50, y: 450, w: 150, h: 30, type: 'slime' },
      { x: 760, y: 450, w: 150, h: 30, type: 'slime' },
      { x: 380, y: 300, w: 200, h: 30, type: 'slime' },
      { x: 200, y: 150, w: 100, h: 30, type: 'wall' },
      { x: 660, y: 150, w: 100, h: 30, type: 'wall' }
    ]
  },
  {
    id: 'brawl5', name: 'Brawler 5: Chaos', start: { x: 200, y: 200 }, startP2: { x: 760, y: 200 }, allowedAbility: 'double_jump',
    entities: [
      { x: 150, y: 300, w: 100, h: 30, type: 'ice' },
      { x: 710, y: 300, w: 100, h: 30, type: 'ice' },
      { x: 430, y: 450, w: 100, h: 30, type: 'trampoline' },
      { x: 380, y: 150, w: 200, h: 30, type: 'wall' }
    ]
  }
];

export const BUILD_BATTLE_LEVELS: LevelData[] = [
  {
    id: 'build1',
    name: 'Build Battle 1: Zickzack-Klippen',
    width: 1500,
    height: 540,
    start: { x: 100, y: 100 },
    startP2: { x: 140, y: 100 },
    allowedAbility: 'none',
    entities: [
      { x: 50, y: 130, w: 150, h: 30, type: 'wall' },
      { x: 50, y: 350, w: 150, h: 30, type: 'wall' },
      { x: 1300, y: 250, w: 150, h: 30, type: 'wall' },
      { x: 1360, y: 190, w: 30, h: 60, type: 'goal' },
      { x: 200, y: 510, w: 1100, h: 30, type: 'hazard' },
      { x: 400, y: 300, w: 60, h: 30, type: 'slime' },
      { x: 800, y: 150, w: 60, h: 30, type: 'slime' }
    ]
  },
  {
    id: 'build2',
    name: 'Build Battle 2: Die Sprungbrett-Schlucht',
    width: 1500,
    height: 540,
    start: { x: 50, y: 450 },
    startP2: { x: 90, y: 450 },
    allowedAbility: 'none',
    entities: [
      { x: 30, y: 480, w: 120, h: 60, type: 'wall' },
      { x: 350, y: 510, w: 60, h: 30, type: 'trampoline' },
      { x: 800, y: 510, w: 60, h: 30, type: 'trampoline' },
      { x: 1350, y: 250, w: 120, h: 60, type: 'wall' },
      { x: 1390, y: 190, w: 30, h: 60, type: 'goal' },
      { x: 150, y: 510, w: 200, h: 30, type: 'hazard' },
      { x: 410, y: 510, w: 390, h: 30, type: 'hazard' },
      { x: 860, y: 510, w: 490, h: 30, type: 'hazard' }
    ]
  },
  {
    id: 'build3',
    name: 'Build Battle 3: Das Eis-Labyrinth',
    width: 1500,
    height: 540,
    start: { x: 80, y: 430 },
    startP2: { x: 120, y: 430 },
    allowedAbility: 'none',
    entities: [
      { x: 50, y: 460, w: 150, h: 30, type: 'ice' },
      { x: 400, y: 350, w: 200, h: 30, type: 'ice' },
      { x: 800, y: 250, w: 200, h: 30, type: 'ice' },
      { x: 1300, y: 150, w: 150, h: 30, type: 'ice' },
      { x: 1360, y: 90, w: 30, h: 60, type: 'goal' },
      { x: 200, y: 510, w: 1100, h: 30, type: 'hazard' },
      { x: 600, y: 150, w: 30, h: 360, type: 'wall' }
    ]
  },
  {
    id: 'build4',
    name: 'Build Battle 4: Bröckel-Türme',
    width: 1500,
    height: 540,
    start: { x: 100, y: 150 },
    startP2: { x: 140, y: 150 },
    allowedAbility: 'hook',
    entities: [
      { x: 80, y: 180, w: 120, h: 30, type: 'wall' },
      { x: 400, y: 280, w: 90, h: 30, type: 'fragile' },
      { x: 750, y: 380, w: 90, h: 30, type: 'fragile' },
      { x: 1100, y: 280, w: 90, h: 30, type: 'fragile' },
      { x: 1350, y: 150, w: 120, h: 30, type: 'wall' },
      { x: 1390, y: 90, w: 30, h: 60, type: 'goal' },
      { x: 0, y: 510, w: 1500, h: 30, type: 'hazard' }
    ]
  },
  {
    id: 'build5',
    name: 'Build Battle 5: Portal-Wahnsinn',
    width: 1500,
    height: 540,
    start: { x: 100, y: 440 },
    startP2: { x: 140, y: 440 },
    allowedAbility: 'none',
    entities: [
      { x: 80, y: 470, w: 120, h: 30, type: 'wall' },
      { x: 100, y: 380, w: 40, h: 60, type: 'teleport' },
      { x: 750, y: 100, w: 40, h: 60, type: 'teleport' },
      { x: 700, y: 160, w: 140, h: 30, type: 'wall' },
      { x: 750, y: 380, w: 40, h: 60, type: 'teleport' },
      { x: 1350, y: 100, w: 40, h: 60, type: 'teleport' },
      { x: 1300, y: 160, w: 140, h: 30, type: 'wall' },
      { x: 1350, y: 100, w: 30, h: 60, type: 'goal' },
      { x: 200, y: 510, w: 1300, h: 30, type: 'hazard' },
      { x: 450, y: 0, w: 30, h: 540, type: 'wall' },
      { x: 1050, y: 0, w: 30, h: 540, type: 'wall' }
    ]
  },
  {
    id: 'build6',
    name: 'Build Battle 6: Die Gravitations-Kammer',
    width: 1500,
    height: 540,
    start: { x: 80, y: 350 },
    startP2: { x: 120, y: 350 },
    allowedAbility: 'double_jump',
    entities: [
      { x: 50, y: 400, w: 180, h: 30, type: 'wall' },
      { x: 350, y: 150, w: 100, h: 250, type: 'gravity_reverse' },
      { x: 600, y: 100, w: 200, h: 30, type: 'wall' },
      { x: 950, y: 200, w: 100, h: 250, type: 'gravity_reverse' },
      { x: 1300, y: 300, w: 150, h: 30, type: 'wall' },
      { x: 1360, y: 240, w: 30, h: 60, type: 'goal' },
      { x: 200, y: 510, w: 1100, h: 30, type: 'hazard' },
      { x: 300, y: 0, w: 800, h: 30, type: 'hazard' }
    ]
  },
  {
    id: 'build7',
    name: 'Build Battle 7: Der Windige Canyon',
    width: 1500,
    height: 540,
    start: { x: 80, y: 440 },
    startP2: { x: 120, y: 440 },
    allowedAbility: 'none',
    entities: [
      { x: 50, y: 470, w: 150, h: 30, type: 'wall' },
      { x: 400, y: 450, w: 120, h: 40, type: 'fan' as any },
      { x: 800, y: 450, w: 120, h: 40, type: 'fan' as any },
      { x: 1300, y: 300, w: 150, h: 30, type: 'wall' },
      { x: 1360, y: 240, w: 30, h: 60, type: 'goal' },
      { x: 200, y: 510, w: 1100, h: 30, type: 'hazard' }
    ]
  },
  {
    id: 'build8',
    name: 'Build Battle 8: Orbitale Rhythmen',
    width: 1500,
    height: 540,
    start: { x: 100, y: 250 },
    startP2: { x: 140, y: 250 },
    allowedAbility: 'hook',
    entities: [
      { x: 70, y: 280, w: 120, h: 30, type: 'wall' },
      { x: 400, y: 200, w: 60, h: 30, type: 'orbit' as any, baseX: 400, baseY: 200, moveSpeed: 0.003, moveRange: 100 } as any,
      { x: 800, y: 300, w: 60, h: 30, type: 'orbit' as any, baseX: 800, baseY: 300, moveSpeed: 0.002, moveRange: 120 } as any,
      { x: 1150, y: 150, w: 60, h: 30, type: 'orbit' as any, baseX: 1150, baseY: 150, moveSpeed: 0.004, moveRange: 80 } as any,
      { x: 1350, y: 250, w: 120, h: 30, type: 'wall' },
      { x: 1395, y: 190, w: 30, h: 60, type: 'goal' },
      { x: 0, y: 510, w: 1500, h: 30, type: 'hazard' }
    ]
  },
  {
    id: 'build9',
    name: 'Build Battle 9: Schleim & Trampolin Hüpfer',
    width: 1500,
    height: 540,
    start: { x: 80, y: 440 },
    startP2: { x: 120, y: 440 },
    allowedAbility: 'none',
    entities: [
      { x: 50, y: 470, w: 150, h: 30, type: 'wall' },
      { x: 300, y: 400, w: 100, h: 30, type: 'slime' },
      { x: 550, y: 300, w: 100, h: 30, type: 'trampoline' },
      { x: 800, y: 200, w: 100, h: 30, type: 'slime' },
      { x: 1050, y: 350, w: 100, h: 30, type: 'trampoline' },
      { x: 1300, y: 250, w: 150, h: 30, type: 'ice' },
      { x: 1360, y: 190, w: 30, h: 60, type: 'goal' },
      { x: 200, y: 510, w: 1100, h: 30, type: 'hazard' }
    ]
  },
  {
    id: 'build10',
    name: 'Build Battle 10: Die Abgrund-Herausforderung',
    width: 1500,
    height: 540,
    start: { x: 100, y: 350 },
    startP2: { x: 140, y: 350 },
    allowedAbility: 'hook',
    entities: [
      { x: 70, y: 380, w: 120, h: 30, type: 'wall' },
      { x: 350, y: 0, w: 40, h: 420, type: 'wall' },
      { x: 500, y: 250, w: 80, h: 30, type: 'fragile' },
      { x: 750, y: 150, w: 80, h: 30, type: 'fragile' },
      { x: 1000, y: 350, w: 80, h: 30, type: 'fragile' },
      { x: 1150, y: 0, w: 40, h: 420, type: 'wall' },
      { x: 1320, y: 380, w: 120, h: 30, type: 'wall' },
      { x: 1360, y: 320, w: 30, h: 60, type: 'goal' },
      { x: 0, y: 510, w: 1500, h: 30, type: 'hazard' }
    ]
  }
];

// --- BEGINNER (10 Levels) ---
export const INITIAL_LEVELS: LevelData[] = [
  {
    id: "custom_1773745185231",
    name: "Beginner Level 1",
    start: { x: 50, y: 450 },
    allowedAbility: "none",
    isCustom: true,
    isBrawler: false,
    isVerified: true,
    entities: [
      {"x":30,"y":480,"w":30,"h":30,"type":"wall"},{"x":60,"y":480,"w":30,"h":30,"type":"wall"},{"x":360,"y":300,"w":30,"h":30,"type":"wall"},{"x":390,"y":300,"w":30,"h":30,"type":"wall"},{"x":420,"y":300,"w":30,"h":30,"type":"wall"},{"x":540,"y":210,"w":30,"h":30,"type":"ice"},{"x":570,"y":210,"w":30,"h":30,"type":"ice"},{"x":600,"y":210,"w":30,"h":30,"type":"ice"},{"x":720,"y":120,"w":30,"h":30,"type":"slime"},{"x":750,"y":120,"w":30,"h":30,"type":"slime"},{"x":780,"y":120,"w":30,"h":30,"type":"slime"},{"x":900,"y":330,"w":30,"h":30,"type":"goal"},{"x":575,"y":185,"w":20,"h":20,"type":"coin","id":"e_1773745239332_iaenl41hl"},{"x":755,"y":95,"w":20,"h":20,"type":"coin","id":"e_1773745239835_ynqa6dfuy"},{"x":395,"y":275,"w":20,"h":20,"type":"coin","id":"e_1773745242656_uyaoazr8z"},{"x":180,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":210,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":240,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":930,"y":0,"w":30,"h":30,"type":"wall"},{"x":930,"y":30,"w":30,"h":30,"type":"wall"},{"x":930,"y":60,"w":30,"h":30,"type":"wall"},{"x":930,"y":90,"w":30,"h":30,"type":"wall"},{"x":930,"y":120,"w":30,"h":30,"type":"wall"},{"x":930,"y":150,"w":30,"h":30,"type":"wall"},{"x":930,"y":180,"w":30,"h":30,"type":"wall"},{"x":930,"y":210,"w":30,"h":30,"type":"wall"},{"x":930,"y":240,"w":30,"h":30,"type":"wall"},{"x":930,"y":270,"w":30,"h":30,"type":"wall"},{"x":930,"y":300,"w":30,"h":30,"type":"wall"},{"x":930,"y":330,"w":30,"h":30,"type":"wall"},{"x":930,"y":360,"w":30,"h":30,"type":"wall"},{"x":930,"y":390,"w":30,"h":30,"type":"wall"},{"x":930,"y":420,"w":30,"h":30,"type":"wall"},{"x":930,"y":450,"w":30,"h":30,"type":"wall"},{"x":930,"y":480,"w":30,"h":30,"type":"wall"},{"x":930,"y":510,"w":30,"h":30,"type":"wall"},{"x":900,"y":360,"w":30,"h":30,"type":"wall"}
    ]
  },
  {
    id: "custom_1773745397157",
    name: "Beginner Level 2",
    start: { x: 50, y: 450 },
    allowedAbility: "none",
    isCustom: true,
    isBrawler: false,
    isVerified: true,
    entities: [
      {"x":30,"y":480,"w":30,"h":30,"type":"wall"},{"x":60,"y":480,"w":30,"h":30,"type":"wall"},{"x":150,"y":360,"w":30,"h":30,"type":"wall"},{"x":180,"y":360,"w":30,"h":30,"type":"wall"},{"x":210,"y":360,"w":30,"h":30,"type":"wall"},{"x":240,"y":360,"w":30,"h":30,"type":"wall"},{"x":270,"y":360,"w":30,"h":30,"type":"wall"},{"x":300,"y":360,"w":30,"h":30,"type":"wall"},{"x":330,"y":360,"w":30,"h":30,"type":"wall"},{"x":360,"y":360,"w":30,"h":30,"type":"wall"},{"x":540,"y":360,"w":30,"h":30,"type":"wall"},{"x":570,"y":360,"w":30,"h":30,"type":"wall"},{"x":600,"y":360,"w":30,"h":30,"type":"wall"},{"x":630,"y":360,"w":30,"h":30,"type":"wall"},{"x":660,"y":360,"w":30,"h":30,"type":"wall"},{"x":690,"y":360,"w":30,"h":30,"type":"wall"},{"x":720,"y":360,"w":30,"h":30,"type":"wall"},{"x":750,"y":360,"w":30,"h":30,"type":"wall"},{"x":930,"y":240,"w":30,"h":30,"type":"wall"},{"x":930,"y":510,"w":30,"h":30,"type":"wall"},{"x":930,"y":480,"w":30,"h":30,"type":"wall"},{"x":930,"y":450,"w":30,"h":30,"type":"wall"},{"x":930,"y":390,"w":30,"h":30,"type":"wall"},{"x":930,"y":360,"w":30,"h":30,"type":"wall"},{"x":930,"y":330,"w":30,"h":30,"type":"wall"},{"x":930,"y":300,"w":30,"h":30,"type":"wall"},{"x":930,"y":270,"w":30,"h":30,"type":"wall"},{"x":930,"y":420,"w":30,"h":30,"type":"wall"},{"x":930,"y":210,"w":30,"h":30,"type":"wall"},{"x":930,"y":180,"w":30,"h":30,"type":"wall"},{"x":930,"y":150,"w":30,"h":30,"type":"wall"},{"x":930,"y":120,"w":30,"h":30,"type":"wall"},{"x":930,"y":90,"w":30,"h":30,"type":"wall"},{"x":930,"y":60,"w":30,"h":30,"type":"wall"},{"x":930,"y":30,"w":30,"h":30,"type":"wall"},{"x":930,"y":0,"w":30,"h":30,"type":"wall"},{"x":900,"y":30,"w":30,"h":30,"type":"goal"},{"x":900,"y":0,"w":30,"h":30,"type":"wall"},{"x":870,"y":0,"w":30,"h":30,"type":"wall"},{"x":840,"y":0,"w":30,"h":30,"type":"wall"},{"x":810,"y":0,"w":30,"h":30,"type":"wall"},{"x":780,"y":0,"w":30,"h":30,"type":"wall"},{"x":750,"y":0,"w":30,"h":30,"type":"wall"},{"x":720,"y":0,"w":30,"h":30,"type":"wall"},{"x":690,"y":0,"w":30,"h":30,"type":"wall"},{"x":660,"y":0,"w":30,"h":30,"type":"wall"},{"x":630,"y":0,"w":30,"h":30,"type":"wall"},{"x":600,"y":0,"w":30,"h":30,"type":"wall"},{"x":570,"y":0,"w":30,"h":30,"type":"wall"},{"x":540,"y":0,"w":30,"h":30,"type":"wall"},{"x":510,"y":0,"w":30,"h":30,"type":"wall"},{"x":480,"y":0,"w":30,"h":30,"type":"wall"},{"x":450,"y":0,"w":30,"h":30,"type":"wall"},{"x":420,"y":0,"w":30,"h":30,"type":"wall"},{"x":390,"y":0,"w":30,"h":30,"type":"wall"},{"x":360,"y":0,"w":30,"h":30,"type":"wall"},{"x":330,"y":0,"w":30,"h":30,"type":"wall"},{"x":300,"y":0,"w":30,"h":30,"type":"wall"},{"x":270,"y":0,"w":30,"h":30,"type":"wall"},{"x":240,"y":0,"w":30,"h":30,"type":"wall"},{"x":210,"y":0,"w":30,"h":30,"type":"wall"},{"x":180,"y":0,"w":30,"h":30,"type":"wall"},{"x":150,"y":0,"w":30,"h":30,"type":"wall"},{"x":120,"y":0,"w":30,"h":30,"type":"wall"},{"x":90,"y":0,"w":30,"h":30,"type":"wall"},{"x":60,"y":0,"w":30,"h":30,"type":"wall"},{"x":30,"y":0,"w":30,"h":30,"type":"wall"},{"x":0,"y":0,"w":30,"h":30,"type":"wall"},{"x":0,"y":30,"w":30,"h":30,"type":"wall"},{"x":0,"y":60,"w":30,"h":30,"type":"wall"},{"x":0,"y":90,"w":30,"h":30,"type":"wall"},{"x":0,"y":120,"w":30,"h":30,"type":"wall"},{"x":0,"y":150,"w":30,"h":30,"type":"wall"},{"x":0,"y":180,"w":30,"h":30,"type":"wall"},{"x":0,"y":210,"w":30,"h":30,"type":"wall"},{"x":0,"y":240,"w":30,"h":30,"type":"wall"},{"x":0,"y":270,"w":30,"h":30,"type":"wall"},{"x":0,"y":300,"w":30,"h":30,"type":"wall"},{"x":0,"y":330,"w":30,"h":30,"type":"wall"},{"x":0,"y":360,"w":30,"h":30,"type":"wall"},{"x":0,"y":390,"w":30,"h":30,"type":"wall"},{"x":0,"y":420,"w":30,"h":30,"type":"wall"},{"x":0,"y":450,"w":30,"h":30,"type":"wall"},{"x":0,"y":480,"w":30,"h":30,"type":"wall"},{"x":0,"y":510,"w":30,"h":30,"type":"wall"},{"x":30,"y":510,"w":30,"h":30,"type":"wall"},{"x":60,"y":510,"w":30,"h":30,"type":"wall"},{"x":360,"y":390,"w":30,"h":30,"type":"ice"},{"x":360,"y":420,"w":30,"h":30,"type":"ice"},{"x":360,"y":450,"w":30,"h":30,"type":"ice"},{"x":360,"y":480,"w":30,"h":30,"type":"ice"},{"x":360,"y":510,"w":30,"h":30,"type":"ice"},{"x":540,"y":390,"w":30,"h":30,"type":"ice"},{"x":540,"y":420,"w":30,"h":30,"type":"ice"},{"x":540,"y":450,"w":30,"h":30,"type":"ice"},{"x":540,"y":480,"w":30,"h":30,"type":"ice"},{"x":540,"y":510,"w":30,"h":30,"type":"ice"},{"x":150,"y":390,"w":30,"h":30,"type":"wall"},{"x":180,"y":420,"w":30,"h":30,"type":"wall"},{"x":210,"y":450,"w":30,"h":30,"type":"wall"},{"x":240,"y":480,"w":30,"h":30,"type":"wall"},{"x":270,"y":510,"w":30,"h":30,"type":"wall"},{"x":300,"y":510,"w":30,"h":30,"type":"wall"},{"x":330,"y":510,"w":30,"h":30,"type":"wall"},{"x":570,"y":510,"w":30,"h":30,"type":"wall"},{"x":600,"y":510,"w":30,"h":30,"type":"wall"},{"x":630,"y":510,"w":30,"h":30,"type":"wall"},{"x":660,"y":480,"w":30,"h":30,"type":"wall"},{"x":690,"y":450,"w":30,"h":30,"type":"wall"},{"x":720,"y":420,"w":30,"h":30,"type":"wall"},{"x":750,"y":390,"w":30,"h":30,"type":"wall"},{"x":485,"y":275,"w":20,"h":20,"type":"coin","id":"e_1773745394757_azooyjpvl"},{"x":390,"y":510,"w":30,"h":30,"type":"hazard"},{"x":420,"y":510,"w":30,"h":30,"type":"hazard"},{"x":450,"y":510,"w":30,"h":30,"type":"hazard"},{"x":480,"y":510,"w":30,"h":30,"type":"hazard"},{"x":510,"y":510,"w":30,"h":30,"type":"hazard"},{"x":90,"y":510,"w":30,"h":30,"type":"hazard"},{"x":120,"y":510,"w":30,"h":30,"type":"hazard"},{"x":150,"y":510,"w":30,"h":30,"type":"hazard"},{"x":180,"y":510,"w":30,"h":30,"type":"hazard"},{"x":210,"y":510,"w":30,"h":30,"type":"hazard"},{"x":240,"y":510,"w":30,"h":30,"type":"hazard"},{"x":660,"y":510,"w":30,"h":30,"type":"hazard"},{"x":690,"y":510,"w":30,"h":30,"type":"hazard"},{"x":720,"y":510,"w":30,"h":30,"type":"hazard"},{"x":750,"y":510,"w":30,"h":30,"type":"hazard"},{"x":780,"y":510,"w":30,"h":30,"type":"hazard"},{"x":810,"y":510,"w":30,"h":30,"type":"hazard"},{"x":840,"y":510,"w":30,"h":30,"type":"hazard"},{"x":870,"y":510,"w":30,"h":30,"type":"hazard"},{"x":900,"y":510,"w":30,"h":30,"type":"hazard"}
    ]
  },
  {
    id: "custom_1773745573075",
    name: "Beginner Level 3",
    start: { x: 35, y: 65 },
    allowedAbility: "none",
    isCustom: true,
    isBrawler: false,
    isVerified: true,
    entities: [
      {"x":0,"y":0,"w":30,"h":540,"type":"wall"},{"x":930,"y":0,"w":30,"h":30,"type":"hazard"},{"x":30,"y":90,"w":30,"h":30,"type":"wall"},{"x":60,"y":90,"w":30,"h":30,"type":"ice"},{"x":90,"y":90,"w":30,"h":30,"type":"ice"},{"x":150,"y":150,"w":30,"h":30,"type":"ice"},{"x":180,"y":150,"w":30,"h":30,"type":"ice"},{"x":210,"y":150,"w":30,"h":30,"type":"ice"},{"x":270,"y":210,"w":30,"h":30,"type":"ice"},{"x":300,"y":210,"w":30,"h":30,"type":"ice"},{"x":330,"y":210,"w":30,"h":30,"type":"ice"},{"x":360,"y":210,"w":30,"h":30,"type":"ice"},{"x":390,"y":210,"w":30,"h":30,"type":"ice"},{"x":420,"y":210,"w":30,"h":30,"type":"ice"},{"x":365,"y":125,"w":20,"h":20,"type":"coin","id":"e_1773745514770_04coz1p0n"},{"x":480,"y":150,"w":30,"h":30,"type":"ice"},{"x":510,"y":150,"w":30,"h":30,"type":"ice"},{"x":540,"y":150,"w":30,"h":30,"type":"ice"},{"x":720,"y":120,"w":30,"h":30,"type":"ice"},{"x":750,"y":120,"w":30,"h":30,"type":"ice"},{"x":780,"y":120,"w":30,"h":30,"type":"ice"},{"x":900,"y":240,"w":30,"h":30,"type":"ice"},{"x":870,"y":240,"w":30,"h":30,"type":"ice"},{"x":840,"y":240,"w":30,"h":30,"type":"ice"},{"x":810,"y":270,"w":30,"h":30,"type":"ice"},{"x":780,"y":300,"w":30,"h":30,"type":"ice"},{"x":780,"y":330,"w":30,"h":30,"type":"ice"},{"x":750,"y":330,"w":30,"h":30,"type":"ice"},{"x":750,"y":360,"w":30,"h":30,"type":"ice"},{"x":720,"y":360,"w":30,"h":30,"type":"ice"},{"x":720,"y":390,"w":30,"h":30,"type":"ice"},{"x":690,"y":390,"w":30,"h":30,"type":"ice"},{"x":690,"y":420,"w":30,"h":30,"type":"ice"},{"x":660,"y":420,"w":30,"h":30,"type":"ice"},{"x":660,"y":450,"w":30,"h":30,"type":"ice"},{"x":630,"y":450,"w":30,"h":30,"type":"ice"},{"x":810,"y":300,"w":30,"h":30,"type":"ice"},{"x":840,"y":270,"w":30,"h":30,"type":"ice"},{"x":875,"y":185,"w":20,"h":20,"type":"coin","id":"e_1773745558623_h9zod692y"},{"x":240,"y":180,"w":30,"h":30,"type":"hazard"},{"x":120,"y":120,"w":30,"h":30,"type":"hazard"},{"x":450,"y":180,"w":30,"h":30,"type":"hazard"},{"x":630,"y":480,"w":30,"h":30,"type":"ice"},{"x":600,"y":480,"w":30,"h":30,"type":"ice"},{"x":600,"y":510,"w":30,"h":30,"type":"ice"},{"x":570,"y":510,"w":30,"h":30,"type":"ice"},{"x":540,"y":510,"w":30,"h":30,"type":"ice"},{"x":510,"y":510,"w":30,"h":30,"type":"ice"},{"x":480,"y":510,"w":30,"h":30,"type":"ice"},{"x":240,"y":510,"w":30,"h":30,"type":"ice"},{"x":210,"y":510,"w":30,"h":30,"type":"ice"},{"x":180,"y":510,"w":30,"h":30,"type":"ice"},{"x":150,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":120,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":90,"y":510,"w":30,"h":30,"type":"ice"},{"x":60,"y":510,"w":30,"h":30,"type":"ice"},{"x":30,"y":510,"w":30,"h":30,"type":"ice"},{"x":570,"y":150,"w":30,"h":30,"type":"ice"},{"x":600,"y":150,"w":30,"h":30,"type":"hazard"},{"x":630,"y":150,"w":30,"h":30,"type":"hazard"},{"x":660,"y":150,"w":30,"h":30,"type":"hazard"},{"x":690,"y":150,"w":30,"h":30,"type":"hazard"},{"x":30,"y":0,"w":30,"h":30,"type":"wall"},{"x":60,"y":0,"w":30,"h":30,"type":"wall"},{"x":90,"y":0,"w":30,"h":30,"type":"wall"},{"x":120,"y":0,"w":30,"h":30,"type":"wall"},{"x":150,"y":0,"w":30,"h":30,"type":"wall"},{"x":180,"y":0,"w":30,"h":30,"type":"wall"},{"x":210,"y":0,"w":30,"h":30,"type":"wall"},{"x":240,"y":0,"w":30,"h":30,"type":"wall"},{"x":270,"y":0,"w":30,"h":30,"type":"wall"},{"x":300,"y":0,"w":30,"h":30,"type":"wall"},{"x":330,"y":0,"w":30,"h":30,"type":"wall"},{"x":360,"y":0,"w":30,"h":30,"type":"wall"},{"x":390,"y":0,"w":30,"h":30,"type":"wall"},{"x":420,"y":0,"w":30,"h":30,"type":"wall"},{"x":450,"y":0,"w":30,"h":30,"type":"hazard"},{"x":480,"y":0,"w":30,"h":30,"type":"hazard"},{"x":510,"y":0,"w":30,"h":30,"type":"hazard"},{"x":810,"y":0,"w":30,"h":30,"type":"hazard"},{"x":840,"y":0,"w":30,"h":30,"type":"hazard"},{"x":870,"y":0,"w":30,"h":30,"type":"hazard"},{"x":900,"y":0,"w":30,"h":30,"type":"hazard"},{"x":930,"y":30,"w":30,"h":30,"type":"ice"},{"x":930,"y":60,"w":30,"h":30,"type":"ice"},{"x":930,"y":90,"w":30,"h":30,"type":"ice"},{"x":930,"y":120,"w":30,"h":30,"type":"ice"},{"x":930,"y":150,"w":30,"h":30,"type":"ice"},{"x":930,"y":180,"w":30,"h":30,"type":"ice"},{"x":930,"y":210,"w":30,"h":30,"type":"ice"},{"x":930,"y":240,"w":30,"h":30,"type":"ice"},{"x":450,"y":510,"w":30,"h":30,"type":"ice"},{"x":60,"y":240,"w":30,"h":30,"type":"goal"},{"x":155,"y":485,"w":20,"h":20,"type":"coin","id":"e_1773745750751_bljz1l1av"}
    ]
  },
  {
    id: "custom_1773745876611",
    name: "Beginner Level 4",
    start: { x: 50, y: 450 },
    allowedAbility: "none",
    isCustom: true,
    isBrawler: false,
    isVerified: true,
    entities: [
      {"x":0,"y":0,"w":960,"h":30,"type":"wall"},{"x":0,"y":0,"w":30,"h":540,"type":"wall"},{"x":930,"y":0,"w":30,"h":540,"type":"wall"},{"x":30,"y":510,"w":30,"h":30,"type":"wall"},{"x":60,"y":510,"w":30,"h":30,"type":"wall"},{"x":360,"y":510,"w":30,"h":30,"type":"wall"},{"x":330,"y":510,"w":30,"h":30,"type":"wall"},{"x":540,"y":510,"w":30,"h":30,"type":"wall"},{"x":570,"y":510,"w":30,"h":30,"type":"wall"},{"x":360,"y":480,"w":30,"h":30,"type":"wall"},{"x":360,"y":450,"w":30,"h":30,"type":"wall"},{"x":360,"y":420,"w":30,"h":30,"type":"wall"},{"x":360,"y":390,"w":30,"h":30,"type":"wall"},{"x":360,"y":360,"w":30,"h":30,"type":"wall"},{"x":360,"y":330,"w":30,"h":30,"type":"wall"},{"x":360,"y":300,"w":30,"h":30,"type":"wall"},{"x":360,"y":270,"w":30,"h":30,"type":"wall"},{"x":360,"y":240,"w":30,"h":30,"type":"wall"},{"x":360,"y":210,"w":30,"h":30,"type":"wall"},{"x":330,"y":210,"w":30,"h":30,"type":"wall"},{"x":330,"y":240,"w":30,"h":30,"type":"wall"},{"x":330,"y":270,"w":30,"h":30,"type":"wall"},{"x":330,"y":300,"w":30,"h":30,"type":"wall"},{"x":330,"y":330,"w":30,"h":30,"type":"wall"},{"x":330,"y":360,"w":30,"h":30,"type":"wall"},{"x":330,"y":390,"w":30,"h":30,"type":"wall"},{"x":330,"y":420,"w":30,"h":30,"type":"wall"},{"x":330,"y":450,"w":30,"h":30,"type":"wall"},{"x":330,"y":480,"w":30,"h":30,"type":"wall"},{"x":540,"y":480,"w":30,"h":30,"type":"wall"},{"x":540,"y":450,"w":30,"h":30,"type":"wall"},{"x":540,"y":420,"w":30,"h":30,"type":"wall"},{"x":540,"y":390,"w":30,"h":30,"type":"wall"},{"x":540,"y":360,"w":30,"h":30,"type":"wall"},{"x":540,"y":330,"w":30,"h":30,"type":"wall"},{"x":540,"y":300,"w":30,"h":30,"type":"wall"},{"x":540,"y":270,"w":30,"h":30,"type":"wall"},{"x":540,"y":240,"w":30,"h":30,"type":"wall"},{"x":540,"y":210,"w":30,"h":30,"type":"wall"},{"x":570,"y":210,"w":30,"h":30,"type":"wall"},{"x":570,"y":240,"w":30,"h":30,"type":"wall"},{"x":570,"y":270,"w":30,"h":30,"type":"wall"},{"x":570,"y":300,"w":30,"h":30,"type":"wall"},{"x":570,"y":330,"w":30,"h":30,"type":"wall"},{"x":570,"y":360,"w":30,"h":30,"type":"wall"},{"x":570,"y":390,"w":30,"h":30,"type":"wall"},{"x":570,"y":420,"w":30,"h":30,"type":"wall"},{"x":570,"y":450,"w":30,"h":30,"type":"wall"},{"x":570,"y":480,"w":30,"h":30,"type":"wall"},{"x":425,"y":275,"w":20,"h":20,"type":"coin","id":"e_1773745860283_lvszbpv3b"},{"x":485,"y":275,"w":20,"h":20,"type":"coin","id":"e_1773745860943_jlog2a7xu"},{"x":870,"y":510,"w":30,"h":30,"type":"wall"},{"x":900,"y":510,"w":30,"h":30,"type":"wall"},{"x":900,"y":480,"w":30,"h":30,"type":"goal"},{"x":240,"y":210,"w":30,"h":30,"type":"wall"},{"x":270,"y":210,"w":30,"h":30,"type":"wall"},{"x":300,"y":210,"w":30,"h":30,"type":"wall"},{"x":630,"y":210,"w":30,"h":30,"type":"wall"},{"x":660,"y":210,"w":30,"h":30,"type":"wall"},{"x":600,"y":210,"w":30,"h":30,"type":"wall"},{"x":450,"y":510,"w":30,"h":30,"type":"hazard"},{"x":450,"y":450,"w":30,"h":30,"type":"hazard"},{"x":450,"y":480,"w":30,"h":30,"type":"hazard"}
    ]
  },
  {
    id: 'beg5', name: 'Beginner Level 5', start: { x: 50, y: 450 }, allowedAbility: 'none',
    entities: [
      { x: 50, y: 470, w: 40, h: 30, type: 'wall' }, { x: 0, y: 0, w: 960, h: 30, type: 'wall' }, { x: 0, y: 0, w: 30, h: 540, type: 'wall' }, { x: 930, y: 0, w: 30, h: 540, type: 'wall' },
      { x: 0, y: 510, w: 960, h: 30, type: 'hazard' },
      { x: 300, y: 480, w: 60, h: 30, type: 'trampoline' }, { x: 300, y: 510, w: 60, h: 30, type: 'wall' },
      { x: 500, y: 300, w: 60, h: 30, type: 'wall' },
      { x: 700, y: 200, w: 60, h: 30, type: 'wall' },
      { x: 880, y: 250, w: 40, h: 40, type: 'goal' },
      { x: 320, y: 300, w: 20, h: 20, type: 'coin', id: 'b5' }
    ]
  },
  {
    id: 'beg6', name: 'Beginner Level 6', start: { x: 50, y: 450 }, allowedAbility: 'double_jump',
    entities: [
      { x: 50, y: 470, w: 40, h: 30, type: 'wall' }, { x: 0, y: 510, w: 960, h: 30, type: 'hazard' },
      { x: 0, y: 0, w: 960, h: 30, type: 'wall' }, { x: 0, y: 0, w: 30, h: 540, type: 'wall' }, { x: 930, y: 0, w: 30, h: 540, type: 'wall' },
      { x: 400, y: 150, w: 30, h: 400, type: 'slime' },
      { x: 880, y: 150, w: 40, h: 40, type: 'goal' },
      { x: 800, y: 350, w: 100, h: 30, type: 'wall' },
      { x: 450, y: 250, w: 20, h: 20, type: 'coin', id: 'b6' }
    ]
  },
  {
    id: 'beg7', name: 'Beginner Level 7', start: { x: 50, y: 450 }, allowedAbility: 'double_jump',
    entities: [
      { x: 50, y: 470, w: 40, h: 30, type: 'wall' }, { x: 0, y: 510, w: 960, h: 30, type: 'hazard' },
      { x: 0, y: 0, w: 960, h: 30, type: 'wall' }, { x: 0, y: 0, w: 30, h: 540, type: 'wall' }, { x: 930, y: 0, w: 30, h: 540, type: 'wall' },
      { x: 465, y: 0, w: 30, h: 540, type: 'wall' },
      { x: 300.5, y: 400.5, w: 29, h: 29, type: 'teleport' },
      { x: 600.5, y: 100.5, w: 29, h: 29, type: 'teleport' },
      { x: 880, y: 150, w: 40, h: 40, type: 'goal' },
      { x: 800, y: 200, w: 100, h: 30, type: 'wall' },
      { x: 500, y: 300, w: 20, h: 20, type: 'coin', id: 'b7' }
    ]
  },
  {
    id: "custom_1773743511761",
    name: "Beginner Level 8",
    start: { x: 35, y: 485 },
    allowedAbility: "none",
    isCustom: true,
    isBrawler: false,
    isVerified: true,
    entities: [
      {"x":0,"y":510,"w":30,"h":30,"type":"wall"},{"x":30,"y":510,"w":30,"h":30,"type":"wall"},{"x":60,"y":510,"w":30,"h":30,"type":"wall"},{"x":150,"y":390,"w":30,"h":30,"type":"ice"},{"x":150,"y":420,"w":30,"h":30,"type":"ice"},{"x":60,"y":240,"w":30,"h":30,"type":"slime"},{"x":150,"y":180,"w":30,"h":30,"type":"ice"},{"x":180,"y":180,"w":30,"h":30,"type":"ice"},{"x":185,"y":155,"w":20,"h":20,"type":"coin","id":"e_1773743528107_m44k0ag21"},{"x":210,"y":210,"w":30,"h":30,"type":"hazard"},{"x":210,"y":240,"w":30,"h":30,"type":"hazard"},{"x":210,"y":270,"w":30,"h":30,"type":"hazard"},{"x":270,"y":270,"w":30,"h":30,"type":"ice"},{"x":300,"y":270,"w":30,"h":30,"type":"ice"},{"x":330,"y":270,"w":30,"h":30,"type":"ice"},{"x":420,"y":360,"w":30,"h":30,"type":"ice"},{"x":450,"y":360,"w":30,"h":30,"type":"ice"},{"x":480,"y":360,"w":30,"h":30,"type":"ice"},{"x":690,"y":480,"w":30,"h":30,"type":"trampoline"},{"x":750,"y":210,"w":30,"h":30,"type":"goal"},{"x":695,"y":455,"w":20,"h":20,"type":"coin","id":"e_1773743666522_4ehbkzfcn"},{"x":60,"y":180,"w":30,"h":30,"type":"hazard"},{"x":60,"y":210,"w":30,"h":30,"type":"hazard"}
    ]
  },
  {
    id: "custom_1773743112570",
    name: "Beginner Level 9",
    start: { x: 65, y: 485 },
    allowedAbility: "hook",
    isCustom: true,
    isBrawler: false,
    isVerified: true,
    entities: [
      {"x":30,"y":510,"w":30,"h":30,"type":"wall"},{"x":60,"y":510,"w":30,"h":30,"type":"wall"},{"x":90,"y":510,"w":30,"h":30,"type":"wall"},{"x":0,"y":450,"w":30,"h":30,"type":"wall"},{"x":0,"y":420,"w":30,"h":30,"type":"wall"},{"x":0,"y":390,"w":30,"h":30,"type":"wall"},{"x":0,"y":360,"w":30,"h":30,"type":"wall"},{"x":0,"y":330,"w":30,"h":30,"type":"wall"},{"x":0,"y":300,"w":30,"h":30,"type":"wall"},{"x":0,"y":270,"w":30,"h":30,"type":"wall"},{"x":0,"y":240,"w":30,"h":30,"type":"wall"},{"x":0,"y":210,"w":30,"h":30,"type":"wall"},{"x":0,"y":180,"w":30,"h":30,"type":"wall"},{"x":0,"y":150,"w":30,"h":30,"type":"wall"},{"x":0,"y":120,"w":30,"h":30,"type":"wall"},{"x":0,"y":90,"w":30,"h":30,"type":"wall"},{"x":0,"y":60,"w":30,"h":30,"type":"wall"},{"x":0,"y":30,"w":30,"h":30,"type":"wall"},{"x":0,"y":0,"w":30,"h":30,"type":"wall"},{"x":0,"y":480,"w":30,"h":30,"type":"wall"},{"x":0,"y":510,"w":30,"h":30,"type":"wall"},{"x":840,"y":60,"w":30,"h":30,"type":"goal"},{"x":810,"y":0,"w":30,"h":30,"type":"wall"},{"x":840,"y":0,"w":30,"h":30,"type":"wall"},{"x":870,"y":0,"w":30,"h":30,"type":"wall"},{"x":900,"y":0,"w":30,"h":30,"type":"wall"},{"x":900,"y":30,"w":30,"h":30,"type":"wall"},{"x":900,"y":60,"w":30,"h":30,"type":"wall"},{"x":900,"y":90,"w":30,"h":30,"type":"wall"},{"x":270,"y":510,"w":30,"h":30,"type":"ice"},{"x":270,"y":480,"w":30,"h":30,"type":"ice"},{"x":270,"y":450,"w":30,"h":30,"type":"ice"},{"x":270,"y":420,"w":30,"h":30,"type":"ice"},{"x":270,"y":390,"w":30,"h":30,"type":"ice"},{"x":270,"y":360,"w":30,"h":30,"type":"ice"},{"x":270,"y":330,"w":30,"h":30,"type":"ice"},{"x":270,"y":300,"w":30,"h":30,"type":"hazard"},{"x":270,"y":270,"w":30,"h":30,"type":"hazard"},{"x":210,"y":0,"w":30,"h":30,"type":"wall"},{"x":210,"y":30,"w":30,"h":30,"type":"wall"},{"x":210,"y":60,"w":30,"h":30,"type":"wall"},{"x":240,"y":60,"w":30,"h":30,"type":"wall"},{"x":270,"y":60,"w":30,"h":30,"type":"wall"},{"x":300,"y":60,"w":30,"h":30,"type":"wall"},{"x":330,"y":60,"w":30,"h":30,"type":"wall"},{"x":330,"y":30,"w":30,"h":30,"type":"wall"},{"x":330,"y":0,"w":30,"h":30,"type":"wall"},{"x":360,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":390,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":540,"y":510,"w":30,"h":30,"type":"ice"},{"x":540,"y":480,"w":30,"h":30,"type":"ice"},{"x":540,"y":450,"w":30,"h":30,"type":"ice"},{"x":540,"y":420,"w":30,"h":30,"type":"ice"},{"x":540,"y":390,"w":30,"h":30,"type":"ice"},{"x":540,"y":360,"w":30,"h":30,"type":"ice"},{"x":540,"y":330,"w":30,"h":30,"type":"ice"},{"x":540,"y":300,"w":30,"h":30,"type":"ice"},{"x":540,"y":270,"w":30,"h":30,"type":"ice"},{"x":540,"y":240,"w":30,"h":30,"type":"hazard"},{"x":540,"y":210,"w":30,"h":30,"type":"hazard"},{"x":480,"y":0,"w":30,"h":30,"type":"wall"},{"x":480,"y":30,"w":30,"h":30,"type":"wall"},{"x":510,"y":30,"w":30,"h":30,"type":"wall"},{"x":540,"y":30,"w":30,"h":30,"type":"wall"},{"x":570,"y":30,"w":30,"h":30,"type":"wall"},{"x":600,"y":30,"w":30,"h":30,"type":"wall"},{"x":600,"y":0,"w":30,"h":30,"type":"wall"},{"x":630,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":660,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":665,"y":425,"w":20,"h":20,"type":"coin","id":"e_1773746752680_a627beod0"},{"x":395,"y":425,"w":20,"h":20,"type":"coin","id":"e_1773746762918_1vcbm15jl"},{"x":780,"y":0,"w":30,"h":30,"type":"hazard"},{"x":750,"y":0,"w":30,"h":30,"type":"hazard"},{"x":750,"y":30,"w":30,"h":30,"type":"hazard"},{"x":750,"y":60,"w":30,"h":30,"type":"hazard"},{"x":750,"y":90,"w":30,"h":30,"type":"hazard"},{"x":930,"y":0,"w":30,"h":30,"type":"wall"},{"x":930,"y":30,"w":30,"h":30,"type":"wall"},{"x":930,"y":60,"w":30,"h":30,"type":"wall"},{"x":930,"y":90,"w":30,"h":30,"type":"wall"}
    ]
  },
  {
    id: "custom_1773743977459",
    name: "Beginner Level 10",
    start: { x: 65, y: 35 },
    allowedAbility: "double_jump",
    isCustom: true,
    isBrawler: false,
    isVerified: true,
    entities: [
      {"x":0,"y":0,"w":960,"h":30,"type":"wall"},{"x":90,"y":30,"w":30,"h":30,"type":"ice"},{"x":90,"y":60,"w":30,"h":30,"type":"ice"},{"x":90,"y":90,"w":30,"h":30,"type":"ice"},{"x":90,"y":120,"w":30,"h":30,"type":"ice"},{"x":90,"y":150,"w":30,"h":30,"type":"ice"},{"x":90,"y":180,"w":30,"h":30,"type":"ice"},{"x":90,"y":210,"w":30,"h":30,"type":"ice"},{"x":60,"y":120,"w":30,"h":30,"type":"ice"},{"x":0,"y":210,"w":30,"h":30,"type":"ice"},{"x":0,"y":240,"w":30,"h":30,"type":"ice"},{"x":0,"y":270,"w":30,"h":30,"type":"ice"},{"x":0,"y":300,"w":30,"h":30,"type":"ice"},{"x":0,"y":330,"w":30,"h":30,"type":"ice"},{"x":0,"y":360,"w":30,"h":30,"type":"ice"},{"x":0,"y":390,"w":30,"h":30,"type":"ice"},{"x":0,"y":420,"w":30,"h":30,"type":"ice"},{"x":0,"y":450,"w":30,"h":30,"type":"ice"},{"x":0,"y":480,"w":30,"h":30,"type":"ice"},{"x":0,"y":510,"w":30,"h":30,"type":"ice"},{"x":150,"y":390,"w":30,"h":30,"type":"wall"},{"x":180,"y":390,"w":30,"h":30,"type":"wall"},{"x":210,"y":390,"w":30,"h":30,"type":"wall"},{"x":240,"y":390,"w":30,"h":30,"type":"wall"},{"x":0,"y":30,"w":30,"h":30,"type":"ice"},{"x":0,"y":60,"w":30,"h":30,"type":"ice"},{"x":0,"y":90,"w":30,"h":30,"type":"ice"},{"x":0,"y":120,"w":30,"h":30,"type":"ice"},{"x":0,"y":150,"w":30,"h":30,"type":"ice"},{"x":0,"y":180,"w":30,"h":30,"type":"ice"},{"x":270,"y":390,"w":30,"h":30,"type":"ice"},{"x":270,"y":360,"w":30,"h":30,"type":"ice"},{"x":270,"y":330,"w":30,"h":30,"type":"ice"},{"x":270,"y":300,"w":30,"h":30,"type":"ice"},{"x":270,"y":270,"w":30,"h":30,"type":"ice"},{"x":270,"y":240,"w":30,"h":30,"type":"ice"},{"x":270,"y":210,"w":30,"h":30,"type":"ice"},{"x":270,"y":180,"w":30,"h":30,"type":"ice"},{"x":270,"y":150,"w":30,"h":30,"type":"ice"},{"x":330.5,"y":120.5,"w":29,"h":29,"type":"teleport"},{"x":300,"y":150,"w":30,"h":30,"type":"ice"},{"x":330,"y":150,"w":30,"h":30,"type":"ice"},{"x":360,"y":150,"w":30,"h":30,"type":"ice"},{"x":360,"y":120,"w":30,"h":30,"type":"wall"},{"x":360,"y":90,"w":30,"h":30,"type":"wall"},{"x":360,"y":60,"w":30,"h":30,"type":"wall"},{"x":360,"y":30,"w":30,"h":30,"type":"wall"},{"x":150,"y":420,"w":30,"h":30,"type":"ice"},{"x":150,"y":450,"w":30,"h":30,"type":"ice"},{"x":150,"y":480,"w":30,"h":30,"type":"ice"},{"x":150,"y":510,"w":30,"h":30,"type":"ice"},{"x":930,"y":30,"w":30,"h":30,"type":"ice"},{"x":930,"y":60,"w":30,"h":30,"type":"ice"},{"x":930,"y":90,"w":30,"h":30,"type":"ice"},{"x":930,"y":120,"w":30,"h":30,"type":"ice"},{"x":930,"y":150,"w":30,"h":30,"type":"ice"},{"x":930,"y":180,"w":30,"h":30,"type":"ice"},{"x":930,"y":210,"w":30,"h":30,"type":"ice"},{"x":930,"y":240,"w":30,"h":30,"type":"ice"},{"x":930,"y":270,"w":30,"h":30,"type":"ice"},{"x":930,"y":300,"w":30,"h":30,"type":"ice"},{"x":930,"y":330,"w":30,"h":30,"type":"ice"},{"x":930,"y":360,"w":30,"h":30,"type":"ice"},{"x":930,"y":390,"w":30,"h":30,"type":"ice"},{"x":930,"y":420,"w":30,"h":30,"type":"ice"},{"x":930,"y":450,"w":30,"h":30,"type":"ice"},{"x":930,"y":480,"w":30,"h":30,"type":"ice"},{"x":930,"y":510,"w":30,"h":30,"type":"ice"},{"x":780,"y":510,"w":30,"h":30,"type":"ice"},{"x":780,"y":480,"w":30,"h":30,"type":"ice"},{"x":780,"y":450,"w":30,"h":30,"type":"ice"},{"x":780,"y":420,"w":30,"h":30,"type":"ice"},{"x":780,"y":390,"w":30,"h":30,"type":"wall"},{"x":750,"y":390,"w":30,"h":30,"type":"wall"},{"x":720,"y":390,"w":30,"h":30,"type":"wall"},{"x":690,"y":390,"w":30,"h":30,"type":"wall"},{"x":660,"y":390,"w":30,"h":30,"type":"ice"},{"x":660,"y":360,"w":30,"h":30,"type":"ice"},{"x":660,"y":330,"w":30,"h":30,"type":"ice"},{"x":660,"y":300,"w":30,"h":30,"type":"ice"},{"x":660,"y":270,"w":30,"h":30,"type":"ice"},{"x":660,"y":240,"w":30,"h":30,"type":"ice"},{"x":660,"y":210,"w":30,"h":30,"type":"ice"},{"x":660,"y":180,"w":30,"h":30,"type":"ice"},{"x":660,"y":150,"w":30,"h":30,"type":"ice"},{"x":630,"y":150,"w":30,"h":30,"type":"ice"},{"x":600,"y":150,"w":30,"h":30,"type":"ice"},{"x":570,"y":150,"w":30,"h":30,"type":"ice"},{"x":570,"y":120,"w":30,"h":30,"type":"wall"},{"x":570,"y":90,"w":30,"h":30,"type":"wall"},{"x":570,"y":60,"w":30,"h":30,"type":"wall"},{"x":570,"y":30,"w":30,"h":30,"type":"wall"},{"x":840,"y":30,"w":30,"h":30,"type":"ice"},{"x":840,"y":60,"w":30,"h":30,"type":"ice"},{"x":840,"y":90,"w":30,"h":30,"type":"ice"},{"x":840,"y":120,"w":30,"h":30,"type":"ice"},{"x":840,"y":150,"w":30,"h":30,"type":"ice"},{"x":840,"y":180,"w":30,"h":30,"type":"ice"},{"x":840,"y":210,"w":30,"h":30,"type":"ice"},{"x":870,"y":120,"w":30,"h":30,"type":"ice"},{"x":870.5,"y":30.5,"w":29,"h":29,"type":"teleport"},{"x":900,"y":30,"w":30,"h":30,"type":"ice"},{"x":900,"y":60,"w":30,"h":30,"type":"ice"},{"x":30,"y":30,"w":30,"h":30,"type":"ice"},{"x":30,"y":60,"w":30,"h":30,"type":"ice"},{"x":755,"y":335,"w":20,"h":20,"type":"coin","id":"e_1773744682845_tz416mspc"},{"x":185,"y":335,"w":20,"h":20,"type":"coin","id":"e_1773744684818_y7robh45n"},{"x":275,"y":125,"w":20,"h":20,"type":"coin","id":"e_1773744688626_cokmx4zn1"},{"x":665,"y":125,"w":20,"h":20,"type":"coin","id":"e_1773744689428_ckralj0u6"},{"x":600,"y":120,"w":30,"h":30,"type":"goal"},{"x":390,"y":30,"w":30,"h":30,"type":"ice"},{"x":420,"y":30,"w":30,"h":30,"type":"ice"},{"x":450,"y":30,"w":30,"h":30,"type":"ice"},{"x":480,"y":30,"w":30,"h":30,"type":"ice"},{"x":510,"y":30,"w":30,"h":30,"type":"ice"},{"x":540,"y":30,"w":30,"h":30,"type":"ice"},{"x":540,"y":60,"w":30,"h":30,"type":"ice"},{"x":540,"y":90,"w":30,"h":30,"type":"ice"},{"x":540,"y":120,"w":30,"h":30,"type":"wall"},{"x":510,"y":120,"w":30,"h":30,"type":"ice"},{"x":510,"y":150,"w":30,"h":30,"type":"wall"},{"x":510,"y":180,"w":30,"h":30,"type":"ice"},{"x":540,"y":180,"w":30,"h":30,"type":"ice"},{"x":540,"y":150,"w":30,"h":30,"type":"ice"},{"x":510,"y":60,"w":30,"h":30,"type":"ice"},{"x":510,"y":90,"w":30,"h":30,"type":"ice"},{"x":480,"y":60,"w":30,"h":30,"type":"ice"},{"x":450,"y":60,"w":30,"h":30,"type":"ice"},{"x":420,"y":60,"w":30,"h":30,"type":"ice"},{"x":390,"y":90,"w":30,"h":30,"type":"ice"},{"x":390,"y":120,"w":30,"h":30,"type":"wall"},{"x":390,"y":60,"w":30,"h":30,"type":"ice"},{"x":420,"y":120,"w":30,"h":30,"type":"ice"},{"x":420,"y":150,"w":30,"h":30,"type":"wall"},{"x":420,"y":180,"w":30,"h":30,"type":"ice"},{"x":390,"y":180,"w":30,"h":30,"type":"ice"},{"x":390,"y":150,"w":30,"h":30,"type":"ice"},{"x":420,"y":90,"w":30,"h":30,"type":"ice"},{"x":450,"y":90,"w":30,"h":30,"type":"ice"},{"x":480,"y":90,"w":30,"h":30,"type":"ice"},{"x":480,"y":120,"w":30,"h":30,"type":"ice"},{"x":480,"y":150,"w":30,"h":30,"type":"ice"},{"x":480,"y":180,"w":30,"h":30,"type":"ice"},{"x":450,"y":180,"w":30,"h":30,"type":"ice"},{"x":450,"y":150,"w":30,"h":30,"type":"ice"},{"x":450,"y":120,"w":30,"h":30,"type":"ice"},{"x":360,"y":180,"w":30,"h":30,"type":"ice"},{"x":330,"y":180,"w":30,"h":30,"type":"ice"},{"x":330,"y":210,"w":30,"h":30,"type":"ice"},{"x":300,"y":180,"w":30,"h":30,"type":"ice"},{"x":300,"y":210,"w":30,"h":30,"type":"ice"},{"x":300,"y":240,"w":30,"h":30,"type":"ice"},{"x":300,"y":270,"w":30,"h":30,"type":"ice"},{"x":300,"y":300,"w":30,"h":30,"type":"ice"},{"x":300,"y":330,"w":30,"h":30,"type":"ice"},{"x":330,"y":360,"w":30,"h":30,"type":"ice"},{"x":330,"y":390,"w":30,"h":30,"type":"ice"},{"x":330,"y":420,"w":30,"h":30,"type":"ice"},{"x":300,"y":420,"w":30,"h":30,"type":"ice"},{"x":300,"y":390,"w":30,"h":30,"type":"ice"},{"x":300,"y":360,"w":30,"h":30,"type":"ice"},{"x":300,"y":450,"w":30,"h":30,"type":"ice"},{"x":300,"y":480,"w":30,"h":30,"type":"ice"},{"x":300,"y":510,"w":30,"h":30,"type":"ice"},{"x":270,"y":510,"w":30,"h":30,"type":"ice"},{"x":240,"y":510,"w":30,"h":30,"type":"ice"},{"x":210,"y":510,"w":30,"h":30,"type":"ice"},{"x":180,"y":510,"w":30,"h":30,"type":"ice"},{"x":180,"y":480,"w":30,"h":30,"type":"ice"},{"x":180,"y":450,"w":30,"h":30,"type":"ice"},{"x":180,"y":420,"w":30,"h":30,"type":"ice"},{"x":210,"y":420,"w":30,"h":30,"type":"ice"},{"x":240,"y":420,"w":30,"h":30,"type":"ice"},{"x":270,"y":420,"w":30,"h":30,"type":"ice"},{"x":270,"y":450,"w":30,"h":30,"type":"ice"},{"x":270,"y":480,"w":30,"h":30,"type":"ice"},{"x":240,"y":480,"w":30,"h":30,"type":"ice"},{"x":210,"y":480,"w":30,"h":30,"type":"ice"},{"x":210,"y":450,"w":30,"h":30,"type":"ice"},{"x":240,"y":450,"w":30,"h":30,"type":"ice"},{"x":330,"y":480,"w":30,"h":30,"type":"ice"},{"x":360,"y":480,"w":30,"h":30,"type":"ice"},{"x":390,"y":480,"w":30,"h":30,"type":"ice"},{"x":420,"y":480,"w":30,"h":30,"type":"ice"},{"x":480,"y":480,"w":30,"h":30,"type":"ice"},{"x":540,"y":480,"w":30,"h":30,"type":"ice"},{"x":600,"y":480,"w":30,"h":30,"type":"ice"},{"x":630,"y":480,"w":30,"h":30,"type":"ice"},{"x":660,"y":480,"w":30,"h":30,"type":"ice"},{"x":690,"y":510,"w":30,"h":30,"type":"ice"},{"x":720,"y":510,"w":30,"h":30,"type":"ice"},{"x":720,"y":480,"w":30,"h":30,"type":"ice"},{"x":750,"y":480,"w":30,"h":30,"type":"ice"},{"x":750,"y":450,"w":30,"h":30,"type":"ice"},{"x":750,"y":420,"w":30,"h":30,"type":"ice"},{"x":720,"y":420,"w":30,"h":30,"type":"ice"},{"x":690,"y":420,"w":30,"h":30,"type":"ice"},{"x":660,"y":420,"w":30,"h":30,"type":"ice"},{"x":630,"y":420,"w":30,"h":30,"type":"ice"},{"x":660,"y":450,"w":30,"h":30,"type":"ice"},{"x":690,"y":450,"w":30,"h":30,"type":"ice"},{"x":720,"y":450,"w":30,"h":30,"type":"ice"},{"x":750,"y":510,"w":30,"h":30,"type":"ice"},{"x":660,"y":510,"w":30,"h":30,"type":"ice"},{"x":630,"y":510,"w":30,"h":30,"type":"ice"},{"x":600,"y":510,"w":30,"h":30,"type":"ice"},{"x":570,"y":510,"w":30,"h":30,"type":"ice"},{"x":540,"y":510,"w":30,"h":30,"type":"ice"},{"x":510,"y":510,"w":30,"h":30,"type":"ice"},{"x":480,"y":510,"w":30,"h":30,"type":"ice"},{"x":450,"y":510,"w":30,"h":30,"type":"ice"},{"x":420,"y":510,"w":30,"h":30,"type":"ice"},{"x":390,"y":510,"w":30,"h":30,"type":"ice"},{"x":360,"y":510,"w":30,"h":30,"type":"ice"},{"x":330,"y":510,"w":30,"h":30,"type":"ice"},{"x":330,"y":450,"w":30,"h":30,"type":"ice"},{"x":360,"y":450,"w":30,"h":30,"type":"ice"},{"x":360,"y":420,"w":30,"h":30,"type":"ice"},{"x":360,"y":390,"w":30,"h":30,"type":"ice"},{"x":360,"y":360,"w":30,"h":30,"type":"ice"},{"x":330,"y":330,"w":30,"h":30,"type":"ice"},{"x":330,"y":300,"w":30,"h":30,"type":"ice"},{"x":330,"y":270,"w":30,"h":30,"type":"wall"},{"x":360,"y":240,"w":30,"h":30,"type":"ice"},{"x":390,"y":240,"w":30,"h":30,"type":"ice"},{"x":390,"y":210,"w":30,"h":30,"type":"hazard"},{"x":360,"y":210,"w":30,"h":30,"type":"ice"},{"x":420,"y":210,"w":30,"h":30,"type":"ice"},{"x":450,"y":210,"w":30,"h":30,"type":"ice"},{"x":480,"y":210,"w":30,"h":30,"type":"ice"},{"x":510,"y":210,"w":30,"h":30,"type":"ice"},{"x":540,"y":210,"w":30,"h":30,"type":"hazard"},{"x":570,"y":210,"w":30,"h":30,"type":"ice"},{"x":570,"y":180,"w":30,"h":30,"type":"ice"},{"x":600,"y":180,"w":30,"h":30,"type":"ice"},{"x":630,"y":180,"w":30,"h":30,"type":"ice"},{"x":630,"y":210,"w":30,"h":30,"type":"ice"},{"x":630,"y":240,"w":30,"h":30,"type":"ice"},{"x":630,"y":270,"w":30,"h":30,"type":"ice"},{"x":630,"y":300,"w":30,"h":30,"type":"ice"},{"x":630,"y":330,"w":30,"h":30,"type":"ice"},{"x":630,"y":360,"w":30,"h":30,"type":"ice"},{"x":630,"y":390,"w":30,"h":30,"type":"ice"},{"x":630,"y":450,"w":30,"h":30,"type":"ice"},{"x":690,"y":480,"w":30,"h":30,"type":"ice"},{"x":570,"y":480,"w":30,"h":30,"type":"ice"},{"x":510,"y":480,"w":30,"h":30,"type":"ice"},{"x":450,"y":480,"w":30,"h":30,"type":"ice"},{"x":420,"y":450,"w":30,"h":30,"type":"ice"},{"x":390,"y":450,"w":30,"h":30,"type":"ice"},{"x":390,"y":420,"w":30,"h":30,"type":"ice"},{"x":390,"y":390,"w":30,"h":30,"type":"ice"},{"x":390,"y":360,"w":30,"h":30,"type":"wall"},{"x":390,"y":330,"w":30,"h":30,"type":"ice"},{"x":390,"y":300,"w":30,"h":30,"type":"ice"},{"x":390,"y":270,"w":30,"h":30,"type":"ice"},{"x":360,"y":270,"w":30,"h":30,"type":"ice"},{"x":360,"y":300,"w":30,"h":30,"type":"ice"},{"x":360,"y":330,"w":30,"h":30,"type":"ice"},{"x":330,"y":240,"w":30,"h":30,"type":"wall"},{"x":420,"y":240,"w":30,"h":30,"type":"ice"},{"x":450,"y":240,"w":30,"h":30,"type":"ice"},{"x":480,"y":240,"w":30,"h":30,"type":"ice"},{"x":510,"y":240,"w":30,"h":30,"type":"ice"},{"x":540,"y":240,"w":30,"h":30,"type":"ice"},{"x":570,"y":240,"w":30,"h":30,"type":"ice"},{"x":600,"y":240,"w":30,"h":30,"type":"wall"},{"x":600,"y":210,"w":30,"h":30,"type":"ice"},{"x":600,"y":270,"w":30,"h":30,"type":"wall"},{"x":600,"y":300,"w":30,"h":30,"type":"ice"},{"x":600,"y":330,"w":30,"h":30,"type":"ice"},{"x":600,"y":360,"w":30,"h":30,"type":"ice"},{"x":600,"y":390,"w":30,"h":30,"type":"ice"},{"x":600,"y":420,"w":30,"h":30,"type":"ice"},{"x":600,"y":450,"w":30,"h":30,"type":"ice"},{"x":570,"y":450,"w":30,"h":30,"type":"ice"},{"x":540,"y":450,"w":30,"h":30,"type":"ice"},{"x":510,"y":450,"w":30,"h":30,"type":"ice"},{"x":480,"y":450,"w":30,"h":30,"type":"ice"},{"x":450,"y":450,"w":30,"h":30,"type":"ice"},{"x":420,"y":420,"w":30,"h":30,"type":"ice"},{"x":420,"y":390,"w":30,"h":30,"type":"wall"},{"x":420,"y":360,"w":30,"h":30,"type":"ice"},{"x":420,"y":330,"w":30,"h":30,"type":"ice"},{"x":420,"y":300,"w":30,"h":30,"type":"ice"},{"x":420,"y":270,"w":30,"h":30,"type":"ice"},{"x":450,"y":270,"w":30,"h":30,"type":"wall"},{"x":480,"y":270,"w":30,"h":30,"type":"wall"},{"x":510,"y":270,"w":30,"h":30,"type":"ice"},{"x":540,"y":270,"w":30,"h":30,"type":"ice"},{"x":570,"y":270,"w":30,"h":30,"type":"ice"},{"x":570,"y":300,"w":30,"h":30,"type":"ice"},{"x":570,"y":330,"w":30,"h":30,"type":"ice"},{"x":570,"y":360,"w":30,"h":30,"type":"ice"},{"x":570,"y":390,"w":30,"h":30,"type":"ice"},{"x":570,"y":420,"w":30,"h":30,"type":"ice"},{"x":540,"y":420,"w":30,"h":30,"type":"ice"},{"x":510,"y":420,"w":30,"h":30,"type":"ice"},{"x":480,"y":420,"w":30,"h":30,"type":"ice"},{"x":450,"y":390,"w":30,"h":30,"type":"wall"},{"x":450,"y":360,"w":30,"h":30,"type":"ice"},{"x":450,"y":330,"w":30,"h":30,"type":"ice"},{"x":450,"y":300,"w":30,"h":30,"type":"wall"},{"x":480,"y":300,"w":30,"h":30,"type":"wall"},{"x":510,"y":300,"w":30,"h":30,"type":"ice"},{"x":540,"y":300,"w":30,"h":30,"type":"ice"},{"x":540,"y":360,"w":30,"h":30,"type":"wall"},{"x":540,"y":390,"w":30,"h":30,"type":"ice"},{"x":540,"y":330,"w":30,"h":30,"type":"ice"},{"x":510,"y":330,"w":30,"h":30,"type":"ice"},{"x":480,"y":330,"w":30,"h":30,"type":"ice"},{"x":480,"y":360,"w":30,"h":30,"type":"ice"},{"x":510,"y":360,"w":30,"h":30,"type":"ice"},{"x":510,"y":390,"w":30,"h":30,"type":"wall"},{"x":480,"y":390,"w":30,"h":30,"type":"wall"},{"x":450,"y":420,"w":30,"h":30,"type":"ice"}
    ]
  }
];

// --- ADVANCED (10 Levels) ---
export const ADVANCED_LEVELS: LevelData[] = [
  {"id":"imported_1773747667666_4_0","name":"Advanced Level 1","start":{"x":35,"y":455},"entities":[{"x":0,"y":0,"w":960,"h":30,"type":"wall"},{"x":30,"y":480,"w":30,"h":30,"type":"slime"},{"x":150,"y":300,"w":30,"h":30,"type":"ice"},{"x":270,"y":420,"w":30,"h":30,"type":"slime"},{"x":30,"y":450,"w":30,"h":30,"type":"powerup_hook","id":"custom_1770971106108_0.6234562373933115"},{"x":270,"y":390,"w":30,"h":30,"type":"powerup_hook","id":"custom_1770971110068_0.3996644652588981"},{"x":420,"y":270,"w":30,"h":30,"type":"ice"},{"x":540,"y":390,"w":30,"h":30,"type":"slime"},{"x":540,"y":360,"w":30,"h":30,"type":"powerup_hook","id":"custom_1770971123674_0.2977991694807053"},{"x":810,"y":360,"w":30,"h":30,"type":"slime"},{"x":900,"y":360,"w":30,"h":30,"type":"trampoline"},{"x":900,"y":120,"w":40,"h":40,"type":"goal"},{"x":690,"y":240,"w":30,"h":30,"type":"ice"},{"x":155,"y":275,"w":20,"h":20,"type":"coin","id":"custom_1770972427260_0.19326751269992404"},{"x":425,"y":245,"w":20,"h":20,"type":"coin","id":"custom_1770972427913_0.4494457479163517"},{"x":695,"y":215,"w":20,"h":20,"type":"coin","id":"custom_1770972428519_0.20340442074955378"}],"isCustom":true,"isBrawler":false,"allowedAbility":"none","isVerified":true},
  {"id":"imported_1773747667666_3_0","name":"Advanced Level 2","start":{"x":65,"y":305},"entities":[{"x":150,"y":480,"w":30,"h":30,"type":"ice"},{"x":150,"y":450,"w":30,"h":30,"type":"ice"},{"x":150,"y":420,"w":30,"h":30,"type":"ice"},{"x":150,"y":390,"w":30,"h":30,"type":"ice"},{"x":150,"y":360,"w":30,"h":30,"type":"ice"},{"x":150,"y":330,"w":30,"h":30,"type":"ice"},{"x":150,"y":300,"w":30,"h":30,"type":"ice"},{"x":150,"y":270,"w":30,"h":30,"type":"ice"},{"x":150,"y":240,"w":30,"h":30,"type":"ice"},{"x":150,"y":210,"w":30,"h":30,"type":"ice"},{"x":150,"y":510,"w":30,"h":30,"type":"ice"},{"x":330,"y":210,"w":30,"h":30,"type":"ice"},{"x":240,"y":330,"w":30,"h":30,"type":"wall"},{"x":420,"y":330,"w":30,"h":30,"type":"wall"},{"x":600,"y":330,"w":30,"h":30,"type":"wall"},{"x":510,"y":210,"w":30,"h":30,"type":"ice"},{"x":330,"y":240,"w":30,"h":30,"type":"ice"},{"x":330,"y":270,"w":30,"h":30,"type":"ice"},{"x":330,"y":300,"w":30,"h":30,"type":"ice"},{"x":330,"y":330,"w":30,"h":30,"type":"ice"},{"x":330,"y":360,"w":30,"h":30,"type":"ice"},{"x":330,"y":390,"w":30,"h":30,"type":"ice"},{"x":330,"y":420,"w":30,"h":30,"type":"ice"},{"x":330,"y":450,"w":30,"h":30,"type":"ice"},{"x":330,"y":480,"w":30,"h":30,"type":"ice"},{"x":330,"y":510,"w":30,"h":30,"type":"ice"},{"x":510,"y":240,"w":30,"h":30,"type":"ice"},{"x":510,"y":270,"w":30,"h":30,"type":"ice"},{"x":510,"y":300,"w":30,"h":30,"type":"ice"},{"x":510,"y":360,"w":30,"h":30,"type":"ice"},{"x":510,"y":390,"w":30,"h":30,"type":"ice"},{"x":510,"y":420,"w":30,"h":30,"type":"ice"},{"x":510,"y":450,"w":30,"h":30,"type":"ice"},{"x":510,"y":480,"w":30,"h":30,"type":"ice"},{"x":510,"y":510,"w":30,"h":30,"type":"ice"},{"x":510,"y":330,"w":30,"h":30,"type":"ice"},{"x":690,"y":210,"w":30,"h":30,"type":"ice"},{"x":690,"y":240,"w":30,"h":30,"type":"ice"},{"x":690,"y":270,"w":30,"h":30,"type":"ice"},{"x":690,"y":300,"w":30,"h":30,"type":"ice"},{"x":690,"y":330,"w":30,"h":30,"type":"ice"},{"x":690,"y":360,"w":30,"h":30,"type":"ice"},{"x":690,"y":390,"w":30,"h":30,"type":"ice"},{"x":690,"y":420,"w":30,"h":30,"type":"ice"},{"x":690,"y":450,"w":30,"h":30,"type":"ice"},{"x":690,"y":480,"w":30,"h":30,"type":"ice"},{"x":690,"y":510,"w":30,"h":30,"type":"ice"},{"x":60,"y":330,"w":30,"h":30,"type":"wall"},{"x":150,"y":180,"w":30,"h":30,"type":"ice"},{"x":330,"y":180,"w":30,"h":30,"type":"ice"},{"x":510,"y":180,"w":30,"h":30,"type":"ice"},{"x":690,"y":180,"w":30,"h":30,"type":"ice"},{"x":330,"y":150,"w":30,"h":30,"type":"ice"},{"x":510,"y":150,"w":30,"h":30,"type":"ice"},{"x":690,"y":150,"w":30,"h":30,"type":"ice"},{"x":150,"y":150,"w":30,"h":30,"type":"ice"},{"x":810,"y":300,"w":40,"h":40,"type":"goal"},{"x":240,"y":300,"w":30,"h":30,"type":"powerup_double_jump","id":"e_1773748065951_adewlxn91"},{"x":420,"y":300,"w":30,"h":30,"type":"powerup_double_jump","id":"e_1773748066729_97ei069th"},{"x":600,"y":300,"w":30,"h":30,"type":"powerup_double_jump","id":"e_1773748067322_sq32om24t"},{"x":60,"y":300,"w":30,"h":30,"type":"powerup_double_jump","id":"e_1773748064362_zjspnnffn"},{"x":605,"y":275,"w":20,"h":20,"type":"coin","id":"e_1773748071711_jgejlfizc"},{"x":425,"y":275,"w":20,"h":20,"type":"coin","id":"e_1773748072279_r6z4zpzhg"},{"x":245,"y":275,"w":20,"h":20,"type":"coin","id":"e_1773748072841_llqpyw1gv"}],"isCustom":true,"isBrawler":false,"allowedAbility":"none","isVerified":true},
  {"id":"imported_1773747667667_2_0","name":"Advanced Level 3","start":{"x":35,"y":275},"entities":[{"x":30,"y":240,"w":30,"h":30,"type":"ice"},{"x":60,"y":240,"w":30,"h":30,"type":"ice"},{"x":90,"y":240,"w":30,"h":30,"type":"ice"},{"x":120,"y":240,"w":30,"h":30,"type":"ice"},{"x":150,"y":240,"w":30,"h":30,"type":"ice"},{"x":180,"y":240,"w":30,"h":30,"type":"ice"},{"x":210,"y":240,"w":30,"h":30,"type":"ice"},{"x":240,"y":240,"w":30,"h":30,"type":"ice"},{"x":270,"y":240,"w":30,"h":30,"type":"ice"},{"x":330,"y":240,"w":30,"h":30,"type":"ice"},{"x":360,"y":240,"w":30,"h":30,"type":"ice"},{"x":390,"y":240,"w":30,"h":30,"type":"ice"},{"x":420,"y":240,"w":30,"h":30,"type":"ice"},{"x":450,"y":240,"w":30,"h":30,"type":"ice"},{"x":480,"y":240,"w":30,"h":30,"type":"ice"},{"x":510,"y":240,"w":30,"h":30,"type":"ice"},{"x":540,"y":240,"w":30,"h":30,"type":"ice"},{"x":570,"y":240,"w":30,"h":30,"type":"ice"},{"x":600,"y":240,"w":30,"h":30,"type":"ice"},{"x":630,"y":240,"w":30,"h":30,"type":"ice"},{"x":660,"y":240,"w":30,"h":30,"type":"ice"},{"x":690,"y":240,"w":30,"h":30,"type":"ice"},{"x":720,"y":240,"w":30,"h":30,"type":"ice"},{"x":750,"y":240,"w":30,"h":30,"type":"ice"},{"x":780,"y":240,"w":30,"h":30,"type":"ice"},{"x":810,"y":240,"w":30,"h":30,"type":"ice"},{"x":840,"y":240,"w":30,"h":30,"type":"ice"},{"x":870,"y":240,"w":30,"h":30,"type":"ice"},{"x":900,"y":240,"w":30,"h":30,"type":"ice"},{"x":300,"y":240,"w":30,"h":30,"type":"ice"},{"x":30,"y":300,"w":30,"h":30,"type":"ice"},{"x":60,"y":300,"w":30,"h":30,"type":"ice"},{"x":90,"y":300,"w":30,"h":30,"type":"ice"},{"x":120,"y":300,"w":30,"h":30,"type":"ice"},{"x":150,"y":300,"w":30,"h":30,"type":"ice"},{"x":210,"y":300,"w":30,"h":30,"type":"ice"},{"x":270,"y":300,"w":30,"h":30,"type":"ice"},{"x":300,"y":300,"w":30,"h":30,"type":"ice"},{"x":330,"y":300,"w":30,"h":30,"type":"ice"},{"x":360,"y":300,"w":30,"h":30,"type":"ice"},{"x":420,"y":300,"w":30,"h":30,"type":"ice"},{"x":450,"y":300,"w":30,"h":30,"type":"ice"},{"x":480,"y":300,"w":30,"h":30,"type":"ice"},{"x":510,"y":300,"w":30,"h":30,"type":"ice"},{"x":540,"y":300,"w":30,"h":30,"type":"ice"},{"x":570,"y":300,"w":30,"h":30,"type":"ice"},{"x":630,"y":300,"w":30,"h":30,"type":"ice"},{"x":660,"y":300,"w":30,"h":30,"type":"ice"},{"x":690,"y":300,"w":30,"h":30,"type":"ice"},{"x":720,"y":300,"w":30,"h":30,"type":"ice"},{"x":750,"y":300,"w":30,"h":30,"type":"ice"},{"x":780,"y":300,"w":30,"h":30,"type":"ice"},{"x":840,"y":300,"w":30,"h":30,"type":"ice"},{"x":870,"y":300,"w":30,"h":30,"type":"ice"},{"x":900,"y":300,"w":30,"h":30,"type":"ice"},{"x":240,"y":300,"w":30,"h":30,"type":"ice"},{"x":0,"y":240,"w":30,"h":30,"type":"ice"},{"x":0,"y":270,"w":30,"h":30,"type":"ice"},{"x":0,"y":300,"w":30,"h":30,"type":"ice"},{"x":930,"y":240,"w":30,"h":30,"type":"ice"},{"x":930,"y":270,"w":30,"h":30,"type":"ice"},{"x":930,"y":300,"w":30,"h":30,"type":"ice"},{"x":900,"y":270,"w":40,"h":40,"type":"goal"},{"x":30,"y":30,"w":30,"h":30,"type":"wall"},{"x":30,"y":60,"w":30,"h":30,"type":"wall"},{"x":30,"y":90,"w":30,"h":30,"type":"wall"},{"x":30,"y":120,"w":30,"h":30,"type":"wall"},{"x":30,"y":150,"w":30,"h":30,"type":"wall"},{"x":30,"y":180,"w":30,"h":30,"type":"wall"},{"x":60,"y":30,"w":30,"h":30,"type":"wall"},{"x":90,"y":30,"w":30,"h":30,"type":"wall"},{"x":120,"y":30,"w":30,"h":30,"type":"wall"},{"x":120,"y":60,"w":30,"h":30,"type":"wall"},{"x":120,"y":90,"w":30,"h":30,"type":"wall"},{"x":90,"y":90,"w":30,"h":30,"type":"wall"},{"x":60,"y":90,"w":30,"h":30,"type":"wall"},{"x":60,"y":120,"w":30,"h":30,"type":"wall"},{"x":90,"y":150,"w":30,"h":30,"type":"wall"},{"x":120,"y":180,"w":30,"h":30,"type":"wall"},{"x":180,"y":180,"w":30,"h":30,"type":"wall"},{"x":180,"y":150,"w":30,"h":30,"type":"wall"},{"x":180,"y":120,"w":30,"h":30,"type":"wall"},{"x":180,"y":90,"w":30,"h":30,"type":"wall"},{"x":180,"y":60,"w":30,"h":30,"type":"wall"},{"x":210,"y":30,"w":30,"h":30,"type":"wall"},{"x":240,"y":30,"w":30,"h":30,"type":"wall"},{"x":270,"y":90,"w":30,"h":30,"type":"wall"},{"x":270,"y":60,"w":30,"h":30,"type":"wall"},{"x":270,"y":120,"w":30,"h":30,"type":"wall"},{"x":270,"y":150,"w":30,"h":30,"type":"wall"},{"x":270,"y":180,"w":30,"h":30,"type":"wall"},{"x":210,"y":90,"w":30,"h":30,"type":"wall"},{"x":240,"y":90,"w":30,"h":30,"type":"wall"},{"x":330,"y":30,"w":30,"h":30,"type":"wall"},{"x":330,"y":90,"w":30,"h":30,"type":"wall"},{"x":330,"y":60,"w":30,"h":30,"type":"wall"},{"x":330,"y":120,"w":30,"h":30,"type":"wall"},{"x":330,"y":150,"w":30,"h":30,"type":"wall"},{"x":330,"y":180,"w":30,"h":30,"type":"wall"},{"x":360,"y":30,"w":30,"h":30,"type":"wall"},{"x":390,"y":30,"w":30,"h":30,"type":"wall"},{"x":420,"y":30,"w":30,"h":30,"type":"wall"},{"x":420,"y":60,"w":30,"h":30,"type":"wall"},{"x":420,"y":90,"w":30,"h":30,"type":"wall"},{"x":390,"y":90,"w":30,"h":30,"type":"wall"},{"x":360,"y":90,"w":30,"h":30,"type":"wall"},{"x":360,"y":180,"w":30,"h":30,"type":"wall"},{"x":390,"y":180,"w":30,"h":30,"type":"wall"},{"x":420,"y":180,"w":30,"h":30,"type":"wall"},{"x":420,"y":150,"w":30,"h":30,"type":"wall"},{"x":480,"y":30,"w":30,"h":30,"type":"wall"},{"x":480,"y":60,"w":30,"h":30,"type":"wall"},{"x":480,"y":90,"w":30,"h":30,"type":"wall"},{"x":480,"y":120,"w":30,"h":30,"type":"wall"},{"x":480,"y":150,"w":30,"h":30,"type":"wall"},{"x":480,"y":180,"w":30,"h":30,"type":"wall"},{"x":510,"y":180,"w":30,"h":30,"type":"wall"},{"x":540,"y":180,"w":30,"h":30,"type":"wall"},{"x":570,"y":180,"w":30,"h":30,"type":"wall"},{"x":510,"y":30,"w":30,"h":30,"type":"wall"},{"x":540,"y":30,"w":30,"h":30,"type":"wall"},{"x":570,"y":30,"w":30,"h":30,"type":"wall"},{"x":540,"y":120,"w":30,"h":30,"type":"wall"},{"x":510,"y":120,"w":30,"h":30,"type":"wall"},{"x":390,"y":360,"w":30,"h":30,"type":"wall"},{"x":390,"y":420,"w":30,"h":30,"type":"wall"},{"x":390,"y":390,"w":30,"h":30,"type":"wall"},{"x":390,"y":450,"w":30,"h":30,"type":"wall"},{"x":390,"y":480,"w":30,"h":30,"type":"wall"},{"x":420,"y":480,"w":30,"h":30,"type":"wall"},{"x":450,"y":480,"w":30,"h":30,"type":"wall"},{"x":420,"y":360,"w":30,"h":30,"type":"wall"},{"x":450,"y":360,"w":30,"h":30,"type":"wall"},{"x":510,"y":360,"w":30,"h":30,"type":"wall"},{"x":510,"y":390,"w":30,"h":30,"type":"wall"},{"x":510,"y":420,"w":30,"h":30,"type":"wall"},{"x":510,"y":450,"w":30,"h":30,"type":"wall"},{"x":510,"y":480,"w":30,"h":30,"type":"wall"},{"x":540,"y":480,"w":30,"h":30,"type":"wall"},{"x":570,"y":480,"w":30,"h":30,"type":"wall"},{"x":600,"y":480,"w":30,"h":30,"type":"wall"},{"x":600,"y":450,"w":30,"h":30,"type":"wall"},{"x":600,"y":420,"w":30,"h":30,"type":"wall"},{"x":600,"y":390,"w":30,"h":30,"type":"wall"},{"x":600,"y":360,"w":30,"h":30,"type":"wall"},{"x":660,"y":360,"w":30,"h":30,"type":"wall"},{"x":660,"y":390,"w":30,"h":30,"type":"wall"},{"x":660,"y":420,"w":30,"h":30,"type":"wall"},{"x":660,"y":450,"w":30,"h":30,"type":"wall"},{"x":660,"y":480,"w":30,"h":30,"type":"wall"},{"x":690,"y":480,"w":30,"h":30,"type":"wall"},{"x":720,"y":480,"w":30,"h":30,"type":"wall"},{"x":750,"y":480,"w":30,"h":30,"type":"wall"},{"x":750,"y":450,"w":30,"h":30,"type":"wall"},{"x":750,"y":420,"w":30,"h":30,"type":"wall"},{"x":720,"y":420,"w":30,"h":30,"type":"wall"},{"x":690,"y":360,"w":30,"h":30,"type":"wall"},{"x":720,"y":360,"w":30,"h":30,"type":"wall"},{"x":750,"y":360,"w":30,"h":30,"type":"wall"},{"x":750,"y":390,"w":30,"h":30,"type":"wall"},{"x":810,"y":360,"w":30,"h":30,"type":"wall"},{"x":810,"y":390,"w":30,"h":30,"type":"wall"},{"x":810,"y":420,"w":30,"h":30,"type":"wall"},{"x":810,"y":450,"w":30,"h":30,"type":"wall"},{"x":810,"y":480,"w":30,"h":30,"type":"wall"},{"x":840,"y":480,"w":30,"h":30,"type":"wall"},{"x":870,"y":480,"w":30,"h":30,"type":"wall"},{"x":840,"y":420,"w":30,"h":30,"type":"wall"},{"x":840,"y":360,"w":30,"h":30,"type":"wall"},{"x":870,"y":360,"w":30,"h":30,"type":"wall"},{"x":900,"y":360,"w":30,"h":30,"type":"wall"},{"x":870,"y":420,"w":30,"h":30,"type":"wall"},{"x":900,"y":480,"w":30,"h":30,"type":"wall"},{"x":690,"y":90,"w":30,"h":30,"type":"wall"},{"x":720,"y":90,"w":30,"h":30,"type":"wall"},{"x":750,"y":90,"w":30,"h":30,"type":"wall"},{"x":780,"y":90,"w":30,"h":30,"type":"wall"},{"x":810,"y":90,"w":30,"h":30,"type":"wall"},{"x":690,"y":150,"w":30,"h":30,"type":"wall"},{"x":720,"y":150,"w":30,"h":30,"type":"wall"},{"x":750,"y":150,"w":30,"h":30,"type":"wall"},{"x":780,"y":150,"w":30,"h":30,"type":"wall"},{"x":810,"y":150,"w":30,"h":30,"type":"wall"},{"x":120,"y":390,"w":30,"h":30,"type":"wall"},{"x":150,"y":390,"w":30,"h":30,"type":"wall"},{"x":180,"y":390,"w":30,"h":30,"type":"wall"},{"x":210,"y":390,"w":30,"h":30,"type":"wall"},{"x":240,"y":390,"w":30,"h":30,"type":"wall"},{"x":120,"y":450,"w":30,"h":30,"type":"wall"},{"x":180,"y":450,"w":30,"h":30,"type":"wall"},{"x":210,"y":450,"w":30,"h":30,"type":"wall"},{"x":240,"y":450,"w":30,"h":30,"type":"wall"},{"x":150,"y":450,"w":30,"h":30,"type":"wall"},{"x":630,"y":150,"w":30,"h":30,"type":"wall"},{"x":630,"y":90,"w":30,"h":30,"type":"wall"},{"x":870,"y":150,"w":30,"h":30,"type":"wall"},{"x":870,"y":90,"w":30,"h":30,"type":"wall"},{"x":300,"y":450,"w":30,"h":30,"type":"wall"},{"x":300,"y":390,"w":30,"h":30,"type":"wall"},{"x":60,"y":450,"w":30,"h":30,"type":"wall"},{"x":60,"y":390,"w":30,"h":30,"type":"wall"}],"isCustom":true,"isBrawler":false,"allowedAbility":"build","isVerified":true},
  {"id":"imported_1773747667666_1_0","name":"Advanced Level 4","start":{"x":65,"y":455},"entities":[{"x":60,"y":480,"w":30,"h":30,"type":"slime"},{"x":180,"y":480,"w":30,"h":30,"type":"slime"},{"x":300,"y":480,"w":30,"h":30,"type":"ice"},{"x":330,"y":390,"w":30,"h":30,"type":"powerup_double_jump","id":"custom_1770974324370_0.5793854882180837"},{"x":660,"y":330,"w":30,"h":30,"type":"trampoline"},{"x":600,"y":90,"w":30,"h":30,"type":"ice"},{"x":570,"y":90,"w":30,"h":30,"type":"ice"},{"x":540,"y":90,"w":30,"h":30,"type":"ice"},{"x":510,"y":90,"w":30,"h":30,"type":"ice"},{"x":480,"y":90,"w":30,"h":30,"type":"ice"},{"x":450,"y":90,"w":30,"h":30,"type":"ice"},{"x":420,"y":90,"w":30,"h":30,"type":"ice"},{"x":390,"y":90,"w":30,"h":30,"type":"ice"},{"x":360,"y":90,"w":30,"h":30,"type":"ice"},{"x":300,"y":30,"w":30,"h":30,"type":"ice"},{"x":870,"y":0,"w":30,"h":30,"type":"ice"},{"x":870,"y":30,"w":30,"h":30,"type":"ice"},{"x":870,"y":60,"w":30,"h":30,"type":"ice"},{"x":870,"y":90,"w":30,"h":30,"type":"ice"},{"x":870,"y":120,"w":30,"h":30,"type":"ice"},{"x":870,"y":150,"w":30,"h":30,"type":"ice"},{"x":870,"y":180,"w":30,"h":30,"type":"ice"},{"x":870,"y":210,"w":30,"h":30,"type":"ice"},{"x":870,"y":240,"w":30,"h":30,"type":"ice"},{"x":870,"y":270,"w":30,"h":30,"type":"ice"},{"x":870,"y":300,"w":30,"h":30,"type":"ice"},{"x":870,"y":330,"w":30,"h":30,"type":"ice"},{"x":870,"y":360,"w":30,"h":30,"type":"ice"},{"x":870,"y":390,"w":30,"h":30,"type":"ice"},{"x":870,"y":420,"w":30,"h":30,"type":"ice"},{"x":870,"y":450,"w":30,"h":30,"type":"ice"},{"x":870,"y":480,"w":30,"h":30,"type":"ice"},{"x":870,"y":510,"w":30,"h":30,"type":"ice"},{"x":900,"y":510,"w":30,"h":30,"type":"ice"},{"x":930,"y":510,"w":30,"h":30,"type":"ice"},{"x":930,"y":480,"w":30,"h":30,"type":"ice"},{"x":930,"y":450,"w":30,"h":30,"type":"ice"},{"x":930,"y":420,"w":30,"h":30,"type":"ice"},{"x":930,"y":390,"w":30,"h":30,"type":"ice"},{"x":930,"y":360,"w":30,"h":30,"type":"ice"},{"x":930,"y":330,"w":30,"h":30,"type":"ice"},{"x":930,"y":300,"w":30,"h":30,"type":"ice"},{"x":930,"y":270,"w":30,"h":30,"type":"ice"},{"x":930,"y":240,"w":30,"h":30,"type":"ice"},{"x":930,"y":210,"w":30,"h":30,"type":"ice"},{"x":930,"y":180,"w":30,"h":30,"type":"ice"},{"x":930,"y":150,"w":30,"h":30,"type":"ice"},{"x":930,"y":120,"w":30,"h":30,"type":"ice"},{"x":930,"y":90,"w":30,"h":30,"type":"ice"},{"x":930,"y":60,"w":30,"h":30,"type":"ice"},{"x":930,"y":30,"w":30,"h":30,"type":"ice"},{"x":930,"y":0,"w":30,"h":30,"type":"ice"},{"x":900,"y":0,"w":30,"h":30,"type":"ice"},{"x":900,"y":480,"w":40,"h":40,"type":"goal"},{"x":900.5,"y":30.5,"w":29,"h":29,"type":"teleport"},{"x":600,"y":30,"w":30,"h":30,"type":"ice"},{"x":570,"y":30,"w":30,"h":30,"type":"ice"},{"x":540,"y":30,"w":30,"h":30,"type":"ice"},{"x":510,"y":30,"w":30,"h":30,"type":"ice"},{"x":480,"y":30,"w":30,"h":30,"type":"ice"},{"x":450,"y":30,"w":30,"h":30,"type":"ice"},{"x":420,"y":30,"w":30,"h":30,"type":"ice"},{"x":390,"y":30,"w":30,"h":30,"type":"ice"},{"x":360,"y":30,"w":30,"h":30,"type":"ice"},{"x":330,"y":30,"w":30,"h":30,"type":"ice"},{"x":270,"y":30,"w":30,"h":30,"type":"ice"},{"x":240,"y":30,"w":30,"h":30,"type":"ice"},{"x":210,"y":30,"w":30,"h":30,"type":"ice"},{"x":180,"y":30,"w":30,"h":30,"type":"ice"},{"x":150,"y":30,"w":30,"h":30,"type":"ice"},{"x":120,"y":30,"w":30,"h":30,"type":"ice"},{"x":90,"y":30,"w":30,"h":30,"type":"ice"},{"x":60,"y":30,"w":30,"h":30,"type":"ice"},{"x":30,"y":30,"w":30,"h":30,"type":"ice"},{"x":0,"y":30,"w":30,"h":30,"type":"ice"},{"x":0,"y":90,"w":30,"h":30,"type":"ice"},{"x":30,"y":90,"w":30,"h":30,"type":"ice"},{"x":120,"y":90,"w":30,"h":30,"type":"ice"},{"x":180,"y":90,"w":30,"h":30,"type":"ice"},{"x":330,"y":90,"w":30,"h":30,"type":"ice"},{"x":300,"y":90,"w":30,"h":30,"type":"ice"},{"x":270,"y":90,"w":30,"h":30,"type":"ice"},{"x":240,"y":90,"w":30,"h":30,"type":"ice"},{"x":210,"y":90,"w":30,"h":30,"type":"ice"},{"x":150,"y":90,"w":30,"h":30,"type":"ice"},{"x":90,"y":90,"w":30,"h":30,"type":"ice"},{"x":60,"y":90,"w":30,"h":30,"type":"ice"},{"x":0,"y":60,"w":30,"h":30,"type":"ice"},{"x":30.5,"y":60.5,"w":29,"h":29,"type":"teleport"},{"x":905,"y":125,"w":20,"h":20,"type":"coin","id":"custom_1770974456577_0.7956391408254775"},{"x":575,"y":65,"w":20,"h":20,"type":"coin","id":"custom_1770974458682_0.3490284387774699"},{"x":665,"y":305,"w":20,"h":20,"type":"coin","id":"custom_1770974460475_0.20915192732315369"},{"x":305,"y":455,"w":20,"h":20,"type":"coin","id":"custom_1770974461143_0.824888704807871"},{"x":185,"y":455,"w":20,"h":20,"type":"coin","id":"custom_1770974461855_0.6869422449914006"}],"isCustom":true,"isBrawler":false,"allowedAbility":"none","isVerified":true},
  {"id":"custom_1773748458803","name":"Advanced Level 5","start":{"x":50,"y":450},"entities":[{"x":30,"y":480,"w":30,"h":30,"type":"wall"},{"x":60,"y":480,"w":30,"h":30,"type":"wall"},{"x":150,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":180,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":210,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":240,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":150,"y":0,"w":30,"h":30,"type":"wall"},{"x":150,"y":30,"w":30,"h":30,"type":"wall"},{"x":150,"y":60,"w":30,"h":30,"type":"wall"},{"x":180,"y":60,"w":30,"h":30,"type":"wall"},{"x":210,"y":60,"w":30,"h":30,"type":"wall"},{"x":210,"y":30,"w":30,"h":30,"type":"wall"},{"x":210,"y":0,"w":30,"h":30,"type":"wall"},{"x":420,"y":0,"w":30,"h":30,"type":"wall"},{"x":420,"y":30,"w":30,"h":30,"type":"wall"},{"x":420,"y":60,"w":30,"h":30,"type":"wall"},{"x":450,"y":60,"w":30,"h":30,"type":"wall"},{"x":480,"y":60,"w":30,"h":30,"type":"wall"},{"x":480,"y":30,"w":30,"h":30,"type":"wall"},{"x":480,"y":0,"w":30,"h":30,"type":"wall"},{"x":690,"y":0,"w":30,"h":30,"type":"walkthrough_wall"},{"x":690,"y":30,"w":30,"h":30,"type":"walkthrough_wall"},{"x":690,"y":60,"w":30,"h":30,"type":"walkthrough_wall"},{"x":720,"y":60,"w":30,"h":30,"type":"walkthrough_wall"},{"x":750,"y":60,"w":30,"h":30,"type":"walkthrough_wall"},{"x":750,"y":30,"w":30,"h":30,"type":"walkthrough_wall"},{"x":750,"y":0,"w":30,"h":30,"type":"walkthrough_wall"},{"x":210,"y":240,"w":30,"h":30,"type":"wall"},{"x":240,"y":240,"w":30,"h":30,"type":"wall"},{"x":270,"y":240,"w":30,"h":30,"type":"wall"},{"x":570,"y":240,"w":30,"h":30,"type":"wall"},{"x":600,"y":240,"w":30,"h":30,"type":"wall"},{"x":630,"y":240,"w":30,"h":30,"type":"wall"},{"x":570,"y":210,"w":30,"h":30,"type":"ghost_hazard"},{"x":600,"y":210,"w":30,"h":30,"type":"ghost_hazard"},{"x":630,"y":210,"w":30,"h":30,"type":"ghost_hazard"},{"x":270,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":300,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":330,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":360,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":390,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":420,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":450,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":480,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":510,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":540,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":570,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":600,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":630,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":660,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":690,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":720,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":750,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":455,"y":125,"w":20,"h":20,"type":"coin","id":"e_1773748451505_1eu7y63kc"},{"x":150,"y":480,"w":30,"h":30,"type":"hazard"},{"x":180,"y":480,"w":30,"h":30,"type":"hazard"},{"x":210,"y":480,"w":30,"h":30,"type":"hazard"},{"x":240,"y":480,"w":30,"h":30,"type":"hazard"},{"x":270,"y":480,"w":30,"h":30,"type":"hazard"},{"x":300,"y":480,"w":30,"h":30,"type":"hazard"},{"x":330,"y":480,"w":30,"h":30,"type":"hazard"},{"x":360,"y":480,"w":30,"h":30,"type":"hazard"},{"x":390,"y":480,"w":30,"h":30,"type":"hazard"},{"x":420,"y":480,"w":30,"h":30,"type":"hazard"},{"x":450,"y":480,"w":30,"h":30,"type":"hazard"},{"x":480,"y":480,"w":30,"h":30,"type":"hazard"},{"x":510,"y":480,"w":30,"h":30,"type":"hazard"},{"x":540,"y":480,"w":30,"h":30,"type":"hazard"},{"x":570,"y":480,"w":30,"h":30,"type":"hazard"},{"x":600,"y":480,"w":30,"h":30,"type":"hazard"},{"x":630,"y":480,"w":30,"h":30,"type":"hazard"},{"x":660,"y":480,"w":30,"h":30,"type":"hazard"},{"x":690,"y":480,"w":30,"h":30,"type":"hazard"},{"x":720,"y":480,"w":30,"h":30,"type":"hazard"},{"x":750,"y":480,"w":30,"h":30,"type":"hazard"},{"x":540,"y":240,"w":30,"h":30,"type":"wall"},{"x":540,"y":210,"w":30,"h":30,"type":"ghost_hazard"},{"x":450,"y":330,"w":30,"h":30,"type":"fake_goal"},{"x":930,"y":90,"w":30,"h":30,"type":"slime"},{"x":930,"y":120,"w":30,"h":30,"type":"slime"},{"x":930,"y":150,"w":30,"h":30,"type":"slime"},{"x":420,"y":120,"w":30,"h":30,"type":"powerup_xray","id":"e_1773748686238_4ddmlj5m2"},{"x":900,"y":30,"w":30,"h":30,"type":"goal"}],"isCustom":true,"isBrawler":false,"allowedAbility":"hook","isVerified":true},
  {"id":"custom_1773748812676","name":"Advanced Level 6","start":{"x":65,"y":485},"entities":[{"x":60,"y":480,"w":30,"h":30,"type":"powerup_build","id":"e_1773748768966_b2r2v2cbo"},{"x":30,"y":510,"w":30,"h":30,"type":"ice"},{"x":60,"y":510,"w":30,"h":30,"type":"ice"},{"x":90,"y":510,"w":30,"h":30,"type":"ice"},{"x":90,"y":480,"w":30,"h":30,"type":"ice"},{"x":90,"y":450,"w":30,"h":30,"type":"ice"},{"x":90,"y":420,"w":30,"h":30,"type":"ice"},{"x":90,"y":390,"w":30,"h":30,"type":"ice"},{"x":90,"y":360,"w":30,"h":30,"type":"ice"},{"x":0,"y":510,"w":30,"h":30,"type":"ice"},{"x":0,"y":480,"w":30,"h":30,"type":"hazard"},{"x":0,"y":450,"w":30,"h":30,"type":"ice"},{"x":0,"y":420,"w":30,"h":30,"type":"ice"},{"x":0,"y":390,"w":30,"h":30,"type":"ice"},{"x":0,"y":360,"w":30,"h":30,"type":"ice"},{"x":0,"y":330,"w":30,"h":30,"type":"ice"},{"x":0,"y":300,"w":30,"h":30,"type":"ice"},{"x":90,"y":330,"w":30,"h":30,"type":"ice"},{"x":120,"y":330,"w":30,"h":30,"type":"ice"},{"x":150,"y":330,"w":30,"h":30,"type":"ice"},{"x":0,"y":270,"w":30,"h":30,"type":"ice"},{"x":0,"y":240,"w":30,"h":30,"type":"ice"},{"x":180,"y":330,"w":30,"h":30,"type":"trampoline"},{"x":210,"y":330,"w":30,"h":30,"type":"trampoline"},{"x":150,"y":300,"w":30,"h":30,"type":"powerup_slow_mo","id":"e_1773748837557_mrbpg53nb"},{"x":360,"y":390,"w":30,"h":30,"type":"hazard"},{"x":360,"y":420,"w":30,"h":30,"type":"hazard"},{"x":360,"y":450,"w":30,"h":30,"type":"hazard"},{"x":360,"y":480,"w":30,"h":30,"type":"hazard"},{"x":360,"y":510,"w":30,"h":30,"type":"hazard"},{"x":360,"y":330,"w":30,"h":30,"type":"hazard"},{"x":360,"y":360,"w":30,"h":30,"type":"hazard"},{"x":420,"y":450,"w":30,"h":30,"type":"trampoline"},{"x":450,"y":450,"w":30,"h":30,"type":"trampoline"},{"x":480,"y":450,"w":30,"h":30,"type":"trampoline"},{"x":510,"y":450,"w":30,"h":30,"type":"ice"},{"x":510,"y":420,"w":30,"h":30,"type":"ice"},{"x":510,"y":390,"w":30,"h":30,"type":"ice"},{"x":510,"y":360,"w":30,"h":30,"type":"ice"},{"x":510,"y":330,"w":30,"h":30,"type":"ice"},{"x":510,"y":300,"w":30,"h":30,"type":"ice"},{"x":510,"y":270,"w":30,"h":30,"type":"ice"},{"x":510,"y":240,"w":30,"h":30,"type":"ice"},{"x":510,"y":210,"w":30,"h":30,"type":"ice"},{"x":510,"y":180,"w":30,"h":30,"type":"ice"},{"x":510,"y":150,"w":30,"h":30,"type":"ice"},{"x":510,"y":90,"w":30,"h":30,"type":"ice"},{"x":510,"y":120,"w":30,"h":30,"type":"ice"},{"x":540,"y":90,"w":30,"h":30,"type":"ice"},{"x":570,"y":90,"w":30,"h":30,"type":"ice"},{"x":600,"y":90,"w":30,"h":30,"type":"ice"},{"x":630,"y":90,"w":30,"h":30,"type":"ice"},{"x":660,"y":90,"w":30,"h":30,"type":"ice"},{"x":690,"y":90,"w":30,"h":30,"type":"ice"},{"x":720,"y":90,"w":30,"h":30,"type":"ice"},{"x":750,"y":90,"w":30,"h":30,"type":"ice"},{"x":35,"y":335,"w":20,"h":20,"type":"coin","id":"e_1773748958727_caowkg6m7"},{"x":660,"y":60,"w":30,"h":30,"type":"powerup_hook","id":"e_1773749006054_zqqq9j25u"},{"x":540,"y":120,"w":30,"h":30,"type":"wall"},{"x":600,"y":120,"w":30,"h":30,"type":"wall"},{"x":630,"y":120,"w":30,"h":30,"type":"wall"},{"x":660,"y":120,"w":30,"h":30,"type":"wall"},{"x":690,"y":120,"w":30,"h":30,"type":"wall"},{"x":720,"y":120,"w":30,"h":30,"type":"wall"},{"x":750,"y":120,"w":30,"h":30,"type":"wall"},{"x":570,"y":120,"w":30,"h":30,"type":"wall"},{"x":540,"y":240,"w":30,"h":30,"type":"goal"},{"x":540,"y":270,"w":30,"h":30,"type":"ice"},{"x":570,"y":270,"w":30,"h":30,"type":"ice"},{"x":600,"y":270,"w":30,"h":30,"type":"ice"},{"x":420,"y":480,"w":30,"h":30,"type":"hazard"},{"x":420,"y":510,"w":30,"h":30,"type":"hazard"},{"x":390,"y":480,"w":30,"h":30,"type":"hazard"},{"x":390,"y":510,"w":30,"h":30,"type":"hazard"},{"x":450,"y":510,"w":30,"h":30,"type":"hazard"},{"x":480,"y":510,"w":30,"h":30,"type":"hazard"},{"x":510,"y":510,"w":30,"h":30,"type":"hazard"},{"x":540,"y":510,"w":30,"h":30,"type":"hazard"},{"x":570,"y":510,"w":30,"h":30,"type":"hazard"},{"x":600,"y":510,"w":30,"h":30,"type":"hazard"},{"x":630,"y":510,"w":30,"h":30,"type":"hazard"},{"x":660,"y":510,"w":30,"h":30,"type":"hazard"},{"x":690,"y":510,"w":30,"h":30,"type":"hazard"},{"x":720,"y":510,"w":30,"h":30,"type":"hazard"},{"x":750,"y":510,"w":30,"h":30,"type":"hazard"},{"x":780,"y":510,"w":30,"h":30,"type":"hazard"},{"x":810,"y":510,"w":30,"h":30,"type":"hazard"},{"x":840,"y":510,"w":30,"h":30,"type":"hazard"},{"x":870,"y":510,"w":30,"h":30,"type":"hazard"},{"x":900,"y":510,"w":30,"h":30,"type":"hazard"},{"x":930,"y":510,"w":30,"h":30,"type":"hazard"},{"x":450,"y":480,"w":30,"h":30,"type":"hazard"},{"x":480,"y":480,"w":30,"h":30,"type":"hazard"},{"x":510,"y":480,"w":30,"h":30,"type":"hazard"},{"x":390,"y":450,"w":30,"h":30,"type":"hazard"},{"x":930,"y":30,"w":30,"h":30,"type":"hazard"},{"x":930,"y":60,"w":30,"h":30,"type":"hazard"},{"x":930,"y":90,"w":30,"h":30,"type":"hazard"},{"x":930,"y":120,"w":30,"h":30,"type":"hazard"},{"x":930,"y":150,"w":30,"h":30,"type":"hazard"},{"x":930,"y":180,"w":30,"h":30,"type":"hazard"},{"x":930,"y":210,"w":30,"h":30,"type":"hazard"},{"x":930,"y":240,"w":30,"h":30,"type":"hazard"},{"x":930,"y":270,"w":30,"h":30,"type":"hazard"},{"x":930,"y":300,"w":30,"h":30,"type":"hazard"},{"x":930,"y":330,"w":30,"h":30,"type":"hazard"},{"x":930,"y":360,"w":30,"h":30,"type":"hazard"},{"x":930,"y":390,"w":30,"h":30,"type":"hazard"},{"x":930,"y":420,"w":30,"h":30,"type":"hazard"},{"x":930,"y":450,"w":30,"h":30,"type":"hazard"},{"x":930,"y":480,"w":30,"h":30,"type":"hazard"},{"x":365,"y":95,"w":20,"h":20,"type":"coin","id":"e_1773749106115_cgdpmhahz"},{"x":360,"y":210,"w":30,"h":30,"type":"hazard"},{"x":360,"y":240,"w":30,"h":30,"type":"hazard"},{"x":360,"y":270,"w":30,"h":30,"type":"hazard"},{"x":360,"y":300,"w":30,"h":30,"type":"hazard"},{"x":755,"y":65,"w":20,"h":20,"type":"coin","id":"e_1773749145723_5s9e9pitv"},{"x":455,"y":425,"w":20,"h":20,"type":"coin","id":"e_1773749151498_bjs8lo5m7"},{"x":30,"y":240,"w":30,"h":30,"type":"ice"},{"x":60,"y":240,"w":30,"h":30,"type":"ice"},{"x":90,"y":240,"w":30,"h":30,"type":"ice"},{"x":120,"y":240,"w":30,"h":30,"type":"ice"},{"x":120,"y":60,"w":30,"h":30,"type":"ice"},{"x":120,"y":30,"w":30,"h":30,"type":"ice"},{"x":120,"y":90,"w":30,"h":30,"type":"ice"},{"x":120,"y":120,"w":30,"h":30,"type":"ice"},{"x":120,"y":150,"w":30,"h":30,"type":"ice"},{"x":120,"y":180,"w":30,"h":30,"type":"ice"},{"x":120,"y":210,"w":30,"h":30,"type":"ice"},{"x":120,"y":0,"w":30,"h":30,"type":"ice"},{"x":150,"y":0,"w":30,"h":30,"type":"wall"},{"x":180,"y":0,"w":30,"h":30,"type":"wall"},{"x":210,"y":0,"w":30,"h":30,"type":"wall"},{"x":240,"y":0,"w":30,"h":30,"type":"wall"},{"x":270,"y":0,"w":30,"h":30,"type":"wall"},{"x":300,"y":0,"w":30,"h":30,"type":"wall"},{"x":330,"y":0,"w":30,"h":30,"type":"wall"},{"x":360,"y":0,"w":30,"h":30,"type":"wall"},{"x":390,"y":0,"w":30,"h":30,"type":"wall"},{"x":420,"y":0,"w":30,"h":30,"type":"wall"},{"x":450,"y":0,"w":30,"h":30,"type":"wall"},{"x":480,"y":0,"w":30,"h":30,"type":"wall"},{"x":510,"y":0,"w":30,"h":30,"type":"wall"},{"x":540,"y":0,"w":30,"h":30,"type":"wall"},{"x":570,"y":0,"w":30,"h":30,"type":"wall"},{"x":600,"y":0,"w":30,"h":30,"type":"wall"},{"x":630,"y":0,"w":30,"h":30,"type":"wall"},{"x":660,"y":0,"w":30,"h":30,"type":"wall"},{"x":690,"y":0,"w":30,"h":30,"type":"wall"},{"x":720,"y":0,"w":30,"h":30,"type":"wall"},{"x":750,"y":0,"w":30,"h":30,"type":"wall"},{"x":780,"y":0,"w":30,"h":30,"type":"wall"},{"x":810,"y":0,"w":30,"h":30,"type":"wall"},{"x":840,"y":0,"w":30,"h":30,"type":"wall"},{"x":870,"y":0,"w":30,"h":30,"type":"wall"},{"x":900,"y":0,"w":30,"h":30,"type":"wall"},{"x":930,"y":0,"w":30,"h":30,"type":"wall"},{"x":180,"y":300,"w":30,"h":30,"type":"powerup_double_jump","id":"e_1773749208433_179tlh8sl"},{"x":630,"y":270,"w":30,"h":30,"type":"ice"},{"x":660,"y":270,"w":30,"h":30,"type":"ice"}],"isCustom":true,"isBrawler":false,"allowedAbility":"none","isVerified":true},
  {"id":"custom_1773749959964","name":"Advanced Level 7","start":{"x":95,"y":455},"entities":[{"x":0,"y":0,"w":960,"h":30,"type":"wall"},{"x":0,"y":0,"w":30,"h":540,"type":"wall"},{"x":930,"y":0,"w":30,"h":540,"type":"wall"},{"x":210.5,"y":450.5,"w":29,"h":29,"type":"teleport"},{"x":330.5,"y":90.5,"w":29,"h":29,"type":"teleport"},{"x":30,"y":480,"w":30,"h":30,"type":"wall"},{"x":60,"y":480,"w":30,"h":30,"type":"wall"},{"x":90,"y":480,"w":30,"h":30,"type":"wall"},{"x":120,"y":480,"w":30,"h":30,"type":"wall"},{"x":150,"y":480,"w":30,"h":30,"type":"wall"},{"x":180,"y":480,"w":30,"h":30,"type":"wall"},{"x":210,"y":480,"w":30,"h":30,"type":"wall"},{"x":240,"y":480,"w":30,"h":30,"type":"wall"},{"x":240,"y":450,"w":30,"h":30,"type":"ice"},{"x":240,"y":420,"w":30,"h":30,"type":"ice"},{"x":240,"y":390,"w":30,"h":30,"type":"ice"},{"x":240,"y":360,"w":30,"h":30,"type":"ice"},{"x":240,"y":330,"w":30,"h":30,"type":"ice"},{"x":240,"y":300,"w":30,"h":30,"type":"ice"},{"x":240,"y":270,"w":30,"h":30,"type":"ice"},{"x":240,"y":240,"w":30,"h":30,"type":"ice"},{"x":240,"y":210,"w":30,"h":30,"type":"ice"},{"x":240,"y":180,"w":30,"h":30,"type":"ice"},{"x":240,"y":150,"w":30,"h":30,"type":"ice"},{"x":240,"y":120,"w":30,"h":30,"type":"ice"},{"x":240,"y":90,"w":30,"h":30,"type":"ice"},{"x":240,"y":60,"w":30,"h":30,"type":"ice"},{"x":240,"y":30,"w":30,"h":30,"type":"ice"},{"x":30,"y":450,"w":30,"h":30,"type":"goal"},{"x":330,"y":480,"w":30,"h":30,"type":"trampoline"},{"x":270,"y":480,"w":30,"h":30,"type":"hazard"},{"x":300,"y":480,"w":30,"h":30,"type":"hazard"},{"x":360,"y":480,"w":30,"h":30,"type":"hazard"},{"x":390,"y":480,"w":30,"h":30,"type":"hazard"},{"x":420,"y":480,"w":30,"h":30,"type":"wall"},{"x":420,"y":450,"w":30,"h":30,"type":"ice"},{"x":420,"y":420,"w":30,"h":30,"type":"ice"},{"x":420,"y":390,"w":30,"h":30,"type":"ice"},{"x":420,"y":360,"w":30,"h":30,"type":"ice"},{"x":420,"y":330,"w":30,"h":30,"type":"ice"},{"x":420,"y":300,"w":30,"h":30,"type":"ice"},{"x":420,"y":270,"w":30,"h":30,"type":"ice"},{"x":420,"y":60,"w":30,"h":30,"type":"ice"},{"x":420,"y":30,"w":30,"h":30,"type":"ice"},{"x":420,"y":240,"w":30,"h":30,"type":"slime"},{"x":420,"y":210,"w":30,"h":30,"type":"slime"},{"x":540,"y":360,"w":30,"h":30,"type":"slime"},{"x":540,"y":390,"w":30,"h":30,"type":"slime"},{"x":540,"y":420,"w":30,"h":30,"type":"slime"},{"x":540,"y":300,"w":30,"h":30,"type":"ice"},{"x":540,"y":330,"w":30,"h":30,"type":"ice"},{"x":540,"y":210,"w":30,"h":30,"type":"ice"},{"x":540,"y":240,"w":30,"h":30,"type":"ice"},{"x":540,"y":270,"w":30,"h":30,"type":"ice"},{"x":540,"y":30,"w":30,"h":30,"type":"ice"},{"x":540,"y":60,"w":30,"h":30,"type":"ice"},{"x":540,"y":90,"w":30,"h":30,"type":"ice"},{"x":540,"y":120,"w":30,"h":30,"type":"ice"},{"x":540,"y":150,"w":30,"h":30,"type":"ice"},{"x":540,"y":180,"w":30,"h":30,"type":"ice"},{"x":450,"y":300,"w":30,"h":30,"type":"hazard"},{"x":480,"y":300,"w":30,"h":30,"type":"hazard"},{"x":540,"y":450,"w":30,"h":30,"type":"slime"},{"x":540,"y":480,"w":30,"h":30,"type":"hazard"},{"x":510,"y":480,"w":30,"h":30,"type":"hazard"},{"x":480,"y":480,"w":30,"h":30,"type":"hazard"},{"x":450,"y":480,"w":30,"h":30,"type":"hazard"},{"x":450.5,"y":390.5,"w":29,"h":29,"type":"teleport"},{"x":515,"y":425,"w":20,"h":20,"type":"coin","id":"e_1773750141507_1epow7qnx"},{"x":300,"y":90,"w":30,"h":30,"type":"wall"},{"x":300,"y":60,"w":30,"h":30,"type":"wall"},{"x":330,"y":60,"w":30,"h":30,"type":"wall"},{"x":360,"y":60,"w":30,"h":30,"type":"wall"},{"x":360,"y":90,"w":11,"h":27,"type":"wall"},{"x":270,"y":90,"w":30,"h":30,"type":"wall"},{"x":390,"y":30,"w":30,"h":30,"type":"wall"},{"x":390,"y":60,"w":30,"h":30,"type":"wall"},{"x":360,"y":30,"w":30,"h":30,"type":"wall"},{"x":330,"y":30,"w":30,"h":30,"type":"wall"},{"x":300,"y":30,"w":30,"h":30,"type":"wall"},{"x":270,"y":60,"w":30,"h":30,"type":"wall"},{"x":270,"y":30,"w":30,"h":30,"type":"wall"},{"x":335,"y":455,"w":20,"h":20,"type":"coin","id":"e_1773750190610_zivearx2i"},{"x":570.5,"y":330.5,"w":29,"h":29,"type":"teleport"},{"x":600,"y":300,"w":30,"h":30,"type":"ice"},{"x":600,"y":330,"w":30,"h":30,"type":"ice"},{"x":660,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":690,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":575,"y":455,"w":20,"h":20,"type":"coin","id":"e_1773750285849_49fvc35qx"},{"x":600,"y":270,"w":30,"h":30,"type":"ice"},{"x":575,"y":245,"w":20,"h":20,"type":"coin","id":"e_1773750323570_b4umzhvpl"},{"x":30,"y":390,"w":30,"h":30,"type":"hazard"},{"x":60,"y":390,"w":30,"h":30,"type":"hazard"},{"x":90,"y":390,"w":30,"h":30,"type":"hazard"},{"x":120,"y":390,"w":30,"h":30,"type":"hazard"},{"x":150,"y":390,"w":30,"h":30,"type":"hazard"},{"x":180,"y":390,"w":30,"h":30,"type":"hazard"},{"x":210,"y":390,"w":30,"h":30,"type":"hazard"}],"isCustom":true,"isBrawler":false,"allowedAbility":"none","isVerified":true},
  {"id":"custom_1773750852819","name":"Advanced Level 8","start":{"x":50,"y":450},"entities":[{"x":0,"y":0,"w":30,"h":540,"type":"wall"},{"x":930,"y":0,"w":30,"h":540,"type":"wall"},{"x":30,"y":510,"w":30,"h":30,"type":"ice"},{"x":60,"y":510,"w":30,"h":30,"type":"ice"},{"x":90,"y":510,"w":30,"h":30,"type":"ice"},{"x":120,"y":510,"w":30,"h":30,"type":"ice"},{"x":150,"y":510,"w":30,"h":30,"type":"ice"},{"x":180,"y":510,"w":30,"h":30,"type":"ice"},{"x":210,"y":510,"w":30,"h":30,"type":"ice"},{"x":240,"y":510,"w":30,"h":30,"type":"ice"},{"x":270,"y":510,"w":30,"h":30,"type":"ice"},{"x":300,"y":510,"w":30,"h":30,"type":"ice"},{"x":330,"y":510,"w":30,"h":30,"type":"ice"},{"x":360,"y":510,"w":30,"h":30,"type":"ice"},{"x":390,"y":510,"w":30,"h":30,"type":"ice"},{"x":420,"y":510,"w":30,"h":30,"type":"ice"},{"x":450,"y":510,"w":30,"h":30,"type":"ice"},{"x":480,"y":510,"w":30,"h":30,"type":"ice"},{"x":510,"y":510,"w":30,"h":30,"type":"ice"},{"x":540,"y":510,"w":30,"h":30,"type":"ice"},{"x":570,"y":510,"w":30,"h":30,"type":"ice"},{"x":600,"y":510,"w":30,"h":30,"type":"ice"},{"x":630,"y":510,"w":30,"h":30,"type":"ice"},{"x":660,"y":510,"w":30,"h":30,"type":"ice"},{"x":690,"y":510,"w":30,"h":30,"type":"ice"},{"x":720,"y":510,"w":30,"h":30,"type":"ice"},{"x":750,"y":510,"w":30,"h":30,"type":"ice"},{"x":780,"y":510,"w":30,"h":30,"type":"ice"},{"x":810,"y":510,"w":30,"h":30,"type":"ice"},{"x":840,"y":510,"w":30,"h":30,"type":"ice"},{"x":870,"y":510,"w":30,"h":30,"type":"ice"},{"x":900,"y":510,"w":30,"h":30,"type":"ice"},{"x":90,"y":90,"w":30,"h":30,"type":"ice"},{"x":120,"y":90,"w":30,"h":30,"type":"ice"},{"x":150,"y":90,"w":30,"h":30,"type":"ice"},{"x":180,"y":90,"w":30,"h":30,"type":"hazard"},{"x":180,"y":60,"w":30,"h":30,"type":"hazard"},{"x":180,"y":30,"w":30,"h":30,"type":"hazard"},{"x":180,"y":0,"w":30,"h":30,"type":"hazard"},{"x":270,"y":90,"w":30,"h":30,"type":"ice"},{"x":300,"y":90,"w":30,"h":30,"type":"ice"},{"x":330,"y":90,"w":30,"h":30,"type":"ice"},{"x":360,"y":90,"w":30,"h":30,"type":"hazard"},{"x":360,"y":60,"w":30,"h":30,"type":"hazard"},{"x":360,"y":30,"w":30,"h":30,"type":"hazard"},{"x":360,"y":0,"w":30,"h":30,"type":"hazard"},{"x":450,"y":90,"w":30,"h":30,"type":"ice"},{"x":480,"y":90,"w":30,"h":30,"type":"ice"},{"x":510,"y":90,"w":30,"h":30,"type":"ice"},{"x":540,"y":90,"w":30,"h":30,"type":"hazard"},{"x":540,"y":60,"w":30,"h":30,"type":"hazard"},{"x":540,"y":30,"w":30,"h":30,"type":"hazard"},{"x":540,"y":0,"w":30,"h":30,"type":"hazard"},{"x":630,"y":90,"w":30,"h":30,"type":"ice"},{"x":660,"y":90,"w":30,"h":30,"type":"ice"},{"x":690,"y":90,"w":30,"h":30,"type":"ice"},{"x":720,"y":90,"w":30,"h":30,"type":"ghost_hazard"},{"x":720,"y":60,"w":30,"h":30,"type":"ghost_hazard"},{"x":720,"y":30,"w":30,"h":30,"type":"ghost_hazard"},{"x":720,"y":0,"w":30,"h":30,"type":"ghost_hazard"},{"x":870,"y":90,"w":30,"h":30,"type":"ice"},{"x":900,"y":90,"w":30,"h":30,"type":"ice"},{"x":900,"y":60,"w":30,"h":30,"type":"goal"},{"x":900,"y":120,"w":30,"h":30,"type":"powerup_xray","id":"e_1773750948867_j3yp8om3k"}],"isCustom":true,"isBrawler":false,"allowedAbility":"none","isVerified":true},
  {"id":"custom_1773751101233","name":"Advanced Level 9","start":{"x":35,"y":425},"entities":[{"x":30,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":60,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":90,"y":150,"w":30,"h":30,"type":"ice"},{"x":120,"y":150,"w":30,"h":30,"type":"wall"},{"x":150,"y":150,"w":30,"h":30,"type":"wall"},{"x":90,"y":180,"w":30,"h":30,"type":"ice"},{"x":90,"y":210,"w":30,"h":30,"type":"ice"},{"x":90,"y":240,"w":30,"h":30,"type":"ice"},{"x":90,"y":270,"w":30,"h":30,"type":"ice"},{"x":90,"y":300,"w":30,"h":30,"type":"ice"},{"x":90,"y":330,"w":30,"h":30,"type":"ice"},{"x":90,"y":360,"w":30,"h":30,"type":"ice"},{"x":90,"y":390,"w":30,"h":30,"type":"ice"},{"x":90,"y":420,"w":30,"h":30,"type":"ice"},{"x":90,"y":450,"w":30,"h":30,"type":"ice"},{"x":90,"y":480,"w":30,"h":30,"type":"ice"},{"x":120,"y":510,"w":30,"h":30,"type":"ice"},{"x":90,"y":510,"w":30,"h":30,"type":"ice"},{"x":0,"y":150,"w":30,"h":30,"type":"ice"},{"x":0,"y":180,"w":30,"h":30,"type":"ice"},{"x":0,"y":210,"w":30,"h":30,"type":"ice"},{"x":0,"y":240,"w":30,"h":30,"type":"ice"},{"x":0,"y":270,"w":30,"h":30,"type":"ice"},{"x":0,"y":300,"w":30,"h":30,"type":"ice"},{"x":0,"y":330,"w":30,"h":30,"type":"ice"},{"x":0,"y":360,"w":30,"h":30,"type":"ice"},{"x":0,"y":390,"w":30,"h":30,"type":"ice"},{"x":0,"y":420,"w":30,"h":30,"type":"ice"},{"x":0,"y":450,"w":30,"h":30,"type":"ice"},{"x":0,"y":480,"w":30,"h":30,"type":"ice"},{"x":0,"y":510,"w":30,"h":30,"type":"ice"},{"x":0,"y":120,"w":30,"h":30,"type":"ice"},{"x":0,"y":90,"w":30,"h":30,"type":"ice"},{"x":0,"y":60,"w":30,"h":30,"type":"ice"},{"x":0,"y":30,"w":30,"h":30,"type":"ice"},{"x":0,"y":0,"w":30,"h":30,"type":"ice"},{"x":30,"y":0,"w":30,"h":30,"type":"ice"},{"x":60,"y":0,"w":30,"h":30,"type":"ice"},{"x":90,"y":0,"w":30,"h":30,"type":"ice"},{"x":120,"y":0,"w":30,"h":30,"type":"ice"},{"x":150,"y":0,"w":30,"h":30,"type":"ice"},{"x":180,"y":0,"w":30,"h":30,"type":"ice"},{"x":150,"y":210,"w":30,"h":30,"type":"wall"},{"x":150,"y":240,"w":30,"h":30,"type":"ice"},{"x":150,"y":270,"w":30,"h":30,"type":"ice"},{"x":150,"y":300,"w":30,"h":30,"type":"ice"},{"x":150,"y":330,"w":30,"h":30,"type":"ice"},{"x":150,"y":360,"w":30,"h":30,"type":"ice"},{"x":150,"y":390,"w":30,"h":30,"type":"ice"},{"x":150,"y":420,"w":30,"h":30,"type":"ice"},{"x":150,"y":450,"w":30,"h":30,"type":"ice"},{"x":210,"y":0,"w":30,"h":30,"type":"ice"},{"x":210,"y":30,"w":30,"h":30,"type":"ice"},{"x":210,"y":60,"w":30,"h":30,"type":"ice"},{"x":210,"y":90,"w":30,"h":30,"type":"ice"},{"x":210,"y":120,"w":30,"h":30,"type":"ice"},{"x":210,"y":150,"w":30,"h":30,"type":"ice"},{"x":210,"y":180,"w":30,"h":30,"type":"ice"},{"x":210,"y":210,"w":30,"h":30,"type":"ice"},{"x":125,"y":125,"w":20,"h":20,"type":"coin","id":"e_1773751178014_o5lpigqk6"},{"x":125,"y":485,"w":20,"h":20,"type":"coin","id":"e_1773751180325_lpzm8dic7"},{"x":150,"y":510,"w":30,"h":30,"type":"ice"},{"x":180,"y":510,"w":30,"h":30,"type":"ice"},{"x":210,"y":510,"w":30,"h":30,"type":"ice"},{"x":240,"y":510,"w":30,"h":30,"type":"ice"},{"x":270,"y":510,"w":30,"h":30,"type":"ice"},{"x":300,"y":510,"w":30,"h":30,"type":"ice"},{"x":330,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":180,"y":450,"w":30,"h":30,"type":"ice"},{"x":210,"y":450,"w":30,"h":30,"type":"ice"},{"x":240,"y":450,"w":30,"h":30,"type":"ice"},{"x":270,"y":450,"w":30,"h":30,"type":"ice"},{"x":300,"y":450,"w":30,"h":30,"type":"ice"},{"x":360,"y":510,"w":30,"h":30,"type":"ice"},{"x":360,"y":480,"w":30,"h":30,"type":"ice"},{"x":360,"y":450,"w":30,"h":30,"type":"ice"},{"x":360,"y":420,"w":30,"h":30,"type":"ice"},{"x":360,"y":390,"w":30,"h":30,"type":"ice"},{"x":360,"y":360,"w":30,"h":30,"type":"ice"},{"x":360,"y":330,"w":30,"h":30,"type":"ice"},{"x":360,"y":300,"w":30,"h":30,"type":"ice"},{"x":360,"y":270,"w":30,"h":30,"type":"ice"},{"x":360,"y":240,"w":30,"h":30,"type":"ice"},{"x":300,"y":240,"w":30,"h":30,"type":"ice"},{"x":300,"y":270,"w":30,"h":30,"type":"ice"},{"x":300,"y":300,"w":30,"h":30,"type":"ice"},{"x":300,"y":330,"w":30,"h":30,"type":"ice"},{"x":300,"y":360,"w":30,"h":30,"type":"ice"},{"x":300,"y":390,"w":30,"h":30,"type":"ice"},{"x":300,"y":420,"w":30,"h":30,"type":"ice"},{"x":360,"y":150,"w":30,"h":30,"type":"ice"},{"x":360,"y":180,"w":30,"h":30,"type":"ice"},{"x":360,"y":210,"w":30,"h":30,"type":"ice"},{"x":300,"y":150,"w":30,"h":30,"type":"slime"},{"x":300,"y":180,"w":30,"h":30,"type":"ice"},{"x":300,"y":210,"w":30,"h":30,"type":"ice"},{"x":240,"y":150,"w":30,"h":30,"type":"wall"},{"x":330,"y":90,"w":30,"h":30,"type":"ice"},{"x":360,"y":90,"w":30,"h":30,"type":"ice"},{"x":360,"y":120,"w":30,"h":30,"type":"ice"},{"x":180,"y":240,"w":30,"h":30,"type":"hazard"},{"x":630,"y":180,"w":30,"h":30,"type":"ice"},{"x":630,"y":210,"w":30,"h":30,"type":"ice"},{"x":630,"y":240,"w":30,"h":30,"type":"ice"},{"x":300,"y":90,"w":30,"h":30,"type":"ice"},{"x":270,"y":150,"w":30,"h":30,"type":"wall"},{"x":270,"y":90,"w":30,"h":30,"type":"ice"},{"x":240,"y":30,"w":30,"h":30,"type":"ice"},{"x":270,"y":30,"w":30,"h":30,"type":"ice"},{"x":300,"y":30,"w":30,"h":30,"type":"ice"},{"x":330,"y":30,"w":30,"h":30,"type":"ice"},{"x":360,"y":30,"w":30,"h":30,"type":"ice"},{"x":390,"y":30,"w":30,"h":30,"type":"ice"},{"x":420,"y":30,"w":30,"h":30,"type":"ice"},{"x":450,"y":30,"w":30,"h":30,"type":"ice"},{"x":480,"y":30,"w":30,"h":30,"type":"ice"},{"x":510,"y":30,"w":30,"h":30,"type":"ice"},{"x":540,"y":30,"w":30,"h":30,"type":"ice"},{"x":570,"y":30,"w":30,"h":30,"type":"ice"},{"x":600,"y":30,"w":30,"h":30,"type":"ice"},{"x":630,"y":30,"w":30,"h":30,"type":"ice"},{"x":630,"y":60,"w":30,"h":30,"type":"ice"},{"x":630,"y":90,"w":30,"h":30,"type":"ice"},{"x":630,"y":120,"w":30,"h":30,"type":"ice"},{"x":630,"y":150,"w":30,"h":30,"type":"ice"},{"x":390,"y":90,"w":30,"h":30,"type":"ice"},{"x":420,"y":90,"w":30,"h":30,"type":"ice"},{"x":450,"y":90,"w":30,"h":30,"type":"ice"},{"x":510,"y":90,"w":30,"h":30,"type":"ice"},{"x":540,"y":90,"w":30,"h":30,"type":"ice"},{"x":570,"y":90,"w":30,"h":30,"type":"ice"},{"x":570,"y":360,"w":30,"h":30,"type":"slime"},{"x":570,"y":390,"w":30,"h":30,"type":"slime"},{"x":570,"y":120,"w":30,"h":30,"type":"ice"},{"x":570,"y":150,"w":30,"h":30,"type":"ice"},{"x":570,"y":180,"w":30,"h":30,"type":"ice"},{"x":570,"y":210,"w":30,"h":30,"type":"ice"},{"x":570,"y":240,"w":30,"h":30,"type":"ice"},{"x":570,"y":270,"w":30,"h":30,"type":"ice"},{"x":570,"y":300,"w":30,"h":30,"type":"ice"},{"x":570,"y":330,"w":30,"h":30,"type":"ice"},{"x":540,"y":60,"w":30,"h":30,"type":"powerup_double_jump","id":"e_1773751658479_vo609cek7"},{"x":570,"y":420,"w":30,"h":30,"type":"hazard"},{"x":600,"y":420,"w":30,"h":30,"type":"hazard"},{"x":630,"y":420,"w":30,"h":30,"type":"hazard"},{"x":660,"y":420,"w":30,"h":30,"type":"hazard"},{"x":690,"y":420,"w":30,"h":30,"type":"hazard"},{"x":720,"y":420,"w":30,"h":30,"type":"hazard"},{"x":750,"y":420,"w":30,"h":30,"type":"hazard"},{"x":780,"y":420,"w":30,"h":30,"type":"ice"},{"x":810,"y":420,"w":30,"h":30,"type":"ice"},{"x":840,"y":420,"w":30,"h":30,"type":"ice"},{"x":870,"y":420,"w":30,"h":30,"type":"ice"},{"x":660,"y":240,"w":30,"h":30,"type":"ice"},{"x":690,"y":240,"w":30,"h":30,"type":"ice"},{"x":720,"y":240,"w":30,"h":30,"type":"ice"},{"x":750,"y":240,"w":30,"h":30,"type":"ice"},{"x":780,"y":240,"w":30,"h":30,"type":"ice"},{"x":810,"y":240,"w":30,"h":30,"type":"ice"},{"x":840,"y":240,"w":30,"h":30,"type":"ice"},{"x":870,"y":240,"w":30,"h":30,"type":"ice"},{"x":900,"y":240,"w":30,"h":30,"type":"ice"},{"x":900,"y":270,"w":30,"h":30,"type":"ice"},{"x":900,"y":300,"w":30,"h":30,"type":"ice"},{"x":900,"y":330,"w":30,"h":30,"type":"ice"},{"x":900,"y":360,"w":30,"h":30,"type":"ice"},{"x":900,"y":390,"w":30,"h":30,"type":"ice"},{"x":900,"y":420,"w":30,"h":30,"type":"ice"},{"x":870,"y":390,"w":30,"h":30,"type":"goal"}],"isCustom":true,"isBrawler":false,"allowedAbility":"build","isVerified":true},
  {"id":"custom_1773754347627","name":"Advanced Level 10","start":{"x":425,"y":35},"entities":[{"x":930,"y":0,"w":30,"h":540,"type":"wall"},{"x":450,"y":30,"w":30,"h":30,"type":"wall"},{"x":450,"y":60,"w":30,"h":30,"type":"wall"},{"x":390,"y":60,"w":30,"h":30,"type":"wall"},{"x":420,"y":60,"w":30,"h":30,"type":"wall"},{"x":330,"y":30,"w":30,"h":30,"type":"ice"},{"x":330,"y":60,"w":30,"h":30,"type":"ice"},{"x":330,"y":90,"w":30,"h":30,"type":"ice"},{"x":390,"y":90,"w":30,"h":30,"type":"ice"},{"x":390,"y":120,"w":30,"h":30,"type":"ice"},{"x":330,"y":120,"w":30,"h":30,"type":"ice"},{"x":360,"y":90,"w":30,"h":30,"type":"powerup_xray","id":"e_1773754489853_ealynjamy"},{"x":330,"y":150,"w":30,"h":30,"type":"ice"},{"x":330,"y":180,"w":30,"h":30,"type":"ice"},{"x":330,"y":210,"w":30,"h":30,"type":"ice"},{"x":330,"y":240,"w":30,"h":30,"type":"ice"},{"x":330,"y":270,"w":30,"h":30,"type":"ice"},{"x":330,"y":300,"w":30,"h":30,"type":"ice"},{"x":330,"y":330,"w":30,"h":30,"type":"ice"},{"x":330,"y":360,"w":30,"h":30,"type":"ice"},{"x":330,"y":390,"w":30,"h":30,"type":"ice"},{"x":330,"y":420,"w":30,"h":30,"type":"ice"},{"x":330,"y":450,"w":30,"h":30,"type":"ice"},{"x":390,"y":150,"w":30,"h":30,"type":"ice"},{"x":390,"y":180,"w":30,"h":30,"type":"ice"},{"x":390,"y":210,"w":30,"h":30,"type":"ice"},{"x":390,"y":240,"w":30,"h":30,"type":"ice"},{"x":390,"y":270,"w":30,"h":30,"type":"ice"},{"x":390,"y":300,"w":30,"h":30,"type":"ice"},{"x":390,"y":330,"w":30,"h":30,"type":"ice"},{"x":390,"y":360,"w":30,"h":30,"type":"ice"},{"x":390,"y":390,"w":30,"h":30,"type":"ice"},{"x":390,"y":420,"w":30,"h":30,"type":"ice"},{"x":390,"y":450,"w":30,"h":30,"type":"ice"},{"x":330,"y":480,"w":30,"h":30,"type":"ice"},{"x":330,"y":510,"w":30,"h":30,"type":"ice"},{"x":360,"y":510,"w":30,"h":30,"type":"ice"},{"x":390,"y":510,"w":30,"h":30,"type":"ice"},{"x":420,"y":510,"w":30,"h":30,"type":"ice"},{"x":450,"y":510,"w":30,"h":30,"type":"ice"},{"x":540,"y":390,"w":30,"h":30,"type":"ice"},{"x":570,"y":390,"w":30,"h":30,"type":"ice"},{"x":660,"y":270,"w":30,"h":30,"type":"ice"},{"x":690,"y":270,"w":30,"h":30,"type":"ice"},{"x":780,"y":150,"w":30,"h":30,"type":"fake_ice"},{"x":810,"y":150,"w":30,"h":30,"type":"fake_ice"},{"x":540,"y":150,"w":30,"h":30,"type":"ice"},{"x":570,"y":150,"w":30,"h":30,"type":"ice"},{"x":450,"y":270,"w":30,"h":30,"type":"fake_ice"},{"x":420,"y":270,"w":30,"h":30,"type":"fake_ice"},{"x":900,"y":270,"w":30,"h":30,"type":"ice"},{"x":930,"y":270,"w":30,"h":30,"type":"ice"},{"x":780,"y":390,"w":30,"h":30,"type":"ice"},{"x":810,"y":390,"w":30,"h":30,"type":"ice"},{"x":660,"y":60,"w":30,"h":30,"type":"ice"},{"x":690,"y":60,"w":30,"h":30,"type":"ice"},{"x":660,"y":480,"w":30,"h":30,"type":"fake_ice"},{"x":690,"y":480,"w":30,"h":30,"type":"fake_ice"},{"x":900,"y":60,"w":30,"h":30,"type":"ice"},{"x":930,"y":60,"w":30,"h":30,"type":"ice"},{"x":900,"y":480,"w":30,"h":30,"type":"ice"},{"x":930,"y":480,"w":30,"h":30,"type":"ice"},{"x":330,"y":0,"w":30,"h":30,"type":"wall"},{"x":360,"y":0,"w":30,"h":30,"type":"wall"},{"x":390,"y":0,"w":30,"h":30,"type":"wall"},{"x":420,"y":0,"w":30,"h":30,"type":"wall"},{"x":450,"y":0,"w":30,"h":30,"type":"wall"},{"x":900,"y":0,"w":30,"h":30,"type":"walkthrough_wall"},{"x":870,"y":0,"w":30,"h":30,"type":"wall"},{"x":840,"y":0,"w":30,"h":30,"type":"wall"},{"x":780,"y":0,"w":30,"h":30,"type":"wall"},{"x":720,"y":0,"w":30,"h":30,"type":"wall"},{"x":690,"y":0,"w":30,"h":30,"type":"wall"},{"x":660,"y":0,"w":30,"h":30,"type":"wall"},{"x":630,"y":0,"w":30,"h":30,"type":"wall"},{"x":600,"y":0,"w":30,"h":30,"type":"wall"},{"x":570,"y":0,"w":30,"h":30,"type":"wall"},{"x":540,"y":0,"w":30,"h":30,"type":"wall"},{"x":510,"y":0,"w":30,"h":30,"type":"wall"},{"x":480,"y":0,"w":30,"h":30,"type":"wall"},{"x":750,"y":0,"w":30,"h":30,"type":"wall"},{"x":810,"y":0,"w":30,"h":30,"type":"wall"},{"x":30,"y":0,"w":30,"h":30,"type":"hazard"},{"x":60,"y":0,"w":30,"h":30,"type":"hazard"},{"x":90,"y":0,"w":30,"h":30,"type":"hazard"},{"x":150,"y":0,"w":30,"h":30,"type":"wall"},{"x":120,"y":0,"w":30,"h":30,"type":"wall"},{"x":30,"y":30,"w":30,"h":30,"type":"fake_goal"},{"x":0,"y":0,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":30,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":60,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":90,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":120,"w":30,"h":30,"type":"walkthrough_wall"},{"x":180,"y":0,"w":30,"h":30,"type":"wall"},{"x":210,"y":0,"w":30,"h":30,"type":"wall"},{"x":240,"y":0,"w":30,"h":30,"type":"walkthrough_wall"},{"x":270,"y":0,"w":30,"h":30,"type":"walkthrough_wall"},{"x":300,"y":0,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":150,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":180,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":210,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":240,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":270,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":300,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":330,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":360,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":390,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":420,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":450,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":480,"w":30,"h":30,"type":"walkthrough_wall"},{"x":0,"y":510,"w":30,"h":30,"type":"walkthrough_wall"},{"x":210,"y":30,"w":30,"h":30,"type":"ice"},{"x":210,"y":60,"w":30,"h":30,"type":"ice"},{"x":210,"y":90,"w":30,"h":30,"type":"ice"},{"x":210,"y":120,"w":30,"h":30,"type":"ice"},{"x":180,"y":30,"w":30,"h":30,"type":"slime"},{"x":180,"y":60,"w":30,"h":30,"type":"slime"},{"x":180,"y":90,"w":30,"h":30,"type":"slime"},{"x":180,"y":120,"w":30,"h":30,"type":"slime"},{"x":210,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":240,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":210,"y":150,"w":30,"h":30,"type":"ice"},{"x":180,"y":150,"w":30,"h":30,"type":"slime"},{"x":240,"y":30,"w":30,"h":30,"type":"ghost_hazard"},{"x":270,"y":30,"w":30,"h":30,"type":"ghost_hazard"},{"x":300,"y":30,"w":30,"h":30,"type":"ghost_hazard"},{"x":270,"y":510,"w":30,"h":30,"type":"walkthrough_wall"},{"x":300,"y":510,"w":30,"h":30,"type":"walkthrough_wall"},{"x":300,"y":480,"w":30,"h":30,"type":"fake_goal"},{"x":30,"y":150,"w":30,"h":30,"type":"ice"},{"x":60,"y":150,"w":30,"h":30,"type":"ice"},{"x":60,"y":180,"w":30,"h":30,"type":"ice"},{"x":60,"y":210,"w":30,"h":30,"type":"ice"},{"x":60,"y":240,"w":30,"h":30,"type":"ice"},{"x":60,"y":270,"w":30,"h":30,"type":"ice"},{"x":60,"y":300,"w":30,"h":30,"type":"ice"},{"x":60,"y":330,"w":30,"h":30,"type":"ice"},{"x":60,"y":360,"w":30,"h":30,"type":"ice"},{"x":60,"y":390,"w":30,"h":30,"type":"ice"},{"x":60,"y":420,"w":30,"h":30,"type":"ice"},{"x":60,"y":450,"w":30,"h":30,"type":"ice"},{"x":60,"y":480,"w":30,"h":30,"type":"ice"},{"x":60,"y":510,"w":30,"h":30,"type":"ice"},{"x":30,"y":510,"w":30,"h":30,"type":"goal"},{"x":900,"y":450,"w":30,"h":30,"type":"powerup_double_jump","id":"e_1773755846720_1u4sllrcw"},{"x":210,"y":480,"w":30,"h":30,"type":"powerup_hook","id":"e_1773755925437_o0bg1urv2"}],"isCustom":true,"isBrawler":false,"allowedAbility":"none","isVerified":true}
];

// --- EXPERT (10 Levels) ---
export const EXPERT_LEVELS: LevelData[] = [
  {
    "id":"imported_1773813995339_3_0",
    "name":"Expert Level 1",
    "start":{"x":35,"y":485},
    "entities":[
      {"x":0,"y":0,"w":960,"h":30,"type":"wall"},{"x":930,"y":0,"w":30,"h":540,"type":"wall"},{"x":30,"y":0,"w":30,"h":30,"type":"hazard"},{"x":60,"y":60,"w":30,"h":30,"type":"ice"},{"x":90,"y":60,"w":30,"h":30,"type":"ice"},{"x":120,"y":60,"w":30,"h":30,"type":"ice"},{"x":95,"y":35,"w":20,"h":20,"type":"coin","id":"custom_1770791391644_0.3299256804387647"},{"x":180,"y":30,"w":30,"h":30,"type":"wall"},{"x":180,"y":60,"w":30,"h":30,"type":"wall"},{"x":210,"y":30,"w":30,"h":30,"type":"teleport"},{"x":30,"y":450,"w":30,"h":30,"type":"wall"},{"x":60,"y":450,"w":30,"h":30,"type":"wall"},{"x":90,"y":420,"w":30,"h":30,"type":"slime"},{"x":180,"y":480,"w":30,"h":30,"type":"hazard"},{"x":180,"y":450,"w":30,"h":30,"type":"wall"},{"x":180,"y":420,"w":30,"h":30,"type":"wall"},{"x":180,"y":390,"w":30,"h":30,"type":"wall"},{"x":180,"y":360,"w":30,"h":30,"type":"wall"},{"x":180,"y":330,"w":30,"h":30,"type":"wall"},{"x":150,"y":330,"w":30,"h":30,"type":"wall"},{"x":120,"y":330,"w":30,"h":30,"type":"wall"},{"x":90,"y":330,"w":30,"h":30,"type":"wall"},{"x":90,"y":300,"w":30,"h":30,"type":"wall"},{"x":90,"y":270,"w":30,"h":30,"type":"wall"},{"x":90,"y":240,"w":30,"h":30,"type":"hazard"},{"x":90,"y":210,"w":30,"h":30,"type":"wall"},{"x":90,"y":180,"w":30,"h":30,"type":"wall"},{"x":90,"y":150,"w":30,"h":30,"type":"wall"},{"x":90,"y":120,"w":30,"h":30,"type":"ice"},{"x":0,"y":300,"w":30,"h":30,"type":"wall"},{"x":0,"y":30,"w":30,"h":30,"type":"wall"},{"x":0,"y":60,"w":30,"h":30,"type":"wall"},{"x":0,"y":90,"w":30,"h":30,"type":"wall"},{"x":0,"y":120,"w":30,"h":30,"type":"wall"},{"x":0,"y":150,"w":30,"h":30,"type":"wall"},{"x":0,"y":180,"w":30,"h":30,"type":"wall"},{"x":0,"y":210,"w":30,"h":30,"type":"wall"},{"x":0,"y":240,"w":30,"h":30,"type":"wall"},{"x":0,"y":270,"w":30,"h":30,"type":"wall"},{"x":0,"y":330,"w":30,"h":30,"type":"wall"},{"x":0,"y":360,"w":30,"h":30,"type":"hazard"},{"x":0,"y":420,"w":30,"h":30,"type":"ice"},{"x":0,"y":450,"w":30,"h":30,"type":"wall"},{"x":0,"y":480,"w":30,"h":30,"type":"wall"},{"x":60,"y":420,"w":30,"h":30,"type":"trampoline"},{"x":30,"y":420,"w":30,"h":30,"type":"trampoline"},{"x":900,"y":30,"w":40,"h":40,"type":"goal"},{"x":150,"y":510,"w":30,"h":30,"type":"hazard"},{"x":90,"y":450,"w":30,"h":30,"type":"wall"},{"x":125,"y":185,"w":20,"h":20,"type":"coin","id":"custom_1770791734616_0.25185045945813334"},{"x":120,"y":150,"w":30,"h":30,"type":"wall"},{"x":150,"y":150,"w":30,"h":30,"type":"wall"},{"x":180,"y":150,"w":30,"h":30,"type":"wall"},{"x":120,"y":120,"w":30,"h":30,"type":"ice"},{"x":150,"y":120,"w":30,"h":30,"type":"wall"},{"x":180,"y":120,"w":30,"h":30,"type":"wall"},{"x":210,"y":240,"w":30,"h":30,"type":"slime"},{"x":210,"y":270,"w":30,"h":30,"type":"wall"},{"x":210,"y":300,"w":30,"h":30,"type":"wall"},{"x":210,"y":330,"w":30,"h":30,"type":"wall"},{"x":0,"y":510,"w":30,"h":30,"type":"wall"},{"x":30,"y":510,"w":30,"h":30,"type":"wall"},{"x":60,"y":510,"w":30,"h":30,"type":"wall"},{"x":90,"y":510,"w":30,"h":30,"type":"wall"},{"x":180,"y":510,"w":30,"h":30,"type":"wall"},{"x":120,"y":510,"w":30,"h":30,"type":"slime"},{"x":480,"y":510,"w":30,"h":30,"type":"ice"},{"x":480,"y":480,"w":30,"h":30,"type":"ice"},{"x":480,"y":450,"w":30,"h":30,"type":"ice"},{"x":480,"y":390,"w":30,"h":30,"type":"ice"},{"x":480,"y":360,"w":30,"h":30,"type":"ice"},{"x":480,"y":330,"w":30,"h":30,"type":"ice"},{"x":480,"y":300,"w":30,"h":30,"type":"wall"},{"x":480,"y":270,"w":30,"h":30,"type":"wall"},{"x":480,"y":240,"w":30,"h":30,"type":"wall"},{"x":480,"y":210,"w":30,"h":30,"type":"wall"},{"x":480,"y":180,"w":30,"h":30,"type":"ice"},{"x":480,"y":420,"w":30,"h":30,"type":"ice"},{"x":210,"y":510,"w":30,"h":30,"type":"ice"},{"x":330,"y":390,"w":30,"h":30,"type":"wall"},{"x":360,"y":390,"w":30,"h":30,"type":"wall"},{"x":330,"y":240,"w":30,"h":30,"type":"hazard"},{"x":330,"y":90,"w":30,"h":30,"type":"hazard"},{"x":630,"y":90,"w":30,"h":30,"type":"hazard"},{"x":510,"y":450,"w":30,"h":30,"type":"slime"},{"x":215,"y":485,"w":20,"h":20,"type":"coin","id":"custom_1770812886657_0.6136974656546774"},{"x":515,"y":425,"w":20,"h":20,"type":"coin","id":"custom_1770812887228_0.12869769843603385"},{"x":690,"y":30,"w":30,"h":30,"type":"wall"},{"x":690,"y":60,"w":30,"h":30,"type":"wall"},{"x":690,"y":90,"w":30,"h":30,"type":"wall"},{"x":690,"y":120,"w":30,"h":30,"type":"wall"},{"x":690,"y":150,"w":30,"h":30,"type":"wall"},{"x":900,"y":60,"w":30,"h":30,"type":"wall"},{"x":870,"y":60,"w":30,"h":30,"type":"wall"},{"x":840,"y":60,"w":30,"h":30,"type":"wall"},{"x":810,"y":60,"w":30,"h":30,"type":"wall"},{"x":750,"y":0,"w":30,"h":30,"type":"hazard"},{"x":725,"y":35,"w":20,"h":20,"type":"coin","id":"custom_1770812941472_0.5603425747990248"},{"x":750,"y":150,"w":30,"h":30,"type":"ice"},{"x":780,"y":150,"w":30,"h":30,"type":"ice"},{"x":810,"y":150,"w":30,"h":30,"type":"ice"},{"x":840,"y":240,"w":30,"h":30,"type":"wall"},{"x":870,"y":240,"w":30,"h":30,"type":"wall"},{"x":900,"y":240,"w":30,"h":30,"type":"teleport"},{"x":660,"y":330,"w":30,"h":30,"type":"ice"},{"x":690,"y":330,"w":30,"h":30,"type":"ice"},{"x":600,"y":510,"w":30,"h":30,"type":"trampoline"},{"x":480,"y":150,"w":30,"h":30,"type":"slime"},{"x":480,"y":0,"w":30,"h":30,"type":"hazard"},{"x":510,"y":180,"w":30,"h":30,"type":"hazard"},{"x":720,"y":330,"w":30,"h":30,"type":"ice"}
    ],
    "isCustom":true,
    "isBrawler":false,
    "allowedAbility":"none",
    "isVerified":true
  },
{
  "id": "expert_2",
  "name": "Expert Level 2",
  "start": {
    "x": 35,
    "y": 425
  },
  "width": 960,
  "height": 540,
  "entities": [
    {
      "type": "trampoline",
      "x": 30,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "coin",
      "x": 95,
      "y": 65,
      "w": 20,
      "h": 20,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770883450534_0.03752070237397709",
      "opacity": 1
    },
    {
      "type": "ice",
      "x": 120,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 120,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "teleport",
      "x": 151,
      "y": 451,
      "w": 29,
      "h": 29
    },
    {
      "type": "hazard",
      "x": 180,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 180,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 150,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 270,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 300,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 330,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_hook",
      "x": 300,
      "y": 210,
      "w": 30,
      "h": 30,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770883686670_0.4625652464253678",
      "opacity": 1
    },
    {
      "type": "ice",
      "x": 480,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 480,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 480,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 480,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 480,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 480,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 390,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 420,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 450,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "coin",
      "x": 485,
      "y": 65,
      "w": 20,
      "h": 20,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770883732032_0.5946239744885766",
      "opacity": 1
    },
    {
      "type": "hazard",
      "x": 152,
      "y": 150,
      "w": 55,
      "h": 59
    },
    {
      "type": "hazard",
      "x": 240,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 540,
      "y": 30,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 540,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 540,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 540,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 540,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 540,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 540,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 540,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 510,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_build",
      "x": 510,
      "y": 270,
      "w": 30,
      "h": 30,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770884364180_0.3542434810634886",
      "opacity": 1
    },
    {
      "type": "ice",
      "x": 540,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 390,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 330,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 300,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "teleport",
      "x": 271,
      "y": 331,
      "w": 29,
      "h": 29
    },
    {
      "type": "wall",
      "x": 0,
      "y": 30,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 0,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 0,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 0,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 0,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 0,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 0,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 0,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 0,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 0,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 270,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 300,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 300,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 270,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 300,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_double_jump",
      "x": 270,
      "y": 300,
      "w": 30,
      "h": 30,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770884565098_0.6661090946625035",
      "opacity": 1
    },
    {
      "type": "ice",
      "x": 930,
      "y": 30,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 30,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "teleport",
      "x": 901,
      "y": 31,
      "w": 29,
      "h": 29
    },
    {
      "type": "wall",
      "x": 810,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 840,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "slime",
      "x": 240,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "coin",
      "x": 905,
      "y": 455,
      "w": 20,
      "h": 20,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770885057357_0.855320721239353",
      "opacity": 1
    },
    {
      "type": "powerup_build",
      "x": 810,
      "y": 480,
      "w": 30,
      "h": 30,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770885073138_0.8530416717789691",
      "opacity": 1
    },
    {
      "type": "ice",
      "x": 780,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_build",
      "x": 840,
      "y": 330,
      "w": 30,
      "h": 30,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770885093373_0.2613575214084676",
      "opacity": 1
    },
    {
      "type": "slime",
      "x": 750,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "slime",
      "x": 750,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 750,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 750,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "slime",
      "x": 750,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 720,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 750,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 30,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 690,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "coin",
      "x": 755,
      "y": 65,
      "w": 20,
      "h": 20,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770885153608_0.5282889882881142",
      "opacity": 1
    },
    {
      "type": "trampoline",
      "x": 660,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 630,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 630,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 630,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 630,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 630,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 630,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_hook",
      "x": 630,
      "y": 60,
      "w": 30,
      "h": 30,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770885178937_0.18346278829856688",
      "opacity": 1
    },
    {
      "type": "teleport",
      "x": 751,
      "y": 301,
      "w": 29,
      "h": 29
    },
    {
      "type": "ice",
      "x": 660,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 720,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 750,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 540,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 540,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 540,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 540,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 540,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 540,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 570,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 600,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 630,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "goal",
      "x": 720,
      "y": 390,
      "w": 40,
      "h": 40
    },
    {
      "type": "teleport",
      "x": 271,
      "y": 421,
      "w": 29,
      "h": 29
    },
    {
      "type": "slime",
      "x": 270,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 300,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 300,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 420,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 420,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 420,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 420,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 420,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 300,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 330,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 360,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 390,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 480,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 480,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 510,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 540,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 570,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 600,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 630,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 660,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "trampoline",
      "x": 720,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 750,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 150,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 180,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_double_jump",
      "x": 180,
      "y": 90,
      "w": 30,
      "h": 30,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770885492611_0.8552056173317547",
      "opacity": 1
    },
    {
      "type": "teleport",
      "x": 181,
      "y": 31,
      "w": 29,
      "h": 29
    },
    {
      "type": "ice",
      "x": 210,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 210,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 210,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 210,
      "y": 30,
      "w": 30,
      "h": 30
    },
    {
      "type": "checkpoint",
      "x": 780,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 0,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 30,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 60,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 90,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 150,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 180,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 210,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 240,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 270,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 240,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 270,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 300,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 330,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 360,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 390,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 420,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 450,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 480,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 510,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 540,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 570,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 600,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 630,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 660,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 690,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 720,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 750,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 780,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 810,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 840,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 870,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 900,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 930,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "coin",
      "x": 395,
      "y": 365,
      "w": 20,
      "h": 20,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "custom_1770887407363_0.6864859367548961",
      "opacity": 1
    }
  ],
  "allowedAbility": "none",
  "autoScroll": false,
  "autoScrollSpeed": 150,
  "isBrawler": false,
  "isVerified": true
},
{
  "id": "expert_3",
  "name": "Expert Level 3",
  "start": {
    "x": 395,
    "y": 425
  },
  "width": 960,
  "height": 540,
  "entities": [
    {
      "type": "ice",
      "x": 450,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 30,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "slime",
      "x": 450,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "slime",
      "x": 450,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 450,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "trampoline",
      "x": 390,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_slow_mo",
      "x": 390,
      "y": 270,
      "w": 30,
      "h": 30,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771018657035_iosac90s8",
      "opacity": 1
    },
    {
      "type": "ice",
      "x": 360,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ghost_hazard",
      "x": 360,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 420,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 420,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 420,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 390,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 360,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_double_jump",
      "x": 330,
      "y": 270,
      "w": 30,
      "h": 30,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771019093068_1sx5zy03i",
      "opacity": 1
    },
    {
      "type": "hazard",
      "x": 330,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 330,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 300,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 270,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 300,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "teleport",
      "x": 271,
      "y": 91,
      "w": 29,
      "h": 29
    },
    {
      "type": "ice",
      "x": 240,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 270,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 300,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 330,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 390,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 420,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "coin",
      "x": 335,
      "y": 155,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771019208482_c4wt9uskq",
      "opacity": 1
    },
    {
      "type": "coin",
      "x": 275,
      "y": 485,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771019211745_2c77yj8q5",
      "opacity": 1
    },
    {
      "type": "coin",
      "x": 275,
      "y": 125,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771019212328_md1irhe0u",
      "opacity": 1
    },
    {
      "type": "coin",
      "x": 395,
      "y": 155,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771019214864_huw0ajjeb",
      "opacity": 1
    },
    {
      "type": "teleport",
      "x": 421,
      "y": 31,
      "w": 29,
      "h": 29
    },
    {
      "type": "ice",
      "x": 420,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 390,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 360,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 330,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 300,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 270,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 240,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_hook",
      "x": 360,
      "y": 30,
      "w": 30,
      "h": 30,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771019235988_5px98hr0a",
      "opacity": 1
    },
    {
      "type": "hazard",
      "x": 210,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 180,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 150,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 30,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 120,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 0,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "teleport",
      "x": 1,
      "y": 331,
      "w": 29,
      "h": 29
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "coin",
      "x": 185,
      "y": 245,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771019358108_gqs9ottb7",
      "opacity": 1
    },
    {
      "type": "coin",
      "x": 35,
      "y": 335,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771019384995_hvjfo648d",
      "opacity": 1
    },
    {
      "type": "hazard",
      "x": 90,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 60,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 30,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 0,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 0,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "teleport",
      "x": 481,
      "y": 1,
      "w": 29,
      "h": 29
    },
    {
      "type": "ice",
      "x": 450,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_build",
      "x": 480,
      "y": 150,
      "w": 30,
      "h": 30,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771019485626_od4h8e1mh",
      "opacity": 1
    },
    {
      "type": "coin",
      "x": 485,
      "y": 35,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771019490883_c3ne9129o",
      "opacity": 1
    },
    {
      "type": "slime",
      "x": 630,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 510,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 600,
      "y": 30,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 600,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 690,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 720,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "wall",
      "x": 750,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "checkpoint",
      "x": 720,
      "y": 30,
      "w": 30,
      "h": 30
    },
    {
      "type": "coin",
      "x": 695,
      "y": 35,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771020349504_mx61kj83q",
      "opacity": 1
    },
    {
      "type": "hazard",
      "x": 750,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 720,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 780,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 810,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 840,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 870,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 900,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 930,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 540,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 570,
      "y": 0,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 630,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 600,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 570,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 540,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 510,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 480,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 480,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 510,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 540,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "walkthrough_wall",
      "x": 630,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_slow_mo",
      "x": 270,
      "y": 210,
      "w": 30,
      "h": 30,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771020563320_onj5cu0l5",
      "opacity": 1
    },
    {
      "type": "ice",
      "x": 780,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 840,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 30,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 60,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_slow_mo",
      "x": 900,
      "y": 60,
      "w": 30,
      "h": 30,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771020714981_7jexmmz9m",
      "opacity": 1
    },
    {
      "type": "powerup_build",
      "x": 750,
      "y": 30,
      "w": 30,
      "h": 30,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771020729199_elkepeq93",
      "opacity": 1
    },
    {
      "type": "ice",
      "x": 870,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 930,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 870,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "trampoline",
      "x": 840,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 750,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 90,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 120,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_hook",
      "x": 750,
      "y": 90,
      "w": 30,
      "h": 30,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771020858228_eg75udagc",
      "opacity": 1
    },
    {
      "type": "ice",
      "x": 810,
      "y": 150,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 180,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 210,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 270,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 330,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 360,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 390,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 420,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 450,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 810,
      "y": 480,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 810,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 720,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 750,
      "y": 240,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 780,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 750,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 720,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 690,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 660,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 630,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 600,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 570,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 540,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "ice",
      "x": 510,
      "y": 300,
      "w": 30,
      "h": 30
    },
    {
      "type": "powerup_remover",
      "x": 840,
      "y": 480,
      "w": 30,
      "h": 30,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771020980551_gr4f8aqkg",
      "opacity": 1
    },
    {
      "type": "hazard",
      "x": 480,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 510,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 540,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 570,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 600,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 630,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 660,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 690,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 720,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 750,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "hazard",
      "x": 780,
      "y": 510,
      "w": 30,
      "h": 30
    },
    {
      "type": "goal",
      "x": 720,
      "y": 420,
      "w": 40,
      "h": 40
    },
    {
      "type": "powerup_slow_mo",
      "x": 480,
      "y": 480,
      "w": 30,
      "h": 30,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771021052103_lvu05cmbc",
      "opacity": 1
    },
    {
      "type": "powerup_hook",
      "x": 480,
      "y": 300,
      "w": 30,
      "h": 30,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771021077620_b0dsqomj8",
      "opacity": 1
    },
    {
      "type": "coin",
      "x": 785,
      "y": 95,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771021094463_bgqfl07ji",
      "opacity": 1
    },
    {
      "type": "coin",
      "x": 845,
      "y": 455,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771021097910_ihm6cnzjd",
      "opacity": 1
    },
    {
      "type": "coin",
      "x": 485,
      "y": 275,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771021100306_a1mstn4d9",
      "opacity": 1
    },
    {
      "type": "coin",
      "x": 485,
      "y": 455,
      "w": 20,
      "h": 20,
      "movingH": false,
      "moveRange": 100,
      "moveSpeed": 0.002,
      "id": "e_1771021103239_inhnscg1f",
      "opacity": 1
    }
  ],
  "allowedAbility": "none",
  "autoScroll": false,
  "autoScrollSpeed": 150,
  "isBrawler": false,
  "isVerified": true
},
{
  "id": "expert_4",
  "name": "Expert Level 4",
  "start": {
    "x": 875,
    "y": 35
  },
  "width": 960,
  "height": 540,
  "entities": [
    {
      "x": 870,
      "y": 510,
      "w": 30,
      "h": 30,
      "type": "trampoline"
    },
    {
      "x": 900,
      "y": 510,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 840,
      "y": 510,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 840,
      "y": 60,
      "w": 30,
      "h": 30,
      "type": "ice"
    },
    {
      "x": 900,
      "y": 60,
      "w": 30,
      "h": 30,
      "type": "ice"
    },
    {
      "x": 900,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "ice"
    },
    {
      "x": 900,
      "y": 30,
      "w": 30,
      "h": 30,
      "type": "ice"
    },
    {
      "x": 840,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "ice"
    },
    {
      "x": 840,
      "y": 30,
      "w": 30,
      "h": 30,
      "type": "ice"
    },
    {
      "x": 870,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "ice"
    },
    {
      "x": 930,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 810,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 780,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 750,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 720,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 690,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 660,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 630,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 600,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 750,
      "y": 240,
      "w": 30,
      "h": 30,
      "type": "block_dash"
    },
    {
      "x": 600,
      "y": 240,
      "w": 30,
      "h": 30,
      "type": "block_dash"
    },
    {
      "x": 450,
      "y": 240,
      "w": 30,
      "h": 30,
      "type": "block_dash"
    },
    {
      "x": 450,
      "y": 240,
      "w": 330,
      "h": 28,
      "type": "gravity_zero"
    },
    {
      "x": 420,
      "y": 240,
      "w": 30,
      "h": 30,
      "type": "block_gravity"
    },
    {
      "x": 150,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 180,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 210,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 300,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "wall"
    },
    {
      "x": 330,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 360,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 390,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 420,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 240,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 270,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "wall"
    },
    {
      "x": 305,
      "y": 35,
      "w": 20,
      "h": 20,
      "type": "coin",
      "id": "e_1776745666222_1tqxv6ccm"
    },
    {
      "x": 515,
      "y": 245,
      "w": 20,
      "h": 20,
      "type": "coin",
      "id": "e_1776745668240_9i4p1anya"
    },
    {
      "x": 665,
      "y": 245,
      "w": 20,
      "h": 20,
      "type": "coin",
      "id": "e_1776745668998_9p5z6j7n1"
    },
    {
      "x": 450,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "trampoline"
    },
    {
      "x": 480,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "trampoline"
    },
    {
      "x": 455,
      "y": 35,
      "w": 20,
      "h": 20,
      "type": "coin",
      "id": "e_1776745726008_xkt05v1od"
    },
    {
      "x": 360,
      "y": 30,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 390,
      "y": 30,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 390,
      "y": 60,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 360,
      "y": 60,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 240,
      "y": 30,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 240,
      "y": 60,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 240,
      "y": 90,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 240,
      "y": 120,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 240,
      "y": 150,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 270,
      "y": 150,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 270,
      "y": 180,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 300,
      "y": 180,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 300,
      "y": 210,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 300,
      "y": 270,
      "w": 30,
      "h": 30,
      "type": "wall"
    },
    {
      "x": 270,
      "y": 270,
      "w": 30,
      "h": 30,
      "type": "wall"
    },
    {
      "x": 240,
      "y": 270,
      "w": 30,
      "h": 30,
      "type": "slime"
    },
    {
      "x": 210,
      "y": 270,
      "w": 30,
      "h": 30,
      "type": "slime"
    },
    {
      "x": 360,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 390,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 420,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 450,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 480,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 510,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 540,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 570,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 600,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 630,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 660,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 690,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 720,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 750,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 780,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 810,
      "y": 330,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 810,
      "y": 360,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 810,
      "y": 390,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 810,
      "y": 420,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 810,
      "y": 450,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 810,
      "y": 480,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 810,
      "y": 510,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 330,
      "y": 300,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 510,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 540,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 570,
      "y": 0,
      "w": 30,
      "h": 30,
      "type": "hazard"
    },
    {
      "x": 180,
      "y": 360,
      "w": 30,
      "h": 30,
      "type": "block_gravity"
    },
    {
      "x": 240,
      "y": 240,
      "w": 30,
      "h": 30,
      "type": "checkpoint"
    },
    {
      "x": 330,
      "y": 390,
      "w": 330,
      "h": 30,
      "type": "gravity_zero"
    },
    {
      "x": 330,
      "y": 390,
      "w": 30,
      "h": 30,
      "type": "block_dash"
    },
    {
      "x": 480,
      "y": 390,
      "w": 30,
      "h": 30,
      "type": "block_dash"
    },
    {
      "x": 630,
      "y": 390,
      "w": 30,
      "h": 30,
      "type": "block_dash"
    },
    {
      "x": 750,
      "y": 420,
      "w": 17,
      "h": 70,
      "type": "goal",
      "movingV": true,
      "movingH": false,
      "moveRange": 66
    },
    {
      "x": 245,
      "y": 305,
      "w": 20,
      "h": 20,
      "type": "coin",
      "id": "e_1776746083754_qxm9clbsa"
    },
    {
      "x": 425,
      "y": 395,
      "w": 20,
      "h": 20,
      "type": "coin",
      "id": "e_1776746088793_vnn7k27tq"
    },
    {
      "x": 575,
      "y": 395,
      "w": 20,
      "h": 20,
      "type": "coin",
      "id": "e_1776746089408_6ak45pd85"
    },
    {
      "x": 600,
      "y": 390,
      "w": 30,
      "h": 30,
      "type": "block_gravity"
    }
  ],
  "allowedAbility": "none",
  "autoScroll": false,
  "autoScrollSpeed": 150,
  "isBrawler": false,
  "isVerified": true
},
decompressLevel('{"v":1,"n":"Expert Level 5","s":[695,485],"dim":[960,540],"e":[[1,0,510,30,30],[9,450,30,30,30],[9,450,60,30,30],[9,450,150,30,30],[9,450,180,30,30],[9,450,270,30,30],[9,450,390,30,30],[9,450,420,30,30],[9,450,450,30,30],[9,450,480,30,30],[9,450,360,30,30],[9,450,330,30,30],[9,450,300,30,30],[9,450,240,30,30],[9,450,210,30,30],[9,450,120,30,30],[9,450,90,30,30],[42,255,30,421,481,1,230,3,"",100],[9,30,0,30,30],[9,60,0,30,30],[1,90,0,30,30],[1,120,0,30,30],[1,150,0,30,30],[1,180,0,30,30],[1,210,0,30,30],[1,240,0,30,30],[1,270,0,30,30],[1,300,0,30,30],[1,330,0,30,30],[1,360,0,30,30],[1,390,0,30,30],[1,510,0,28,28],[1,540,0,30,30],[1,570,0,30,30],[1,600,0,30,30],[1,630,0,30,30],[1,660,0,30,30],[1,690,0,30,30],[1,720,0,30,30],[1,750,0,30,30],[1,780,0,30,30],[1,810,0,30,30],[1,840,0,30,30],[1,870,0,30,30],[1,900,0,30,30],[1,450,0,30,30],[1,420,0,30,30],[1,480,0,30,30],[9,0,0,30,30],[9,0,30,30,30],[1,0,60,30,30],[1,0,90,30,30],[1,0,120,30,30],[1,0,150,30,30],[1,0,180,30,30],[1,0,210,30,30],[1,0,240,30,30],[1,0,270,30,30],[1,0,300,30,30],[1,0,330,30,30],[1,0,360,30,30],[1,0,390,30,30],[1,0,420,30,30],[1,0,450,30,30],[1,0,480,30,30],[1,930,480,30,30],[1,930,450,30,30],[1,930,420,30,30],[1,930,390,30,30],[1,930,360,30,30],[1,930,330,30,30],[1,930,300,30,30],[1,930,270,30,30],[1,930,240,30,30],[1,930,210,30,30],[9,930,180,30,30],[9,930,150,30,30],[1,930,120,30,30],[1,930,90,30,30],[1,930,60,30,30],[1,930,30,30,30],[1,930,0,30,30],[18,600,360,30,30],[18,630,360,30,30],[15,510,120,30,30,0,100,20,"e_1777019236949_p2690o53q",100],[0,510,1,30,30],[0,870,210,30,30],[0,900,210,30,30],[1,511,0,28,28],[12,901,181,29,29],[5,875,185,20,20,0,100,20,"e_1777019507031_n6p8g8gvq",100],[12,31,31,29,29],[9,60,30,30,30],[9,60,60,30,30],[9,60,90,30,30],[9,60,120,30,30],[9,60,150,30,30],[15,30,90,30,30,0,100,20,"e_1777019554435_iy255lwit",100],[43,120,240,30,30],[2,240,30,38,17,1,150,14,"",100],[5,245,245,20,20,0,100,20,"e_1777019681009_pvy6kya0v",100],[1,90,150,30,30],[1,120,150,30,30],[1,150,150,30,30],[1,180,150,30,30],[1,210,150,30,30],[0,30,510,30,30],[0,90,510,30,30],[1,120,510,30,30],[0,150,510,30,30],[0,180,510,30,30],[0,210,510,30,30],[0,240,510,30,30],[0,270,510,30,30],[0,300,510,30,30],[0,330,510,30,30],[0,360,510,30,30],[0,390,510,30,30],[0,420,510,30,30],[0,450,510,30,30],[0,480,510,30,30],[0,510,510,30,30],[0,540,510,30,30],[0,570,510,30,30],[0,600,510,30,30],[0,630,510,30,30],[0,660,510,30,30],[0,690,510,30,30],[0,720,510,30,30],[0,750,510,30,30],[0,780,510,30,30],[0,810,510,30,30],[0,840,510,30,30],[0,870,510,30,30],[0,900,510,30,30],[0,930,510,30,30],[0,60,510,30,30],[1,120,330,30,30],[1,120,360,30,30],[1,120,390,30,30],[1,120,420,30,30],[1,120,450,30,30],[1,120,480,30,30],[44,210,240,30,30],[18,750,300,30,30],[18,780,300,30,30],[0,240,150,30,30]],"a":0,"sc":0,"ss":150,"ib":0}', false) as LevelData,
  ...generateLevelSequence(7, 'exp', 4)
];

// --- GOD (10 Levels) ---
export const GOD_LEVELS: LevelData[] = [
  { ...decompressLevel('{"v":1,"n":"God Level 1","s":[935,5],"dim":[960,540],"e":[[10,930,510,30,30],[11,810,240,30,30],[1,810,210,30,30],[1,810,180,30,30],[11,810,150,30,30],[1,810,120,30,30],[1,810,90,30,30],[11,810,60,30,30],[9,900,210,30,30],[9,900,180,30,30],[9,900,150,30,30],[9,900,120,30,30],[9,900,90,30,30],[9,900,60,30,30],[9,900,30,30,30],[9,900,0,30,30],[9,780,60,30,30],[9,750,60,30,30],[9,720,60,30,30],[9,360,60,30,30],[15,750,30,30,30,0,100,20,"custom_1770962627273_0.24382074397045705",100],[9,300,-20,30,50],[9,300,30,30,30],[9,300,60,30,30],[9,300,90,30,30],[1,300,120,30,30],[1,300,150,30,30],[1,300,180,30,30],[1,360,90,30,30],[1,360,120,30,30],[1,360,150,30,30],[1,360,180,30,30],[1,360,210,30,30],[1,360,240,30,30],[1,300,210,30,30],[1,300,240,30,30],[10,330,240,30,30],[9,690,60,30,30],[9,420,60,30,30],[1,450,60,30,30],[1,480,60,30,30],[1,510,60,30,30],[1,540,60,30,30],[1,570,60,30,30],[1,600,60,30,30],[1,630,60,30,30],[1,660,60,30,30],[12,391,61,29,29],[1,810,270,30,30],[1,840,300,30,30],[1,870,360,30,30],[1,900,420,30,30],[1,900,450,30,30],[1,900,480,30,30],[1,900,510,30,30],[9,420,30,30,30],[1,420,0,30,30],[12,751,91,29,29],[9,720,90,30,30],[9,780,90,30,30],[9,780,120,30,30],[9,780,150,30,30],[9,780,180,30,30],[11,780,210,30,30],[14,750,150,30,30,0,100,20,"custom_1770963170974_0.46663860105400545",100],[1,840,330,30,30],[1,870,390,30,30],[11,510,210,30,30],[0,540,210,30,30],[0,570,210,30,30],[0,600,90,30,30],[1,450,180,30,30],[1,450,210,30,30],[9,390,90,30,30],[9,390,120,30,30],[9,390,150,30,30],[9,390,180,30,30],[9,390,210,30,30],[9,390,240,30,30],[1,420,90,30,30],[1,450,90,30,30],[1,480,90,30,30],[1,510,90,30,30],[1,540,90,30,30],[1,570,90,30,30],[1,630,90,30,30],[1,660,90,30,30],[1,690,90,30,30],[1,480,210,30,30],[13,420,120,30,30,0,100,20,"custom_1770963510596_0.9367766130020746",100],[16,540,180,30,30],[9,450,300,30,30],[9,480,300,30,30],[1,450,240,30,30],[9,390,270,30,30],[9,390,300,30,30],[1,420,330,30,30],[13,480,270,30,30,0,100,20,"custom_1770963804537_0.518723988804803",100],[9,600,390,30,30],[9,630,390,30,30],[9,660,390,30,30],[1,600,300,30,30],[1,630,330,30,30],[1,660,330,30,30],[1,690,330,30,30],[1,540,240,30,30],[1,570,270,30,30],[1,570,240,30,30],[1,480,240,30,30],[1,510,240,30,30],[1,510,330,30,30],[1,570,390,30,30],[1,540,360,30,30],[9,660,450,30,30],[9,630,450,30,30],[9,600,450,30,30],[1,720,330,30,30],[1,750,360,30,30],[1,750,390,30,30],[1,750,420,30,30],[1,750,450,30,30],[1,720,480,30,30],[1,690,480,30,30],[17,630,420,30,30,0,100,20,"custom_1770964021422_0.15976294029708737",100],[1,390,330,30,30],[1,450,330,30,30],[1,480,330,30,30],[9,570,450,30,30],[9,540,450,30,30],[11,510,450,30,30],[1,480,450,30,30],[1,480,420,30,30],[1,450,450,30,30],[0,420,450,30,30],[0,390,450,30,30],[0,360,450,30,30],[1,330,450,30,30],[1,330,420,30,30],[1,300,450,30,30],[1,330,390,30,30],[1,300,390,30,30],[1,300,420,30,30],[1,270,420,30,30],[1,270,450,30,30],[11,210,360,30,30],[1,210,420,30,30],[1,210,450,30,30],[1,210,480,30,30],[1,210,0,30,30],[1,210,30,30,30],[1,210,60,30,30],[1,210,90,30,30],[1,210,120,30,30],[1,210,150,30,30],[1,210,270,30,30],[1,210,300,30,30],[9,240,510,30,30],[9,270,510,30,30],[9,300,510,30,30],[9,330,510,30,30],[9,360,510,30,30],[9,390,510,30,30],[9,420,510,30,30],[9,450,510,30,30],[9,480,510,30,30],[9,510,510,30,30],[9,540,510,30,30],[9,570,510,30,30],[11,600,510,30,30],[9,660,510,30,30],[9,690,510,30,30],[1,780,270,30,30],[1,780,300,30,30],[1,750,300,30,30],[1,750,330,30,30],[1,780,240,30,30],[1,720,510,30,30],[1,750,510,30,30],[1,780,510,30,30],[1,810,510,30,30],[1,840,510,30,30],[1,870,510,30,30],[1,810,300,30,30],[1,810,330,30,30],[1,780,330,30,30],[1,780,360,30,30],[1,780,390,30,30],[1,780,420,30,30],[1,780,450,30,30],[1,780,480,30,30],[1,750,480,30,30],[1,810,480,30,30],[1,810,450,30,30],[1,810,420,30,30],[1,810,360,30,30],[1,840,360,30,30],[1,840,390,30,30],[1,840,420,30,30],[1,840,450,30,30],[1,840,480,30,30],[1,870,480,30,30],[1,870,450,30,30],[1,870,420,30,30],[1,810,390,30,30],[15,450,480,30,30,0,100,20,"custom_1770964398879_0.7716325643419607",100],[9,660,480,30,30],[12,631,481,29,29],[12,241,1,29,29],[0,180,270,30,30],[0,150,270,30,30],[0,120,270,30,30],[1,90,270,30,30],[1,90,240,30,30],[1,90,210,30,30],[1,90,180,30,30],[1,90,150,30,30],[1,90,120,30,30],[0,180,0,30,30],[0,150,0,30,30],[0,120,0,30,30],[0,90,0,30,30],[0,60,0,30,30],[0,30,0,30,30],[0,0,0,30,30],[1,0,30,30,30],[1,0,60,30,30],[1,0,90,30,30],[11,0,120,30,30],[11,0,150,30,30],[11,0,180,30,30],[15,30,150,30,30,0,100,20,"custom_1770965240403_0.9634004204138537",100],[14,150,240,30,30,0,100,20,"custom_1770965257460_0.32166109209107274",100],[16,390,480,30,30],[1,90,300,30,30],[1,120,300,30,30],[1,150,300,30,30],[1,180,300,30,30],[1,210,510,30,30],[1,300,360,30,30],[1,330,360,30,30],[1,600,270,30,30],[1,630,300,30,30],[1,390,0,30,30],[1,630,510,30,30],[1,210,330,30,30],[11,210,390,30,30],[2,150,330,40,40],[5,785,35,20,20,0,100,20,"custom_1770969592418_0.18197333297804574",100],[5,665,425,20,20,0,100,20,"custom_1770969593688_0.34564759686079427",100],[5,425,485,20,20,0,100,20,"custom_1770969600258_0.055231016185927184",100],[5,335,215,20,20,0,100,20,"custom_1770969601691_0.6480100932946863",100],[5,245,35,20,20,0,100,20,"custom_1770969602216_0.09684699738378844",100],[5,95,65,20,20,0,100,20,"custom_1770969602974_0.289979855684381",100],[5,125,365,20,20,0,100,20,"custom_1770969603958_0.20665323896179844",100],[5,755,215,20,20,0,100,20,"custom_1770969605652_0.13120415383042894",100],[5,515,185,20,20,0,100,20,"custom_1770969607257_0.9972807265012165",100]],"a":0,"sc":0,"ss":150,"ib":0}', false) as LevelData, id: 'god1' },
  { ...decompressLevel('{"v":1,"n":"God Level 2","s":[35,485],"dim":[960,540],"e":[[0,0,0,960,30],[0,0,510,960,30],[0,0,0,30,540],[0,930,0,30,540],[1,90,480,30,30],[1,90,450,30,30],[1,90,420,30,30],[1,90,390,30,30],[1,60,390,30,30],[9,60,360,30,30],[9,90,360,30,30],[9,120,330,30,30],[9,150,300,30,30],[0,60,240,30,30],[10,30,240,30,30],[0,0,240,30,30],[9,120,60,30,30],[9,150,60,30,30],[9,180,60,30,30],[9,210,60,30,30],[9,300,60,30,30],[9,390,60,30,30],[9,270,60,30,30],[9,360,60,30,30],[1,240,120,30,10],[1,330,120,30,10],[11,210,90,30,30],[11,300,90,30,30],[11,360,90,30,30],[11,270,90,30,30],[0,450,30,30,30],[0,450,60,30,30],[0,450,90,30,30],[0,450,120,30,30],[0,420,120,30,30],[0,420,150,30,30],[0,420,180,30,30],[0,420,210,30,30],[0,390,210,30,30],[18,360,210,30,30],[11,330,210,30,30],[0,300,210,30,30],[9,180,300,30,30],[9,180,270,30,30],[9,180,240,30,30],[9,180,210,30,30],[9,180,180,30,30],[1,180,150,30,30],[1,180,120,30,30],[9,180,90,30,30],[0,300,200,30,30],[0,270,200,30,30],[0,270,210,30,30],[11,240,210,30,30],[1,360,240,30,30],[2,900,480,30,30],[9,240,240,30,30],[9,240,270,30,30],[9,240,300,30,30],[9,240,330,30,30],[9,180,330,30,30],[9,180,360,30,30],[9,240,360,30,30],[9,240,390,30,30],[9,180,390,30,30],[9,180,420,30,30],[10,240,420,30,30],[11,180,450,30,30],[18,180,480,30,30],[9,180,510,30,30],[9,150,510,30,30],[9,120,510,30,30],[1,120,360,30,30],[5,155,395,20,20,0,100,20,"e_1773825526325_y4gava56j",100],[1,150,330,30,30],[0,101,390,10,145],[1,210,510,30,30],[11,240,510,30,30],[0,330,300,30,30],[0,360,300,30,30],[0,390,300,30,30],[11,420,300,30,30],[0,450,300,30,30],[9,300,330,30,30],[9,300,360,30,30],[9,300,390,30,30],[9,300,450,30,30],[9,300,480,30,30],[9,300,420,30,30],[0,90,240,30,30],[0,150,240,30,30],[12,451,271,29,29],[12,511,31,29,29],[0,480,300,30,30],[0,480,270,30,30],[0,480,240,30,30],[0,480,210,30,30],[0,480,180,30,30],[0,480,150,30,30],[0,480,120,30,30],[0,480,90,30,30],[0,480,60,30,30],[0,480,30,30,30],[10,30,150,30,30],[10,60,150,30,30],[0,90,150,30,30],[5,35,35,20,20,0,100,20,"e_1773826253299_75crj04ia",100],[9,540,30,30,30],[9,540,90,30,30],[9,540,150,30,30],[0,540,180,30,30],[9,540,210,30,30],[9,540,270,30,30],[11,540,300,30,30],[0,540,240,30,30],[1,510,300,30,30],[18,540,60,30,30],[0,540,120,30,30],[0,570,30,30,30],[0,600,30,30,30],[0,600,60,30,30],[1,600,90,30,30],[0,600,120,30,30],[1,600,150,30,30],[0,600,180,30,30],[1,600,210,30,30],[0,600,240,30,30],[1,600,270,30,30],[0,600,300,30,30],[12,511,331,29,29],[0,600,330,30,30],[0,600,360,30,30],[1,570,360,30,30],[0,540,360,30,30],[0,510,360,30,30],[18,540,330,30,30],[0,480,360,30,30],[0,480,330,30,30],[12,331,331,29,29],[1,360,450,30,30],[19,360,480,30,30],[1,390,360,30,30],[1,390,390,30,30],[19,420,450,30,30],[1,420,480,30,30],[0,480,390,30,30],[0,480,420,30,30],[0,480,450,30,30],[1,360,330,30,30],[1,390,330,30,30],[1,420,330,30,30],[1,450,330,30,30],[10,510,510,30,30],[10,540,510,30,30],[10,570,510,30,30],[10,600,510,30,30],[11,540,450,30,30],[12,661,421,29,90],[0,630,360,30,30],[0,630,390,30,30],[0,630,420,30,30],[0,630,450,30,30],[12,901,31,29,29],[9,900,120,30,30],[9,840,120,30,30],[9,780,120,30,30],[9,720,120,30,30],[1,750,90,30,30],[1,810,90,30,30],[15,780,30,30,30,0,100,20,"e_1773826770508_bhfabc09b",100],[1,690,120,30,30],[1,690,150,30,30],[1,690,180,30,30],[1,690,210,30,30],[1,690,240,30,30],[1,690,270,30,30],[1,630,120,30,30],[1,630,150,30,30],[1,630,180,30,30],[1,630,210,30,30],[1,630,240,30,30],[1,630,270,30,30],[0,630,300,30,30],[0,630,330,30,30],[9,660,360,30,30],[0,660,330,30,30],[0,690,330,30,30],[0,720,330,30,30],[0,750,330,30,30],[10,780,330,30,30],[10,810,330,30,30],[10,840,330,30,30],[1,750,150,30,30],[1,810,150,30,30],[1,870,150,30,30],[0,870,120,30,30],[11,870,300,30,30],[0,870,330,30,30],[11,870,270,30,30],[0,900,390,30,30],[9,870,390,30,30],[9,840,390,30,30],[9,810,390,30,30],[9,780,390,30,30],[9,750,390,30,30],[1,690,360,30,30],[9,720,420,30,30],[9,720,450,30,30],[9,660,390,30,30],[16,900,90,30,30],[21,150,270,30,30,0,100,20,"e_1773828004787_27akxo450",100],[0,120,90,30,30],[0,150,90,30,30],[0,120,180,30,30],[0,120,150,30,30],[0,90,180,30,30],[0,90,210,30,30],[0,60,210,30,30],[0,60,180,30,30],[0,90,90,30,30],[5,455,425,20,20,0,100,20,"e_1773828372814_o4ph2m2z2",100],[0,450,150,30,30],[0,450,180,30,30],[0,450,210,30,30],[5,275,275,20,20,0,100,20,"e_1773828432141_fafb079nm",100],[5,665,155,20,20,0,100,20,"e_1773828435494_sf7j6azvb",100],[5,905,335,20,20,0,100,20,"e_1773828457328_9ukblvg3m",100],[11,630,90,30,30],[0,750,120,30,30],[0,810,120,30,30],[9,690,117,60,10],[9,300,292,30,38],[16,390,270,30,30],[1,510,390,120,10],[19,630,480,30,30],[0,600,390,30,30]],"a":0,"sc":0,"ss":150,"ib":0}', false) as LevelData, id: 'god2' },
  { ...decompressLevel('{"v":1,"n":"God Level 3","s":[65,455],"dim":[1710,540],"e":[[11,60,480,30,30],[9,60,0,30,30],[43,60,60,30,30],[9,180,90,30,30],[9,210,90,30,30],[9,240,90,30,30],[0,240,150,30,30],[0,270,150,30,30],[9,300,150,30,30],[9,300,120,30,30],[9,300,90,30,30],[9,300,60,30,30],[9,300,30,30,30],[9,300,0,30,30],[9,90,0,30,30],[9,120,0,30,30],[9,150,0,30,30],[9,210,0,30,30],[9,240,0,30,30],[9,270,0,30,30],[9,180,0,30,30],[9,30,0,30,30],[9,0,0,30,30],[9,990,390,30,30],[1,120,90,30,30],[1,120,120,30,30],[1,120,150,30,30],[1,120,180,30,30],[1,120,210,30,30],[1,120,240,30,30],[1,120,270,30,30],[1,120,300,30,30],[1,120,330,30,30],[1,120,360,30,30],[1,120,390,30,30],[1,120,420,30,30],[1,120,450,30,30],[1,120,480,30,30],[1,120,510,30,30],[1,90,510,30,30],[1,60,510,30,30],[1,30,510,30,30],[1,0,510,30,30],[1,0,30,30,30],[1,0,60,30,30],[1,0,90,30,30],[1,0,120,30,30],[1,0,150,30,30],[1,0,180,30,30],[1,0,210,30,30],[1,0,240,30,30],[1,0,270,30,30],[1,0,300,30,30],[1,0,330,30,30],[1,0,360,30,30],[1,0,390,30,30],[1,0,420,30,30],[1,0,450,30,30],[1,0,480,30,30],[0,210,150,30,30],[9,150,90,30,30],[14,60,450,30,30,0,100,20,"e_1777981779597_qr2mnnssm",100],[15,240,120,30,30,0,100,20,"e_1777981789083_xk4d4x3kx",100],[42,240,180,119,150],[11,420,210,30,30],[11,480,150,30,30],[1,330,330,30,30],[1,360,330,30,30],[1,360,300,30,30],[1,390,300,30,30],[1,390,270,30,30],[1,420,270,30,30],[1,420,240,30,30],[1,330,360,30,30],[1,300,360,30,30],[1,300,390,30,30],[1,270,390,30,30],[1,240,390,30,30],[1,210,390,30,30],[1,180,390,30,30],[1,150,390,30,30],[42,150,240,90,90],[1,450,210,30,30],[1,480,210,30,30],[1,480,180,30,30],[1,510,150,30,30],[1,540,150,30,30],[1,570,150,30,30],[1,600,150,30,30],[1,630,150,30,30],[1,660,150,30,30],[9,330,0,30,30],[9,360,0,30,30],[9,390,0,30,30],[9,420,0,30,30],[9,450,0,30,30],[9,480,0,30,30],[9,510,0,30,30],[9,540,0,30,30],[9,600,0,30,30],[9,630,0,30,30],[9,660,0,30,30],[9,690,0,30,30],[9,720,0,30,30],[9,750,0,30,30],[9,780,0,30,30],[9,840,0,30,30],[9,870,0,30,30],[9,900,0,30,30],[9,930,0,30,30],[9,960,0,30,30],[9,990,0,30,30],[9,1020,0,30,30],[9,1050,0,30,30],[9,1080,0,30,30],[9,1110,0,30,30],[9,1140,0,30,30],[9,1170,0,30,30],[9,1200,0,30,30],[9,1230,0,30,30],[9,1260,0,30,30],[9,1290,0,30,30],[9,1320,0,30,30],[9,810,0,30,30],[9,570,0,30,30],[1,690,150,30,30],[1,720,150,30,30],[1,750,150,30,30],[1,780,150,30,30],[1,810,150,30,30],[43,510,30,30,120],[42,540,30,600,120,0,90,10,"",100],[14,330,150,150,30,0,100,20,"e_1777982726642_xavi2k5cl",100],[1,840,150,30,30],[1,870,150,30,30],[1,900,150,30,30],[1,930,150,30,30],[1,960,150,30,30],[1,990,150,30,30],[1,1020,150,30,30],[1,1050,150,30,30],[1,1080,150,30,30],[1,1110,150,30,30],[1,1140,150,30,30],[1,1140,180,30,30],[1,1140,210,30,30],[1,1140,240,30,30],[1,1140,270,30,30],[1,1140,300,30,30],[1,1140,330,30,30],[1,1140,360,30,30],[1,1140,390,30,30],[1,1140,420,30,30],[1,1140,450,30,30],[0,1140,510,30,30],[9,1320,30,30,30],[9,1320,60,30,30],[9,1320,90,30,30],[9,1320,120,30,30],[9,1320,150,30,30],[9,1320,180,30,30],[9,1320,210,30,30],[9,1320,240,30,30],[9,1320,270,30,30],[9,1320,300,30,30],[9,1320,390,30,30],[9,1320,420,30,30],[9,1320,450,30,30],[9,1320,480,30,30],[9,1320,510,30,30],[9,1320,330,30,30],[9,1320,360,30,30],[41,1170,30,150,480],[0,1110,510,30,30],[10,1080,510,30,30],[43,1020,210,30,90],[1,1020,300,30,30],[1,1020,330,30,30],[1,1020,360,30,30],[1,1020,390,30,30],[1,1020,420,30,30],[1,1020,450,30,30],[1,1020,480,30,30],[1,1020,510,30,30],[1,1050,510,30,30],[1,990,360,30,30],[1,960,360,30,30],[1,930,360,30,30],[1,900,360,30,30],[1,870,360,30,30],[1,840,360,30,30],[1,810,360,30,30],[1,780,360,30,30],[1,750,360,30,30],[1,720,360,30,30],[1,690,360,30,30],[1,660,360,30,30],[1,630,360,30,30],[1,600,360,30,30],[42,600,210,420,150],[9,570,360,30,30],[9,570,300,30,30],[9,540,300,30,30],[9,510,300,30,30],[9,510,330,30,30],[9,510,360,30,30],[9,510,390,30,30],[9,510,420,30,30],[9,570,390,30,30],[9,600,390,30,30],[9,630,390,30,30],[9,660,390,30,30],[9,690,390,30,30],[9,720,390,30,30],[9,750,390,30,30],[9,780,390,30,30],[9,810,390,30,30],[9,840,390,30,30],[9,870,390,30,30],[9,900,390,30,30],[9,930,390,30,30],[9,960,390,30,30],[9,510,450,30,30],[9,540,450,30,30],[9,570,450,30,30],[9,600,450,30,30],[9,630,450,30,30],[9,660,450,30,30],[42,680,420,172,30,0,49,37,"",100],[9,1170,510,150,30,4,100,20,"e_1777984423919_otkf3znli",100],[9,870,450,30,30],[9,900,450,30,30],[9,930,450,30,30],[9,960,450,30,30],[9,990,450,30,30],[9,990,420,30,30],[2,960,420,30,30],[1,750,510,30,30],[1,780,510,30,30],[1,810,510,30,30],[1,720,510,30,30],[9,840,510,30,30],[5,1085,485,20,20,0,100,20,"e_1777984505988_2t6d2xv8d",100],[5,275,95,20,20,0,100,20,"e_1777984514100_a29y3duuo",100],[5,575,335,20,20,0,100,20,"e_1777984534743_3jnh4qveq",100],[9,660,480,30,30],[9,660,510,30,30],[1,690,510,30,30],[9,840,450,30,30],[9,840,480,30,30]],"a":0,"sc":1,"ss":70,"ib":0}', false) as LevelData, id: 'god3' },
  { ...decompressLevel('{"v":1,"n":"God Level 4","s":[35,35],"dim":[1410,540],"e":[[9,870,420,30,30],[9,0,0,30,30],[9,0,30,30,30],[9,0,60,30,30],[9,0,180,30,30],[9,0,210,30,30],[9,0,240,30,30],[9,0,270,30,30],[9,0,300,30,30],[9,0,330,30,30],[9,0,360,30,30],[9,0,390,30,30],[9,0,420,30,30],[9,0,450,30,30],[9,0,480,30,30],[9,0,510,30,30],[9,0,150,30,30],[9,0,120,30,30],[9,0,90,30,30],[0,30,0,30,30],[0,60,0,30,30],[0,90,0,30,30],[10,270,0,30,30],[10,300,0,30,30],[46,30,60,30,30],[9,30,90,30,30],[10,420,510,30,30],[10,450,510,30,30],[46,360,270,30,30],[10,540,0,30,30],[10,570,0,30,30],[10,690,510,30,30],[10,720,510,30,30],[46,510,240,30,30],[46,630,270,30,30],[1,180,0,30,30],[1,390,0,30,30],[1,210,0,30,30],[1,150,0,30,30],[1,120,0,30,30],[1,360,0,30,30],[1,420,0,30,30],[1,450,0,30,30],[1,480,0,30,30],[5,515,275,20,20,0,100,20,"e_1778066336168_376cabsed",100],[5,365,245,20,20,0,100,20,"e_1778066337089_gpjqkw7rp",100],[5,635,245,20,20,0,100,20,"e_1778066339638_x0ie6kcad",100],[43,750,240,30,30],[1,630,0,30,30],[1,660,0,30,30],[1,690,0,30,30],[1,720,0,30,30],[1,750,0,30,30],[1,30,510,30,30],[1,60,510,30,30],[1,120,510,30,30],[1,150,510,30,30],[1,180,510,30,30],[1,210,510,30,30],[1,240,510,30,30],[1,270,510,30,30],[1,300,510,30,30],[1,330,510,30,30],[1,360,510,30,30],[1,90,510,30,30],[1,510,510,30,30],[1,540,510,30,30],[1,570,510,30,30],[1,600,510,30,30],[1,630,510,30,30],[1,780,510,30,30],[1,810,510,30,30],[1,840,510,30,30],[1,870,510,30,30],[1,420,30,30,30],[1,420,60,30,30],[1,420,90,30,30],[1,420,120,30,30],[1,420,150,30,30],[1,420,180,30,30],[1,420,210,30,30],[1,570,480,30,30],[1,570,450,30,30],[1,570,420,30,30],[1,570,390,30,30],[1,570,360,30,30],[1,570,330,30,30],[1,570,300,30,30],[1,570,270,30,30],[1,570,240,30,30],[1,420,240,30,30],[1,420,270,30,30],[1,270,480,30,30],[1,270,450,30,30],[1,270,420,30,30],[1,270,390,30,30],[1,270,360,30,30],[1,270,330,30,30],[1,270,300,30,30],[1,270,270,30,30],[1,270,240,30,30],[1,270,210,30,30],[1,270,180,30,30],[1,690,30,30,30],[1,690,60,30,30],[1,690,90,30,30],[1,690,120,30,30],[1,690,150,30,30],[1,690,180,30,30],[1,690,210,30,30],[1,690,240,30,30],[1,690,270,30,30],[5,870,267,11,20,0,100,20,"e_1778066475835_p6n16z9fy",100],[44,780,240,30,30],[9,870,0,30,30],[9,870,30,30,30],[9,870,60,30,30],[9,870,90,30,30],[9,870,120,30,30],[9,870,150,30,30],[9,870,180,30,30],[9,870,210,30,50],[9,870,260,120,10],[9,870,285,132,10],[9,870,295,30,71],[9,870,360,30,30],[9,870,390,30,30],[9,870,450,30,30],[9,870,480,30,30],[1,780,0,30,30],[1,810,0,30,30],[1,840,0,30,30],[9,1000,170,10,125],[9,980,145,10,122],[9,1100,145,10,125],[9,980,145,120,10],[9,1000,165,90,10],[9,1080,170,10,100],[10,1080,510,30,30],[5,1025,245,20,20,0,100,20,"e_1778067011718_qk3zxrfy0",100],[11,1180,75,8,208,4,100,20,"e_1778067241382_isit34fad",100],[1,1140,510,30,30],[1,1020,510,30,30],[1,990,510,30,30],[1,960,510,30,30],[1,930,510,30,30],[1,900,510,30,30],[1,1170,510,30,30],[1,1200,510,30,30],[1,1230,510,30,30],[1,1260,510,30,30],[1,1290,510,30,30],[2,1310,255,62,11,0,67,10,"e_1778067192810_f9jm3auka",100],[1,1320,510,30,30],[1,1350,510,30,30],[1,1380,510,30,30],[1,1380,480,30,30],[1,1380,450,30,30],[1,1380,420,30,30],[1,1380,390,30,30],[1,1380,360,30,30],[1,1380,330,30,30],[1,1380,300,30,30],[1,1380,270,30,30],[1,1380,240,30,30],[1,1380,210,30,30],[1,1380,180,30,30],[1,1380,150,30,30],[1,1380,120,30,30],[1,1380,90,30,30],[1,1380,60,30,30],[1,1380,30,30,30],[1,1380,0,30,30],[9,1180,280,201,10]],"a":0,"sc":1,"ss":190,"ib":0}', false) as LevelData, id: 'god4' },
  { ...decompressLevel('{"v":1,"n":"God Level 5","s":[50,450],"dim":[1530,540],"e":[[9,30,510,30,30],[9,60,510,30,30],[1,1320,510,30,30],[1,1350,510,30,30],[1,1380,510,30,30],[1,1410,510,30,30],[1,1440,510,30,30],[1,1470,510,30,30],[1,1500,510,30,30],[1,1500,0,30,30],[1,1500,30,30,30],[1,1500,60,30,30],[1,1500,90,30,30],[1,1500,120,30,30],[1,1500,150,30,30],[1,1500,180,30,30],[1,1500,210,30,30],[1,1500,240,30,30],[1,1500,270,30,30],[1,1500,300,30,30],[1,1500,330,30,30],[1,1500,360,30,30],[1,1500,390,30,30],[1,1500,420,30,30],[1,1500,450,30,30],[1,1500,480,30,30],[1,1320,0,30,30],[1,1320,30,30,30],[1,1320,60,30,30],[1,1320,90,30,30],[1,1320,480,30,30],[1,1320,450,30,30],[1,1320,420,30,30],[1,1320,390,30,30],[1,1320,360,30,30],[1,1320,330,30,30],[1,1320,120,30,30],[11,180,390,30,30],[10,300,390,30,30],[10,330,390,30,30],[9,420,150,30,30],[9,450,150,30,30],[9,480,150,30,30],[9,510,150,30,30],[9,540,150,30,30],[9,450,210,30,30],[9,480,210,30,30],[9,510,210,30,30],[9,540,210,30,30],[9,570,210,30,30],[9,600,210,30,30],[9,600,180,30,30],[9,600,150,30,30],[9,600,120,30,30],[9,600,90,30,30],[9,600,60,30,30],[9,600,30,30,30],[9,600,0,30,30],[9,570,0,30,30],[9,540,0,30,30],[9,510,0,30,30],[9,480,0,30,30],[9,450,0,30,30],[9,420,0,30,30],[9,390,0,30,30],[9,360,0,30,30],[9,330,0,30,30],[9,300,0,30,30],[9,270,0,30,30],[9,240,0,30,30],[9,210,0,30,30],[9,240,0,30,30],[9,210,0,30,30],[9,180,0,30,30],[9,150,0,30,30],[9,120,0,30,30],[9,90,0,30,30],[9,60,0,30,30],[9,30,0,30,30],[9,0,0,30,30],[9,390,150,30,30],[9,390,180,30,30],[9,390,210,30,30],[9,390,240,30,30],[9,390,270,30,30],[9,390,300,30,30],[9,390,330,30,30],[9,390,360,30,30],[9,390,390,30,30],[9,390,420,30,30],[9,390,450,30,30],[9,390,480,30,30],[9,390,510,30,30],[10,420,510,30,30],[9,480,270,30,30],[9,510,270,30,30],[9,540,270,30,30],[9,570,270,30,30],[9,600,270,30,30],[9,630,270,30,30],[9,660,270,30,30],[1,480,300,30,30],[1,480,330,30,30],[1,480,360,30,30],[1,480,390,30,30],[1,480,420,30,30],[1,480,450,30,30],[1,480,480,30,30],[1,480,510,30,30],[46,540,240,30,30],[9,660,240,30,30],[9,660,210,30,30],[9,660,180,30,30],[9,660,150,30,30],[9,660,120,30,30],[9,660,90,30,30],[9,660,60,30,30],[9,630,0,30,30],[9,660,0,30,30],[9,690,0,30,30],[9,720,0,30,30],[9,750,0,30,30],[10,690,70,30,20],[9,720,60,30,30],[9,750,60,30,30],[9,750,120,30,30],[9,720,120,30,30],[9,720,150,30,30],[9,720,180,30,30],[9,720,210,30,30],[9,720,240,30,30],[9,720,270,30,30],[9,686,60,35,10],[9,660,300,30,30],[9,660,330,30,30],[9,690,330,30,30],[9,720,330,30,30],[5,395,125,20,20,0,100,20,"e_1777974020689_4vcyntjtp",100],[5,425,485,20,20,0,100,20,"e_1777974022947_fskjnxsmm",100],[5,635,245,20,20,0,100,20,"e_1777974025662_ntnp6w4zi",100],[5,695,95,20,20,0,100,20,"e_1777974027372_yjbyqyon5",100],[9,750,270,30,30],[9,750,330,30,30],[46,750,300,30,30],[9,780,0,30,30],[9,810,0,30,30],[9,810,30,30,30],[9,810,60,30,30],[9,810,90,30,30],[9,810,120,30,30],[9,780,120,30,30],[43,780,300,30,30],[9,780,270,30,30],[9,810,270,30,30],[11,990,330,30,30],[9,840,270,30,30],[9,870,270,30,30],[9,900,270,30,30],[9,900,240,30,30],[9,900,210,30,30],[9,900,180,30,30],[9,900,150,30,30],[9,900,120,30,30],[9,870,120,30,30],[9,840,120,30,30],[5,965,335,20,20,0,100,20,"e_1777974378878_aov33ldh7",100],[1,1140,510,30,30],[1,1140,480,30,30],[1,1140,450,30,30],[1,1140,420,30,30],[1,1140,390,30,30],[1,1140,360,30,30],[1,1140,330,30,30],[1,1140,300,30,30],[1,1140,270,30,30],[1,1140,240,30,30],[1,1140,210,30,30],[1,1140,180,30,30],[1,1140,150,30,30],[10,1050,330,30,30],[46,1380,330,30,30],[2,1440,30,30,30],[1,1320,150,30,30],[1,1290,150,30,30],[1,1260,150,30,30],[1,1230,150,30,30],[1,1320,300,30,30],[10,1200,510,30,30],[1,1290,300,30,30]],"a":0,"sc":1,"ss":150,"ib":0}', false) as LevelData, id: 'god5' },
  ...generateLevelSequence(5, 'god', 6)

];