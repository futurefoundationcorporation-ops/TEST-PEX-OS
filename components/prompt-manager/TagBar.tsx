'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - TAG BAR
// ATHENA Architecture | Tag Filtering Component | Premium Dark Theme
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Tag,
  X,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { TreeNode, Prompt } from '@/types/prompt-manager';

// --- HELPER FUNCTIONS ---

const extractAllTags = (nodes: TreeNode[]): string[] => {
  const tags = new Set<string>();

  const traverse = (items: TreeNode[]) => {
    for (const item of items) {
      if (item.type === 'prompt' && (item as Prompt).tags) {
        (item as Prompt).tags?.forEach((tag) => tags.add(tag));
      }
      if (item.type === 'folder' && (item as any).children) {
        traverse((item as any).children);
      }
    }
  };

  traverse(nodes);
  return Array.from(tags).sort();
};

// --- TAG CHIP COMPONENT ---

interface TagChipProps {
  tag: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

const TagChip: React.FC<TagChipProps> = ({ tag, isActive, onClick, count }) => {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold
        tracking-wider transition-all duration-150 border
        ${isActive
          ? 'bg-[#2979ff]/20 text-[#2979ff] border-[#2979ff]/30 shadow-sm shadow-blue-900/20'
          : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20'}
      `}
    >
      <Tag size={10} />
      <span>{tag}</span>
      {count !== undefined && (
        <span className={`
          px-1 py-0.5 rounded text-[8px] font-bold
          ${isActive ? 'bg-[#2979ff]/30' : 'bg-white/10'}
        `}>
          {count}
        </span>
      )}
      {isActive && (
        <X
          size={10}
          className="hover:text-white transition-colors"
        />
      )}
    </button>
  );
};

// --- MAIN TAG BAR COMPONENT ---

interface TagBarProps {
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'compact';
  maxVisible?: number;
  showCounts?: boolean;
  onFilterChange?: (tags: string[]) => void;
}

export const TagBar: React.FC<TagBarProps> = ({
  className = '',
  variant = 'horizontal',
  maxVisible = 10,
  showCounts = false,
  onFilterChange,
}) => {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const data = usePromptManagerStore((s) => s.data);

  // Extract all tags from data
  const allTags = useMemo(() => extractAllTags(data), [data]);

  // Count occurrences of each tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    const traverse = (items: TreeNode[]) => {
      for (const item of items) {
        if (item.type === 'prompt' && (item as Prompt).tags) {
          (item as Prompt).tags?.forEach((tag) => {
            counts[tag] = (counts[tag] || 0) + 1;
          });
        }
        if (item.type === 'folder' && (item as any).children) {
          traverse((item as any).children);
        }
      }
    };
    
    traverse(data);
    return counts;
  }, [data]);

  // Filter tags by search query
  const filteredTags = useMemo(() => {
    if (!searchQuery) return allTags;
    return allTags.filter((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allTags, searchQuery]);

  // Visible tags based on expansion state
  const visibleTags = isExpanded
    ? filteredTags
    : filteredTags.slice(0, maxVisible);

  const hasMore = filteredTags.length > maxVisible;

  // Handle tag toggle
  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      onFilterChange?.(Array.from(next));
      return next;
    });
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedTags(new Set());
    onFilterChange?.([]);
  };

  if (allTags.length === 0) {
    return null;
  }

  // --- Compact Variant ---
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Filter size={14} className="text-gray-400" />
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {visibleTags.slice(0, 5).map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              isActive={selectedTags.has(tag)}
              onClick={() => handleToggleTag(tag)}
            />
          ))}
          {allTags.length > 5 && (
            <span className="text-[10px] text-gray-500 whitespace-nowrap">
              +{allTags.length - 5}
            </span>
          )}
        </div>
        {selectedTags.size > 0 && (
          <button
            onClick={handleClearAll}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Limpar filtros"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  // --- Vertical Variant ---
  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-[#2979ff]" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Filtrar por Tags
            </span>
          </div>
          {selectedTags.size > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[10px] text-gray-400 hover:text-white transition-colors"
            >
              Limpar ({selectedTags.size})
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tags..."
            className="w-full h-8 bg-[#0f111a] border border-white/10 rounded-lg pl-8 pr-3 text-[10px] text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all placeholder-gray-600"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              isActive={selectedTags.has(tag)}
              onClick={() => handleToggleTag(tag)}
              count={showCounts ? tagCounts[tag] : undefined}
            />
          ))}
        </div>

        {/* Expand/Collapse */}
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={12} />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                Ver mais {filteredTags.length - maxVisible} tags
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  // --- Horizontal Variant (Default) ---
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Filter size={14} className="text-gray-400" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Tags
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-white/10" />

      {/* Tags Container */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 flex-1">
        {visibleTags.map((tag) => (
          <TagChip
            key={tag}
            tag={tag}
            isActive={selectedTags.has(tag)}
            onClick={() => handleToggleTag(tag)}
            count={showCounts ? tagCounts[tag] : undefined}
          />
        ))}

        {hasMore && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-[10px] text-gray-400 hover:text-white whitespace-nowrap transition-colors"
          >
            +{filteredTags.length - maxVisible}
          </button>
        )}
      </div>

      {/* Clear Button */}
      {selectedTags.size > 0 && (
        <button
          onClick={handleClearAll}
          className="shrink-0 flex items-center gap-1 px-2 py-1 text-[10px] text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={10} />
          Limpar
        </button>
      )}
    </div>
  );
};

// --- TAG FILTER DROPDOWN ---

interface TagFilterDropdownProps {
  className?: string;
  onFilterChange?: (tags: string[]) => void;
}

export const TagFilterDropdown: React.FC<TagFilterDropdownProps> = ({
  className = '',
  onFilterChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const data = usePromptManagerStore((s) => s.data);
  const allTags = useMemo(() => extractAllTags(data), [data]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      onFilterChange?.(Array.from(next));
      return next;
    });
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
          transition-all border
          ${selectedTags.size > 0
            ? 'bg-[#2979ff]/10 text-[#2979ff] border-[#2979ff]/30'
            : 'bg-[#1e2330] text-gray-300 border-white/10 hover:border-white/20'}
        `}
      >
        <Filter size={14} />
        <span>Filtrar</span>
        {selectedTags.size > 0 && (
          <span className="bg-[#2979ff] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {selectedTags.size}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full mt-2 right-0 z-50 w-64 bg-[#1e2330] border border-white/10 rounded-xl shadow-2xl p-3 animate-context-menu">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Filtrar por Tags
              </span>
              {selectedTags.size > 0 && (
                <button
                  onClick={() => {
                    setSelectedTags(new Set());
                    onFilterChange?.([]);
                  }}
                  className="text-[10px] text-gray-400 hover:text-white transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {allTags.map((tag) => (
                <TagChip
                  key={tag}
                  tag={tag}
                  isActive={selectedTags.has(tag)}
                  onClick={() => handleToggleTag(tag)}
                />
              ))}
            </div>

            {allTags.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">
                Nenhuma tag encontrada
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TagBar;
