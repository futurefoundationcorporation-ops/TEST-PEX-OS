'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - MAIN COMPONENT
// ATHENA Architecture | Integrates All Modules
// ============================================================================

import React, { useEffect } from 'react';
import { Header } from './Header';
import { ActionsToolbar, FloatingActionButton } from './ActionsToolbar';
import { SequentialView } from './SequentialView';
import { MillerColumns } from './MillerColumns';
import { FolderTree } from './FolderTree';
import { SharedView } from './SharedView';
import { ModalEdit } from './modals/ModalEdit';
import { PromptViewer } from './modals/PromptViewer';
import { SettingsModal } from './modals/SettingsModal';
import { NotificationsModal } from './modals/NotificationsModal';
import { MasterKeyModal } from './modals/MasterKeyModal';
import { MoveSelectorModal } from './modals/MoveSelectorModal';
import { Toast } from './Toast';
import { motionStyles } from './MotionWrappers';
import { usePromptManagerStore } from '@/stores/promptManager';

// --- GLOBAL STYLES ---

const globalStyles = `
  /* Custom Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a3040; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #3e4559; }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a3040; border-radius: 2px; }

  /* Motion Styles */
  ${motionStyles}

  /* Selection */
  ::selection { background: rgba(41, 121, 255, 0.3); color: white; }
`;

// --- MAIN PROMPT MANAGER COMPONENT ---

export const PromptManager: React.FC = () => {
  const activeView = usePromptManagerStore((s) => s.activeView);
  const slideDirection = usePromptManagerStore((s) => s.slideDirection);
  const toast = usePromptManagerStore((s) => s.toast);
  const { setSearchQuery, setIsLocked, showToast, setActiveView } = 
    usePromptManagerStore((s) => s.actions);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
          showToast('Busca rápida ativada', 'info');
        }
      }

      // Ctrl+L: Toggle lock
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setIsLocked(usePromptManagerStore.getState().isLocked ? false : true);
      }

      // Ctrl+1/2/3: Switch views
      if ((e.ctrlKey || e.metaKey) && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const views: Record<string, 'sequential' | 'miller' | 'mindmap'> = {
          '1': 'sequential',
          '2': 'miller',
          '3': 'mindmap',
        };
        setActiveView(views[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchQuery, setIsLocked, showToast, setActiveView]);

  // --- Clear slide direction after animation ---
  useEffect(() => {
    if (slideDirection !== 'none') {
      const timer = setTimeout(() => {
        usePromptManagerStore.setState({ slideDirection: 'none' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  // --- Render Current View ---
  const renderView = () => {
    switch (activeView) {
      case 'sequential':
        return <SequentialView />;
      case 'miller':
        return <MillerColumns />;
      case 'mindmap':
        return <FolderTree />;
      case 'shared':
        return <SharedView />;
      default:
        return <SequentialView />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f111a] text-gray-300 font-sans overflow-hidden antialiased">
      {/* Inject Global Styles */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      {/* Header */}
      <Header />

      {/* Secondary Toolbar */}
      <div className="h-12 bg-[#13161c] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {activeView === 'sequential' && 'Navegação Sequencial'}
            {activeView === 'miller' && 'Miller Columns'}
            {activeView === 'mindmap' && 'Estrutura Hierárquica'}
            {activeView === 'shared' && 'Compartilhados'}
          </span>
        </div>
        <ActionsToolbar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#0f111a] overflow-hidden relative">
        <div key={activeView} className="w-full h-full animate-in fade-in duration-300">
          {renderView()}
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Modals */}
      <ModalEdit />
      <PromptViewer />
      <SettingsModal />
      <NotificationsModal />
      <MasterKeyModal />
      <MoveSelectorModal />
    </div>
  );
};

export default PromptManager;
