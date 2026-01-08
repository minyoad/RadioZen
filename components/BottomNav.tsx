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
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-50 pb-safe transition-colors duration-300">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center gap-1 p-2 w-full active:scale-95 transition-all ${
            activeTab === item.id 
              ? 'text-violet-600 dark:text-violet-400' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <item.icon size={20} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};