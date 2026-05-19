import React, { useEffect, useRef, useState } from 'react';
import { LevelData, SortMode } from '../types';
import { TRANSLATIONS } from '../constants';
import LevelPreview from './LevelPreview';
import { compressLevel, decompressLevel } from '../services/compressionService';

interface CustomLevelSelectProps {
  levels: LevelData[];
  storyCategories?: { name: string; levels: LevelData[] }[];
  onPlay: (level: LevelData) => void;
  onEdit: (level: LevelData) => void;
  onDelete: (id: string) => void;
  onImport: (levels: LevelData[]) => void;
  onPlayRun?: (levels: LevelData[], categoryName: string) => void;
  onBack: () => void;
  lang: string;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  showToast?: (msg: string) => void;
  showGhost: boolean;
  onToggleGhost: () => void;
}

const CustomLevelSelect: React.FC<CustomLevelSelectProps> = ({ 
  levels, 
  storyCategories,
  onPlay, 
  onEdit, 
  onDelete, 
  onImport, 
  onPlayRun,
  onBack, 
  lang, 
  selectedIndex, 
  setSelectedIndex, 
  sortMode, 
  onSortChange, 
  showToast, 
  showGhost, 
  onToggleGhost 
}) => {
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS['EN'];
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'custom' | 'story'>('custom');
  const [storyCategoryIndex, setStoryCategoryIndex] = useState(0);

  const currentStoryLevels = storyCategories?.[storyCategoryIndex]?.levels || [];
  const displayLevels = activeTab === 'custom' ? levels : currentStoryLevels;

  useEffect(() => {
    if (listRef.current && displayLevels.length > 0) {
      // Find element by data-index instead of direct children index for robustness
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, displayLevels, activeTab]);

  const handleExport = (level: LevelData) => {
    const compactJson = compressLevel(level);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(compactJson);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${level.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_compact.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const importedLevels: LevelData[] = [];
    let filesProcessed = 0;

    Array.from(files).forEach((file: File, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const rawJson = event.target?.result as string;
                // decompressLevel handles both legacy and compressed formats
                const json = decompressLevel(rawJson);
                const itemsToCheck = Array.isArray(json) ? json : [json];
                
                itemsToCheck.forEach((item: any, subIndex: number) => {
                    // After decompressLevel, item should be a LevelData structure
                    if (item.entities && item.start) {
                        const fileName = file.name.replace(/\.[^/.]+$/, "");
                        const newLevel: LevelData = { 
                            ...item, 
                            id: `imported_${Date.now()}_${index}_${subIndex}`, 
                            name: item.name || fileName 
                        };
                        importedLevels.push(newLevel);
                    }
                });
            } catch (err: any) {
                console.warn(`Could not parse ${file.name}`, err);
                let msg = err.message;
                if (msg === "Tampering detected in level export.") {
                    msg = lang === 'DE' ? "Der Import hat wegen Dateimanipulation nicht funktioniert." : "The import failed due to file manipulation.";
                } else if (msg === "Invalid or unsigned level data.") {
                    msg = lang === 'DE' ? "Ungültiges oder nicht signiertes Level-Format." : "Invalid or unsigned level format.";
                }
                if (showToast) {
                    showToast(lang === 'DE' 
                        ? `Fehler beim Importieren von ${file.name}:\n${msg}`
                        : `Error importing ${file.name}:\n${msg}`);
                } else {
                    alert(lang === 'DE' 
                        ? `Fehler beim Importieren von ${file.name}:\n${msg}`
                        : `Error importing ${file.name}:\n${msg}`);
                }
            } finally {
                filesProcessed++;
                if (filesProcessed === files.length) {
                    if (importedLevels.length > 0) {
                        onImport(importedLevels);
                        if (showToast) showToast(t.importSuccess + ` (${importedLevels.length})`);
                        else alert(t.importSuccess + ` (${importedLevels.length})`);
                    } else {
                        if (showToast) showToast(t.importError);
                        else alert(t.importError);
                    }
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (deleteConfirmId === id) {
          onDelete(id);
          setDeleteConfirmId(null);
      } else {
          setDeleteConfirmId(id);
          // Auto clear confirmation after 3 seconds
          setTimeout(() => {
              setDeleteConfirmId(prev => prev === id ? null : prev);
          }, 3000);
      }
  };

  const toggleSort = () => {
     if (sortMode === 'date') onSortChange('name');
     else if (sortMode === 'name') onSortChange('played');
     else onSortChange('date');
  };

  const getSortLabel = () => {
      if (sortMode === 'date') return t.sortDate;
      if (sortMode === 'name') return t.sortName;
      return t.sortPlayed;
  };

  return (
    <div className="absolute inset-0 bg-black/95 z-40 flex flex-col p-4 overflow-hidden">
      <div className="w-full h-full bg-black border-2 border-pink-900/30 shadow-[0_0_50px_rgba(255,0,100,0.1)] p-4 flex flex-col">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 shrink-0 gap-3">
           <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-2xl text-blue-400 font-arcade tracking-widest font-bold uppercase truncate flex items-center gap-2">
                {activeTab === 'custom' ? t.customLevels : (storyCategories?.[storyCategoryIndex]?.name || 'STORY')} 
                <span className="text-sm text-neutral-500 font-mono">({displayLevels.length})</span>
            </h2>
            
            <div className="flex gap-2">
              <button 
                onClick={() => { setActiveTab('custom'); setSelectedIndex(0); }}
                className={`px-4 py-1.5 text-[10px] font-arcade transition-all border-b-2 ${activeTab === 'custom' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-neutral-800 border-transparent text-neutral-500 hover:text-neutral-300'}`}
              >
                {t.customLevelsLabel || "EIGENE LEVEL"}
              </button>
              {storyCategories && (
                <button 
                  onClick={() => { setActiveTab('story'); setSelectedIndex(0); }}
                  className={`px-4 py-1.5 text-[10px] font-arcade transition-all border-b-2 ${activeTab === 'story' ? 'bg-pink-600/20 border-pink-500 text-white' : 'bg-neutral-800 border-transparent text-neutral-500 hover:text-neutral-300'}`}
                >
                  {t.storyLevels || "STORY LEVEL"}
                </button>
              )}
            </div>
           </div>
           
           <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                {activeTab === 'story' && storyCategories && (
                  <div className="flex gap-1 items-center">
                    {onPlayRun && (
                      <button 
                        onClick={() => onPlayRun(currentStoryLevels, storyCategories[storyCategoryIndex]?.name || 'STORY')}
                        className="px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white text-[10px] md:text-sm font-arcade font-bold mr-2 shadow-[0_2px_0_#9d174d] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2"
                      >
                        <span className="text-xs">▶▶</span> {t.playAll || "ALLE SPIELEN"}
                      </button>
                    )}
                    <div className="flex gap-1 items-center bg-neutral-900 p-1 rounded border border-neutral-700 mr-2">
                       <button 
                         onClick={() => { setStoryCategoryIndex(prev => Math.max(0, prev - 1)); setSelectedIndex(0); }}
                         disabled={storyCategoryIndex === 0}
                         className="w-6 h-6 flex items-center justify-center bg-black/40 hover:bg-white/10 disabled:opacity-30 rounded text-white"
                       >◀</button>
                       <span className="text-[9px] font-arcade text-white px-2 whitespace-nowrap min-w-[80px] text-center">{storyCategories[storyCategoryIndex]?.name}</span>
                       <button 
                         onClick={() => { setStoryCategoryIndex(prev => Math.min(storyCategories.length - 1, prev + 1)); setSelectedIndex(0); }}
                         disabled={storyCategoryIndex === storyCategories.length - 1}
                         className="w-6 h-6 flex items-center justify-center bg-black/40 hover:bg-white/10 disabled:opacity-30 rounded text-white"
                       >▶</button>
                    </div>
                  </div>
                )}
               {activeTab === 'custom' && (
                 <>
                  <button onClick={toggleSort} className="px-3 py-1 bg-neutral-800 border border-neutral-600 hover:bg-neutral-700 text-yellow-400 text-[10px] md:text-xs font-arcade font-bold whitespace-nowrap">{t.sort}: {getSortLabel()}</button>
                  <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1 bg-neutral-800 border border-neutral-600 hover:bg-neutral-700 text-white text-[10px] md:text-xs font-arcade whitespace-nowrap">{t.import}</button>
                 </>
               )}
               <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" multiple />
           </div>
        </div>

        {/* Level List Container */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar border border-neutral-900 bg-neutral-950/50" ref={listRef}>
            {displayLevels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-600 font-arcade text-sm gap-2">
                <p>{activeTab === 'custom' ? t.noCustomLevels : 'KEINE STORY LEVEL'}</p>
                {activeTab === 'custom' && <button onClick={() => fileInputRef.current?.click()} className="text-blue-400 hover:text-white underline">IMPORT LEVELS</button>}
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-2">
              {(() => {
                  const normalLevels = displayLevels.filter(l => !l.isBrawler);
                  const brawlerLevels = displayLevels.filter(l => l.isBrawler);
                  
                  const renderLevel = (level: LevelData, index: number) => {
                    const isDraft = level.isVerified === false;
                    const isConfirming = deleteConfirmId === level.id;
                    const isSelected = index === selectedIndex;
                    const isStory = activeTab === 'story';
                    
                    return (
                        <div 
                            key={level.id}
                            data-index={index}
                            onClick={() => setSelectedIndex(index)}
                            className={`group flex items-center justify-between p-2 cursor-pointer border-l-4 transition-all
                                ${isSelected ? 'bg-neutral-800 border-l-rage-red text-white shadow-md' : 'bg-neutral-900/40 border-l-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'}
                            `}
                        >
                          {/* Left: Info */}
                          <div className="flex items-center gap-3 min-w-0 flex-1" onClick={(e) => { e.stopPropagation(); setSelectedIndex(index); }}>
                              <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                      {isDraft && <span className="text-[9px] bg-yellow-900 text-yellow-200 px-1 rounded font-bold">{t.draft}</span>}
                                      <span className={`text-[9px] px-1 rounded font-bold ${level.isBrawler ? 'bg-rage-red text-white' : 'bg-blue-900 text-blue-200'}`}>
                                          {level.isBrawler ? 'BRAWLER' : 'NORMAL'}
                                      </span>
                                      {level.autoScroll ? (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-arcade bg-purple-600 text-white shadow-[0_0_5px_rgba(147,51,234,0.5)]">
                                            {t.scrollMode}: {level.autoScrollSpeed || 150}
                                          </span>
                                      ) : (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-arcade bg-neutral-800 text-neutral-500">
                                            {t.scrollMode}: OFF
                                          </span>
                                      )}
                                      {level.allowedAbility && level.allowedAbility !== 'none' && (
                                          <span className="text-[9px] px-1 rounded font-bold bg-cyan-900 text-cyan-200">
                                              {level.allowedAbility === 'double_jump' ? t.abDoubleJump : 
                                               level.allowedAbility === 'hook' ? t.abHook : 
                                               level.allowedAbility === 'build' ? t.abBuild : String(level.allowedAbility).toUpperCase()}
                                          </span>
                                      )}
                                      <span className={`font-bold font-arcade truncate text-xs md:text-sm ${isSelected ? 'text-yellow-400' : ''}`}>{level.name}</span>
                                  </div>
                                  <div className="flex gap-2 text-[9px] font-mono opacity-60">
                                      <span>{(level.lastPlayed && !isStory) ? new Date(level.lastPlayed).toLocaleDateString() : (isStory ? 'OFFICIAL' : 'NEW')}</span>
                                      <span className="truncate hidden sm:inline">ID: {level.id.slice(-6)}</span>
                                  </div>
                              </div>
                          </div>

                           {/* Right: Actions */}
                          <div className="flex items-center gap-2 ml-2">
                              <button 
                                  disabled={isDraft}
                                  onClick={(e) => { e.stopPropagation(); onPlay(level); }}
                                  className={`px-3 py-1 text-[10px] font-bold font-arcade border ${isDraft ? 'border-neutral-700 text-neutral-600 cursor-not-allowed' : 'bg-green-900/30 border-green-800 text-green-500 hover:bg-green-800 hover:text-white'}`}
                              >
                                  {t.playLevel}
                              </button>
                              
                              {!isStory && (
                                <>
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); onEdit(level); }}
                                      className="px-2 py-1 bg-blue-900/30 border border-blue-800 text-blue-500 hover:bg-blue-800 hover:text-white text-[10px] font-bold font-arcade"
                                  >
                                      {t.edit}
                                  </button>
                                  
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); handleExport(level); }} 
                                      className="px-2.5 py-1 bg-yellow-900/20 border border-yellow-800/50 text-yellow-500 hover:bg-yellow-700 hover:text-white transition-colors flex items-center justify-center" 
                                      title="Export"
                                  >
                                      <span className="text-xs">⬇</span>
                                  </button>

                                  <button 
                                      onClick={(e) => handleDeleteClick(e, level.id)}
                                      className={`px-2 py-1 text-[10px] font-bold font-arcade transition-colors ${isConfirming ? 'bg-red-600 text-white' : 'text-red-500 hover:text-red-300'}`}
                                  >
                                      {isConfirming ? "?" : "X"}
                                  </button>
                                </>
                              )}
                          </div>
                        </div>
                    );
                  };

                  return (
                      <>
                        {normalLevels.length > 0 && (
                            <>
                                <h3 className="text-neutral-500 font-arcade text-xs p-2 border-b border-neutral-800">{activeTab === 'story' ? 'NORMAL' : 'NORMAL LEVELS'}</h3>
                                {normalLevels.map((l) => renderLevel(l, displayLevels.indexOf(l)))}
                            </>
                        )}
                        {brawlerLevels.length > 0 && (
                            <>
                                <h3 className="text-neutral-500 font-arcade text-xs p-2 border-b border-neutral-800 mt-4">{activeTab === 'story' ? 'BRAWLER' : 'BRAWLER LEVELS'}</h3>
                                {brawlerLevels.map((l) => renderLevel(l, displayLevels.indexOf(l)))}
                            </>
                        )}
                      </>
                  );
              })()}
            </div>
          )}
          </div>

          {/* Preview Panel */}
          {displayLevels.length > 0 && selectedIndex >= 0 && selectedIndex < displayLevels.length && (
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-3 p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg animate-fade-in">
                <div className="text-[10px] text-neutral-500 font-arcade tracking-widest uppercase mb-1">Level Preview</div>
                <div className="aspect-video w-full relative">
                    <LevelPreview 
                        level={displayLevels[selectedIndex]} 
                        width={256} 
                        height={144} 
                        className="w-full h-full"
                    />
                </div>
                <div className="flex flex-col gap-1 mt-2 font-arcade">
                    <div className="text-xs text-yellow-400 truncate">{displayLevels[selectedIndex].name}</div>
                    <div className="flex items-center justify-between text-[9px] font-mono border-b border-neutral-800/50 pb-1">
                        <span className="text-neutral-500 uppercase">{t.autoScroll || "AUTO-SCROLL"}:</span>
                        <span className={displayLevels[selectedIndex].autoScroll ? "text-purple-400 font-bold" : "text-neutral-600"}>
                            {displayLevels[selectedIndex].autoScroll ? "ON" : "OFF"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono border-b border-neutral-800/50 pb-1">
                        <span className="text-neutral-500 uppercase">ENTITIES:</span>
                        <span className="text-neutral-300 font-bold">{displayLevels[selectedIndex].entities.length}</span>
                    </div>
                    {displayLevels[selectedIndex].autoScroll && (
                        <div className="flex items-center justify-between text-[9px] font-mono border-b border-neutral-800/50 pb-1">
                            <span className="text-neutral-500 uppercase">{t.scrollSpeed}:</span>
                            <span className="text-purple-300 font-bold">{displayLevels[selectedIndex].autoScrollSpeed || 150}</span>
                        </div>
                    )}
                    {displayLevels[selectedIndex].allowedAbility && displayLevels[selectedIndex].allowedAbility !== 'none' && (
                        <div className="text-[9px] text-cyan-400 font-mono uppercase">
                            {t.ability}: {displayLevels[selectedIndex].allowedAbility === 'double_jump' ? t.abDoubleJump : 
                                         displayLevels[selectedIndex].allowedAbility === 'hook' ? t.abHook : 
                                         displayLevels[selectedIndex].allowedAbility === 'build' ? t.abBuild : String(displayLevels[selectedIndex].allowedAbility).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="mt-auto pt-4 border-t border-neutral-800 flex flex-col gap-3">
                    <div 
                        onClick={onToggleGhost}
                        className={`p-2 border cursor-pointer flex justify-center items-center gap-4 transition-colors ${showGhost ? 'border-green-900/50 bg-green-900/10' : 'border-red-900/50 bg-red-900/10'}`}
                    >
                        <span className="text-[10px] font-arcade text-neutral-400">{t.ghostRun}:</span>
                        <span className={`text-[10px] font-arcade font-bold ${showGhost ? 'text-green-400' : 'text-red-400'}`}>
                            {showGhost ? "ON" : "OFF"}
                        </span>
                    </div>

                    <button 
                        onClick={() => onPlay(displayLevels[selectedIndex])}
                        className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-arcade text-xs shadow-[0_4px_0_#166534] active:translate-y-1 active:shadow-none transition-all"
                    >
                        {t.playLevel}
                    </button>
                </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
            <button onClick={onBack} className="w-full md:w-auto px-8 py-3 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold font-arcade text-xs transition-colors shrink-0">{t.back}</button>
        </div>
      </div>
    </div>
  );
};

export default CustomLevelSelect;