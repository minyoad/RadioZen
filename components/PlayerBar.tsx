import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, List, Radio } from 'lucide-react';
import { Station } from '../types';

interface PlayerBarProps {
  currentStation: Station | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onNext: () => void;
  onPrev: () => void;
  togglePlaylist: () => void;
  showPlaylist: boolean;
  onOpenFullPlayer?: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentStation,
  isPlaying,
  onTogglePlay,
  volume,
  onVolumeChange,
  onToggleMute,
  isMuted,
  onNext,
  onPrev,
  togglePlaylist,
  showPlaylist,
  onOpenFullPlayer
}) => {
  if (!currentStation) {
    return (
      <div className="hidden md:flex h-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 items-center justify-center text-slate-400 dark:text-slate-500 z-40 fixed bottom-0 left-0 right-0 transition-colors">
        <Radio className="mr-2 animate-pulse" /> 选择一个电台开始收听
      </div>
    );
  }

  return (
    // Mobile: fixed above bottom nav (bottom-16), height 16 (64px)
    // Desktop: fixed bottom-0, height 24 (96px)
    <div 
      className="fixed z-40 left-0 right-0 
        bottom-16 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:bottom-0 md:h-24 md:bg-white/95 md:dark:bg-slate-900/95 md:backdrop-blur-md 
        transition-all duration-300"
      onClick={() => window.innerWidth < 768 && onOpenFullPlayer?.()}
    >
      <div className="h-full px-4 md:px-8 grid grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center gap-4">
        
        {/* Track Info */}
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <img 
            src={currentStation.coverUrl} 
            alt={currentStation.name} 
            className={`w-10 h-10 md:w-14 md:h-14 rounded md:rounded-lg shadow-lg object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
            style={{ animationDuration: '10s' }}
          />
          <div className="overflow-hidden min-w-0">
            <h4 className="font-bold truncate text-sm md:text-base text-slate-900 dark:text-white">{currentStation.name}</h4>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">{currentStation.description}</p>
          </div>
        </div>

        {/* Controls (Desktop Center) */}
        <div className="hidden md:flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-6">
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <SkipBack size={20} />
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
              className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-slate-900/20 dark:shadow-white/10"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <SkipForward size={20} />
            </button>
          </div>
          
          <div className="w-full max-w-xs flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-mono">
            <span className="text-violet-500 dark:text-violet-400 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 ${isPlaying ? '' : 'hidden'}`}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              LIVE
            </span>
            <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 w-full animate-pulse"></div>
            </div>
            <span>{currentStation.frequency || 'WEB'}</span>
          </div>
        </div>

        {/* Mobile Controls (Right) */}
        <div className="flex md:hidden items-center justify-end gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all"
          >
            <SkipForward size={24} />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
            className="w-10 h-10 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-full flex items-center justify-center"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
        </div>

        {/* Volume & Playlist Toggle (Desktop Right) */}
        <div className="hidden md:flex items-center justify-end gap-4">
          <div className="flex items-center gap-2 group">
            <button onClick={(e) => { e.stopPropagation(); onToggleMute(); }} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => { e.stopPropagation(); onVolumeChange(parseFloat(e.target.value)); }}
              onClick={(e) => e.stopPropagation()}
              className="w-24 h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-slate-900 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            />
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); togglePlaylist(); }}
            className={`p-2 rounded-lg transition-colors ${showPlaylist ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};