import React, { useState, useEffect } from 'react';
import { Play, Pause, Signal, Heart, ListPlus, AlertTriangle, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Station, PlaybackStatus } from '../types';

interface StationCardProps {
  station: Station;
  isPlaying: boolean;
  playbackStatus?: PlaybackStatus;
  isCurrent: boolean;
  isFavorite: boolean;
  isUnplayable?: boolean;
  onPlay: (station: Station) => void;
  onClick: (station: Station) => void;
  onToggleFavorite: (id: string) => void;
  onAddToPlaylist: (station: Station) => void;
  onTagClick: (tag: string) => void;
  onDelete?: (id: string) => void;
}

export const StationCard: React.FC<StationCardProps> = ({ 
  station, 
  isPlaying, 
  playbackStatus = 'idle',
  isCurrent, 
  isFavorite,
  isUnplayable = false,
  onPlay, 
  onClick,
  onToggleFavorite,
  onAddToPlaylist,
  onTagClick,
  onDelete
}) => {
  const [imgSrc, setImgSrc] = useState(station.coverUrl);

  useEffect(() => {
    if (!station.coverUrl) {
      setImgSrc(`https://picsum.photos/seed/${station.id}/400/400`);
    } else {
      setImgSrc(station.coverUrl);
    }
  }, [station.coverUrl, station.id]);

  const handleImageError = () => {
    const fallbackUrl = `https://picsum.photos/seed/${station.id}/400/400`;
    if (imgSrc !== fallbackUrl) {
      setImgSrc(fallbackUrl);
    }
  };

  const renderOverlayIcon = () => {
      if (isCurrent && playbackStatus === 'buffering') {
          // Changed to text-violet-600 because the button background is white, so white loader was invisible
          return <Loader2 size={32} className="text-violet-600 animate-spin" strokeWidth={3} />;
      }
      if (isCurrent && playbackStatus === 'error') {
          return <AlertCircle size={32} className="text-red-500" />;
      }
      if (isCurrent && isPlaying) {
          return <Pause size={24} fill="currentColor" />;
      }
      return <Play size={24} fill="currentColor" className="ml-1" />;
  };

  return (
    <div 
      onClick={() => !isUnplayable && onClick(station)}
      className={`group relative bg-white dark:bg-slate-800/50 rounded-2xl p-4 transition-all duration-300 border border-slate-200 dark:border-white/5 h-full flex flex-col shadow-sm
        ${isUnplayable 
          ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900' 
          : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-xl hover:border-violet-200 dark:hover:border-white/10 cursor-pointer'
        }
        ${isCurrent && playbackStatus === 'error' ? 'border-red-200 dark:border-red-900/50' : ''}
      `}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg flex-shrink-0 bg-slate-100 dark:bg-slate-800">
        <img 
          src={imgSrc} 
          onError={handleImageError}
          alt={station.name} 
          className={`w-full h-full object-cover transition-transform duration-500 ${isUnplayable ? 'grayscale' : 'group-hover:scale-110'}`}
        />
        
        {/* Unplayable Overlay */}
        {isUnplayable && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-30">
            <AlertTriangle size={32} className="mb-2 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider">暂无法播放</span>
          </div>
        )}
        
        {/* Top Right Actions */}
        {!isUnplayable && (
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

            {station.isCustom && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(station.id);
                }}
                className="p-2 rounded-full bg-black/20 hover:bg-rose-500 backdrop-blur-md transition-all hover:scale-110 text-white/90 hover:text-white"
                title="删除自定义电台"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
        
        {/* Hover Overlay / Active State */}
        {!isUnplayable && (
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 
            ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onPlay(station);
              }}
              className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform ${isCurrent && playbackStatus === 'error' ? 'text-red-500' : 'text-black'}`}
            >
               {renderOverlayIcon()}
            </button>
          </div>
        )}

        {isCurrent && isPlaying && !isUnplayable && playbackStatus !== 'buffering' && playbackStatus !== 'error' && (
          <div className="absolute bottom-2 right-2 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <Signal size={10} />
            LIVE
          </div>
        )}
        
        {isCurrent && playbackStatus === 'error' && (
           <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <AlertCircle size={10} />
            ERROR
          </div> 
        )}
      </div>

      <div className="flex flex-col flex-1">
        <h3 className={`font-bold text-lg leading-tight truncate ${isCurrent && !isUnplayable ? (playbackStatus === 'error' ? 'text-red-600' : 'text-violet-600 dark:text-violet-400') : 'text-slate-900 dark:text-white'}`}>
          {station.name}
        </h3>
        
        {/* Description Section */}
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">
          {isUnplayable ? '该电台暂时无法连接，请稍后再试。' : station.description}
        </p>
        
        {!isUnplayable && (
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
        )}
      </div>
    </div>
  );
};