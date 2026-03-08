import React, { useState } from 'react';
import { BlocksProvider } from '@grapesjs/react';
import type { BlocksResultProps } from '@grapesjs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const BlocksPanelInner: React.FC<BlocksResultProps> = ({ mapCategoryBlocks, dragStart, dragStop, Container }) => {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [useCustomUI, setUseCustomUI] = useState(true);

  // Open first category by default
  if (mapCategoryBlocks.size > 0 && openCategories.size === 0) {
    const firstKey = mapCategoryBlocks.keys().next().value;
    if (firstKey) setOpenCategories(new Set([firstKey]));
  }

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="w-56 bg-neutral-900 border-r border-neutral-800 overflow-y-auto flex flex-col shrink-0">
      <div className="p-3 border-b border-neutral-800">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Components</h3>
        <p className="text-xs text-neutral-600 mt-1">Drag to canvas</p>
      </div>
      {useCustomUI ? (
        <div className="flex-1 overflow-y-auto">
          {Array.from(mapCategoryBlocks.entries()).map(([catName, catBlocks]) => (
            <div key={catName}>
              <button
                onClick={() => toggleCategory(catName)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider hover:text-neutral-300 hover:bg-neutral-800/50 transition-colors"
              >
                {openCategories.has(catName) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {catName}
              </button>
              {openCategories.has(catName) && (
                <div className="grid grid-cols-2 gap-1.5 px-2 pb-2">
                  {catBlocks.map((block) => (
                    <div
                      key={block.getId()}
                      draggable
                      onDragStart={(e) => dragStart(block, e.nativeEvent)}
                      onDragEnd={() => dragStop(false)}
                      className="flex flex-col items-center gap-1 p-2 bg-neutral-800 border border-neutral-700 rounded-md cursor-grab hover:bg-neutral-750 hover:border-neutral-600 transition-all text-center active:cursor-grabbing"
                    >
                      <div
                        className="text-neutral-500 text-lg"
                        dangerouslySetInnerHTML={{ __html: block.getMedia?.() || block.get('media') || '' }}
                      />
                      <span className="text-[10px] text-neutral-400 leading-tight">
                        {block.getLabel?.() || block.get('label') || 'Block'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <Container>
            <></>
          </Container>
        </div>
      )}
    </div>
  );
};

export const BlocksPanel: React.FC = () => {
  return (
    <BlocksProvider>
      {(props) => <BlocksPanelInner {...props} />}
    </BlocksProvider>
  );
};
