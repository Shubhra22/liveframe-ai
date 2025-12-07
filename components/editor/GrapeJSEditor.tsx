import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetNewsletter from 'grapesjs-preset-newsletter';
import '../grapesjs-custom.css';
import { uploadImage } from '../../services/imageUploadService';

interface GrapeJSEditorProps {
  html: string;
  onHtmlChange: (newHtml: string) => void;
  blocksContainerId?: string;
}

export interface GrapeJSEditorRef {
  setDevice: (device: 'desktop' | 'mobile') => void;
  toggleBorders: () => void;
  getEditor: () => any;
}

export const GrapeJSEditor = forwardRef<GrapeJSEditorRef, GrapeJSEditorProps>(
  ({ html, onHtmlChange, blocksContainerId = '.blocks-container' }, ref) => {
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

      // Wait for blocks container to be available in DOM
      const initEditor = () => {
        const blocksContainer = document.querySelector(blocksContainerId);
        if (!blocksContainer && blocksContainerId !== '.blocks-container') {
          // If custom container doesn't exist yet, wait a bit
          setTimeout(initEditor, 100);
          return;
        }

        const editor = grapesjs.init({
          container: editorRef.current!,
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

        // Canvas settings - inject fonts into iframe
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&display=swap',
            'data:text/css;base64,' + btoa(`
              * { font-family: 'Space Grotesk', Helvetica, Arial, sans-serif !important; }
              body { font-family: 'Space Grotesk', Helvetica, Arial, sans-serif !important; }
            `),
          ],
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

          // Panels configuration - show useful top toolbar
          panels: {
            defaults: [
              {
                id: 'options',
                el: '.gjs-pn-options',
                buttons: [
                  {
                    id: 'sw-visibility',
                    command: 'sw-visibility',
                    context: 'sw-visibility',
                    className: 'fa fa-square-o',
                    attributes: { title: 'View components' },
                  },
                  {
                    id: 'preview',
                    command: 'preview',
                    context: 'preview',
                    className: 'fa fa-eye',
                    attributes: { title: 'Preview' },
                  },
                  {
                    id: 'fullscreen',
                    command: 'fullscreen',
                    context: 'fullscreen',
                    className: 'fa fa-arrows-alt',
                    attributes: { title: 'Fullscreen' },
                  },
                  {
                    id: 'export-template',
                    command: 'export-template',
                    className: 'fa fa-code',
                    attributes: { title: 'View code' },
                  },
                  {
                    id: 'undo',
                    command: 'undo',
                    className: 'fa fa-undo',
                    attributes: { title: 'Undo' },
                  },
                  {
                    id: 'redo',
                    command: 'redo',
                    className: 'fa fa-repeat',
                    attributes: { title: 'Redo' },
                  },
                  {
                    id: 'clear-all',
                    command: 'canvas-clear',
                    className: 'fa fa-trash',
                    attributes: { title: 'Clear canvas' },
                  },
                ],
              },
            ],
          },

        // Block manager
        blockManager: {
          appendTo: blocksContainerId,
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

      // Intercept image additions and upload them
      editor.on('asset:add', async (asset: any) => {
        console.log('🎯 Asset added:', asset.get('type'), asset.get('src')?.substring(0, 50));
        
        // Check if the asset is a base64 image
        const src = asset.get('src');
        if (src && src.startsWith('data:image')) {
          try {
            console.log('🔄 Converting base64 to hosted image...');
            
            // Convert base64 to file
            const response = await fetch(src);
            const blob = await response.blob();
            const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type });
            
            // Upload the file
            const url = await uploadImage(file);
            console.log('✅ Image uploaded:', url);
            
            // Update the asset with the new URL
            asset.set('src', url);
          } catch (error) {
            console.error('❌ Upload failed, keeping base64:', error);
          }
        }
      });

      // Also intercept when components with images are added
      editor.on('component:add', async (component: any) => {
        const type = component.get('type');
        
        // Check if it's an image component
        if (type === 'image') {
          const src = component.get('src');
          console.log('🖼️ Image component added:', src?.substring(0, 50));
          
          if (src && src.startsWith('data:image')) {
            try {
              console.log('🔄 Uploading image from component...');
              
              // Convert base64 to file
              const response = await fetch(src);
              const blob = await response.blob();
              const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type });
              
              // Upload the file
              const url = await uploadImage(file);
              console.log('✅ Component image uploaded:', url);
              
              // Update the component with the new URL
              component.set('src', url);
            } catch (error) {
              console.error('❌ Component upload failed:', error);
            }
          }
        }
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
      };

      // Start initialization
      initEditor();

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
    }, [blocksContainerId]);

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
