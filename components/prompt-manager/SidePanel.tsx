'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - SIDE PANEL
// ATHENA Architecture | Folder Navigation Panel | Premium Dark Theme
// ============================================================================

import React, { useState, useCallback } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Home,
  Settings,
  Lock,
  Unlock,
} from 'lucide-react';
import { Tooltip } from './TooltipWrapper';
import { AnimatedTreeItem } from './MotionWrappers';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { TreeNode, Folder as FolderType, Prompt } from '@/types/prompt-manager';

// --- TREE NODE COMPONENT ---

interface TreeNodeItemProps {
  node: TreeNode;
  level?: number;
  onSelect: (node: TreeNode) => void;
  onEdit: (node: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
  selectedId: string | null;
  isLocked: boolean;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  level = 0,
  onSelect,
  onEdit,
  onDelete,
  onContextMenu,
  selectedId,
  isLocked,
  expandedIds,
  onToggleExpand,
}) => {
  const isFolder = node.type === 'folder';
  const hasChildren = isFolder && (node as FolderType).children?.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      onToggleExpand(node.id);
    }
    onSelect(node);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as unknown as React.MouseEvent);
    }
    if (e.key === 'ArrowRight' && isFolder && !isExpanded) {
      onToggleExpand(node.id);
    }
    if (e.key === 'ArrowLeft' && isFolder && isExpanded) {
      onToggleExpand(node.id);
    }
  };

  const renderIcon = () => {
    if (node.emoji) {
      return <span className="text-sm leading-none w-4 text-center">{node.emoji}</span>;
    }
    if (isFolder) {
      return isExpanded ? (
        <FolderOpen size={14} className="text-[#2979ff]" />
      ) : (
        <Folder size={14} className="text-gray-400" />
      );
    }
    return <FileText size={14} className="text-gray-400" />;
  };

  const childrenCount = isFolder ? (node as FolderType).children?.length || 0 : 0;

  return (
    <div className="select-none">
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onContextMenu={(e) => onContextMenu(e, node)}
        tabIndex={0}
        role="button"
        aria-label={`${isFolder ? 'Pasta' : 'Prompt'}: ${node.name}`}
        aria-expanded={isFolder ? isExpanded : undefined}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        className={`
          group flex items-center justify-between py-1.5 pr-2 
          rounded-lg cursor-pointer transition-all duration-150
          ${isSelected
            ? 'bg-[#2979ff]/10 text-white'
            : 'text-gray-300 hover:bg-white/5 hover:text-white'
          }
        `}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Expand/Collapse Arrow */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className="p-0.5 hover:bg-white/10 rounded transition-colors"
            >
              <ChevronRight
                size={12}
                className={`text-gray-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Icon */}
          {renderIcon()}

          {/* Name */}
          <span className="text-xs font-medium truncate">{node.name}</span>

          {/* Count Badge */}
          {isFolder && childrenCount > 0 && (
            <span className="text-[9px] text-gray-500 bg-white/5 px-1 rounded">
              {childrenCount}
            </span>
          )}

          {/* System Badge */}
          {isFolder && (node as FolderType).isSystem && (
            <Settings size={10} className="text-gray-500" />
          )}
        </div>

        {/* Actions - Always Visible */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            className="p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Editar"
          >
            <Edit2 size={10} />
          </button>
          {!isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
              }}
              className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="Excluir"
            >
              <Trash2 size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <AnimatedTreeItem isExpanded={isExpanded}>
          {(node as FolderType).children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onContextMenu={onContextMenu}
              selectedId={selectedId}
              isLocked={isLocked}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </AnimatedTreeItem>
      )}
    </div>
  );
};

// --- MAIN SIDE PANEL ---

interface SidePanelProps {
  className?: string;
  width?: string;
  collapsible?: boolean;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  className = '',
  width = '280px',
  collapsible = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['f1']));
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: TreeNode;
  } | null>(null);

  const data = usePromptManagerStore((s) => s.data);
  const selectedFolder = usePromptManagerStore((s) => s.selectedFolder);
  const selectedPrompt = usePromptManagerStore((s) => s.selectedPrompt);
  const isLocked = usePromptManagerStore((s) => s.isLocked);
  const {
    setSelectedFolder,
    setSelectedPrompt,
    openEditModal,
    showToast,
    setIsLocked,
    goToRoot,
  } = usePromptManagerStore((s) => s.actions);

  const selectedId = selectedPrompt?.id || selectedFolder?.id || null;

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback((node: TreeNode) => {
    if (node.type === 'folder') {
      setSelectedFolder(node as FolderType);
    } else {
      setSelectedPrompt(node as Prompt);
    }
  }, [setSelectedFolder, setSelectedPrompt]);

  const handleEdit = useCallback((node: TreeNode) => {
    openEditModal(node, false);
  }, [openEditModal]);

  const handleDelete = useCallback((node: TreeNode) => {
    if (isLocked) {
      showToast('Desbloqueie para excluir', 'warning');
      return;
    }
    showToast(`Excluir "${node.name}"?`, 'warning');
  }, [isLocked, showToast]);

  const handleContextMenu = useCallback((e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  }, []);

  const handleNewFolder = () => {
    if (isLocked) {
      showToast('Desbloqueie para criar', 'warning');
      return;
    }
    showToast('Criar pasta...', 'info');
  };

  // Close context menu on click outside
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  if (isCollapsed && collapsible) {
    return (
      <div className={`w-12 bg-[#13161c] border-r border-white/5 flex flex-col items-center py-4 ${className}`}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors mb-4"
          title="Expandir"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={goToRoot}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Início"
        >
          <Home size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        style={{ width }}
        className={`flex flex-col bg-[#13161c] border-r border-white/5 ${className}`}
      >
        {/* Header */}
        <div className="p-3 border-b border-white/5 bg-[#181b24] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Home size={14} className="text-[#2979ff]" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Navegação
              </span>
            </div>
            <div className="flex items-center gap-1">
              {collapsible && (
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Recolher"
                >
                  <ChevronDown size={14} className="-rotate-90" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewFolder}
              disabled={isLocked}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#2979ff] hover:bg-[#2264d1] text-white text-[10px] font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={12} />
              Nova Pasta
            </button>
            <Tooltip content={isLocked ? 'Desbloquear' : 'Bloquear'} position="bottom">
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLocked
                    ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                    : 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                }`}
              >
                {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Tree Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
              <Folder size={32} className="opacity-30 mb-3" />
              <p className="text-xs font-medium">Nenhuma pasta</p>
              <p className="text-[10px] mt-1 opacity-60">Crie sua primeira pasta</p>
            </div>
          ) : (
            data.map((node) => (
              <TreeNodeItem
                key={node.id}
                node={node}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onContextMenu={handleContextMenu}
                selectedId={selectedId}
                isLocked={isLocked}
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 bg-[#0f111a]/50 shrink-0">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>{data.length} pastas raiz</span>
            <span className={isLocked ? 'text-red-400' : 'text-green-400'}>
              {isLocked ? 'Bloqueado' : 'Desbloqueado'}
            </span>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-[300] bg-[#1e2330] border border-white/10 rounded-lg shadow-2xl py-1 min-w-[160px] animate-context-menu"
        >
          <button
            onClick={() => {
              handleEdit(contextMenu.node);
              setContextMenu(null);
            }}
            className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
          >
            <Edit2 size={12} /> Editar
          </button>
          {contextMenu.node.type === 'folder' && (
            <button
              onClick={() => {
                showToast('Criar subpasta...', 'info');
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
            >
              <Plus size={12} /> Nova Subpasta
            </button>
          )}
          <div className="h-px bg-white/5 my-1" />
          <button
            onClick={() => {
              handleDelete(contextMenu.node);
              setContextMenu(null);
            }}
            disabled={isLocked}
            className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={12} /> Excluir
          </button>
        </div>
      )}
    </>
  );
};

export default SidePanel;
