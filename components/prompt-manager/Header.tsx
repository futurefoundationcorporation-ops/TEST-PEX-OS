'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - HEADER COMPONENT
// ATHENA Architecture | Premium Dark Theme | All Actions Visible
// ============================================================================

import React from 'react';
import {
  Search,
  Bell,
  History,
  Settings,
  List,
  Columns,
  Network,
  Users,
  Lock,
  Unlock,
  Plus,
  Download,
  Upload,
  LogOut,
  Key,
  Layers,
} from 'lucide-react';
import { Tooltip, ShortcutTooltip } from './TooltipWrapper';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { ViewType } from '@/types/prompt-manager';

// --- VIEW CONFIG ---

const VIEWS: { id: ViewType; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'sequential', label: 'Sequencial', icon: List },
  { id: 'miller', label: 'Colunas', icon: Columns },
  { id: 'mindmap', label: 'Hierarquia', icon: Network },
];

// --- PROFILE DROPDOWN ---

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const currentUser = usePromptManagerStore((s) => s.currentUser);
  const notifications = usePromptManagerStore((s) => s.notifications);
  const { setSettingsOpen, setNotificationsOpen, setMasterLoginOpen, logout } = 
    usePromptManagerStore((s) => s.actions);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isMaster = currentUser.role === 'master' && currentUser.keyId;

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(currentUser.name);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group w-8 h-8 ml-2 relative outline-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2979ff] rounded-full"
        title="Meu Perfil"
      >
        <div
          className={`
            w-full h-full rounded-full bg-gradient-to-br from-[#2a3040] to-[#1e2330] 
            flex items-center justify-center text-[10px] font-bold tracking-wide 
            border transition-all shadow-inner text-indigo-400 overflow-hidden
            ${isOpen 
              ? 'border-[#2979ff] ring-2 ring-[#2979ff]/20' 
              : 'border-white/10 group-hover:border-white/30'}
          `}
        >
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-[#0f111a] rounded-full z-10" />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-3 w-60 bg-[#1e2330] border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden ring-1 ring-white/5 origin-top-right animate-pop-in-menu"
        >
          {/* User Info */}
          <div className="p-4 border-b border-white/5 bg-[#252b3b]/50">
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs 
                  shadow-lg overflow-hidden shrink-0
                  ${currentUser.role === 'master' 
                    ? 'bg-gradient-to-br from-red-600 to-orange-600' 
                    : 'bg-gradient-to-br from-indigo-500 to-blue-600'}
                `}
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4>
                <span
                  className={`
                    text-[10px] px-1.5 py-0.5 rounded-full inline-block mt-0.5
                    ${currentUser.role === 'master' 
                      ? 'bg-red-500/20 text-red-300' 
                      : 'bg-blue-500/20 text-blue-300'}
                  `}
                >
                  {currentUser.role === 'master' ? 'Master Admin' : 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1 space-y-0.5">
            {/* Master Access Button */}
            {isMaster && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setMasterLoginOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg flex items-center gap-3 transition-all mb-1"
              >
                <Key size={14} className="shrink-0" /> Master Access
              </button>
            )}

            <button
              onClick={() => {
                setNotificationsOpen(true);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-lg flex items-center gap-3 transition-colors"
            >
              <Bell size={14} className="shrink-0 text-gray-400" />
              <span className="flex-1">Notificações</span>
              {unreadCount > 0 && (
                <span className="flex items-center justify-center bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSettingsOpen(true);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-lg flex items-center gap-3 transition-colors"
            >
              <Settings size={14} className="shrink-0 text-gray-400" /> Configurações
            </button>
          </div>

          {/* Logout */}
          <div className="p-1 border-t border-white/5 mt-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-lg flex items-center gap-3 transition-colors"
            >
              <LogOut size={14} className="shrink-0" />
              {currentUser.role === 'master' ? 'Sair da Conta' : 'Sair da Sessão'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN HEADER COMPONENT ---

export const Header: React.FC = () => {
  const activeView = usePromptManagerStore((s) => s.activeView);
  const isLocked = usePromptManagerStore((s) => s.isLocked);
  const searchQuery = usePromptManagerStore((s) => s.searchQuery);
  const notifications = usePromptManagerStore((s) => s.notifications);
  const {
    setActiveView,
    setSearchQuery,
    setIsLocked,
    setNotificationsOpen,
    setHistoryOpen,
  } = usePromptManagerStore((s) => s.actions);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 bg-[#1e2330] border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-20 relative">
      {/* Left Section: Logo + Search */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-br from-[#2979ff] to-[#1e2330] rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Layers size={18} className="text-white" />
          </div>
          <span className="hidden sm:inline">Prompt Manager</span>
        </div>

        {/* Search Bar */}
        <div className="relative group hidden md:block">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#2979ff] transition-colors"
          />
          <input
            id="search-input"
            type="text"
            placeholder="Buscar (Ctrl+F)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-64 bg-[#0f111a] border border-white/10 rounded-lg pl-9 pr-3 text-xs text-gray-300 focus:outline-none focus:border-[#2979ff] focus:w-80 transition-all placeholder-gray-600"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
            <span className="text-[10px] font-mono text-gray-600 border border-white/5 px-1 rounded bg-white/5">
              Ctrl
            </span>
            <span className="text-[10px] font-mono text-gray-600 border border-white/5 px-1 rounded bg-white/5">
              F
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-[#0f111a] p-1 rounded-lg border border-white/5 mr-2">
          {VIEWS.map((view) => (
            <Tooltip key={view.id} content={view.label} position="bottom">
              <button
                onClick={() => setActiveView(view.id)}
                className={`
                  p-1.5 rounded transition-all relative
                  ${activeView === view.id 
                    ? 'bg-[#2979ff] text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <view.icon size={16} />
              </button>
            </Tooltip>
          ))}
          <Tooltip content="Compartilhados" position="bottom">
            <button
              onClick={() => setActiveView('shared')}
              className={`
                p-1.5 rounded transition-all relative
                ${activeView === 'shared' 
                  ? 'bg-[#5b4eff] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <Users size={16} />
            </button>
          </Tooltip>
        </div>

        {/* Lock Toggle */}
        <ShortcutTooltip
          label={isLocked ? 'Desbloquear Edição' : 'Bloquear Edição'}
          shortcut="Ctrl+L"
          position="bottom"
        >
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`
              p-2 rounded-lg transition-all
              ${isLocked 
                ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20' 
                : 'text-green-400 bg-green-500/10 hover:bg-green-500/20'}
            `}
          >
            {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
          </button>
        </ShortcutTooltip>

        {/* Notifications */}
        <Tooltip content="Notificações" position="bottom">
          <button
            onClick={() => setNotificationsOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1e2330]" />
            )}
          </button>
        </Tooltip>

        {/* History */}
        <Tooltip content="Histórico" position="bottom">
          <button
            onClick={() => setHistoryOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <History size={18} />
          </button>
        </Tooltip>

        <div className="h-6 w-px bg-white/10 mx-1" />

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
