export const getBrawlerStats = (bClass?: string, gameMode?: string) => {
  // Wenn nicht im Brawler Modus, verwende immer die "standard" Werte
  const c = gameMode === "brawler" ? bClass || "standard" : "standard";
  switch (c) {
    case "standard":
      return {
        lives: 10,
        speedMul: 1,
        jumpMul: 1,
        dashCooldownBase: 60,
        kbDealt: 1,
        kbTaken: 1,
        dashDamage: 1,
        gravityMul: 1,
      };
    case "fighter": // + Stronger Stats & KB | - Much longer Dash CD
      return {
        lives: 12,
        speedMul: 1.1,
        jumpMul: 0.7,
        dashCooldownBase: 90,
        kbDealt: 1.5,
        kbTaken: 0.85,
        dashDamage: 1,
        gravityMul: 1.1,
      };
    case "tank": // + Mehr Leben & Resistenz | - Sehr langsam
      return {
        lives: 15,
        speedMul: 0.7,
        jumpMul: 0.8,
        dashCooldownBase: 70,
        kbDealt: 1.1,
        kbTaken: 0.6,
        dashDamage: 1,
        gravityMul: 1.2,
      };
    case "dasher": // + Sehr kurzer Dash CD | - Weniger Leben
      return {
        lives: 8,
        speedMul: 1.2,
        jumpMul: 1,
        dashCooldownBase: 25,
        kbDealt: 0.9,
        kbTaken: 1.2,
        dashDamage: 1,
        gravityMul: 1,
      };
    case "jumper": // + Dreifachsprung & Höher | - Weniger Leben
      return {
        lives: 8,
        speedMul: 1,
        jumpMul: 1.2,
        dashCooldownBase: 60,
        kbDealt: 1,
        kbTaken: 1.1,
        dashDamage: 1,
        gravityMul: 0.9,
      };
    case "ninja": // + Sehr schnell & hoch | - Sehr wenig Leben
      return {
        lives: 7,
        speedMul: 1.15,
        jumpMul: 1.15,
        dashCooldownBase: 50,
        kbDealt: 0.6,
        kbTaken: 1.4,
        dashDamage: 1,
        gravityMul: 0.8,
      };
    case "heavy": // + Gewaltiger Knockback | - Langsam & Massiv
      return {
        lives: 13,
        speedMul: 0.8,
        jumpMul: 0.9,
        dashCooldownBase: 100,
        kbDealt: 2.2,
        kbTaken: 0.8,
        dashDamage: 2,
        gravityMul: 1.5,
      };
    case "vampire": // + Heilt bei Treffer | - Extrem wenig Leben
      return {
        lives: 6,
        speedMul: 1.2,
        jumpMul: 1.2,
        dashCooldownBase: 55,
        kbDealt: 1,
        kbTaken: 1,
        dashDamage: 1,
        gravityMul: 1,
      };
    default:
      return {
        lives: 10,
        speedMul: 1,
        jumpMul: 1,
        dashCooldownBase: 60,
        kbDealt: 1,
        kbTaken: 1,
        dashDamage: 1,
        gravityMul: 1,
      };
  }
};

export const getBrawlerLives = (bClass?: string, gameMode?: string) => {
  return getBrawlerStats(bClass, gameMode).lives;
};
