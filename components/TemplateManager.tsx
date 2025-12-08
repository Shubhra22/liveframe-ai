import React, { useState, useEffect } from 'react';
import { templateService, EmailTemplate } from '../services/templateService';

interface TemplateManagerProps {
  onLoad: (template: EmailTemplate) => void;
  onSave: () => { html: string; css: string; components: any };
  currentTemplateId?: string;
  onTemplateIdChange: (id: string | undefined) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  onLoad,
  onSave,
  currentTemplateId,
  onTemplateIdChange,
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await templateService.listTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      alert('Failed to load templates');
    }
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    setIsSaving(true);
    try {
      const data = onSave();
      
      if (currentTemplateId) {
        // Update existing
        await templateService.updateTemplate(currentTemplateId, {
          name: templateName,
          ...data,
        });
        alert('Template updated!');
      } else {
        // Create new
        const newTemplate = await templateService.saveTemplate({
          name: templateName,
          ...data,
        });
        onTemplateIdChange(newTemplate.id);
        alert('Template saved!');
      }
      
      await loadTemplates();
      setShowSaveDialog(false);
      setTemplateName('');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (template: EmailTemplate) => {
    if (confirm(`Load "${template.name}"? Any unsaved changes will be lost.`)) {
      onLoad(template);
      onTemplateIdChange(template.id);
      setIsOpen(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      try {
        await templateService.deleteTemplate(id);
        if (currentTemplateId === id) {
          onTemplateIdChange(undefined);
        }
        await loadTemplates();
        alert('Template deleted');
      } catch (error) {
        console.error('Failed to delete template:', error);
        alert('Failed to delete template');
      }
    }
  };

  const handleNew = () => {
    if (confirm('Create new template? Any unsaved changes will be lost.')) {
      onTemplateIdChange(undefined);
      window.location.reload();
    }
  };

  return (
    <div className="flex gap-2">
      {/* Save Button */}
      <button
        onClick={() => setShowSaveDialog(true)}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
        title="Save template"
      >
        💾 Save
      </button>

      {/* Load Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
        title="Load template"
      >
        📂 Load
      </button>

      {/* New Button */}
      <button
        onClick={handleNew}
        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
        title="New template"
      >
        ➕ New
      </button>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {currentTemplateId ? 'Update Template' : 'Save Template'}
            </h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setTemplateName('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Load Template</h3>
            
            <div className="flex-1 overflow-y-auto">
              {templates.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No templates saved yet</p>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(template.updated_at!).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoad(template)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(template.id!, template.name)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
