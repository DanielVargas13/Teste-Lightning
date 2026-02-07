# ⚡ Teste Lightning - Sistema de Gerenciamento de Tarefas

Sistema completo de gerenciamento de tarefas e colaboradores com sincronização offline e polling automático.

## 🚀 Início Rápido

### Executar

**Windows:**
```bash
cd Backend && dotnet run
# Em outro terminal:
cd Frontend/teste-lightning-app && npm start
```

**Linux/macOS:**
```bash
cd Backend && dotnet run
# Em outro terminal:
cd Frontend/teste-lightning-app && ng serve
```

### Acessar
- **Frontend:** http://localhost:4200
- **API Swagger:** http://localhost:5157/swagger

## 🎯 Recursos

- ✅ Angular 21 + Tailwind CSS
- ✅ .NET 8 + Entity Framework Core + SQL Server
- ✅ Sincronização offline com IndexedDB
- ✅ Polling automático a cada 30 segundos
- ✅ CRUD completo (Colaboradores, Tarefas, Histórico)
- ✅ Responsivo (Mobile/Desktop)

## 📁 Estrutura

```
Backend/              # API .NET 8
├── Controllers/      # Endpoints
├── Services/         # Lógica de negócio
├── Models/          # Entidades
└── Data/            # DbContext

Frontend/             # Angular 21
├── src/app/
│   ├── pages/       # Páginas principais
│   ├── services/    # HTTP + Sincronização
│   ├── components/  # Componentes reutilizáveis
│   └── models/      # Interfaces
```

## 🔧 Configuração (Primeira Vez)

1. **SQL Server Connection String** - Editar `Backend/appsettings.json`
2. **Criar banco de dados** - Executar migrations
3. **Instalar dependências** - `npm install` (Frontend) e restaurar packages (Backend)

Consulte [docs/SETUP.md](docs/SETUP.md) para detalhes.

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [docs/QUICK_START.md](docs/QUICK_START.md) | Como iniciar em 2 minutos |
| [docs/SETUP.md](docs/SETUP.md) | Configuração inicial |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura e fluxo de sincronização |
| [docs/FAQ.md](docs/FAQ.md) | Perguntas frequentes |

---

**Status:** ✅ Production Ready | **Versão:** 1.0.0

