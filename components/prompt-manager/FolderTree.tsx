'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - FOLDER TREE (HIERARCHY VIEW)
// ATHENA Architecture | Tree Navigation | Premium Dark Theme
// ============================================================================

import React, { useState } from 'react';
import {
  Folder,
  FileText,
  ChevronRight,
  Settings,
  Edit2,
  Network,
  Maximize2,
  Filter,
} from 'lucide-react';
import { AnimatedTreeItem } from './MotionWrappers';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { TreeNode, Folder as FolderType, Prompt } from '@/types/prompt-manager';

// --- TREE VIEW NODE COMPONENT ---

interface TreeViewNodeProps {
  node: TreeNode;
  level?: number;
  onSelect: (prompt: Prompt) => void;
  onEdit: (node: TreeNode) => void;
  isLocked: boolean;
  selectedPromptId?: string;
}

const TreeViewNode: React.FC<TreeViewNodeProps> = ({
  node,
  level = 0,
  onSelect,
  onEdit,
  isLocked,
  selectedPromptId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isFolder = node.type === 'folder';
  const hasChildren = isFolder && (node as FolderType).children?.length > 0;
  const isNodeSelected = node.type === 'prompt' && selectedPromptId === node.id;

  const renderIcon = () => {
    if (node.emoji) {
      return <span className="text-base leading-none w-4 text-center shrink-0">{node.emoji}</span>;
    }
    if (isFolder) {
      if ((node as FolderType).isSystem) {
        return <Settings size={16} className="text-gray-300 shrink-0" />;
      }
      return (
        <Folder
          size={16}
          className={`${isExpanded ? 'text-indigo-600' : 'text-gray-400'} shrink-0`}
        />
      );
    }
    return <FileText size={14} className="text-gray-400 shrink-0" />;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(node as Prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as unknown as React.MouseEvent);
    }
    if (e.key === 'ArrowRight' && isFolder && !isExpanded) {
      setIsExpanded(true);
    }
    if (e.key === 'ArrowLeft' && isFolder && isExpanded) {
      setIsExpanded(false);
    }
  };

  const indentStyle = { paddingLeft: `${level * 24}px` };

  return (
    <div className="flex flex-col">
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${isFolder ? 'Pasta' : 'Prompt'}: ${node.name}`}
        aria-expanded={isFolder ? isExpanded : undefined}
        className={`
          group flex items-center justify-between transition-all duration-150 
          cursor-pointer text-gray-300 border-l-[3px] my-0.5 rounded-r-md
          ${isNodeSelected
            ? 'bg-gradient-to-r from-[#2979ff]/10 to-transparent border-l-[#2979ff] text-white'
            : 'border-l-transparent hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent hover:border-l-white/20'
          }
        `}
        style={indentStyle}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 py-2 h-8">
          {hasChildren ? (
            <ChevronRight
              size={14}
              className={`
                shrink-0 text-gray-400 transition-transform duration-200 
                ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isExpanded ? 'rotate-90' : 'rotate-0'}
              `}
            />
          ) : (
            <div className="w-3" />
          )}
          
          {renderIcon()}
          
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`
                truncate
                ${isFolder 
                  ? 'font-medium text-sm' 
                  : 'text-[13px] font-normal text-gray-300 group-hover:text-gray-200'}
              `}
            >
              {node.name}
            </span>
            
            {!isFolder && (node as Prompt).tags && (
              <div className="flex items-center gap-1.5 opacity-50 transition-opacity group-hover:opacity-100">
                {(node as Prompt).tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase tracking-[0.5px] text-gray-400 border border-white/10 px-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(node);
          }}
          className="p-1 mr-2 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors"
          title={`Editar ${node.name}`}
        >
          <Edit2 size={12} />
        </button>
      </div>

      {/* Children */}
      {hasChildren && (
        <AnimatedTreeItem isExpanded={isExpanded}>
          {(node as FolderType).children.map((child) => (
            <TreeViewNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onEdit={onEdit}
              isLocked={isLocked}
              selectedPromptId={selectedPromptId}
            />
          ))}
        </AnimatedTreeItem>
      )}
    </div>
  );
};

// --- MAIN FOLDER TREE VIEW ---

export const FolderTree: React.FC = () => {
  const data = usePromptManagerStore((s) => s.data);
  const selectedPrompt = usePromptManagerStore((s) => s.selectedPrompt);
  const isLocked = usePromptManagerStore((s) => s.isLocked);
  const {
    setSelectedPrompt,
    setPromptViewerOpen,
    openEditModal,
  } = usePromptManagerStore((s) => s.actions);

  const handleSelect = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setPromptViewerOpen(true);
  };

  const handleEdit = (node: TreeNode) => {
    openEditModal(node, false);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Network size={24} className="text-[#2979ff]" />
            Estrutura Hierárquica
          </h2>
          <div className="flex gap-2">
            <button className="p-2 bg-[#1e2330] hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
              <Maximize2 size={16} />
            </button>
            <button className="p-2 bg-[#1e2330] hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Tree Container */}
        <div className="bg-[#1e2330] rounded-xl border border-white/10 p-6 shadow-2xl min-h-[500px]">
          {data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Folder size={32} className="opacity-40" />
              </div>
              <p className="text-sm font-bold text-gray-300">Nenhum conteúdo</p>
              <p className="text-xs mt-1 text-gray-500">Comece criando uma pasta</p>
            </div>
          ) : (
            data.map((node) => (
              <TreeViewNode
                key={node.id}
                node={node}
                onSelect={handleSelect}
                onEdit={handleEdit}
                isLocked={isLocked}
                selectedPromptId={selectedPrompt?.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderTree;
