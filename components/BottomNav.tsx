import React from 'react';
import { Radio, Heart, ListMusic, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'discover', icon: Radio, label: '发现' },
    { id: 'favorites', icon: Heart, label: '收藏' },
    { id: 'recent', icon: ListMusic, label: '最近' },
    { id: 'profile', icon: User, label: '我的' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/50 flex items-center justify-around z-50 pb-safe transition-all duration-300 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-none">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center gap-1 p-1 w-full h-full active:scale-95 transition-all ${
            activeTab === item.id 
              ? 'text-violet-600 dark:text-violet-400' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-all duration-300 ${activeTab === item.id ? 'bg-violet-50 dark:bg-violet-500/10 translate-y-[-2px]' : ''}`}>
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-medium transition-all ${activeTab === item.id ? 'font-bold' : ''}`}>{item.label}</span>
        </button>
      ))}
    </div>
  );
};