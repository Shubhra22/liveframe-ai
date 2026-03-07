import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Loader2, Wand2, Send } from 'lucide-react';
import { generateEmailDesign, isAiAvailable } from '../services/aiService';

interface AiGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (html: string) => void;
}

const SUGGESTIONS = [
  "Welcome email for a SaaS product with a hero image, feature highlights, and CTA button",
  "E-commerce order confirmation with order details table and tracking info",
  "Monthly newsletter with a header banner, 3 article cards, and footer",
  "Event invitation with date, location, RSVP button, and speaker photos",
  "Password reset email with a secure reset link button",
  "Product launch announcement with product image and pre-order CTA",
];

export const AiGenerateModal: React.FC<AiGenerateModalProps> = ({ isOpen, onClose, onGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
      setPreview('');
      setError('');
      setIsGenerating(false);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!isAiAvailable()) {
      setError('AI service not configured. Add VITE_OPENAI_API_KEY and VITE_OPENAI_ENDPOINT to your .env file.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setPreview('');

    try {
      const html = await generateEmailDesign(prompt, (chunk) => {
        setPreview(chunk);
      });
      setPreview(html);
    } catch (e: any) {
      setError(e.message || 'Failed to generate email design');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseDesign = () => {
    if (preview) {
      onGenerated(preview);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl w-[90vw] max-w-5xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 rounded-lg">
              <Wand2 size={18} className="text-white" />
            </div>
            <h2 className="text-base font-semibold text-white">Generate Email with AI</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-1 rounded-md hover:bg-neutral-800">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left - Prompt */}
          <div className="w-2/5 border-r border-neutral-800 flex flex-col p-4 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Describe your email</label>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. A welcome email for a fitness app with a hero image, 3 feature cards, and a 'Get Started' button..."
                className="w-full h-32 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-neutral-200 placeholder-neutral-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-xs text-neutral-600">Ctrl+Enter to generate</span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isGenerating ? 'Generating...' : 'Generate Design'}
            </button>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-xs text-red-300">{error}</div>
            )}

            {/* Suggestions */}
            <div className="flex-1 overflow-y-auto mt-2">
              <p className="text-xs text-neutral-500 mb-2">Quick ideas:</p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(s)}
                    className="text-left text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 p-2 rounded-md transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Preview */}
          <div className="flex-1 flex flex-col bg-neutral-950">
            <div className="px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Preview</span>
              {preview && !isGenerating && (
                <button
                  onClick={handleUseDesign}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  <Send size={12} />
                  Use This Design
                </button>
              )}
            </div>
            <div className="flex-1 overflow-auto bg-white">
              {preview ? (
                <iframe
                  srcDoc={preview}
                  className="w-full h-full border-0"
                  title="AI Generated Preview"
                  sandbox="allow-same-origin"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={24} className="animate-spin text-purple-400" />
                      <span className="text-neutral-400">Crafting your email design...</span>
                    </div>
                  ) : (
                    <span>Your generated email will appear here</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
