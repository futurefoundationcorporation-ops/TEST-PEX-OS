'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - CONTEXT MENU
// ATHENA Architecture | Right-Click Context Menu | Premium Dark Theme
// ============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Edit2,
  Trash2,
  Copy,
  FolderPlus,
  FilePlus,
  Share2,
  Link as LinkIcon,
  Move,
  Eye,
  Scissors,
  Clipboard,
  MoreHorizontal,
} from 'lucide-react';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { TreeNode, Folder as FolderType, Prompt } from '@/types/prompt-manager';

// --- MENU ITEM TYPES ---

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

// --- CONTEXT MENU PROPS ---

interface ContextMenuProps {
  x: number;
  y: number;
  item: TreeNode;
  onClose: () => void;
  onEdit?: (item: TreeNode) => void;
  onDelete?: (item: TreeNode) => void;
  onMove?: (item: TreeNode) => void;
  onCreateFolder?: (parentId: string | null) => void;
  onCreatePrompt?: (parentId: string | null) => void;
  onCopy?: (item: TreeNode) => void;
  onShare?: (item: TreeNode) => void;
}

// --- MAIN CONTEXT MENU ---

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  item,
  onClose,
  onEdit,
  onDelete,
  onMove,
  onCreateFolder,
  onCreatePrompt,
  onCopy,
  onShare,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const isLocked = usePromptManagerStore((s) => s.isLocked);
  const { showToast, openEditModal, setPromptViewerOpen, setSelectedPrompt } =
    usePromptManagerStore((s) => s.actions);

  const isFolder = item.type === 'folder';

  // Adjust position to stay within viewport
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      // Adjust horizontal position
      if (x + rect.width > viewportWidth - 20) {
        adjustedX = viewportWidth - rect.width - 20;
      }

      // Adjust vertical position
      if (y + rect.height > viewportHeight - 20) {
        adjustedY = viewportHeight - rect.height - 20;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Build menu items
  const menuItems: MenuItem[] = [];

  // View (for prompts)
  if (!isFolder) {
    menuItems.push({
      id: 'view',
      label: 'Visualizar',
      icon: <Eye size={14} />,
      onClick: () => {
        setSelectedPrompt(item as Prompt);
        setPromptViewerOpen(true);
        onClose();
      },
    });
  }

  // Edit
  menuItems.push({
    id: 'edit',
    label: 'Editar',
    icon: <Edit2 size={14} />,
    onClick: () => {
      if (onEdit) {
        onEdit(item);
      } else {
        openEditModal(item, !isFolder);
      }
      onClose();
    },
  });

  // Copy
  menuItems.push({
    id: 'copy',
    label: isFolder ? 'Duplicar' : 'Copiar Conteúdo',
    icon: <Copy size={14} />,
    onClick: () => {
      if (onCopy) {
        onCopy(item);
      } else if (!isFolder) {
        navigator.clipboard.writeText((item as Prompt).content || '');
        showToast('Conteúdo copiado!', 'success');
      } else {
        showToast('Pasta duplicada!', 'success');
      }
      onClose();
    },
  });

  // Divider
  menuItems.push({
    id: 'div1',
    label: '',
    icon: null,
    onClick: () => {},
    divider: true,
  });

  // Create subfolder (for folders)
  if (isFolder) {
    menuItems.push({
      id: 'create-folder',
      label: 'Nova Subpasta',
      icon: <FolderPlus size={14} />,
      onClick: () => {
        if (isLocked) {
          showToast('Desbloqueie para criar', 'warning');
        } else if (onCreateFolder) {
          onCreateFolder(item.id);
        } else {
          showToast('Criar subpasta...', 'info');
        }
        onClose();
      },
      disabled: isLocked,
    });

    menuItems.push({
      id: 'create-prompt',
      label: 'Novo Prompt',
      icon: <FilePlus size={14} />,
      onClick: () => {
        if (isLocked) {
          showToast('Desbloqueie para criar', 'warning');
        } else if (onCreatePrompt) {
          onCreatePrompt(item.id);
        } else {
          showToast('Criar prompt...', 'info');
        }
        onClose();
      },
      disabled: isLocked,
    });
  }

  // Move
  menuItems.push({
    id: 'move',
    label: 'Mover para...',
    icon: <Move size={14} />,
    onClick: () => {
      if (isLocked) {
        showToast('Desbloqueie para mover', 'warning');
      } else if (onMove) {
        onMove(item);
      } else {
        showToast('Selecionar destino...', 'info');
      }
      onClose();
    },
    disabled: isLocked,
  });

  // Divider
  menuItems.push({
    id: 'div2',
    label: '',
    icon: null,
    onClick: () => {},
    divider: true,
  });

  // Share
  menuItems.push({
    id: 'share',
    label: 'Compartilhar',
    icon: <Share2 size={14} />,
    onClick: () => {
      if (onShare) {
        onShare(item);
      } else {
        showToast(`Compartilhando "${item.name}"...`, 'info');
      }
      onClose();
    },
  });

  // Copy link
  menuItems.push({
    id: 'copy-link',
    label: 'Copiar Link',
    icon: <LinkIcon size={14} />,
    onClick: () => {
      const link = `${window.location.origin}/share/${item.id}`;
      navigator.clipboard.writeText(link);
      showToast('Link copiado!', 'success');
      onClose();
    },
  });

  // Divider
  menuItems.push({
    id: 'div3',
    label: '',
    icon: null,
    onClick: () => {},
    divider: true,
  });

  // Delete
  menuItems.push({
    id: 'delete',
    label: 'Excluir',
    icon: <Trash2 size={14} />,
    onClick: () => {
      if (isLocked) {
        showToast('Desbloqueie para excluir', 'warning');
      } else if (onDelete) {
        onDelete(item);
      } else {
        showToast('Confirmar exclusão?', 'warning');
      }
      onClose();
    },
    disabled: isLocked,
    danger: true,
  });

  return (
    <div
      ref={menuRef}
      style={{ top: position.y, left: position.x }}
      className="fixed z-[300] bg-[#1e2330] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[180px] animate-context-menu"
    >
      {/* Item Info Header */}
      <div className="px-3 py-2 border-b border-white/5 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{item.emoji || (isFolder ? '📁' : '📄')}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{item.name}</p>
            <p className="text-[10px] text-gray-500">
              {isFolder
                ? `${(item as FolderType).children?.length || 0} itens`
                : (item as Prompt).category || 'Prompt'}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      {menuItems.map((menuItem) => {
        if (menuItem.divider) {
          return <div key={menuItem.id} className="h-px bg-white/5 my-1" />;
        }

        return (
          <button
            key={menuItem.id}
            onClick={menuItem.onClick}
            disabled={menuItem.disabled}
            className={`
              w-full px-3 py-2 text-left text-xs flex items-center gap-2.5
              transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              ${menuItem.danger
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'}
            `}
          >
            {menuItem.icon}
            <span>{menuItem.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// --- CONTEXT MENU HOOK ---

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: TreeNode;
  } | null>(null);

  const openContextMenu = useCallback((e: React.MouseEvent, item: TreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
  };
};

export default ContextMenu;
