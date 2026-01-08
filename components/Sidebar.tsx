import React from 'react';
import { Radio, Heart, ListMusic, Settings, User, Mic2 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'discover', icon: Radio, label: '发现电台' },
    { id: 'favorites', icon: Heart, label: '我的收藏' },
    { id: 'recent', icon: ListMusic, label: '最近播放' },
    { id: 'podcasts', icon: Mic2, label: '播客推荐' },
  ];

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full text-slate-600 dark:text-slate-300 transition-colors">
      <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('discover')}>
        <div className="w-8 h-8 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
          <Radio className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">RadioZen</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
          菜单
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-violet-600/10 text-violet-600 dark:text-violet-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
          设置
        </div>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            activeTab === 'settings' 
            ? 'bg-violet-600/10 text-violet-600 dark:text-violet-400' 
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings size={20} />
          <span>偏好设置</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
             activeTab === 'profile' 
             ? 'bg-violet-600/10 text-violet-600 dark:text-violet-400' 
             : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User size={20} />
          <span>个人中心</span>
        </button>
      </div>
    </div>
  );
};