// ============================================================================
// PEX-OS PROMPT MANAGER - TYPE DEFINITIONS
// ATHENA Architecture | TypeScript Strict Mode
// ============================================================================

// --- CORE ENTITIES ---

export interface Prompt {
  id: string;
  name: string;
  type: 'prompt';
  emoji?: string;
  content: string;
  category?: string;
  tags?: string[];
  date: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Folder {
  id: string;
  name: string;
  type: 'folder';
  emoji?: string;
  children: (Folder | Prompt)[];
  isSystem?: boolean;
  isShared?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export type TreeNode = Folder | Prompt;

// --- USER & ACCESS CONTROL ---

export interface User {
  name: string;
  role: 'master' | 'user' | 'guest';
  keyId?: string;
  avatar?: string | null;
}

export interface AccessKey {
  id: string;
  userName: string;
  key: string;
  active: boolean;
  createdAt?: number;
}

// --- NOTIFICATIONS ---

export interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  type: 'transfer' | 'share' | 'system' | 'warning';
  payload?: any;
  read: boolean;
}

// --- SHARED ITEMS ---

export interface SharedItem {
  id: string;
  name: string;
  type: 'folder' | 'prompt';
  emoji?: string;
  owner: {
    name: string;
    initials: string;
    color: string;
  };
  permission: 'view' | 'edit' | 'admin';
  date: string;
  content?: string;
  itemsCount?: number;
  isShared: true;
}

// --- VIEW TYPES ---

export type ViewType = 'sequential' | 'miller' | 'mindmap' | 'shared';

export interface ViewConfig {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// --- PREFERENCES ---

export interface UserPreferences {
  defaultView: ViewType;
  theme?: 'dark' | 'light';
  compactMode?: boolean;
  showTags?: boolean;
}

// --- DRAG & DROP ---

export interface DragState {
  draggedItemId: string | null;
  draggedItemType: 'folder' | 'prompt' | null;
  dropTargetId: string | null;
}

export interface MoveSelector {
  open: boolean;
  draggedId: string | null;
  draggedType: 'folder' | 'prompt' | null;
  availableTargets: Folder[];
}

// --- MODAL STATES ---

export interface EditModalState {
  isOpen: boolean;
  item: TreeNode | null;
  isFullEdit: boolean;
  isImport: boolean;
}

// --- TOAST/NOTIFICATION ---

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// --- EMOJI CATEGORIES ---

export interface EmojiCategories {
  [category: string]: string[];
}

// --- API RESPONSE TYPES ---

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// --- STORE ACTIONS ---

export interface PromptManagerActions {
  // Data Management
  setData: (data: TreeNode[]) => void;
  addItem: (item: TreeNode, parentId?: string | null) => void;
  updateItem: (id: string, updates: Partial<TreeNode>) => void;
  deleteItem: (id: string) => void;
  moveItem: (itemId: string, targetFolderId: string | null) => void;
  
  // Selection
  setSelectedFolder: (folder: Folder | null) => void;
  setSelectedSubfolder: (folder: Folder | null) => void;
  setSelectedPrompt: (prompt: Prompt | null) => void;
  
  // Navigation
  setActiveView: (view: ViewType) => void;
  setSequentialPath: (path: string[]) => void;
  navigateToFolder: (folder: Folder) => void;
  goBack: () => void;
  
  // UI State
  setIsLocked: (locked: boolean) => void;
  setToast: (toast: Toast | null) => void;
  setDragState: (state: Partial<DragState>) => void;
  
  // Modals
  openEditModal: (item: TreeNode, fullEdit?: boolean, isImport?: boolean) => void;
  closeEditModal: () => void;
  
  // User
  setCurrentUser: (user: User) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  
  // Keys Management
  generateKey: (userName: string) => string;
  revokeKey: (keyId: string) => void;
}
