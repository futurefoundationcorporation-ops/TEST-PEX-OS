// ============================================================================
// PEX-OS PROMPT MANAGER - ZUSTAND STORE
// ATHENA Architecture | State Management
// ============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  TreeNode,
  Folder,
  Prompt,
  User,
  AccessKey,
  Notification,
  SharedItem,
  ViewType,
  UserPreferences,
  DragState,
  MoveSelector,
  EditModalState,
  Toast,
} from '@/types/prompt-manager';

// --- UTILITY FUNCTIONS ---

const generateUniqueId = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase() +
  '-' +
  Date.now().toString().substring(8);

const findItemById = (items: TreeNode[], id: string): TreeNode | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.type === 'folder' && item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

const removeItemById = (items: TreeNode[], id: string): TreeNode[] => {
  return items.filter((item) => {
    if (item.id === id) return false;
    if (item.type === 'folder' && item.children) {
      item.children = removeItemById(item.children, id);
    }
    return true;
  });
};

const addItemToFolder = (
  items: TreeNode[],
  parentId: string | null,
  newItem: TreeNode
): TreeNode[] => {
  if (!parentId) {
    return [newItem, ...items];
  }

  return items.map((item) => {
    if (item.id === parentId && item.type === 'folder') {
      return {
        ...item,
        children: [newItem, ...(item.children || [])],
      };
    }
    if (item.type === 'folder' && item.children) {
      return {
        ...item,
        children: addItemToFolder(item.children, parentId, newItem),
      };
    }
    return item;
  });
};

const updateItemInTree = (
  items: TreeNode[],
  id: string,
  updates: Partial<TreeNode>
): TreeNode[] => {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, ...updates, updatedAt: Date.now() };
    }
    if (item.type === 'folder' && item.children) {
      return {
        ...item,
        children: updateItemInTree(item.children, id, updates),
      };
    }
    return item;
  });
};

// --- INITIAL STATE ---

const initialMasterKey = 'MASTER-ADMIN-001';

const initialData: TreeNode[] = [
  {
    id: 'f1',
    name: 'Pastas Principais',
    type: 'folder',
    emoji: '🗂️',
    children: [
      {
        id: 'f1-1',
        name: 'System Prompts',
        type: 'folder',
        emoji: '⚙️',
        isSystem: true,
        children: [
          {
            id: 'p1',
            name: 'Prompt Base ENTJ',
            type: 'prompt',
            emoji: '🤖',
            content: 'Você é ATHENA, uma arquiteta ENTJ máxima...',
            tags: ['system', 'core'],
            category: 'System',
            date: new Date().toLocaleDateString('pt-BR'),
          },
          {
            id: 'p2',
            name: 'Coding Assistant',
            type: 'prompt',
            emoji: '👨‍💻',
            content: 'Expert React/TypeScript developer...',
            tags: ['dev', 'code'],
            category: 'Development',
            date: new Date().toLocaleDateString('pt-BR'),
          },
        ],
      },
      {
        id: 'f1-2',
        name: 'Marketing Campaigns',
        type: 'folder',
        emoji: '🚀',
        children: [],
      },
    ],
  },
  {
    id: 'f2',
    name: 'Personal Space',
    type: 'folder',
    emoji: '🔒',
    children: [
      {
        id: 'p3',
        name: 'Operational Logs',
        type: 'prompt',
        emoji: '🛡️',
        content: 'Daily operations log template...',
        tags: ['personal', 'logs'],
        category: 'Ops',
        date: new Date().toLocaleDateString('pt-BR'),
      },
    ],
  },
];

const initialUser: User = {
  name: 'Natasha (ENTJ)',
  role: 'master',
  keyId: initialMasterKey,
  avatar: null,
};

const initialPreferences: UserPreferences = {
  defaultView: 'sequential',
  theme: 'dark',
  compactMode: false,
  showTags: true,
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: 'Acesso Concedido',
    description: 'Ana Silva compartilhou "Design Assets".',
    time: '2 min',
    type: 'share',
    read: false,
  },
  {
    id: 2,
    title: 'Sistema',
    description: 'Backup automático realizado.',
    time: '3h',
    type: 'system',
    read: true,
  },
];

// --- STORE INTERFACE ---

interface PromptManagerState {
  // Data
  data: TreeNode[];
  sharedData: SharedItem[];
  
  // Selection State
  selectedFolder: Folder | null;
  selectedSubfolder: Folder | null;
  selectedPrompt: Prompt | null;
  
  // Navigation
  activeView: ViewType;
  lastMainView: ViewType;
  sequentialPath: string[];
  slideDirection: 'left' | 'right' | 'none';
  
  // UI State
  isLocked: boolean;
  isLoading: boolean;
  searchQuery: string;
  toast: Toast | null;
  
  // Drag & Drop
  dragState: DragState;
  moveSelector: MoveSelector;
  justDroppedId: string | null;
  
  // Modals
  editModal: EditModalState;
  isSettingsOpen: boolean;
  isNotificationsOpen: boolean;
  isHistoryOpen: boolean;
  isMasterLoginOpen: boolean;
  isPromptViewerOpen: boolean;
  
  // User
  currentUser: User;
  preferences: UserPreferences;
  
  // Notifications & Keys
  notifications: Notification[];
  generatedKeys: AccessKey[];
  masterKey: string;
  
  // Actions
  actions: {
    // Data Management
    setData: (data: TreeNode[]) => void;
    addItem: (item: TreeNode, parentId?: string | null) => void;
    updateItem: (id: string, updates: Partial<TreeNode>) => void;
    deleteItem: (id: string) => void;
    moveItem: (itemId: string, targetFolderId: string | null) => void;
    importPackage: (pkg: Folder, targetFolderId?: string | null) => void;
    
    // Selection
    setSelectedFolder: (folder: Folder | null) => void;
    setSelectedSubfolder: (folder: Folder | null) => void;
    setSelectedPrompt: (prompt: Prompt | null) => void;
    clearSelection: () => void;
    
    // Navigation
    setActiveView: (view: ViewType) => void;
    navigateToFolder: (folder: Folder) => void;
    navigateToIndex: (index: number) => void;
    goBack: () => void;
    goToRoot: () => void;
    
    // UI State
    setIsLocked: (locked: boolean) => void;
    setIsLoading: (loading: boolean) => void;
    setSearchQuery: (query: string) => void;
    showToast: (message: string, type: Toast['type']) => void;
    clearToast: () => void;
    setJustDroppedId: (id: string | null) => void;
    
    // Drag & Drop
    setDragState: (state: Partial<DragState>) => void;
    setMoveSelector: (selector: Partial<MoveSelector>) => void;
    closeMoveSelector: () => void;
    
    // Modals
    openEditModal: (item: TreeNode, fullEdit?: boolean, isImport?: boolean) => void;
    closeEditModal: () => void;
    setSettingsOpen: (open: boolean) => void;
    setNotificationsOpen: (open: boolean) => void;
    setHistoryOpen: (open: boolean) => void;
    setMasterLoginOpen: (open: boolean) => void;
    setPromptViewerOpen: (open: boolean) => void;
    
    // User
    setCurrentUser: (user: User) => void;
    updatePreferences: (prefs: Partial<UserPreferences>) => void;
    login: (userName: string, accessKey: string) => boolean;
    logout: () => void;
    
    // Notifications
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    markNotificationRead: (id: number) => void;
    markAllNotificationsRead: () => void;
    clearNotifications: () => void;
    
    // Keys Management
    generateKey: (userName: string) => string;
    revokeKey: (keyId: string) => void;
    validateKey: (key: string) => AccessKey | null;
    
    // Utilities
    findItem: (id: string) => TreeNode | null;
    getValidMoveTargets: (draggedId: string) => Folder[];
    isDescendant: (parentId: string, childId: string) => boolean;
    getCurrentSequentialNodes: () => { nodes: TreeNode[]; title: string; currentItem: TreeNode | null };
  };
}

// --- ZUSTAND STORE ---

export const usePromptManagerStore = create<PromptManagerState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        data: initialData,
        sharedData: [],
        selectedFolder: null,
        selectedSubfolder: null,
        selectedPrompt: null,
        activeView: 'sequential',
        lastMainView: 'sequential',
        sequentialPath: [],
        slideDirection: 'none',
        isLocked: true,
        isLoading: false,
        searchQuery: '',
        toast: null,
        dragState: {
          draggedItemId: null,
          draggedItemType: null,
          dropTargetId: null,
        },
        moveSelector: {
          open: false,
          draggedId: null,
          draggedType: null,
          availableTargets: [],
        },
        justDroppedId: null,
        editModal: {
          isOpen: false,
          item: null,
          isFullEdit: false,
          isImport: false,
        },
        isSettingsOpen: false,
        isNotificationsOpen: false,
        isHistoryOpen: false,
        isMasterLoginOpen: false,
        isPromptViewerOpen: false,
        currentUser: initialUser,
        preferences: initialPreferences,
        notifications: initialNotifications,
        generatedKeys: [
          { id: 'master', userName: 'Natasha (Admin)', key: initialMasterKey, active: true },
        ],
        masterKey: initialMasterKey,

        actions: {
          // Data Management
          setData: (data) => set({ data }),
          
          addItem: (item, parentId = null) =>
            set((state) => ({
              data: addItemToFolder(state.data, parentId, item),
            })),
          
          updateItem: (id, updates) =>
            set((state) => ({
              data: updateItemInTree(state.data, id, updates),
            })),
          
          deleteItem: (id) => {
            const state = get();
            const item = state.actions.findItem(id);
            const itemName = item?.name || 'Item';
            
            set((s) => ({
              data: removeItemById(s.data, id),
              selectedFolder: s.selectedFolder?.id === id ? null : s.selectedFolder,
              selectedSubfolder: s.selectedSubfolder?.id === id ? null : s.selectedSubfolder,
              selectedPrompt: s.selectedPrompt?.id === id ? null : s.selectedPrompt,
            }));
            
            state.actions.showToast(`"${itemName}" excluído!`, 'success');
          },
          
          clearSelection: () =>
            set({ selectedFolder: null, selectedSubfolder: null, selectedPrompt: null }),
          
          moveItem: (itemId, targetFolderId) => {
            const state = get();
            const item = state.actions.findItem(itemId);
            if (!item) return;

            // Validate circular reference
            if (item.type === 'folder' && targetFolderId) {
              if (state.actions.isDescendant(itemId, targetFolderId)) {
                state.actions.showToast('Não é possível mover uma pasta para dentro de si mesma.', 'error');
                return;
              }
            }

            set((state) => {
              let newData = removeItemById([...state.data], itemId);
              newData = addItemToFolder(newData, targetFolderId, item);
              return { data: newData, justDroppedId: itemId };
            });

            // Clear drop feedback
            setTimeout(() => set({ justDroppedId: null }), 300);
          },
          
          importPackage: (pkg, targetFolderId = null) => {
            const newPkg: Folder = {
              ...pkg,
              id: `imported-${Date.now()}`,
              date: new Date().toLocaleDateString('pt-BR'),
            };
            get().actions.addItem(newPkg, targetFolderId);
            get().actions.showToast('Pacote importado com sucesso!', 'success');
          },

          // Selection
          setSelectedFolder: (folder) =>
            set({ selectedFolder: folder, selectedSubfolder: null, selectedPrompt: null }),
          
          setSelectedSubfolder: (folder) =>
            set({ selectedSubfolder: folder, selectedPrompt: null }),
          
          setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),
          
          clearSelection: () =>
            set({ selectedFolder: null, selectedSubfolder: null, selectedPrompt: null }),

          // Navigation
          setActiveView: (view) =>
            set((state) => ({
              activeView: view,
              lastMainView: view !== 'shared' ? view : state.lastMainView,
              sequentialPath: view === 'sequential' ? [] : state.sequentialPath,
            })),
          
          navigateToFolder: (folder) =>
            set((state) => ({
              sequentialPath: [...state.sequentialPath, folder.id],
              slideDirection: 'left',
            })),
          
          navigateToIndex: (index) =>
            set((state) => ({
              sequentialPath: state.sequentialPath.slice(0, index + 1),
              slideDirection: 'right',
            })),
          
          goBack: () =>
            set((state) => ({
              sequentialPath: state.sequentialPath.slice(0, -1),
              slideDirection: 'right',
            })),
          
          goToRoot: () =>
            set({
              sequentialPath: [],
              slideDirection: 'right',
            }),

          // UI State
          setIsLocked: (locked) => {
            set({ isLocked: locked });
            get().actions.showToast(locked ? 'Bloqueado' : 'Desbloqueado', 'info');
          },
          
          setIsLoading: (loading) => set({ isLoading: loading }),
          
          setSearchQuery: (query) => set({ searchQuery: query }),
          
          showToast: (message, type) => {
            set({ toast: { message, type } });
            setTimeout(() => set({ toast: null }), 3000);
          },
          
          clearToast: () => set({ toast: null }),
          
          setJustDroppedId: (id) => set({ justDroppedId: id }),

          // Drag & Drop
          setDragState: (state) =>
            set((prev) => ({
              dragState: { ...prev.dragState, ...state },
            })),
          
          setMoveSelector: (selector) =>
            set((prev) => ({
              moveSelector: { ...prev.moveSelector, ...selector },
            })),
          
          closeMoveSelector: () =>
            set({
              moveSelector: {
                open: false,
                draggedId: null,
                draggedType: null,
                availableTargets: [],
              },
            }),

          // Modals
          openEditModal: (item, fullEdit = false, isImport = false) =>
            set({
              editModal: { isOpen: true, item, isFullEdit: fullEdit, isImport },
            }),
          
          closeEditModal: () =>
            set({
              editModal: { isOpen: false, item: null, isFullEdit: false, isImport: false },
            }),
          
          setSettingsOpen: (open) => set({ isSettingsOpen: open }),
          setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),
          setHistoryOpen: (open) => set({ isHistoryOpen: open }),
          setMasterLoginOpen: (open) => set({ isMasterLoginOpen: open }),
          setPromptViewerOpen: (open) => set({ isPromptViewerOpen: open }),

          // User
          setCurrentUser: (user) => set({ currentUser: user }),
          
          updatePreferences: (prefs) =>
            set((state) => ({
              preferences: { ...state.preferences, ...prefs },
            })),
          
          login: (userName, accessKey) => {
            const state = get();
            const keyMatch = state.generatedKeys.find(
              (k) => k.key === accessKey && k.userName === userName && k.active
            );
            
            if (accessKey === state.masterKey) {
              set({
                currentUser: { ...initialUser },
              });
              return true;
            }
            
            if (keyMatch) {
              set({
                currentUser: {
                  name: userName,
                  role: 'user',
                  keyId: accessKey,
                  avatar: null,
                },
              });
              get().actions.showToast(`Bem-vindo, ${userName}!`, 'success');
              return true;
            }
            
            return false;
          },
          
          logout: () => set({ currentUser: initialUser }),

          // Notifications
          addNotification: (notification) =>
            set((state) => ({
              notifications: [
                { ...notification, id: Date.now() },
                ...state.notifications,
              ],
            })),
          
          markNotificationRead: (id) =>
            set((state) => ({
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
            })),
          
          markAllNotificationsRead: () =>
            set((state) => ({
              notifications: state.notifications.map((n) => ({ ...n, read: true })),
            })),
          
          clearNotifications: () => set({ notifications: [] }),

          // Keys Management
          generateKey: (userName) => {
            const newKey = generateUniqueId();
            const newKeyItem: AccessKey = {
              id: Date.now().toString(),
              userName,
              key: newKey,
              active: true,
              createdAt: Date.now(),
            };
            set((state) => ({
              generatedKeys: [...state.generatedKeys, newKeyItem],
            }));
            get().actions.showToast(`Chave gerada para ${userName}`, 'success');
            return newKey;
          },
          
          revokeKey: (keyId) =>
            set((state) => ({
              generatedKeys: state.generatedKeys.map((k) =>
                k.id === keyId ? { ...k, active: false } : k
              ),
            })),
          
          validateKey: (key) => {
            const state = get();
            return state.generatedKeys.find((k) => k.key === key && k.active) || null;
          },

          // Utilities
          findItem: (id) => findItemById(get().data, id),
          
          getValidMoveTargets: (draggedId) => {
            const targets: Folder[] = [];
            const traverse = (items: TreeNode[]) => {
              for (const item of items) {
                if (item.id === draggedId) continue;
                if (item.type === 'folder') {
                  targets.push(item);
                  if (item.children) traverse(item.children);
                }
              }
            };
            traverse(get().data);
            return targets;
          },
          
          isDescendant: (parentId, childId) => {
            const parent = get().actions.findItem(parentId);
            if (!parent || parent.type !== 'folder') return false;

            const checkChildren = (children: TreeNode[]): boolean => {
              for (const child of children) {
                if (child.id === childId) return true;
                if (child.type === 'folder' && child.children) {
                  if (checkChildren(child.children)) return true;
                }
              }
              return false;
            };

            return checkChildren(parent.children || []);
          },
          
          getCurrentSequentialNodes: () => {
            const state = get();
            let currentNodes = state.data;
            let currentItem: TreeNode | null = null;
            let title = 'Pastas Principais';

            for (const id of state.sequentialPath) {
              const found = currentNodes.find((node) => node.id === id);
              if (found && found.type === 'folder' && found.children) {
                currentItem = found;
                currentNodes = found.children;
                title = found.name;
              } else {
                return { nodes: [], title: 'Erro', currentItem: null };
              }
            }

            return { nodes: currentNodes, title, currentItem };
          },
        },
      }),
      {
        name: 'pex-os-prompt-manager',
        partialize: (state) => ({
          data: state.data,
          preferences: state.preferences,
          generatedKeys: state.generatedKeys,
        }),
      }
    ),
    { name: 'PromptManager' }
  )
);

// Selector hooks for common use cases
export const usePromptData = () => usePromptManagerStore((s) => s.data);
export const useCurrentUser = () => usePromptManagerStore((s) => s.currentUser);
export const useActiveView = () => usePromptManagerStore((s) => s.activeView);
export const useSelectedPrompt = () => usePromptManagerStore((s) => s.selectedPrompt);
export const useIsLocked = () => usePromptManagerStore((s) => s.isLocked);
export const useActions = () => usePromptManagerStore((s) => s.actions);
