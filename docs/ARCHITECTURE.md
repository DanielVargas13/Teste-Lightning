# Arquitetura

## Fluxo

```
Frontend (Angular 21)
  ├─ UI + Serviços (HTTP + IndexedDB)
  └─ Sincronização automática (10s)
       ↕ PUSH/PULL
Backend (.NET 8 + SQL Server)
  ├─ Controllers + Services
  └─ Banco de dados
```

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Angular 21, Tailwind, Dexie (IndexedDB), RxJS |
| Backend | .NET 8, EF Core, ASP.NET Core |
| Database | SQL Server |
| Sync | HTTP Polling (10s) |

## Componentes

**Frontend:**
- Páginas: Home, Colaboradores, Tarefas, Histórico
- Serviços: ApiService, IndexedDBService, SincronizacaoService

**Backend:**
- Controllers: ColaboradorController, TarefaController, HistoricoController
- Services: Lógica de negócio
- Data: EF Core DbContext

## Sincronização Offline

1. Dados salvam localmente no IndexedDB (imediato)
2. A cada 10s: PUSH (envia mudanças) + PULL (recebe atualizações)
3. Status em tempo real na navbar
