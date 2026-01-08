import React, { useState } from 'react';
import { User, Settings, Clock, Heart, Award, ChevronRight, LogOut, Edit2, Shield, Save, X } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  onNavigate: (tab: string) => void;
  profile: UserProfile;
  favoritesCount: number;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  onNavigate, 
  profile, 
  favoritesCount,
  onUpdateProfile 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  const handleSave = () => {
    onUpdateProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  // Calculations
  const listeningHours = Math.floor(profile.listeningMinutes / 60);
  const displayHours = listeningHours > 0 
    ? `${listeningHours}h` 
    : `${profile.listeningMinutes}m`;
  
  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      {/* Header Card */}
      <div className="bg-white dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm border border-slate-100 dark:border-white/5 mb-8 transition-all">
        <div className="relative group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20 dark:shadow-none">
            <img 
              src={profile.avatarUrl} 
              alt="User" 
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-900 transition-colors" 
            />
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-violet-600 dark:hover:text-white transition-colors shadow-md hover:scale-105 transform duration-200"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left w-full md:w-auto">
          {isEditing ? (
            <div className="space-y-3">
               <input 
                 type="text" 
                 value={editForm.name}
                 onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                 className="block w-full text-center md:text-left text-2xl font-bold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-transparent rounded-lg p-2 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white focus:outline-none"
                 placeholder="输入昵称"
               />
               <input 
                 type="text" 
                 value={editForm.bio}
                 onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                 className="block w-full text-center md:text-left text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-transparent rounded-lg p-2 focus:ring-2 focus:ring-violet-500 text-slate-500 dark:text-slate-300 focus:outline-none"
                 placeholder="输入个人简介"
               />
               <div className="flex justify-center md:justify-start gap-2 pt-2">
                 <button 
                   onClick={handleSave}
                   className="flex items-center gap-1 px-4 py-1.5 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20"
                 >
                   <Save size={14} /> 保存
                 </button>
                 <button 
                   onClick={handleCancel}
                   className="flex items-center gap-1 px-4 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                 >
                   <X size={14} /> 取消
                 </button>
               </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">{profile.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-4 transition-colors max-w-md mx-auto md:mx-0 leading-relaxed">{profile.bio}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {profile.isPro && (
                  <span className="px-3 py-1 bg-violet-50 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 rounded-full text-xs font-bold border border-violet-100 dark:border-violet-500/30 flex items-center gap-1 transition-colors">
                    <Shield size={12} /> PRO 会员
                  </span>
                )}
                <span className="px-3 py-1 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold border border-slate-100 dark:border-slate-600 transition-colors">
                  Lv.{profile.level} 听众
                </span>
                <span className="px-3 py-1 bg-white dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-full text-xs transition-colors border border-slate-100 dark:border-slate-700/50">
                  {profile.joinDate} 加入
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '收听时长', value: displayHours, icon: Clock, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: '收藏电台', value: favoritesCount.toString(), icon: Heart, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
          { label: '成就勋章', value: Math.floor(profile.level / 2).toString(), icon: Award, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: '连续签到', value: '1天', icon: User, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 hover:border-violet-100 dark:hover:border-slate-700 transition-all duration-300 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none">
            <div className={`p-2.5 rounded-full mb-3 ${stat.bg}`}>
               <stat.icon className={`${stat.color}`} size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">{stat.value}</div>
            <div className="text-xs font-medium text-slate-400 dark:text-slate-500 transition-colors">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Menu List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800 shadow-sm transition-colors">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              <Edit2 size={20} />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">编辑个人资料</span>
          </div>
          <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
        </button>

        <button 
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              <Settings size={20} />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">偏好设置</span>
          </div>
          <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
        </button>

        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-rose-500/80 group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20 group-hover:text-rose-600 dark:group-hover:text-rose-500 transition-colors">
              <LogOut size={20} />
            </div>
            <span className="font-medium text-rose-500/90 group-hover:text-rose-600 dark:group-hover:text-rose-500 transition-colors">退出登录</span>
          </div>
        </button>
      </div>
    </div>
  );
};