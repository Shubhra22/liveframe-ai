import { useRef, useEffect, useCallback, useState } from 'react';
import grapesjs, { Editor as GjsEditorType } from 'grapesjs';
import GjsEditor, { Canvas, WithEditor, useEditor } from '@grapesjs/react';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetNewsletter from 'grapesjs-preset-newsletter';
import '../../styles/grapesjs-custom.css';
import { uploadImage, replaceBase64ImagesWithUrls } from '../../services/imageUploadService';
import { EditorToolbar } from './EditorToolbar';
import { ChevronDown, ChevronRight, Layers3, Paintbrush, Settings } from 'lucide-react';

interface GrapeJSEditorProps {
  html: string;
  onHtmlChange: (newHtml: string) => void;
  onEditorReady?: (editor: GjsEditorType) => void;
}

// ─── Right panel that mounts GrapeJS manager UIs via render() ───
type Tab = 'styles' | 'layers' | 'traits';

function RightPanel() {
  const editor = useEditor();
  const [activeTab, setActiveTab] = useState<Tab>('styles');
  const stylesRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const traitsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    // Mount Styles (Selector Manager + Style Manager)
    if (stylesRef.current) {
      stylesRef.current.innerHTML = '';
      // Selector manager
      const smEl = editor.SelectorManager.render([]);
      stylesRef.current.appendChild(smEl);
      // Style manager
      const stEl = editor.StyleManager.render();
      stylesRef.current.appendChild(stEl);
    }

    // Mount Layers
    if (layersRef.current) {
      layersRef.current.innerHTML = '';
      const lmEl = editor.LayerManager.render();
      layersRef.current.appendChild(lmEl);
    }

    // Mount Traits
    if (traitsRef.current) {
      traitsRef.current.innerHTML = '';
      const tmEl = editor.TraitManager.render();
      traitsRef.current.appendChild(tmEl);
    }
  }, [editor]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'styles', label: 'Styles', icon: <Paintbrush size={13} /> },
    { id: 'layers', label: 'Layers', icon: <Layers3 size={13} /> },
    { id: 'traits', label: 'Settings', icon: <Settings size={13} /> },
  ];

  return (
    <div className="w-60 bg-neutral-900 border-l border-neutral-800 shrink-0 flex flex-col overflow-hidden">
      <div className="flex border-b border-neutral-800 shrink-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab.id ? 'text-white border-b-2 border-blue-500 bg-neutral-800/50' : 'text-neutral-500 hover:text-neutral-300'
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div ref={stylesRef} style={{ display: activeTab === 'styles' ? 'block' : 'none' }} />
        <div ref={layersRef} style={{ display: activeTab === 'layers' ? 'block' : 'none' }} />
        <div ref={traitsRef} style={{ display: activeTab === 'traits' ? 'block' : 'none' }} />
      </div>
    </div>
  );
}

// ─── Left panel: Blocks ───
function LeftPanel() {
  const editor = useEditor();
  const blocksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor || !blocksRef.current) return;
    blocksRef.current.innerHTML = '';
    const el = editor.BlockManager.render([], { external: true });
    blocksRef.current.appendChild(el);
  }, [editor]);

  return (
    <div className="w-56 bg-neutral-900 border-r border-neutral-800 shrink-0 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-neutral-800">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Components</h3>
        <p className="text-xs text-neutral-600 mt-1">Drag to canvas</p>
      </div>
      <div ref={blocksRef} className="flex-1 overflow-y-auto" />
    </div>
  );
}

// ─── Main Editor ───
export const GrapeJSEditor: React.FC<GrapeJSEditorProps> = ({ html, onHtmlChange, onEditorReady }) => {
  const editorRef = useRef<GjsEditorType | null>(null);
  const updateTimeoutRef = useRef<any>(null);
  const isUpdatingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const onHtmlChangeRef = useRef(onHtmlChange);
  const lastLoadedHtmlRef = useRef<string>('');

  onHtmlChangeRef.current = onHtmlChange;

  const extractBody = (raw: string) => {
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    return doc.body ? doc.body.innerHTML : raw;
  };

  const wrapEmail = (body: string) =>
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta content="width=device-width,initial-scale=1.0" name="viewport"/><title>Email</title></head><body style="margin:0;padding:0;background-color:#f6f6f8;font-family:Helvetica,Arial,sans-serif;">${body}</body></html>`;

  const loadHtml = useCallback((editor: GjsEditorType, raw: string) => {
    if (!raw) return;
    isUpdatingRef.current = true;
    editor.setComponents(extractBody(raw));
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    let css = '';
    doc.querySelectorAll('style').forEach(s => { css += s.textContent || ''; });
    if (css) editor.setStyle(css);
    lastLoadedHtmlRef.current = raw;
    setTimeout(() => { isUpdatingRef.current = false; }, 200);
  }, []);

  // Push external html changes into the editor
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed || !isInitializedRef.current || html === lastLoadedHtmlRef.current) return;
    loadHtml(ed, html);
  }, [html, loadHtml]);

  const handleReady = useCallback((editor: GjsEditorType) => {
    editorRef.current = editor;
    loadHtml(editor, html);

    editor.on('asset:add', async (asset: any) => {
      const src = asset.get('src');
      if (src?.startsWith('data:image')) {
        try {
          const r = await fetch(src); const blob = await r.blob();
          asset.set('src', await uploadImage(new File([blob], `img-${Date.now()}.png`, { type: blob.type })));
        } catch (_) {}
      }
    });

    const handleUpdate = () => {
      if (isUpdatingRef.current || !isInitializedRef.current) return;
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(async () => {
        try {
          let h = editor.getHtml() || '';
          if (h.includes('data:image')) try { h = await replaceBase64ImagesWithUrls(h); } catch (_) {}
          h = h.replace(/\s*class="[^"]*"/g, '').replace(/\s*box-sizing:\s*border-box;\s*/g, '').replace(/\s*style="\s*"/g, '');
          const w = wrapEmail(h);
          lastLoadedHtmlRef.current = w;
          isUpdatingRef.current = true;
          onHtmlChangeRef.current(w);
          setTimeout(() => { isUpdatingRef.current = false; }, 100);
        } catch (_) {}
      }, 500);
    };
    editor.on('component:add', handleUpdate);
    editor.on('component:remove', handleUpdate);
    editor.on('component:update', handleUpdate);
    setTimeout(() => { isInitializedRef.current = true; }, 300);
    onEditorReady?.(editor);
  }, []);

  const gjsOptions: any = {
    height: '100%', width: '100%', storageManager: false,
    plugins: [gjsPresetNewsletter],
    pluginsOpts: { 'gjs-preset-newsletter': { modalTitleImport: 'Import Template', keepInlineStyles: true, useCustomTheme: false } },
    canvas: { styles: ['data:text/css;base64,' + btoa('body{font-family:Helvetica,Arial,sans-serif;}')]},
    selectorManager: { componentFirst: true },
    avoidInlineStyle: false,
    deviceManager: { devices: [
      { id: 'desktop', name: 'Desktop', width: '' },
      { id: 'mobile', name: 'Mobile', width: '375px', widthMedia: '480px' },
    ]},
    panels: { defaults: [] },
    styleManager: { sectors: [
      { name: 'General', open: true, properties: ['float','display','position','top','right','left','bottom'] },
      { name: 'Dimension', open: false, properties: ['width','height','max-width','min-height','margin','padding'] },
      { name: 'Typography', open: false, properties: [
        { property: 'font-family', type: 'select', default: 'Helvetica, Arial, sans-serif', options: [
          { id: 'helvetica', value: 'Helvetica, Arial, sans-serif', name: 'Helvetica' },
          { id: 'georgia', value: 'Georgia, serif', name: 'Georgia' },
          { id: 'times', value: 'Times New Roman, serif', name: 'Times' },
          { id: 'courier', value: 'Courier New, monospace', name: 'Courier' },
        ]},
        'font-size','font-weight','letter-spacing','color','line-height','text-align','text-decoration',
      ]},
      { name: 'Decorations', open: false, properties: ['background-color','border-radius','border','box-shadow'] },
    ]},
  };

  return (
    <GjsEditor grapesjs={grapesjs}
      grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
      options={gjsOptions} onReady={handleReady}
    >
      <div className="flex flex-col h-full w-full">
        <WithEditor><EditorToolbar /></WithEditor>
        <div className="flex-1 flex overflow-hidden">
          <WithEditor><LeftPanel /></WithEditor>
          <Canvas className="flex-1 bg-neutral-100" />
          <WithEditor><RightPanel /></WithEditor>
        </div>
      </div>
    </GjsEditor>
  );
};
