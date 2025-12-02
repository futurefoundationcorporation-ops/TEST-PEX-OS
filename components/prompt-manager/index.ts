// ============================================================================
// PEX-OS PROMPT MANAGER - BARREL EXPORTS
// ATHENA Architecture | Clean Module Exports
// ============================================================================

// Main Component
export { PromptManager, default } from './PromptManager';

// Core Components
export { Header } from './Header';
export { ActionsToolbar, FloatingActionButton } from './ActionsToolbar';
export { SequentialView } from './SequentialView';
export { MillerColumns } from './MillerColumns';
export { FolderTree } from './FolderTree';
export { SharedView } from './SharedView';
export { Toast } from './Toast';

// New Components - ATHENA
export { SidePanel } from './SidePanel';
export { ContentPanel, InlinePreview } from './ContentPanel';
export { TagBar, TagFilterDropdown } from './TagBar';
export { ContextMenu, useContextMenu } from './ContextMenu';

// Views
export { HierarchyView } from './views/HierarchyView';

// UI Components
export { Tooltip, ShortcutTooltip } from './TooltipWrapper';
export { EmojiPicker, EmojiButton, EMOJI_CATEGORIES } from './EmojiPicker';
export {
  AnimatedTreeItem,
  Fade,
  SlideUpFade,
  ScaleIn,
  StaggerContainer,
  PulseSuccess,
  Shimmer,
  SlideView,
  ModalAnimation,
  Overlay,
  createDragGhost,
  motionStyles,
} from './MotionWrappers';

// Modals
export { ModalEdit } from './modals/ModalEdit';
export { PromptViewer } from './modals/PromptViewer';
export { SettingsModal } from './modals/SettingsModal';
export { NotificationsModal } from './modals/NotificationsModal';
export { MasterKeyModal } from './modals/MasterKeyModal';
export { MoveSelectorModal } from './modals/MoveSelectorModal';
export { CreateModal, useCreateModal } from './modals/CreateModal';
export { DeleteModal, useDeleteModal } from './modals/DeleteModal';
