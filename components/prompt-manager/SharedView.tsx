'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - SHARED VIEW
// ATHENA Architecture | Premium Dark Theme
// ============================================================================

import React from 'react';
import { Users, Share2 } from 'lucide-react';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { SharedItem } from '@/types/prompt-manager';

// --- SHARED ITEM CARD ---

interface SharedItemCardProps {
  item: SharedItem;
  index: number;
}

const SharedItemCard: React.FC<SharedItemCardProps> = ({ item, index }) => {
  const { showToast } = usePromptManagerStore((s) => s.actions);

  return (
    <div
      className="bg-[#1e2330] border border-white/5 hover:border-[#5b4eff]/50 rounded-xl p-5 transition-all hover:shadow-xl group animate-slide-up-fade"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Owner Info */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`
              w-10 h-10 rounded-full ${item.owner.color} 
              flex items-center justify-center text-white font-bold text-xs 
              shadow-lg ring-2 ring-[#0f111a]
            `}
          >
            {item.owner.initials}
          </div>
          <div>
            <p className="text-xs text-gray-400">
              De: <span className="text-white font-medium">{item.owner.name}</span>
            </p>
            <p className="text-[10px] text-gray-500">{item.date}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase bg-[#5b4eff]/10 text-[#5b4eff] px-2 py-1 rounded border border-[#5b4eff]/20">
          {item.permission}
        </span>
      </div>

      {/* Item Info */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{item.emoji}</span>
        <h3 className="text-white font-bold text-lg truncate">{item.name}</h3>
      </div>

      {/* Content Preview (for prompts) */}
      {item.type === 'prompt' && item.content && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-4 bg-[#0f111a] p-2 rounded border border-white/5 font-mono">
          {item.content}
        </p>
      )}

      {/* Folder Item Count */}
      {item.type === 'folder' && item.itemsCount && (
        <p className="text-xs text-gray-400 mb-4">
          {item.itemsCount} itens compartilhados
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
        <button
          onClick={() => showToast(`Abrindo "${item.name}"...`, 'info')}
          className="flex-1 py-2 bg-[#5b4eff] hover:bg-[#4a3ecc] text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
        >
          Abrir
        </button>
        <button
          onClick={() => showToast('Compartilhando...', 'info')}
          className="px-3 py-2 bg-[#1e2330] hover:bg-white/5 text-gray-300 rounded-lg border border-white/10 transition-colors"
        >
          <Share2 size={14} />
        </button>
      </div>
    </div>
  );
};

// --- MAIN SHARED VIEW ---

export const SharedView: React.FC = () => {
  const sharedData = usePromptManagerStore((s) => s.sharedData);

  // Mock shared data if empty
  const mockSharedData: SharedItem[] = sharedData.length > 0 ? sharedData : [
    {
      id: 's1',
      name: 'Design Assets Q3',
      type: 'folder',
      emoji: '🎨',
      owner: { name: 'Ana Silva', initials: 'AS', color: 'bg-purple-500' },
      permission: 'view',
      date: '2h atrás',
      itemsCount: 15,
      isShared: true,
    },
    {
      id: 's2',
      name: 'Relatório Financeiro',
      type: 'prompt',
      emoji: '📊',
      owner: { name: 'Carlos Mendes', initials: 'CM', color: 'bg-emerald-500' },
      permission: 'view',
      date: 'Ontem',
      content: 'Análise completa do Q3 com projeções para o próximo trimestre...',
      isShared: true,
    },
    {
      id: 's3',
      name: 'Prompts de Marketing',
      type: 'folder',
      emoji: '🚀',
      owner: { name: 'Maria Costa', initials: 'MC', color: 'bg-pink-500' },
      permission: 'edit',
      date: 'Há 3 dias',
      itemsCount: 8,
      isShared: true,
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users size={28} className="text-[#5b4eff]" />
            Compartilhados Comigo
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Arquivos recebidos da equipe.
          </p>
        </div>
      </div>

      {/* Content Grid */}
      {mockSharedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02]">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Users size={32} className="opacity-40" />
          </div>
          <p className="text-sm font-bold text-gray-300">Nenhum arquivo compartilhado</p>
          <p className="text-xs mt-1 text-gray-500">Peça aos colegas para compartilhar com você</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockSharedData.map((item, index) => (
            <SharedItemCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedView;
