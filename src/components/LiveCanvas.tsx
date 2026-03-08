import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { GrapeJSEditor } from './editor/GrapeJSEditor';
import type { Editor } from 'grapesjs';

interface LiveCanvasProps {
  html: string;
  onHtmlChange: (newHtml: string) => void;
}

export interface LiveCanvasRef {
  getEditor: () => Editor | null;
}

export const LiveCanvas = forwardRef<LiveCanvasRef, LiveCanvasProps>(({ html, onHtmlChange }, ref) => {
  const editorInstanceRef = useRef<Editor | null>(null);

  useImperativeHandle(ref, () => ({
    getEditor: () => editorInstanceRef.current,
  }));

  return (
    <div className="w-full h-full relative">
      <GrapeJSEditor
        html={html}
        onHtmlChange={onHtmlChange}
        onEditorReady={(editor) => { editorInstanceRef.current = editor; }}
      />
    </div>
  );
});

LiveCanvas.displayName = 'LiveCanvas';
