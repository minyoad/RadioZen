import React from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Volume2, ListMusic } from 'lucide-react';
import { Station } from '../types';

interface MobileFullPlayerProps {
  station: Station | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  onTogglePlaylist: () => void;
}

export const MobileFullPlayer: React.FC<MobileFullPlayerProps> = ({
  station,
  isPlaying,
  onTogglePlay,
  onClose,
  onNext,
  onPrev,
  volume,
  onVolumeChange,
  onTogglePlaylist
}) => {
  if (!station) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[60] flex flex-col animate-in slide-in-from-bottom duration-300 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-6 mt-safe-top">
        <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 transition-colors">
          <ChevronDown size={28} />
        </button>
        <div className="text-center">
          <span className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">正在播放</span>
        </div>
        <button 
          onClick={onTogglePlaylist}
          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 transition-colors"
        >
          <ListMusic size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-8 pb-8">
        {/* Cover */}
        <div className="flex-1 flex items-center justify-center py-4 min-h-0">
          <div className="relative w-full aspect-square max-h-[350px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-violet-500/20">
            <img 
              src={station.coverUrl} 
              alt={station.name} 
              className={`w-full h-full object-cover ${isPlaying ? 'scale-110' : 'scale-100'} transition-transform duration-[10s] ease-linear`}
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden mr-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white truncate transition-colors">{station.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg truncate mt-1 transition-colors">{station.description}</p>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
             {station.tags.map(tag => (
                 <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-300 transition-colors">{tag}</span>
             ))}
             <span className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-500 dark:text-slate-400 ml-auto transition-colors">{station.frequency || 'WEB'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8">
           {/* Visual Progress */}
           <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden transition-colors">
              <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 w-full animate-pulse-slow"></div>
           </div>

           <div className="flex items-center justify-between px-4">
              <button onClick={onPrev} className="text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all p-2">
                <SkipBack size={32} />
              </button>
              <button 
                onClick={onTogglePlay}
                className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/10"
              >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={onNext} className="text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all p-2">
                <SkipForward size={32} />
              </button>
           </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-4 px-4 pb-safe-bottom">
            <Volume2 size={20} className="text-slate-400 dark:text-slate-500" />
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-slate-900 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full transition-colors"
            />
        </div>
      </div>
    </div>
  );
};