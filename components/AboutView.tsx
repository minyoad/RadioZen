import React from 'react';
import { ArrowLeft, Radio, Heart, Github, Code, ExternalLink } from 'lucide-react';

interface AboutViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-2xl mx-auto pb-10 animate-in slide-in-from-right-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
      >
        <div className="p-2 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} />
        </div>
        <span className="font-medium">返回设置</span>
      </button>

      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/30 mb-6">
          <Radio className="text-white w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">RadioZen</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">v1.1.0</p>
      </div>

      <div className="space-y-6">
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart size={20} className="text-rose-500" fill="currentColor" />
            简介
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            RadioZen 是一款专注于提供纯粹、流畅听觉体验的现代化网页广播播放器。我们汇集了全球各地的优质电台，通过简洁优雅的界面，让您随时随地享受美好的声音旅程。
          </p>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Code size={20} className="text-blue-500" />
            技术栈与致谢
          </h2>
          <ul className="space-y-3">
            {[
              { name: 'React', desc: '用于构建用户界面的 JavaScript 库' },
              { name: 'Tailwind CSS', desc: '功能类优先的 CSS 框架' },
              { name: 'Lucide React', desc: '精美的一致性图标库' },
              { name: 'Hls.js', desc: 'JavaScript HLS 客户端库' },
            ].map(item => (
              <li key={item.name} className="flex items-start justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ExternalLink size={20} className="text-violet-500" />
            更多信息
          </h2>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
             <p>
               本应用收录的电台流媒体链接均来自互联网公开资源。如果您是电台所有者并希望添加或移除您的电台，请联系我们。
             </p>
             <div className="pt-2 flex gap-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:underline">
                  <Github size={16} /> GitHub 仓库
                </a>
             </div>
          </div>
        </section>
      </div>
      
      <div className="mt-10 text-center text-xs text-slate-400 dark:text-slate-600">
        &copy; {new Date().getFullYear()} RadioZen. All rights reserved.
      </div>
    </div>
  );
};