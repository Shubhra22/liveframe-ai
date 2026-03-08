import { useRef, useEffect, useCallback } from 'react';
import grapesjs, { Editor as GjsEditorType } from 'grapesjs';
import GjsEditor from '@grapesjs/react';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetNewsletter from 'grapesjs-preset-newsletter';
import '../../styles/grapesjs-custom.css';
import { uploadImage, replaceBase64ImagesWithUrls } from '../../services/imageUploadService';

interface GrapeJSEditorProps {
  html: string;
  onHtmlChange: (newHtml: string) => void;
  onEditorReady?: (editor: GjsEditorType) => void;
}

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

    // Load initial HTML
    if (html) {
      loadHtml(editor, html);
    }

    // Asset upload handler
    (editor.AssetManager.getConfig() as any).uploadFile = async (e: any) => {
      const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      for (const file of files) {
        try {
          const url = await uploadImage(file);
          editor.AssetManager.add(url);
        } catch (err) {
          console.error('Upload failed:', err);
        }
      }
    };

    // Debounced change handler — propagate editor changes back to parent
    const notifyChange = () => {
      if (isUpdatingRef.current) return;
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(async () => {
        const body = editor.getHtml();
        const cssStr = editor.getCss() || '';
        let full = wrapEmail(
          (cssStr ? `<style>${cssStr}</style>` : '') + body
        );
        try {
          full = await replaceBase64ImagesWithUrls(full);
        } catch { /* ignore */ }
        lastLoadedHtmlRef.current = full;
        onHtmlChangeRef.current(full);
      }, 600);
    };

    editor.on('component:update', notifyChange);
    editor.on('component:add', notifyChange);
    editor.on('component:remove', notifyChange);
    editor.on('style:custom', notifyChange);

    isInitializedRef.current = true;
    onEditorReady?.(editor);
  }, [html, loadHtml, onEditorReady]);

  const gjsOptions: any = {
    height: '100%',
    width: '100%',
    storageManager: false,
    undoManager: { trackSelection: false },
    canvas: {
      styles: [
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      ],
    },
    deviceManager: {
      devices: [
        { name: 'Desktop', width: '' },
        { name: 'Mobile', width: '375px', widthMedia: '480px' },
      ],
    },
    styleManager: {
      sectors: [
        {
          name: 'Dimension',
          open: true,
          buildProps: ['width', 'min-width', 'max-width', 'height', 'min-height', 'padding', 'margin'],
        },
        {
          name: 'Typography',
          open: false,
          buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'],
        },
        {
          name: 'Decorations',
          open: false,
          buildProps: ['background-color', 'background', 'border-radius', 'border', 'box-shadow'],
        },
        {
          name: 'Extra',
          open: false,
          buildProps: ['opacity', 'transition', 'transform'],
        },
      ],
    },
    plugins: [gjsPresetNewsletter],
    pluginsOpts: {
      [gjsPresetNewsletter as any]: {},
    },
  };

  return (
    <GjsEditor
      grapesjs={grapesjs}
      options={gjsOptions}
      onReady={handleReady}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
};
