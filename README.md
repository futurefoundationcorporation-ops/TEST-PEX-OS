# PEX-OS Prompt Manager

## 🎯 Visão Geral

O **Prompt Manager** é um módulo central do PEX-OS responsável pelo gerenciamento completo de prompts e pastas organizacionais. Desenvolvido seguindo a arquitetura ATHENA (ENTJ), mantendo o design visual escuro premium do arquivo original com todas as animações, tooltips e transições preservadas.

---

## ✅ Funcionalidades Implementadas

### Core Features
- ✅ **Navegação Sequencial** - Cards de navegação em pilha com breadcrumbs
- ✅ **Miller Columns** - Visualização em 4 colunas (Pastas → Subpastas → Prompts → Preview)
- ✅ **Hierarquia (Mindmap)** - Árvore expansível de todo o conteúdo com busca
- ✅ **Vista Compartilhados** - Arquivos recebidos da equipe
- ✅ **Drag & Drop** - Reorganização de pastas e prompts com validação circular
- ✅ **Smart Drop** - Modal de seleção de destino ao soltar em área vazia
- ✅ **Context Menu** - Menu de clique direito com todas as ações

### UI Components
- ✅ **Header** - Logo, busca (Ctrl+F), seletor de visualização, notificações
- ✅ **ActionsToolbar** - Nova Pasta, Novo Prompt, Exportar, Importar, Compartilhar
- ✅ **FloatingActionButton** - Acesso rápido a ações de criação
- ✅ **Toast Notifications** - Feedback visual para todas as ações
- ✅ **Tooltips** - Em todos os botões com atalhos de teclado
- ✅ **TagBar** - Filtro de tags horizontal/vertical
- ✅ **SidePanel** - Navegação lateral com árvore de pastas
- ✅ **ContentPanel** - Preview de prompts com ações rápidas

### Modals
- ✅ **ModalEdit** - Edição completa de pastas/prompts com emoji picker
- ✅ **CreateModal** - Criação de novas pastas/prompts
- ✅ **DeleteModal** - Confirmação de exclusão com preview
- ✅ **PromptViewer** - Leitura focada com modo de foco expansível
- ✅ **SettingsModal** - Configurações de perfil e preferências
- ✅ **NotificationsModal** - Central de notificações
- ✅ **MasterKeyModal** - Geração e gerenciamento de chaves de acesso
- ✅ **MoveSelectorModal** - Seleção de destino para movimento

### State Management
- ✅ **Zustand Store** - Estado centralizado com persistência
- ✅ **API Adapters** - Camada de abstração para backend
- ✅ **LocalStorage Fallback** - Funcionamento offline

---

## 📁 Estrutura de Arquivos

```
/
├── types/
│   └── prompt-manager.ts          # Definições TypeScript
│
├── stores/
│   └── promptManager.ts           # Zustand Store completo
│
├── lib/
│   └── api/
│       └── prompts.ts             # API Adapters + Backup/Sync Services
│
├── styles/
│   └── animations.css             # Animações CSS separadas
│
├── components/
│   └── prompt-manager/
│       ├── index.ts               # Barrel exports
│       ├── PromptManager.tsx      # Componente principal
│       ├── Header.tsx             # Header com todas as ações
│       ├── ActionsToolbar.tsx     # Barra de ações
│       ├── SequentialView.tsx     # Vista sequencial
│       ├── MillerColumns.tsx      # Vista Miller Columns (4 colunas)
│       ├── FolderTree.tsx         # Vista hierárquica legacy
│       ├── SharedView.tsx         # Vista compartilhados
│       ├── SidePanel.tsx          # Navegação lateral
│       ├── ContentPanel.tsx       # Preview de prompts
│       ├── TagBar.tsx             # Filtro de tags
│       ├── ContextMenu.tsx        # Menu de contexto (clique direito)
│       ├── Toast.tsx              # Notificações toast
│       ├── TooltipWrapper.tsx     # Componente de tooltip
│       ├── MotionWrappers.tsx     # Animações React
│       ├── EmojiPicker.tsx        # Seletor de emojis
│       ├── views/
│       │   └── HierarchyView.tsx  # Vista hierárquica modular
│       └── modals/
│           ├── ModalEdit.tsx      # Modal de edição
│           ├── CreateModal.tsx    # Modal de criação
│           ├── DeleteModal.tsx    # Modal de exclusão
│           ├── PromptViewer.tsx   # Visualizador de prompts
│           ├── SettingsModal.tsx  # Configurações
│           ├── NotificationsModal.tsx
│           ├── MasterKeyModal.tsx
│           └── MoveSelectorModal.tsx
│
├── app/
│   └── (pex-os)/
│       ├── layout.tsx             # Layout do PEX-OS
│       └── prompts/
│           └── page.tsx           # Página do Prompt Manager
│
└── app-arrumada.jsx               # Arquivo original de referência
```

---

## 🛣️ Rotas (URIs)

| Rota | Descrição |
|------|-----------|
| `/prompts` | Prompt Manager principal |
| `/prompts?view=sequential` | Vista sequencial |
| `/prompts?view=miller` | Vista Miller Columns |
| `/prompts?view=mindmap` | Vista hierárquica |
| `/prompts?view=shared` | Arquivos compartilhados |

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl+F` | Foco na busca rápida |
| `Ctrl+L` | Toggle bloqueio/desbloqueio |
| `Ctrl+1` | Vista Sequencial |
| `Ctrl+2` | Vista Miller Columns |
| `Ctrl+3` | Vista Hierárquica |
| `Ctrl+N` | Nova Pasta |
| `Ctrl+P` | Novo Prompt |
| `Esc` | Fechar modal ativo |

---

## 🎨 Design System (ATHENA Theme)

### Cores Principais
- **Background Principal**: `#0f111a`
- **Background Secundário**: `#1e2330`
- **Background Terciário**: `#13161c`
- **Background Cards**: `#181b24`
- **Accent Primary**: `#2979ff`
- **Accent Primary Hover**: `#2264d1`
- **Accent Secondary**: `#5b4eff`
- **Success**: `#10b981`
- **Error**: `#ef4444`
- **Warning**: `#f59e0b`
- **Border**: `rgba(255, 255, 255, 0.1)`

### Animações (animations.css)
- `animate-slide-up-fade` - Entrada de cards
- `animate-modal-bounce` - Abertura de modais
- `animate-success-pulse` - Feedback de sucesso
- `animate-shimmer` - Loading states
- `animate-slide-left/right` - Navegação sequencial
- `animate-context-menu` - Menu de contexto
- `animate-toast-in/out` - Notificações toast
- `animate-pop-in-menu` - Dropdowns

---

## 🔧 Tecnologias

- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **Zustand** - State management
- **Next.js 14** - Framework full-stack
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **LocalStorage** - Persistência offline

---

## 📦 Instalação de Dependências

```bash
npm install zustand lucide-react
```

---

## 🎯 Conformidade ATHENA

### 7 Regras ENTJ Principais
1. ✅ **UI Preservada** - Cores #0f111a, #1e2330, #2979ff mantidas
2. ✅ **Animações Originais** - slideUpFade, modalBounceIn, successPulse
3. ✅ **Tooltips Completos** - Em todos os botões interativos
4. ✅ **Botões Sempre Visíveis** - Removido opacity-0 group-hover
5. ✅ **Modularização Profissional** - Componentes < 400 linhas
6. ✅ **TypeScript Strict** - Tipos em todos os componentes
7. ✅ **Zustand Store Completo** - Actions para todas operações

### Componentes por Categoria
| Categoria | Arquivos |
|-----------|----------|
| Core | PromptManager, Header, ActionsToolbar |
| Views | SequentialView, MillerColumns, HierarchyView, SharedView |
| Panels | SidePanel, ContentPanel |
| UI | TagBar, ContextMenu, Toast, Tooltip, EmojiPicker |
| Modals | CreateModal, DeleteModal, ModalEdit, PromptViewer, Settings |
| Utils | MotionWrappers, animations.css |
| State | promptManager.ts (Zustand) |
| Types | prompt-manager.ts |
| API | prompts.ts (DataService, BackupService, SyncService) |

---

## 🚀 Próximos Passos

### Alta Prioridade
- [ ] Integração com API REST real
- [ ] Sistema de autenticação completo
- [ ] Busca com filtros avançados
- [ ] Exportação em múltiplos formatos

### Média Prioridade
- [ ] Histórico de versões de prompts
- [ ] Sistema de tags com autocomplete
- [ ] Favoritos e prompts fixados
- [ ] Tema claro opcional

### Baixa Prioridade
- [ ] Integração com LLMs para geração
- [ ] Templates de prompt
- [ ] Colaboração em tempo real
- [ ] PWA support

---

## 📝 Resumo das Correções da Auditoria

### Arquivos Criados
1. `/styles/animations.css` - CSS separado para animações
2. `/components/prompt-manager/ContentPanel.tsx` - Preview de prompts
3. `/components/prompt-manager/SidePanel.tsx` - Navegação lateral
4. `/components/prompt-manager/TagBar.tsx` - Filtro de tags
5. `/components/prompt-manager/ContextMenu.tsx` - Menu clique direito
6. `/components/prompt-manager/modals/CreateModal.tsx` - Criação de itens
7. `/components/prompt-manager/modals/DeleteModal.tsx` - Exclusão com confirmação
8. `/components/prompt-manager/views/HierarchyView.tsx` - Vista hierárquica modular

### Arquivos Atualizados
1. `MillerColumns.tsx` - Adicionada 4ª coluna de preview
2. `PromptManager.tsx` - Integração de novos componentes
3. `FolderTree.tsx` - Removido opacity-0 dos botões
4. `promptManager.ts` - Actions de delete com clearSelection
5. `index.ts` - Exports de novos componentes

### Correções de Estilo
- Garantido uso de #2979ff como cor primária
- Garantido uso de #1e2330 como cor de painel
- Removido opacity-0 group-hover de botões de ação
- Botões agora sempre visíveis com menor opacidade inicial

---

## 📄 Licença

Proprietary - PEX-OS Team

---

**Desenvolvido com a Arquitetura ATHENA (ENTJ)**  
*Máxima eficiência, organização e performance.*
