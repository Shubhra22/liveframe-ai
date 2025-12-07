import React from 'react';
import { X } from 'lucide-react';

interface BlocksPanelProps {
  onClose: () => void;
}

export const BlocksPanel: React.FC<BlocksPanelProps> = ({ onClose }) => {
  return (
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 overflow-y-auto animate-in slide-in-from-left duration-200">
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          Blocks
        </h3>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-300 transition-colors"
          title="Close Blocks"
        >
          <X size={16} />
        </button>
      </div>
      <div className="blocks-container p-2"></div>
    </div>
  );
};
