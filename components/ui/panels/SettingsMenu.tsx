
import React from 'react';
import { GameSettings, Language } from '../../../types';

interface SettingsMenuProps {
  t: any;
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  lang: Language;
  menuSelection: number;
  setMenuSelection: (idx: number) => void;
  onBack: () => void;
  onKeybindings: () => void;
  FPS_OPTIONS: number[];
  UI_SCALE_OPTIONS: number[];
  RESOLUTION_OPTIONS: number[];
  setPlayerName: (name: string) => void;
  MenuButton: React.FC<any>;
  SettingsSlider: React.FC<any>;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  t,
  settings,
  setSettings,
  lang,
  menuSelection,
  setMenuSelection,
  onBack,
  onKeybindings,
  FPS_OPTIONS,
  UI_SCALE_OPTIONS,
  RESOLUTION_OPTIONS,
  setPlayerName,
  MenuButton,
  SettingsSlider,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white z-30 overflow-hidden">
      <div className="w-full max-w-5xl aspect-video bg-black/80 flex flex-col items-center justify-between py-6 px-8">
        <h2 className="text-2xl text-rage-red uppercase tracking-widest shrink-0">{t.settings}</h2>
        <div className="flex gap-12 w-full justify-center flex-1 min-h-0">
          
          {/* LEFT COLUMN: Player & Audio */}
          <div className="flex flex-col gap-2 w-80 h-full justify-center">
            <h3 className="text-lg text-neutral-400 font-arcade">
              {lang === Language.DE ? "Spieler & Audio" : lang === Language.ES ? "Jugador y Audio" : "Player & Audio"}
            </h3>
            
            <div
              className={`p-2 border transition-all ${menuSelection === 0 ? "border-white bg-neutral-800" : "border-transparent"}`}
              onMouseEnter={() => setMenuSelection(0)}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="uppercase text-[8px] font-arcade text-neutral-400 w-full text-left ml-2">
                  {t.playerNameLabel || "PLAYER NAME"}
                </span>
                <div className="w-full bg-black border border-neutral-700 p-1">
                  <input
                    type="text"
                    value={settings.playerName || ""}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                      setSettings((p) => ({ ...p, playerName: val }));
                      setPlayerName(val);
                    }}
                    className="w-full bg-transparent outline-none text-center text-white font-arcade uppercase placeholder:text-neutral-800 text-sm"
                    placeholder="???"
                  />
                </div>
              </div>
              <div className="text-[7px] text-neutral-600 mt-1 text-center uppercase tracking-widest">
                Max. 10 {lang === Language.DE ? "Zeichen" : lang === Language.ES ? "Caract." : "Chars"}
              </div>
            </div>

            <div className="h-10">
              <MenuButton
                index={1}
                label={t.keybindings}
                onClick={onKeybindings}
                isSelected={menuSelection === 1}
                onHover={setMenuSelection}
              />
            </div>

            <div className="scale-90 origin-left">
              <SettingsSlider
                label={t.sfx}
                value={settings.sfxVolume}
                index={2}
                colorClass="bg-troll-green"
                onChange={(v: number) =>
                  setSettings((p) => ({ ...p, sfxVolume: v }))
                }
                isSelected={menuSelection === 2}
                onHover={setMenuSelection}
              />
            </div>

            <div className="scale-90 origin-left">
              <SettingsSlider
                label={t.deathSounds || "DEATH SOUNDS"}
                value={settings.deathVolume ?? 0.5}
                index={3}
                colorClass="bg-red-500"
                onChange={(v: number) =>
                  setSettings((p) => ({ ...p, deathVolume: v }))
                }
                isSelected={menuSelection === 3}
                onHover={setMenuSelection}
              />
            </div>

            <div className="scale-90 origin-left">
              <SettingsSlider
                label={t.opponentOpacity || (lang === Language.DE ? "GEGNER TRANSPARENZ" : lang === Language.ES ? "TRANSPARENCIA DE RIVALES" : "OPPONENT OPACITY")}
                value={settings.opponentOpacity ?? 0.5}
                index={4}
                colorClass="bg-cyan-500"
                onChange={(v: number) =>
                  setSettings((p) => ({ ...p, opponentOpacity: v }))
                }
                isSelected={menuSelection === 4}
                onHover={setMenuSelection}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Graphics & Gameplay */}
          <div className="flex flex-col gap-2 w-80 h-full justify-center">
            <h3 className="text-lg text-neutral-400 font-arcade">
              {lang === Language.DE ? "Grafik & Gameplay" : lang === Language.ES ? "Gráficos y Juego" : "Graphics & Gameplay"}
            </h3>

            <div
              className={`p-2 border cursor-pointer ${menuSelection === 5 ? "border-white bg-neutral-800" : "border-transparent"}`}
              onMouseEnter={() => setMenuSelection(5)}
              onClick={() => {
                setSettings((p) => {
                  const currentIndex = FPS_OPTIONS.indexOf(p.fpsCap);
                  let nextIndex = currentIndex + 1;
                  if (nextIndex >= FPS_OPTIONS.length) nextIndex = 0;
                  return { ...p, fpsCap: FPS_OPTIONS[nextIndex] };
                });
              }}
            >
              <div className="flex justify-between items-center text-xs">
                <span>{t.maxFps || "MAX FPS"}</span>
                <span className="text-blue-400 font-bold">
                  {settings.fpsCap === 0 ? (t.unlimited || "UNLIMITED") : settings.fpsCap}
                </span>
              </div>
            </div>

            <div
              className={`p-2 border cursor-pointer ${menuSelection === 6 ? "border-white bg-neutral-800" : "border-transparent"}`}
              onMouseEnter={() => setMenuSelection(6)}
              onClick={() => {
                setSettings((p) => {
                  const currentScale = p.uiScale || 1;
                  const currentIndex = UI_SCALE_OPTIONS.indexOf(currentScale) !== -1 ? UI_SCALE_OPTIONS.indexOf(currentScale) : 2;
                  let nextIndex = currentIndex + 1;
                  if (nextIndex >= UI_SCALE_OPTIONS.length) nextIndex = 0;
                  return { ...p, uiScale: UI_SCALE_OPTIONS[nextIndex] };
                });
              }}
            >
              <div className="flex justify-between items-center text-xs">
                <span>{t.uiSize || "UI SIZE"}</span>
                <span className="text-blue-400 font-bold">
                  {Math.round((settings.uiScale || 1) * 100)}%
                </span>
              </div>
            </div>

            <div
              className={`p-2 border cursor-pointer ${menuSelection === 7 ? "border-white bg-neutral-800" : "border-transparent"}`}
              onMouseEnter={() => setMenuSelection(7)}
              onClick={() => {
                setSettings((p) => {
                  const currentScale = p.resolutionScale || 1080;
                  const currentIndex = RESOLUTION_OPTIONS.indexOf(currentScale) !== -1 ? RESOLUTION_OPTIONS.indexOf(currentScale) : 1;
                  let nextIndex = currentIndex + 1;
                  if (nextIndex >= RESOLUTION_OPTIONS.length) nextIndex = 0;
                  return { ...p, resolutionScale: RESOLUTION_OPTIONS[nextIndex] };
                });
              }}
            >
              <div className="flex justify-between items-center text-xs">
                <span>{lang === Language.DE ? "AUFLÖSUNG" : lang === Language.ES ? "RESOLUCIÓN" : "RESOLUTION"}</span>
                <span className="text-blue-400 font-bold">
                  {settings.resolutionScale === 720 ? "720p" : settings.resolutionScale === 1080 ? "1080p" : settings.resolutionScale === 1440 ? "1440p" : "2160p"}
                </span>
              </div>
            </div>

            <div className="scale-90 origin-left mt-[-8px]">
              <SettingsSlider
                label={lang === Language.DE ? "BILDSCHIRM-WACKELN" : lang === Language.ES ? "AGITACIÓN DE PANTALLA" : "SCREEN SHAKE"}
                value={settings.screenShake ?? 1}
                index={8}
                colorClass="bg-yellow-500"
                onChange={(v: number) =>
                  setSettings((p) => ({ ...p, screenShake: v }))
                }
                isSelected={menuSelection === 8}
                onHover={setMenuSelection}
              />
            </div>

            <div
              className={`p-2 border cursor-pointer mt-[-8px] ${menuSelection === 9 ? "border-white bg-neutral-800" : "border-transparent"}`}
              onMouseEnter={() => setMenuSelection(9)}
              onClick={() => {
                setSettings((p) => ({ ...p, invertXOnGravityReverse: !p.invertXOnGravityReverse }));
              }}
            >
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between items-center">
                  <span>{lang === Language.DE ? "INVERTIERE L/R" : lang === Language.ES ? "INVERTIR L/R" : "INVERT L/R"}</span>
                  <span className="text-blue-400 font-bold">
                    {settings.invertXOnGravityReverse ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`p-2 border cursor-pointer ${menuSelection === 10 ? "border-white bg-neutral-800" : "border-transparent"}`}
              onMouseEnter={() => setMenuSelection(10)}
              onClick={() => {
                setSettings((p) => ({ ...p, invertYOnGravityReverse: !p.invertYOnGravityReverse }));
              }}
            >
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between items-center">
                  <span>{lang === Language.DE ? "INVERTIERE O/U" : lang === Language.ES ? "INVERTIR ARRIBA/ABAJO" : "INVERT U/D"}</span>
                  <span className="text-blue-400 font-bold">
                    {settings.invertYOnGravityReverse ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-center items-end w-full px-8 shrink-0 pb-4 h-20">
          <MenuButton
            index={11}
            label={t.back || t.backToMenu || "ZURÜCK"}
            onClick={onBack}
            isSelected={menuSelection === 11}
            onHover={setMenuSelection}
            className="w-fit min-w-[180px] px-8"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
