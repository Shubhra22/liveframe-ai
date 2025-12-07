import React, { useRef, useState } from 'react';
import { GrapeJSEditor, GrapeJSEditorRef } from './editor/GrapeJSEditor';
import { EditorToolbar } from './editor/EditorToolbar';
import { LayersPanel } from './editor/LayersPanel';

interface LiveCanvasProps {
  html: string;
  onHtmlChange: (newHtml: string) => void;
}

export const LiveCanvas: React.FC<LiveCanvasProps> = ({ html, onHtmlChange }) => {
  const editorRef = useRef<GrapeJSEditorRef>(null);
  const [showLayers, setShowLayers] = useState(false);
  const [showBorders, setShowBorders] = useState(true);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  // Handle device toggle
  const handleDeviceToggle = (device: 'desktop' | 'mobile') => {
    editorRef.current?.setDevice(device);
    setDeviceMode(device);
  };

  // Handle borders toggle
  const handleBordersToggle = () => {
    editorRef.current?.toggleBorders();
    setShowBorders(!showBorders);
  };



  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Toolbar */}
      <EditorToolbar
        deviceMode={deviceMode}
        showBorders={showBorders}
        showLayers={showLayers}
        onDeviceToggle={handleDeviceToggle}
        onBordersToggle={handleBordersToggle}
        onLayersToggle={() => setShowLayers(!showLayers)}
      />

      {/* Editor and Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Canvas */}
        <div className="flex-1">
          <GrapeJSEditor ref={editorRef} html={html} onHtmlChange={onHtmlChange} />
        </div>

        {/* Right Sidebar - Layers & Styles */}
        {showLayers && <LayersPanel onClose={() => setShowLayers(false)} />}
      </div>
    </div>
  );
};