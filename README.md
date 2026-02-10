# ⚡ Teste Lightning

Sistema de gerenciamento de tarefas e colaboradores com sincronização offline.

## Início Rápido

### Executar em 3 passos:
```bash
# 1. Backend
cd Backend && dotnet run

# 2. Frontend (novo terminal)
cd Frontend/teste-lightning-app && npm start

# 3. Abrir
http://localhost:4200
```

**API Docs:** http://localhost:5157/swagger

## Recursos Principais

- Angular 21 + Tailwind CSS + RxJS
- .NET 8 + Entity Framework Core + SQL Server
- Sincronização offline com IndexedDB
- Polling automático (30 segundos)
- CRUD para Colaboradores, Tarefas, Histórico
- Responsivo (Mobile/Desktop)

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [docs/QUICK_START.md](docs/QUICK_START.md) | Primeiros passos |
| [docs/SETUP.md](docs/SETUP.md) | Configuração inicial |
| [docs/SCRIPTS_SQL.md](docs/SCRIPTS_SQL.md) | Scripts para criar tabelas |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura técnica |
| [docs/FAQ.md](docs/FAQ.md) | Troubleshooting |

---

**Status:** ✅ Production Ready | **Versão:** 1.0.0

