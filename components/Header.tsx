import React from 'react';
import { Code2, Wand2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Code2 size={20} className="text-white" />
        </div>
        <h1 className="font-bold text-lg tracking-tight">LiveFrame <span className="text-blue-500">AI</span></h1>
      </div>
      <div className="flex items-center gap-4 text-sm text-neutral-400">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 rounded-full border border-neutral-700/50">
          <Wand2 size={14} className="text-purple-400" />
          <span>Gemini 2.5 Active</span>
        </div>
      </div>
    </header>
  );
};