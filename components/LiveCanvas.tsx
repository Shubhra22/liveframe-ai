import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SelectionState } from '../types';
import { FloatingMenu } from './FloatingMenu';
import { Check } from 'lucide-react';

interface LiveCanvasProps {
  html: string;
  onHtmlChange: (newHtml: string) => void;
}

export const LiveCanvas: React.FC<LiveCanvasProps> = ({ html, onHtmlChange }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selection, setSelection] = useState<SelectionState>({
    element: null,
    type: 'unknown',
    rect: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Initial Content Injection
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
        // We write to doc to support scripts execution
        const doc = iframe.contentDocument;
        if (doc) {
            doc.open();
            doc.write(html);
            // Inject editor styles
            doc.write(`
              <style>
                .live-editor-selected {
                  outline: 2px solid #3b82f6 !important;
                  outline-offset: -2px;
                  cursor: pointer;
                  position: relative;
                  z-index: 9999;
                }
                .live-editor-hover:not(.live-editor-selected) {
                  outline: 2px dashed #60a5fa !important;
                  outline-offset: -2px;
                  cursor: pointer;
                  z-index: 9999;
                }
                body { margin: 0; min-height: 100vh; }
                /* Hide scrollbars for cleaner editor feel if needed */
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
              </style>
            `);
            doc.close();
            setIframeLoaded(true);
        }
    }
  }, [html]); // Note: In a real app we might want to diff updates instead of full reload, but full reload ensures scripts run correctly.

  // Event Listeners for Iframe
  useEffect(() => {
    if (!iframeLoaded || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument;
    if (!doc) return;

    const handleMouseOver = (e: Event) => {
      if (isEditing) return;
      if (selection.element) return;
      
      const target = e.target as HTMLElement;
      if (target === doc.body || target === doc.documentElement) return;
      target.classList.add('live-editor-hover');
    };

    const handleMouseOut = (e: Event) => {
      const target = e.target as HTMLElement;
      target.classList.remove('live-editor-hover');
    };

    const handleClick = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      
      if (isEditing) {
         if (selection.element && selection.element.contains(e.target as Node)) {
           return; 
         }
         // Prevent navigation if clicking links while editing
         e.preventDefault();
         return;
      }

      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      
      if (target === doc.body || target === doc.documentElement) {
        clearSelection();
        return;
      }

      selectElement(target);
    };

    const handleScroll = () => {
        if (selection.element) {
            updateSelectionRect(selection.element);
        }
    };

    doc.addEventListener('mouseover', handleMouseOver);
    doc.addEventListener('mouseout', handleMouseOut);
    doc.addEventListener('click', handleClick);
    doc.addEventListener('scroll', handleScroll);
    iframe.contentWindow?.addEventListener('scroll', handleScroll);

    return () => {
      doc.removeEventListener('mouseover', handleMouseOver);
      doc.removeEventListener('mouseout', handleMouseOut);
      doc.removeEventListener('click', handleClick);
      doc.removeEventListener('scroll', handleScroll);
      iframe.contentWindow?.removeEventListener('scroll', handleScroll);
    };
  }, [iframeLoaded, selection.element, isEditing]);

  const updateSelectionRect = (el: HTMLElement) => {
    if (!iframeRef.current) return;
    const iframeRect = iframeRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    
    // Convert iframe-relative coords to screen coords
    setSelection(prev => ({
        ...prev,
        element: el,
        rect: new DOMRect(
            iframeRect.left + elRect.left,
            iframeRect.top + elRect.top,
            elRect.width,
            elRect.height
        )
    }));
  };

  const selectElement = (el: HTMLElement) => {
    if (selection.element) {
      selection.element.classList.remove('live-editor-selected');
    }

    el.classList.add('live-editor-selected');
    el.classList.remove('live-editor-hover');

    let type: SelectionState['type'] = 'container';
    const tagName = el.tagName.toLowerCase();
    
    if (tagName === 'img') type = 'image';
    else if (tagName === 'button' || tagName === 'a') type = 'button';
    else if (
        (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) || 
        (el.innerText && el.children.length === 0)
    ) {
        type = 'text';
    }

    updateSelectionRect(el);
    // Explicitly set type in state update since updateSelectionRect depends on prev state which might not have type
    setSelection(prev => ({...prev, type}));
  };

  const clearSelection = () => {
    if (selection.element) {
      selection.element.classList.remove('live-editor-selected');
      selection.element.contentEditable = "false";
    }
    setSelection({ element: null, type: 'unknown', rect: null });
    setIsEditing(false);
  };

  const handleUpdate = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentDocument) {
      const doc = iframe.contentDocument;
      
      // Remove our editor classes before exporting
      const selected = doc.querySelectorAll('.live-editor-selected');
      const hovered = doc.querySelectorAll('.live-editor-hover');
      selected.forEach(el => el.classList.remove('live-editor-selected'));
      hovered.forEach(el => el.classList.remove('live-editor-hover'));
      
      const editables = doc.querySelectorAll('[contenteditable]');
      editables.forEach(el => el.removeAttribute('contenteditable'));

      // If the body contains our root div (like in the React example), we might want just that?
      // Or usually full HTML. For email, we want full HTML.
      const htmlContent = doc.documentElement.outerHTML;
      onHtmlChange(htmlContent);

      // Re-add selection class if needed to keep visual state
      if (selection.element) {
          selection.element.classList.add('live-editor-selected');
          updateSelectionRect(selection.element);
      }
    }
  }, [onHtmlChange, selection.element]);

  const startEditing = () => {
    if (selection.element) {
      setIsEditing(true);
      selection.element.contentEditable = "true";
      selection.element.focus();
    }
  };

  const finishEditing = () => {
    if (selection.element) {
      selection.element.contentEditable = "false";
      handleUpdate();
      setIsEditing(false);
    }
  };

  // Keep rects in sync if window resizes
  useEffect(() => {
    const handleResize = () => {
      if (selection.element) {
        updateSelectionRect(selection.element);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [selection.element]);

  return (
    <div className="relative w-full h-full">
      <iframe 
        ref={iframeRef}
        className="w-full h-full border-none bg-white"
        title="Live Canvas"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />

      {/* Floating Menu or Done Button */}
      {selection.element && !isEditing && (
        <FloatingMenu 
          selection={selection} 
          onClose={clearSelection} 
          onUpdate={handleUpdate}
          onEditStart={startEditing}
        />
      )}

      {isEditing && selection.rect && (
        <div 
          className="fixed z-50 flex items-center gap-2"
          style={{
            top: `${Math.max(10, selection.rect.top - 50)}px`,
            left: `${selection.rect.left}px`,
          }}
        >
          <button 
            onClick={finishEditing}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg font-medium text-xs animate-in fade-in zoom-in duration-200"
          >
            <Check size={14} /> Done Editing
          </button>
        </div>
      )}
    </div>
  );
};