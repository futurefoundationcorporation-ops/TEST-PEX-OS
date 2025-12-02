'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - CONTENT PANEL
// ATHENA Architecture | Prompt Preview Panel | Premium Dark Theme
// ============================================================================

import React, { useState } from 'react';
import {
  FileText,
  Copy,
  CheckCircle2,
  Edit2,
  Trash2,
  Share2,
  ExternalLink,
  Eye,
  Clock,
  Tag,
  Folder,
  X,
} from 'lucide-react';
import { Tooltip } from './TooltipWrapper';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { Prompt } from '@/types/prompt-manager';

// --- PREVIEW PANEL PROPS ---

interface ContentPanelProps {
  prompt: Prompt | null;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

// --- MAIN CONTENT PANEL ---

export const ContentPanel: React.FC<ContentPanelProps> = ({
  prompt,
  isOpen = true,
  onClose,
  className = '',
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const isLocked = usePromptManagerStore((s) => s.isLocked);
  const { openEditModal, showToast, setPromptViewerOpen, setSelectedPrompt, deleteItem } =
    usePromptManagerStore((s) => s.actions);

  if (!prompt || !isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content || '');
    setIsCopied(true);
    showToast('Conteúdo copiado!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEdit = () => {
    openEditModal(prompt, true);
  };

  const handleDelete = () => {
    if (isLocked) {
      showToast('Desbloqueie para excluir', 'warning');
      return;
    }
    // Will open delete modal
    showToast('Confirmar exclusão?', 'warning');
  };

  const handleShare = () => {
    showToast(`Compartilhando "${prompt.name}"...`, 'info');
  };

  const handleOpenFull = () => {
    setSelectedPrompt(prompt);
    setPromptViewerOpen(true);
  };

  return (
    <div
      className={`
        flex flex-col h-full bg-[#13161c] border-l border-white/5
        animate-in slide-in-from-right-4 duration-300
        ${className}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-[#181b24] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2979ff]/20 to-purple-500/20 flex items-center justify-center text-xl">
              {prompt.emoji || '📄'}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{prompt.name}</h3>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                {prompt.category && (
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                    {prompt.category}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {prompt.date}
                </span>
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Action Buttons - Always Visible */}
        <div className="flex items-center gap-2">
          <Tooltip content="Abrir Completo" position="bottom">
            <button
              onClick={handleOpenFull}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2979ff] hover:bg-[#2264d1] text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20"
            >
              <Eye size={12} />
              Visualizar
            </button>
          </Tooltip>

          <Tooltip content="Editar" position="bottom">
            <button
              onClick={handleEdit}
              disabled={isLocked}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit2 size={14} />
            </button>
          </Tooltip>

          <Tooltip content="Copiar" position="bottom">
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-lg transition-colors ${
                isCopied
                  ? 'text-green-400 bg-green-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            </button>
          </Tooltip>

          <Tooltip content="Compartilhar" position="bottom">
            <button
              onClick={handleShare}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Share2 size={14} />
            </button>
          </Tooltip>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <Tooltip content="Excluir" position="bottom">
            <button
              onClick={handleDelete}
              disabled={isLocked}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Tags Section */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="px-4 py-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={12} className="text-gray-400" />
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
              Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-[#2979ff]/10 text-[#2979ff] border border-[#2979ff]/20 hover:bg-[#2979ff]/20 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content Preview */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="mb-3">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
            Conteúdo
          </span>
        </div>
        <div className="bg-[#0f111a] border border-white/5 rounded-lg p-4 shadow-inner">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {prompt.content || 'Sem conteúdo'}
          </pre>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white/5 bg-[#0f111a]/50 shrink-0">
        <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-400">
          <div className="flex items-center gap-2">
            <FileText size={12} />
            <span>{prompt.content?.length || 0} caracteres</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} />
            <span>Atualizado: {prompt.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- INLINE PREVIEW (For Miller Columns) ---

interface InlinePreviewProps {
  prompt: Prompt | null;
  className?: string;
}

export const InlinePreview: React.FC<InlinePreviewProps> = ({
  prompt,
  className = '',
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { openEditModal, showToast, setPromptViewerOpen, setSelectedPrompt } =
    usePromptManagerStore((s) => s.actions);

  if (!prompt) {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-gray-500/50 p-6 ${className}`}>
        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-4">
          <Eye size={28} className="opacity-40" />
        </div>
        <p className="text-sm font-medium text-gray-400">Nenhum prompt selecionado</p>
        <p className="text-xs mt-1 text-gray-500 text-center max-w-[200px]">
          Clique em um prompt para ver o preview
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content || '');
    setIsCopied(true);
    showToast('Copiado!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenFull = () => {
    setSelectedPrompt(prompt);
    setPromptViewerOpen(true);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2979ff]/20 to-purple-500/20 flex items-center justify-center text-2xl shadow-lg">
            {prompt.emoji || '📄'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white truncate">{prompt.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                {prompt.category || 'Geral'}
              </span>
              <span>•</span>
              <span>{prompt.date}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons - Always Visible */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenFull}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2979ff] hover:bg-[#2264d1] text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20"
          >
            <ExternalLink size={14} />
            Abrir Completo
          </button>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              isCopied
                ? 'bg-green-500 text-white'
                : 'bg-[#1e2330] hover:bg-white/10 text-gray-300 border border-white/10'
            }`}
          >
            {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            {isCopied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="bg-[#0f111a] border border-white/5 rounded-lg p-4 shadow-inner min-h-[200px]">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {prompt.content || 'Sem conteúdo'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ContentPanel;
