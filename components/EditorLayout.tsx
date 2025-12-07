import React, { useState, useEffect } from 'react';
import { LiveCanvas } from './LiveCanvas';
import { ArrowLeftRight, Code, Eye, MonitorPlay, Loader2, Mail, Sparkles, Grid3x3, X } from 'lucide-react';
import { convertHtmlToEmail } from '../services/geminiService';
import { toast } from './ui/Toaster';

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
  const [showBlocks, setShowBlocks] = useState(false);

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

  // Handle manual run
  const handleApplyCode = () => {
    setCodeToRender(localCode);
    onCodeChange(localCode);
    setIsSyncing(false);
  };

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
            onClick={handleConvertToEmail}
            disabled={isConverting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-md transition-all shadow-lg shadow-purple-900/20"
          >
            {isConverting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Make Email Ready
          </button>

          <button 
            onClick={handleApplyCode}
            className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-md transition-colors border border-neutral-700"
          >
            <MonitorPlay size={14} /> Run
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor Section */}
        <div className={`
          flex border-r border-neutral-800 bg-[#1e1e1e]
          ${activeTab === 'preview' ? 'hidden' : 'flex'}
          ${activeTab === 'split' ? 'w-1/2' : 'w-full'}
        `}>
          {/* Blocks Panel */}
          {showBlocks && (
            <div className="w-64 bg-neutral-900 border-r border-neutral-800 overflow-y-auto">
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Blocks</h3>
                <button 
                  onClick={() => setShowBlocks(false)}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="blocks-container p-2"></div>
            </div>
          )}

          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 text-xs font-mono text-neutral-500 border-b border-neutral-800 flex justify-between bg-[#252525]">
              <div className="flex items-center gap-2">
                <span>SOURCE CODE</span>
                {!showBlocks && (
                  <button 
                    onClick={() => setShowBlocks(true)}
                    className="flex items-center gap-1 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-300 text-xs rounded transition-colors"
                    title="Show Blocks"
                  >
                    <Grid3x3 size={12} />
                    Blocks
                  </button>
                )}
              </div>
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

        {/* Live Preview */}
        <div className={`
          flex-col bg-neutral-100 relative
          ${activeTab === 'code' ? 'hidden' : 'flex'}
          ${activeTab === 'split' ? 'w-1/2' : 'w-full'}
        `}>
          <div className="flex-1 overflow-hidden bg-neutral-100">
            <LiveCanvas html={codeToRender} onHtmlChange={handleCanvasUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
};