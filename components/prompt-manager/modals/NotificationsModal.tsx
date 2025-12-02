'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - NOTIFICATIONS MODAL
// ATHENA Architecture | Premium Dark Theme
// ============================================================================

import React from 'react';
import {
  X,
  Bell,
  Share2,
  ArrowDownToLine,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Overlay, ModalAnimation } from '../MotionWrappers';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { Notification } from '@/types/prompt-manager';

// --- NOTIFICATION ITEM ---

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'transfer':
        return <ArrowDownToLine size={16} className="text-emerald-400" />;
      case 'share':
        return <Share2 size={16} className="text-[#5b4eff]" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-400" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'transfer':
        return 'border-l-emerald-500';
      case 'share':
        return 'border-l-[#5b4eff]';
      case 'warning':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 border-l-4 ${getTypeColor()} rounded-r-lg cursor-pointer
        transition-all hover:bg-white/5
        ${notification.read ? 'opacity-60' : 'bg-white/[0.02]'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-sm font-bold truncate ${notification.read ? 'text-gray-400' : 'text-white'}`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-[#2979ff] shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {notification.description}
          </p>
          <span className="text-[10px] text-gray-500 mt-2 block">
            {notification.time}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- NOTIFICATIONS MODAL ---

export const NotificationsModal: React.FC = () => {
  const isOpen = usePromptManagerStore((s) => s.isNotificationsOpen);
  const notifications = usePromptManagerStore((s) => s.notifications);
  const { 
    setNotificationsOpen, 
    markNotificationRead, 
    markAllNotificationsRead,
    openEditModal,
  } = usePromptManagerStore((s) => s.actions);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    markNotificationRead(notification.id);

    if (notification.type === 'transfer' && notification.payload) {
      setNotificationsOpen(false);
      openEditModal(notification.payload, false, true);
    }
  };

  return (
    <Overlay onClick={() => setNotificationsOpen(false)}>
      <ModalAnimation>
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell size={18} className="text-[#2979ff]" />
                Notificações
              </h2>
              {unreadCount > 0 && (
                <span className="bg-[#2979ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} novas
                </span>
              )}
            </div>
            <button
              onClick={() => setNotificationsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-gray-500 opacity-40" />
                </div>
                <p className="text-sm font-medium text-gray-400">Tudo em dia!</p>
                <p className="text-xs text-gray-500 mt-1">Nenhuma notificação pendente</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-white/5 flex justify-end">
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-medium text-[#2979ff] hover:text-blue-400 transition-colors"
              >
                Marcar todas como lidas
              </button>
            </div>
          )}
        </div>
      </ModalAnimation>
    </Overlay>
  );
};

export default NotificationsModal;
