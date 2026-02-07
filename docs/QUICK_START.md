# ⚡ Quick Start - Teste Lightning

## 🚀 Em 2 Minutos

### 1. Verificar Pré-requisitos
```bash
node --version    # v18+
dotnet --version  # v8.0+
```

### 2. Iniciar Backend
```bash
cd Backend
dotnet run
```
Backend rodará em: **http://localhost:5157**

### 3. Iniciar Frontend (outro terminal)
```bash
cd Frontend/teste-lightning-app
npm start
```
App rodará em: **http://localhost:4200**

### 4. Acessar
- **App:** http://localhost:4200
- **API Docs:** http://localhost:5157/swagger

**Pronto! Crie um colaborador em Colaboradores > Novo Colaborador.**

---

## ✅ Verificar Tudo Está Funcionando

### ✓ Frontend Carrega?
- Página com navbar mostrando "Home", "Colaboradores", "Tarefas", "Histórico"
- Status de sincronização no canto inferior direito da navbar

### ✓ Backend Respondendo?
- Swagger UI responde em http://localhost:5000/swagger/index.html
- Controllers: ColaboradorController, TarefaController, HistoricoController

### ✓ Sincronização Funciona?
1. Acesse http://localhost:4200/colaboradores
2. Clique em "Novo Colaborador"
3. Preencha: Nome, Sobrenome, Celular, Endereço
4. Clique em "Criar"
   - ✅ Deve aparecer na lista instantaneamente (IndexedDB)
   - ✅ Status deve mudar para "Sincronizando" por alguns segundos
   - ✅ Após ~30s, deve mostrar "Sincronizado"

---

## 🧪 Teste Modo Offline

1. Abra DevTools (F12)
2. Network tab → Dropdown no canto superior esquerdo → Work offline
3. Crie um novo colaborador
4. Você verá:
   - ✅ Dados salvos em IndexedDB (aparecem na lista)
   - ✅ Status mostra "Pendentes"
   - ✅ Quando volta online, sincroniza automaticamente

---

## 📱 Testar Responsividade

1. Abra DevTools (F12)
2. Aperte Ctrl+Shift+M (ou Cmd+Shift+M no Mac) para modo mobile
3. Veja:
   - ✅ Menu collapsa em mobile
   - ✅ Tabelas ficam responsivas
   - ✅ Formulários adaptam ao tamanho da tela

---

## 🔌 Testar Endpoints via Swagger

1. Acesse http://localhost:5000/swagger/index.html
2. Clique em "Colaborador" para expandir
3. Teste GET /api/colaborador
   - ✅ Deve retornar lista de colaboradores criados

---

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Backend não inicia | ✓ Verifique se .NET 8 está instalado: `dotnet --version` |
| Frontend não carrega | ✓ Verifique se Node.js está instalado: `node --version` |
| Localhost:4200 recusou conexão | ✓ Frontend ainda está iniciando, espere 30 segundos |
| Localhost:5000 recusou conexão | ✓ Backend ainda está iniciando, espere 30 segundos |
| Dados não sincronizam | ✓ Clique em "Sincronizar Agora" no status component |
| CORS error no console | ✓ Certifique-se que Backend está rodando |

---

## 📖 Próximos Passos

1. **Leia a documentação completa:**
   - [README.md](README.md) - Visão geral
   - [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Guia detalhado
   - [docs/SETUP.md](docs/SETUP.md) - Configuração avançada

2. **Explore o código:**
   - Frontend: `Frontend/teste-lightning-app/src/app/`
   - Backend: `Backend/Services/` e `Backend/Controllers/`
   - Sincronização: `src/app/services/sincronizacao.service.ts`

3. **Teste funcionalidades:**
   - CRUD em Colaboradores
   - CRUD em Tarefas
   - Executar Tarefa (registra no Histórico)
   - Filtros no Histórico

---

## 🎯 Funcionalidades Principais

### Colaboradores
- ✅ Listar todos
- ✅ Criar novo (não esquecer: nome, sobrenome, celular, endereço)
- ✅ Editar existente
- ✅ Deletar

### Tarefas
- ✅ Listar todas
- ✅ Criar nova (descrição, colaborador, periodicidade)
- ✅ Editar
- ✅ **Executar** (registra no histórico)
- ✅ Deletar

### Histórico
- ✅ Visualizar todas as execuções
- ✅ Filtrar por Tarefa
- ✅ Filtrar por Colaborador
- ✅ Filtrar por Data (intervalo)
- ✅ Combinar múltiplos filtros

---

## 🔄 Como Funciona a Sincronização

```
Você cria um item
    ↓ (instantâneo)
Salva em IndexedDB (banco local)
    ↓
Aparece na lista imediatamente
    ↓
Enfileira para sincronizar
    ↓ (a cada 30 segundos)
Envia para o servidor
    ↓
Frontend recebe confirmação
    ↓
Status muda para "Sincronizado"
```

**Benefício:** Funciona offline! Criar um item, deletar, editar - tudo funciona sem internet.

---

## 💾 Armazenamento de Dados

### Local (IndexedDB)
- Colaboradores
- Tarefas
- Históricos
- Fila de operações

### Servidor (SQL Server)
- Mesmo schema
- Sincronizado via API REST

---

## 📊 Status em Tempo Real

Na navbar, você vê:
- 🟢 **Sincronizado** - Tudo atualizado
- 🟡 **Sincronizando** - Em progresso
- 🔴 **Pendentes** - Aguardando envio
- **Botão "Sincronizar Agora"** - Força sincronização imediata

---

## 🎓 Stack Técnico (Resumido)

- **Frontend:** Angular 21, Tailwind CSS, Dexie (IndexedDB)
- **Backend:** .NET 8, Entity Framework, SQL Server
- **Sincronização:** Polling HTTP a cada 30s com retry automático
- **Offline:** IndexedDB local com fila de operações

---

## 💡 Tips & Tricks

1. **Modo Offline:** Desconecta a internet, cria dados, vai sincronizar automaticamente
2. **Devtools:** F12 → Application → IndexedDB para ver dados locais
3. **Network:** F12 → Network para ver requisições HTTP
4. **Console:** F12 → Console para ver logs de sincronização
5. **Swagger:** http://localhost:5000/swagger para testar API manualmente

---

**Tudo funcionando?** Parabéns! 🎉

Continue em [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) para testes mais avançados.
