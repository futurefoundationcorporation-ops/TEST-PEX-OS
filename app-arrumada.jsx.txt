import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Folder,
  FileText,
  ChevronRight,
  Settings,
  Edit2,
  ChevronDown, Search, Plus, Download, Upload, Users, Trash2, Save, Copy, Layout, Lock, Unlock, Columns, Network, List, Inbox, X, AlertCircle, ArrowLeft, FolderOpen,
  Eye,
  CornerDownRight,
  Filter,
  Home,
  Link as LinkIcon,
  UploadCloud,
  LogOut,
  Bell,
  Key,
  Camera,
  Check,
  Target,
  Zap,
  History,
  Maximize2,
  Minimize2,
  Terminal,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Share2,
  MoreVertical,
  Clock,
  Import,
  FileJson,
  Package,
  ArrowDownToLine,
  CopyCheck,
  RotateCcw
} from 'lucide-react';

// --- UTIL: FunÃ§Ã£o de geraÃ§Ã£o de ID Ãºnica (SimulaÃ§Ã£o de Chave de Acesso) ---
const generateUniqueId = () => Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString().substring(8);


// --- EMOJI LIST (Curated for Productivity) ---
const EMOJI_CATEGORIES = {
  "Essenciais": ["ðŸ“", "ðŸ“‚", "ðŸ—‚ï¸", "ðŸ—ƒï¸", "ðŸ“„", "ðŸ“", "ðŸ“‘", "ðŸ“Š"],
  "Tech & Dev": ["ðŸ’»", "ðŸ–¥ï¸", "âŒ¨ï¸", "ðŸ’¾", "ðŸ¤–", "âš™ï¸", "ðŸ”§", "ðŸž"],
  "Status": ["ðŸš€", "ðŸŽ¯", "ðŸ”¥", "ðŸ’¡", "âœ…", "ðŸš§", "ðŸ”’", "ðŸš©"],
  "Design": ["ðŸŽ¨", "ðŸ–Œï¸", "âœ’ï¸", "ðŸŽ­", "ðŸŒˆ", "ðŸ’Ž", "ðŸ“¸", "ðŸ“"],
  "Social": ["ðŸ‘‹", "ðŸ‘¥", "ðŸ—£ï¸", "ðŸ’¬", "â¤ï¸", "â­", "ðŸŽ‰", "ðŸ¤"]
};

// --- MOCK DE DADOS RECEBIDOS VIA "BLUETOOTH" (SIMULAÃ‡ÃƒO) ---
const incomingPackageFromAna = {
  id: 'ana-pack-001',
  name: 'Personal Space (Ana)',
  type: 'folder',
  emoji: 'ðŸ”’',
  children: [
    {
      id: 'ana-p1',
      type: 'prompt',
      name: 'Rotina Matinal CEO',
      content: 'Acordar Ã s 5h, banho gelado, leitura estratÃ©gica...',
      category: 'Rotina',
      tags: ['biohacking', 'produtividade'],
      date: 'Hoje'
    },
    {
      id: 'ana-f1',
      type: 'folder',
      name: 'Ideias de NegÃ³cio',
      emoji: 'ðŸ’¡',
      children: [
        {
          id: 'ana-p2',
          type: 'prompt',
          name: 'SaaS de CafÃ©',
          content: 'Assinatura de cafÃ© especial com IA...',
          category: 'Business',
          tags: ['ideia', 'saas'],
          date: 'Ontem'
        }
      ]
    }
  ]
};

// --- ESTRUTURA VAZIA ---
const initialData = [];
const initialSharedData = [];

// NOTIFICAÃ‡Ã•ES INICIAIS (COM GATILHO DE BACKUP)
const initialNotifications = [
  {
    id: 99,
    title: 'TransferÃªncia Recebida',
    description: 'Ana Silva enviou a pasta "Personal Space". Clique para revisar e importar.',
    time: 'Agora',
    type: 'transfer',
    payload: incomingPackageFromAna,
    read: false
  },
  { id: 1, title: 'Acesso Concedido', description: 'Ana Silva compartilhou "Design Assets".', time: '2 min', type: 'share', read: false },
  { id: 2, title: 'Sistema', description: 'Backup automÃ¡tico realizado.', time: '3h', type: 'system', read: true }
];

const VIEWS = [
  { id: 'sequential', label: 'Sequencial', icon: List },
  { id: 'miller', label: 'Miller Columns', icon: Columns },
  { id: 'mindmap', label: 'Hierarquia', icon: Network }
];

// --- HOOK: SMART CLICK DETECTION (Prevents accidental closes on drag) ---
const useIntentionalClick = (onIntentionalClick) => {
  const [mouseDownPos, setMouseDownPos] = useState(null);

  const handleMouseDown = (e) => {
    // Garante que o clique comeÃ§ou no overlay e nÃ£o em um filho (importante!)
    if (e.target !== e.currentTarget) return;
    setMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e) => {
    if (!mouseDownPos) return;

    // Calcula distÃ¢ncia do arraste
    const deltaX = Math.abs(e.clientX - mouseDownPos.x);
    const deltaY = Math.abs(e.clientY - mouseDownPos.y);
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    // Se moveu menos de 5px, considera click intencional
    if (distance < 5 && typeof onIntentionalClick === 'function') {
      onIntentionalClick(e);
    }

    setMouseDownPos(null);
  };

  return { handleMouseDown, handleMouseUp };
};

// ----------------------------------------------------------------------------------
// --- COMPONENTE: MODAL GERADOR DE CHAVES MASTER ---
// ----------------------------------------------------------------------------------
const MasterKeyGenerator = ({ isOpen, onClose, onLogin, onLogoutMaster, generatedKeys, onGenerateKey, onRevokeKey, masterKey }) => {
  const [userName, setUserName] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginKey, setLoginKey] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'session' | 'login'
  const modalRef = useRef(null);

  const { handleMouseDown, handleMouseUp } = useIntentionalClick(onClose);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Tab trapping
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!userName.trim()) {
      setError("Nome de Usuário é obrigatório para gerar a chave.");
      return;
    }
    onGenerateKey(userName.trim());
    setUserName('');
    setError('');
    setActiveTab('session');
  };

  const handleUserLogin = () => {
    if (!loginName.trim() || !loginKey.trim()) {
      setError("Nome e Chave de Acesso são obrigatórios.");
      return;
    }

    // Verifica se a chave gerada existe e está ativa
    const keyMatch = generatedKeys.find(k => k.key === loginKey.trim() && k.userName === loginName.trim() && k.active);

    // Se for a Master Key, volta para Master Admin
    if (loginKey.trim() === masterKey) {
      onLogoutMaster();
      onClose();
      return;
    }

    if (!keyMatch) {
      setError("Chave ou Nome de Usuário inválidos/revogados.");
      return;
    }

    // Simula o login de um usuário padrão
    onLogin(loginName.trim(), loginKey.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div ref={modalRef} className="bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Key size={20} className="text-red-400" />
            Master Access Panel
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex border-b border-white/10 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'generator' ? 'text-red-400 border-b-2 border-red-500' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Gerar Chaves
          </button>
          <button
            onClick={() => setActiveTab('session')}
            className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'session' ? 'text-red-400 border-b-2 border-red-500' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Sessões & Revogação
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'login' ? 'text-red-400 border-b-2 border-red-500' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Sessão de Auditoria
          </button>
        </div>

        {/* --- CONTEÚDO: GERADOR DE CHAVES --- */}
        {activeTab === 'generator' && (
          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="p-4 bg-[#252b3b]/50 rounded-lg border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2"><Plus size={16} /> Gerar Nova Chave de Acesso</h4>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Nome do Novo Usuário</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => { setUserName(e.target.value); setError(''); }}
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
              <h4 className="text-sm font-bold text-white flex items-center gap-2"><Users size={16} /> Chaves Ativas</h4>
              <div className="mt-4">
                {generatedKeys.filter(k => k.active && k.key !== masterKey).length === 0 ? (
                  <p className="text-xs text-gray-400">Nenhuma chave de usuário ativa.</p>
                ) : (
                  <div className="space-y-3">
                    {generatedKeys.filter(k => k.active && k.key !== masterKey).map(keyItem => (
                      <div key={keyItem.id} className="p-3 bg-[#0f111a] rounded-lg border border-white/5 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">{keyItem.userName}</p>
                          <p className="text-[10px] font-mono text-gray-300 mt-1 flex items-center gap-2">
                            {keyItem.key}
                            <button
                              onClick={() => { navigator.clipboard.writeText(keyItem.key); showToast("Chave copiada!", "info"); }}
                              className="text-gray-400 hover:text-[#2979ff] transition-colors"
                              title="Copiar chave"
                            >
                              <Copy size={10} />
                            </button>
                          </p>
                        </div>
                        <button
                          onClick={() => onRevokeKey(keyItem.id)}
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

        {/* --- CONTEÚDO: SESSÕES E REVOGAÇÃO (Histórico) --- */}
        {activeTab === 'session' && (
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            <p className="text-sm text-gray-300">Auditoria e controle de todas as chaves de acesso emitidas (incluindo revogadas).</p>
            <div className="space-y-3">
              {generatedKeys.map(keyItem => (
                <div key={keyItem.id} className={`p-3 rounded-lg border ${keyItem.active ? 'bg-[#0f111a] border-green-500/30' : 'bg-[#0f111a]/50 border-white/5 opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${keyItem.active ? 'text-white' : 'text-gray-400'}`}>{keyItem.userName}</p>
                      <p className="text-[10px] font-mono text-gray-300 mt-1 flex items-center gap-2">
                        {keyItem.key}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${keyItem.active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {keyItem.active ? 'ATIVO' : 'REVOGADO'}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => onRevokeKey(keyItem.id)}
                      className={`p-1.5 rounded-full transition-colors shrink-0 ${keyItem.active && keyItem.key !== masterKey ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400 cursor-not-allowed'}`}
                      title={keyItem.active && keyItem.key !== masterKey ? "Revogar Chave" : keyItem.key === masterKey ? "Chave Master não pode ser revogada" : "Chave já revogada"}
                      disabled={!keyItem.active || keyItem.key === masterKey}
                    >
                      {keyItem.active ? <Trash2 size={14} /> : <RotateCcw size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- CONTEÚDO: ACESSO DE USUÁRIO (Login de Amigos) --- */}
        {activeTab === 'login' && (
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            <p className="text-sm text-gray-300 mb-4">Insira o nome e a chave do usuário que você deseja auditar/reparar.</p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Nome de Usuário</label>
                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => { setLoginName(e.target.value); setError(''); }}
                  placeholder="Nome do usuário para auditar"
                  className="w-full h-10 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-sm text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Chave de Acesso</label>
                <input
                  type="password"
                  value={loginKey}
                  onChange={(e) => { setLoginKey(e.target.value); setError(''); }}
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
  );
};

// ----------------------------------------------------------------------------------
// --- COMPONENTE: SELETOR DE EMOJIS CUSTOMIZADO ---
// ----------------------------------------------------------------------------------
const EmojiPicker = ({ onSelect, selectedEmoji }) => {
  return (
    <div className="bg-[#13161c] border border-white/5 rounded-lg p-3 max-h-48 overflow-y-auto mt-2 shadow-xl custom-scrollbar">
      {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
        <div key={category} className="mb-3 last:mb-0">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-[#13161c] py-1">{category}</h4>
          <div className="grid grid-cols-8 gap-1">
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                className={`w-8 h-8 flex items-center justify-center rounded text-lg hover:bg-white/10 transition-colors ${selectedEmoji === emoji ? 'bg-[#2979ff]/20 ring-1 ring-[#2979ff]' : ''}`}
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

// ----------------------------------------------------------------------------------
// --- COMPONENTE: MODAL DE SELEÃ‡ÃƒO DE MOVIMENTO (SMART DROP) ---
// ----------------------------------------------------------------------------------
const MoveSelectorModal = ({ isOpen, onClose, draggedId, draggedType, availableTargets, onMove }) => {
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const { handleMouseDown, handleMouseUp } = useIntentionalClick(onClose);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Tab trapping
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    if (selectedTargetId && draggedId) {
      onMove(draggedId, selectedTargetId === 'root' ? null : selectedTargetId);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[230] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div ref={modalRef} className="bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {draggedType === 'folder' ? 'Mover Pasta e ConteÃºdo' : 'Mover Prompt'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Selecione o destino:</label>
          <div className="max-h-80 overflow-y-auto custom-scrollbar border border-white/10 rounded-lg bg-[#0f111a] p-2">
            <div
              className={`p-3 hover:bg-white/5 rounded cursor-pointer transition-colors ${selectedTargetId === 'root' ? 'bg-[#2979ff]/10' : ''}`}
              onClick={() => setSelectedTargetId('root')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${selectedTargetId === 'root' ? 'ring-2 ring-[#2979ff]' : ''}`}>
                  ðŸ“
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium ${selectedTargetId === 'root' ? 'text-white' : 'text-gray-300'}`}>
                    ðŸ“‚ Raiz (Primeiro NÃ­vel)
                  </div>
                  <div className="text-xs text-gray-400">Mover para o nÃ­vel superior</div>
                </div>
                {selectedTargetId === 'root' && <Check size={16} className="text-[#2979ff] shrink-0" />}
              </div>
            </div>

            <div className="h-px bg-white/10 my-2"></div>

            {availableTargets.map(folder => (
              <div
                key={folder.id}
                className={`p-3 hover:bg-white/5 rounded cursor-pointer transition-colors ${selectedTargetId === folder.id ? 'bg-[#2979ff]/10' : ''}`}
                onClick={() => setSelectedTargetId(folder.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${selectedTargetId === folder.id ? 'ring-2 ring-[#2979ff]' : ''}`}>
                    ðŸ“
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium truncate ${selectedTargetId === folder.id ? 'text-white' : 'text-gray-300'}`}>
                      {folder.name}
                    </div>
                  </div>
                  {selectedTargetId === folder.id && <Check size={16} className="text-[#2979ff] shrink-0" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">Cancelar</button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTargetId}
            className="px-6 py-2 text-sm font-bold bg-[#2979ff] hover:bg-[#2264d1] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Movimento
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------------
// --- COMPONENTE: TOOLTIP ---
// ----------------------------------------------------------------------------------
const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l'
  };

  return (
    <div className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className={`absolute z-50 px-3 py-2 text-xs text-white bg-[#1e2330] border border-white/10 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150 ${positionClasses[position]}`}>
          {content}
          <div className={`absolute w-2 h-2 bg-[#1e2330] border-white/10 rotate-45 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------------
// --- COMPONENTE: MODAL DE EDIÇÃO (COM VISUALIZAÇÃO DE ÁRVORE DE IMPORTAÇÃO) ---
// ----------------------------------------------------------------------------------
const EditModal = ({ isOpen, onClose, item, onSave, allFolders, isFullEdit, isImport }) => {
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [targetFolderId, setTargetFolderId] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Novos estados para Full Edit / Import
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newTags, setNewTags] = useState('');

  const { handleMouseDown, handleMouseUp } = useIntentionalClick(onClose);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Tab trapping
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && item) {
      setNewName(item.name);
      setNewEmoji(item.emoji || '📄');
      setTargetFolderId('');
      setShowEmojiPicker(false);

      if (item.type === 'prompt') {
        setNewContent(item.content || '');
        setNewCategory(item.category || '');
        setNewTags(item.tags ? item.tags.join(', ') : '');
      }
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    if (newName.trim()) {
      onSave(
        item.id,
        newName.trim(),
        newEmoji,
        targetFolderId || (isImport ? 'root' : null),
        newContent,
        newCategory,
        newTags.split(',').map(t => t.trim()).filter(t => t),
        isImport
      );
    }
    onClose();
  };

  const itemType = item.type === 'folder' ? 'Pasta' : 'Prompt';
  const isPrompt = item.type === 'prompt';
  const availableFolders = allFolders;

  const renderImportPreview = (children, depth = 0) => {
    if (!children || children.length === 0) return null;
    return (
      <ul className={`mt-1 space-y-1 ${depth > 0 ? 'ml-3 border-l border-white/10 pl-2' : ''}`}>
        {children.slice(0, depth === 0 ? 5 : 3).map((child, i) => (
          <li key={i} className="flex items-center gap-2 text-[11px] text-gray-300">
            <span>{child.type === 'folder' ? '📁' : '📄'}</span>
            <span className="truncate">{child.name}</span>
            {child.type === 'folder' && child.children?.length > 0 && <span className="text-[9px] bg-white/5 px-1 rounded">{child.children.length} itens</span>}
            {child.type === 'folder' && renderImportPreview(child.children, depth + 1)}
          </li>
        ))}
        {children.length > (depth === 0 ? 5 : 3) && <li className="text-[10px] text-gray-400 italic pl-4">... e mais {children.length - (depth === 0 ? 5 : 3)} itens</li>}
      </ul>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] animate-in fade-in duration-200"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div ref={modalRef} className={`bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full p-0 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${(isFullEdit || isImport) && isPrompt ? 'max-w-2xl' : 'max-w-md'} ${isImport ? 'ring-2 ring-emerald-500/50' : ''}`} onClick={e => e.stopPropagation()}>

        {/* HEADER COMPACTO */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0 bg-[#1e2330] rounded-t-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {isImport && <ArrowDownToLine size={16} className="text-emerald-400" />}
            {isImport ? 'Receber Transferência' : `Editar ${itemType}`}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">

          {/* GRID DE METADADOS (2 Colunas) */}
          <div className="grid grid-cols-[auto_1fr] gap-4 mb-4">
            {/* Coluna 1: Ícone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-400">Ícone</label>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-14 h-14 bg-[#0f111a] border border-white/10 rounded-xl text-2xl flex items-center justify-center hover:border-[#2979ff] hover:bg-[#2979ff]/5 transition-all relative group"
              >
                {newEmoji}
                <div className="absolute -bottom-1.5 -right-1.5 bg-[#2979ff] text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <Edit2 size={8} />
                </div>
              </button>
            </div>

            {/* Coluna 2: Nome e Localização */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Nome</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isFullEdit && !isImport) handleSave(); }}
                  placeholder={`Nome da ${itemType}`}
                  className="w-full h-9 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-sm text-gray-200 focus:outline-none focus:border-[#2979ff] transition-all placeholder-gray-600"
                  autoFocus
                />
              </div>

              <details className="group mb-4" open={isImport}>
                <summary className="cursor-pointer p-3 bg-[#0f111a]/30 hover:bg-[#0f111a]/50 rounded-lg border border-white/10 transition-all list-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-gray-500 group-open:rotate-90 transition-transform" />
                      <FolderOpen size={14} className="text-gray-500" />
                      <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                        {isImport ? 'Destino da Importação' : 'Mover para Pasta (Opcional)'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-600 group-open:hidden">
                      {targetFolderId ? '1 pasta selecionada' : 'Clique para expandir'}
                    </span>
                  </div>
                </summary>

                <div className="mt-2 p-3 bg-[#0f111a]/20 rounded-lg border border-white/5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Localização</label>
                  <div className="relative">
                    <select
                      value={targetFolderId}
                      onChange={(e) => setTargetFolderId(e.target.value)}
                      className={`w-full h-9 bg-[#0f111a] border rounded-lg px-3 text-xs text-gray-200 focus:outline-none focus:border-[#2979ff] appearance-none cursor-pointer transition-all ${isImport ? 'border-emerald-500/30' : 'border-white/10'}`}
                    >
                      <option value="">{isImport ? '📂 Raiz (Padrão)' : '📍 Manter atual'}</option>
                      {!isImport && <option value="root">📂 Mover para Raiz</option>}
                      {availableFolders.map(f => (
                        <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </details>
            </div>
          </div>

          {showEmojiPicker && (
            <div className="animate-in slide-in-from-top-2 duration-200 mb-4 p-2 bg-[#0f111a] rounded-lg border border-white/5">
              <EmojiPicker onSelect={(emoji) => { setNewEmoji(emoji); setShowEmojiPicker(false); }} selectedEmoji={newEmoji} />
            </div>
          )}

          {/* PREVIEW DE IMPORTAÇÃO */}
          {isImport && item.children && (
            <div className="mb-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Package size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Conteúdo</span>
              </div>
              <div className="bg-[#0f111a]/50 rounded-lg p-2 border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
                {renderImportPreview(item.children)}
              </div>
            </div>
          )}

          {/* CAMPOS EXTRAS (PROMPT) */}
          {((isFullEdit && isPrompt) || (isImport && isPrompt && !item.children)) && (
            <div className="space-y-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 block">Categoria</label>
                  <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Ex: System..." className="w-full h-9 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-xs text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 block">Tags</label>
                  <input type="text" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="Ex: dev, react" className="w-full h-9 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-xs text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 block">Conteúdo do Prompt</label>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Digite o prompt aqui..." className="w-full h-48 bg-[#0f111a] border border-white/10 rounded-lg p-3 text-xs text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all font-mono leading-relaxed resize-none custom-scrollbar" />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-white/5 bg-[#1e2330] rounded-b-xl shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium rounded-lg text-gray-300 border border-white/10 hover:bg-white/10 transition-colors">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={!newName.trim()}
            className={`px-5 py-2 text-xs font-bold rounded-lg text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${isImport ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-[#2979ff] hover:bg-[#2264d1] shadow-blue-900/20'}`}
          >
            {isImport ? <ArrowDownToLine size={14} /> : (targetFolderId ? <FolderOpen size={14} /> : <Check size={14} />)}
            {isImport ? 'Importar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------------
// --- COMPONENTE: VISUALIZADOR DE PROMPT (LEITURA FOCADA) ---
// ----------------------------------------------------------------------------------
const PromptViewerModal = ({ isOpen, onClose, prompt, onEdit }) => {
  const { handleMouseDown, handleMouseUp } = useIntentionalClick(onClose);
  const [isCopied, setIsCopied] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  if (!isOpen || !prompt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content || '');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center backdrop-blur-sm bg-black/80 transition-all duration-500"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div
        className={`
          bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 transition-all
          ${isFocusMode ? 'max-w-5xl h-[85vh] border-[#2979ff]/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'max-w-3xl'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className={`flex items-center justify-between p-5 border-b border-white/5 shrink-0 transition-opacity duration-300 ${isFocusMode ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2979ff]/20 to-purple-500/20 flex items-center justify-center text-2xl">
              {prompt.emoji || '📄'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{prompt.name}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{prompt.category || 'Geral'}</span>
                <span>•</span>
                <span>{prompt.date}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-2 rounded-lg transition-colors ${isFocusMode ? 'bg-[#2979ff] text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
              title={isFocusMode ? "Sair do Modo Foco" : "Modo Foco"}
            >
              {isFocusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            {!isFocusMode && (
              <button onClick={() => onEdit(null, prompt)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Editar">
                <Edit2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar bg-[#0f111a]/30 transition-all duration-500 ${isFocusMode ? 'p-10' : 'p-6'}`}>
          <div className={`prose prose-invert max-w-none mx-auto transition-all duration-500 ${isFocusMode ? 'max-w-4xl' : ''}`}>
            <div className={`
              bg-[#0f111a] border border-white/5 rounded-lg font-mono leading-relaxed text-gray-300 whitespace-pre-wrap shadow-inner transition-all duration-500
              ${isFocusMode ? 'p-10 text-lg border-none bg-transparent shadow-none' : 'p-6 text-sm'}
            `}>
              {prompt.content}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className={`p-5 border-t border-white/5 bg-[#13161c] flex justify-between items-center shrink-0 transition-opacity duration-300 ${isFocusMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
          <div className="flex gap-2">
            {prompt.tags?.map(tag => (
              <span key={tag} className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5">
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${isCopied ? 'bg-green-500 text-white' : 'bg-[#2979ff] hover:bg-[#2264d1] text-white'}`}
          >
            {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {isCopied ? 'Copiado!' : 'Copiar Prompt'}
          </button>
        </div>
      </div>
    </div>
  );
};
const SettingsModal = ({ isOpen, onClose, currentUser, onUpdatePreferences }) => {
  const [localView, setLocalView] = useState('sequential');
  const [previewAvatar, setPreviewAvatar] = useState(currentUser?.avatar);
  const fileInputRef = useRef(null);
  const { handleMouseDown, handleMouseUp } = useIntentionalClick(onClose);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLocalView(currentUser?.preferences?.defaultView || 'sequential');
      setPreviewAvatar(currentUser?.avatar);
    }
  }, [isOpen, currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdatePreferences({ defaultView: localView, avatar: previewAvatar });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm bg-black/60"
      style={{ animation: 'fadeInOverlay 0.3s ease-out forwards' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <style>{`@keyframes fadeInOverlay { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(4px); } } @keyframes popInModal { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
      <div ref={modalRef} className="bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full max-w-lg overflow-hidden" style={{ animation: 'popInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center"><h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20} className="text-[#2979ff]" /> ConfiguraÃ§Ãµes</h2><button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button></div>
        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">Perfil</h3>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2a3040] to-[#1e2330] border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl transition-transform hover:scale-105">
                  {previewAvatar ? (<img src={previewAvatar} alt="Profile" className="w-full h-full object-cover" />) : (<span className="text-2xl font-bold text-indigo-400">{currentUser.name.substring(0, 2).toUpperCase()}</span>)}
                </div>
                <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 p-1.5 bg-[#2979ff] text-white rounded-full shadow-lg hover:bg-[#2264d1] transition-all hover:scale-110 border border-[#1e2330]" title="Alterar Foto"><Camera size={14} /></button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <div className="flex-1"><p className="text-white font-medium mb-1">Sua Foto</p><p className="text-xs text-gray-300 leading-relaxed">Personalize como vocÃª aparece para sua equipe.</p></div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">ExperiÃªncia</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">VisualizaÃ§Ã£o Inicial</label>
              <div className="grid grid-cols-3 gap-3">
                {VIEWS.map(view => (
                  <button key={view.id} onClick={() => setLocalView(view.id)} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${localView === view.id ? 'bg-[#2979ff]/10 border-[#2979ff] text-[#2979ff] shadow-[0_0_15px_rgba(41,121,255,0.15)] scale-[1.02]' : 'bg-[#0f111a] border-white/5 text-gray-300 hover:border-white/20 hover:text-gray-200'}`}>
                    <view.icon size={20} /> <span className="text-xs font-medium">{view.label}</span> {localView === view.id && <div className="absolute top-2 right-2 w-2 h-2 bg-[#2979ff] rounded-full shadow-[0_0_5px_#2979ff]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/5 bg-[#13161c] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-6 py-2 text-sm font-bold bg-[#2979ff] hover:bg-[#2264d1] text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"><Check size={16} /> Salvar</button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------------
// --- COMPONENTE: MODAL DE HISTÃ“RICO ---
// ----------------------------------------------------------------------------------
const HistoryModal = ({ isOpen, onClose, history, onClear }) => {
  const { handleMouseDown, handleMouseUp } = useIntentionalClick(onClose);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm bg-black/60" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div className="bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">HistÃ³rico</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="text-gray-300 text-sm">{history && history.length > 0 ? 'HistÃ³rico de aÃ§Ãµes...' : 'Nenhum histÃ³rico recente.'}</div>
        <div className="mt-6 flex justify-end"><button onClick={onClear} className="text-red-400 text-sm hover:text-red-300">Limpar HistÃ³rico</button></div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------------
// --- COMPONENTE: MODAL DE NOTIFICAÃ‡Ã•ES ---
// ----------------------------------------------------------------------------------
const NotificationsModal = ({ isOpen, onClose, notifications, onMarkAllRead }) => {
  const { handleMouseDown, handleMouseUp } = useIntentionalClick(onClose);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm bg-black/60" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div className="bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">NotificaÃ§Ãµes</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="text-gray-300 text-sm">{notifications && notifications.length > 0 ? 'Suas notificaÃ§Ãµes...' : 'Nenhuma notificaÃ§Ã£o nova.'}</div>
        <div className="mt-6 flex justify-end"><button onClick={onMarkAllRead} className="text-[#2979ff] text-sm hover:text-blue-400">Marcar todas como lidas</button></div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------------
// --- COMPONENTES AUXILIARES (Tree View) ---
// ----------------------------------------------------------------------------------
const AnimatedTreeItem = ({ children, isExpanded, id }) => {
  const style = { transition: 'grid-template-rows 200ms ease-out, opacity 200ms ease-out', gridTemplateRows: isExpanded ? '1fr' : '0fr', opacity: isExpanded ? 1 : 0, overflow: 'hidden' };
  return (<div style={style} className="grid"><div className="min-h-0">{children}</div></div>);
};

const TreeViewNode = React.memo(({ node, onSelect, onEdit, isLocked, level = 0, selectedPrompt }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  let isFolder = node.type === 'folder';
  const renderIcon = () => {
    if (node.emoji) return <span className="text-base leading-none w-4 text-center shrink-0">{node.emoji}</span>;
    if (isFolder) { if (node.isSystem) return <Settings size={16} className="text-gray-300 shrink-0" />; return <Folder size={16} className={isExpanded ? 'text-indigo-600 shrink-0' : 'text-gray-400 shrink-0'} />; }
    return <FileText size={14} className="text-gray-400 shrink-0" />;
  };
  const isNodeSelected = node.type === 'prompt' && selectedPrompt?.id === node.id;
  const indentStyle = { paddingLeft: `${level * 24}px` };
  const handleClick = (e) => { e.stopPropagation(); if (isFolder) { setIsExpanded(!isExpanded); } else { onSelect(node); } };

  // ATHENA FIX: EstilizaÃ§Ã£o unificada para Hierarquia (Compact Premium)
  const baseClasses = `group flex items-center justify-between transition-all duration-150 cursor-pointer text-gray-300 border-l-[3px] my-0.5 rounded-r-md
      ${isNodeSelected
      ? 'bg-gradient-to-r from-[#2979ff]/10 to-transparent border-l-[#2979ff] text-white'
      : 'border-l-transparent hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent hover:border-l-white/20'
    }`;

  return (
    <div className="flex flex-col">
      <div
        onClick={handleClick}
        className={baseClasses}
        style={indentStyle}
        tabIndex={0}
        role="button"
        aria-label={`${isFolder ? 'Pasta' : 'Prompt'}: ${node.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
          }
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 py-2 h-8">
          {hasChildren ? (<ChevronRight size={14} className={`shrink-0 text-gray-400 transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />) : (<div className="w-3" />)}
          {renderIcon()}
          <div className="flex items-center gap-2 min-w-0">
            <span className={`truncate ${isFolder ? 'font-medium text-sm' : 'text-[13px] font-normal text-gray-300 group-hover:text-gray-200'}`}>{node.name}</span>
            {!isFolder && (<div className="flex items-center gap-1.5 opacity-50 transition-opacity group-hover:opacity-100">{node.tags?.map(tag => (<span key={tag} className="text-[10px] uppercase tracking-[0.5px] text-gray-400 border border-white/10 px-1 rounded">{tag}</span>))}</div>)}
          </div>
        </div>
        <button onClick={(e) => onEdit(e, node)} className="p-1 mr-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100" title={`Editar ${node.name}`}><Edit2 size={12} /></button>
      </div>
      {hasChildren && (<AnimatedTreeItem isExpanded={isExpanded} id={node.id}>{node.children.map((child) => (<TreeViewNode key={child.id} node={child} onSelect={onSelect} onEdit={onEdit} isLocked={isLocked} level={level + 1} selectedPrompt={selectedPrompt} />))}</AnimatedTreeItem>)}
    </div>
  );
});

// ... (ProfileDropdown - Atualizado para Master Access)
const ProfileDropdown = ({ currentUser, onOpenSettings, onOpenNotifications, onOpenMasterLogin, unreadCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) { setIsOpen(false); } };
    document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(currentUser.name);

  // ATHENA FIX V15: SeguranÃ§a em NÃ­vel de CÃ³digo - Verifica role E keyId
  const isMaster = currentUser.role === 'master' && currentUser.keyId;

  // ATHENA FIX V16: Handler para abrir o modal de login
  const handleMasterClick = () => {
    setIsOpen(false);
    onOpenMasterLogin();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="group w-8 h-8 ml-2 relative outline-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2979ff] rounded-full" title="Meu Perfil">
        <div className={`w-full h-full rounded-full bg-gradient-to-br from-[#2a3040] to-[#1e2330] flex items-center justify-center text-[10px] font-bold tracking-wide border transition-all shadow-inner text-indigo-400 overflow-hidden ${isOpen ? 'border-[#2979ff] ring-2 ring-[#2979ff]/20' : 'border-white/10 group-hover:border-white/30'}`}>
          {currentUser.avatar ? (<img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />) : (initials)}
        </div>
        {unreadCount > 0 && !isOpen && (<span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-[#0f111a] rounded-full z-10 flex items-center justify-center"></span>)}
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-60 bg-[#1e2330] border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden ring-1 ring-white/5 origin-top-right" style={{ animation: 'popInMenu 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
          <style>{`@keyframes popInMenu { 0% { opacity: 0; transform: scale(0.9) translateY(-10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
          <div className="p-4 border-b border-white/5 bg-[#252b3b]/50">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg overflow-hidden shrink-0 ${currentUser.role === 'master' ? 'bg-gradient-to-br from-red-600 to-orange-600' : 'bg-gradient-to-br from-indigo-500 to-blue-600'}`}>{currentUser.avatar ? (<img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />) : (initials)}</div>
              <div className="min-w-0"><h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4><span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${currentUser.role === 'master' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>{currentUser.role === 'master' ? 'Master Admin' : 'User'}</span></div>
            </div>
          </div>
          <div className="p-1 space-y-0.5">
            {/* ATHENA FIX V15: BotÃ£o com RenderizaÃ§Ã£o Condicional Estrita + Nova Aba */}
            {isMaster && currentUser.role === 'master' && (
              <button
                onClick={handleMasterClick}
                className="w-full text-left px-3 py-2 text-xs font-medium bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg flex items-center gap-3 transition-all mb-1 focus:outline-none focus:bg-red-500/10"
              >
                <Key size={14} className="shrink-0" /> Master Access
              </button>
            )}
            <button onClick={() => { onOpenNotifications(); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-lg flex items-center gap-3 transition-colors focus:outline-none focus:bg-white/5"><Bell size={14} className="shrink-0 text-gray-400" /> <span className="flex-1">NotificaÃ§Ãµes</span>{unreadCount > 0 && (<span className="flex items-center justify-center bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full shadow-sm">{unreadCount}</span>)}</button>
            <button onClick={() => { onOpenSettings(); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-lg flex items-center gap-3 transition-colors focus:outline-none focus:bg-white/5"><Settings size={14} className="shrink-0 text-gray-400" /> ConfiguraÃ§Ãµes & PreferÃªncias</button>
          </div>
          <div className="p-1 border-t border-white/5 mt-0.5">
            <button
              onClick={() => { setIsOpen(false); setCurrentUser({ name: 'Natasha (ENTJ)', role: 'master', keyId: 'admin-key-001', avatar: null }); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-lg flex items-center gap-3 transition-colors focus:outline-none focus:bg-white/5"
            >
              <LogOut size={14} className="shrink-0" /> {currentUser.role === 'master' ? 'Sair da Conta' : 'Sair da SessÃ£o'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------------
// --- COMPONENTE: SEQUENTIAL VIEW (NavegaÃ§Ã£o em Pilha) ---
// ----------------------------------------------------------------------------------
const SequentialView = ({
  path,
  onNavigate,
  onBack,
  onSelectPrompt,
  onEdit,
  onDelete,
  onMove,
  onToggleLock,
  isLocked,
  slideDirection,
  draggedItemId,
  setDraggedItemId,
  onDrop,
  justDroppedId
}) => {
  const currentFolder = path[path.length - 1];
  const items = currentFolder ? currentFolder.children : [];

  // OrdenaÃ§Ã£o: Pastas primeiro, depois Prompts
  const sortedItems = [...items].sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === 'folder' ? -1 : 1;
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
      {/* Breadcrumbs / Header de NavegaÃ§Ã£o */}
      <div className="flex items-center gap-2 mb-8 text-sm text-gray-400 animate-in fade-in slide-in-from-top-4 duration-500">
        <button
          onClick={() => onNavigate(null, -1)}
          className={`hover:text-white transition-colors flex items-center gap-1 ${path.length === 0 ? 'text-white font-bold' : ''}`}
        >
          <Home size={14} /> InÃ­cio
        </button>
        {path.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <ChevronRight size={12} className="text-gray-400" />
            <button
              onClick={() => onNavigate(folder, index)}
              className={`hover:text-white transition-colors flex items-center gap-1 ${index === path.length - 1 ? 'text-white font-bold' : ''}`}
            >
              {folder.emoji} {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Grid de Itens */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20
        ${slideDirection === 'right' ? 'animate-slide-right' : slideDirection === 'left' ? 'animate-slide-left' : 'animate-in fade-in zoom-in-95 duration-300'}
      `}>
        {path.length > 0 && (
          <button
            onClick={onBack}
            className="group flex flex-col items-center justify-center p-6 rounded-xl border border-white/5 bg-[#1e2330]/50 hover:bg-[#1e2330] hover:border-white/10 transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-white">Voltar</span>
          </button>
        )}

        {sortedItems.map((item) => {
          const isFolder = item.type === 'folder';
          const isJustDropped = item.id === justDroppedId;

          return (
            <div
              key={item.id}
              draggable={!isLocked}
              onDragStart={(e) => {
                if (isLocked) { e.preventDefault(); return; }
                setDraggedItemId(item.id);
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (isFolder && draggedItemId && draggedItemId !== item.id) {
                  e.currentTarget.classList.add('ring-2', 'ring-[#2979ff]', 'scale-[1.02]');
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('ring-2', 'ring-[#2979ff]', 'scale-[1.02]');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('ring-2', 'ring-[#2979ff]', 'scale-[1.02]');
                if (isFolder && draggedItemId && draggedItemId !== item.id) {
                  onDrop(draggedItemId, item.id);
                }
              }}
              onClick={() => isFolder ? onNavigate(item) : onSelectPrompt(item)}
              className={`
                group relative p-5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-3
                ${isFolder
                  ? 'bg-[#1e2330] border-white/5 hover:border-[#2979ff]/50 hover:shadow-[0_0_20px_rgba(41,121,255,0.1)]'
                  : 'bg-[#13161c] border-white/5 hover:border-white/20 hover:bg-[#1a1d24]'}
                hover:-translate-y-1
                ${isJustDropped ? 'ring-2 ring-green-500 animate-pulse' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${isFolder ? 'bg-[#2979ff]/10' : 'bg-white/5'}`}>
                  {item.emoji}
                </div>
                {!isLocked && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => onEdit(e, item)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded"><Edit2 size={14} /></button>
                    <button onClick={(e) => onDelete(e, item)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={14} /></button>
                    <button onClick={(e) => onMove(e, item)} className="p-1.5 text-gray-400 hover:text-[#2979ff] hover:bg-[#2979ff]/10 rounded"><Move size={14} /></button>
                  </div>
                )}
              </div>

              <div>
                <h3 className={`font-bold truncate mb-1 ${isFolder ? 'text-base text-white' : 'text-sm text-gray-200'}`}>{item.name}</h3>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  {isFolder ? (
                    <>
                      <span>{item.children?.length || 0} itens</span>
                      {item.isSystem && <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">SYSTEM</span>}
                    </>
                  ) : (
                    <>
                      <span className="font-mono">{item.date}</span>
                      {item.category && <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{item.category}</span>}
                    </>
                  )}
                </div>
              </div>

              {!isFolder && item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto pt-2">
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[9px] uppercase font-bold tracking-wider text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && <span className="text-[9px] text-gray-400">+{item.tags.length - 3}</span>}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State para Pastas Vazias */}
        {sortedItems.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02]">
            <FolderOpen size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Esta pasta estÃ¡ vazia</p>
            {!isLocked && <p className="text-xs mt-1 opacity-60">Arraste itens para cÃ¡ ou crie novos</p>}
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------------
// --- SERVICE LAYER: DATA ACCESS (Backend Readiness) ---
// ----------------------------------------------------------------------------------
const DataService = {
  fetchData: async () => {
    return new Promise((resolve) => {
      const saved = localStorage.getItem('ff_organizer_data');
      setTimeout(() => {
        if (saved) {
          resolve(JSON.parse(saved));
        } else {
          // Mock Initial Data
          const mockData = [
            {
              id: 'f1',
              name: 'Pastas Principais',
              type: 'folder',
              emoji: 'ðŸ—‚ï¸',
              children: [
                {
                  id: 'f1-1',
                  name: 'System Prompts',
                  type: 'folder',
                  emoji: 'âš™ï¸',
                  isSystem: true,
                  children: [
                    { id: 'p1', name: 'Prompt 1-sintsdata', type: 'prompt', emoji: 'ðŸ¤–', content: 'Prompt content that is significantly longer to test truncation and ensure it does not break the layout of the card even when the screen is resized. This is a robustness test.', tags: ['system'], category: 'System', date: '13/02/2023' },
                    { id: 'p2', name: 'Coding Assistant', type: 'prompt', emoji: 'ðŸ‘¨â€ðŸ’»', content: 'React expert...', tags: ['dev'], category: 'Development', date: '14/02/2023' }
                  ]
                },
                { id: 'f1-2', name: 'Marketing Campaigns', type: 'folder', emoji: 'ðŸš€', children: [] }
              ]
            },
            {
              id: 'f2',
              name: 'Personal Space',
              type: 'folder',
              emoji: 'ðŸ”’',
              children: [
                { id: 'p3', name: 'Operational Logs', type: 'prompt', emoji: 'ðŸ›¡ï¸', content: 'Daily operations log...', tags: ['personal'], category: 'Ops', date: '10/02/2023' }
              ]
            }
          ];
          resolve(mockData);
        }
      }, 600);
    });
  },

  saveData: async (data) => {
    return new Promise((resolve) => {
      localStorage.setItem('ff_organizer_data', JSON.stringify(data));
      resolve(true);
    });
  }
};

// ----------------------------------------------------------------------------------
// --- COMPONENTE PRINCIPAL (App) ---
// ----------------------------------------------------------------------------------
const App = () => {
  // --- Estados ---
  const [data, setData] = useState([]);
  const [sharedData, setSharedData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [justDroppedId, setJustDroppedId] = useState(null); // ATHENA FIX: Feedback visual

  // PreferÃªncias
  const [preferences, setPreferences] = useState({ defaultView: 'sequential' });
  // UsuÃ¡rio - MOCK INICIAL (Natasha Master Admin)
  const [currentUser, setCurrentUser] = useState({ name: 'Natasha (ENTJ)', role: 'master', keyId: 'admin-key-001', avatar: null });
  // MOCK da Master Key (Para fins de demonstraÃ§Ã£o)
  const MASTER_KEY = 'master-admin-key-001';

  // ATHENA FIX V17: Chaves de Acesso Geradas (Nome, Chave, Status)
  const [generatedKeys, setGeneratedKeys] = useState([
    { id: 'master', userName: 'Natasha (Admin)', key: MASTER_KEY, active: true }
  ]);

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedSubfolder, setSelectedSubfolder] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [activeView, setActiveView] = useState(preferences.defaultView);
  const [lastMainView, setLastMainView] = useState(preferences.defaultView);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [sequentialPath, setSequentialPath] = useState([]);
  const [slideDirection, setSlideDirection] = useState('none');
  const [draggedItemId, setDraggedItemId] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isFullEditMode, setIsFullEditMode] = useState(false);
  const [isImportMode, setIsImportMode] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPromptViewerOpen, setIsPromptViewerOpen] = useState(false);
  // ATHENA FIX V16: Novo estado para modal de Login/Troca de Persona
  const [isMasterLoginOpen, setIsMasterLoginOpen] = useState(false);

  const backupInputRef = useRef(null);

  const [moveSelector, setMoveSelector] = useState({
    open: false,
    draggedId: null,
    draggedType: null, // 'folder' | 'prompt'
    availableTargets: []
  });

  // ATHENA FIX V13: DEFINIÃ‡ÃƒO DE activeViewConfig RESTAURADA
  const activeViewConfig = VIEWS.find(v => v.id === activeView) || VIEWS[0];

  // EFEITO DEDICADO - Limpa feedback automaticamente (COM LOG DE DIAGNÃ“STICO E PRECISÃƒO)
  // ATHENA FIX V5: Feedback visual com fallback de seguranÃ§a + logs
  useEffect(() => {
    if (justDroppedId !== null) {
      const timer = setTimeout(() => {
        setJustDroppedId(null);
      }, 300); // Aumentado de 200ms para 300ms para dar tempo ao DOM

      // FALLBACK: SeguranÃ§a absoluta - limpa em 1.5s se algo falhar
      const fallbackTimer = setTimeout(() => {
        setJustDroppedId(null);
      }, 1500);

      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      }
    }
  }, [justDroppedId]); // Reage apenas a mudanÃ§as em justDroppedId

  // --- Handlers e Helpers ---
  const showToast = (message, type = 'error') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };
  const unreadNotifications = notifications.filter(n => !n.read).length; // ATHENA FIX V16: Moveu para o topo do App
  const handleMarkAllRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); showToast("Todas as notificaÃ§Ãµes marcadas como lidas.", "success"); };
  const handleClearHistory = () => { if (window.confirm("Confirma limpeza de histÃ³rico?")) { setNotifications([]); showToast("HistÃ³rico limpo.", "success"); } };

  // ATHENA FIX V17: Gerenciamento de Chaves
  const handleGenerateKey = (userName) => {
    const newKey = generateUniqueId();
    const newKeyItem = { id: Date.now().toString(), userName, key: newKey, active: true };
    setGeneratedKeys(prev => [...prev, newKeyItem]);
    showToast(`Chave gerada para ${userName}: ${newKey}`, "success");
  };

  const handleRevokeKey = (keyId) => {
    setGeneratedKeys(prev => prev.map(k => k.id === keyId ? { ...k, active: false } : k));
    showToast("Chave revogada. O acesso foi cancelado.", "error");
  };

  // ATHENA FIX V16: Handler para login/troca de persona
  const handleUserLogin = (userName, accessKey) => {
    // Usado pelo MasterKeyGenerator para login do usuÃ¡rio (nÃ£o admin)
    setCurrentUser({
      name: userName,
      role: 'user',
      keyId: accessKey, // Armazena a chave de acesso do amigo
      avatar: null
    });
    showToast(`Bem-vinda, ${userName}. SessÃ£o iniciada como UsuÃ¡rio PadrÃ£o.`, "success");
  };

  // ATHENA FIX V12: LÃ³gica de Clique em NotificaÃ§Ã£o (TransferÃªncia Direta)
  const handleNotificationClick = (notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setIsNotificationsOpen(false);

    if (notification.type === 'transfer' && currentUser.role === 'master' && notification.payload) {
      setItemToEdit(notification.payload);
      setIsFullEditMode(false);
      setIsImportMode(true); // ATIVA O MODO ALFÃ‚NDEGA
      setIsEditModalOpen(true);
    } else if (notification.type === 'share') {
      setActiveView('shared');
    }
  };

  const handleUpdatePreferences = (newPrefs) => { setPreferences(prev => ({ ...prev, defaultView: newPrefs.defaultView })); setCurrentUser(prev => ({ ...prev, avatar: newPrefs.avatar })); if (activeView !== 'shared') { setActiveView(newPrefs.defaultView); setLastMainView(newPrefs.defaultView); } showToast("PreferÃªncias salvas.", "success"); };
  const handleSelectPrompt = useCallback((prompt) => { setSelectedPrompt(prompt); }, []);

  // --- INJEÃ‡ÃƒO DE DADOS (VIA DATA SERVICE) ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const loadedData = await DataService.fetchData();
        setData(loadedData);

        // Mock Shared Data (Keep local for now or move to service later)
        const mockShared = [
          { id: 's1', name: 'Design Assets Q3', type: 'folder', emoji: 'ðŸŽ¨', owner: { name: 'Ana Silva', initials: 'AS', color: 'bg-purple-500' }, permission: 'view', date: '2h atrÃ¡s', itemsCount: 15, isShared: true },
          { id: 's2', name: 'RelatÃ³rio Financeiro', type: 'prompt', emoji: 'ðŸ“Š', owner: { name: 'Carlos Mendes', initials: 'CM', color: 'bg-emerald-500' }, permission: 'view', date: 'Ontem', content: 'AnÃ¡lise...', isShared: true }
        ];
        setSharedData(mockShared);
        // setNotifications(initialNotifications); // Assuming initialNotifications is defined globally or I need to define it
      } catch (error) {
        console.error("Failed to load data", error);
        showToast("Erro ao carregar dados.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Centralized Save Function
  const saveToBackend = async (newData) => {
    setData(newData);
    // Fire and forget for now, or await if critical
    await DataService.saveData(newData);
  };

  // --- NavegaÃ§Ã£o e ManipulaÃ§Ã£o ---
  const handleFolderClick = (folder) => {
    if (activeView === 'sequential') { setSlideDirection('left'); setSequentialPath(prev => [...prev, folder.id]); } else { if (selectedFolder?.id === folder.id) return; setSelectedFolder(folder); setSelectedSubfolder(null); setSelectedPrompt(null); }
  };
  const handleSubfolderClick = (subfolder) => { if (activeView === 'sequential') { setSlideDirection('left'); setSequentialPath(prev => [...prev, subfolder.id]); } else { setSelectedSubfolder(subfolder); setSelectedPrompt(null); } };

  const handlePromptClick = (prompt) => {
    handleSelectPrompt(prompt);
    setIsPromptViewerOpen(true);
  };

  const goBackSequential = () => { setSlideDirection('right'); setSequentialPath(prev => prev.slice(0, -1)); };
  const switchView = (viewId) => { setActiveView(viewId); if (viewId !== 'shared') { setLastMainView(viewId); } if (viewId === 'sequential') { setSequentialPath([]); } setIsViewMenuOpen(false); };

  // ATHENA FIX V14: O botÃ£o "Meus Arquivos" agora forÃ§a o retorno Ã  RAÃZ (zera o path)
  const goToMyFiles = () => {
    setActiveView(preferences.defaultView);
    setSequentialPath([]);
  };

  const handleEditItem = (e, item, fullEdit = false) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setItemToEdit(item);
    setIsFullEditMode(fullEdit);
    setIsImportMode(false); // Garante que nÃ£o Ã© import
    setIsEditModalOpen(true);
  };

  // ATHENA PROTOCOL: FIND ITEM UTILS (Mantido)
  const findItem = (items, id) => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // âœ… ATHENA FIX: ValidaÃ§Ã£o de Descendentes (RESTAURADO)
  const isDescendant = (parentId, childId, items) => {
    const parent = findItem(items, parentId);
    if (!parent || !parent.children) return false;

    const checkChildren = (children) => {
      for (const child of children) {
        if (child.id === childId) return true;
        if (child.children && checkChildren(child.children)) return true;
      }
      return false;
    };

    return checkChildren(parent.children);
  };

  const getValidMoveTargets = (allItems, draggedId, itemType) => {
    const targets = [];

    const traverseCorrect = (items) => {
      for (const item of items) {
        if (item.id === draggedId) continue; // Pula o item arrastado E seus filhos (pois nÃ£o chama traverse recursivo)

        if (item.type === 'folder') {
          targets.push(item);
          if (item.children) traverseCorrect(item.children);
        }
      }
    }

    traverseCorrect(allItems);
    return targets;
  };

  // ATHENA PROTOCOL: MOVE ENGINE FLATTENING (Mantido)
  const moveItemFlattening = (draggedId, targetFolderId) => {
    // ... (LÃ³gica de movimento mantida)
    const newItems = JSON.parse(JSON.stringify(data));
    let draggedItem = null;
    const extractRecursive = (items) => {
      const idx = items.findIndex(i => i.id === draggedId);
      if (idx !== -1) {
        draggedItem = items[idx];
        items.splice(idx, 1);
        return true;
      }
      for (const item of items) {
        if (item.children && extractRecursive(item.children)) return true;
      }
      return false;
    };
    extractRecursive(newItems);
    if (!draggedItem) return;
    const itemsToReparent = draggedItem.children || [];
    draggedItem.children = [];
    if (!targetFolderId || targetFolderId === 'root') {
      newItems.unshift(draggedItem, ...itemsToReparent);
    } else {
      const insertInTarget = (items) => {
        for (const item of items) {
          if (item.id === targetFolderId) {
            if (!item.children) item.children = [];
            item.children.unshift(draggedItem, ...itemsToReparent);
            return true;
          }
          if (item.children && insertInTarget(item.children)) return true;
        }
        return false;
      };
      insertInTarget(newItems);
    }
    saveToBackend(newItems);
    setSelectedFolder(null);
    setSelectedSubfolder(null);
    setSelectedPrompt(null);
    requestAnimationFrame(() => { requestAnimationFrame(() => { setJustDroppedId(draggedId); }); });
    const movedCount = 1 + itemsToReparent.length;
    showToast(`${movedCount} item${movedCount > 1 ? 's' : ''} movidos para ${targetFolderId === 'root' ? 'Raiz' : 'destino'}.`, "success");
  };

  // ATHENA UPDATE: HANDLERS DE COLUNA (RESTAURADA VALIDAÃ‡ÃƒO CIRCULAR)
  const handleColumnDragOver = (e) => { if (isLocked) return; e.preventDefault(); e.stopPropagation(); };

  const handleColumnDrop = (e, columnType) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId) return;

    // âœ… NOVO: Verifica se estÃ¡ dropando em uma coluna que representa o prÃ³prio item ou seus filhos
    const draggedItem = findItem(data, draggedId);
    if (!draggedItem) return;

    // âœ… VALIDAÃ‡ÃƒO CRÃTICA: Impede drop da pasta na coluna que mostra seus prÃ³prios filhos
    if (draggedItem.type === 'folder') {
      // Se a pasta arrastada Ã‰ a pasta selecionada na primeira coluna
      if (columnType === 'subfolder' && selectedFolder?.id === draggedId) {
        showToast("âŒ NÃ£o Ã© possÃ­vel mover uma pasta para dentro de si mesma.", "error");
        setDraggedItemId(null);
        return;
      }

      // Se a pasta arrastada Ã‰ a subpasta selecionada na segunda coluna
      if (columnType === 'prompt' && selectedSubfolder?.id === draggedId) {
        showToast("âŒ NÃ£o Ã© possÃ­vel mover uma pasta para dentro de si mesma.", "error");
        setDraggedItemId(null);
        return;
      }

      // âœ… VALIDAÃ‡ÃƒO EXTRA: Verifica se a pasta de destino Ã© descendente da pasta arrastada
      if (selectedFolder && isDescendant(draggedId, selectedFolder.id, data)) {
        showToast("âŒ NÃ£o Ã© possÃ­vel mover uma pasta para dentro de seus prÃ³prios filhos.", "error");
        setDraggedItemId(null);
        return;
      }

      if (selectedSubfolder && isDescendant(draggedId, selectedSubfolder.id, data)) {
        showToast("âŒ NÃ£o Ã© possÃ­vel mover uma pasta para dentro de seus prÃ³prios filhos.", "error");
        setDraggedItemId(null);
        return;
      }
    }

    // âœ… Se o drop foi NO CONTAINER (espaÃ§o vazio)
    const isDropOnContainer = !e.target.closest('[data-item-id]');

    if (isDropOnContainer) {
      const validTargets = getValidMoveTargets(data, draggedId, draggedItem.type);

      setMoveSelector({
        open: true,
        draggedId: draggedId,
        draggedType: draggedItem.type,
        availableTargets: validTargets
      });
    }

    setDraggedItemId(null);
  };


  // ATHENA FIX V12: UPDATE SAVING LOGIC (Suporte a Ãrvore de Filhos na TransferÃªncia)
  const handleSaveNewName = (itemId, newName, newEmoji, newParentId, newContent, newCategory, newTags, isImportOp) => {
    if (isImportOp) {
      // ... (LÃ³gica de ImportaÃ§Ã£o mantida)
      const newItem = { id: `imported-pack-${Date.now()}`, name: newName, emoji: newEmoji, type: 'folder', children: itemToEdit.children || [], date: new Date().toLocaleDateString('pt-BR') };
      setData(prevData => { const newData = JSON.parse(JSON.stringify(prevData)); if (!newParentId || newParentId === 'root') { newData.unshift(newItem); } else { const addToTarget = (items) => { for (const item of items) { if (item.id === newParentId) { if (!item.children) item.children = []; item.children.unshift(newItem); return true; } if (item.children && addToTarget(item.children)) return true; } return false; }; addToTarget(newData); } saveToBackend(newData); return newData; });
      showToast("TransferÃªncia recebida e aprovada.", "success");
      return;
    }

    // --- LOGICA DE EDIÃ‡ÃƒO NORMAL --- (Mantida)
    const isShared = sharedData.some(i => i.id === itemId);
    if (isShared) { setSharedData(prev => prev.map(item => item.id === itemId ? { ...item, name: newName, emoji: newEmoji } : item)); showToast(`Item atualizado`, "success"); return; }

    setData(prevData => { const updateRecursive = (items) => { return items.map(item => { if (item.id === itemId) { return { ...item, name: newName, emoji: newEmoji, content: newContent !== undefined ? newContent : item.content, category: newCategory !== undefined ? newCategory : item.category, tags: newTags !== undefined ? newTags : item.tags }; } if (item.children) return { ...item, children: updateRecursive(item.children) }; return item; }); }; const updated = updateRecursive(prevData); saveToBackend(updated); return updated; });
    if (newParentId !== undefined && newParentId !== '' && newParentId !== null) { moveItemFlattening(itemId, newParentId); } else { showToast("Atualizado", "success"); }
  };

  const handleDragStart = (e, item) => {
    if (isLocked) {
      showToast("Bloqueado.", "error");
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedItemId(item.id);

    // Custom Ghost Element
    const ghost = document.createElement('div');
    ghost.style.padding = '12px 24px';
    ghost.style.background = '#2979ff';
    ghost.style.color = 'white';
    ghost.style.borderRadius = '8px';
    ghost.style.fontWeight = 'bold';
    ghost.style.boxShadow = '0 10px 25px rgba(41, 121, 255, 0.4)';
    ghost.style.zIndex = '9999';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.innerText = item.name;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);

    e.stopPropagation();
  };

  const handleDragOver = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const target = e.currentTarget;
    target.classList.add(
      'drag-over-active',
      'ring-2',
      'ring-[#2979ff]',
      'ring-offset-2',
      'ring-offset-[#0f111a]',
      'bg-[#2979ff]/5',
      'scale-[1.01]'
    );
  };

  const handleDragLeave = (e) => {
    if (isLocked) return;
    const target = e.currentTarget;
    target.classList.remove(
      'drag-over-active',
      'ring-2',
      'ring-[#2979ff]',
      'ring-offset-2',
      'ring-offset-[#0f111a]',
      'bg-[#2979ff]/5',
      'scale-[1.01]'
    );
  };

  // âœ… ATHENA FIX: handleDrop com ValidaÃ§Ã£o Circular (RESTAURADO)
  const handleDrop = (e, targetItem) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();

    // Cleanup visual feedback
    const target = e.currentTarget;
    target.classList.remove(
      'drag-over-active',
      'ring-2',
      'ring-[#2979ff]',
      'ring-offset-2',
      'ring-offset-[#0f111a]',
      'bg-[#2979ff]/5',
      'scale-[1.01]'
    );

    if (draggedItemId === targetItem.id) {
      setDraggedItemId(null);
      return;
    }

    // âœ… VALIDAÃ‡ÃƒO: Impede drop de pasta em si mesma ou em seus descendentes
    if (targetItem.type === 'folder') {
      const draggedItem = findItem(data, draggedItemId);

      if (draggedItem?.type === 'folder') {
        // Verifica se estÃ¡ tentando dropar na prÃ³pria pasta
        if (draggedItemId === targetItem.id) {
          showToast("âŒ NÃ£o Ã© possÃ­vel mover uma pasta para si mesma.", "error");
          setDraggedItemId(null);
          return;
        }

        // Verifica se o alvo Ã© descendente da pasta arrastada
        if (isDescendant(draggedItemId, targetItem.id, data)) {
          showToast("âŒ NÃ£o Ã© possÃ­vel mover uma pasta para dentro de seus prÃ³prios filhos.", "error");
          setDraggedItemId(null);
          return;
        }
      }

      moveItemFlattening(draggedItemId, targetItem.id);
    } else {
      showToast("Solte sobre uma pasta para mover.", "info");
    }

    setDraggedItemId(null);
  };

  const handleNewSubfolder = () => { if (!selectedFolder) { showToast("Selecione raiz.", "error"); return; } showToast("Criar (SimulaÃ§Ã£o)", "success"); };
  const handleNewPrompt = () => { if (!selectedFolder && !selectedSubfolder) { showToast("Selecione destino.", "error"); return; } showToast("Criar Prompt (SimulaÃ§Ã£o)", "success"); };
  const handleNewFolderSequential = () => { showToast(`Criar Pasta (SimulaÃ§Ã£o)`, "success"); }
  const toggleLock = () => { setIsLocked(!isLocked); showToast(isLocked ? "Desbloqueado" : "Bloqueado", "info"); };
  const handleSendFolder = () => showToast("Enviar (SimulaÃ§Ã£o)", "success");
  const handleGenerateLink = () => showToast("Link copiado!", "success");

  // ATHENA FIX V16: Master Access Handler (Abre Modal de Login)
  const handleMasterAccess = () => {
    setIsMasterLoginOpen(true);
  };

  const renderItemIcon = (item, defaultIcon, className) => {
    if (item.emoji) return <span className="text-lg leading-none">{item.emoji}</span>;
    const Icon = defaultIcon;
    return <Icon size={16} className={className} />;
  }

  const getCurrentSequentialNodes = useCallback(() => {
    let currentNodes = data;
    let currentItem = null;
    let title = "Pastas Principais";
    for (const id of sequentialPath) {
      currentItem = currentNodes.find(node => node.id === id);
      if (currentItem && currentItem.children) {
        currentNodes = currentItem.children;
        title = currentItem.name;
      } else {
        return { nodes: [], item: null, title: "Erro" };
      }
    }
    const nextLevelNodes = currentNodes.filter(child => child.type === 'folder' || child.type === 'prompt');
    return { nodes: nextLevelNodes, item: currentItem, title };
  }, [data, sequentialPath]);

  const { nodes: sequentialNodes, title: sequentialTitle } = getCurrentSequentialNodes();

  useEffect(() => {
    if (slideDirection !== 'none') {
      const timer = setTimeout(() => setSlideDirection('none'), 300);
      return () => clearTimeout(timer);
    }
  }, [sequentialPath]);

  // ATHENA FIX V18: Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F or Cmd+F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
          showToast("Busca rápida ativada", "info");
        }
      }

      // Esc to close modals (Global fallback)
      if (e.key === 'Escape') {
        if (isEditModalOpen) setIsEditModalOpen(false);
        if (isPromptViewerOpen) setIsPromptViewerOpen(false);
        if (isSettingsModalOpen) setIsSettingsModalOpen(false);
        if (isHistoryOpen) setIsHistoryOpen(false);
        if (isNotificationsOpen) setIsNotificationsOpen(false);
        if (isMasterLoginOpen) setIsMasterLoginOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditModalOpen, isPromptViewerOpen, isSettingsModalOpen, isHistoryOpen, isNotificationsOpen, isMasterLoginOpen]);

  // DefiniÃ§Ã£o das colunas/prompts para Miller View
  const rootFolders = data;
  const subFolders = selectedFolder ? (selectedFolder.children || []).filter(i => i.type === 'folder') : [];
  const prompts = selectedSubfolder ? (selectedSubfolder.children || []).filter(i => i.type === 'prompt') : selectedFolder ? (selectedFolder.children || []).filter(i => i.type === 'prompt') : [];
  const actionButtonStyle = "w-full flex items-center justify-center gap-2 bg-[#2979ff] hover:bg-[#2264d1] text-white py-2 rounded-md text-xs font-bold transition-all duration-150 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 cursor-pointer active:scale-[0.98] whitespace-nowrap select-none";

  return (
    <div className="flex flex-col h-screen bg-[#0f111a] text-gray-300 font-sans overflow-hidden selection:bg-[#2979ff]/30 selection:text-white relative antialiased">
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a3040; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #3e4559; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a3040; border-radius: 2px; }
        .text-gray-700 { color: #52525B; }
        
        /* ============================================
           ANIMAÇÕES CONTEXTUAIS APRIMORADAS
           ============================================ */
        
        /* Entrada de Cards */
        @keyframes slideUpFade {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
            filter: blur(4px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
            filter: blur(0);
          }
        }
        .animate-slide-up-fade {
          animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Entrada de Modais */
        @keyframes modalBounceIn {
          0% { 
            opacity: 0; 
            transform: scale(0.9) translateY(30px); 
          }
          60% { 
            opacity: 1; 
            transform: scale(1.02) translateY(-5px); 
          }
          100% { 
            transform: scale(1) translateY(0); 
          }
        }
        .animate-modal-bounce {
          animation: modalBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        /* Pulsação de Sucesso */
        @keyframes successPulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); 
          }
          50% { 
            transform: scale(1.03); 
            box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); 
          }
        }
        .animate-success-pulse {
          animation: successPulse 0.6s cubic-bezier(0.4, 0, 0.6, 1);
        }
        
        /* Shimmer */
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.05) 50%,
            rgba(255,255,255,0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        /* Shake */
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-error-shake {
          animation: errorShake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
      `}</style>

      {/* ATHENA FIX V11: Input de arquivo oculto para backup */}
      <input
        type="file"
        ref={backupInputRef}
        onChange={() => { }}
        className="hidden"
        accept=".json"
      />

      {/* --- Header --- */}
      <header className="h-14 bg-[#1e2330] border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-20 relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2979ff] to-[#1e2330] rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Layers size={18} className="text-white" />
            </div>
            <span className="hidden sm:inline">FF Organizer</span>
          </div>

          {/* Search Bar */}
          <div className="relative group hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#2979ff] transition-colors" />
            <input
              id="search-input"
              type="text"
              placeholder="Buscar (Ctrl+F)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 bg-[#0f111a] border border-white/10 rounded-lg pl-9 pr-3 text-xs text-gray-300 focus:outline-none focus:border-[#2979ff] focus:w-80 transition-all placeholder-gray-600"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
              <span className="text-[10px] font-mono text-gray-600 border border-white/5 px-1 rounded bg-white/5">Ctrl</span>
              <span className="text-[10px] font-mono text-gray-600 border border-white/5 px-1 rounded bg-white/5">F</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0f111a] p-1 rounded-lg border border-white/5 mr-2">
            <button
              onClick={() => switchView('sequential')}
              className={`p-1.5 rounded transition-all relative group ${activeView === 'sequential' ? 'bg-[#2979ff] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              title="Visão Sequencial"
            >
              <LayoutList size={16} />
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">Sequencial</span>
            </button>
            <button
              onClick={() => switchView('miller')}
              className={`p-1.5 rounded transition-all relative group ${activeView === 'miller' ? 'bg-[#2979ff] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              title="Visão de Colunas"
            >
              <Columns size={16} />
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">Colunas</span>
            </button>
            <button
              onClick={() => switchView('mindmap')}
              className={`p-1.5 rounded transition-all relative group ${activeView === 'mindmap' ? 'bg-[#2979ff] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              title="Mapa Mental (Beta)"
            >
              <Network size={16} />
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">Mapa Mental</span>
            </button>
          </div>

          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative group"
            title="Notificações"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1e2330]"></span>
            )}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">Notificações</span>
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative group"
            title="Histórico"
          >
            <History size={18} />
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">Histórico</span>
          </button>

          <div className="h-6 w-px bg-white/10 mx-1"></div>

          <ProfileDropdown
            currentUser={currentUser}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenMasterLogin={handleMasterAccess}
            unreadCount={unreadNotifications}
          />
        </div>
      </header>

      {/* --- Modals --- */}
      <MasterKeyGenerator
        isOpen={isMasterLoginOpen}
        onClose={() => setIsMasterLoginOpen(false)}
        onLogin={handleUserLogin}
        onLogoutMaster={() => setCurrentUser({ name: 'Natasha (ENTJ)', role: 'master', keyId: MASTER_KEY, avatar: null })}
        onGenerateKey={handleGenerateKey}
        onRevokeKey={handleRevokeKey}
        generatedKeys={generatedKeys}
        masterKey={MASTER_KEY}
      />
      <EditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} item={itemToEdit} onSave={handleSaveNewName} allFolders={data} isFullEdit={isFullEditMode} isImport={isImportMode} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} preferences={preferences} onUpdatePreferences={handleUpdatePreferences} currentUser={currentUser} />

      <div className="flex-1 bg-[#0f111a] overflow-hidden relative">
        <div key={activeView} className="w-full h-full animate-enter-view">
          {activeView === 'sequential' && (
            <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-8">
                {sequentialPath.length > 0 && (
                  <button onClick={goBackSequential} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all hover:-translate-x-1">
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    {sequentialPath.length === 0 ? <Home size={28} className="text-[#2979ff]" /> : <FolderOpen size={28} className="text-[#2979ff]" />}
                    {sequentialTitle}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {sequentialNodes.length} itens disponÃ­veis
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sequentialNodes.map((node, index) => (
                  <div
                    key={node.id}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        node.type === 'folder' ? handleFolderClick(node) : handlePromptClick(node);
                      }
                    }}
                    draggable={!isLocked}
                    onDragStart={(e) => handleDragStart(e, node)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, node)}
                    onClick={() => node.type === 'folder' ? handleFolderClick(node) : handlePromptClick(node)}
                    className={`
                        group relative flex flex-col justify-between min-h-[160px] w-fit min-w-[260px] max-w-[280px] shrink-0
                        rounded-xl border-l-[6px] border-y border-r px-3.5 py-3 cursor-pointer transition-all duration-200 
                        shadow-xl shadow-black/20 hover:scale-[1.01]
                        ${node.type === 'folder'
                        ? 'bg-gradient-to-br from-[#2979ff]/8 via-[#2979ff]/3 to-transparent border-l-[#2979ff] border-y-[#2979ff]/20 border-r-[#2979ff]/20 hover:shadow-[0_0_30px_rgba(41,121,255,0.15)]'
                        : 'bg-gradient-to-br from-[#10b981]/8 via-[#10b981]/3 to-transparent border-l-[#10b981] border-y-[#10b981]/20 border-r-[#10b981]/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                      }
                        ${!isLocked ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}
                        ${draggedItemId === node.id ? 'opacity-40 scale-95 border-dashed' : ''}
                        ${justDroppedId === node.id ? 'animate-success-pulse' : ''}
                        animate-slide-up-fade
                      `}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110 ${node.type === 'folder' ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-[#2979ff]' : 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-400'}`}>
                        {renderItemIcon(node, node.type === 'folder' ? Folder : FileText, "")}
                      </div>
                    </div>

                    <h3 className="text-white font-bold text-base mb-1 truncate pr-2">{node.name}</h3>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <span>{node.date || 'Hoje'}</span>
                      {node.type === 'folder' && node.children && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                          <span>{node.children.length} itens</span>
                        </>
                      )}
                    </div>

                    {node.type === 'prompt' && node.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {node.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                            {tag}
                          </span>
                        ))}
                        {node.tags.length > 2 && <span className="text-[10px] text-gray-400">+{node.tags.length - 2}</span>}
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-white/5 mt-auto">
                      <Tooltip content={`Editar ${node.type}`} position="top">
                        <button
                          onClick={(e) => handleEditItem(e, node)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2979ff] hover:bg-[#2264d1] text-white rounded-lg transition-all text-xs font-bold shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 active:scale-95"
                        >
                          <Edit2 size={12} /> EDITAR
                        </button>
                      </Tooltip>

                      <Tooltip content="Compartilhar" position="top">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast(`Compartilhando "${node.name}"...`, "success");
                          }}
                          className="p-2 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all border border-white/10 hover:border-white/20 active:scale-95 group"
                        >
                          <Share2 size={14} className="group-hover:rotate-12 transition-transform" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))
                }
                {sequentialNodes.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02] animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <FolderOpen size={32} className="opacity-40" />
                    </div>
                    <p className="text-sm font-bold text-gray-300">Esta pasta está vazia</p>
                    <p className="text-xs mt-1 text-gray-500">Comece criando uma nova pasta ou prompt.</p>
                  </div>
                )}

                {/* BotÃµes de CriaÃ§Ã£o (Fake) */}
                <button onClick={handleNewFolderSequential} className="flex flex-col items-center justify-center gap-3 bg-[#1e2330]/30 border border-dashed border-white/10 hover:border-[#2979ff]/50 hover:bg-[#2979ff]/5 rounded-xl p-5 cursor-pointer transition-all group animate-slide-up-fade" style={{ animationDelay: `${sequentialNodes.length * 50}ms` }}>
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#2979ff] group-hover:scale-110 transition-all">
                    <Plus size={24} />
                  </div>
                  <span className="text-sm font-medium text-gray-400 group-hover:text-[#2979ff]">Nova Pasta</span>
                </button>
              </div >
            </div >
          )}

          {
            activeView === 'miller' && (
              <div className="flex h-full divide-x divide-white/5 overflow-x-auto">
                <div className="min-w-[300px] max-w-[300px] flex flex-col bg-[#0f111a]" onDragOver={handleColumnDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleColumnDrop(e, 'root')}>
                  <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#13161c]">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Folder size={14} /> Pastas</span>
                    <button onClick={handleNewSubfolder} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Nova Pasta"><Plus size={14} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {rootFolders.map(folder => (
                      <div
                        key={folder.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, folder)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, folder)}
                        onClick={() => handleFolderClick(folder)}
                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${selectedFolder?.id === folder.id ? 'bg-[#2979ff]/10 border-[#2979ff]/30' : 'bg-[#1e2330] border-white/5 hover:border-white/20'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-lg">{folder.emoji || 'ðŸ“'}</span>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium truncate ${selectedFolder?.id === folder.id ? 'text-white' : 'text-gray-300'}`}>{folder.name}</p>
                            <p className="text-[10px] text-gray-400">{folder.children?.length || 0} itens</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className={`text-gray-400 ${selectedFolder?.id === folder.id ? 'text-[#2979ff]' : ''}`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coluna 2: Subpastas */}
                <div className="min-w-[300px] max-w-[300px] flex flex-col bg-[#0f111a]" onDragOver={handleColumnDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleColumnDrop(e, 'subfolder')}>
                  <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#13161c]">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><CornerDownRight size={14} /> Subpastas</span>
                    <button onClick={handleNewSubfolder} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Nova Subpasta"><Plus size={14} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-[#0f111a]/50">
                    {!selectedFolder ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500/50 p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                          <FolderOpen size={20} className="opacity-50" />
                        </div>
                        <p className="text-xs font-medium text-gray-400">Nenhuma pasta selecionada</p>
                        <p className="text-[10px] mt-1 opacity-60 max-w-[150px]">Selecione uma pasta raiz para ver o conteúdo.</p>
                      </div>
                    ) : subFolders.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500/50 p-4 text-center">
                        <p className="text-xs font-medium text-gray-400">Vazio</p>
                        <p className="text-[10px] mt-1 opacity-60">Sem subpastas aqui.</p>
                      </div>
                    ) : (
                      subFolders.map(sub => (
                        <div
                          key={sub.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, sub)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, sub)}
                          onClick={() => handleSubfolderClick(sub)}
                          className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${selectedSubfolder?.id === sub.id ? 'bg-[#2979ff]/10 border-[#2979ff]/30' : 'bg-[#1e2330] border-white/5 hover:border-white/20'}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-lg">{sub.emoji || 'ðŸ“‚'}</span>
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${selectedSubfolder?.id === sub.id ? 'text-white' : 'text-gray-300'}`}>{sub.name}</p>
                              <p className="text-[10px] text-gray-400">{sub.children?.length || 0} itens</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className={`text-gray-400 ${selectedSubfolder?.id === sub.id ? 'text-[#2979ff]' : ''}`} />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Coluna 3: Prompts */}
                <div className="flex-1 min-w-[350px] flex flex-col bg-[#13161c]" onDragOver={handleColumnDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleColumnDrop(e, 'prompt')}>
                  <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#181b24]">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Sparkles size={14} /> Prompts</span>
                    <button onClick={handleNewPrompt} className={actionButtonStyle} style={{ width: 'auto', padding: '4px 12px' }}><Plus size={14} /> Novo Prompt</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {!selectedFolder && !selectedSubfolder ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500/50 p-4 text-center">
                        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                          <Layout size={32} className="opacity-40" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">Nenhuma pasta selecionada</p>
                        <p className="text-xs mt-1 opacity-60 max-w-[200px]">Navegue pelas pastas para visualizar os prompts.</p>
                      </div>
                    ) : prompts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500/50 p-4 text-center">
                        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                          <FileText size={32} className="opacity-40" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">Nenhum prompt aqui</p>
                        <p className="text-xs mt-1 opacity-60 mb-4">Esta pasta está vazia.</p>
                        <button onClick={handleNewPrompt} className="px-4 py-2 bg-[#2979ff]/10 hover:bg-[#2979ff]/20 text-[#2979ff] rounded-lg text-xs font-bold transition-all">
                          Criar Novo Prompt
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {prompts.map(prompt => (
                          <div
                            key={prompt.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, prompt)}
                            onClick={() => handlePromptClick(prompt)}
                            className="group bg-[#1e2330] hover:bg-[#252b3b] border border-white/5 hover:border-[#2979ff]/30 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg flex flex-col gap-3 relative overflow-hidden"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2979ff]/10 to-purple-500/10 flex items-center justify-center text-xl">
                                  {prompt.emoji || 'ðŸ“„'}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white group-hover:text-[#2979ff] transition-colors line-clamp-1">{prompt.name}</h4>
                                  <span className="text-[10px] text-gray-400">{prompt.category || 'Geral'}</span>
                                </div>
                              </div>
                              <button onClick={(e) => handleEditItem(e, prompt)} className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={14} /></button>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed bg-[#0f111a]/50 p-2 rounded border border-white/5 font-mono">
                              {prompt.content}
                            </p>
                            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
                              {prompt.tags?.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[9px] uppercase font-bold text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">{tag}</span>
                              ))}
                              <span className="text-[9px] text-gray-400 ml-auto">{prompt.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          }

          {
            activeView === 'mindmap' && (
              <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto w-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Network size={24} className="text-[#2979ff]" /> Estrutura HierÃ¡rquica</h2>
                    <div className="flex gap-2">
                      <button className="p-2 bg-[#1e2330] hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Maximize2 size={16} /></button>
                      <button className="p-2 bg-[#1e2330] hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Filter size={16} /></button>
                    </div>
                  </div>
                  <div className="bg-[#1e2330] rounded-xl border border-white/10 p-6 shadow-2xl min-h-[500px]">
                    {data.map(node => (
                      <TreeViewNode key={node.id} node={node} onSelect={handlePromptClick} onEdit={handleEditItem} isLocked={isLocked} selectedPrompt={selectedPrompt} />
                    ))}
                  </div>
                </div>
              </div>
            )
          }

          {
            activeView === 'shared' && (
              <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3"><Users size={28} className="text-[#5b4eff]" /> Compartilhados Comigo</h2>
                    <p className="text-gray-400 text-sm mt-1">Arquivos recebidos da equipe.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sharedData.map((item, index) => (
                    <div key={item.id} className="bg-[#1e2330] border border-white/5 hover:border-[#5b4eff]/50 rounded-xl p-5 transition-all hover:shadow-xl group animate-slide-up-fade" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${item.owner.color} flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-[#0f111a]`}>{item.owner.initials}</div>
                          <div>
                            <p className="text-xs text-gray-400">De: <span className="text-white font-medium">{item.owner.name}</span></p>
                            <p className="text-[10px] text-gray-500">{item.date}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase bg-[#5b4eff]/10 text-[#5b4eff] px-2 py-1 rounded border border-[#5b4eff]/20">{item.permission}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{item.emoji}</span>
                        <h3 className="text-white font-bold text-lg truncate">{item.name}</h3>
                      </div>
                      {item.type === 'prompt' && <p className="text-xs text-gray-400 line-clamp-2 mb-4 bg-[#0f111a] p-2 rounded border border-white/5 font-mono">{item.content}</p>}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                        <button className="flex-1 py-2 bg-[#5b4eff] hover:bg-[#4a3ecc] text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-900/20">Abrir</button>
                        <button className="px-3 py-2 bg-[#1e2330] hover:bg-white/5 text-gray-300 rounded-lg border border-white/10 transition-colors"><Share2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </div >
      </div >
    </div >

  );
};

export default App;
