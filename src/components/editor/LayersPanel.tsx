import React, { useState } from 'react';
import { LayersProvider, StylesProvider, TraitsProvider, SelectorsProvider } from '@grapesjs/react';
import { Layers3, Paintbrush, Settings } from 'lucide-react';

type Tab = 'layers' | 'styles' | 'traits';

export const LayersPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('styles');
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 bg-neutral-900 border-l border-neutral-800 flex items-center justify-center hover:bg-neutral-800 transition-colors shrink-0"
        title="Open Panel"
      >
        <Paintbrush size={16} className="text-neutral-400" />
      </button>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'styles', label: 'Styles', icon: <Paintbrush size={13} /> },
    { id: 'layers', label: 'Layers', icon: <Layers3 size={13} /> },
    { id: 'traits', label: 'Settings', icon: <Settings size={13} /> },
  ];

  return (
    <div className="w-60 bg-neutral-900 border-l border-neutral-800 flex flex-col shrink-0 overflow-hidden">
      <div className="flex border-b border-neutral-800 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-blue-500 bg-neutral-800/50'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Styles tab */}
        <div className={activeTab === 'styles' ? '' : 'hidden'}>
          <SelectorsProvider>
            {({ Container: SelectorsContainer }) => (
              <SelectorsContainer><></></SelectorsContainer>
            )}
          </SelectorsProvider>
          <StylesProvider>
            {({ Container: StylesContainer }) => (
              <StylesContainer><></></StylesContainer>
            )}
          </StylesProvider>
        </div>

        {/* Layers tab */}
        <div className={activeTab === 'layers' ? '' : 'hidden'}>
          <LayersProvider>
            {({ Container: LayersContainer }) => (
              <LayersContainer><></></LayersContainer>
            )}
          </LayersProvider>
        </div>

        {/* Traits/Settings tab */}
        <div className={activeTab === 'traits' ? '' : 'hidden'}>
          <TraitsProvider>
            {({ Container: TraitsContainer }) => (
              <TraitsContainer><></></TraitsContainer>
            )}
          </TraitsProvider>
        </div>
      </div>
    </div>
  );
};
