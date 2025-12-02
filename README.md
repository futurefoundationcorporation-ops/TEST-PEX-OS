# PEX-OS Prompt Manager

## 🎯 Visão Geral

O **Prompt Manager** é um módulo central do PEX-OS responsável pelo gerenciamento completo de prompts e pastas organizacionais. Desenvolvido seguindo a arquitetura ATHENA (ENTJ), mantendo o design visual escuro premium do arquivo original com todas as animações, tooltips e transições preservadas.

---

## ✅ Funcionalidades Implementadas

### Core Features
- ✅ **Navegação Sequencial** - Cards de navegação em pilha com breadcrumbs
- ✅ **Miller Columns** - Visualização em 3 colunas (Pastas → Subpastas → Prompts)
- ✅ **Hierarquia (Mindmap)** - Árvore expansível de todo o conteúdo
- ✅ **Vista Compartilhados** - Arquivos recebidos da equipe
- ✅ **Drag & Drop** - Reorganização de pastas e prompts com validação circular
- ✅ **Smart Drop** - Modal de seleção de destino ao soltar em área vazia

### UI Components
- ✅ **Header** - Logo, busca (Ctrl+F), seletor de visualização, notificações
- ✅ **ActionsToolbar** - Nova Pasta, Novo Prompt, Exportar, Importar, Compartilhar
- ✅ **FloatingActionButton** - Acesso rápido a ações de criação
- ✅ **Toast Notifications** - Feedback visual para todas as ações
- ✅ **Tooltips** - Em todos os botões com atalhos de teclado

### Modals
- ✅ **ModalEdit** - Edição completa de pastas/prompts com emoji picker
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
│       └── prompts.ts             # API Adapters
│
├── components/
│   └── prompt-manager/
│       ├── index.ts               # Barrel exports
│       ├── PromptManager.tsx      # Componente principal
│       ├── Header.tsx             # Header com todas as ações
│       ├── ActionsToolbar.tsx     # Barra de ações
│       ├── SequentialView.tsx     # Vista sequencial
│       ├── MillerColumns.tsx      # Vista Miller Columns
│       ├── FolderTree.tsx         # Vista hierárquica
│       ├── SharedView.tsx         # Vista compartilhados
│       ├── Toast.tsx              # Notificações toast
│       ├── TooltipWrapper.tsx     # Componente de tooltip
│       ├── MotionWrappers.tsx     # Animações
│       ├── EmojiPicker.tsx        # Seletor de emojis
│       └── modals/
│           ├── ModalEdit.tsx      # Modal de edição
│           ├── PromptViewer.tsx   # Visualizador de prompts
│           ├── SettingsModal.tsx  # Configurações
│           ├── NotificationsModal.tsx
│           ├── MasterKeyModal.tsx
│           └── MoveSelectorModal.tsx
│
├── app/
│   └── (pex-os)/
│       ├── layout.tsx             # Layout do PEX-OS com sidebar
│       └── prompts/
│           └── page.tsx           # Página do Prompt Manager
│
└── source/
    └── app-arrumada.jsx           # Arquivo original de referência
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
| `Esc` | Fechar modal ativo |

---

## 🎨 Design System

### Cores Principais
- **Background Principal**: `#0f111a`
- **Background Secundário**: `#1e2330`
- **Background Cards**: `#13161c`
- **Accent Primary**: `#2979ff`
- **Accent Secondary**: `#5b4eff`
- **Success**: `#10b981`
- **Error**: `#ef4444`
- **Warning**: `#f59e0b`

### Animações
- `animate-slide-up-fade` - Entrada de cards
- `animate-modal-bounce` - Abertura de modais
- `animate-success-pulse` - Feedback de sucesso
- `animate-shimmer` - Loading states
- `animate-slide-left/right` - Navegação

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
- [ ] Modo escuro/claro

### Baixa Prioridade
- [ ] Integração com LLMs para geração
- [ ] Templates de prompt
- [ ] Colaboração em tempo real
- [ ] PWA support

---

## 📝 Notas de Desenvolvimento

### Preservação do Design Original
- Todas as cores, gradientes e sombras foram mantidas
- Animações CSS preservadas e modularizadas
- Tooltips e transições originais mantidos
- Estrutura visual de cards idêntica

### Melhorias Aplicadas
- Contraste aumentado em botões de ação
- Espaçamentos padronizados
- Tooltips com atalhos de teclado
- Acessibilidade melhorada (ARIA labels)

### Arquitetura
- Componentes totalmente desacoplados
- Store centralizado com actions typed
- API layer preparada para backend
- Types compartilhados entre módulos

---

## 📄 Licença

Proprietary - PEX-OS Team

---

**Desenvolvido com a Arquitetura ATHENA (ENTJ)**  
*Máxima eficiência, organização e performance.*
