import React, { useRef, useEffect } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetNewsletter from 'grapesjs-preset-newsletter';
import './grapesjs-custom.css';

interface LiveCanvasProps {
  html: string;
  onHtmlChange: (newHtml: string) => void;
}

export const LiveCanvas: React.FC<LiveCanvasProps> = ({ html, onHtmlChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const grapesjsInstance = useRef<any>(null);

  // Initialize GrapeJS
  useEffect(() => {
    if (!editorRef.current || grapesjsInstance.current) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      height: '100%',
      width: '100%',
      fromElement: false,
      storageManager: false,
      
      // Use newsletter preset for email-friendly components
      plugins: [gjsPresetNewsletter],
      pluginsOpts: {
        'gjs-preset-newsletter': {
          modalTitleImport: 'Import Template',
          keepInlineStyles: true,
        }
      },

      // Canvas settings
      canvas: {
        styles: [],
        scripts: [],
      },

      // CRITICAL: Preserve inline styles for email compatibility
      avoidInlineStyle: false,
      
      // Keep default wrapper off to preserve email structure
      wrapperIsBody: true,
      
      // Parser options to keep inline styles and attributes
      parser: {
        optionsHtml: {
          allowScripts: false,
          allowUnsafeAttr: true,
        },
      },
      
      // Device manager for responsive preview
      deviceManager: {
        devices: [
          {
            id: 'desktop',
            name: 'Desktop',
            width: '',
          },
          {
            id: 'mobile',
            name: 'Mobile',
            width: '375px',
            widthMedia: '480px',
          },
        ],
      },

      // Panels configuration - minimal UI
      panels: {
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'visibility',
                active: true,
                className: 'btn-toggle-borders',
                label: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15,9H9V15H15M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"></path></svg>',
                command: 'sw-visibility',
              },
            ],
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              {
                id: 'device-desktop',
                label: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z"></path></svg>',
                command: 'set-device-desktop',
                active: true,
                togglable: false,
              },
              {
                id: 'device-mobile',
                label: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z"></path></svg>',
                command: 'set-device-mobile',
                togglable: false,
              },
            ],
          },
        ],
      },

      // Block manager
      blockManager: {
        appendTo: '.blocks-container',
      },

      // Layer manager
      layerManager: {
        appendTo: '.layers-container',
      },

      // Style manager
      styleManager: {
        appendTo: '.styles-container',
        sectors: [
          {
            name: 'General',
            open: true,
            properties: [
              'float',
              'display',
              'position',
              'top',
              'right',
              'left',
              'bottom',
            ],
          },
          {
            name: 'Dimension',
            open: false,
            properties: [
              'width',
              'height',
              'max-width',
              'min-height',
              'margin',
              'padding',
            ],
          },
          {
            name: 'Typography',
            open: false,
            properties: [
              'font-family',
              'font-size',
              'font-weight',
              'letter-spacing',
              'color',
              'line-height',
              'text-align',
              'text-decoration',
            ],
          },
          {
            name: 'Decorations',
            open: false,
            properties: [
              'background-color',
              'border-radius',
              'border',
              'box-shadow',
            ],
          },
        ],
      },

      // Trait manager
      traitManager: {
        appendTo: '.traits-container',
      },
    });

    grapesjsInstance.current = editor;

    // Load initial HTML - parse the full document
    if (html) {
      // Extract body content if it's a full HTML document
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const bodyContent = doc.body ? doc.body.innerHTML : html;
      
      editor.setComponents(bodyContent);
      
      // Extract and set any style tags
      const styleTags = doc.querySelectorAll('style');
      let cssContent = '';
      styleTags.forEach(style => {
        cssContent += style.textContent || '';
      });
      if (cssContent) {
        editor.setStyle(cssContent);
      }
    }

    // Listen for changes and update parent
    editor.on('update', () => {
      // Get HTML with inline styles preserved
      const updatedHtml = editor.getHtml();
      const updatedCss = editor.getCss();
      
      // Reconstruct full HTML document for email
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    ${updatedCss ? `<style>${updatedCss}</style>` : ''}
</head>
<body>
${updatedHtml}
</body>
</html>`;
      
      onHtmlChange(fullHtml);
    });

    return () => {
      if (grapesjsInstance.current) {
        grapesjsInstance.current.destroy();
        grapesjsInstance.current = null;
      }
    };
  }, []);

  // Update GrapeJS content when HTML prop changes
  useEffect(() => {
    if (grapesjsInstance.current && html) {
      const currentHtml = grapesjsInstance.current.getHtml();
      // Only update if HTML actually changed to avoid infinite loops
      if (currentHtml !== html) {
        grapesjsInstance.current.setComponents(html);
      }
    }
  }, [html]);

  return (
    <div className="relative w-full h-full flex">
      {/* Left Sidebar - Blocks */}
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 overflow-y-auto">
        <div className="p-3 border-b border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Blocks</h3>
        </div>
        <div className="blocks-container p-2"></div>
      </div>

      {/* Main Editor Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4">
          <div className="panel__devices flex gap-2"></div>
          <div className="panel__basic-actions"></div>
        </div>

        {/* Canvas */}
        <div ref={editorRef} className="flex-1 bg-neutral-100"></div>
      </div>

      {/* Right Sidebar - Layers & Styles */}
      <div className="w-64 bg-neutral-900 border-l border-neutral-800 overflow-y-auto">
        <div className="border-b border-neutral-800">
          <div className="p-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Layers</h3>
          </div>
          <div className="layers-container px-2 pb-3"></div>
        </div>
        
        <div className="border-b border-neutral-800">
          <div className="p-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Styles</h3>
          </div>
          <div className="styles-container px-2 pb-3"></div>
        </div>

        <div>
          <div className="p-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Settings</h3>
          </div>
          <div className="traits-container px-2 pb-3"></div>
        </div>
      </div>
    </div>
  );
};