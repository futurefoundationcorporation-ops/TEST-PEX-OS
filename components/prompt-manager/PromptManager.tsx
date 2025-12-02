'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - MAIN COMPONENT
// ATHENA Architecture | Integrates All Modules | Premium Dark Theme
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { ActionsToolbar, FloatingActionButton } from './ActionsToolbar';
import { SequentialView } from './SequentialView';
import { MillerColumns } from './MillerColumns';
import { HierarchyView } from './views/HierarchyView';
import { SharedView } from './SharedView';
import { ModalEdit } from './modals/ModalEdit';
import { PromptViewer } from './modals/PromptViewer';
import { SettingsModal } from './modals/SettingsModal';
import { NotificationsModal } from './modals/NotificationsModal';
import { MasterKeyModal } from './modals/MasterKeyModal';
import { MoveSelectorModal } from './modals/MoveSelectorModal';
import { CreateModal, useCreateModal } from './modals/CreateModal';
import { DeleteModal, useDeleteModal } from './modals/DeleteModal';
import { Toast } from './Toast';
import { TagBar } from './TagBar';
import { usePromptManagerStore } from '@/stores/promptManager';

// Import animations CSS
import '@/styles/animations.css';

// --- GLOBAL STYLES ---

const globalStyles = `
  /* Custom Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a3040; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #3e4559; }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a3040; border-radius: 2px; }

  /* Selection */
  ::selection { background: rgba(41, 121, 255, 0.3); color: white; }

  /* Ensure correct colors - ATHENA Theme */
  :root {
    --color-primary: #2979ff;
    --color-primary-hover: #2264d1;
    --color-bg-dark: #0f111a;
    --color-bg-panel: #1e2330;
    --color-bg-secondary: #13161c;
    --color-border: rgba(255, 255, 255, 0.1);
  }
`;

// --- VIEW LABELS ---

const VIEW_LABELS: Record<string, string> = {
  sequential: 'Navegação Sequencial',
  miller: 'Miller Columns',
  mindmap: 'Estrutura Hierárquica',
  shared: 'Compartilhados',
};

// --- MAIN PROMPT MANAGER COMPONENT ---

export const PromptManager: React.FC = () => {
  const activeView = usePromptManagerStore((s) => s.activeView);
  const slideDirection = usePromptManagerStore((s) => s.slideDirection);
  const toast = usePromptManagerStore((s) => s.toast);
  const isLocked = usePromptManagerStore((s) => s.isLocked);
  const selectedFolder = usePromptManagerStore((s) => s.selectedFolder);
  const { setSearchQuery, setIsLocked, showToast, setActiveView } = 
    usePromptManagerStore((s) => s.actions);

  // Create Modal State
  const {
    isOpen: isCreateOpen,
    type: createType,
    parentId: createParentId,
    openCreateModal,
    closeCreateModal,
  } = useCreateModal();

  // Delete Modal State
  const {
    isOpen: isDeleteOpen,
    item: deleteItem,
    openDeleteModal,
    closeDeleteModal,
  } = useDeleteModal();

  // Tag Filter State
  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if modal is open or focus is in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

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
        setIsLocked(!isLocked);
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
        showToast(`Vista: ${VIEW_LABELS[views[e.key]]}`, 'info');
      }

      // Ctrl+N: New folder
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (!isLocked) {
          openCreateModal('folder', selectedFolder?.id || null);
        } else {
          showToast('Desbloqueie para criar', 'warning');
        }
      }

      // Ctrl+P: New prompt (when not locked)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        if (!isLocked) {
          openCreateModal('prompt', selectedFolder?.id || null);
        } else {
          showToast('Desbloqueie para criar', 'warning');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchQuery, setIsLocked, showToast, setActiveView, isLocked, selectedFolder, openCreateModal]);

  // --- Clear slide direction after animation ---
  useEffect(() => {
    if (slideDirection !== 'none') {
      const timer = setTimeout(() => {
        usePromptManagerStore.setState({ slideDirection: 'none' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  // --- Handle tag filter change ---
  const handleTagFilterChange = (tags: string[]) => {
    setFilteredTags(tags);
    if (tags.length > 0) {
      showToast(`Filtrando por ${tags.length} tag(s)`, 'info');
    }
  };

  // --- Render Current View ---
  const renderView = () => {
    switch (activeView) {
      case 'sequential':
        return <SequentialView />;
      case 'miller':
        return <MillerColumns />;
      case 'mindmap':
        return <HierarchyView />;
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
            {VIEW_LABELS[activeView] || 'Vista'}
          </span>
          
          {/* Tag Filter - Show for non-shared views */}
          {activeView !== 'shared' && (
            <>
              <div className="w-px h-4 bg-white/10" />
              <TagBar
                variant="compact"
                maxVisible={5}
                onFilterChange={handleTagFilterChange}
              />
            </>
          )}
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
      
      {/* Create Modal */}
      <CreateModal
        isOpen={isCreateOpen}
        onClose={closeCreateModal}
        type={createType}
        parentId={createParentId}
      />
      
      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        item={deleteItem}
      />
    </div>
  );
};

export default PromptManager;
