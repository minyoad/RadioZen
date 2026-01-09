import React from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Volume2, ListMusic, Loader2, AlertCircle } from 'lucide-react';
import { Station, PlaybackStatus } from '../types';

interface MobileFullPlayerProps {
  station: Station | null;
  isPlaying: boolean;
  playbackStatus?: PlaybackStatus;
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
  playbackStatus = 'idle',
  onTogglePlay,
  onClose,
  onNext,
  onPrev,
  volume,
  onVolumeChange,
  onTogglePlaylist
}) => {
  if (!station) return null;

  const renderPlayButton = () => {
    if (playbackStatus === 'buffering') {
      // Use currentColor (inherited from text class) instead of hardcoded white/black
      return <Loader2 size={40} className="animate-spin" strokeWidth={3} />;
    }
    if (playbackStatus === 'error') {
      return <AlertCircle size={40} />;
    }
    if (isPlaying) {
      return <Pause size={32} fill="currentColor" />;
    }
    return <Play size={32} fill="currentColor" className="ml-1" />;
  };

  const buttonColorClass = playbackStatus === 'error' 
    ? "bg-red-500 dark:bg-red-500 text-white" 
    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900";

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[60] flex flex-col animate-in slide-in-from-bottom duration-300 transition-colors">
      {/* Header */}
      <div className="flex-none flex items-center justify-between p-6 mt-safe-top">
        <button 
          onClick={onClose} 
          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-3 -ml-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all"
        >
          <ChevronDown size={28} />
        </button>
        <div className="text-center">
          <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${
              playbackStatus === 'buffering' ? 'bg-violet-100 text-violet-600 border-violet-200' :
              playbackStatus === 'error' ? 'bg-red-100 text-red-600 border-red-200' :
              'text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-800'
          }`}>
             {playbackStatus === 'buffering' ? '正在缓冲...' : 
              playbackStatus === 'error' ? '播放失败' : '正在播放'}
          </span>
        </div>
        <button 
          onClick={onTogglePlaylist}
          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-3 -mr-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all"
        >
          <ListMusic size={24} />
        </button>
      </div>

      {/* Content - Scrollable to prevent clipping on small screens */}
      <div className="flex-1 flex flex-col px-8 overflow-y-auto scrollbar-hide">
        {/* Cover */}
        <div className="flex-shrink-0 flex items-center justify-center py-4">
          <div className="relative w-full aspect-square max-h-[350px] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-300/60 dark:shadow-violet-900/20 border border-slate-200/60 dark:border-white/5 ring-1 ring-white/20 dark:ring-black/20">
            <img 
              src={station.coverUrl} 
              alt={station.name} 
              className={`w-full h-full object-cover ${isPlaying ? 'scale-110' : 'scale-100'} transition-transform duration-[15s] ease-linear`}
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 mb-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden mr-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white truncate transition-colors leading-tight">{station.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg truncate mt-1.5 transition-colors font-medium">{station.description}</p>
            </div>
          </div>
          
          <div className="mt-5 flex gap-2 flex-wrap">
             {station.tags.map(tag => (
                 <span key={tag} className="px-3 py-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors shadow-sm">{tag}</span>
             ))}
             <span className="px-3 py-1 bg-slate-200/50 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 ml-auto transition-colors">{station.frequency || 'WEB'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex-shrink-0">
           {/* Visual Progress */}
           <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-10 overflow-hidden transition-colors">
              <div className={`h-full w-full ${isPlaying ? 'animate-pulse-slow' : ''} ${playbackStatus === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}></div>
           </div>

           <div className="flex items-center justify-between px-2">
              <button onClick={onPrev} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white active:scale-95 transition-all p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <SkipBack size={32} />
              </button>
              <button 
                onClick={onTogglePlay}
                className={`w-20 h-20 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10 ring-4 ring-slate-100 dark:ring-slate-900 ${buttonColorClass}`}
              >
                {renderPlayButton()}
              </button>
              <button onClick={onNext} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white active:scale-95 transition-all p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <SkipForward size={32} />
              </button>
           </div>
        </div>

        {/* Volume - Pushed to bottom */}
        <div className="mt-auto pb-8 pb-safe-bottom flex-shrink-0">
            <div className="flex items-center gap-4 px-2">
                <Volume2 size={20} className="text-slate-400 dark:text-slate-500" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-violet-600 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md transition-colors"
                />
            </div>
        </div>
      </div>
    </div>
  );
};