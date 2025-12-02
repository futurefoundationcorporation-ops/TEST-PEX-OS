'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - MASTER KEY GENERATOR MODAL
// ATHENA Architecture | Premium Dark Theme | Access Control
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Key,
  Plus,
  Users,
  Copy,
  Trash2,
  RotateCcw,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { Overlay, ModalAnimation } from '../MotionWrappers';
import { usePromptManagerStore } from '@/stores/promptManager';

// --- MASTER KEY MODAL ---

export const MasterKeyModal: React.FC = () => {
  const isOpen = usePromptManagerStore((s) => s.isMasterLoginOpen);
  const generatedKeys = usePromptManagerStore((s) => s.generatedKeys);
  const masterKey = usePromptManagerStore((s) => s.masterKey);
  const currentUser = usePromptManagerStore((s) => s.currentUser);
  const {
    setMasterLoginOpen,
    generateKey,
    revokeKey,
    login,
    logout,
    showToast,
  } = usePromptManagerStore((s) => s.actions);

  const [activeTab, setActiveTab] = useState<'generator' | 'session' | 'login'>('generator');
  const [userName, setUserName] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginKey, setLoginKey] = useState('');
  const [error, setError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUserName('');
      setLoginName('');
      setLoginKey('');
      setError('');
      setActiveTab('generator');
    }
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMasterLoginOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setMasterLoginOpen]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!userName.trim()) {
      setError('Nome de Usuário é obrigatório');
      return;
    }
    generateKey(userName.trim());
    setUserName('');
    setError('');
    setActiveTab('session');
  };

  const handleUserLogin = () => {
    if (!loginName.trim() || !loginKey.trim()) {
      setError('Nome e Chave são obrigatórios');
      return;
    }

    // Check master key
    if (loginKey.trim() === masterKey) {
      logout(); // Resets to master admin
      setMasterLoginOpen(false);
      return;
    }

    // Try regular login
    const success = login(loginName.trim(), loginKey.trim());
    if (!success) {
      setError('Chave ou Nome inválidos/revogados');
      return;
    }

    setMasterLoginOpen(false);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast('Chave copiada!', 'info');
  };

  const tabClass = (tab: string) => `
    px-4 py-2 text-sm font-medium transition-all
    ${activeTab === tab 
      ? 'text-red-400 border-b-2 border-red-500' 
      : 'text-gray-400 hover:text-gray-300'}
  `;

  return (
    <Overlay onClick={() => setMasterLoginOpen(false)}>
      <ModalAnimation>
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 shrink-0">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Key size={20} className="text-red-400" />
              Master Access Panel
            </h3>
            <button
              onClick={() => setMasterLoginOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 px-6 shrink-0">
            <button onClick={() => setActiveTab('generator')} className={tabClass('generator')}>
              Gerar Chaves
            </button>
            <button onClick={() => setActiveTab('session')} className={tabClass('session')}>
              Sessões & Revogação
            </button>
            <button onClick={() => setActiveTab('login')} className={tabClass('login')}>
              Sessão de Auditoria
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {/* Generator Tab */}
            {activeTab === 'generator' && (
              <div className="space-y-6">
                <div className="p-4 bg-[#252b3b]/50 rounded-lg border border-white/10 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus size={16} /> Gerar Nova Chave de Acesso
                  </h4>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">
                      Nome do Novo Usuário
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        setError('');
                      }}
                      placeholder="Ex: Carlos"
                      className="w-full h-10 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-sm text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all placeholder-gray-600"
                    />
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={!userName.trim()}
                    className="w-full px-6 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Key size={16} /> Gerar Chave Única
                  </button>
                </div>

                <div className="p-4 bg-[#252b3b]/50 rounded-lg border border-white/10">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users size={16} /> Chaves Ativas
                  </h4>
                  <div className="mt-4">
                    {generatedKeys.filter((k) => k.active && k.key !== masterKey).length === 0 ? (
                      <p className="text-xs text-gray-400">Nenhuma chave de usuário ativa.</p>
                    ) : (
                      <div className="space-y-3">
                        {generatedKeys
                          .filter((k) => k.active && k.key !== masterKey)
                          .map((keyItem) => (
                            <div
                              key={keyItem.id}
                              className="p-3 bg-[#0f111a] rounded-lg border border-white/5 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white truncate">
                                  {keyItem.userName}
                                </p>
                                <p className="text-[10px] font-mono text-gray-300 mt-1 flex items-center gap-2">
                                  {keyItem.key}
                                  <button
                                    onClick={() => handleCopyKey(keyItem.key)}
                                    className="text-gray-400 hover:text-[#2979ff] transition-colors"
                                    title="Copiar chave"
                                  >
                                    <Copy size={10} />
                                  </button>
                                </p>
                              </div>
                              <button
                                onClick={() => revokeKey(keyItem.id)}
                                className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors shrink-0"
                                title="Revogar Chave"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Session Tab */}
            {activeTab === 'session' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-300">
                  Auditoria e controle de todas as chaves emitidas (incluindo revogadas).
                </p>
                <div className="space-y-3">
                  {generatedKeys.map((keyItem) => (
                    <div
                      key={keyItem.id}
                      className={`
                        p-3 rounded-lg border
                        ${keyItem.active 
                          ? 'bg-[#0f111a] border-green-500/30' 
                          : 'bg-[#0f111a]/50 border-white/5 opacity-60'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold truncate ${keyItem.active ? 'text-white' : 'text-gray-400'}`}>
                            {keyItem.userName}
                          </p>
                          <p className="text-[10px] font-mono text-gray-300 mt-1 flex items-center gap-2">
                            {keyItem.key}
                            <span
                              className={`
                                text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase
                                ${keyItem.active 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-red-500/20 text-red-300'}
                              `}
                            >
                              {keyItem.active ? 'ATIVO' : 'REVOGADO'}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => revokeKey(keyItem.id)}
                          disabled={!keyItem.active || keyItem.key === masterKey}
                          className={`
                            p-1.5 rounded-full transition-colors shrink-0
                            ${keyItem.active && keyItem.key !== masterKey 
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' 
                              : 'bg-white/5 text-gray-400 cursor-not-allowed'}
                          `}
                          title={
                            keyItem.key === masterKey 
                              ? 'Chave Master não pode ser revogada' 
                              : keyItem.active 
                                ? 'Revogar Chave' 
                                : 'Chave já revogada'
                          }
                        >
                          {keyItem.active ? <Trash2 size={14} /> : <RotateCcw size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Login Tab */}
            {activeTab === 'login' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-300 mb-4">
                  Insira nome e chave para auditar/reparar sessão de usuário.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">
                      Nome de Usuário
                    </label>
                    <input
                      type="text"
                      value={loginName}
                      onChange={(e) => {
                        setLoginName(e.target.value);
                        setError('');
                      }}
                      placeholder="Nome do usuário"
                      className="w-full h-10 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-sm text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">
                      Chave de Acesso
                    </label>
                    <input
                      type="password"
                      value={loginKey}
                      onChange={(e) => {
                        setLoginKey(e.target.value);
                        setError('');
                      }}
                      placeholder="Chave de Acesso"
                      className="w-full h-10 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-sm text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all placeholder-gray-600"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 text-xs text-red-400 flex items-center gap-2 p-3 bg-red-500/10 rounded-lg">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                  <button
                    onClick={handleUserLogin}
                    disabled={!loginName.trim() || !loginKey.trim()}
                    className="px-6 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <LogOut size={16} /> Iniciar Sessão
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalAnimation>
    </Overlay>
  );
};

export default MasterKeyModal;
