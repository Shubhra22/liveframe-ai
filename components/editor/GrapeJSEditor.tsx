import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetNewsletter from 'grapesjs-preset-newsletter';
import '../grapesjs-custom.css';

interface GrapeJSEditorProps {
  html: string;
  onHtmlChange: (newHtml: string) => void;
}

export interface GrapeJSEditorRef {
  setDevice: (device: 'desktop' | 'mobile') => void;
  toggleBorders: () => void;
  getEditor: () => any;
}

export const GrapeJSEditor = forwardRef<GrapeJSEditorRef, GrapeJSEditorProps>(
  ({ html, onHtmlChange }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const grapesjsInstance = useRef<any>(null);
    const updateTimeoutRef = useRef<any>(null);
    const isUpdatingRef = useRef(false);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      setDevice: (device: 'desktop' | 'mobile') => {
        if (grapesjsInstance.current) {
          grapesjsInstance.current.setDevice(device);
        }
      },
      toggleBorders: () => {
        if (grapesjsInstance.current) {
          grapesjsInstance.current.runCommand('sw-visibility');
        }
      },
      getEditor: () => grapesjsInstance.current,
    }));

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
          },
        },

        // Canvas settings
        canvas: {
          styles: [],
          scripts: [],
        },

        // CRITICAL: Preserve inline styles for email compatibility
        avoidInlineStyle: false,

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

        // Panels configuration - we'll use custom React buttons instead
        panels: {
          defaults: [],
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
              properties: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
            },
            {
              name: 'Dimension',
              open: false,
              properties: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
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
              properties: ['background-color', 'border-radius', 'border', 'box-shadow'],
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
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.body ? doc.body.innerHTML : html;

        editor.setComponents(bodyContent);

        // Extract and set any style tags
        const styleTags = doc.querySelectorAll('style');
        let cssContent = '';
        styleTags.forEach((style) => {
          cssContent += style.textContent || '';
        });
        if (cssContent) {
          editor.setStyle(cssContent);
        }
      }

      // Listen for changes and update parent with debounce
      const handleUpdate = () => {
        // Prevent update loop
        if (isUpdatingRef.current) return;

        // Clear existing timeout
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        // Debounce updates to prevent infinite loop
        updateTimeoutRef.current = setTimeout(() => {
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

          isUpdatingRef.current = true;
          onHtmlChange(fullHtml);
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        }, 500); // 500ms debounce
      };

      // Listen to component changes (not every keystroke)
      editor.on('component:add', handleUpdate);
      editor.on('component:remove', handleUpdate);
      editor.on('component:update', handleUpdate);

      return () => {
        // Cleanup timeout
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        // Cleanup editor
        if (grapesjsInstance.current) {
          grapesjsInstance.current.destroy();
          grapesjsInstance.current = null;
        }
      };
    }, []);

    // Update GrapeJS content when HTML prop changes (from code editor)
    useEffect(() => {
      if (!grapesjsInstance.current || !html || isUpdatingRef.current) return;

      const editor = grapesjsInstance.current;
      const currentHtml = editor.getHtml();

      // Parse incoming HTML to get body content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const bodyContent = doc.body ? doc.body.innerHTML : html;

      // Only update if content actually changed (avoid loop)
      if (currentHtml.trim() !== bodyContent.trim()) {
        isUpdatingRef.current = true;
        editor.setComponents(bodyContent);

        // Extract and set any style tags
        const styleTags = doc.querySelectorAll('style');
        let cssContent = '';
        styleTags.forEach((style) => {
          cssContent += style.textContent || '';
        });
        if (cssContent) {
          editor.setStyle(cssContent);
        }

        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }
    }, [html]);

    return <div ref={editorRef} className="w-full h-full bg-neutral-100" />;
  }
);

GrapeJSEditor.displayName = 'GrapeJSEditor';
