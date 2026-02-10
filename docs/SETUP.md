# 🔧 Configuração Inicial

## ⚡ Pré-requisitos

```bash
node --version    # v18+
dotnet --version  # v8.0+
```

## 📦 Passo 1: Banco de Dados

Edite `Backend/appsettings.json` com sua connection string do SQL Server:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(local)\\SQLEXPRESS;Database=TesteLightningDB;Trusted_Connection=true;Encrypt=false;"
}
```

**Opções de connection string:**
- `(local)\\SQLEXPRESS` - SQL Server Express
- `(localdb)\\mssqllocaldb` - LocalDB
- `localhost` - SQL Server padrão

### Criar Tabelas

Se preferir criar as tabelas manualmente:

1. Abra SQL Server Management Studio (SSMS) ou sqlcmd
2. Abra arquivo: `Backend/Scripts/create-tables.sql`
3. Clique em "Execute" (ou Ctrl+E)
4. Verifique que as 3 tabelas foram criadas

Consulte [docs/SCRIPTS_SQL.md](SCRIPTS_SQL.md) para mais detalhes.

## 🔧 Passo 2: Backend

```bash
cd Backend
dotnet restore
dotnet run
```

Acesse: http://localhost:5157/swagger

## 📱 Passo 3: Frontend

```bash
cd Frontend/teste-lightning-app
npm install
ng serve
```

Acesse: http://localhost:4200

## ✅ Concluído!

Sistema pronto para usar.
