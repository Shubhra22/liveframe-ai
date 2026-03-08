import React, { useState } from 'react';
import { useEditor } from '@grapesjs/react';
import { Monitor, Smartphone, Eye, EyeOff, Undo2, Redo2, Trash2, Maximize } from 'lucide-react';

export const EditorToolbar: React.FC = () => {
  const editor = useEditor();
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showBorders, setShowBorders] = useState(true);

  const handleDeviceToggle = (device: 'desktop' | 'mobile') => {
    editor.setDevice(device);
    setDeviceMode(device);
  };

  const handleBordersToggle = () => {
    editor.runCommand('sw-visibility');
    setShowBorders(!showBorders);
  };

  return (
    <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-3 shrink-0">
      <div className="flex items-center gap-1">
        <button
          onClick={() => editor.runCommand('core:undo')}
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Undo"
        >
          <Undo2 size={15} />
        </button>
        <button
          onClick={() => editor.runCommand('core:redo')}
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Redo"
        >
          <Redo2 size={15} />
        </button>
        <div className="w-px h-5 bg-neutral-700 mx-1" />
        <button
          onClick={() => { if (confirm('Clear the entire canvas?')) editor.runCommand('core:canvas-clear'); }}
          className="p-1.5 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5 bg-neutral-800 p-0.5 rounded border border-neutral-700">
          <button
            onClick={() => handleDeviceToggle('desktop')}
            className={`p-1.5 rounded transition-colors ${deviceMode === 'desktop' ? 'bg-neutral-600 text-white' : 'text-neutral-400 hover:text-white'}`}
            title="Desktop"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => handleDeviceToggle('mobile')}
            className={`p-1.5 rounded transition-colors ${deviceMode === 'mobile' ? 'bg-neutral-600 text-white' : 'text-neutral-400 hover:text-white'}`}
            title="Mobile"
          >
            <Smartphone size={14} />
          </button>
        </div>
        <button
          onClick={handleBordersToggle}
          className={`p-1.5 rounded transition-colors ${showBorders ? 'text-blue-400 bg-neutral-800' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          title="Toggle Borders"
        >
          {showBorders ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={() => editor.runCommand('fullscreen')}
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Fullscreen"
        >
          <Maximize size={14} />
        </button>
      </div>
    </div>
  );
};
