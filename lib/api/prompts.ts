// ============================================================================
// PEX-OS PROMPT MANAGER - API ADAPTERS
// ATHENA Architecture | Backend Readiness Layer
// ============================================================================

import type {
  TreeNode,
  Folder,
  Prompt,
  ApiResponse,
  PaginatedResponse,
} from '@/types/prompt-manager';

// --- CONFIGURATION ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const STORAGE_KEY = 'pex_os_prompt_data';

// --- LOCAL STORAGE FALLBACK (Development) ---

const LocalStorage = {
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('LocalStorage set error:', error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// --- API CLIENT ---

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      console.error('API request error:', error);
      return {
        data: null as T,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// --- DATA SERVICE ---

export const DataService = {
  /**
   * Fetch all prompt data
   * Uses localStorage as fallback for development
   */
  async fetchData(): Promise<TreeNode[]> {
    // Try API first
    const response = await apiClient.get<TreeNode[]>('/prompts');
    
    if (response.success && response.data) {
      return response.data;
    }

    // Fallback to localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const saved = LocalStorage.get<TreeNode[]>(STORAGE_KEY, []);
        resolve(saved);
      }, 300); // Simulate network delay
    });
  },

  /**
   * Save all prompt data
   */
  async saveData(data: TreeNode[]): Promise<boolean> {
    // Try API first
    const response = await apiClient.put<{ success: boolean }>('/prompts', { data });
    
    if (response.success) {
      return true;
    }

    // Fallback to localStorage
    LocalStorage.set(STORAGE_KEY, data);
    return true;
  },

  /**
   * Create a new folder
   */
  async createFolder(folder: Omit<Folder, 'id' | 'children'>): Promise<Folder> {
    const newFolder: Folder = {
      ...folder,
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      children: [],
      type: 'folder',
    };

    const response = await apiClient.post<Folder>('/prompts/folders', newFolder);
    
    if (response.success && response.data) {
      return response.data;
    }

    return newFolder;
  },

  /**
   * Create a new prompt
   */
  async createPrompt(prompt: Omit<Prompt, 'id'>): Promise<Prompt> {
    const newPrompt: Prompt = {
      ...prompt,
      id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'prompt',
      date: new Date().toLocaleDateString('pt-BR'),
    };

    const response = await apiClient.post<Prompt>('/prompts/items', newPrompt);
    
    if (response.success && response.data) {
      return response.data;
    }

    return newPrompt;
  },

  /**
   * Update an existing item (folder or prompt)
   */
  async updateItem(id: string, updates: Partial<TreeNode>): Promise<TreeNode | null> {
    const response = await apiClient.patch<TreeNode>(`/prompts/items/${id}`, updates);
    
    if (response.success && response.data) {
      return response.data;
    }

    return null;
  },

  /**
   * Delete an item
   */
  async deleteItem(id: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(`/prompts/items/${id}`);
    return response.success;
  },

  /**
   * Move an item to a new parent
   */
  async moveItem(itemId: string, targetFolderId: string | null): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>('/prompts/move', {
      itemId,
      targetFolderId,
    });
    
    return response.success;
  },

  /**
   * Search prompts
   */
  async searchPrompts(query: string): Promise<PaginatedResponse<Prompt>> {
    const response = await apiClient.get<PaginatedResponse<Prompt>>(
      `/prompts/search?q=${encodeURIComponent(query)}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }

    return { data: [], total: 0, page: 1, limit: 10 };
  },

  /**
   * Export data as JSON
   */
  async exportData(): Promise<Blob> {
    const data = await this.fetchData();
    const json = JSON.stringify(data, null, 2);
    return new Blob([json], { type: 'application/json' });
  },

  /**
   * Import data from JSON
   */
  async importData(file: File): Promise<TreeNode[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};

// --- BACKUP SERVICE ---

export const BackupService = {
  /**
   * Create a backup of all data
   */
  async createBackup(): Promise<string> {
    const data = await DataService.fetchData();
    const backup = {
      version: '1.0.0',
      timestamp: Date.now(),
      data,
    };
    
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    return url;
  },

  /**
   * Restore from a backup file
   */
  async restoreBackup(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      
      if (!backup.data || !Array.isArray(backup.data)) {
        throw new Error('Invalid backup format');
      }
      
      await DataService.saveData(backup.data);
      return true;
    } catch (error) {
      console.error('Restore backup error:', error);
      return false;
    }
  },

  /**
   * Download backup file
   */
  downloadBackup(url: string, filename: string = 'pex-os-backup.json'): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// --- SHARING SERVICE ---

export const SharingService = {
  /**
   * Generate a share link for an item
   */
  async generateShareLink(itemId: string): Promise<string> {
    const response = await apiClient.post<{ link: string }>('/prompts/share', { itemId });
    
    if (response.success && response.data?.link) {
      return response.data.link;
    }

    // Fallback: generate a mock link
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/share/${itemId}`;
  },

  /**
   * Send item to another user via "Bluetooth" simulation
   */
  async sendToUser(itemId: string, targetUserId: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>('/prompts/transfer', {
      itemId,
      targetUserId,
    });
    
    return response.success;
  },
};

// --- SYNC SERVICE ---

export const SyncService = {
  lastSyncTime: 0,

  /**
   * Check if sync is needed
   */
  needsSync(): boolean {
    const now = Date.now();
    const interval = 5 * 60 * 1000; // 5 minutes
    return now - this.lastSyncTime > interval;
  },

  /**
   * Perform sync with server
   */
  async sync(): Promise<boolean> {
    try {
      const localData = LocalStorage.get<TreeNode[]>(STORAGE_KEY, []);
      
      const response = await apiClient.post<{ data: TreeNode[]; timestamp: number }>(
        '/prompts/sync',
        { data: localData, lastSync: this.lastSyncTime }
      );
      
      if (response.success && response.data) {
        LocalStorage.set(STORAGE_KEY, response.data.data);
        this.lastSyncTime = response.data.timestamp;
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Enable auto-sync
   */
  enableAutoSync(callback?: () => void): () => void {
    const interval = setInterval(async () => {
      if (this.needsSync()) {
        await this.sync();
        callback?.();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  },
};

export default DataService;
