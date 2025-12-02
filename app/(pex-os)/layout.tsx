'use client';

// ============================================================================
// PEX-OS LAYOUT
// ATHENA Architecture | Main Application Shell
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  FolderOpen,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  Zap,
  Terminal,
  MessageSquare,
  Database,
  Users,
  BarChart3,
  BookOpen,
} from 'lucide-react';

// --- SIDEBAR NAVIGATION CONFIG ---

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Dashboard', icon: Home, href: '/dashboard' },
  { id: 'prompts', label: 'Prompt Manager', icon: FileText, href: '/prompts', badge: 'NEW' },
  { id: 'templates', label: 'Templates', icon: BookOpen, href: '/templates' },
  { id: 'chat', label: 'Chat AI', icon: MessageSquare, href: '/chat' },
  { id: 'terminal', label: 'Terminal', icon: Terminal, href: '/terminal' },
  { id: 'data', label: 'Data Manager', icon: Database, href: '/data' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'team', label: 'Team', icon: Users, href: '/team' },
  { id: 'settings', label: 'Configurações', icon: Settings, href: '/settings' },
];

// --- SIDEBAR COMPONENT ---

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const pathname = usePathname();

  return (
    <aside
      className={`
        flex flex-col h-full bg-[#13161c] border-r border-white/5
        transition-all duration-300 shrink-0
        ${isCollapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo Section */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2979ff] to-[#5b4eff] rounded-lg flex items-center justify-center shadow-lg">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">PEX-OS</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 mx-auto bg-gradient-to-br from-[#2979ff] to-[#5b4eff] rounded-lg flex items-center justify-center shadow-lg">
            <Zap size={16} className="text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-[#2979ff]/10 text-white border-l-2 border-[#2979ff] ml-[-2px]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon
                  size={18}
                  className={`shrink-0 ${isActive ? 'text-[#2979ff]' : ''}`}
                />
                
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[9px] font-bold bg-[#2979ff] text-white px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-[#1e2330] text-white text-xs font-medium rounded shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 text-[9px] font-bold bg-[#2979ff] px-1 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-white/5 shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span className="text-xs font-medium">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

// --- MAIN LAYOUT ---

interface LayoutProps {
  children: React.ReactNode;
}

export default function PexOSLayout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#0f111a] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
