import React from 'react';
import { Monitor, Smartphone, Eye, EyeOff, Layers3 } from 'lucide-react';

interface EditorToolbarProps {
  deviceMode: 'desktop' | 'mobile';
  showBorders: boolean;
  showLayers: boolean;
  onDeviceToggle: (device: 'desktop' | 'mobile') => void;
  onBordersToggle: () => void;
  onLayersToggle: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  deviceMode,
  showBorders,
  showLayers,
  onDeviceToggle,
  onBordersToggle,
  onLayersToggle,
}) => {
  return (
    <div className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        {!showLayers && (
          <button
            onClick={onLayersToggle}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded transition-colors"
            title="Show Layers"
          >
            <Layers3 size={16} />
            Layers
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Device Toggle */}
        <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
          <button
            onClick={() => onDeviceToggle('desktop')}
            className={`p-2 rounded-md transition-colors ${
              deviceMode === 'desktop'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Desktop View"
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => onDeviceToggle('mobile')}
            className={`p-2 rounded-md transition-colors ${
              deviceMode === 'mobile'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Mobile View"
          >
            <Smartphone size={16} />
          </button>
        </div>

        {/* Borders Toggle */}
        <button
          onClick={onBordersToggle}
          className={`p-2 rounded-md transition-colors border ${
            showBorders
              ? 'bg-neutral-700 text-white border-neutral-700'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'
          }`}
          title="Toggle Borders"
        >
          {showBorders ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
    </div>
  );
};
