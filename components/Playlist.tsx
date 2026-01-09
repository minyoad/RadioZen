import React from 'react';
import { X, Play, BarChart2, Trash2, ListMusic, Radio } from 'lucide-react';
import { Station } from '../types';

interface PlaylistProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Station[];
  currentStation: Station | null;
  onPlay: (station: Station) => void;
  onRemove: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  isPlaying: boolean;
}

export const Playlist: React.FC<PlaylistProps> = ({ 
  isOpen, 
  onClose, 
  playlist, 
  currentStation, 
  onPlay,
  onRemove,
  onReorder,
  isPlaying 
}) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[65] md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-80 bg-white/95 dark:bg-slate-900/95 md:backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] z-[70] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 dark:border-slate-800/60 mt-safe-top shrink-0">
          <h2 className="text-base md:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
            <ListMusic className="text-violet-600 dark:text-violet-500" size={20} />
            播放列表
            <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{playlist.length}</span>
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-3 pb-safe-bottom scrollbar-hide">
          {playlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 min-h-[300px]">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <Radio size={32} className="opacity-30" />
              </div>
              <p className="font-medium text-slate-600 dark:text-slate-400">列表为空</p>
              <p className="text-xs text-slate-400 mt-1">添加一些喜欢的电台吧</p>
            </div>
          ) : (
            <div className="space-y-1">
              {playlist.map((station, index) => {
                const isActive = currentStation?.id === station.id;
                return (
                  <div 
                    key={`${station.id}-${index}`}
                    className={`group relative flex items-center gap-3 p-2 rounded-xl transition-all duration-200 border ${
                      isActive 
                        ? 'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20' 
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-800'
                    }`}
                  >
                    {/* Clickable Area for Playing */}
                    <div 
                      className="flex flex-1 items-center gap-3 min-w-0 cursor-pointer"
                      onClick={() => onPlay(station)}
                    >
                      {/* Cover Image */}
                      <div className="relative w-12 h-12 md:w-10 md:h-10 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm">
                        <img 
                          src={station.coverUrl} 
                          alt={station.name} 
                          className={`w-full h-full object-cover transition-opacity duration-300 ${isActive && isPlaying ? 'opacity-40' : ''}`} 
                        />
                        
                        {/* Playing Visualizer */}
                        {isActive && isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex gap-[2px] items-end h-4">
                                <span className="w-1 bg-violet-600 dark:bg-violet-400 animate-[music-bar_0.5s_ease-in-out_infinite]" style={{animationDelay: '0ms'}}></span>
                                <span className="w-1 bg-violet-600 dark:bg-violet-400 animate-[music-bar_0.5s_ease-in-out_infinite]" style={{animationDelay: '150ms'}}></span>
                                <span className="w-1 bg-violet-600 dark:bg-violet-400 animate-[music-bar_0.5s_ease-in-out_infinite]" style={{animationDelay: '300ms'}}></span>
                            </div>
                          </div>
                        )}
                        
                        {/* Hover Play Icon (Desktop) */}
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isActive && isPlaying ? 'hidden' : ''}`}>
                          <Play size={18} className="text-white fill-white" />
                        </div>
                      </div>
                      
                      {/* Text Info */}
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-sm font-semibold truncate transition-colors ${isActive ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-200'}`}>
                          {station.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs mt-0.5">
                           <span className={`truncate max-w-[80px] px-1.5 py-0.5 rounded text-[10px] font-medium ${
                               isActive 
                               ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300' 
                               : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                           }`}>
                               {station.category}
                           </span>
                           {station.frequency && (
                               <span className="text-slate-400 dark:text-slate-500 font-medium text-[10px]">{station.frequency}</span>
                           )}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(station.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                      title="从列表移除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* CSS for custom music bar animation */}
      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>
    </>
  );
};