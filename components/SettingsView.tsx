import React, { useState, useEffect } from 'react';
import { Volume2, Moon, Bell, Info, ChevronRight, Smartphone, Wifi, Headphones, Sun } from 'lucide-react';

interface SettingsViewProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode, onToggleTheme }) => {
  // Load settings from local storage or default
  const [highQuality, setHighQuality] = useState(() => {
    return localStorage.getItem('setting_highQuality') !== 'false';
  });
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('setting_notifications') !== 'false';
  });
  const [dataSaver, setDataSaver] = useState(() => {
    return localStorage.getItem('setting_dataSaver') === 'true';
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem('setting_highQuality', String(highQuality));
  }, [highQuality]);

  useEffect(() => {
    localStorage.setItem('setting_notifications', String(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('setting_dataSaver', String(dataSaver));
  }, [dataSaver]);

  return (
    <div className="max-w-3xl mx-auto pb-10 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">设置</h2>

      {/* Section: Audio */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">播放体验</h3>
        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                <Headphones size={20} />
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">高音质 (320kbps)</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">仅在 Wi-Fi 下生效</div>
              </div>
            </div>
            <button 
              onClick={() => setHighQuality(!highQuality)}
              className={`w-12 h-6 rounded-full transition-colors relative ${highQuality ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${highQuality ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
                <Wifi size={20} />
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">流量节省模式</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">使用移动数据时降低音质</div>
              </div>
            </div>
            <button 
              onClick={() => setDataSaver(!dataSaver)}
              className={`w-12 h-6 rounded-full transition-colors relative ${dataSaver ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${dataSaver ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Section: General */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">通用</h3>
        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
                <Bell size={20} />
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">推送通知</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">接收新电台和节目提醒</div>
              </div>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">深色模式</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">切换日间/夜间外观</div>
              </div>
            </div>
            <button 
              onClick={onToggleTheme}
              className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Section: About */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">关于</h3>
        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
                <Info size={20} />
              </div>
              <span className="font-medium text-slate-900 dark:text-white">关于 RadioZen</span>
            </div>
            <ChevronRight size={18} className="text-slate-400 dark:text-slate-600" />
          </div>
          <div className="p-4 text-center text-xs text-slate-500">
             版本 v1.0.3 (Build 20231101)
          </div>
        </div>
      </div>
    </div>
  );
};