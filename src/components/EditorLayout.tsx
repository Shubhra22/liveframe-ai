import React, { useState, useEffect } from 'react';
import { LiveCanvas } from './LiveCanvas';
import { ArrowLeftRight, Code, Eye, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { convertHtmlToEmail } from '../services/aiService';
import { toast } from './ui/Toaster';
import { AiGenerateModal } from './AiGenerateModal';

interface EditorLayoutProps {
  initialCode: string;
  onCodeChange: (code: string) => void;
}
export const EditorLayout: React.FC<EditorLayoutProps> = ({ initialCode, onCodeChange }) => {
  const [activeTab, setActiveTab] = useState<'split' | 'code' | 'preview'>('split');
  const [localCode, setLocalCode] = useState(initialCode);
  const [codeToRender, setCodeToRender] = useState(initialCode);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [splitPosition, setSplitPosition] = useState(35);
  const [isDragging, setIsDragging] = useState(false);
  const [showAiGenerate, setShowAiGenerate] = useState(false);
  const liveCanvasRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef(false);

  // Handle resizer drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      
      e.preventDefault();
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      // Clamp between 20% and 80%
      const clampedPosition = Math.min(Math.max(newPosition, 20), 80);
      setSplitPosition(clampedPosition);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Auto-sync code to preview with debounce
  useEffect(() => {
    if (localCode === codeToRender) return;

    setIsSyncing(true);
    const timer = setTimeout(() => {
      setCodeToRender(localCode);
      onCodeChange(localCode);
      setIsSyncing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [localCode, codeToRender, onCodeChange]);

  const handleCanvasUpdate = (newHtml: string) => {
    setLocalCode(newHtml);
    setCodeToRender(newHtml); 
    onCodeChange(newHtml);
  };

  const handleConvertToEmail = async () => {
    setIsConverting(true);
    toast.info("Analyzing and converting code to email format...");
    try {
      const emailHtml = await convertHtmlToEmail(localCode);
      setLocalCode(emailHtml);
      setCodeToRender(emailHtml);
      onCodeChange(emailHtml);
      toast.success("Converted to Email HTML successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to convert code");
    } finally {
      setIsConverting(false);
    }
  };

  const handleAiGenerated = (html: string) => {
    setLocalCode(html);
    setCodeToRender(html);
    onCodeChange(html);
    toast.success("AI design loaded into editor");
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Toolbar */}
      <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-900/50">
        <div className="flex items-center gap-2 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
          <button 
            onClick={() => setActiveTab('code')}
            className={`p-2 rounded-md transition-colors ${activeTab === 'code' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
            title="Code Only"
          >
            <Code size={18} />
          </button>
          <button 
            onClick={() => setActiveTab('split')}
            className={`p-2 rounded-md transition-colors ${activeTab === 'split' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
            title="Split View"
          >
            <ArrowLeftRight size={18} />
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`p-2 rounded-md transition-colors ${activeTab === 'preview' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
            title="Preview Only"
          >
            <Eye size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {isSyncing && (
             <div className="flex items-center gap-1.5 text-xs text-neutral-500 animate-pulse mr-2">
               <Loader2 size={12} className="animate-spin" />
               <span>Syncing...</span>
             </div>
          )}

          <button
            onClick={() => setShowAiGenerate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold rounded-md transition-all shadow-lg shadow-blue-900/20"
          >
            <Wand2 size={14} />
            Generate with AI
          </button>
          
          <button 
            onClick={handleConvertToEmail}
            disabled={isConverting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-md transition-all shadow-lg shadow-purple-900/20"
          >
            {isConverting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Email Ready
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* Code Editor */}
        <div 
          className={`
            flex bg-[#1e1e1e]
            ${activeTab === 'preview' ? 'hidden' : 'flex'}
            ${activeTab === 'split' ? '' : 'w-full'}
          `}
          style={activeTab === 'split' ? { width: `${splitPosition}%`, flexShrink: 0 } : undefined}
        >
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 text-xs font-mono text-neutral-500 border-b border-neutral-800 flex justify-between bg-[#252525]">
              <span>SOURCE CODE</span>
              <span className="text-neutral-600">Editable</span>
            </div>
            <textarea
              className="flex-1 w-full bg-[#1e1e1e] text-neutral-300 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
              value={localCode}
              onChange={(e) => setLocalCode(e.target.value)}
              spellCheck={false}
              placeholder="Paste your HTML here..."
            />
          </div>
        </div>
        {/* Resizer */}
        {activeTab === 'split' && (
          <div
            onMouseDown={handleMouseDown}
            className={`
              w-1 bg-neutral-800 hover:bg-blue-500 cursor-col-resize relative flex-shrink-0
              ${isDragging ? 'bg-blue-500' : ''}
            `}
            style={{ transition: isDragging ? 'none' : 'background-color 0.2s' }}
          >
            <div className="absolute inset-y-0 -left-2 -right-2" />
          </div>
        )}

        {/* Live Preview */}
        <div 
          className={`
            flex-col bg-neutral-100 relative flex-1
            ${activeTab === 'code' ? 'hidden' : 'flex'}
          `}
        >
          <div className="flex-1 overflow-hidden bg-neutral-100">
            <LiveCanvas 
              ref={liveCanvasRef}
              html={codeToRender} 
              onHtmlChange={handleCanvasUpdate} 
            />
          </div>
        </div>
      </div>

      {/* AI Generate Modal */}
      <AiGenerateModal
        isOpen={showAiGenerate}
        onClose={() => setShowAiGenerate(false)}
        onGenerated={handleAiGenerated}
      />
    </div>
  );
};