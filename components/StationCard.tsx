import React from 'react';
import { Play, Pause, Signal, Heart, ListPlus } from 'lucide-react';
import { Station } from '../types';

interface StationCardProps {
  station: Station;
  isPlaying: boolean;
  isCurrent: boolean;
  isFavorite: boolean;
  onPlay: (station: Station) => void;
  onClick: (station: Station) => void;
  onToggleFavorite: (id: string) => void;
  onAddToPlaylist: (station: Station) => void;
  onTagClick: (tag: string) => void;
}

export const StationCard: React.FC<StationCardProps> = ({ 
  station, 
  isPlaying, 
  isCurrent, 
  isFavorite,
  onPlay, 
  onClick,
  onToggleFavorite,
  onAddToPlaylist,
  onTagClick
}) => {
  return (
    <div 
      onClick={() => onClick(station)}
      className="group relative bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl border border-slate-200 dark:border-white/5 hover:border-violet-200 dark:hover:border-white/10 cursor-pointer h-full flex flex-col shadow-sm"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg flex-shrink-0 bg-slate-100 dark:bg-slate-800">
        <img 
          src={station.coverUrl} 
          alt={station.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Top Right Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(station.id);
            }}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md transition-all hover:scale-110"
            title="收藏"
          >
            <Heart 
              size={18} 
              className={`transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white/90 hover:text-white'}`} 
            />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist(station);
            }}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md transition-all hover:scale-110 text-white/90 hover:text-white"
            title="添加到播放列表"
          >
            <ListPlus size={18} />
          </button>
        </div>
        
        {/* Hover Overlay / Active State */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPlay(station);
            }}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-xl hover:scale-105 transition-transform"
          >
            {isCurrent && isPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </button>
        </div>

        {isCurrent && isPlaying && (
          <div className="absolute bottom-2 right-2 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <Signal size={10} />
            LIVE
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1">
        <h3 className={`font-bold text-lg leading-tight truncate ${isCurrent ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-white'}`}>
          {station.name}
        </h3>
        
        {/* Description Section */}
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">
          {station.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-auto pt-3">
          {station.tags.slice(0, 2).map(tag => (
            <span 
              key={tag} 
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag);
              }}
              className="text-[10px] uppercase font-semibold bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
          {station.frequency && (
             <span className="text-[10px] uppercase font-semibold border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 px-2 py-1 rounded-md ml-auto">
             {station.frequency}
           </span>
          )}
        </div>
      </div>
    </div>
  );
};