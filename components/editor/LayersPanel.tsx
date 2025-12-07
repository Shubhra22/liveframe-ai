import React from 'react';
import { X } from 'lucide-react';

interface LayersPanelProps {
  onClose: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ onClose }) => {
  return (
    <div className="w-64 bg-neutral-900 border-l border-neutral-800 overflow-y-auto animate-in slide-in-from-right duration-200">
      <div className="border-b border-neutral-800">
        <div className="p-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            Layers
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
            title="Close Layers"
          >
            <X size={16} />
          </button>
        </div>
        <div className="layers-container px-2 pb-3"></div>
      </div>

      <div className="border-b border-neutral-800">
        <div className="p-3">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            Styles
          </h3>
        </div>
        <div className="styles-container px-2 pb-3"></div>
      </div>

      <div>
        <div className="p-3">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            Settings
          </h3>
        </div>
        <div className="traits-container px-2 pb-3"></div>
      </div>
    </div>
  );
};
