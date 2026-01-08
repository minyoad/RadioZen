import React from 'react';
import { ArrowLeft, Play, Pause, Share2, Signal, Radio, ListPlus } from 'lucide-react';
import { Station } from '../types';

interface StationDetailProps {
  station: Station;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onBack: () => void;
  onAddToPlaylist: (station: Station) => void;
  onTagClick: (tag: string) => void;
}

export const StationDetail: React.FC<StationDetailProps> = ({ 
  station, 
  isPlaying, 
  onTogglePlay, 
  onBack,
  onAddToPlaylist,
  onTagClick
}) => {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
      >
        <div className="p-2 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} />
        </div>
        <span className="font-medium">返回列表</span>
      </button>

      <div className="grid md:grid-cols-[400px_1fr] gap-8 lg:gap-12 items-start">
        {/* Left: Cover Image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 transition-colors">
          <img 
            src={station.coverUrl} 
            alt={station.name} 
            className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`}
          />
          
          {/* Status Overlay */}
          <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
               <div className="w-24 h-24 bg-violet-600/90 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(124,58,237,0.5)]">
                  <Signal size={48} className="text-white" />
               </div>
          </div>
        </div>

        {/* Right: Info & Controls */}
        <div className="flex flex-col h-full py-2">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
               <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-bold rounded-full uppercase tracking-wider border border-violet-100 dark:border-violet-500/20 transition-colors">
                 <Radio size={12} />
                 {station.category}
               </span>
               {station.frequency && (
                 <span className="px-3 py-1 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-full transition-colors">
                   {station.frequency}
                 </span>
               )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight tracking-tight transition-colors">{station.name}</h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 opacity-90 transition-colors">{station.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {station.tags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => onTagClick(tag)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:text-white hover:bg-violet-600 hover:border-violet-500 dark:hover:bg-violet-600 dark:hover:border-violet-500 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/50 transition-colors">
            <button 
              onClick={onTogglePlay}
              className={`flex-1 h-16 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                isPlaying 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700' 
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl shadow-slate-900/10 dark:shadow-white/10'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause fill="currentColor" size={24} /> 暂停播放
                </>
              ) : (
                <>
                  <Play fill="currentColor" size={24} /> 立即播放
                </>
              )}
            </button>
            
            <button 
              onClick={() => onAddToPlaylist(station)}
              className="h-16 w-16 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              title="添加到播放列表"
            >
              <ListPlus size={24} />
            </button>
            
            <button className="h-16 w-16 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};