'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - ACTIONS TOOLBAR
// ATHENA Architecture | All Buttons Visible | Premium Dark Theme
// ============================================================================

import React from 'react';
import {
  Plus,
  FolderPlus,
  FilePlus,
  Download,
  Upload,
  Share2,
  Link as LinkIcon,
  Copy,
  Trash2,
  MoreVertical,
  Save,
  RotateCcw,
  ArrowDownToLine,
  Package,
} from 'lucide-react';
import { Tooltip, ShortcutTooltip } from './TooltipWrapper';
import { usePromptManagerStore } from '@/stores/promptManager';
import { BackupService } from '@/lib/api/prompts';

interface ActionsToolbarProps {
  className?: string;
  variant?: 'default' | 'compact' | 'expanded';
}

export const ActionsToolbar: React.FC<ActionsToolbarProps> = ({
  className = '',
  variant = 'default',
}) => {
  const isLocked = usePromptManagerStore((s) => s.isLocked);
  const selectedFolder = usePromptManagerStore((s) => s.selectedFolder);
  const selectedPrompt = usePromptManagerStore((s) => s.selectedPrompt);
  const { showToast, openEditModal } = usePromptManagerStore((s) => s.actions);

  // --- Handlers ---

  const handleNewFolder = () => {
    if (isLocked) {
      showToast('Desbloqueie para criar pastas', 'warning');
      return;
    }
    // Create new folder modal
    showToast('Criar nova pasta...', 'info');
  };

  const handleNewPrompt = () => {
    if (isLocked) {
      showToast('Desbloqueie para criar prompts', 'warning');
      return;
    }
    // Create new prompt modal
    showToast('Criar novo prompt...', 'info');
  };

  const handleExport = async () => {
    try {
      const url = await BackupService.createBackup();
      BackupService.downloadBackup(url, `pex-os-backup-${Date.now()}.json`);
      showToast('Backup exportado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao exportar backup', 'error');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const success = await BackupService.restoreBackup(file);
        if (success) {
          showToast('Backup restaurado com sucesso!', 'success');
          window.location.reload();
        } else {
          showToast('Erro ao restaurar backup', 'error');
        }
      }
    };
    input.click();
  };

  const handleShare = () => {
    if (!selectedFolder && !selectedPrompt) {
      showToast('Selecione um item para compartilhar', 'warning');
      return;
    }
    showToast('Compartilhando...', 'info');
  };

  const handleCopyLink = () => {
    if (!selectedFolder && !selectedPrompt) {
      showToast('Selecione um item para gerar link', 'warning');
      return;
    }
    const item = selectedPrompt || selectedFolder;
    const link = `${window.location.origin}/share/${item?.id}`;
    navigator.clipboard.writeText(link);
    showToast('Link copiado!', 'success');
  };

  const handleDelete = () => {
    if (isLocked) {
      showToast('Desbloqueie para deletar', 'warning');
      return;
    }
    if (!selectedFolder && !selectedPrompt) {
      showToast('Selecione um item para deletar', 'warning');
      return;
    }
    showToast('Confirmar exclusão?', 'warning');
  };

  // --- Button Style Classes ---

  const primaryBtnClass = `
    flex items-center justify-center gap-2 px-4 py-2 
    bg-[#2979ff] hover:bg-[#2264d1] text-white 
    text-xs font-bold rounded-lg transition-all 
    shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 
    active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const secondaryBtnClass = `
    flex items-center justify-center gap-2 px-3 py-2 
    bg-[#1e2330] hover:bg-white/10 text-gray-300 hover:text-white
    text-xs font-medium rounded-lg transition-all 
    border border-white/10 hover:border-white/20
    active:scale-[0.98]
  `;

  const iconBtnClass = `
    p-2 rounded-lg transition-all
    text-gray-400 hover:text-white hover:bg-white/10
    active:scale-[0.95]
  `;

  // --- Compact Variant ---

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Tooltip content="Nova Pasta" position="bottom">
          <button onClick={handleNewFolder} className={iconBtnClass} disabled={isLocked}>
            <FolderPlus size={16} />
          </button>
        </Tooltip>
        <Tooltip content="Novo Prompt" position="bottom">
          <button onClick={handleNewPrompt} className={iconBtnClass} disabled={isLocked}>
            <FilePlus size={16} />
          </button>
        </Tooltip>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <Tooltip content="Exportar" position="bottom">
          <button onClick={handleExport} className={iconBtnClass}>
            <Download size={16} />
          </button>
        </Tooltip>
        <Tooltip content="Importar" position="bottom">
          <button onClick={handleImport} className={iconBtnClass}>
            <Upload size={16} />
          </button>
        </Tooltip>
      </div>
    );
  }

  // --- Expanded Variant ---

  if (variant === 'expanded') {
    return (
      <div className={`flex flex-col gap-2 p-4 bg-[#1e2330] rounded-xl border border-white/10 ${className}`}>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Ações Rápidas
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleNewFolder} className={primaryBtnClass} disabled={isLocked}>
            <FolderPlus size={14} /> Nova Pasta
          </button>
          <button onClick={handleNewPrompt} className={primaryBtnClass} disabled={isLocked}>
            <FilePlus size={14} /> Novo Prompt
          </button>
        </div>

        <div className="h-px bg-white/5 my-2" />

        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleExport} className={secondaryBtnClass}>
            <Download size={14} /> Exportar
          </button>
          <button onClick={handleImport} className={secondaryBtnClass}>
            <Upload size={14} /> Importar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleShare} className={secondaryBtnClass}>
            <Share2 size={14} /> Compartilhar
          </button>
          <button onClick={handleCopyLink} className={secondaryBtnClass}>
            <LinkIcon size={14} /> Copiar Link
          </button>
        </div>

        <div className="h-px bg-white/5 my-2" />

        <button 
          onClick={handleDelete} 
          className={`${secondaryBtnClass} text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20`}
          disabled={isLocked}
        >
          <Trash2 size={14} /> Excluir Selecionado
        </button>
      </div>
    );
  }

  // --- Default Variant ---

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Primary Actions */}
      <div className="flex items-center gap-1 bg-[#0f111a] p-1 rounded-lg border border-white/5">
        <ShortcutTooltip label="Nova Pasta" shortcut="Ctrl+N" position="bottom">
          <button onClick={handleNewFolder} className={iconBtnClass} disabled={isLocked}>
            <FolderPlus size={16} />
          </button>
        </ShortcutTooltip>
        
        <ShortcutTooltip label="Novo Prompt" shortcut="Ctrl+P" position="bottom">
          <button onClick={handleNewPrompt} className={iconBtnClass} disabled={isLocked}>
            <FilePlus size={16} />
          </button>
        </ShortcutTooltip>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center gap-1 bg-[#0f111a] p-1 rounded-lg border border-white/5">
        <Tooltip content="Exportar Backup" position="bottom">
          <button onClick={handleExport} className={iconBtnClass}>
            <Download size={16} />
          </button>
        </Tooltip>
        
        <Tooltip content="Importar Backup" position="bottom">
          <button onClick={handleImport} className={iconBtnClass}>
            <Upload size={16} />
          </button>
        </Tooltip>
      </div>

      {/* Share Actions */}
      <div className="flex items-center gap-1 bg-[#0f111a] p-1 rounded-lg border border-white/5">
        <Tooltip content="Compartilhar" position="bottom">
          <button onClick={handleShare} className={iconBtnClass}>
            <Share2 size={16} />
          </button>
        </Tooltip>
        
        <Tooltip content="Copiar Link" position="bottom">
          <button onClick={handleCopyLink} className={iconBtnClass}>
            <LinkIcon size={16} />
          </button>
        </Tooltip>
      </div>

      {/* Danger Actions */}
      <Tooltip content="Excluir" position="bottom">
        <button 
          onClick={handleDelete} 
          className={`${iconBtnClass} hover:text-red-400 hover:bg-red-500/10`}
          disabled={isLocked}
        >
          <Trash2 size={16} />
        </button>
      </Tooltip>
    </div>
  );
};

// --- FLOATING ACTION BUTTON ---

interface FABProps {
  className?: string;
}

export const FloatingActionButton: React.FC<FABProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isLocked = usePromptManagerStore((s) => s.isLocked);
  const { showToast } = usePromptManagerStore((s) => s.actions);

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Expanded Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-2 animate-slide-up-fade">
          <Tooltip content="Nova Pasta" position="left">
            <button
              onClick={() => {
                if (isLocked) {
                  showToast('Desbloqueie para criar', 'warning');
                  return;
                }
                showToast('Criar pasta...', 'info');
                setIsOpen(false);
              }}
              className="w-12 h-12 rounded-full bg-[#1e2330] border border-white/10 shadow-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#2979ff]/10 hover:border-[#2979ff]/50 transition-all"
            >
              <FolderPlus size={20} />
            </button>
          </Tooltip>
          
          <Tooltip content="Novo Prompt" position="left">
            <button
              onClick={() => {
                if (isLocked) {
                  showToast('Desbloqueie para criar', 'warning');
                  return;
                }
                showToast('Criar prompt...', 'info');
                setIsOpen(false);
              }}
              className="w-12 h-12 rounded-full bg-[#1e2330] border border-white/10 shadow-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#2979ff]/10 hover:border-[#2979ff]/50 transition-all"
            >
              <FilePlus size={20} />
            </button>
          </Tooltip>
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-2xl flex items-center justify-center
          transition-all duration-300
          ${isOpen 
            ? 'bg-[#1e2330] text-white rotate-45' 
            : 'bg-[#2979ff] text-white hover:bg-[#2264d1]'}
        `}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default ActionsToolbar;
