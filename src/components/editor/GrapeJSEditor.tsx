import { useRef, useCallback } from 'react';
import grapesjs, { Editor as GjsEditorType } from 'grapesjs';
import Editor, { Canvas, WithEditor } from '@grapesjs/react';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetNewsletter from 'grapesjs-preset-newsletter';
import '../../styles/grapesjs-custom.css';
import { uploadImage, replaceBase64ImagesWithUrls } from '../../services/imageUploadService';
import { EditorToolbar } from './EditorToolbar';
import { BlocksPanel } from './BlocksPanel'
import { LayersPanel } from './LayersPanel';

interface GrapeJSEditorProps {
  html: string;
  onHtmlChange: (newHtml: string) => void;
  onEditorReady?: (editor: GjsEditorType) => void;
}

export const GrapeJSEditor: React.FC<GrapeJSEditorProps> = ({ html, onHtmlChange, onEditorReady }) => {
  const updateTimeoutRef = useRef<any>(null);
  const isUpdatingRef = useRef(false);
  const isInitializedRef = useRef(false);

  const extractBodyContent = (rawHtml: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    return doc.body ? doc.body.innerHTML : rawHtml;
  };

  const wrapInEmailDoc = (bodyHtml: string): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <title>Email Template</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Helvetica, Arial, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f8; font-family: Helvetica, Arial, sans-serif;">
${bodyHtml}
</body>
</html>`;
  };

  const handleEditorReady = useCallback((editor: GjsEditorType) => {
    // Load initial HTML content
    if (html) {
      const bodyContent = extractBodyContent(html);
      editor.setComponents(bodyContent);

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const styleTags = doc.querySelectorAll('style');
      let cssContent = '';
      styleTags.forEach((style) => { cssContent += style.textContent || ''; });
      if (cssContent) editor.setStyle(cssContent);
    }

    // Auto-upload base64 images on asset add
    editor.on('asset:add', async (asset: any) => {
      const src = asset.get('src');
      if (src?.startsWith('data:image')) {
        try {
          const response = await fetch(src);
          const blob = await response.blob();
          const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type });
          const url = await uploadImage(file);
          asset.set('src', url);
        } catch (error) {
          console.error('Upload failed, keeping base64:', error);
        }
      }
    });

    // Ensure font-family on text components + upload base64 images
    editor.on('component:add', async (component: any) => {
      const type = component.get('type');
      const textTypes = ['text', 'textnode', 'link'];
      if (textTypes.includes(type) || component.get('tagName')?.match(/^(p|h[1-6]|span|a|div)$/i)) {
        const styles = component.getStyle();
        if (!styles['font-family']) {
          component.addStyle({ 'font-family': 'Helvetica, Arial, sans-serif' });
        }
      }
      if (type === 'image') {
        const src = component.get('src');
        if (src?.startsWith('data:image')) {
          try {
            const response = await fetch(src);
            const blob = await response.blob();
            const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type });
            const url = await uploadImage(file);
            component.set('src', url);
            component.view?.render();
          } catch (error) {
            console.error('Component upload failed:', error);
          }
        }
      }
    });

    // Debounced change handler
    const handleUpdate = () => {
      if (isUpdatingRef.current || !isInitializedRef.current) return;
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);

      updateTimeoutRef.current = setTimeout(async () => {
        try {
          let updatedHtml = editor.getHtml() || '';

          if (updatedHtml.includes('data:image')) {
            try {
              updatedHtml = await replaceBase64ImagesWithUrls(updatedHtml);
            } catch (error) {
              console.error('Failed to replace base64 images:', error);
            }
          }

          updatedHtml = updatedHtml
            .replace(/\s*class="[^"]*"/g, '')
            .replace(/\s*box-sizing:\s*border-box;\s*/g, '')
            .replace(/\s*style="\s*"/g, '');

          isUpdatingRef.current = true;
          onHtmlChange(wrapInEmailDoc(updatedHtml));
          setTimeout(() => { isUpdatingRef.current = false; }, 100);
        } catch (e) {
          console.error('Update handler error:', e);
        }
      }, 500);
    };

    editor.on('component:add', handleUpdate);
    editor.on('component:remove', handleUpdate);
    editor.on('component:update', handleUpdate);

    // Mark as initialized after a tick so initial setComponents doesn't trigger handleUpdate
    setTimeout(() => { isInitializedRef.current = true; }, 100);

    onEditorReady?.(editor);
  }, []);

  const gjsOptions: any = {
    height: '100%',
    width: '100%',
    storageManager: false,
    plugins: [gjsPresetNewsletter],
    pluginsOpts: {
      'gjs-preset-newsletter': {
        modalTitleImport: 'Import Template',
        keepInlineStyles: true,
        useCustomTheme: false,
      },
    },
    canvas: {
      styles: [
        'data:text/css;base64,' + btoa(`body { font-family: Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }`),
      ],
    },
    cssComposer: { rules: [] },
    selectorManager: { componentFirst: true },
    avoidInlineStyle: false,
    parser: { optionsHtml: { allowScripts: false, allowUnsafeAttr: true } },
    deviceManager: {
      devices: [
        { id: 'desktop', name: 'Desktop', width: '' },
        { id: 'mobile', name: 'Mobile', width: '375px', widthMedia: '480px' },
      ],
    },
    panels: { defaults: [] },
    styleManager: {
      sectors: [
        { name: 'General', open: true, properties: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'] },
        { name: 'Dimension', open: false, properties: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'] },
        {
          name: 'Typography', open: false,
          properties: [
            { property: 'font-family', type: 'select', default: 'Helvetica, Arial, sans-serif', options: [
              { id: 'helvetica', value: 'Helvetica, Arial, sans-serif', name: 'Helvetica' },
              { id: 'georgia', value: 'Georgia, serif', name: 'Georgia' },
              { id: 'times', value: 'Times New Roman, serif', name: 'Times' },
              { id: 'courier', value: 'Courier New, monospace', name: 'Courier' },
            ]},
            'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration',
          ],
        },
        { name: 'Decorations', open: false, properties: ['background-color', 'border-radius', 'border', 'box-shadow'] },
      ],
    },
  };

  return (
    <Editor
      grapesjs={grapesjs}
      grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
      options={gjsOptions}
      onReady={handleEditorReady}
    >
      <div className="flex flex-col h-full w-full">
        <WithEditor>
          <EditorToolbar />
        </WithEditor>
        <div className="flex-1 flex overflow-hidden">
          <WithEditor>
            <BlocksPanel />
          </WithEditor>
          <Canvas className="flex-1 bg-neutral-100" />
          <WithEditor>
            <LayersPanel />
          </WithEditor>
        </div>
      </div>
    </Editor>
  );
};
