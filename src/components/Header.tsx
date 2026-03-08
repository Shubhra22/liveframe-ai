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
    </header>
  );
};