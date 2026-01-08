import React from 'react';
import { X, Play, BarChart2, Trash2, ListMusic } from 'lucide-react';
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
    <div 
      className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 mt-safe-top transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ListMusic className="text-violet-600 dark:text-violet-500" size={24} />
          <span>播放列表</span>
          <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{playlist.length}</span>
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-80px)] p-2 space-y-1 pb-safe-bottom">
        {playlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <ListMusic size={48} className="opacity-20 mb-4" />
            <p>播放列表为空</p>
            <p className="text-sm text-slate-400 mt-2">添加一些电台开始收听吧</p>
          </div>
        ) : (
          playlist.map((station, index) => {
            const isActive = currentStation?.id === station.id;
            return (
              <div 
                key={`${station.id}-${index}`}
                className={`group flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  isActive ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {/* Clickable Area for Playing */}
                <div 
                  className="flex flex-1 items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => onPlay(station)}
                >
                  <div className="relative w-12 h-12 md:w-10 md:h-10 flex-shrink-0">
                    <img 
                      src={station.coverUrl} 
                      alt={station.name} 
                      className={`w-full h-full rounded object-cover ${isActive && isPlaying ? 'opacity-50' : ''}`} 
                    />
                    {isActive && isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BarChart2 size={16} className="text-violet-600 dark:text-violet-400 animate-pulse" />
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 ${isActive ? 'hidden' : ''}`}>
                      <Play size={16} className="text-white" fill="currentColor" />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-base md:text-sm font-medium truncate transition-colors ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {station.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                      <span className="truncate max-w-[100px]">{station.category}</span>
                      <span>{station.frequency}</span>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(station.id);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="从列表移除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};