import React, { useState } from 'react';
import { SelectionState, AiActionType } from '../types';
import { Wand2, Type, Image as ImageIcon, Trash2, X, RefreshCw, Check, Edit3, MoveHorizontal, AlignLeft, Bold, Link as LinkIcon } from 'lucide-react';
import { generateText, generateImage } from '../services/geminiService';
import { toast } from './ui/Toaster';

interface FloatingMenuProps {
  selection: SelectionState;
  onClose: () => void;
  onUpdate: () => void;
  onEditStart: () => void;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ selection, onClose, onUpdate, onEditStart }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [inputType, setInputType] = useState<'text' | 'image' | 'link' | null>(null);

  const { element, type, rect } = selection;

  if (!element || !rect) return null;

  // Clamp top position
  const top = Math.max(10, rect.top - 60);
  const left = rect.left + (rect.width / 2);

  const updateElement = (updater: () => void) => {
    updater();
    onUpdate();
  };

  const handleAiTextAction = async (action: AiActionType) => {
    if (!element) return;
    setIsProcessing(true);
    const currentText = element.innerText;
    const context = `Tag: ${element.tagName}, Classes: ${element.className}`;
    
    const result = await generateText(currentText, action, context);
    
    setIsProcessing(false);
    if (result.error) {
      toast.error(result.error);
    } else if (result.text) {
      updateElement(() => {
        element.innerText = result.text!;
      });
      toast.success("Text updated by AI");
    }
  };

  const handleAiImageGen = async (prompt: string) => {
     if (!element || element.tagName !== 'IMG') return;
     setIsProcessing(true);
     const result = await generateImage(prompt);
     setIsProcessing(false);
     
     if (result.error) {
       toast.error(result.error);
     } else if (result.imageUrl) {
        updateElement(() => {
          (element as HTMLImageElement).src = result.imageUrl!;
        });
        toast.success("Image generated!");
     }
  };

  const handleSubmitInput = () => {
    if (!inputValue.trim()) return;
    if (inputType === 'image') {
      handleAiImageGen(inputValue);
    } else if (inputType === 'link') {
      handleAddLink(inputValue);
    }
    setInputValue('');
    setShowInput(false);
  };

  const handleAddLink = (url: string) => {
    if (!element) return;
    
    updateElement(() => {
      // If element is already a link, just update href
      if (element.tagName === 'A') {
        element.setAttribute('href', url);
      } else {
        // Wrap element in a link
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Clone the element and append to link
        const clone = element.cloneNode(true) as HTMLElement;
        link.appendChild(clone);
        
        // Replace original element with link
        element.parentNode?.replaceChild(link, element);
      }
    });
    toast.success("Link added!");
  };

  const getCurrentLink = (): string => {
    if (!element) return '';
    if (element.tagName === 'A') {
      return element.getAttribute('href') || '';
    }
    // Check if parent is a link
    if (element.parentElement?.tagName === 'A') {
      return element.parentElement.getAttribute('href') || '';
    }
    return '';
  };

  const handleDelete = () => {
    updateElement(() => {
      element.remove();
    });
    onClose();
  };

  // Render different menus based on element type
  const renderMenuContent = () => {
    if (showInput) {
      return (
        <div className="flex items-center gap-2 p-1">
          <input 
            type="text" 
            autoFocus
            className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-sm w-48 outline-none focus:border-blue-500 text-white"
            placeholder={
              inputType === 'image' ? "Describe image..." : 
              inputType === 'link' ? "Enter URL (https://...)" : 
              "Instruction..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitInput()}
          />
          <button 
            onClick={handleSubmitInput}
            disabled={isProcessing}
            className="p-1 hover:bg-green-600 rounded text-green-400 hover:text-white transition-colors"
          >
            {isProcessing ? <RefreshCw className="animate-spin" size={16}/> : <Check size={16}/>}
          </button>
          <button 
            onClick={() => {
              setShowInput(false);
              setInputValue('');
            }}
            className="p-1 hover:bg-neutral-700 rounded text-neutral-400 transition-colors"
          >
            <X size={16}/>
          </button>
        </div>
      );
    }

    if (isProcessing) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 text-blue-400">
          <Wand2 size={16} className="animate-spin" />
          <span className="text-sm font-medium">Magic in progress...</span>
        </div>
      );
    }

    if (type === 'image') {
      const currentLink = getCurrentLink();
      return (
        <div className="flex items-center gap-1 p-1">
          <button 
            onClick={() => {
              const url = prompt("Enter new image URL:", (element as HTMLImageElement).src);
              if (url) updateElement(() => (element as HTMLImageElement).src = url);
            }}
            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-neutral-700 rounded transition-colors text-xs font-medium text-neutral-200"
            title="Edit URL"
          >
            <Edit3 size={14} /> URL
          </button>
          <div className="w-px h-4 bg-neutral-700 mx-1" />
          <button 
             onClick={() => { 
               setInputType('link'); 
               setInputValue(currentLink);
               setShowInput(true); 
             }}
             className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-blue-900/50 rounded transition-colors text-xs font-medium ${currentLink ? 'text-blue-400' : 'text-neutral-300'}`}
             title="Add/Edit Link"
          >
            <LinkIcon size={14} /> Link
          </button>
          <div className="w-px h-4 bg-neutral-700 mx-1" />
          <button 
             onClick={() => { setInputType('image'); setShowInput(true); }}
             className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-purple-900/50 text-purple-300 hover:text-purple-200 rounded transition-colors text-xs font-medium"
             title="Generate with AI"
          >
            <Wand2 size={14} /> Generate
          </button>
           <div className="w-px h-4 bg-neutral-700 mx-1" />
           <button onClick={handleDelete} className="p-1.5 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      );
    }

    // Text & Container Menu
    const currentLink = getCurrentLink();
    return (
      <div className="flex items-center gap-1 p-1">
        <button 
          onClick={onEditStart}
          className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-neutral-700 rounded transition-colors text-xs font-medium text-neutral-200"
          title="Edit Text"
        >
          <Type size={14} /> Edit
        </button>
        
        <div className="w-px h-4 bg-neutral-700 mx-1" />

        <button 
          onClick={() => { 
            setInputType('link'); 
            setInputValue(currentLink);
            setShowInput(true); 
          }}
          className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-blue-900/50 rounded transition-colors text-xs font-medium ${currentLink ? 'text-blue-400' : 'text-neutral-300'}`}
          title="Add/Edit Link"
        >
          <LinkIcon size={14} /> Link
        </button>
        
        <div className="w-px h-4 bg-neutral-700 mx-1" />

        <div className="relative group">
           <button className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-purple-900/50 text-purple-300 hover:text-purple-200 rounded transition-colors text-xs font-medium">
             <Wand2 size={14} /> AI Rewrite
           </button>
           {/* Dropdown for AI Actions */}
           <div className="absolute bottom-full mb-2 left-0 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-50">
              <button onClick={() => handleAiTextAction(AiActionType.REWRITE)} className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-700 flex items-center gap-2 text-neutral-200">
                <RefreshCw size={12} /> Improve
              </button>
              <button onClick={() => handleAiTextAction(AiActionType.SHORTER)} className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-700 flex items-center gap-2 text-neutral-200">
                <MoveHorizontal size={12} /> Make Shorter
              </button>
              <button onClick={() => handleAiTextAction(AiActionType.LONGER)} className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-700 flex items-center gap-2 text-neutral-200">
                <AlignLeft size={12} /> Make Longer
              </button>
              <button onClick={() => handleAiTextAction(AiActionType.TONE_PROFESSIONAL)} className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-700 flex items-center gap-2 text-neutral-200">
                <Bold size={12} /> Professional Tone
              </button>
           </div>
        </div>

        <div className="w-px h-4 bg-neutral-700 mx-1" />
        
        <button onClick={handleDelete} className="p-1.5 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded transition-colors">
          <Trash2 size={14} />
        </button>
         <button onClick={onClose} className="p-1.5 hover:bg-neutral-700 text-neutral-400 rounded transition-colors ml-1">
          <X size={14} />
        </button>
      </div>
    );
  };

  return (
    <div 
      className="fixed z-50 bg-neutral-900 border border-neutral-700 shadow-2xl rounded-lg animate-fade-in-up"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translateX(-50%)'
      }}
      onMouseDown={(e) => e.stopPropagation()} // Prevent clicks from closing selection
    >
      {renderMenuContent()}
      
      {/* Little arrow pointing down */}
      <div className="absolute left-1/2 -bottom-1.5 w-3 h-3 bg-neutral-900 border-b border-r border-neutral-700 -translate-x-1/2 rotate-45"></div>
    </div>
  );
};