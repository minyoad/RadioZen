import React, { useState } from 'react';
import { X, Plus, Radio, Globe, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';
import { Station } from '../types';

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (station: Station) => void;
}

export const AddStationModal: React.FC<AddStationModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    streamUrl: '',
    coverUrl: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formData.name.trim()) {
      setError('请输入电台名称');
      return;
    }
    if (!formData.streamUrl.trim()) {
      setError('请输入流媒体地址');
      return;
    }
    if (!validateUrl(formData.streamUrl)) {
      setError('流媒体地址格式不正确 (需以 http:// 或 https:// 开头)');
      return;
    }
    if (formData.coverUrl && !validateUrl(formData.coverUrl)) {
      setError('封面图片地址格式不正确');
      return;
    }

    const newStation: Station = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      description: formData.description || '自定义电台',
      streamUrl: formData.streamUrl,
      coverUrl: formData.coverUrl || 'https://picsum.photos/seed/custom/400/400',
      tags: ['自定义'],
      category: 'custom',
      frequency: 'WEB',
      isCustom: true
    };

    onAdd(newStation);
    
    // Reset form
    setFormData({ name: '', streamUrl: '', coverUrl: '', description: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="text-violet-600" size={20} />
            添加自定义电台
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">电台名称 *</label>
            <div className="relative">
              <Radio className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="例如: 我的私人电台"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">流媒体地址 (URL) *</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={formData.streamUrl}
                onChange={e => setFormData({...formData, streamUrl: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="https://example.com/stream.m3u8"
              />
            </div>
            <p className="text-[10px] text-slate-400 pl-1">支持 MP3, AAC, HLS (m3u8) 格式</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">封面图片 (可选)</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={formData.coverUrl}
                onChange={e => setFormData({...formData, coverUrl: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">简介 (可选)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-slate-400" size={16} />
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
                placeholder="关于这个电台的描述..."
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              添加电台
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};