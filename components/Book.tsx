import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface BookItem {
  id: string;
  type: 'block' | 'powerup' | 'mechanic';
  renderClass?: string;
  renderContent?: string;
  renderStyle?: React.CSSProperties;
}

const BOOK_ITEMS: BookItem[] = [
  // BLOCKS
  {
    id: 'wall', type: 'block',
    renderStyle: { backgroundColor: '#404040' }
  },
  {
    id: 'hazard', type: 'block',
    renderClass: 'shadow-[0_0_10px_#ff0044]',
    renderStyle: { backgroundColor: '#ff0044' }
  },
  {
    id: 'goal', type: 'block',
    renderClass: 'shadow-[0_0_15px_#00ff88]',
    renderStyle: { backgroundColor: '#00ff88' }
  },
  {
    id: 'coin', type: 'block',
    renderClass: 'rounded-full',
    renderStyle: { backgroundColor: '#fbbf24' }
  },
  {
    id: 'bounce', type: 'block',
    renderStyle: { backgroundColor: '#00ccff' }, renderContent: '⌇'
  },
  {
    id: 'ice', type: 'block',
    renderStyle: { backgroundColor: '#a5f3fc' }
  },
  {
    id: 'slime', type: 'block',
    renderStyle: { backgroundColor: '#84cc16' }
  },
  {
    id: 'trampoline', type: 'block',
    renderStyle: { backgroundColor: '#ec4899' }, renderContent: '↑'
  },
  {
    id: 'teleport', type: 'block',
    renderClass: 'animate-pulse',
    renderStyle: { backgroundColor: '#8b5cf6' }
  },
  {
    id: 'moving_platform', type: 'block',
    renderStyle: { backgroundColor: '#aaa' }, renderContent: '↔'
  },
  {
    id: 'fragile', type: 'block',
    renderClass: 'border-2 border-dashed border-neutral-400',
    renderStyle: { backgroundColor: '#ffffff' }
  },
  {
    id: 'checkpoint', type: 'block',
    renderStyle: { backgroundColor: '#2dd4bf' }
  },
  {
    id: 'invisible_hazard', type: 'block',
    renderClass: 'border border-red-500 border-dashed bg-transparent'
  },

  // POWERUPS
  {
    id: 'powerup_double_jump', type: 'powerup',
    renderClass: 'rounded-full animate-bounce shadow-[0_0_10px_#9c27b0]', 
    renderStyle: { backgroundColor: '#9c27b0' }, renderContent: '2x'
  },
  {
    id: 'powerup_triple_jump', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#ff00ff]', 
    renderStyle: { backgroundColor: '#ff00ff' }, renderContent: '3x'
  },
  {
    id: 'powerup_hook', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#607d8b]', 
    renderStyle: { backgroundColor: '#607d8b' }, renderContent: '⚓'
  },
  {
    id: 'powerup_dash', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#f59e0b]', 
    renderStyle: { backgroundColor: '#f59e0b' }, renderContent: '»'
  },
  {
    id: 'powerup_xray', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#facc15]', 
    renderStyle: { backgroundColor: '#facc15' }, renderContent: '👁'
  },
  {
    id: 'powerup_shield', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#2dd4bf]', 
    renderStyle: { backgroundColor: '#2dd4bf' }, renderContent: '⛨'
  },
  {
    id: 'powerup_fireball', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_10px_#ff4500]', 
    renderStyle: { backgroundColor: '#ff4500' }, renderContent: '🔥'
  },
  {
    id: 'powerup_shrink', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#10b981]', 
    renderStyle: { backgroundColor: '#10b981' }, renderContent: '↓'
  },
  {
    id: 'powerup_grow', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#8b5cf6]', 
    renderStyle: { backgroundColor: '#8b5cf6' }, renderContent: '↑'
  },
  {
    id: 'powerup_slow_mo', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#3b82f6]',
    renderStyle: { backgroundColor: '#3b82f6' }, renderContent: '⏱'
  },
  {
    id: 'powerup_build', type: 'powerup',
    renderClass: 'rounded-full shadow-[0_0_10px_#00bcd4]',
    renderStyle: { backgroundColor: '#00bcd4' }, renderContent: '🧱'
  },

  // FUSED POWERUPS
  {
    id: 'powerup_titan', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#fbbf24] border border-yellow-400',
    renderStyle: { backgroundColor: '#fbbf24' }, renderContent: '🍄'
  },
  {
    id: 'powerup_blizzard', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#a5f3fc]',
    renderStyle: { backgroundColor: '#a5f3fc' }, renderContent: '❄️'
  },
  {
    id: 'powerup_thunder_shield', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#eab308]',
    renderStyle: { backgroundColor: '#eab308' }, renderContent: '⚡'
  },
  {
    id: 'powerup_nuke_bomb', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#ef4444]',
    renderStyle: { backgroundColor: '#ef4444' }, renderContent: '💥'
  },
  {
    id: 'powerup_meteor_rain', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#f97316]',
    renderStyle: { backgroundColor: '#f97316' }, renderContent: '☄️'
  },
  {
    id: 'powerup_golden_sword', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#facc15]',
    renderStyle: { backgroundColor: '#facc15' }, renderContent: '⚔️'
  },
  {
    id: 'powerup_teleport_dash', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#a855f7]',
    renderStyle: { backgroundColor: '#a855f7' }, renderContent: '🌌'
  },
  {
    id: 'powerup_teleport_all', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#6366f1]',
    renderStyle: { backgroundColor: '#6366f1' }, renderContent: '🌀'
  },
  {
    id: 'powerup_gravity_boots', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#f43f5e]',
    renderStyle: { backgroundColor: '#f43f5e' }, renderContent: '🥾'
  },
  {
    id: 'powerup_black_hole', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#d946ef]',
    renderStyle: { backgroundColor: '#d946ef' }, renderContent: '🕳️'
  },
  {
    id: 'powerup_glacier', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#06b6d4]',
    renderStyle: { backgroundColor: '#06b6d4' }, renderContent: '🏔️'
  },
  {
    id: 'powerup_trampoline', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#ec4899]',
    renderStyle: { backgroundColor: '#ec4899' }, renderContent: '🤸'
  },
  {
    id: 'powerup_fortress', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#64748b]',
    renderStyle: { backgroundColor: '#64748b' }, renderContent: '🏰'
  },
  {
    id: 'powerup_voltage_hook', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#0d9488]',
    renderStyle: { backgroundColor: '#0d9488' }, renderContent: '🪝'
  },
  {
    id: 'powerup_nano_spy', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#10b981]',
    renderStyle: { backgroundColor: '#10b981' }, renderContent: '🐜'
  },
  {
    id: 'powerup_quantum_shift', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#3b82f6]',
    renderStyle: { backgroundColor: '#3b82f6' }, renderContent: '✨'
  },
  {
    id: 'powerup_fire_shield', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#ea580c]',
    renderStyle: { backgroundColor: '#ea580c' }, renderContent: '🔥'
  },
  {
    id: 'powerup_lodestar', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#e11d48]',
    renderStyle: { backgroundColor: '#e11d48' }, renderContent: '💫'
  },
  {
    id: 'powerup_frost_mourne', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#38bdf8]',
    renderStyle: { backgroundColor: '#38bdf8' }, renderContent: '❄️'
  },
  {
    id: 'powerup_sticky_bomb', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#84cc16]',
    renderStyle: { backgroundColor: '#84cc16' }, renderContent: '🟢'
  },
  {
    id: 'powerup_angel_wings', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#f8fafc]',
    renderStyle: { backgroundColor: '#f8fafc' }, renderContent: '🪽'
  },
  {
    id: 'powerup_trickster', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#d946ef]',
    renderStyle: { backgroundColor: '#d946ef' }, renderContent: '🃏'
  },
  {
    id: 'powerup_chaos_orb', type: 'powerup',
    renderClass: 'rounded-full animate-pulse shadow-[0_0_15px_#ec4899]',
    renderStyle: { backgroundColor: '#ec4899' }, renderContent: '🔮'
  },

  // MECHANICS & TROLL
  {
    id: 'fake', type: 'mechanic',
    renderClass: 'opacity-80',
    renderStyle: { backgroundColor: '#404040' }
  },
  {
    id: 'fake_goal', type: 'mechanic',
    renderClass: 'shadow-[0_0_5px_#00ff88]',
    renderStyle: { backgroundColor: '#00ff88' }
  },
  {
    id: 'troll_wall', type: 'mechanic',
    renderStyle: { backgroundColor: '#0a0a0a' }
  },
  {
    id: 'gravity_reverse', type: 'mechanic',
    renderStyle: { backgroundColor: '#8b5cf6' }, renderContent: '⇅'
  },
  {
    id: 'gravity_zero', type: 'mechanic',
    renderClass: 'border-2 border-dashed border-indigo-400 bg-transparent', renderContent: '☄'
  }
];

const FUSED_WIKI_ITEMS: Record<string, Record<string, { name: string; desc: string; recipe: string }>> = {
  de: {
    powerup_titan: {
      name: "⭐ Titan-Koloss",
      desc: "Macht dich zu einem kolossalen Riesen mit unzerstörbarem Schutz-Schild und massiver Sprungkraft.",
      recipe: "Wachstum + Wachstum"
    },
    powerup_blizzard: {
      name: "⭐ Blizzard-Sturm",
      desc: "Erzeugt einen eisigen Schneesturm auf der gesamten Karte, der alle Gegner stark verlangsamt.",
      recipe: "Zeitlupe + Zeitlupe"
    },
    powerup_thunder_shield: {
      name: "⭐ Blitzschild",
      desc: "Ein elektrischer Schutzschild, der Gegner bei Berührung mit mächtigen Druckwellen wegstößt.",
      recipe: "Schild + Schild"
    },
    powerup_nuke_bomb: {
      name: "⭐ Nuke-Bombe",
      desc: "Zündet eine verheerende Cluster-Bombe, die sich in mehrere explosive Sprengköpfe teilt.",
      recipe: "Bombe + Bombe"
    },
    powerup_meteor_rain: {
      name: "⭐ Meteorsturm",
      desc: "Regnet glühende Meteoriten aus dem Himmel herab, die die Kampfarena in Schutt und Asche legen.",
      recipe: "Feuerball + Feuerball"
    },
    powerup_golden_sword: {
      name: "⭐ Seelenfresser",
      desc: "Führe ein legendäres goldenes Breitschwert, das nahen Gegnern enormen Rückstoß verpasst.",
      recipe: "Nahkampf + Nahkampf"
    },
    powerup_teleport_dash: {
      name: "⭐ Warp-Sprint",
      desc: "Ein hochentwickelter Dimensions-Sprint, der dich augenblicklich durch Wände teleportiert.",
      recipe: "Dash + Dash"
    },
    powerup_teleport_all: {
      name: "⭐ Welten-Swap",
      desc: "Tauscht sofort deine Position mit der des Gegners – ideal für heimtückische Rettungsmanöver.",
      recipe: "Teleport + Teleport"
    },
    powerup_gravity_boots: {
      name: "⭐ Schwerkraft-Stiefel",
      desc: "Erhöht deine maximale Sprungzahl und lässt dich bis zu drei zusätzliche Sprünge ausführen.",
      recipe: "Dreifach-Sprung + Dreifach-Sprung"
    },
    powerup_black_hole: {
      name: "⭐ Schwarzes Loch",
      desc: "Erzeugt eine enorme Gravitations-Anziehungskraft, die alle gegnerischen Items entwendet.",
      recipe: "Diebstahl + Diebstahl"
    },
    powerup_glacier: {
      name: "⭐ Gletscher-Wall",
      desc: "Erschafft eine massive Frost-Wand aus rutschigen Eisblöcken, um Wege komplett abzuriegeln.",
      recipe: "Eisblock + Eisblock"
    },
    powerup_trampoline: {
      name: "⭐ Mega-Trampolin",
      desc: "Platziert eine Reihe hochelastischer Kissen, die dich extrem hoch in die Luft katapultieren.",
      recipe: "Schleimblock + Schleimblock"
    },
    powerup_fortress: {
      name: "⭐ Festungs-Wall",
      desc: "Errichtet in Sekundenschnelle eine robuste Barrikade aus soliden Ziegelsteinen.",
      recipe: "Baublöcke + Baublöcke"
    },
    powerup_voltage_hook: {
      name: "⭐ Elektro-Greifer",
      desc: "Ein verbesserter, blitzschneller Greifhaken mit extrem hoher Zugkraft.",
      recipe: "Greifhaken + Greifhaken"
    },
    powerup_nano_spy: {
      name: "⭐ Nanospion",
      desc: "Schrumpft dich dauerhaft auf Ameisengröße, um durch absolut jede noch so winzige Ritze zu huschen.",
      recipe: "Schrumpfpilz + Schrumpfpilz"
    },
    powerup_quantum_shift: {
      name: "⭐ Quanten-Shift",
      desc: "Du erreichst den Quantenzustand: Werde extrem winzig und gleichzeitig durch ein Kraftfeld geschützt.",
      recipe: "Wachstum + Schrumpfung"
    },
    powerup_fire_shield: {
      name: "⭐ Infernoschild",
      desc: "Ein brennender Hitzeschild, der dich beschützt und gleichzeitig Feuerbälle nach vorne schleudert.",
      recipe: "Schild + Offensive (Feuerball/Bombe/Nahkampf)"
    },
    powerup_lodestar: {
      name: "⭐ Warp-Inferno",
      desc: "Ein extrem schneller Dash, der eine Spur zerstörerischer Brandbomben hinter sich herzieht.",
      recipe: "Dash + Feuerball"
    },
    powerup_frost_mourne: {
      name: "⭐ Frostmourne-Klinge",
      desc: "Ein magischer Frostangriff, der getroffene Gegner völlig einfriert und verlangsamt.",
      recipe: "Nahkampf + Eisblock"
    },
    powerup_sticky_bomb: {
      name: "⭐ Schleimbombe",
      desc: "Schleudert eine zähe Slime-Granate, die an Wänden haftet und massiven klebrigen Rückstoß erzeugt.",
      recipe: "Bombe + Schleimblock"
    },
    powerup_angel_wings: {
      name: "⭐ Engelsflügel",
      desc: "Aktiviert absolute Levitation mit Schutzschild und unendlich vielen Luftsprüngen.",
      recipe: "Schild + Dreifach-Sprung"
    },
    powerup_trickster: {
      name: "⭐ Trickster-Swap",
      desc: "Kombiniert Dimensionswechsel und Taschendiebstahl: Tauscht Positionen und stiehlt das Item des Gegners.",
      recipe: "Teleport + Diebstahl"
    },
    powerup_chaos_orb: {
      name: "⭐ Chaos-Orb",
      desc: "Beschwört eine unberechenbare, instabile Energie-Kugel mit vollkommen zufälligen Krafteffekten.",
      recipe: "Alle anderen Kombinationen"
    }
  },
  en: {
    powerup_titan: {
      name: "⭐ Titan Beast",
      desc: "Transforms you into a colossal giant with a heavy energy shield and massive jump power.",
      recipe: "Growth + Growth"
    },
    powerup_blizzard: {
      name: "⭐ Blizzard Storm",
      desc: "Unleashes an icy blizzard across the entire map, heavily slowing down all other players.",
      recipe: "Slow-Mo + Slow-Mo"
    },
    powerup_thunder_shield: {
      name: "⭐ Thunder Shield",
      desc: "An electric shield that blasts away nearby opposing players with powerful thunder shockwaves.",
      recipe: "Shield + Shield"
    },
    powerup_nuke_bomb: {
      name: "⭐ Nuke Cluster Bomb",
      desc: "Deploys a huge nuclear device that splits into multiple secondary high-explosive payloads.",
      recipe: "Bomb + Bomb"
    },
    powerup_meteor_rain: {
      name: "⭐ Meteor Shower",
      desc: "Summons a devastating barrage of meteors from the cosmic sky to rain down on the arena.",
      recipe: "Fireball + Fireball"
    },
    powerup_golden_sword: {
      name: "⭐ Excalibur Block",
      desc: "Wield a legendary golden broadsword that generates massive knockback to all nearby cubes.",
      recipe: "Melee + Melee"
    },
    powerup_teleport_dash: {
      name: "⭐ Warp Dash",
      desc: "An advanced hyper-dimensional dash that lets you immediately travel straight through walls.",
      recipe: "Dash + Dash"
    },
    powerup_teleport_all: {
      name: "⭐ Wormhole Swap",
      desc: "Instantly swaps your coordinates with the enemy's – perfect for tricking them into hazards.",
      recipe: "Teleport + Teleport"
    },
    powerup_gravity_boots: {
      name: "⭐ Gravity Boots",
      desc: "Enhances your footwear to grant a massive jump counter boost, allowing endless mid-air jumps.",
      recipe: "Triple Jump + Triple Jump"
    },
    powerup_black_hole: {
      name: "⭐ Black Hole",
      desc: "Generates massive cosmic gravitational pull, immediately stealing the holdings of others.",
      recipe: "Steal + Steal"
    },
    powerup_glacier: {
      name: "⭐ Glacier Wall",
      desc: "Spawns a massive row of slippery frozen ice blocks to wall off escape paths.",
      recipe: "Ice Block + Ice Block"
    },
    powerup_trampoline: {
      name: "⭐ Mega Trampoline",
      desc: "Lays down a set of highly elastic platforms that rocket you high up into the clouds.",
      recipe: "Slime Block + Slime Block"
    },
    powerup_fortress: {
      name: "⭐ Fortress Block",
      desc: "Assembles a tall defensive wall structure composed of heavy-duty solid brick blocks.",
      recipe: "Build Blocks + Build Blocks"
    },
    powerup_voltage_hook: {
      name: "⭐ Voltage Grapple",
      desc: "A high-voltage grappling hook that pulls you towards walls at lightning fast speeds.",
      recipe: "Grappling Hook + Grappling Hook"
    },
    powerup_nano_spy: {
      name: "⭐ Nano Spy",
      desc: "Permanently shrinks your cube down to microsize, letting you crawl through any tiny gap.",
      recipe: "Shrink + Shrink"
    },
    powerup_quantum_shift: {
      name: "⭐ Quantum Shift",
      desc: "Enter a quantum state: become extremely small and obtain an invincible energy field.",
      recipe: "Growth + Shrink"
    },
    powerup_fire_shield: {
      name: "⭐ Hellfire Shield",
      desc: "A flaming hot thermal shield that protects you while launching fire projectiles forward.",
      recipe: "Shield + Offensive (Fireball/Bomb/Melee)"
    },
    powerup_lodestar: {
      name: "⭐ Lodestar Dash",
      desc: "An ultra-fast speed dash that leaves behind a trail of blazing explosive mines.",
      recipe: "Dash + Fireball"
    },
    powerup_frost_mourne: {
      name: "⭐ Frost Mourne Core",
      desc: "A magical frozen strike that completely freezes opponent movement and slows them down.",
      recipe: "Melee + Ice Block"
    },
    powerup_sticky_bomb: {
      name: "⭐ Sticky Slime Bomb",
      desc: "Launches a sticky slime payload that adheres to walls and blasts targets with heavy knockback.",
      recipe: "Bomb + Slime Block"
    },
    powerup_angel_wings: {
      name: "⭐ Angel Wings Fly",
      desc: "Grants heavenly protective levitation with a shield and countless mid-air jumps.",
      recipe: "Shield + Triple Jump"
    },
    powerup_trickster: {
      name: "⭐ Trickster Swap",
      desc: "Position swapping meets pickpocketing: instantly swap places while stealing their active item.",
      recipe: "Teleport + Steal"
    },
    powerup_chaos_orb: {
      name: "⭐ Chaos Orb Proj",
      desc: "Produces an unstable, glowing orb of raw magic that inflicts random chaotic effects.",
      recipe: "All other combinations"
    }
  },
  es: {
    powerup_titan: {
      name: "⭐ Bestia Titán",
      desc: "Te convierte en un gigante colosal con un escudo pesado y poder de salto masivo.",
      recipe: "Crecimiento + Crecimiento"
    },
    powerup_blizzard: {
      name: "⭐ Tormenta de Ventisca",
      desc: "Desata una tormenta helada en todo el mapa, ralentizando a los demás jugadores.",
      recipe: "Cámara Lenta + Cámara Lenta"
    },
    powerup_thunder_shield: {
      name: "⭐ Escudo de Trueno",
      desc: "Un escudo de protección eléctrica que repele a los oponentes con ondas de choque.",
      recipe: "Escudo + Escudo"
    },
    powerup_nuke_bomb: {
      name: "⭐ Bomba Nuclear de Racimo",
      desc: "Despliega un gran dispositivo nuclear que se divide en múltiples cargas de alta explosión.",
      recipe: "Bomba + Bomba"
    },
    powerup_meteor_rain: {
      name: "⭐ Lluvia de Meteoros",
      desc: "Invoca un devastador barrido de meteoritos del cielo cósmico sobre el campo.",
      recipe: "Bola de Fuego + Bola de Fuego"
    },
    powerup_golden_sword: {
      name: "⭐ Bloque Excalibur",
      desc: "Empuña una espada dorada legendaria que genera un fuerte retroceso en cubos rivales.",
      recipe: "Cuerpo a Cuerpo + Cuerpo a Cuerpo"
    },
    powerup_teleport_dash: {
      name: "⭐ Warp Dash",
      desc: "Un dash interdimensional que te permite cruzar libremente paredes sólidas.",
      recipe: "Dash + Dash"
    },
    powerup_teleport_all: {
      name: "⭐ Intercambio de Agujero de Gusano",
      desc: "Intercambia instantáneamente tus coordenadas con las del rival.",
      recipe: "Teleport + Teleport"
    },
    powerup_gravity_boots: {
      name: "⭐ Botas de Gravedad",
      desc: "Mejora tus saltos permitiendo infinidad de saltos extra en el aire.",
      recipe: "Triple Salto + Triple Salto"
    },
    powerup_black_hole: {
      name: "⭐ Agujero Negro",
      desc: "Genera una tremenda atracción gravedad atrayendo y robando objetos de rivales.",
      recipe: "Robar + Robar"
    },
    powerup_glacier: {
      name: "⭐ Muro de Glaciar",
      desc: "Genera una gran barrera de bloques de hielo resbaladizos para cortar el paso.",
      recipe: "Bloque de Hielo + Bloque de Hielo"
    },
    powerup_trampoline: {
      name: "⭐ Mega Trampolín",
      desc: "Coloca un conjunto de cojines elásticos que te catapultan hasta el cielo.",
      recipe: "Bloque de Slime + Bloque de Slime"
    },
    powerup_fortress: {
      name: "⭐ Bloque de Fortaleza",
      desc: "Ensambla una estructura robusta de ladrillos sólidos para protegerte.",
      recipe: "Bloquear + Bloquear"
    },
    powerup_voltage_hook: {
      name: "⭐ Gancho de Voltaje",
      desc: "Un gancho de alto voltaje que te desplaza hacia las paredes a velocidad del rayo.",
      recipe: "Gancho + Gancho"
    },
    powerup_nano_spy: {
      name: "⭐ Nano Espía",
      desc: "Te encoge de forma permanente a un tamaño diminuto para pasar por cualquier ranura.",
      recipe: "Encoger + Encoger"
    },
    powerup_quantum_shift: {
      name: "⭐ Quantum Shift",
      desc: "Entra en estado cuántico: experimenta un tamaño micro y un escudo invencible.",
      recipe: "Crecimiento + Encoger"
    },
    powerup_fire_shield: {
      name: "⭐ Escudo de Fuego Infernal",
      desc: "Un ardiente escudo térmico que te protege y lanza proyectiles de fuego adelante.",
      recipe: "Escudo + Ofensivo"
    },
    powerup_lodestar: {
      name: "⭐ Dash Lodestar",
      desc: "Un dash de supervelocidad que produce un rastro de minas de fuego explosivas.",
      recipe: "Dash + Bola de Fuego"
    },
    powerup_frost_mourne: {
      name: "⭐ Núcleo Frost Mourne",
      desc: "Ataque gélido mágico que congela y ralentiza por completo a tus oponentes.",
      recipe: "Cuerpo a Cuerpo + Bloque de Hielo"
    },
    powerup_sticky_bomb: {
      name: "⭐ Bomba Pegajosa",
      desc: "Bomba de Slime que se adhiere a las paredes y empuja fuertemente a sus víctimas.",
      recipe: "Bomba + Bloque de Slime"
    },
    powerup_angel_wings: {
      name: "⭐ Alas de Ángel",
      desc: "Te otorga levitación celestial con escudo y un sinfín de saltos en el aire.",
      recipe: "Escudo + Triple Salto"
    },
    powerup_trickster: {
      name: "⭐ Intercambio Trickster",
      desc: "Inversión espacial y robo: intercambia posiciones y roba el objeto activo del rival.",
      recipe: "Teleport + Robar"
    },
    powerup_chaos_orb: {
      name: "⭐ Orbe de Caos",
      desc: "Lanza un proyectil inestable con potentes efectos mágicos totalmente aleatorios.",
      recipe: "Otras combinaciones"
    }
  }
};

interface BookProps {
  onClose: () => void;
  lang: Language;
}

const Book: React.FC<BookProps> = ({ onClose, lang }) => {
  const [filter, setFilter] = useState<'all' | 'block' | 'powerup' | 'mechanic'>('all');
  
  const t = TRANSLATIONS[lang] || TRANSLATIONS[Language.EN];
  const filteredItems = BOOK_ITEMS.filter(item => filter === 'all' || item.type === filter);

  return (
    <div className="absolute inset-0 bg-neutral-950 flex flex-col z-[100] p-6 lg:p-10 font-sans animate-fade-in text-white overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b-2 border-red-900 pb-4 shrink-0">
        <div>
          <h2 className="text-4xl lg:text-5xl font-arcade text-rage-red tracking-tighter shadow-red-900 drop-shadow-md">
            {t.wikiTitle}
          </h2>
          <p className="text-neutral-400 text-xs mt-2 font-bold uppercase tracking-[0.2em]">
            {t.wikiSubtitle}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center bg-neutral-900 border-2 border-neutral-700 text-white hover:text-rage-red hover:border-rage-red transition-all rounded-lg text-2xl"
        >
          ✕
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-4 mb-6 shrink-0 border-b border-neutral-800 pb-2">
        {(['all', 'block', 'powerup', 'mechanic'] as const).map(tab => {
          const tabLabel = tab === 'all' ? t.wikiTabAll : 
                           tab === 'block' ? t.wikiTabBlocks : 
                           tab === 'powerup' ? t.wikiTabPowerups : 
                           t.wikiTabMechanics;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 font-bold text-xs tracking-widest uppercase transition-all rounded-t-lg ${
                filter === tab 
                  ? 'bg-red-900/30 text-white border-b-4 border-rage-red shadow-[inset_0_-10px_20px_rgba(255,0,68,0.2)]' 
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>

      {/* CONTENT GRID */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const isFused = item.id.startsWith('powerup_') && FUSED_WIKI_ITEMS[lang]?.[item.id];
            
            const itemTranslation = isFused 
              ? FUSED_WIKI_ITEMS[lang]?.[item.id] || FUSED_WIKI_ITEMS['en']?.[item.id]
              : (t.wikiItems as any)[item.id] || { name: item.id, desc: '' };
            
            const typeLabel = isFused 
              ? (lang === 'de' ? '⭐ LEGENDÄRES COMBO' : lang === 'es' ? '⭐ COMBO LEGENDARIO' : '⭐ LEGENDARY COMBO')
              : item.type === 'block' ? t.wikiTypeBlock : 
                item.type === 'powerup' ? t.wikiTypePowerup : 
                t.wikiTypeMechanic;

            return (
              <div 
                key={item.id} 
                className="group bg-neutral-900 border border-neutral-800 hover:border-red-900 hover:bg-neutral-800/80 transition-all duration-300 p-5 rounded-xl flex flex-col gap-4 relative overflow-hidden"
              >
                {/* Decorative background glow on hover */}
                <div className="absolute -inset-10 bg-gradient-to-br from-red-900/0 via-red-900/5 to-red-900/0 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity pointer-events-none"></div>

                {/* Icon / Render */}
                <div className="w-16 h-16 shrink-0 bg-black border border-neutral-800 rounded-lg flex items-center justify-center relative z-10 shadow-inner">
                  <div 
                    className={`w-8 h-8 flex items-center justify-center font-bold text-lg text-white ${item.renderClass || ''}`}
                    style={item.renderStyle}
                  >
                    {item.renderContent}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col relative z-10 flex-1 justify-between">
                  <div>
                    <span className={`text-[9px] uppercase tracking-widest font-black mb-1 block ${isFused ? 'text-amber-400 animate-pulse' : 'text-red-500'}`}>
                      {typeLabel}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                      {itemTranslation.name}
                    </h3>
                    <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">
                      {itemTranslation.desc}
                    </p>
                  </div>

                  {isFused && itemTranslation.recipe && (
                    <div className="mt-4 border-t border-neutral-800/80 pt-3">
                      <span className="text-[8px] uppercase tracking-wider text-neutral-500 block font-bold mb-1">
                        {lang === 'de' ? 'Fusionsrezept:' : lang === 'es' ? 'Receta de fusión:' : 'Fusion Recipe:'}
                      </span>
                      <div className="text-[10px] font-mono text-amber-500 font-bold bg-amber-950/20 border border-amber-900/30 px-2.5 py-1 rounded-md inline-block">
                        {itemTranslation.recipe}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Book;
