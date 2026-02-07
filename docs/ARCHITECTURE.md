# 🏗️ Arquitetura do Sistema

## Fluxo Geral

```
Frontend (Angular 21)
    ├─ Componentes UI
    ├─ Serviços (HTTP + IndexedDB)
    └─ Sincronização Automática (30s)
         │
         ├─ PUSH: Envia mudanças ao servidor
         └─ PULL: Recebe dados atualizados
              │
         Backend (.NET 8 + SQL Server)
         http://localhost:5157
              │
         Banco de Dados
```

## Componentes Principais

### Frontend
- **Páginas:** Home, Colaboradores, Tarefas, Histórico
- **Serviços:** ApiService (HTTP), IndexedDBService (cache local), SincronizacaoService (sync)
- **Storage Local:** IndexedDB (Dexie) para trabalhar offline

### Backend
- **Controllers:** ColaboradorController, TarefaController, HistoricoController
- **Services:** Lógica de negócio e validações
- **Data:** Entity Framework Core + SQL Server

## Sincronização Offline

1. Dados salvam localmente no IndexedDB (imediato)
2. A cada 30 segundos, sincronização automática:
   - PUSH: Envia operações pendentes
   - PULL: Recebe dados atualizados
3. Tempo limite para retry: 3 tentativas com backoff exponencial
4. Status em tempo real exibido na navbar

## Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Angular 21, Tailwind CSS, Dexie (IndexedDB), RxJS |
| Backend | .NET 8, Entity Framework Core, ASP.NET Core |
| Database | SQL Server |
| Sync | HTTP Polling a cada 30s |
