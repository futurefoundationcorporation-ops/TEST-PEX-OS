'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - EMOJI PICKER
// ATHENA Architecture | Premium Dark Theme
// ============================================================================

import React from 'react';

// --- EMOJI CATEGORIES (Curated for Productivity) ---

export const EMOJI_CATEGORIES: Record<string, string[]> = {
  'Essenciais': ['📁', '📂', '🗂️', '🗃️', '📄', '📝', '📑', '📊'],
  'Tech & Dev': ['💻', '🖥️', '⌨️', '💾', '🤖', '⚙️', '🔧', '🐛'],
  'Status': ['🚀', '🎯', '🔥', '💡', '✅', '🚧', '🔒', '🚩'],
  'Design': ['🎨', '🖌️', '✒️', '🎭', '🌈', '💎', '📸', '🔍'],
  'Social': ['👋', '👥', '🗣️', '💬', '❤️', '⭐', '🎉', '🤝'],
  'Negócios': ['💼', '📈', '📉', '💰', '🏆', '📣', '🎪', '🛡️'],
  'Tempo': ['⏰', '📅', '🗓️', '⏳', '🌅', '🌙', '☀️', '🌟'],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  selectedEmoji?: string;
  className?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelect,
  selectedEmoji,
  className = '',
}) => {
  return (
    <div
      className={`
        bg-[#13161c] border border-white/5 rounded-lg p-3 
        max-h-48 overflow-y-auto shadow-xl custom-scrollbar
        ${className}
      `}
    >
      {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
        <div key={category} className="mb-3 last:mb-0">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-[#13161c] py-1 z-10">
            {category}
          </h4>
          <div className="grid grid-cols-8 gap-1">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSelect(emoji)}
                className={`
                  w-8 h-8 flex items-center justify-center rounded text-lg 
                  hover:bg-white/10 transition-colors
                  ${selectedEmoji === emoji 
                    ? 'bg-[#2979ff]/20 ring-1 ring-[#2979ff]' 
                    : ''}
                `}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- INLINE EMOJI BUTTON (For Forms) ---

interface EmojiButtonProps {
  emoji: string;
  onOpenPicker: () => void;
  className?: string;
}

export const EmojiButton: React.FC<EmojiButtonProps> = ({
  emoji,
  onOpenPicker,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onOpenPicker}
      className={`
        w-14 h-14 bg-[#0f111a] border border-white/10 rounded-xl 
        text-2xl flex items-center justify-center 
        hover:border-[#2979ff] hover:bg-[#2979ff]/5 
        transition-all relative group
        ${className}
      `}
    >
      {emoji}
      <div className="absolute -bottom-1.5 -right-1.5 bg-[#2979ff] text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </div>
    </button>
  );
};

export default EmojiPicker;
